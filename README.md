# NeuroAdvisor-AI

An explainable AI-powered clinical decision-support tool for assisting doctors in brain MRI analysis. 
⚠️ **NOT for automated diagnosis. Requires human-in-the-loop validation.**

## Features
- Deep Learning (ResNet50 based) tumor classification (Meningioma, Glioma, Pituitary).
- Transparent AI predictions via **Grad-CAM**.
- Modern hospital-grade UI (React + Tailwind CSS).
- Processing of MATLAB `.mat` MRI files and standard image formats.

## 📁 Project Structure

```bash
📦 NeuroAdvisor-AI
 ┣ 📂 backend
 ┃ ┗ 📜 app.py               # Flask backend API
 ┣ 📂 frontend               # React app (Vite + Tailwind)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📜 App.jsx            # Main React Dashboard
 ┃ ┃ ┣ 📜 main.jsx           # Entry
 ┃ ┃ ┗ 📜 index.css          # Tailwind setup
 ┃ ┗ 📜 package.json
 ┣ 📂 model
 ┃ ┣ 📜 model.py             # Custom ResNet50 definitions
 ┃ ┗ 📜 train.py             # Training skeleton script
 ┣ 📂 utils
 ┃ ┣ 📜 data_loader.py       # Extracting .mat MRI and Mask arrays
 ┃ ┗ 📜 gradcam.py           # Grad-CAM PyTorch operations
 ┣ 📂 statics                # Stores intermediary outputs/uploads
 ┣ 📜 requirements.txt       # Python dependencies
 ┣ 📜 test_script.py         # Sample usage for CLI debugging
 ┗ 📜 README.md
```

## 🛠️ Setup Instructions

### 1. Terminal 1: Backend Setup
```bash
cd NeuroAdvisor-AI
python -m venv venv
venv\Scripts\activate      # Windows OR `source venv/bin/activate` for Mac/Linux
pip install -r requirements.txt
python backend/app.py
```
*The server will run on http://localhost:5000*

### 2. Terminal 2: Frontend Setup
```bash
cd NeuroAdvisor-AI/frontend
npm install
npm run dev
```
*The UI will run on http://localhost:5173*

## Ethical Guidelines & Warnings
- **Visual Confidence Overlays:** Grad-CAM provides a heat map to verify if the model bases its decision on pathological features or artifact noise.
- **Model Bias Transparency:** System displays the probability of all tumor classes.
- Always observe the application's mandatory warnings regarding validation by certified professionals.
