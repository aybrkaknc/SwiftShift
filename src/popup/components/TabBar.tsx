import React from 'react';
import { Megaphone, History, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../utils/useTranslation';
import { useSpotlight } from '../../hooks/useSpotlight';

export type TabType = 'channels' | 'recents' | 'logs';

interface TabBarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'channels', label: t.tabs.channels, icon: <Megaphone size={14} /> },
        { id: 'recents', label: t.tabs.recents, icon: <History size={14} /> },
        { id: 'logs', label: t.tabs.logs, icon: <ShieldAlert size={14} /> }
    ];

    return (
        <div className="px-4 pb-3 flex gap-2">
            {tabs.map(tab => (
                <TabButton
                    key={tab.id}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                    icon={tab.icon}
                    label={tab.label}
                />
            ))}
        </div>
    );
};

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, icon, label }) => {
    const { containerRef, handleMouseMove } = useSpotlight<HTMLButtonElement>();

    return (
        <button
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all spotlight-effect relative overflow-hidden ${isActive
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-surface/30 text-muted border border-white/5 hover:bg-surface/50 hover:text-white'
                }`}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {icon}
                {label}
            </span>
        </button>
    );
};
