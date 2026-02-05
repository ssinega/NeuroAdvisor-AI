import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getPatients = async () => {
    const response = await api.get('/patients');
    return response.data;
};

export const getPatient = async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
};

export const createPatient = async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
};

export const createAnalysis = async (patientId, analysisData) => {
    // If analysisData is FormData, axios handles it. If not, it's JSON.
    const headers = analysisData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

    const response = await api.post(`/patients/${patientId}/analysis`, analysisData, { headers });
    return response.data;
};

export const updateNotes = async (patientId, notes) => {
    const response = await api.patch(`/patients/${patientId}/notes`, { notes });
    return response.data;
};

export const updatePatientAvatar = async (patientId, avatar) => {
    const response = await api.patch(`/patients/${patientId}/avatar`, { avatar });
    return response.data;
};

export default api;
