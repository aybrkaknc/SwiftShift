import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "relative w-full rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-3 text-sm tracking-wide overflow-hidden";

    const variants = {
        primary: "bg-gradient-to-r from-primary to-secondary text-background shadow-lg shadow-primary/20 hover:shadow-primary/40 text-black font-bold",
        secondary: "border border-primary/20 bg-surface/50 text-text hover:bg-surface hover:border-primary/50",
        danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
        ghost: "bg-transparent text-muted hover:text-text"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                </div>
            ) : children}
        </button>
    );
};
