import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, ShieldAlert } from 'lucide-react';
import useStore from '../store/useStore';

const Login = () => {
    const navigate = useNavigate();
    const setUser = useStore((state) => state.setUser);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('clarity_users') || '[]');
        const user = users.find(u => u.email === formData.email && u.password === formData.password);

        if (user) {
            setUser(user);
            navigate('/dashboard');
        } else {
            setError('Invalid clinical credentials provided.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-accent/10 rounded-xl mb-4">
                        <Activity className="w-10 h-10 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">CLARITY</h1>
                    <p className="text-muted text-center italic">Advanced Medical Image Analysis System</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3 text-danger text-sm">
                        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted uppercase tracking-wider">Clinical ID (Email)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-muted" />
                            <input
                                required
                                type="email"
                                className="w-full bg-card clinical-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-muted uppercase tracking-wider">Password</label>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted" />
                            <input
                                required
                                type="password"
                                className="w-full bg-card clinical-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-background font-bold py-3 rounded-lg transition-all transform active:scale-[0.98]"
                    >
                        Authenticate
                    </button>
                </form>

                <p className="mt-8 text-center text-muted text-sm border-t border-white/5 pt-6">
                    New practitioner? <Link to="/register" className="text-accent hover:underline">Create Clinical Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
