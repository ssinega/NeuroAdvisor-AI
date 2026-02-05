const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const db = require('./db');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// API Endpoints

// GET /api/patients → return all patients
app.get('/api/patients', (req, res) => {
    try {
        res.json(db.getPatients());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/patients/:id → return one patient
app.get('/api/patients/:id', (req, res) => {
    try {
        const patient = db.getPatient(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/patients → create a new patient
app.post('/api/patients', (req, res) => {
    const { id, name, age, gender, status, notes } = req.body;
    try {
        const newPatient = db.addPatient({ id, name, age, gender, status, notes });
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/patients/:id/analysis → add analysis to a patient (supports image upload)
app.post('/api/patients/:id/analysis', upload.single('image'), async (req, res) => {
    try {
        let analysisData = req.body;

        // If an image is uploaded, send it to the ML service
        if (req.file) {
            const formData = new FormData();
            formData.append('file', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            try {
                const mlResponse = await axios.post('http://localhost:8000/analyze', formData, {
                    headers: formData.getHeaders(),
                });

                // Handle Validation Failure
                if (mlResponse.data.error) {
                    return res.status(400).json({ error: mlResponse.data.error });
                }

                const mlData = mlResponse.data;

                // Combine ML results with metadata
                // Mapping ML Service keys (tumor_type, probability) to Frontend keys
                analysisData = {
                    ...analysisData,
                    prediction: mlData.prediction, // "Tumor Detected: Glioma"
                    confidence: mlData.confidence, // 98
                    heatmap: mlData.heatmap,       // Base64 Overlay
                    difficulty: mlData.difficulty, // "Low"
                    // Store raw ML data if needed for future
                    raw_tumor_type: mlData.tumor_type,
                    raw_probability: mlData.probability,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                };
            } catch (mlError) {
                console.error("ML Service Error:", mlError.message);
                if (mlError.response && mlError.response.data && mlError.response.data.error) {
                    return res.status(400).json({ error: mlError.response.data.error });
                }
                return res.status(502).json({ error: 'Neural Engine offline or unreachable' });
            }
        }

        const newAnalysis = db.addAnalysis(req.params.id, analysisData);
        res.status(201).json(newAnalysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/patients/:id/notes → update patient notes
app.patch('/api/patients/:id/notes', (req, res) => {
    try {
        const success = db.updateNotes(req.params.id, req.body.notes);
        if (success) res.json({ success: true });
        else res.status(404).json({ error: 'Patient not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/patients/:id/avatar → update patient avatar
app.patch('/api/patients/:id/avatar', (req, res) => {
    try {
        const success = db.updateAvatar(req.params.id, req.body.avatar);
        if (success) res.json({ success: true });
        else res.status(404).json({ error: 'Patient not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
