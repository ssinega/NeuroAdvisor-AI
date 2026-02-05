import torch
import torch.nn as nn
from torchvision import models, transforms
import os

class MedicalCNN(nn.Module):
    def __init__(self, num_classes=4):
        super(MedicalCNN, self).__init__()
        # Use ResNet18 for faster inference and training
        self.base = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        
        # Replace the final fully connected layer
        num_ftrs = self.base.fc.in_features
        self.base.fc = nn.Linear(num_ftrs, num_classes)
        
        # Define classes as per requirement
        # Order must match the training folder structure: Glioma, Meningioma, No Tumor, Pituitary
        # We enforce a standard map here.
        self.classes = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]

    def forward(self, x):
        return self.base(x)

def get_model(weights_path=None):
    if weights_path is None:
        # Use relative path to this file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        weights_path = os.path.join(base_dir, 'brain_tumor_resnet.pth')
    
    model = MedicalCNN()
    
    # Load trained weights if they exist
    print(f"DEBUG: Attempting to load weights from: {os.path.abspath(weights_path)}")
    if os.path.exists(weights_path):
        try:
            state_dict = torch.load(weights_path, map_location=torch.device('cpu'))
            model.load_state_dict(state_dict)
            print(f"SUCCESS: Loaded trained weights from {weights_path}")
        except Exception as e:
            print(f"ERROR: Failed to load weights: {e}")
            print("INFO: Falling back to ImageNet weights.")
    else:
        print(f"WARNING: No trained weights found at {weights_path}. Using ImageNet initialization.")
        
    model.eval()
    return model

def preprocess_image(image_bytes):
    from PIL import Image
    import io
    
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return preprocess(img).unsqueeze(0)
