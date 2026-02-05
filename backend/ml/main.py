from fastapi import FastAPI, UploadFile, File, HTTPException
import torch
import torch.nn.functional as F
from model import get_model, preprocess_image
from gradcam import GradCAM, overlay_heatmap, generate_heatmap_only
import uvicorn
import numpy as np
import cv2
from PIL import Image
import io

app = FastAPI()

# Global model and Grad-CAM instances
model = get_model()
print(f"DEBUG: Model architecture - {type(model.base)}")
print(f"DEBUG: FC layer - {model.base.fc}")
# Target the last convolutional layer of ResNet-50 (layer4)
target_layer = model.base.layer4[-1]
cam_generator = GradCAM(model, target_layer)

def validate_image_heuristic(image_bytes):
    """
    Validates if the image looks like a Brain MRI using heuristics:
    1. Histogram analysis (MRI is mostly black background)
    2. Grayscale check
    """
    try:
        # Convert to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return False, "Invalid image format"
            
        # Check aspect ratio (MRIs are usually somewhat square)
        h, w = img.shape[:2]
        ratio = w / h
        if ratio < 0.5 or ratio > 2.0:
            return False, "Invalid aspect ratio for MRI"

        # Check color channels - MRIs are typically grayscale
        # If variance between channels is high, it's likely a natural color photo
        b, g, r = cv2.split(img)
        diff = np.mean(np.abs(b - g)) + np.mean(np.abs(g - r))
        
        # Threshold: Natural images have > 10-20 diff usually. MRIs (grayscale) have near 0.
        # Allow some tint margin.
        if diff > 30: 
            return False, "Image appears to be a color photograph, not an MRI"

        # Check Histogram - MRI should have significant dark pixels (background)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        dark_pixels = np.sum(gray < 30)
        total_pixels = gray.size
        if (dark_pixels / total_pixels) < 0.20:
             # Most brain MRIs have > 40% black background. Being lenient at 20%.
            return False, "Image lacks characteristic MRI background (too bright)"

        return True, "Valid"
    except Exception as e:
        return False, f"Validation error: {str(e)}"

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    # 1. Validate Image
    is_valid, reason = validate_image_heuristic(image_bytes)
    if not is_valid:
        # We assume the frontend handles 400 errors gracefully or we return a structured error
        return {
            "error": f"Invalid MRI Scan: {reason}",
            "verified": False,
            "prediction": "Invalid Input",
            "confidence": 0
        }

    # 2. Preprocess
    input_tensor = preprocess_image(image_bytes)
    
    # DEBUG: Log image uniqueness for verification
    import hashlib
    img_hash = hashlib.md5(image_bytes).hexdigest()
    print(f"INFO: Processing scan {file.filename}, Hash: {img_hash}")
    
    # 3. Inference
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = F.softmax(output, dim=1)
        prob, class_idx = torch.max(probabilities, 1)
        
    print(f"INFO: Inference Result - {model.classes[class_idx.item()]} ({prob.item():.4f})")
    
    confidence_score = float(prob.item())
    confidence_percent = int(confidence_score * 100)
    
    predicted_class = model.classes[class_idx.item()]
    
    # 4. Logic Extraction
    is_tumor = predicted_class != "No Tumor"
    
    # Generate Output strings matching requirements
    # Frontend logic usually expects "prediction" to be the main text
    
    # 5. Grad-CAM (Visualize model focus)
    heatmap_raw, _ = cam_generator.generate(input_tensor, class_idx.item())
    
    # Create distinct visual outputs
    heatmap_only_b64 = generate_heatmap_only(heatmap_raw)
    overlay_b64 = overlay_heatmap(image_bytes, heatmap_raw)
    
    return {
        # Strictly Required Keys per prompt
        "tumor_type": predicted_class,
        "probability": round(confidence_score, 4),
        "gradcam_heatmap": heatmap_only_b64,
        "overlay_image": overlay_b64,
        
        # Legacy/Frontend Compatibility Keys
        "prediction": f"Tumor Detected: {predicted_class}" if is_tumor else "No Tumor Detected",
        "confidence": confidence_percent,
        "heatmap": overlay_b64, # The frontend 'heatmap' usually expects the overlay anyway
        "difficulty": "High" if confidence_percent < 85 else "Low", 
        "verified": True,
        "is_tumor": is_tumor
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
