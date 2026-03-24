import torch
import torch.nn.functional as F
import cv2
import numpy as np

class GradCAM:
    def __init__(self, model):
        self.model = model
        self.feature_extractor = model.features
        
        self.gradients = None
        self.activations = None
        
        # Register hooks to save gradients and activations from the last conv layer
        self._register_hooks()
        
    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]
        
    def _save_activation(self, module, input, output):
        self.activations = output
        
    def _register_hooks(self):
        # Depending on how the feature extractor is structured, we attach to the last layer
        target_layer = self.feature_extractor[-1]
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_backward_hook(self._save_gradient)
        
    def generate_heatmap(self, input_tensor, target_class):
        self.model.eval()
        self.model.zero_grad()
        
        # Forward pass
        output_logits, _ = self.model(input_tensor)
        
        # Get score of target class
        score = output_logits[0, target_class]
        
        # Backward pass
        score.backward(retain_graph=True)
        
        # Get captured gradients and activations
        gradients = self.gradients[0].cpu().data.numpy()
        activations = self.activations[0].cpu().data.numpy()
        
        # Global average pooling on gradients
        weights = np.mean(gradients, axis=(1, 2))
        
        # Weighted combination of activations
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]
            
        # ReLU activation on CAM
        cam = np.maximum(cam, 0)
        
        # Normalize between 0 and 1
        cam = cam - np.min(cam)
        cam = cam / (np.max(cam) + 1e-8)
        
        return cam, output_logits

def apply_colormap_on_image(org_im, activation, colormap_name=cv2.COLORMAP_JET):
    # org_im should be float32 in [0, 1]
    activation = cv2.resize(activation, (org_im.shape[1], org_im.shape[0]))
    
    heatmap = cv2.applyColorMap(np.uint8(255 * activation), colormap_name)
    heatmap = np.float32(heatmap) / 255
    heatmap = heatmap[..., ::-1] # BGR to RGB
    
    # Overlay with alpha blending
    cam = heatmap + org_im
    cam = cam / np.max(cam)
    return np.uint8(255 * cam), np.uint8(255 * heatmap)
