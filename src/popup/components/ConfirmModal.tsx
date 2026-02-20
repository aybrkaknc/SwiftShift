/**
 * ConfirmModal
 * Genel amaçlı onay modalı.
 */

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../utils/useTranslation';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    onConfirm,
    onCancel,
    variant = 'danger'
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const Icon = variant === 'danger' ? Trash2 : AlertTriangle;
    const colorClass = variant === 'danger' ? 'danger' : 'warning';

    return (
        <div
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl text-center space-y-4"
            >
                <div className={`w-12 h-12 bg-${colorClass}/10 text-${colorClass} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon size={24} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">{title}</h3>
                    <p className="text-[11px] text-muted leading-relaxed">{message}</p>
                </div>
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 text-xs font-bold text-muted hover:bg-white/5 rounded-full transition-all"
                    >
                        {t.confirmModal.cancel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 bg-${colorClass} text-white text-xs font-bold rounded-full hover:bg-${colorClass}/80 transition-all shadow-lg shadow-${colorClass}/20`}
                    >
                        {confirmText || t.confirmModal.clearAll}
                    </button>
                </div>
            </div>
        </div>
    );
};
