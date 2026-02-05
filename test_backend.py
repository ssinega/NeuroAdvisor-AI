import requests
import os

# 1. Test ML Service
print("Testing ML Service...")
try:
    # Create a dummy image
    from PIL import Image
    dummy_img = Image.new('RGB', (224, 224), color = (73, 109, 137))
    dummy_img.save('test_scan.jpg')

    with open('test_scan.jpg', 'rb') as f:
        files = {'file': ('test_scan.jpg', f, 'image/jpeg')}
        response = requests.post('http://localhost:8000/analyze', files=files)
        
    if response.status_code == 200:
        data = response.json()
        print("ML Service SUCCESS")
        print(f"Prediction: {data['prediction']}")
        print(f"Confidence: {data['confidence']}%")
        print(f"Heatmap (base64 snippet): {data['heatmap'][:50]}...")
    else:
        print(f"ML Service FAILED: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Testing skipped (Service likely not running yet): {e}")

# 2. Test Node.js API (assuming server is running on 5000)
# This requires a real patient ID already in db.json
print("\nTesting Node.js API...")
try:
    with open('test_scan.jpg', 'rb') as f:
        files = {'image': ('test_scan.jpg', f, 'image/jpeg')}
        # Using a dummy ID or getting one from db.json if needed
        response = requests.post('http://localhost:5000/api/patients/1767931098094/analysis', files=files)
        
    if response.status_code == 201:
        print("Node.js API SUCCESS")
    else:
        print(f"Node.js API FAILED: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Testing skipped: {e}")
finally:
    if os.path.exists('test_scan.jpg'):
        os.remove('test_scan.jpg')
