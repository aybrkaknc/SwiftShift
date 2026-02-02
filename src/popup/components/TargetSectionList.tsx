/**
 * TargetSectionList
 * Hedef listesi bölümünü render eden optimize edilmiş bileşen.
 * React.memo ile gereksiz render'lar önlenir.
 */

import React from 'react';
import { TelegramTarget } from '../../services/storage';
import { TargetListItem } from './TargetListItem';

interface TargetSectionListProps {
    title: string;
    list: TelegramTarget[];
    childrenMap: Map<string, TelegramTarget[]>;
    selectedId: string;
    expandedChannels: Record<string, boolean>;
    editingId: string | null;
    editName: string;
    isSending: boolean;
    // Callbacks
    onSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
    onStartEdit: (target: TelegramTarget) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditNameChange: (name: string) => void;
    onDelete: (id: string) => void;
    onTogglePin?: (id: string) => void;
    onSendDirect: (id: string) => void;
}

export const TargetSectionList: React.FC<TargetSectionListProps> = React.memo(({
    title,
    list,
    childrenMap,
    selectedId,
    expandedChannels,
    editingId,
    editName,
    isSending,
    onSelect,
    onToggleExpand,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onEditNameChange,
    onDelete,
    onTogglePin,
    onSendDirect
}) => {
    // Liste boşsa render etme
    if (list.length === 0) return null;

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 py-2">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{title}</span>
            </div>
            <div className="h-px bg-white/10 mb-2" />
            <div className="flex flex-col gap-1.5">
                {list.map(target => (
                    <TargetListItem
                        key={target.id}
                        target={target}
                        children={childrenMap.get(target.id)}
                        isSelected={selectedId === target.id}
                        isExpanded={expandedChannels[target.id] ?? true}
                        editingId={editingId}
                        editName={editName}
                        onSelect={onSelect}
                        onToggleExpand={onToggleExpand}
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
    );
});

TargetSectionList.displayName = 'TargetSectionList';
