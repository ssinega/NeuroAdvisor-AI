import torch
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
import io
import base64

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

    def save_gradient(self, grad):
        self.gradients = grad

    def save_activation(self, module, input, output):
        self.activations = output
        # Register hook on the tensor itself for gradients
        output.register_hook(self.save_gradient)

    def generate(self, input_tensor, class_idx=None):
        # Reset state for this request
        self.gradients = None
        self.activations = None
        
        # Register temporary hook
        handle = self.target_layer.register_forward_hook(self.save_activation)
        
        # Forward pass (MUST be with grads enabled)
        with torch.set_grad_enabled(True):
            self.model.zero_grad()
            output = self.model(input_tensor)
            
            if class_idx is None:
                class_idx = torch.argmax(output).item()
                
            loss = output[0, class_idx]
            loss.backward()
        
        # Remove hook
        handle.remove()
        
        if self.gradients is None or self.activations is None:
            # Fallback if hooks didn't fire (shouldn't happen)
            print("WARNING: Grad-CAM hooks failed to fire!")
            return np.zeros((224, 224), dtype=np.float32), class_idx

        # Process gradients and activations
        gradients = self.gradients.detach().cpu().numpy()[0]
        activations = self.activations.detach().cpu().numpy()[0]
        
        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        
        for i, w in enumerate(weights):
            cam += w * activations[i]
            
        cam = np.maximum(cam, 0)
        # Avoid division by zero
        max_val = np.max(cam)
        if max_val > 0:
            cam = cam / max_val
            
        cam = cv2.resize(cam, (224, 224))
        return cam, class_idx

def overlay_heatmap(image_bytes, heatmap, alpha=0.4):
    # Load original image
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img)
    
    # Process heatmap
    heatmap_colored = np.uint8(255 * heatmap)
    heatmap_colored = cv2.applyColorMap(heatmap_colored, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    
    # Combine
    superimposed_img = heatmap_colored * alpha + img_array * (1 - alpha)
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)
    
    # Encode to base64
    _, buffer = cv2.imencode('.jpg', cv2.cvtColor(superimposed_img, cv2.COLOR_RGB2BGR))
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_base64}"

def generate_heatmap_only(heatmap):
    # Process heatmap
    heatmap_colored = np.uint8(255 * heatmap)
    heatmap_colored = cv2.applyColorMap(heatmap_colored, cv2.COLORMAP_JET)
    
    # Encode to base64
    _, buffer = cv2.imencode('.jpg', heatmap_colored)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_base64}"
