import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, Search, Activity, User } from 'lucide-react';
import useStore from '../store/useStore';
import { clsx } from 'clsx';
import EditableAvatar from '../components/EditableAvatar';

const Patients = () => {
    const { patients, updatePatientAvatar } = useStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="border-b border-white/5 pb-8 text-left">
                <h1 className="text-4xl font-display font-extrabold text-white tracking-tighter flex items-center gap-4 glow-text mb-2">
                    <Users className="w-10 h-10 text-accent" />
                    Patient Registry
                </h1>
                <p className="text-muted/60 text-sm font-medium max-w-xl">
                    Comprehensive clinical database management system. Access and organize encrypted patient health records with clinical precision.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="relative group max-w-2xl">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-muted/40 group-focus-within:text-accent transition-colors duration-300" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name or clinical identity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-5 pl-14 pr-8 text-[15px] text-white placeholder:text-muted/30 focus:border-accent/30 focus:bg-white/[0.05] outline-none transition-all duration-300 shadow-xl"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-panel border border-white/10 rounded-lg text-[10px] font-bold text-muted/40 uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
                    ID Search
                </div>
            </div>

            {/* Patient Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-card rounded-3xl border border-white/5">
                        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-muted/30" />
                        </div>
                        <p className="text-muted italic">No patients found matching your search.</p>
                    </div>
                ) : (
                    filteredPatients.map(p => (
                        <button
                            key={p.id}
                            onClick={() => navigate(`/patient/${p.id}`)}
                            className="glass-card p-7 flex flex-col gap-6 text-left hover:border-accent/40 group relative overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/[0.02] blur-[40px] rounded-full translate-x-10 translate-y-10 group-hover:bg-accent/[0.05] transition-all duration-500" />

                            <div className="flex items-start justify-between relative z-10">
                                <EditableAvatar
                                    currentImage={p.avatar}
                                    onUpdate={(avatar) => updatePatientAvatar(p.id, avatar)}
                                    size="md"
                                    className="shadow-clinical"
                                />
                                <div className="text-right">
                                    <span className="text-[10px] bg-panel px-2.5 py-1.5 rounded-lg border border-white/5 text-muted/60 uppercase font-bold tracking-widest">#{String(p.id).slice(-4)}</span>
                                    <div className={clsx(
                                        "text-[10px] uppercase font-black mt-3 tracking-widest",
                                        p.status === 'Verified' ? 'text-success shadow-[0_0_10px_rgba(0,200,83,0.3)]' : 'text-warning'
                                    )}>
                                        {p.status || 'Pending'}
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-display font-extrabold text-white tracking-tight group-hover:text-accent transition-colors duration-300">{p.name || 'Unnamed Patient'}</h3>
                                <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-muted/50 uppercase tracking-widest">
                                    <span>{p.age ? `${p.age} years` : 'Age N/A'}</span>
                                    <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                                    <span>{p.gender || 'Gender'}</span>
                                </div>
                            </div>

                            <div className="pt-6 mt-2 border-t border-white/[0.05] flex items-center justify-between text-muted relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-accent/5 rounded-lg group-hover:bg-accent/10 transition-colors">
                                        <Activity className="w-4 h-4 text-accent/60" />
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted/40 group-hover:text-muted/70 transition-colors">{p.history?.length || 0} Investigations</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-all duration-300">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default Patients;
