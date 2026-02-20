/**
 * TargetSectionList
 * Hedef listesi bölümünü render eden optimize edilmiş bileşen.
 * React.memo ile gereksiz render'lar önlenir.
 */

import React from 'react';
import { TelegramTarget } from '../../services/storage';
import { TargetListItem } from './TargetListItem';
import { ChevronRight } from 'lucide-react';

interface TargetSectionListProps {
    title: string;
    list: TelegramTarget[];
    childrenMap: Map<string, TelegramTarget[]>;
    selectedId: string;
    expandedChannels: Record<string, boolean>;
    editingId: string | null;
    editName: string;
    isSending: boolean;
    // Section Expansion
    isSectionExpanded: boolean;
    onToggleSection: () => void;
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
    isSectionExpanded,
    onToggleSection,
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
        <div className="flex flex-col group/section">
            <div
                className="flex items-center gap-2 py-2 cursor-pointer"
                onClick={onToggleSection}
            >
                {/* Chevron Toggle - Left Aligned */}
                <div className={`
                    w-4 h-4 rounded flex items-center justify-center transition-all duration-200
                    text-muted/40 group-hover/section:text-white
                    ${isSectionExpanded ? 'rotate-90' : ''}
                `}>
                    <ChevronRight size={12} />
                </div>

                <span className="text-[10px] font-bold text-muted uppercase tracking-widest group-hover/section:text-white transition-colors">{title}</span>
            </div>

            {/* Animated Content Wrapper */}
            <div className={`
                grid transition-all duration-300 ease-in-out
                ${isSectionExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}
            `}>
                <div className="overflow-hidden">
                    <div className="relative ml-2 pl-4 pt-2 flex flex-col gap-1.5 pb-4">
                        {/* Vertical Accent Line - Descends from header chevron */}
                        <div className="absolute left-0 top-0 bottom-6 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent" />

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
            </div>
        </div>
    );
});

TargetSectionList.displayName = 'TargetSectionList';
