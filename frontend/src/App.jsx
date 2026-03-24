import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, AlertTriangle, ChevronRight, RefreshCw, BarChart2, Activity, User, Save, Clock, LogOut, ArrowLeft, Calendar, UserPlus, Image as ImageIcon } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth'); // auth, dashboard, history
  const [authMode, setAuthMode] = useState('login'); // login, register
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [hospital, setHospital] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalContact, setHospitalContact] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard State
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, predicting, success, error
  const [errorMsg, setErrorMsg] = useState(null);
  const [results, setResults] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const fileInputRef = useRef(null);

  // Patient Info State
  const [currentHistoryId, setCurrentHistoryId] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientContact, setPatientContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [medicineHistory, setMedicineHistory] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [previousReports, setPreviousReports] = useState(null);

  // History State
  const [historyDocs, setHistoryDocs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('doctorSession');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setView('dashboard');
      fetchHistoryData(parsedUser.id);
    }
  }, []);

  const fetchHistoryData = async (uid) => {
    try {
      setLoadingHistory(true);
      const res = await axios.get(`${API_URL}/history/${uid}`);
      setHistoryDocs(res.data.history);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      setUser(res.data.user);
      localStorage.setItem('doctorSession', JSON.stringify(res.data.user));
      setView('dashboard');
      fetchHistoryData(res.data.user.id);
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/register`, { 
        name, email, password, designation, hospital, 
        hospital_address: hospitalAddress, hospital_contact: hospitalContact 
      });
      const newUser = { 
        id: res.data.user_id, name: res.data.name, email: res.data.email,
        designation: res.data.designation, hospital: res.data.hospital,
        hospital_address: res.data.hospital_address, hospital_contact: res.data.hospital_contact
      };
      setUser(newUser);
      localStorage.setItem('doctorSession', JSON.stringify(newUser));
      setView('dashboard');
      fetchHistoryData(newUser.id);
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('doctorSession');
    setView('auth');
    resetAll();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    await uploadFile(selectedFile);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    setFile(droppedFile);
    await uploadFile(droppedFile);
  };

  const uploadFile = async (uploadedFile) => {
    setStatus('uploading');
    setErrorMsg(null);
    setResults(null);
    setExplanation(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFileId(res.data.file_id);
      setPreview(res.data.preview);
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'Failed to upload file');
    }
  };

  const handleQueuePatient = async () => {
    if (!patientName.trim()) {
      setErrorMsg("Please enter at least a Patient Name to queue.");
      return;
    }
    setErrorMsg(null);
    if (user) {
      try {
        await axios.post(`${API_URL}/add_patient`, {
          user_id: user.id,
          patient_name: patientName,
          patient_age: patientAge,
          patient_contact: patientContact,
          blood_group: bloodGroup,
          patient_address: patientAddress,
          next_visit_date: nextVisitDate,
          remarks: remarks,
          medicine_history: medicineHistory
        });
        await fetchHistoryData(user.id);
        resetAll(true);
        setView('history'); // Automatically redirect to queue view
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to queue patient');
      }
    }
  };

  const handlePredict = async () => {
    if (!fileId) return;
    if (!patientName.trim()) {
      setErrorMsg("Please enter a Patient Name/ID before analysis.");
      return;
    }
    
    setStatus('predicting');
    setErrorMsg(null);
    
    try {
      // 1. Get Prediction
      const predRes = await axios.post(`${API_URL}/predict`, { file_id: fileId });
      const data = predRes.data;
      setResults(data);
      
      // 2. Get Explanation
      const explainRes = await axios.post(`${API_URL}/explain`, {
        prediction: data.prediction,
        confidence: data.confidence_scores[data.prediction]
      });
      setExplanation(explainRes.data.explanation);

      // 3. Upload Additional Assets
      let profilePicPath = '';
      let reportsPath = '';
      
      if (profilePic) {
        const pFormData = new FormData();
        pFormData.append('file', profilePic);
        const pRes = await axios.post(`${API_URL}/upload_asset`, pFormData);
        profilePicPath = pRes.data.file_path;
      }
      if (previousReports) {
        const rFormData = new FormData();
        rFormData.append('file', previousReports);
        const rRes = await axios.post(`${API_URL}/upload_asset`, rFormData);
        reportsPath = rRes.data.file_path;
      }

      // 4. Save/Update History
      if (user) {
        await axios.post(`${API_URL}/save_history`, {
          history_id: currentHistoryId, // Optional, only if it's an existing queue
          user_id: user.id,
          patient_name: patientName,
          prediction: data.prediction,
          confidence: data.confidence_scores[data.prediction],
          patient_age: patientAge,
          patient_contact: patientContact,
          previous_reports: reportsPath,
          remarks: remarks,
          medicine_history: medicineHistory,
          profile_picture: profilePicPath,
          blood_group: bloodGroup,
          patient_address: patientAddress,
          next_visit_date: nextVisitDate
        });
        await fetchHistoryData(user.id); // Refresh data instantly
      }

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'Failed to analyze the scan');
    }
  };

  const loadPatientForAnalysis = (doc) => {
    resetAll(false);
    setCurrentHistoryId(doc.id);
    setPatientName(doc.patient_name || '');
    setNextVisitDate(doc.next_visit_date || '');
    // In a real app we'd fetch all fields if needed. For now we just bind minimal context.
    setView('dashboard');
  };

  const resetAll = (full = true) => {
    setFile(null);
    setFileId(null);
    setPreview(null);
    setStatus('idle');
    setResults(null);
    setExplanation(null);
    setErrorMsg(null);
    if(fileInputRef.current) fileInputRef.current.value = null;
    
    if (full) {
      setCurrentHistoryId(null);
      setPatientName('');
      setPatientAge('');
      setPatientContact('');
      setBloodGroup('');
      setPatientAddress('');
      setNextVisitDate('');
      setRemarks('');
      setMedicineHistory('');
      setProfilePic(null);
      setPreviousReports(null);
    }
  };

  const getChartData = () => {
    if (!results) return null;
    const labels = Object.keys(results.confidence_scores);
    const data = Object.values(results.confidence_scores).map(v => v * 100);

    return {
      labels,
      datasets: [
        {
          label: 'Confidence (%)',
          data,
          backgroundColor: ['rgba(45, 212, 191, 0.7)', 'rgba(99, 102, 241, 0.7)', 'rgba(244, 114, 182, 0.7)'],
          borderColor: ['rgba(20, 184, 166, 1)', 'rgba(79, 70, 229, 1)', 'rgba(236, 72, 153, 1)'],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    maintainAspectRatio: false, color: '#cbd5e1', 
    scales: { 
      y: { min: 0, max: 100, grid: { color: 'rgba(51, 65, 85, 0.5)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { color: 'rgba(51, 65, 85, 0.5)' }, ticks: { color: '#94a3b8' } }
    },
    plugins: { legend: { labels: { color: '#cbd5e1' } } }
  };

  // derived metrics
  const unseenCount = historyDocs.filter(d => !d.is_seen).length;
  const seenCount = historyDocs.filter(d => d.is_seen).length;

  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center space-x-3 text-teal-400 mb-8">
            <Activity size={32} />
            <h1 className="text-2xl font-bold tracking-tight text-white">Neuro<span className="text-teal-400 font-light">Advisor</span>-AI</h1>
          </div>
          
          <h2 className="text-center text-slate-300 text-lg font-semibold mb-6">Doctor Portal {authMode === 'login' ? 'Login' : 'Registration'}</h2>
          
          {authError && <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm text-center">{authError}</div>}
          
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Dr. Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:bg-slate-900 transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Designation</label>
                  <input required type="text" value={designation} onChange={e => setDesignation(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:bg-slate-900 transition-colors" placeholder="e.g. Senior Neurologist" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Hospital Name</label>
                    <input required type="text" value={hospital} onChange={e => setHospital(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:bg-slate-900 transition-colors" placeholder="Apollo Hospital" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Hospital Contact No.</label>
                    <input required type="text" value={hospitalContact} onChange={e => setHospitalContact(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:bg-slate-900 transition-colors" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Hospital Address</label>
                  <input required type="text" value={hospitalAddress} onChange={e => setHospitalAddress(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:bg-slate-900 transition-colors" placeholder="123 Medical Drive, City" />
                </div>
              </>
            )}
            <div>
              <label className="block text-slate-400 text-sm mb-1">Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:bg-slate-900 transition-colors" placeholder="doctor@hospital.org" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:bg-slate-900 transition-colors" placeholder="••••••••" />
            </div>
            
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.2)] mt-6 transition-all">
              {authMode === 'login' ? 'Secure Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-500 text-sm">
            {authMode === 'login' ? "Don't have an account? " : "Already registered? "}
            <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-teal-400 hover:text-teal-300 font-semibold underline">
              {authMode === 'login' ? 'Register here' : 'Login here'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-950 text-slate-200 selection:bg-teal-500/30">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3 text-teal-400 cursor-pointer" onClick={() => { resetAll(); setView('dashboard'); }}>
          <Activity size={28} />
          <h1 className="text-xl font-bold tracking-tight text-white">Neuro<span className="text-teal-400 font-light">Advisor</span>-AI</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex space-x-3 text-sm font-semibold tracking-wide mr-4">
             <div className="border border-teal-500/30 bg-teal-500/10 text-teal-300 px-3 py-1 rounded-full">{unseenCount} Queue Today</div>
             <div className="border border-slate-700 bg-slate-800 text-slate-400 px-3 py-1 rounded-full">{seenCount} Analyzed</div>
          </div>
          
          <button onClick={() => { resetAll(); setView('dashboard'); }} className={`text-sm font-semibold transition-colors ${view === 'dashboard' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}>
            New Analyzer
          </button>
          <button onClick={() => { fetchHistoryData(user.id); setView('history'); }} className={`flex items-center text-sm font-semibold transition-colors ${view === 'history' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}>
            <Clock size={16} className="mr-1.5" /> Case Queue & History
          </button>
          
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          
          <div className="flex items-center text-sm font-medium text-slate-300 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 shadow-sm">
            <User size={16} className="mr-2 text-teal-400" /> 
            <div className="flex flex-col ml-1 mr-2 hidden sm:flex">
              <span className="text-white font-bold leading-tight">Dr. {user?.name.split(' ')[0]}</span>
              <span className="text-teal-400 text-[10px] uppercase font-bold tracking-wider leading-tight">
                {user?.designation ? `${user.designation} • ${user.hospital}` : 'Doctor Profile'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} title="Logout" className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg shadow-sm text-amber-200 flex items-start backdrop-blur-sm">
          <AlertTriangle className="mr-3 flex-shrink-0 text-amber-400 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-amber-400 tracking-wide uppercase text-xs mb-0.5">Clinical Assistance Only</h3>
            <p className="text-xs text-amber-200/80">
              This tool provides statistical visualization. It is <strong>NOT</strong> an automated diagnostic system. Validations by certified radiologists are mandatory.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col items-center">
        
        {/* ======================= QUEUE / HISTORY VIEW ======================= */}
        {view === 'history' && (
          <div className="w-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button onClick={() => setView('dashboard')} className="mr-4 text-slate-500 hover:text-white bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-2xl font-bold text-white">Daily Queue & Explored Cases</h2>
              </div>
              <button 
                onClick={() => { resetAll(); setView('dashboard'); }}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-400 font-bold py-2 px-4 rounded-xl flex items-center transition-all text-sm shadow-md"
              >
                <UserPlus size={16} className="mr-2" /> Schedule New Patient
              </button>
            </div>
            
            {loadingHistory ? (
              <div className="p-12 flex justify-center"><RefreshCw className="animate-spin text-teal-500" size={32} /></div>
            ) : (
              <div className="space-y-8">
                {/* UNSEEN CASES */}
                <div className="bg-slate-900 border border-teal-500/30 rounded-xl shadow-2xl overflow-hidden shadow-[0_4px_15px_rgba(20,184,166,0.1)]">
                  <div className="bg-teal-500/10 px-6 py-4 border-b border-teal-500/30 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-teal-400 flex items-center">
                      <Clock size={18} className="mr-2" /> Pending Analyzation (Queue: {unseenCount})
                    </h3>
                  </div>
                  {unseenCount === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No patients waiting in queue today.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold">Patient Name</th>
                            <th className="p-4 font-semibold">Next Visit Date</th>
                            <th className="p-4 font-semibold">Scheduled On</th>
                            <th className="p-4 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {historyDocs.filter(d => !d.is_seen).map((doc, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/80 transition-colors">
                              <td className="p-4 font-bold text-white tracking-wide">{doc.patient_name}</td>
                              <td className="p-4 text-sm font-medium text-amber-300">
                                {doc.next_visit_date ? <div className="flex items-center"><Calendar size={14} className="mr-1"/>{doc.next_visit_date}</div> : '-'}
                              </td>
                              <td className="p-4 text-slate-500 text-xs">{doc.timestamp}</td>
                              <td className="p-4 text-right">
                                <button onClick={() => loadPatientForAnalysis(doc)} className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all">
                                  Run MRI Analysis
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* SEEN CASES */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                  <div className="bg-slate-950/50 px-6 py-4 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-slate-300 flex items-center">
                      <Save size={18} className="mr-2 text-slate-500" /> Successfully Analyzed ({seenCount})
                    </h3>
                  </div>
                  {seenCount === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No cases analyzed yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950/20 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold">Patient Name</th>
                            <th className="p-4 font-semibold">Next Visit Date</th>
                            <th className="p-4 font-semibold">Diagnosis Prediction</th>
                            <th className="p-4 font-semibold">Confidence</th>
                            <th className="p-4 font-semibold">Examined On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {historyDocs.filter(d => d.is_seen).map((doc, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                              <td className="p-4 font-medium text-white">{doc.patient_name}</td>
                              <td className="p-4 text-sm text-slate-400">{doc.next_visit_date || '-'}</td>
                              <td className="p-4">
                                <span className={`border px-2.5 py-1 rounded text-xs font-bold shadow-sm ${doc.prediction === 'Meningioma' ? 'bg-indigo-900/40 text-indigo-400 border-indigo-500/30' : doc.prediction === 'Glioma' ? 'bg-rose-900/40 text-rose-400 border-rose-500/30' : 'bg-teal-900/40 text-teal-400 border-teal-500/30'}`}>
                                  {doc.prediction}
                                </span>
                              </td>
                              <td className="p-4 font-medium">{(doc.confidence * 100).toFixed(1)}%</td>
                              <td className="p-4 text-slate-600 text-xs">{doc.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= DASHBOARD VIEW ======================= */}
        {view === 'dashboard' && (
          <div className="w-full px-2">
            {errorMsg && (
              <div className="w-full bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg shadow-md mb-6 flex items-start max-w-2xl mx-auto">
                <strong className="font-bold mr-2 text-red-400">Error: </strong>
                <span className="block sm:inline">{errorMsg}</span>
              </div>
            )}

            {!results && status !== 'predicting' && (
              <div className="w-full max-w-2xl mx-auto bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 mt-2">
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-semibold text-white tracking-wide">
                    {currentHistoryId ? 'Analyzing Queued Patient' : 'Patient Registration Intake'}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Patient Identifier / Name</label>
                    <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. John Doe / PT-10024"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors" />
                  </div>
                  
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Patient Age</label>
                    <input type="text" value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="e.g. 45"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors" />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Patient Contact Number</label>
                    <input type="text" value={patientContact} onChange={e => setPatientContact(e.target.value)} placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors" />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Blood Group</label>
                    <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Scheduled Next Visit Date</label>
                    <input type="date" value={nextVisitDate} onChange={e => setNextVisitDate(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-[11px] text-white outline-none focus:border-teal-500 transition-colors" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Address</label>
                    <input type="text" value={patientAddress} onChange={e => setPatientAddress(e.target.value)} placeholder="123 Main St, City"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Medicine History</label>
                    <textarea value={medicineHistory} onChange={e => setMedicineHistory(e.target.value)} placeholder="Current or past prescriptions..." rows="2"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2 font-medium">General Remarks</label>
                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Condition notes..." rows="2"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"></textarea>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Profile Picture (Optional)</label>
                    <input type="file" onChange={e => setProfilePic(e.target.files[0])} accept="image/*"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-[9px] text-white outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500/20 file:text-teal-400 hover:file:bg-teal-500/30" />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Previous Reports (Optional)</label>
                    <input type="file" onChange={e => setPreviousReports(e.target.files[0])} accept=".pdf,.png,.jpg,.doc,.docx"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-[9px] text-white outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500/20 file:text-teal-400 hover:file:bg-teal-500/30" />
                  </div>
                </div>

                {!preview && !fileId && (
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleQueuePatient} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-semibold py-3 px-6 rounded-xl flex items-center shadow-md transition-all">
                      <Save size={18} className="mr-2 text-teal-400" /> Save Patient to Queue Only
                    </button>
                  </div>
                )}

                <div className="flex items-center mt-10 mb-6 text-slate-300 border-t border-slate-800 pt-8">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 font-bold text-teal-400 border border-slate-700"><ImageIcon size={14}/></div>
                  <h2 className="text-xl font-semibold text-white">Attach Scan & Analyze</h2>
                </div>

                <div 
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${preview ? 'border-teal-400/50 bg-teal-900/10' : 'border-slate-700 hover:border-teal-500/50 hover:bg-slate-800/50 bg-slate-950'}`}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <UploadCloud size={56} className="text-teal-500 mb-4 opacity-80" />
                  <p className="text-slate-300 font-medium text-lg">Drag & drop MRI slice</p>
                  <p className="text-slate-500 text-sm mt-2">Supports .mat, .jpg, or .png</p>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".mat,.jpg,.jpeg,.png" />
                </div>

                {preview && (
                  <div className="mt-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <p className="text-slate-400 mb-3 font-medium text-sm tracking-wide uppercase">Scan Registered Ready</p>
                    <img src={preview} alt="MRI Preview" className="h-56 object-contain rounded-lg border border-slate-700 shadow-xl opacity-90" />
                    <button 
                      onClick={handlePredict}
                      disabled={status === 'uploading' || !patientName.trim()}
                      className={`mt-8 font-bold py-3.5 px-8 rounded-xl flex items-center transition-all shadow-lg ${
                        patientName.trim() 
                        ? 'bg-teal-600 hover:bg-teal-500 text-white hover:scale-[1.02] shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Run MRI Engine <ChevronRight className="ml-2 w-5 h-5" />
                    </button>
                    {!patientName.trim() && <p className="text-slate-500 text-xs mt-3">Patient Name is required before analysis.</p>}
                  </div>
                )}
              </div>
            )}

            {status === 'predicting' && (
              <div className="w-full max-w-2xl mx-auto bg-slate-900 p-16 rounded-2xl shadow-2xl border border-slate-800 flex flex-col items-center justify-center mt-12">
                <div className="relative">
                  <RefreshCw size={56} className="text-teal-400 animate-spin mb-6" />
                  <div className="absolute inset-0 bg-teal-400 blur-xl opacity-20 rounded-full"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Processing Scan for {patientName}</h2>
                <p className="text-slate-400 text-center max-w-sm">Generating AI class weights & plotting Feature Activation Maps...</p>
              </div>
            )}

            {results && (
              <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex justify-between items-center px-1">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <Activity className="text-teal-400 mr-2" /> Diagnostic Report
                    </h2>
                    <p className="text-slate-400 mt-1">Patient: <span className="text-white font-medium tracking-wide">{patientName}</span></p>
                  </div>
                  <button onClick={() => setView('history')} className="text-slate-400 font-medium hover:text-white flex items-center px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors shadow-md">
                    <ArrowLeft size={16} className="mr-2" /> Return to Queue
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 space-y-6">
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Extracted Assessment</h3>
                      <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 mb-2 drop-shadow-sm">
                        {results.prediction}
                      </div>
                      <div className="flex items-center">
                        <div className="text-slate-400 font-medium text-sm mr-3">Confidence</div>
                        <div className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-teal-300 font-bold text-sm">
                          {(results.confidence_scores[results.prediction] * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
                      <div className="flex items-center text-slate-300 font-semibold mb-6">
                        <BarChart2 size={18} className="mr-2 text-teal-400" />
                        Probability Space Graph
                      </div>
                      <div className="h-48 relative">
                        <Bar data={getChartData()} options={chartOptions} />
                      </div>
                    </div>

                    {explanation && (
                      <div className="bg-slate-950 p-6 rounded-2xl shadow-inner border border-slate-800 group relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-indigo-500 rounded-l-2xl"></div>
                        <h3 className="font-semibold text-white mb-3 flex items-center text-sm tracking-wide">
                          <Activity size={16} className="mr-2 text-teal-400" /> Computational Reasoning
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-light whitespace-pre-wrap">
                          {explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 lg:col-span-2 bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-800">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center pb-4 border-b border-slate-800">
                      Feature Validation Overlay Sets
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col group">
                        <div className="flex items-center justify-between mb-3 text-slate-400 font-medium text-sm"><span>Original Scan</span></div>
                        <div className="bg-black rounded-xl p-1 border border-slate-800 shadow-md">
                          <img src={preview} alt="Original" className="rounded-lg w-full object-cover aspect-square opacity-90 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex flex-col group">
                        <div className="flex items-center justify-between mb-3 text-slate-400 font-medium text-sm"><span>Raw Heatmap</span></div>
                        <div className="bg-black rounded-xl p-1 border border-slate-800 shadow-md">
                          <img src={results.heatmap_image} alt="Heatmap" className="rounded-lg w-full object-cover aspect-square opacity-90 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex flex-col group">
                        <div className="flex items-center justify-between mb-3 text-teal-400 font-semibold text-sm">
                          <span>Alpha Blended Overlay</span>
                          <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                          </span>
                        </div>
                        <div className="bg-black rounded-xl p-1 border-2 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                          <img src={results.overlay_image} alt="Overlay" className="rounded-lg w-full object-cover aspect-square" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 bg-slate-950 p-5 rounded-xl text-sm text-slate-400 border border-slate-800 flex items-start">
                      <Activity className="mr-3 text-slate-500 flex-shrink-0 mt-0.5" size={18} />
                      <p>
                        <strong className="text-slate-300">Interpretation Matrix:</strong> The "Alpha Blended Overlay" projects calculated nodal importance from ResNet-50. Look for <span className="text-rose-400 font-semibold">Red/Yellow</span> clusters to locate critical morphology influencing this '{results.prediction}' prediction.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <span className="text-teal-500 flex items-center text-sm font-semibold bg-teal-900/20 px-4 py-2 rounded-full border border-teal-500/30">
                        <Save size={16} className="mr-2" /> Synced to Patient Log
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
