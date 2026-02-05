import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { User, Calendar, FileText, ChevronRight, AlertCircle, Loader2, CheckCircle2, Binary, BrainCircuit } from 'lucide-react';
import { clsx } from 'clsx';
import EditableAvatar from '../components/EditableAvatar';

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const patients = useStore((state) => state.patients);
    const addAnalysis = useStore((state) => state.addAnalysis);
    const updatePatientNotes = useStore((state) => state.updatePatientNotes);
    const patient = patients.find(p => p.id === id);
    const updatePatientAvatar = useStore((state) => state.updatePatientAvatar);

    const [notes, setNotes] = useState(patient?.notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>Patient record not found in system.</p>
                <button onClick={() => navigate('/dashboard')} className="mt-4 text-accent hover:underline">Return to Dashboard</button>
            </div>
        );
    }

    const handleSaveNotes = () => {
        setIsSavingNotes(true);
        setTimeout(() => {
            updatePatientNotes(patient.id, notes);
            setIsSavingNotes(false);
        }, 600);
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Patient Header */}
            <section className="bg-card glass-panel p-8 rounded-2xl clinical-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <EditableAvatar
                        currentImage={patient.avatar}
                        onUpdate={(avatar) => updatePatientAvatar(patient.id, avatar)}
                        size="lg"
                        className="shadow-clinical"
                    />
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-white">{patient.name}</h1>
                            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest leading-relaxed">Active Case</span>
                        </div>
                        <p className="text-muted flex items-center gap-4 text-sm">
                            <span>Patient ID: #{String(patient.id).padStart(4, '0')}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span>{patient.age} Years Old</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span>{patient.gender}</span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/analyze/${patient.id}`)}
                    className="flex items-center gap-2 px-5 py-3 bg-accent text-panel rounded-xl font-bold text-sm hover:bg-accent/90 transition-all shadow-lg active:scale-95 flex-shrink-0"
                >
                    <BrainCircuit className="w-5 h-5" />
                    <span>New Scan Analysis</span>
                </button>
            </section>

            {/* Note and Bio Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Clinical Notes */}
                <section className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-accent" />
                            <h2 className="text-xl font-bold text-white">Clinical Notes</h2>
                        </div>
                        {patient.notes !== notes && (
                            <span className="text-[10px] text-accent uppercase tracking-widest animate-pulse font-bold">Unsaved Changes</span>
                        )}
                    </div>
                    <div className="bg-card glass-panel rounded-2xl p-6 clinical-border shadow-2xl space-y-4">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Type session observations, treatment plans, or specific patient concerns here..."
                            className="w-full h-48 bg-background/50 border border-white/5 rounded-xl p-6 text-white text-sm placeholder:text-muted/30 focus:border-accent/30 outline-none transition-all resize-none leading-relaxed"
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes || patient.notes === notes}
                                className={clsx(
                                    "px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                                    (patient.notes !== notes && !isSavingNotes)
                                        ? "bg-accent text-background hover:brightness-110 shadow-lg active:scale-95"
                                        : "bg-white/5 text-muted cursor-not-allowed"
                                )}
                            >
                                {isSavingNotes ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Save Clinical Notes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Patient Bio-Metrics */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <Binary className="w-5 h-5 text-accent" />
                        <h2 className="text-xl font-bold text-white">Bio-Metrics</h2>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl clinical-border shadow-2xl space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-background rounded-xl border border-white/5 flex justify-between items-center group">
                                <span className="text-xs text-muted uppercase tracking-widest font-bold">Blood Group</span>
                                <span className="text-white font-mono bg-white/5 px-3 py-1 rounded">B Positive</span>
                            </div>
                            <div className="p-4 bg-background rounded-xl border border-white/5 flex justify-between items-center group">
                                <span className="text-xs text-muted uppercase tracking-widest font-bold">Last Analysis</span>
                                <span className="text-white font-mono bg-white/5 px-3 py-1 rounded">{patient.history[0]?.date || 'None'}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Diagnostic Context</h3>
                            <div className="h-20 flex items-end gap-1 opacity-20 group">
                                {[...Array(15)].map((_, i) => (
                                    <div key={i} className="flex-1 bg-accent hover:opacity-100 transition-opacity" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Analysis History */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <FileText className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-bold text-white">Clinical History</h2>
                </div>

                <div className="bg-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-muted text-xs uppercase tracking-widest font-bold">
                                <th className="px-6 py-4 border-b border-white/5">Date</th>
                                <th className="px-6 py-4 border-b border-white/5">Result / Diagnosis</th>
                                <th className="px-6 py-4 text-center border-b border-white/5">Confidence</th>
                                <th className="px-6 py-4 text-center border-b border-white/5">Difficulty</th>
                                <th className="px-6 py-4 border-b border-white/5">Clinical Remarks</th>
                                <th className="px-6 py-4 border-b border-white/5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {patient.history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted italic bg-white/[0.01]">
                                        No previous scan analyses recorded for this patient.
                                    </td>
                                </tr>
                            ) : (
                                patient.history.map((record, index) => (
                                    <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                {record.scanImage ? (
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black flex-shrink-0">
                                                        <img src={record.scanImage} alt="Scan" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-dashed border-white/10 flex-shrink-0">
                                                        <Binary className="w-5 h-5 text-muted/30" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-white">
                                                    <Calendar className="w-4 h-4 text-muted" />
                                                    {record.date || (record.timestamp ? new Date(record.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className={clsx("font-bold",
                                                    (record.prediction?.match(/Tumor|Malignant|Glioblastoma|Lesion/i) || record.risk === 'High') ? 'text-danger' : 'text-primary'
                                                )}>
                                                    {record.prediction}
                                                </span>
                                                <span className="text-[10px] text-muted uppercase tracking-tighter">Diagnostic Output</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex flex-col items-center min-w-[60px]">
                                                <span className="text-sm font-bold text-white tracking-tight">{record.confidence}%</span>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5 border border-white/5">
                                                    <div
                                                        className="h-full bg-accent transition-all duration-1000"
                                                        style={{ width: `${record.confidence}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-block">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                                                    (record.difficulty === 'High' || record.difficulty > 7) ? 'border-warning text-warning bg-warning/5' : 'border-white/10 text-muted bg-white/5'
                                                )}>
                                                    {typeof record.difficulty === 'string' ? record.difficulty : `DS: ${record.difficulty}/10`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-muted/80 max-w-xs leading-relaxed italic" title={record.notes}>
                                                {record.notes || 'No notes provided'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-all transform hover:scale-110 active:scale-95">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    );
};

export default PatientProfile;
