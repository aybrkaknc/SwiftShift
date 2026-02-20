import React from 'react';
import { ShieldAlert, CheckCircle, Info, Clock, Terminal, ChevronRight } from 'lucide-react';
import { LogEntry } from '../../services/logService';
import { useTranslation } from '../../utils/useTranslation';

interface LogsViewProps {
    logs: LogEntry[];
    onClear: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClear }) => {
    const { t } = useTranslation();
    const [expandedLogIds, setExpandedLogIds] = React.useState<Set<string>>(new Set());

    const toggleLog = (id: string) => {
        setExpandedLogIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (type: LogEntry['type']) => {
        switch (type) {
            case 'error': return <ShieldAlert size={14} className="text-danger" />;
            case 'success': return <CheckCircle size={14} className="text-primary" />;
            case 'info': return <Info size={14} className="text-blue-400" />;
        }
    };

    if (logs.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center py-10 px-6 flex flex-col items-center gap-4 bg-surface/20 rounded-2xl border border-white/5 w-full">
                    <Terminal size={20} className="text-muted" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold">{t.logs.noLogs}</p>
                        <p className="text-[9px] text-muted leading-tight">{t.logs.noLogsHint}</p>
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
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{t.logs.systemLogs}</span>
                    <button
                        onClick={onClear}
                        className="text-[9px] font-bold text-muted/50 hover:text-danger hover:bg-danger/5 px-2 py-0.5 rounded-full border border-white/5 transition-all"
                    >
                        {t.logs.clearAll}
                    </button>
                </div>
            </div>

            <div className="h-px bg-white/10 mb-2" />

            <div className="flex flex-col gap-2">
                {logs.map((log) => {
                    const isExpanded = expandedLogIds.has(log.id);
                    return (
                        <div
                            key={log.id}
                            className={`rounded-xl border border-white/5 bg-surface/30 flex flex-col overflow-hidden transition-all hover:bg-surface/50 group`}
                        >
                            {/* Header / Summary */}
                            <div
                                className="p-3 cursor-pointer flex items-center gap-2.5"
                                onClick={() => toggleLog(log.id)}
                            >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${log.type === 'error' ? 'bg-danger/10' :
                                    log.type === 'success' ? 'bg-primary/10' : 'bg-blue-400/10'
                                    }`}>
                                    {getIcon(log.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold text-white truncate">
                                        {log.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-muted flex items-center gap-1">
                                            <Clock size={8} />
                                            {formatTime(log.timestamp)}
                                        </span>
                                        {log.targetName && (
                                            <span className="text-[9px] text-primary/60 font-medium truncate">
                                                • {log.targetName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={`text-muted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                    <ChevronRight size={14} />
                                </div>
                            </div>

                            {/* Collapsible Details */}
                            <div className={`
                                grid transition-all duration-300 ease-in-out
                                ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                            `}>
                                <div className="overflow-hidden">
                                    <div className="px-3 pb-3 pt-1 border-t border-white/5">
                                        <div className="bg-black/40 rounded-lg p-2.5 flex flex-col gap-1.5">
                                            <span className="text-[8px] font-bold text-muted uppercase tracking-widest">{t.logs.details || 'TECHNICAL DETAILS'}</span>
                                            <p className="text-[10px] text-muted font-mono break-all leading-relaxed tracking-tight">
                                                {log.details || t.logs.noDetails || 'No technical details available.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
