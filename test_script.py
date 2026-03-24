import requests
import json
import base64
from io import BytesIO
from PIL import Image
import os

API_URL = "http://localhost:5000"

def test_pipeline(image_path):
    print(f"Testing pipeline with: {image_path}")
    
    # 1. Upload File
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            res = requests.post(f"{API_URL}/upload", files=files)
            if res.status_code != 200:
                print(f"Upload failed: {res.text}")
                return
    except Exception as e:
        print(f"File loading error: {e}")
        return

    data = res.json()
    file_id = data.get('file_id')
    print(f"[*] Uploaded successfully. File ID: {file_id}")

    # 2. Predict
    print("[*] Running prediction...")
    pred_res = requests.post(f"{API_URL}/predict", json={"file_id": file_id})
    if pred_res.status_code != 200:
        print(f"Prediction failed: {pred_res.text}")
        return
        
    pred_data = pred_res.json()
    prediction = pred_data.get('prediction')
    confidences = pred_data.get('confidence_scores')
    print(f"[*] Prediction: {prediction}")
    print(f"[*] Confidences: {json.dumps(confidences, indent=2)}")

    # 3. Explain
    print("[*] Fetching explainability summary...")
    explain_res = requests.post(f"{API_URL}/explain", json={
        "prediction": prediction,
        "confidence": confidences.get(prediction)
    })
    
    if explain_res.status_code == 200:
        print(f"[*] Explanation: \n{explain_res.json().get('explanation')}")

    # Optional: Save base64 images to disk for verification
    if 'overlay_image' in pred_data:
        b64_str = pred_data['overlay_image'].split(',')[1]
        img = Image.open(BytesIO(base64.b64decode(b64_str)))
        img.save("test_overlay.jpg")
        print("[*] Saved overlay visualization as 'test_overlay.jpg'")

if __name__ == "__main__":
    test_file = "test_image.jpg"
    # Create dummy test image for structural testing if doesn't exist
    if not os.path.exists(test_file):
        dummy = Image.new('RGB', (224, 224), color = 'gray')
        dummy.save(test_file)
        
    test_pipeline(test_file)
