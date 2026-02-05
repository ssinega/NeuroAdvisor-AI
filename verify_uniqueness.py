import requests
import numpy as np
import cv2
import io
import base64

def create_mri_like(intensity=100):
    # Create 224x224 grayscale image
    img = np.zeros((224, 224), dtype=np.uint8)
    # Add a "brain" circle
    cv2.circle(img, (112, 112), 80, intensity, -1)
    # Encode to JPG
    _, buffer = cv2.imencode('.jpg', img)
    return buffer.tobytes()

def test_uniqueness():
    url = "http://localhost:8000/analyze"
    
    # Test 1: Dim brain
    bytes1 = create_mri_like(50)
    # Test 2: Bright brain
    bytes2 = create_mri_like(200)
    
    print("Testing Image 1...")
    files1 = {'file': ('mri1.jpg', bytes1, 'image/jpeg')}
    res1 = requests.post(url, files=files1).json()
    
    print("Testing Image 2...")
    files2 = {'file': ('mri2.jpg', bytes2, 'image/jpeg')}
    res2 = requests.post(url, files=files2).json()
    
    print(f"\nImage 1 - Type: {res1.get('tumor_type')}, Prob: {res1.get('probability')}")
    print(f"Image 2 - Type: {res2.get('tumor_type')}, Prob: {res2.get('probability')}")
    
    if res1.get('probability') == res2.get('probability') and res1.get('tumor_type') == res2.get('tumor_type'):
        print("\n[!] FAILURE: Outputs are identical!")
    else:
        print("\n[v] SUCCESS: Outputs differ.")
        
    # Check Heatmaps
    import hashlib
    hm1 = res1.get('gradcam_heatmap', '')
    hm2 = res2.get('gradcam_heatmap', '')
    
    hash1 = hashlib.md5(hm1.encode()).hexdigest()
    hash2 = hashlib.md5(hm2.encode()).hexdigest()
    
    print(f"Heatmap 1 Hash: {hash1}")
    print(f"Heatmap 2 Hash: {hash2}")
    
    if hash1 == hash2:
        print("[!] FAILURE: Heatmaps are identical (hashes match)!")
    else:
        print("[v] SUCCESS: Heatmaps differ.")

if __name__ == "__main__":
    test_uniqueness()
