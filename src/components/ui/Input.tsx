import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    isSecret?: boolean; // Toggles masking
    error?: string;
    success?: boolean;
    leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    isSecret,
    error,
    success,
    leftIcon,
    className = '',
    type = "text",
    ...props
}) => {
    const [showSecret, setShowSecret] = useState(false);

    // If isSecret is true, we toggle between 'text' and 'password'
    const inputType = isSecret ? (showSecret ? 'text' : 'password') : type;

    return (
        <div className={`w-full ${className}`}>
            {label && <label className="block text-[10px] text-muted mb-2 font-bold uppercase tracking-widest">{label}</label>}

            <div className="relative group">
                {/* Left Icon */}
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary">
                        {leftIcon}
                    </div>
                )}

                <input
                    type={inputType}
                    className={`
            w-full bg-surface/50 border-2 rounded-xl py-3.5 text-sm text-text 
            placeholder:text-muted/50 focus:outline-none transition-all duration-300 font-medium
            ${leftIcon ? 'pl-10 pr-10' : 'pl-4 pr-10'}
            ${error
                            ? 'border-danger/50 focus:border-danger bg-danger/5 shadow-[0_0_15px_-5px_theme(colors.danger)]'
                            : success
                                ? 'border-success/50 focus:border-success bg-success/5 shadow-[0_0_15px_-5px_theme(colors.success)]'
                                : 'border-white/5 focus:border-primary/50 focus:shadow-[0_0_15px_-5px_theme(colors.primary)]'
                        }
          `}
                    {...props}
                />

                {/* Right Icon Actions */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted">

                    {isSecret && (
                        <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="hover:text-primary transition-colors focus:outline-none p-1"
                        >
                            {showSecret ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                        </button>
                    )}

                    {error && <AlertCircle size={18} className="text-danger" />}
                    {success && <CheckCircle2 size={18} className="text-success" />}

                </div>
            </div>

            {error && <p className="text-[10px] font-medium text-danger mt-2 ml-1 animate-fade-in">{error}</p>}
        </div>
    );
};
