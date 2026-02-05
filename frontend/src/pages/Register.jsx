import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, User, Building, MapPin } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        hospitalName: '',
        hospitalAddress: '',
        email: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('clarity_users') || '[]');
        users.push(formData);
        localStorage.setItem('clarity_users', JSON.stringify(users));
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-2xl glass-panel rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-accent/10 rounded-xl mb-4">
                        <Activity className="w-10 h-10 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">CLARITY</h1>
                    <p className="text-muted">Register for a Professional Clinician Account</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-muted" />
                            <input
                                required
                                type="text"
                                placeholder="Dr. John Doe"
                                className="w-full bg-card clinical-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Designation</label>
                        <input
                            required
                            type="text"
                            placeholder="Senior Radiologist"
                            className="w-full bg-card clinical-border rounded-lg py-2.5 px-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Hospital Name</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-3 w-5 h-5 text-muted" />
                            <input
                                required
                                type="text"
                                placeholder="City General Hospital"
                                className="w-full bg-card clinical-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                value={formData.hospitalName}
                                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Hospital Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted" />
                            <input
                                required
                                type="text"
                                placeholder="123 Clinical Way, NY"
                                className="w-full bg-card clinical-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                value={formData.hospitalAddress}
                                onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-muted" />
                            <input
                                required
                                type="email"
                                placeholder="johndoe@hospital.com"
                                className="w-full bg-card clinical-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted" />
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-card clinical-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90 text-background font-bold py-3 rounded-lg transition-all transform active:scale-[0.98]"
                        >
                            Initialize Account
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-muted text-sm">
                    Existing practitioner? <Link to="/login" className="text-accent hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
