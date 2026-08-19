// src/shared/components/ui/FormInput.tsx
import React from 'react';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
                                                        label,
                                                        error,
                                                        className = '',
                                                        ...props
                                                    }) => {
    const theme = useTheme();

    return (
        <div className="space-y-2">
            {label && (
                <label className={`text-sm font-medium ${theme.secondaryText}`}>
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 border ${theme.border} rounded-xl transition-all 
          ${theme.inputBg} text-white placeholder:text-[#c9a84c]/30 
          focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/20 focus:border-[#d4af37]
          ${error ? 'border-red-500/50 ring-2 ring-red-500/20' : ''}
          ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

export const FormTextArea: React.FC<{
    label?: string;
    error?: string;
    className?: string;
    rows?: number;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
}> = ({ label, error, className = '', rows = 3, ...props }) => {
    const theme = useTheme();

    return (
        <div className="space-y-2">
            {label && (
                <label className={`text-sm font-medium ${theme.secondaryText}`}>
                    {label}
                </label>
            )}
            <textarea
                rows={rows}
                className={`w-full px-4 py-3 border ${theme.border} rounded-xl transition-all 
          ${theme.inputBg} text-white placeholder:text-[#c9a84c]/30 
          focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/20 focus:border-[#d4af37]
          ${error ? 'border-red-500/50 ring-2 ring-red-500/20' : ''}
          ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

export const FormButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    disabled?: boolean;
    className?: string;
    loading?: boolean;
}> = ({
          children,
          onClick,
          type = 'button',
          variant = 'primary',
          disabled = false,
          className = '',
          loading = false,
      }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-[#c9a84c] to-[#d4af37] text-[#0a1628] font-bold hover:from-[#d4af37] hover:to-[#c9a84c] shadow-lg shadow-[#c9a84c]/20 hover:shadow-[#c9a84c]/40',
        secondary: 'bg-[#0d1f3c] text-[#d4af37] border border-[#c9a84c]/30 hover:bg-[#c9a84c]/10',
        outline: 'border border-[#c9a84c]/30 text-[#c9a84c]/80 hover:bg-[#c9a84c]/10 hover:text-[#d4af37]',
        danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
        ${variants[variant]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
        >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                </>
            ) : children}
        </button>
    );
};