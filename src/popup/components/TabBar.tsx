/**
 * TabBar
 * Channels / Recents / Logs sekmeleri.
 */

import React from 'react';
import { Megaphone, History, ShieldAlert } from 'lucide-react';

export type TabType = 'channels' | 'recents' | 'logs';

interface TabBarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'channels', label: 'Channels', icon: <Megaphone size={14} /> },
        { id: 'recents', label: 'Recents', icon: <History size={14} /> },
        { id: 'logs', label: 'Logs', icon: <ShieldAlert size={14} /> }
    ];

    return (
        <div className="px-4 pb-3 flex gap-2">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab.id
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-surface/30 text-muted border border-white/5 hover:bg-surface/50 hover:text-white'
                        }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
