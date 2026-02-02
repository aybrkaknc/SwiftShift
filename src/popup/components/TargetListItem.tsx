/**
 * TargetListItem
 * Tek bir hedef öğesini (parent veya child) render eder.
 */

import React from 'react';
import { TelegramTarget } from '../../services/storage';
import { Hash, Megaphone, Users, Bookmark, Send, Trash2, Edit2, Check, Pin, ChevronRight } from 'lucide-react';

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
    const hasChildren = children.length > 0;
    const isEditing = editingId === target.id;

    return (
        <div className="flex flex-col">
            <div
                className={`
                    relative flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all group
                    ${isSelected
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-transparent hover:border-white/5 hover:bg-surface/30'
                    }
                `}
                onClick={() => onSelect(target.id)}
            >
                {/* Expand Toggle */}
                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand(target.id);
                        }}
                        className="text-muted hover:text-white transition-colors"
                    >
                        <ChevronRight
                            size={12}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                    </button>
                )}

                {/* Icon */}
                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 relative
                    ${isSelected ? 'bg-primary/20 text-primary' : 'bg-surface/50 text-muted'}
                `}>
                    {renderIcon(target.type)}
                    {/* Pinned Indicator on Icon */}
                    {target.pinned && (
                        <div className="absolute -top-1 -right-1 bg-background rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white/10">
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

                {/* Actions (Floating Glass Pill) */}
                {!editingId && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-full bg-surface/80 backdrop-blur-md border border-white/10 shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onTogglePin) onTogglePin(target.id);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${target.pinned ? 'text-primary bg-primary/10' : 'text-muted hover:text-white hover:bg-white/10'}`}
                            title={target.pinned ? "Unpin" : "Pin to top"}
                        >
                            <Pin size={14} className={target.pinned ? "fill-primary" : ""} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartEdit(target);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-all"
                            title="Rename"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(target.id);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all"
                            title="Remove"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-0.5" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSendDirect(target.id);
                            }}
                            disabled={isSending}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-all active:scale-90"
                            title="Send Current"
                        >
                            <Send size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>

            {/* Child Topics Render */}
            {hasChildren && isExpanded && (
                <div className="ml-6 pl-3 border-l border-white/10 mt-1.5 flex flex-col gap-1">
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
    const isEditing = editingId === child.id;

    return (
        <div
            className={`
                relative flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all group
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

            {/* Actions (Floating Glass Pill - Compact) */}
            {!editingId && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1.5 py-1 rounded-xl bg-surface/80 backdrop-blur-md border border-white/10 shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onTogglePin) onTogglePin(child.id);
                        }}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${child.pinned ? 'text-primary' : 'text-muted hover:text-white hover:bg-white/10'}`}
                        title={child.pinned ? "Unpin" : "Pin"}
                    >
                        <Pin size={10} className={child.pinned ? "fill-primary" : ""} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onStartEdit(child);
                        }}
                        className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-all"
                        title="Rename"
                    >
                        <Edit2 size={10} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(child.id);
                        }}
                        className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all"
                        title="Remove"
                    >
                        <Trash2 size={10} />
                    </button>
                    <div className="w-px h-3 bg-white/10 mx-0.5" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSendDirect(child.id);
                        }}
                        disabled={isSending}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-all active:scale-90"
                        title="Send"
                    >
                        <Send size={11} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
};
