/**
 * ViewModeToggle
 * Compact / Bento / Gallery görünüm modu seçici.
 */

import React from 'react';
import { List, Grid, Maximize2 } from 'lucide-react';

export type ViewMode = 'compact' | 'bento' | 'gallery';

interface ViewModeToggleProps {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ mode, onChange }) => {
    const modes: { id: ViewMode; icon: React.ReactNode; title: string }[] = [
        { id: 'compact', icon: <List size={10} />, title: 'Compact View' },
        { id: 'bento', icon: <Grid size={10} />, title: 'Bento View' },
        { id: 'gallery', icon: <Maximize2 size={10} />, title: 'Gallery View' }
    ];

    return (
        <div className="flex items-center gap-0.5 bg-surface/50 border border-white/5 rounded-full p-0.5">
            {modes.map(m => (
                <button
                    key={m.id}
                    onClick={() => onChange(m.id)}
                    className={`p-1 rounded-full transition-all ${mode === m.id
                            ? 'bg-primary text-background'
                            : 'text-muted hover:text-white'
                        }`}
                    title={m.title}
                >
                    {m.icon}
                </button>
            ))}
        </div>
    );
};
