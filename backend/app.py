import os
import sys
import uuid
import base64
from io import BytesIO

# Add root project dir to path to import model and utils
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import sqlite3
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

def init_db():
    conn = sqlite3.connect('neuroadvisor.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT,
                  designation TEXT, contact TEXT, hospital TEXT,
                  hospital_address TEXT, hospital_contact TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS history
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, patient_name TEXT, 
                  prediction TEXT, confidence REAL, timestamp TEXT)''')
    
    # Try adding columns gracefully if table already existed from older version
    try:
        c.execute("ALTER TABLE users ADD COLUMN designation TEXT")
        c.execute("ALTER TABLE users ADD COLUMN contact TEXT")
        c.execute("ALTER TABLE users ADD COLUMN hospital TEXT")
    except:
        pass # Columns probably already exist
        
    try:
        c.execute("ALTER TABLE users ADD COLUMN hospital_address TEXT")
        c.execute("ALTER TABLE users ADD COLUMN hospital_contact TEXT")
    except:
        pass

    # Extended patient details for history
    columns_to_add = [
        "patient_age TEXT", "patient_contact TEXT", "previous_reports TEXT", 
        "remarks TEXT", "medicine_history TEXT", "profile_picture TEXT", 
        "blood_group TEXT", "patient_address TEXT", "is_seen INTEGER DEFAULT 1",
        "next_visit_date TEXT"
    ]
    for col in columns_to_add:
        try:
            c.execute(f"ALTER TABLE history ADD COLUMN {col}")
        except:
            pass

    conn.commit()
    conn.close()

init_db()
import torch
from torchvision import transforms
from PIL import Image
import numpy as np

from model.model import NeuroAdvisorModel
from utils.gradcam import GradCAM, apply_colormap_on_image
from utils.data_loader import load_mat_file, load_image_file

app = Flask(__name__)
CORS(app)

# Settings
UPLOAD_FOLDER = 'statics/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = NeuroAdvisorModel(num_classes=3).to(device)
model.eval()

# Dummy weights initialization for the prototype (In a real scenario, use actual trained weights)
# model.load_state_dict(torch.load('weights.pth'))

# Initialize GradCAM
grad_cam = GradCAM(model)

CLASSES = ["Meningioma", "Glioma", "Pituitary"]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def piltob64(pil_image):
    buffered = BytesIO()
    pil_image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/jpeg;base64,{img_str}"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    filename = file.filename
    file_bytes = file.read()
    
    # Check explicitly for .mat files
    if filename.endswith('.mat'):
        image, label, mask = load_mat_file(file_bytes)
        if image is None:
            return jsonify({"error": "Failed to parse .mat file"}), 500
    else:
        # Standard images (jpg, png)
        try:
            image, label, mask = load_image_file(file_bytes)
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    # `image` is a numpy array RGB [H, W, 3]
    # Save processed image to disk or just keep in memory for predict step
    unique_id = str(uuid.uuid4())
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{unique_id}.npz")
    np.savez_compressed(img_path, image=image, mask=mask if mask is not None else np.zeros((1, 1)))

    # Return preview to frontend
    pil_img = Image.fromarray(image.astype(np.uint8))
    buffered = BytesIO()
    pil_img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return jsonify({
        "message": "File processed successfully",
        "file_id": unique_id,
        "preview": f"data:image/jpeg;base64,{img_str}"
    }), 200


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    file_id = data.get('file_id')
    if not file_id:
        return jsonify({"error": "file_id is required"}), 400
        
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.npz")
    if not os.path.exists(img_path):
        return jsonify({"error": "File not found"}), 404
        
    np_data = np.load(img_path)
    image_np = np_data['image']
    
    # Preprocess
    pil_img = Image.fromarray(image_np)
    input_tensor = transform(pil_img).unsqueeze(0).to(device)
    
    # Forward pass
    with torch.no_grad():
        output, _ = model(input_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0).cpu().numpy()
        
    predicted_class_idx = np.argmax(probabilities)
    predicted_class = CLASSES[predicted_class_idx]
    
    # Run Grad-CAM
    input_tensor.requires_grad = True # For hooks
    cam_heatmap, logits = grad_cam.generate_heatmap(input_tensor, predicted_class_idx)
    
    # Resize cam_heatmap to original image size
    import cv2
    cam_heatmap_resized = cv2.resize(cam_heatmap, (image_np.shape[1], image_np.shape[0]))
    
    org_im_norm = image_np.astype(np.float32) / 255.0
    overlay_cam, heatmap_img = apply_colormap_on_image(org_im_norm, cam_heatmap_resized)
    
    # Convert back to base64 images
    overlay_pil = Image.fromarray(overlay_cam)
    heatmap_pil = Image.fromarray(heatmap_img)
    
    return jsonify({
        "prediction": predicted_class,
        "confidence_scores": {
            CLASSES[0]: float(probabilities[0]),
            CLASSES[1]: float(probabilities[1]),
            CLASSES[2]: float(probabilities[2])
        },
        "overlay_image": piltob64(overlay_pil),
        "heatmap_image": piltob64(heatmap_pil)
    }), 200

@app.route('/upload_asset', methods=['POST'])
def upload_asset():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    from werkzeug.utils import secure_filename
    filename = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_name))
    return jsonify({"file_path": unique_name}), 200

@app.route('/add_patient', methods=['POST'])
def add_patient():
    data = request.json
    user_id = data.get('user_id')
    patient_name = data.get('patient_name')
    if not all([user_id, patient_name]):
        return jsonify({"error": "Missing required fields"}), 400
        
    patient_age = data.get('patient_age', '')
    patient_contact = data.get('patient_contact', '')
    blood_group = data.get('blood_group', '')
    patient_address = data.get('patient_address', '')
    next_visit_date = data.get('next_visit_date', '')
    remarks = data.get('remarks', '')
    medicine_history = data.get('medicine_history', '')
    
    conn = sqlite3.connect('neuroadvisor.db')
    c = conn.cursor()
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    c.execute("""
        INSERT INTO history (
            user_id, patient_name, timestamp, is_seen,
            patient_age, patient_contact, blood_group, patient_address,
            next_visit_date, remarks, medicine_history
        ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id, patient_name, timestamp,
        patient_age, patient_contact, blood_group, patient_address,
        next_visit_date, remarks, medicine_history
    ))
    conn.commit()
    history_id = c.lastrowid
    conn.close()
    
    return jsonify({"success": True, "history_id": history_id}), 200

@app.route('/save_history', methods=['POST'])
def save_history():
    data = request.json
    history_id = data.get('history_id') # If updating an existing patient queue
    user_id = data.get('user_id')
    patient_name = data.get('patient_name')
    prediction = data.get('prediction')
    confidence = data.get('confidence')
    
    # Extended Patient Details
    patient_age = data.get('patient_age', '')
    patient_contact = data.get('patient_contact', '')
    previous_reports = data.get('previous_reports', '')
    remarks = data.get('remarks', '')
    medicine_history = data.get('medicine_history', '')
    profile_picture = data.get('profile_picture', '')
    blood_group = data.get('blood_group', '')
    patient_address = data.get('patient_address', '')
    next_visit_date = data.get('next_visit_date', '')
    
    if not all([user_id, patient_name, prediction]):
        return jsonify({"error": "Missing required fields"}), 400
        
    conn = sqlite3.connect('neuroadvisor.db')
    c = conn.cursor()
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    if history_id:
        c.execute("""
            UPDATE history SET 
                prediction=?, confidence=?, is_seen=1, previous_reports=?, profile_picture=?,
                remarks=?, medicine_history=?, next_visit_date=?
            WHERE id=? AND user_id=?
        """, (
            prediction, confidence, previous_reports, profile_picture,
            remarks, medicine_history, next_visit_date, history_id, user_id
        ))
    else:
        c.execute("""
            INSERT INTO history (
                user_id, patient_name, prediction, confidence, timestamp, is_seen,
                patient_age, patient_contact, previous_reports, remarks,
                medicine_history, profile_picture, blood_group, patient_address, next_visit_date
            ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, patient_name, prediction, confidence, timestamp,
            patient_age, patient_contact, previous_reports, remarks,
            medicine_history, profile_picture, blood_group, patient_address, next_visit_date
        ))
    
    conn.commit()
    final_id = history_id if history_id else c.lastrowid
    conn.close()
    
    return jsonify({"success": True, "history_id": final_id}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    designation = data.get('designation', '')
    # 'contact' is ignored / deprecated
    hospital = data.get('hospital', '')
    hospital_address = data.get('hospital_address', '')
    hospital_contact = data.get('hospital_contact', '')
    
    conn = sqlite3.connect('neuroadvisor.db')
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (name, email, password, designation, hospital, hospital_address, hospital_contact) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                  (name, email, password, designation, hospital, hospital_address, hospital_contact))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return jsonify({
            "success": True, 
            "user_id": user_id, 
            "name": name, 
            "email": email, 
            "designation": designation, 
            "hospital": hospital,
            "hospital_address": hospital_address,
            "hospital_contact": hospital_contact
        }), 200
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Email already exists"}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = sqlite3.connect('neuroadvisor.db')
    c = conn.cursor()
    c.execute("SELECT id, name, email, designation, hospital, hospital_address, hospital_contact FROM users WHERE email=? AND password=?", (email, password))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify({"success": True, "user": {
            "id": user[0], "name": user[1], "email": user[2],
            "designation": user[3], "hospital": user[4],
            "hospital_address": user[5], "hospital_contact": user[6]
        }}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    conn = sqlite3.connect('neuroadvisor.db')
    c = conn.cursor()
    c.execute("""
        SELECT id, patient_name, prediction, confidence, timestamp, is_seen, next_visit_date 
        FROM history WHERE user_id=? ORDER BY id DESC
    """, (user_id,))
    rows = c.fetchall()
    conn.close()
    
    history_list = []
    for r in rows:
        history_list.append({
            "id": r[0],
            "patient_name": r[1],
            "prediction": r[2],
            "confidence": r[3],
            "timestamp": r[4],
            "is_seen": bool(r[5]),
            "next_visit_date": r[6]
        })
        
    return jsonify({"history": history_list}), 200



@app.route('/explain', methods=['POST'])
def explain():
    data = request.json
    predicted_class = data.get('prediction')
    confidence = data.get('confidence', 0.0)
    
    # Simple template generation based on results
    conf_pct = round(confidence * 100)
    explanation = (f"The model predicts '{predicted_class}' with {conf_pct}% confidence. "
                   "The highlighted regions on the Grad-CAM visualization indicate areas within the MRI scan "
                   "that most strongly influenced this prediction, primarily corresponding to key tissue abnormalities.\n\n"
                   "*DISCLAIMER: This explanation is based solely on the model's feature focus and should not substitute human medical judgment.*")
                   
    return jsonify({
        "explanation": explanation
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
