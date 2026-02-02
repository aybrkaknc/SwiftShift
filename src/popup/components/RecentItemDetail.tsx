/**
 * RecentItemDetail
 * Genişletilmiş item detay modalı.
 */

import React, { useState } from 'react';
import { FileText, X, Copy, Check, Music, MapPin, RefreshCw, Maximize2 } from 'lucide-react';
import { RecentSend } from '../../services/recents';
import { formatTime, getContentIcon } from '../../utils/uiUtils';

interface RecentItemDetailProps {
    item: RecentSend | null;
    onClose: () => void;
    onResend: (item: RecentSend) => void;
}

/**
 * İçerik tipine göre ikon döndürür - alias
 */
const getIcon = getContentIcon;

export const RecentItemDetail: React.FC<RecentItemDetailProps> = ({ item, onClose, onResend }) => {
    const [copied, setCopied] = useState(false);

    if (!item) return null;

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleResendAndClose = () => {
        onResend(item);
        onClose();
    };

    return (
        <div
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-h-[90%] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        {getIcon(item.type)}
                        <span className="text-xs font-bold uppercase">{item.type}</span>
                        <span className="text-[9px] text-muted">• {formatTime(item.timestamp)}</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                        <X size={16} className="text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                    {item.type === 'image' ? (
                        <img src={item.content} alt="Full" className="w-full rounded-lg object-contain max-h-[300px]" />
                    ) : item.type === 'file' ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 bg-surface/50 rounded-xl border border-white/5 overflow-hidden">
                            {item.content.startsWith('data:image/') || item.content.match(/\.(jpg|jpeg|png|gif|webp|bmp)/i) ? (
                                <img src={item.content} alt="Full File" className="w-full rounded-lg object-contain max-h-[300px]" />
                            ) : (
                                <>
                                    <FileText size={48} className="text-amber-400/50" />
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-bold text-white truncate max-w-[250px] px-4">
                                            {item.content.split('/').pop() || 'Uncompressed File'}
                                        </p>
                                        <p className="text-[10px] text-muted">Original Quality Document</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : item.type === 'audio' ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4 bg-surface/50 rounded-xl border border-white/5">
                            <Music size={48} className="text-purple-400/50" />
                            <div className="text-center space-y-1">
                                <p className="text-sm font-bold text-white truncate max-w-[250px] px-4">
                                    {item.content.split('/').pop() || 'Audio File'}
                                </p>
                                <p className="text-[10px] text-muted">Native Audio Content</p>
                            </div>
                            <audio controls className="w-full max-w-[280px] h-10 mt-2 filter invert opacity-80">
                                <source src={item.content} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ) : item.type === 'location' ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4 bg-emerald-400/5 rounded-xl border border-emerald-400/10">
                            <MapPin size={48} className="text-emerald-400/50" />
                            <div className="text-center space-y-1">
                                <p className="text-sm font-bold text-white">Interactive Location</p>
                                <p className="text-[10px] text-muted px-6 break-words">{item.content}</p>
                            </div>
                            <button
                                onClick={() => window.open(item.content, '_blank')}
                                className="mt-2 px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 transition-all flex items-center gap-2"
                            >
                                <Maximize2 size={12} /> Open in Maps
                            </button>
                        </div>
                    ) : item.type === 'link' ? (
                        <div className="space-y-4">
                            {item.metadata?.image && (
                                <img
                                    src={item.metadata.image}
                                    alt="Preview"
                                    className="w-full rounded-lg object-cover max-h-[200px]"
                                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                />
                            )}
                            <div className="bg-surface/50 p-4 rounded-xl border border-white/5 space-y-2">
                                {item.metadata?.siteName && (
                                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{item.metadata.siteName}</p>
                                )}
                                <h3 className="text-base font-bold text-white leading-tight">
                                    {item.metadata?.title || item.preview}
                                </h3>
                                {item.metadata?.description && (
                                    <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                                        {item.metadata.description}
                                    </p>
                                )}
                                <div className="pt-2 flex items-center justify-between gap-3">
                                    <p className="text-[10px] text-primary truncate flex-1">{item.content}</p>
                                    <button
                                        onClick={() => handleCopy(item.content)}
                                        className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                        title="Copy Link"
                                    >
                                        {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-muted" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <p className="text-sm text-white whitespace-pre-wrap break-words select-text">
                                {item.content}
                            </p>
                            <button
                                onClick={() => handleCopy(item.content)}
                                className="absolute top-0 right-0 p-2 rounded-full bg-surface/50 hover:bg-surface border border-white/5 transition-all"
                                title="Copy"
                            >
                                {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-muted" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 flex items-center gap-3">
                    <span className="text-[10px] text-muted flex-1 truncate">→ {item.targetName}</span>
                    <button
                        onClick={handleResendAndClose}
                        className="px-5 py-2.5 bg-primary text-background text-xs font-bold rounded-full hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <RefreshCw size={12} /> Resend
                    </button>
                </div>
            </div>
        </div>
    );
};
