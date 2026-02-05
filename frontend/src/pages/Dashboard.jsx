import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { User, ClipboardList, CheckCircle2, Clock, ChevronDown, MapPin, Building, Settings, Save, X, Edit3 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import EditableAvatar from '../components/EditableAvatar';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Fixed StatCard with robust rendering
const StatCard = ({ title, count, icon: Icon, colorClass, patientsList, id, openDropdown, setOpenDropdown, navigate }) => {
    const isOpen = openDropdown === id;

    return (
        <div className={clsx(
            "glass-card p-7 relative group transition-all duration-300",
            isOpen ? "z-50 ring-1 ring-white/10 shadow-2xl bg-card/60" : "z-10"
        )}>
            {/* Background Glow */}
            <div className={clsx("absolute -top-10 -right-10 w-40 h-40 opacity-[0.03] transition-transform duration-500 group-hover:scale-150 pointer-events-none rounded-full", colorClass)} style={{ backgroundColor: 'currentColor' }}></div>

            <div className="flex items-center gap-5 mb-6 relative z-10">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.08] transition-colors">
                    <Icon className={clsx("w-6 h-6", colorClass)} />
                </div>
                <div>
                    <h3 className="text-muted font-display text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{title}</h3>
                    <p className="text-3xl font-display font-bold text-white tracking-tight">{count}</p>
                </div>
            </div>

            <div className="relative z-20">
                <button
                    onClick={() => setOpenDropdown(isOpen ? null : id)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl text-[13px] text-white/80 font-medium transition-all border border-white/[0.05] group/btn"
                >
                    <span className="group-hover/btn:text-white transition-colors">{title}</span>
                    <ChevronDown className={clsx("w-4 h-4 transition-transform duration-300", isOpen && "rotate-180", "group-hover/btn:text-white")} />
                </button>

                {isOpen && (
                    <div className="absolute top-14 left-0 w-full bg-panel/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-64 overflow-y-auto customize-scrollbar rounded-2xl">
                            {(!patientsList || patientsList.length === 0) ? (
                                <div className="p-6 text-muted/50 text-xs text-center italic font-medium">No records matching "{title}"</div>
                            ) : (
                                <div className="flex flex-col">
                                    {patientsList.map((p, idx) => (
                                        <button
                                            key={`${id}-${p.id || idx}-${idx}`}
                                            onClick={() => {
                                                setOpenDropdown(null);
                                                navigate(`/patient/${p.id}`);
                                            }}
                                            className="w-full text-left px-5 py-4 hover:bg-white/[0.05] group/item transition-all border-b border-white/[0.03] last:border-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-semibold text-white/90 group-hover/item:text-accent transition-all">{p.name || 'Unknown Patient'}</span>
                                                    <span className="text-[10px] text-muted/40 font-mono mt-0.5">#{String(p.id).slice(-4)}</span>
                                                </div>
                                                <div className={clsx("w-1.5 h-1.5 rounded-full", colorClass)} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, patients, updateUserProfile } = useStore();
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        designation: user?.designation || '',
        hospitalName: user?.hospitalName || '',
        hospitalAddress: user?.hospitalAddress || '',
        avatar: user?.avatar || null,
        education: user?.education || 'MBBS, MD (Radiology)',
        experience: user?.experience || '8+ years of clinical experience'
    });

    const handleSave = async () => {
        await updateUserProfile(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({
            name: user?.name || '',
            designation: user?.designation || '',
            hospitalName: user?.hospitalName || '',
            hospitalAddress: user?.hospitalAddress || '',
            avatar: user?.avatar || null,
            education: user?.education || 'MBBS, MD (Radiology)',
            experience: user?.experience || '8+ years of clinical experience'
        });
        setIsEditing(false);
    };

    // Derive stats - Clinically accurate filters
    // A case is "Seen" if it is Verified OR has analysis history
    const verifiedPatients = patients.filter(p => p.status === 'Verified' || (p.history && p.history.length > 0));

    // A case is "Unseen" if it is NOT Verified AND has NO analysis history
    const pendingPatients = patients.filter(p => p.status !== 'Verified' && (!p.history || p.history.length === 0));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section with Doctor Profile */}
            <section className="glass-card p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
                    <div className="relative group">
                        {isEditing ? (
                            <EditableAvatar
                                size="xl"
                                currentImage={editData.avatar}
                                onUpdate={(img) => setEditData({ ...editData, avatar: img })}
                                className="!rounded-3xl shadow-clinical"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-3xl bg-panel border border-white/10 flex items-center justify-center shadow-clinical group overflow-hidden">
                                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <User className="w-14 h-14 text-accent transition-transform duration-500 group-hover:scale-110" />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-5">
                        {isEditing ? (
                            <div className="space-y-4 max-w-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted/40 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all"
                                            placeholder="Doctor Name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted/40 uppercase tracking-widest ml-1">Designation</label>
                                        <input
                                            type="text"
                                            value={editData.designation}
                                            onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all"
                                            placeholder="Neurosurgeon / MD"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted/40 uppercase tracking-widest ml-1">Hospital Name</label>
                                        <div className="relative">
                                            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/40" />
                                            <input
                                                type="text"
                                                value={editData.hospitalName}
                                                onChange={(e) => setEditData({ ...editData, hospitalName: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all"
                                                placeholder="Hospital Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted/40 uppercase tracking-widest ml-1">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/40" />
                                            <input
                                                type="text"
                                                value={editData.hospitalAddress}
                                                onChange={(e) => setEditData({ ...editData, hospitalAddress: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted/40 uppercase tracking-widest ml-1">Education</label>
                                        <input
                                            type="text"
                                            value={editData.education}
                                            onChange={(e) => setEditData({ ...editData, education: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all"
                                            placeholder="MBBS, MD..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted/40 uppercase tracking-widest ml-1">Experience</label>
                                        <input
                                            type="text"
                                            value={editData.experience}
                                            onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all"
                                            placeholder="8+ years..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-6 py-2 bg-accent text-panel rounded-xl text-xs font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-6 py-2 bg-white/[0.05] text-white/70 rounded-xl text-xs font-bold hover:bg-white/[0.1] transition-all border border-white/10"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-4xl font-display font-extrabold text-white tracking-tighter glow-text leading-tight">{user?.name}</h1>
                                        <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">Attending Physician</span>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="ml-2 p-2 hover:bg-white/5 rounded-full transition-colors group/edit"
                                            title="Edit Profile"
                                        >
                                            <Edit3 className="w-4 h-4 text-muted/40 group-hover/edit:text-accent" />
                                        </button>
                                    </div>
                                    <p className="text-medical-teal font-medium tracking-[0.2em] uppercase text-[11px] opacity-80 mb-3">{user?.designation}</p>

                                    <div className="flex flex-col gap-1 mb-4">
                                        <p className="text-sm font-semibold text-white/90">{user?.education || 'MBBS, MD (Radiology)'}</p>
                                        <p className="text-xs text-muted/60 font-medium">{user?.experience || '8+ years of clinical experience'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-8 text-muted/60 text-xs font-medium">
                                    <div className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                                        <Building className="w-4 h-4 text-accent/60" />
                                        <span>{user?.hospitalName}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                                        <MapPin className="w-4 h-4 text-accent/60" />
                                        <span>{user?.hospitalAddress}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="bg-panel/40 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/[0.08] text-center min-w-[180px] shadow-clinical">
                            <p className="text-[10px] text-muted/60 font-bold uppercase tracking-[0.2em] mb-2">Registry Volume</p>
                            <p className="text-4xl font-black text-white tracking-tighter">{patients.length}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Section with Elevated Stacking Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-30">
                <StatCard
                    id="verified"
                    title="Seen Cases"
                    count={verifiedPatients.length}
                    icon={CheckCircle2}
                    colorClass="text-success"
                    patientsList={verifiedPatients}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    navigate={navigate}
                />
                <StatCard
                    id="pending"
                    title="Unseen Cases"
                    count={pendingPatients.length}
                    icon={Clock}
                    colorClass="text-warning"
                    patientsList={pendingPatients}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    navigate={navigate}
                />
            </div>

            {/* System Status Section */}
            <section className="glass-card p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-accent rounded-full" />
                        <h2 className="text-lg font-bold text-white/90 tracking-tight">System Infrastructure</h2>
                    </div>
                    <span className="text-[10px] font-bold text-muted/40 uppercase tracking-widest">V 2.4.0</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-panel/30 rounded-2xl border border-white/[0.05] flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-muted/50 font-bold uppercase tracking-widest mb-1.5">Neural Core</p>
                            <span className="text-sm font-semibold text-white/90">Operational</span>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_10px_rgba(0,200,83,0.5)] animate-pulse" />
                    </div>

                    <div className="p-5 bg-panel/30 rounded-2xl border border-white/[0.05] flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-display text-muted/50 font-bold uppercase tracking-widest mb-1.5">Cloud Vault</p>
                            <span className="text-sm font-semibold text-white/90">Synchronized</span>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_10px_rgba(0,200,83,0.5)]" />
                    </div>

                    <div className="p-5 bg-panel/30 rounded-2xl border border-white/[0.05] flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-muted/50 font-bold uppercase tracking-widest mb-1.5">Encryption</p>
                            <span className="text-sm font-semibold text-white/90">FIPS 140-2</span>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(0,209,255,0.5)]" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
