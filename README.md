<<<<<<< HEAD
# 🧠 Brain Tumor Detection System using CNN & Grad-CAM
## 📌 Project Overview
This project is a **clinical decision support system** that detects and classifies **brain tumors from MRI images** using **Deep Learning (Convolutional Neural Networks)**.
It also provides **explainable AI outputs** using **Grad-CAM**, helping doctors understand *where* the model is focusing during prediction.
The system is designed with a **frontend–backend separation**:

* **Frontend**: Doctor dashboard for uploading MRI scans and viewing results
* **Backend**: CNN-based model for image analysis and inference

## 🎯 Objectives

* Detect whether an uploaded image is a **valid brain MRI**
* Classify the tumor into:

  * **Glioma**
  * **Meningioma**
  * **Pituitary**
  * **No Tumor**
* Provide:

  * Tumor type
  * Prediction probability
  * **Grad-CAM heatmap**
  * **Overlay image (MRI + heatmap)**
* Ensure results **vary dynamically for each image**
* Support **Seen / Unseen patient case workflow** for doctors

---

## 🧠 System Architecture

```
Doctor Dashboard (Frontend)
        |
        |  Upload MRI Image
        v
Backend API (FastAPI / Flask)
        |
        |-- Image Validation (Brain MRI or not)
        |-- Image Preprocessing
        |-- CNN Inference
        |-- Tumor Classification
        |-- Probability Calculation
        |-- Grad-CAM Generation
        |
        v
Prediction Results → Frontend
```

---

## 🔬 Machine Learning Approach

### 🔹 Dataset

* Public **Brain Tumor MRI datasets** (Kaggle)
* Classes:

  * Glioma
  * Meningioma
  * Pituitary
  * No Tumor

### 🔹 Model

* Convolutional Neural Network (CNN)
* Transfer learning (ResNet / EfficientNet / VGG)
* Trained on preprocessed MRI images

### 🔹 Preprocessing

* Image resizing (e.g., 224×224)
* Normalization
* Data augmentation

---

## 🔥 Explainable AI – Grad-CAM

To improve transparency and trust:

* **Grad-CAM (Gradient-weighted Class Activation Mapping)** is used
* Highlights regions where the CNN focuses during prediction
* Helps doctors visually verify tumor localization

### Outputs:

* Grad-CAM heatmap
* Overlay image (original MRI + heatmap)

---

## 📊 Model Evaluation

* Model performance is evaluated using a **Confusion Matrix**
* Shows classification accuracy across tumor classes:

  * Meningioma
  * Glioma
  * Pituitary

This helps assess real-world reliability of the model.

---

## 🖥️ Application Features

### 👨‍⚕️ Doctor Dashboard

* Doctor profile with:

  * Name
  * Specialization
  * Education
  * Experience
* Patient registry:

  * **Seen Cases**
  * **Unseen Cases**

### 🧪 Analyze Scan

* Upload MRI image
* Automatic validation (brain MRI or not)
* Dynamic prediction per image
* Visual explanation using Grad-CAM

---

## ⚙️ Technology Stack

### Frontend

* React.js
* Dark Hospital Theme UI
* Dashboard-based layout

### Backend

* Python
* FastAPI / Flask
* REST APIs

### Machine Learning

* TensorFlow / PyTorch
* CNN models
* Grad-CAM for explainability

---

## 📤 API Output Format (Example)

```json
{
  "tumor_type": "Glioma",
  "probability": 0.87,
  "gradcam_heatmap": "<base64_image>",
  "overlay_image": "<base64_image>"
}
```

> ⚠️ Outputs are **image-dependent** and change for each MRI scan.

---

## ✅ Key Highlights

* ✔ Real CNN-based inference (no static outputs)
* ✔ Explainable AI using Grad-CAM
* ✔ Frontend remains unchanged
* ✔ Backend handles all ML logic
* ✔ Suitable for medical AI demonstrations

---

## 📌 Use Cases

* Assisting radiologists in early tumor detection
* Educational tool for understanding CNN behavior
* Research and academic demonstrations
* Hackathons and AI-for-healthcare projects

---

## ⚠️ Disclaimer

This system is intended for **educational and research purposes only** and should **not be used as a replacement for professional medical diagnosis**.

---

## 👤 Author

**Sine**
=======
# NeuroAdvisor-AI-
>>>>>>> bd2d5e1c048181d937194a01bd62a301daf3ceaf
