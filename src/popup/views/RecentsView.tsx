/**
 * RecentsView
 * Recent gönderimler listesi - Refaktör edilmiş versiyon.
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

import { RecentSend } from '../../services/recents';
import { StorageService } from '../../services/storage';
import { ViewModeToggle, ViewMode } from '../components/ViewModeToggle';
import { RecentItemCard } from '../components/RecentItemCard';
import { RecentItemDetail } from '../components/RecentItemDetail';

interface RecentsViewProps {
    recents: RecentSend[];
    onDelete: (id: string) => void;
    onResend: (item: RecentSend) => void;
    onClearAll: () => void;
}

export const RecentsView: React.FC<RecentsViewProps> = ({ recents, onDelete, onResend, onClearAll }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('bento');
    const [expandedItem, setExpandedItem] = useState<RecentSend | null>(null);

    // Load saved view mode
    useEffect(() => {
        StorageService.getViewMode().then(setViewMode);
    }, []);

    // Handle mode change
    const handleModeChange = async (mode: ViewMode) => {
        setViewMode(mode);
        await StorageService.setViewMode(mode);
    };

    // Grid class based on mode
    const getGridClass = () => {
        switch (viewMode) {
            case 'compact': return 'grid-cols-1 gap-1';
            case 'gallery': return 'grid-cols-1 gap-3';
            default: return 'grid-cols-2 gap-2';
        }
    };

    // Empty state
    if (recents.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center py-10 px-6 flex flex-col items-center gap-4 bg-surface/20 rounded-2xl border border-white/5 w-full">
                    <Clock size={20} className="text-muted" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold">No recent sends</p>
                        <p className="text-[9px] text-muted leading-tight">Your recent sends will appear here.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
                {/* Section Header - Sticky */}
                <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">History</span>
                        <button
                            onClick={onClearAll}
                            className="text-[9px] font-bold text-muted/50 hover:text-danger hover:bg-danger/5 px-2 py-0.5 rounded-full border border-white/5 transition-all"
                        >
                            Clear All
                        </button>
                    </div>
                    <ViewModeToggle mode={viewMode} onChange={handleModeChange} />
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-2" />

                {/* Dynamic Grid */}
                <div className={`grid ${getGridClass()} auto-rows-min`}>
                    {recents.map((item) => (
                        <RecentItemCard
                            key={item.id}
                            item={item}
                            viewMode={viewMode}
                            onExpand={setExpandedItem}
                            onDelete={onDelete}
                            onResend={onResend}
                        />
                    ))}
                </div>
            </div>

            {/* Focus Overlay */}
            <RecentItemDetail
                item={expandedItem}
                onClose={() => setExpandedItem(null)}
                onResend={onResend}
            />
        </>
    );
};
