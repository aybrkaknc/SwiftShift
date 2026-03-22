import React, { useState, useEffect, useRef } from 'react';
import { X, CloudUpload, CloudDownload, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../../utils/useTranslation';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: (dataStr: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    onExport,
    onImport
}) => {
    const { t, locale, toggleLocale } = useTranslation();
    const [pasteText, setPasteText] = useState('');
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [showImportArea, setShowImportArea] = useState(false);
    
    // Açılır menü dışına tıklanınca kapanması için referans
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setPasteText(''); 
            setShowImportArea(false);
            setIsLangOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    if (!isOpen) return null;

    const languages = [
        { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
        { code: 'en', label: 'English', flag: '🇬🇧' }
    ];
    // Mevcut dili bul, yoksa varsayılanı kullan
    const currentLang = languages.find(l => l.code === locale) || languages[0];

    const changeLanguage = (code: string) => {
        if (locale !== code) {
            toggleLocale(); // Dil değiştirme fonksiyonunu tetikliyoruz
        }
        setIsLangOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* 1. Genel Konteyner - Küçültülmüş */}
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-[440px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* 2. Modal Başlığı (Header) */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-background/50">
                    <h2 className="text-base font-bold text-white tracking-wide">{t.settings.title || 'Settings'}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-muted hover:text-white hover:bg-white/10 transition-colors"
                        title="Kapat"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* 3. İçerik Alanı (Body - Dikey Akış) - Gap ve paddingler daraltıldı */}
                <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[85vh] no-scrollbar">
                    
                    {/* B. Dil Bölümü (Language) */}
                    <div className="flex flex-col gap-2" ref={langRef}>
                        <span className="text-[12px] font-extrabold text-muted uppercase tracking-wider ml-1">{t.settings.language}</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="w-full flex items-center justify-between bg-surface/50 border border-white/10 hover:border-white/20 rounded-lg px-4 py-3 transition-all text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">{currentLang.flag}</span>
                                    <span className="text-[13px] font-bold">{currentLang.label}</span>
                                </div>
                                <ChevronDown size={16} className={`text-muted transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Açılır Menü (Dropdown Panel) */}
                            {isLangOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 text-white">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang.code)}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xl">{lang.flag}</span>
                                                <span className="text-[13px] font-bold opacity-90 group-hover:opacity-100">{lang.label}</span>
                                            </div>
                                            {locale === lang.code && <Check size={16} className="text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5 rounded-full"></div>

                    {/* C. Veri Yönetimi Bölümü (Data Management) */}
                    <div className="flex flex-col gap-3">
                        <span className="text-[12px] font-extrabold text-muted uppercase tracking-wider ml-1">{t.settings.dataManagement}</span>
                        
                        <div className="flex gap-2">
                            {/* Buton 1 (Export) */}
                            <button
                                onClick={onExport}
                                className="flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all group"
                            >
                                <CloudUpload size={20} className="text-primary group-hover:-translate-y-0.5 transition-transform" strokeWidth={2.5} />
                                <span className="text-[13px] font-extrabold text-primary">{t.settings.exportData}</span>
                            </button>

                            {/* Buton 2 (Import) */}
                            <button
                                onClick={() => setShowImportArea(!showImportArea)}
                                className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all group ${
                                    showImportArea ? 'bg-white/10 border-white/30 text-white' : 'bg-surface/50 border-white/10 text-muted hover:text-white hover:bg-surface/80 hover:border-white/20'
                                }`}
                            >
                                <CloudDownload size={22} className={`transition-transform ${showImportArea ? 'text-white' : 'group-hover:-translate-y-0.5'}`} strokeWidth={2.5} />
                                <span className="text-[13px] font-extrabold text-nowrap">{t.settings.importData}</span>
                            </button>
                        </div>
                        
                        <p className="text-[11px] text-muted text-center leading-relaxed mt-2">
                            {t.settings.dataManagementDesc}
                        </p>

                        {/* Import Text Parameter (Genişleyen Kısım) */}
                        {showImportArea && (
                            <div className="mt-1 relative animate-in slide-in-from-top-2 fade-in">
                                <textarea
                                    className="w-full h-24 bg-surface/50 border border-primary/30 hover:border-primary/50 rounded-lg p-3 pb-10 text-[12px] text-white placeholder-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none font-mono transition-all shadow-inner"
                                    placeholder={t.settings.importDataPlaceholder}
                                    value={pasteText}
                                    onChange={(e) => setPasteText(e.target.value)}
                                    spellCheck={false}
                                />
                                <button
                                    onClick={() => {
                                        if (pasteText.trim()) {
                                            onImport(pasteText);
                                            setPasteText(''); // İşlem sonu sıfırla
                                            setShowImportArea(false);
                                        }
                                    }}
                                    disabled={!pasteText.trim()}
                                    className="absolute bottom-2 right-2 bg-primary text-background hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary disabled:cursor-not-allowed px-4 py-1.5 rounded-[8px] transition-all flex items-center gap-2 font-extrabold text-[12px]"
                                >
                                    <CloudDownload size={14} strokeWidth={2.5} />
                                    {t.settings.importSubmit}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Alt Bilgi / Eylem Alanı (Footer) */}
                <div className="p-3 border-t border-white/5 bg-background/80 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 border border-white/5 active:border-white/20"
                    >
                        {t.settings.ok}
                    </button>
                </div>
                
            </div>
        </div>
    );
};
