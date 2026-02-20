/**
 * AddDestinationModal
 * Yeni hedef ekleme modalı.
 */

import React, { useState } from 'react';
import { useTranslation } from '../../utils/useTranslation';

interface AddDestinationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (chatId: string, title: string) => Promise<void>;
}

export const AddDestinationModal: React.FC<AddDestinationModalProps> = ({
    isOpen,
    onClose,
    onAdd
}) => {
    const { t } = useTranslation();
    const [chatId, setChatId] = useState('');
    const [title, setTitle] = useState('');
    const [validationError, setValidationError] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!chatId.trim() || !title.trim()) {
            setValidationError(true);
            return;
        }
        await onAdd(chatId.trim(), title.trim());
        setChatId('');
        setTitle('');
        setValidationError(false);
    };

    const handleClose = () => {
        setChatId('');
        setTitle('');
        setValidationError(false);
        onClose();
    };

    return (
        <div
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-surface border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4"
            >
                <h3 className="text-lg font-bold text-center">{t.addModal.title}</h3>

                <div className="space-y-3">
                    <div>
                        <label className={`text-[10px] font-bold uppercase ml-1 ${validationError && !chatId ? 'text-danger' : 'text-muted'}`}>
                            {t.addModal.labelChatId}
                        </label>
                        <input
                            className={`w-full h-9 bg-black/20 border rounded-lg px-3 text-xs text-white focus:outline-none transition-colors ${validationError && !chatId ? 'border-danger/50 bg-danger/5' : 'border-white/10 focus:border-primary/50'}`}
                            placeholder={t.addModal.placeholderChatId}
                            value={chatId}
                            onChange={e => {
                                setChatId(e.target.value);
                                setValidationError(false);
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className={`text-[10px] font-bold uppercase ml-1 ${validationError && !title ? 'text-danger' : 'text-muted'}`}>
                            {t.addModal.labelName}
                        </label>
                        <input
                            className={`w-full h-9 bg-black/20 border rounded-lg px-3 text-xs text-white focus:outline-none transition-colors ${validationError && !title ? 'border-danger/50 bg-danger/5' : 'border-white/10 focus:border-primary/50'}`}
                            placeholder={t.addModal.placeholderName}
                            value={title}
                            onChange={e => {
                                setTitle(e.target.value);
                                setValidationError(false);
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    {validationError && (
                        <p className="text-[10px] text-danger font-bold text-center mt-1 animate-pulse">
                            {t.addModal.validationError}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-2 text-xs font-bold text-muted hover:bg-white/5 rounded-full transition-all"
                    >
                        {t.addModal.cancel}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-2 bg-primary text-background text-xs font-bold rounded-full hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                    >
                        {t.addModal.add}
                    </button>
                </div>
            </div>
        </div>
    );
};
