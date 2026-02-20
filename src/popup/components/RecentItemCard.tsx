/**
 * RecentItemCard
 * Tek bir recent item'ı render eden kart bileşeni.
 */

import React from 'react';
import { FileText, Trash2, RefreshCw, Music, MapPin } from 'lucide-react';
import { RecentSend } from '../../services/recents';
import { ViewMode } from './ViewModeToggle';
import { formatTime, getContentIcon } from '../../utils/uiUtils';
import { useTranslation } from '../../utils/useTranslation';
import { useSpotlight } from '../../hooks/useSpotlight';

interface RecentItemCardProps {
    item: RecentSend;
    viewMode: ViewMode;
    onExpand: (item: RecentSend) => void;
    onDelete: (id: string) => void;
    onResend: (item: RecentSend) => void;
}

/**
 * İçerik tipine göre ikon döndürür - alias
 */
const getIcon = getContentIcon;

export const RecentItemCard: React.FC<RecentItemCardProps> = ({
    item,
    viewMode,
    onExpand,
    onDelete,
    onResend
}) => {
    const { t } = useTranslation();
    const { containerRef, handleMouseMove } = useSpotlight<HTMLDivElement>();
    const isCompact = viewMode === 'compact';
    const isGallery = viewMode === 'gallery';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onClick={() => onExpand(item)}
            className={`
                relative rounded-xl border border-white/5 bg-surface/30 magnetic-item spotlight-effect group cursor-pointer hover:border-primary/30 hover:bg-surface/50
                ${isCompact ? 'p-2 flex items-center gap-3' : 'p-3'}
                ${viewMode === 'bento' && item.type === 'image' ? 'col-span-2' : ''}
            `}
        >
            {/* Compact Mode */}
            {isCompact ? (
                <>
                    {getIcon(item.type)}
                    <span className="flex-1 text-xs text-white truncate">{item.preview || item.content}</span>
                    <span className="text-[9px] text-muted">{formatTime(item.timestamp)}</span>
                </>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            {getIcon(item.type)}
                            <span className="text-[9px] text-muted uppercase font-bold tracking-wider">{item.type}</span>
                        </div>
                        <span className="text-[9px] text-muted">{formatTime(item.timestamp)}</span>
                    </div>

                    {/* Content */}
                    {item.type === 'image' ? (
                        <div
                            className={`w-full rounded-lg bg-black/20 flex items-center justify-center overflow-hidden ${isGallery ? 'h-48' : 'h-32'} cursor-zoom-in hover:ring-2 hover:ring-primary/40 transition-all`}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.content, '_blank');
                            }}
                        >
                            <img
                                src={item.content}
                                alt="Recent"
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '';
                                    (e.target as HTMLImageElement).alt = t.recentCard.imageUnavailable;
                                }}
                            />
                        </div>
                    ) : item.type === 'file' ? (
                        <div
                            className={`w-full rounded-lg bg-surface/50 border border-white/5 flex flex-col items-center justify-center gap-2 overflow-hidden ${isGallery ? 'h-48' : 'h-32'} ${item.content.match(/\.(jpg|jpeg|png|gif|webp|bmp)/i) ? 'cursor-zoom-in hover:ring-2 hover:ring-primary/40 transition-all' : ''}`}
                            onClick={(e) => {
                                if (item.content.match(/\.(jpg|jpeg|png|gif|webp|bmp|http)/i)) {
                                    e.stopPropagation();
                                    window.open(item.content, '_blank');
                                }
                            }}
                        >
                            {item.content.startsWith('data:image/') || item.content.match(/\.(jpg|jpeg|png|gif|webp|bmp)/i) ? (
                                <img src={item.content} alt="Recent File" className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                                <>
                                    <FileText size={isGallery ? 32 : 24} className="text-amber-400/50" />
                                    <p className="text-[10px] text-muted px-4 text-center truncate w-full">
                                        {item.content.split('/').pop() || t.recentCard.uncompressedFile}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : item.type === 'audio' ? (
                        <div className={`w-full rounded-lg bg-surface/50 border border-white/5 flex flex-col items-center justify-center gap-2 ${isGallery ? 'h-48' : 'h-32'}`}>
                            <Music size={isGallery ? 32 : 24} className="text-purple-400/50" />
                            <p className="text-[10px] text-muted px-4 text-center truncate w-full">
                                {item.content.split('/').pop() || t.recentCard.audioFile}
                            </p>
                        </div>
                    ) : item.type === 'location' ? (
                        <div className={`w-full rounded-lg bg-emerald-400/5 border border-emerald-400/20 flex flex-col items-center justify-center gap-2 ${isGallery ? 'h-48' : 'h-32'}`}>
                            <MapPin size={isGallery ? 32 : 24} className="text-emerald-400/50" />
                            <p className="text-[10px] text-emerald-400/80 px-4 text-center font-bold">{t.recentCard.interactiveLocation}</p>
                            <p className="text-[9px] text-muted px-4 text-center truncate w-full">{item.content}</p>
                        </div>
                    ) : item.type === 'link' ? (
                        <div
                            className="space-y-2 cursor-pointer group/link"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.content, '_blank');
                            }}
                        >
                            {item.metadata?.image && (
                                <div className="w-full rounded-lg bg-black/20 flex items-center justify-center overflow-hidden h-24 mb-2 group-hover/link:ring-2 group-hover/link:ring-primary/40 transition-all">
                                    <img
                                        src={item.metadata.image}
                                        alt="Link Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                    />
                                </div>
                            )}
                            <div className="space-y-1">
                                {item.metadata?.siteName && (
                                    <p className="text-primary text-[8px] font-bold uppercase tracking-wider">{item.metadata.siteName}</p>
                                )}
                                <p className={`font-medium text-white ${isGallery ? 'text-sm' : 'text-xs'} line-clamp-2 group-hover/link:text-primary transition-colors`}>
                                    {item.metadata?.title || item.preview}
                                </p>
                                <p className={`text-muted truncate ${isGallery ? 'text-xs' : 'text-[10px]'}`}>{item.content}</p>
                            </div>
                        </div>
                    ) : (
                        <p className={`text-gray-300 ${isGallery ? 'text-sm line-clamp-6' : 'text-xs line-clamp-3'}`}>
                            {item.preview}
                        </p>
                    )}

                    {/* Target */}
                    <div className="mt-2 pt-2">
                        <span className="text-[9px] text-muted truncate max-w-[100px] block">→ {item.targetName}</span>
                    </div>

                    {/* Actions */}
                    <div className="absolute right-2 bottom-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-surface/80 text-muted border border-white/10 hover:bg-danger hover:text-white hover:border-danger transition-all"
                            title={t.targetItem.delete}
                        >
                            <Trash2 size={12} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onResend(item); }}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-surface/80 text-muted border border-white/10 hover:bg-primary hover:text-background hover:border-primary transition-all"
                            title={t.targetItem.resend}
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
