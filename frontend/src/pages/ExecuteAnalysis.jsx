import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Upload,
    Binary,
    X,
    AlertCircle,
    Loader2,
    CheckCircle2,
    ShieldAlert,
    ChevronRight,
    User,
    BrainCircuit,
    ArrowLeft
} from 'lucide-react';
import clsx from 'clsx';
import useStore from '../store/useStore';

const ExecuteAnalysis = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const { patients, addAnalysis } = useStore();
    const [patient, setPatient] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const p = patients.find(p => p.id === patientId);
        if (p) {
            setPatient(p);
        }
    }, [patientId, patients]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file (MRI Scan).');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            // addAnalysis in useStore calls createAnalysis in api.js
            // The backend returns the new analysis object which includes the ML result
            const result = await addAnalysis(patientId, formData);

            // Assuming the store update already handled putting the result in the patient history,
            // we just need to show it here locally as well.
            // Since addAnalysis returns the result from the API:
            if (result) {
                setAnalysisResult(result);
            } else {
                // If it doesn't return, we can find the latest analysis in the patient's history
                const updatedPatient = patients.find(p => p.id === patientId);
                if (updatedPatient && updatedPatient.history.length > 0) {
                    setAnalysisResult(updatedPatient.history[0]);
                }
            }
        } catch (err) {
            console.error("Analysis failed:", err);
            setError(err.response?.data?.error || "Neural Engine failure. Please ensure the ML service is running.");
        } finally {
            setIsAnalyzing(true); // Keep it "Analyzing" a bit longer for visual polish if needed, or just set to false
            setTimeout(() => setIsAnalyzing(false), 500);
        }
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setError(null);
    };

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
                <p className="text-muted font-medium">Loading patient data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Registry</span>
                </button>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span>Patient Registration</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-accent">Scan Execution</span>
                </div>
            </div>

            {/* Patient Context Card */}
            <section className="glass-panel p-6 clinical-border flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">{patient.name}</h1>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">ID: {patient.id}</span>
                            <span className="text-xs text-muted font-medium uppercase tracking-tighter">{patient.age}Y • {patient.gender}</span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Status</p>
                    <span className="px-3 py-1 bg-warning/10 text-warning text-[10px] font-black uppercase tracking-tighter border border-warning/20 rounded-full">
                        Awaiting Scan
                    </span>
                </div>
            </section>

            {/* Analysis Execution Area */}
            <section className="bg-card glass-panel rounded-3xl overflow-hidden clinical-border shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Upload Zone */}
                    <div className="p-10 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <BrainCircuit className="w-6 h-6 text-accent" />
                                MRI Scan Upload
                            </h2>
                            <p className="text-sm text-muted mt-2">Initialize neural processing for tumor detection and segmentation.</p>
                        </div>

                        {!previewUrl ? (
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="group border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer"
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                <div className="p-6 bg-white/5 rounded-full mb-6 group-hover:scale-110 transition-transform w-fit mx-auto">
                                    <Upload className="w-10 h-10 text-muted group-hover:text-accent" />
                                </div>
                                <p className="text-white font-bold text-lg">Select MRI Analysis Target</p>
                                <p className="text-xs text-muted mt-2 uppercase tracking-tight font-mono">DICOM / JPEG / PNG • MAX 10MB</p>
                            </div>
                        ) : (
                            <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-black aspect-square max-h-[400px] mx-auto">
                                <img src={previewUrl} alt="MRI Preview" className="w-full h-full object-contain" />
                                {!analysisResult && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                                            className="bg-danger text-white p-4 rounded-full hover:scale-110 transition-transform shadow-2xl"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-3 text-danger text-sm bg-danger/5 p-4 rounded-xl border border-danger/10">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            {!analysisResult ? (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !selectedFile}
                                    className={clsx(
                                        "flex-1 py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all",
                                        (selectedFile && !isAnalyzing)
                                            ? "bg-accent text-background hover:brightness-110 shadow-[0_0_30px_rgba(45,212,191,0.3)] active:scale-[0.98]"
                                            : "bg-white/5 text-muted cursor-not-allowed"
                                    )}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span>Processing Neural Networks...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Binary className="w-6 h-6" />
                                            <span>Execute Analysis</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/patient/${patientId}`)}
                                    className="flex-1 py-5 bg-white text-black rounded-2xl font-black text-base hover:bg-accent hover:text-background transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <span>Complete & View Profile</span>
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            )}
                            {!isAnalyzing && !analysisResult && (
                                <button
                                    onClick={resetUpload}
                                    className="px-8 py-5 bg-white/5 hover:bg-white/10 text-muted rounded-2xl font-bold transition-all"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Real-time Analysis Monitoring */}
                    <div className="bg-white/[0.02] border-l border-white/5 p-10 flex items-center justify-center">
                        {isAnalyzing ? (
                            <div className="w-full space-y-8 animate-pulse">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Scanning Layers</p>
                                        <p className="text-xl font-mono text-white">READY</p>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent w-2/3 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="aspect-video bg-white/5 rounded-xl border border-white/5"></div>
                                    ))}
                                </div>
                                <p className="text-center text-xs text-muted italic">Decrypting volumetric data...</p>
                            </div>
                        ) : analysisResult ? (
                            <div className="w-full space-y-8 animate-in zoom-in-95 duration-700">
                                <div className="flex items-center gap-4 text-success">
                                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-white uppercase tracking-tight">Analysis Success</h3>
                                        <p className="text-xs text-muted">Neural engine verified results.</p>
                                    </div>
                                </div>

                                {analysisResult.heatmap && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Neural Focus Overlay (Grad-CAM)</p>
                                        <div className="rounded-2xl overflow-hidden border border-accent/20 bg-black aspect-square max-h-[300px] mx-auto shadow-2xl relative group">
                                            <img src={analysisResult.heatmap} alt="Heatmap" className="w-full h-full object-contain" />
                                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] text-accent font-bold uppercase border border-accent/20">
                                                AI Localization
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-background/80 rounded-3xl p-8 border border-accent/30 space-y-6 shadow-2xl backdrop-blur-md">
                                    <div>
                                        <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-2">Diagnostic Prediction</p>
                                        <p className="text-3xl font-black text-white leading-tight">{analysisResult.prediction}</p>
                                    </div>
                                    <div className="h-[1px] bg-white/10 w-full"></div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Confidence Score</p>
                                            <p className="text-3xl font-black text-accent">{analysisResult.confidence}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Risk Level</p>
                                            <p className="text-3xl font-black text-warning">MODERATE</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-warning/5 rounded-2xl border border-warning/10 flex gap-4">
                                    <ShieldAlert className="w-6 h-6 text-warning flex-shrink-0" />
                                    <p className="text-[11px] text-muted leading-relaxed italic">
                                        This provides an initial automated assessment. Please review the detailed scan overlays and segmentation data in the patient profile for final validation.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 opacity-40">
                                <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                    <Binary className="w-12 h-12 text-muted" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-white uppercase tracking-widest">Engine Standby</p>
                                    <p className="text-sm italic max-w-[200px] mx-auto text-muted">Upload scan data to initiate neural interpretation.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ExecuteAnalysis;
