import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ScanLine, LogOut, Activity } from 'lucide-react';
import useStore from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Patients', path: '/patients', icon: Users },
        { name: 'Analyze', path: '/analyze', icon: ScanLine },
    ];

    const logout = useStore((state) => state.logout);
    const navigate = useNavigate();


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-68 glass-panel border-r border-white/5 flex flex-col relative overflow-hidden backdrop-blur-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[100px] pointer-events-none" />

            <div className="p-8 flex items-center gap-3 relative">
                <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/20 shadow-accent-glow">
                    <Activity className="w-6 h-6 text-accent" />
                </div>
                <div>
                    <span className="text-2xl font-bold tracking-tighter text-white glow-text">CLARITY</span>
                    <div className="h-0.5 w-8 bg-accent/50 rounded-full mt-0.5" />
                </div>
            </div>

            <nav className="flex-1 px-6 py-6 space-y-2 relative overflow-y-auto customize-scrollbar">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted/60 font-semibold mb-4 px-2">
                    Main Menu
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                            isActive
                                ? "bg-accent/15 text-accent font-semibold border border-accent/20 shadow-accent-glow"
                                : "text-muted/80 hover:bg-white/5 hover:text-white border border-transparent"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                            "isActive" ? "text-accent" : "text-muted/60 group-hover:text-white"
                        )} />
                        <span className="tracking-wide text-sm">{item.name}</span>
                        {/* Hover Highlight */}
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </NavLink>
                ))}

            </nav>

            <div className="p-6 border-t border-white/5 relative">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-muted/80 hover:bg-danger/10 hover:text-danger hover:border-danger/20 border border-transparent transition-all duration-300 group"
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">System Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
