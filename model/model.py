import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights

class NeuroAdvisorModel(nn.Module):
    def __init__(self, num_classes=3):
        super(NeuroAdvisorModel, self).__init__()
        # Load pretrained ResNet50
        self.base_model = resnet50(weights=ResNet50_Weights.DEFAULT)
        # We need the feature extractor (all layers except the final fc layer)
        self.features = nn.Sequential(*list(self.base_model.children())[:-2])
        
        # New classification head
        self.global_avg_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.classifier = nn.Sequential(
            nn.Linear(2048, 512),
            nn.ReLU(),
            nn.Dropout(p=0.5),
            nn.Linear(512, num_classes)
        )
        # Note: We don't apply Softmax here since CrossEntropyLoss handles it,
        # but we can apply it during inference.

    def forward(self, x):
        # Extract features
        x = self.features(x)
        features = x # Keep for Grad-CAM
        
        # Pool
        x = self.global_avg_pool(features)
        x = x.view(x.size(0), -1)
        
        # Classify
        out = self.classifier(x)
        return out, features
