import EditableAvatar from './EditableAvatar';
import useStore from '../store/useStore';

const Topbar = () => {
    const { user, updateDoctorAvatar } = useStore();

    return (
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-10 relative z-10 backdrop-blur-2xl">
            <div className="flex flex-col">
                <h2 className="text-white/90 text-[11px] font-bold uppercase tracking-[0.25em] mb-0.5">System Hub</h2>
                <span className="text-accent/80 text-xs font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    Clinical Decision Support Active
                </span>
            </div>

            {user && (
                <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end text-right">
                        <span className="text-[13px] font-semibold text-white tracking-wide">{user.name}</span>
                        <span className="text-[10px] text-muted/70 font-medium uppercase tracking-wider">{user.designation}</span>
                    </div>
                    <EditableAvatar
                        currentImage={user.avatar}
                        onUpdate={updateDoctorAvatar}
                        size="sm"
                        className="!w-11 !h-11 rounded-xl shadow-clinical border-white/10"
                    />
                </div>
            )}
        </header>
    );
};

export default Topbar;
