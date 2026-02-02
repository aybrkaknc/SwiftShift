import React from 'react';
import { ShieldAlert, CheckCircle, Info, Clock, Terminal } from 'lucide-react';
import { LogEntry } from '../../services/logService';

interface LogsViewProps {
    logs: LogEntry[];
    onClear: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClear }) => {
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getIcon = (type: LogEntry['type']) => {
        switch (type) {
            case 'error': return <ShieldAlert size={16} className="text-danger" />;
            case 'success': return <CheckCircle size={16} className="text-primary" />;
            case 'info': return <Info size={16} className="text-blue-400" />;
        }
    };

    if (logs.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center py-10 px-6 flex flex-col items-center gap-4 bg-surface/20 rounded-2xl border border-white/5 w-full">
                    <Terminal size={20} className="text-muted" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold">No logs available</p>
                        <p className="text-[9px] text-muted leading-tight">Operation history will appear here.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar flex flex-col">
            {/* Section Header - Sticky */}
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">System Logs</span>
                    <button
                        onClick={onClear}
                        className="text-[9px] font-bold text-muted/50 hover:text-danger hover:bg-danger/5 px-2 py-0.5 rounded-full border border-white/5 transition-all"
                    >
                        Clear All
                    </button>
                </div>
            </div>
            {/* Divider */}
            <div className="h-px bg-white/10 mb-2" />

            <div className="flex flex-col gap-1.5">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className={`p-3 rounded-xl border border-white/5 bg-surface/30 flex flex-col gap-1 transition-all hover:bg-surface/50`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getIcon(log.type)}
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${log.type === 'error' ? 'text-danger' :
                                    log.type === 'success' ? 'text-primary' : 'text-blue-400'
                                    }`}>
                                    {log.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted">
                                <Clock size={10} />
                                <span className="text-[9px]">{formatTime(log.timestamp)}</span>
                            </div>
                        </div>

                        <p className="text-xs text-white font-medium break-words mt-0.5">
                            {log.message}
                        </p>

                        {log.details && (
                            <p className="text-[10px] text-muted font-mono bg-black/20 p-1.5 rounded-md mt-1 break-all">
                                {log.details}
                            </p>
                        )}

                        {log.targetName && (
                            <div className="mt-1 flex items-center gap-1 text-muted text-[9px] font-medium italic">
                                <span>Target:</span>
                                <span>{log.targetName}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
