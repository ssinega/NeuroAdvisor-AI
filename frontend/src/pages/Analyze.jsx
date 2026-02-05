import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, BrainCircuit, Activity, User, Hash, Microscope } from 'lucide-react';
import useStore from '../store/useStore';
import { clsx } from 'clsx';

export default function Analyze() {
    const { addPatient } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male'
    });
    const navigate = useNavigate();

    async function handleAnalyze() {
        if (!formData.name || !formData.age) return;

        const id = Date.now().toString();
        try {
            await addPatient({
                id,
                ...formData,
                status: 'Pending',
                history: []
            });
            navigate(`/analyze/${id}`);
        } catch (error) {
            console.error("Failed to add patient:", error);
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 py-12">
            <div className="text-center space-y-2">
                <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Microscope className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl font-bold text-white">New MRI Analysis</h1>
                <p className="text-muted">Register a new patient to initiate neural diagnostic scanning.</p>
            </div>

            <div className="bg-card glass-panel rounded-3xl p-8 clinical-border shadow-2xl space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3 h-3" /> Full Name
                        </label>
                        <input
                            className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                            placeholder="e.g. John Doe"
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                <Hash className="w-3 h-3" /> Age
                            </label>
                            <input
                                type="number"
                                className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                placeholder="Years"
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Gender
                            </label>
                            <select
                                className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none transition-all appearance-none cursor-pointer"
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={!formData.name || !formData.age}
                    className={clsx(
                        "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                        formData.name && formData.age ? "bg-accent text-background hover:brightness-110" : "bg-white/5 text-muted cursor-not-allowed"
                    )}
                >
                    <BrainCircuit className="w-5 h-5" />
                    Initiate Scan & Analysis
                </button>
            </div>

            <div className="p-4 bg-warning/5 border border-warning/10 rounded-xl flex gap-3 italic">
                <Activity className="w-5 h-5 text-warning flex-shrink-0" />
                <p className="text-[10px] text-warning/80 uppercase tracking-tight">Security Protocol ACTIVE: Patient data is encrypted and anonymized before processing.</p>
            </div>
        </div>
    );
}
