const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db.json');

// Initialize DB file if it doesn't exist
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ patients: [], analyses: [] }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const db = {
    getPatients: () => {
        const data = readDB();
        return data.patients.map(p => ({
            ...p,
            history: data.analyses.filter(a => a.patient_id === p.id).sort((a, b) => b.id - a.id)
        }));
    },
    getPatient: (id) => {
        const data = readDB();
        const patient = data.patients.find(p => p.id === id);
        if (!patient) return null;
        return {
            ...patient,
            history: data.analyses.filter(a => a.patient_id === id).sort((a, b) => b.id - a.id)
        };
    },
    addPatient: (patient) => {
        const data = readDB();
        data.patients.push(patient);
        writeDB(data);
        return { ...patient, history: [] };
    },
    addAnalysis: (patientId, analysis) => {
        const data = readDB();
        const newId = data.analyses.length > 0 ? Math.max(...data.analyses.map(a => a.id)) + 1 : 1;
        const newAnalysis = { id: newId, patient_id: patientId, ...analysis };
        data.analyses.push(newAnalysis);

        // Update patient status
        const patient = data.patients.find(p => p.id === patientId);
        if (patient) patient.status = 'Verified';

        writeDB(data);
        return newAnalysis;
    },
    updateNotes: (patientId, notes) => {
        const data = readDB();
        const patient = data.patients.find(p => p.id === patientId);
        if (patient) {
            patient.notes = notes;
            writeDB(data);
            return true;
        }
        return false;
    },
    updateAvatar: (patientId, avatar) => {
        const data = readDB();
        const patient = data.patients.find(p => p.id === patientId);
        if (patient) {
            patient.avatar = avatar;
            writeDB(data);
            return true;
        }
        return false;
    }
};

module.exports = db;
