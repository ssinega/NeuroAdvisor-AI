import h5py
import numpy as np
import cv2
from PIL import Image
import io

def load_mat_file(file_path_or_bytes):
    try:
        # Check if bytes
        if isinstance(file_path_or_bytes, bytes):
            # Write to temp file
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.mat', delete=False) as tf:
                tf.write(file_path_or_bytes)
                file_path_or_bytes = tf.name
                
        with h5py.File(file_path_or_bytes, 'r') as f:
            # Usually 'cjdata' contains 'image', 'label', 'tumorMask'
            data = f['cjdata']
            image = np.array(data['image'])
            label = int(np.array(data['label'])[0][0])
            mask = np.array(data['tumorMask'])
            
            # Normalize
            image = image.astype(np.float32)
            image = (image - np.min(image)) / (np.max(image) - np.min(image)) * 255.0
            image = image.astype(np.uint8)
            
            # Grayscale to RGB
            if len(image.shape) == 2:
                image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
                
            return image, label, mask
    except Exception as e:
        print(f"Error loading .mat file: {e}")
        return None, None, None

def load_image_file(file_bytes):
    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    image = np.array(image)
    return image, None, None
