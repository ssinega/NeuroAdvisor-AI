import React, { useRef, useState } from 'react';
import { Pencil, User, Loader2, Camera } from 'lucide-react';
import { clsx } from 'clsx';

const EditableAvatar = ({ currentImage, onUpdate, size = "md", className, editable = true }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-16 h-16",
        lg: "w-24 h-24",
        xl: "w-32 h-32"
    };

    const iconClasses = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("File size exceeds 2MB limit.");
            return;
        }

        // Validate file type
        if (!file.type.match('image.*')) {
            alert("Please select a valid image file (JPG, PNG, WEBP).");
            return;
        }

        const reader = new FileReader();
        reader.onloadstart = () => setIsUploading(true);
        reader.onloadend = () => {
            const base64 = reader.result;
            setPreviewUrl(base64);
            onUpdate(base64);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const displayImage = previewUrl || currentImage;

    return (
        <div className={clsx(
            "relative group rounded-full bg-panel border-2 border-white/10 overflow-hidden flex items-center justify-center transition-all duration-300",
            editable && "hover:border-accent/40 hover:shadow-accent-glow cursor-pointer",
            sizeClasses[size],
            className
        )}
            onClick={(e) => {
                if (editable && !isUploading) {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                }
            }}
        >
            {displayImage ? (
                <img
                    src={displayImage}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                />
            ) : (
                <User className={clsx("text-muted/40", iconClasses[size])} />
            )}

            {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
            )}

            {editable && !isUploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <Camera className="w-5 h-5 text-white" />
                    {size === 'lg' || size === 'xl' ? (
                        <span className="text-[8px] font-bold text-white uppercase tracking-widest">Update</span>
                    ) : null}
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
            />
        </div>
    );
};

export default EditableAvatar;
