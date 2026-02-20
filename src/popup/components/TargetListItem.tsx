/**
 * TargetListItem
 * Tek bir hedef öğesini (parent veya child) render eder.
 */

import React from 'react';
import { TelegramTarget } from '../../services/storage';
import { Hash, Megaphone, Users, Bookmark, Send, Trash2, Edit2, Check, Pin, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../utils/useTranslation';
import { useSpotlight } from '../../hooks/useSpotlight';

interface TargetListItemProps {
    target: TelegramTarget;
    children?: TelegramTarget[];
    isSelected: boolean;
    isExpanded: boolean;
    editingId: string | null;
    editName: string;
    onSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
    onStartEdit: (target: TelegramTarget) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditNameChange: (name: string) => void;
    onDelete: (id: string) => void;
    onTogglePin?: (id: string) => void;
    onSendDirect: (id: string) => void;
    isSending: boolean;
}

/**
 * Hedef tipine göre ikon döndürür
 */
const renderIcon = (type: string) => {
    switch (type) {
        case 'channel': return <Megaphone size={14} />;
        case 'group': return <Users size={14} />;
        case 'private': return <Bookmark size={14} />;
        case 'topic': return <Hash size={14} />;
        default: return <Hash size={14} />;
    }
};

export const TargetListItem: React.FC<TargetListItemProps> = ({
    target,
    children = [],
    isSelected,
    isExpanded,
    editingId,
    editName,
    onSelect,
    onToggleExpand,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onEditNameChange,
    onDelete,
    onTogglePin,
    onSendDirect,
    isSending
}) => {
    const { t } = useTranslation();
    const { containerRef, handleMouseMove } = useSpotlight<HTMLDivElement>();
    const hasChildren = children.length > 0;
    const isEditing = editingId === target.id;

    return (
        <div className="flex flex-col">
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                className={`
                    relative flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer magnetic-item spotlight-effect group overflow-hidden
                    ${isSelected
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-transparent hover:border-white/5 hover:bg-surface/30'
                    }
                `}
                onClick={() => onSelect(target.id)}
            >
                {/* Icon & Expand Toggle Unified */}
                <div
                    className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 relative group/icon
                        ${isSelected ? 'bg-primary/20 text-primary' : 'bg-surface/50 text-muted'}
                        ${hasChildren ? 'cursor-pointer hover:bg-primary/30 hover:text-primary' : ''}
                    `}
                    onClick={(e) => {
                        if (hasChildren) {
                            e.stopPropagation();
                            onToggleExpand(target.id);
                        }
                    }}
                >
                    {/* Megaphone/Group Icon - Hidden on hover if has children */}
                    <div className={`transition-opacity duration-200 ${hasChildren ? 'group-hover/icon:opacity-0' : 'opacity-100'}`}>
                        {renderIcon(target.type)}
                    </div>

                    {/* Chevron - Shown only on hover if has children */}
                    {hasChildren && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity duration-200">
                            <ChevronRight
                                size={14}
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            />
                        </div>
                    )}

                    {/* Pinned Indicator */}
                    {target.pinned && (
                        <div className="absolute -top-1 -right-1 bg-background rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white/10 z-10">
                            <Pin size={8} className="text-primary fill-primary" />
                        </div>
                    )}
                </div>

                {/* Content (Editable) */}
                <div className="flex flex-col overflow-hidden flex-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input
                                className="w-full bg-black/50 border border-primary/50 rounded px-1 text-[13px] text-white focus:outline-none h-6"
                                value={editName}
                                onChange={e => onEditNameChange(e.target.value)}
                                autoFocus
                                onKeyDown={e => {
                                    if (e.key === 'Enter') onSaveEdit();
                                    if (e.key === 'Escape') onCancelEdit();
                                }}
                            />
                            <button onClick={onSaveEdit} className="text-primary hover:text-white">
                                <Check size={14} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className={`text-[13px] font-bold transition-colors truncate flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                {target.name}
                            </p>
                            <p className="text-[9px] font-bold text-muted/60 uppercase tracking-tighter truncate">{target.type}</p>
                        </>
                    )}
                </div>

                {/* Actions (Integrated Edge) */}
                {!editingId && (
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 action-bar-gradient opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onTogglePin) onTogglePin(target.id);
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${target.pinned ? 'text-primary' : 'text-muted hover:text-white hover:bg-white/10'}`}
                            title={target.pinned ? t.targetItem.unpin : t.targetItem.pinToTop}
                        >
                            <Pin size={16} className={target.pinned ? "fill-primary" : ""} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartEdit(target);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-all"
                            title={t.targetItem.rename}
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(target.id);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all"
                            title={t.targetItem.remove}
                        >
                            <Trash2 size={16} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-0.5" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSendDirect(target.id);
                            }}
                            disabled={isSending}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-all active:scale-90"
                            title={t.targetItem.sendCurrent}
                        >
                            <Send size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>

            {/* Child Topics Render with Animation */}
            {hasChildren && (
                <div className={`
                    grid transition-all duration-300 ease-in-out
                    ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0 mt-0'}
                `}>
                    <div className="overflow-hidden">
                        <div className="ml-[26px] pl-3 pt-1 border-l border-white/10 flex flex-col gap-1">
                            {children.map(child => (
                                <ChildTopicItem
                                    key={child.id}
                                    child={child}
                                    isSelected={editingId === null && child.id === target.id ? false : child.id === target.id}
                                    editingId={editingId}
                                    editName={editName}
                                    onSelect={onSelect}
                                    onStartEdit={onStartEdit}
                                    onSaveEdit={onSaveEdit}
                                    onCancelEdit={onCancelEdit}
                                    onEditNameChange={onEditNameChange}
                                    onDelete={onDelete}
                                    onTogglePin={onTogglePin}
                                    onSendDirect={onSendDirect}
                                    isSending={isSending}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Child Topic Item - İç içe topic bileşeni
 */
interface ChildTopicItemProps {
    child: TelegramTarget;
    isSelected: boolean;
    editingId: string | null;
    editName: string;
    onSelect: (id: string) => void;
    onStartEdit: (target: TelegramTarget) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditNameChange: (name: string) => void;
    onDelete: (id: string) => void;
    onTogglePin?: (id: string) => void;
    onSendDirect: (id: string) => void;
    isSending: boolean;
}

const ChildTopicItem: React.FC<ChildTopicItemProps> = ({
    child,
    isSelected,
    editingId,
    editName,
    onSelect,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onEditNameChange,
    onDelete,
    onTogglePin,
    onSendDirect,
    isSending
}) => {
    const { t } = useTranslation();
    const { containerRef, handleMouseMove } = useSpotlight<HTMLDivElement>();
    const isEditing = editingId === child.id;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={`
                relative flex items-center gap-2 p-2 rounded-lg border cursor-pointer magnetic-item spotlight-effect group overflow-hidden
                ${isSelected
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-transparent hover:border-white/5 hover:bg-surface/30'
                }
            `}
            onClick={() => onSelect(child.id)}
        >
            <Hash size={12} className="text-muted flex-shrink-0" />

            {/* Name Container */}
            <div className="flex-1 overflow-hidden">
                {isEditing ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                            className="w-full bg-black/50 border border-primary/50 rounded px-1 text-xs text-white focus:outline-none h-5"
                            value={editName}
                            onChange={e => onEditNameChange(e.target.value)}
                            autoFocus
                            onKeyDown={e => {
                                if (e.key === 'Enter') onSaveEdit();
                                if (e.key === 'Escape') onCancelEdit();
                            }}
                        />
                        <button onClick={onSaveEdit} className="text-primary hover:text-white">
                            <Check size={12} />
                        </button>
                    </div>
                ) : (
                    <span className={`text-xs font-medium block truncate ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                        {child.name}
                    </span>
                )}
            </div>

            {/* Actions (Integrated Edge - Compact) */}
            {!editingId && (
                <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 px-2.5 action-bar-gradient opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onTogglePin) onTogglePin(child.id);
                        }}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${child.pinned ? 'text-primary' : 'text-muted hover:text-white hover:bg-white/10'}`}
                        title={child.pinned ? t.targetItem.unpin : t.targetItem.pin}
                    >
                        <Pin size={13} className={child.pinned ? "fill-primary" : ""} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onStartEdit(child);
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-all"
                        title={t.targetItem.rename}
                    >
                        <Edit2 size={13} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(child.id);
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all"
                        title={t.targetItem.remove}
                    >
                        <Trash2 size={13} />
                    </button>
                    <div className="w-px h-3 bg-white/10 mx-0.5" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSendDirect(child.id);
                        }}
                        disabled={isSending}
                        className="w-7 h-7 rounded flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-all active:scale-90"
                        title={t.targetItem.send}
                    >
                        <Send size={15} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
};
