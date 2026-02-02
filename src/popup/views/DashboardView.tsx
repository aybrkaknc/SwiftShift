/**
 * DashboardView
 * Ana dashboard görünümü - Refaktör edilmiş versiyon.
 */

import React, { useState, useEffect } from 'react';
import { TelegramTarget, UserProfile, StorageService } from '../../services/storage';
import { TelegramService } from '../../services/telegram';
import { RecentsService, RecentSend } from '../../services/recents';
import { RecentsView } from './RecentsView';
import { LogService, LogEntry } from '../../services/logService';
import { LogsView } from './LogsView';
import { Search, Users, LogOut, RefreshCw, Plus } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { TargetListItem } from '../components/TargetListItem';
import { AddDestinationModal } from '../components/AddDestinationModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { TabBar, TabType } from '../components/TabBar';

interface DashboardViewProps {
    profile: UserProfile;
    targets: TelegramTarget[];
    onRefresh: () => void;
    onLogout: () => void;
    onDeleteTarget: (id: string) => void;
    onAddTarget?: (target: TelegramTarget) => void;
    onRenameTarget?: (id: string, newName: string) => void;
    onTogglePin?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    profile,
    targets,
    onRefresh,
    onLogout,
    onDeleteTarget,
    onAddTarget,
    onRenameTarget,
    onTogglePin
}) => {
    // === STATE ===
    const [selectedId, setSelectedId] = useState<string>('');
    const [isSending, setIsSending] = useState(false);
    const [filter, setFilter] = useState('');
    const [expandedChannels, setExpandedChannels] = useState<Record<string, boolean>>({});

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Tab State
    const [activeTab, setActiveTab] = useState<TabType>('channels');

    // Status Message State (Toast)
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isToastExiting, setIsToastExiting] = useState(false);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [clearModal, setClearModal] = useState<{ open: boolean, type: 'recents' | 'logs' }>({ open: false, type: 'recents' });

    // Recents & Logs State
    const [recents, setRecents] = useState<RecentSend[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // === EFFECTS ===
    useEffect(() => {
        if (status) {
            setIsToastExiting(false);
            const exitTimer = setTimeout(() => setIsToastExiting(true), 3000);
            const removeTimer = setTimeout(() => setStatus(null), 3400);
            return () => {
                clearTimeout(exitTimer);
                clearTimeout(removeTimer);
            };
        }
    }, [status]);

    useEffect(() => {
        if (activeTab === 'recents') {
            RecentsService.getAll().then(setRecents);
        } else if (activeTab === 'logs') {
            LogService.getAll().then(setLogs);
        }
    }, [activeTab]);

    useEffect(() => {
        chrome.storage.local.get('recentTargets', (data) => {
            const recent = data.recentTargets;
            if (recent && recent.length > 0 && targets.find(t => t.id === recent[0])) {
                setSelectedId(recent[0]);
            } else if (targets.length > 0) {
                setSelectedId(targets[0].id);
            }
        });
    }, [targets]);

    // === HANDLERS ===
    const handleSelect = async (id: string) => {
        if (editingId) return;
        setSelectedId(id);
        await StorageService.addRecentTarget(id);
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    };

    const startEditing = (target: TelegramTarget) => {
        setEditingId(target.id);
        setEditName(target.name);
    };

    const saveEditing = () => {
        if (editingId && onRenameTarget) {
            onRenameTarget(editingId, editName);
        }
        setEditingId(null);
        setEditName('');
    };

    const handleSendDirect = async (targetId: string) => {
        if (isSending) return;

        const target = targets.find(t => t.id === targetId);
        if (!target) return;

        setIsSending(true);

        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        if (!tab?.url) {
            const [fallbackTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!fallbackTab?.url) {
                setIsSending(false);
                return;
            }
        }

        if (!tab?.id || !tab.url) {
            setIsSending(false);
            return;
        }

        const payload = {
            chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
            threadId: target.threadId,
            text: `${tab.title}\n${tab.url}`
        };

        const result = await TelegramService.sendPayloadSmart(profile.botToken, payload);

        setStatus({
            message: result.success ? `Sent to ${target.name}` : `Error: ${result.error}`,
            type: result.success ? 'success' : 'error'
        });

        if (result.success) {
            await RecentsService.add({
                type: 'link',
                content: tab.url,
                preview: tab.title || tab.url,
                targetName: target.name,
                targetId: target.id,
                threadId: target.threadId
            });
        }

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: result.success ? 'Sent Successfully' : 'Failed to Send',
            message: result.success ? `Sent to ${target.name}` : (result.error || 'Unknown Error')
        });

        setIsSending(false);
        handleSelect(targetId);
    };

    const handleDeleteRecent = async (id: string) => {
        await RecentsService.delete(id);
        const updated = await RecentsService.getAll();
        setRecents(updated);
    };

    const handleResendRecent = async (item: RecentSend) => {
        if (isSending) return;
        setIsSending(true);

        const payload: any = {
            chatId: item.targetId.includes(':') ? item.targetId.split(':')[0] : item.targetId,
            threadId: item.threadId,
        };

        if (item.type === 'link') {
            payload.text = `${item.preview}\n${item.content}`;
        } else if (item.type === 'image') {
            payload.photo = item.content;
        } else if (item.type === 'audio') {
            payload.audio = item.content;
        } else if (item.type === 'location') {
            payload.text = item.content;
        } else if (item.type === 'file') {
            payload.document = item.content;
        } else {
            payload.text = item.content;
        }

        const result = await TelegramService.sendPayloadSmart(profile.botToken, payload);

        setStatus({
            message: result.success ? `Resent to ${item.targetName}` : `Resend Error: ${result.error}`,
            type: result.success ? 'success' : 'error'
        });

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: result.success ? 'Resent Successfully' : 'Failed to Resend',
            message: result.success ? `Resent to ${item.targetName}` : (result.error || 'Unknown Error')
        });

        if (result.success) {
            await RecentsService.delete(item.id);
            await RecentsService.add({
                type: item.type,
                content: item.content,
                preview: item.preview,
                targetName: item.targetName,
                targetId: item.targetId,
                threadId: item.threadId
            });
            const updated = await RecentsService.getAll();
            setRecents(updated);
        }

        setIsSending(false);
    };

    const handleManualRefresh = async () => {
        if (activeTab === 'channels') {
            onRefresh();
            setStatus({ message: 'Channels updated', type: 'success' });
        } else if (activeTab === 'recents') {
            const data = await RecentsService.getAll();
            setRecents(data);
            setStatus({ message: 'Recents updated', type: 'success' });
        } else if (activeTab === 'logs') {
            const data = await LogService.getAll();
            setLogs(data);
            setStatus({ message: 'Logs updated', type: 'success' });
        }
    };

    const confirmClear = async () => {
        if (clearModal.type === 'recents') {
            await RecentsService.clear();
            setRecents([]);
            setStatus({ message: 'Recents history cleared', type: 'success' });
        } else {
            await LogService.clear();
            setLogs([]);
            setStatus({ message: 'System logs cleared', type: 'success' });
        }
        setClearModal({ ...clearModal, open: false });
    };

    const handleAddDestination = async (chatId: string, title: string) => {
        let finalGroupId = chatId;
        let threadId: number | undefined = undefined;
        let detectedType: TelegramTarget['type'] = 'private';

        const urlMatch = chatId.match(/(-?\d+)[_: ](\d+)/);
        if (urlMatch) {
            finalGroupId = urlMatch[1];
            threadId = parseInt(urlMatch[2]);
        } else {
            const simpleIdMatch = chatId.match(/(-?\d+)$/);
            if (simpleIdMatch) {
                finalGroupId = simpleIdMatch[1];
            }
        }

        if (threadId) {
            detectedType = 'topic';
        } else if (finalGroupId.startsWith('-')) {
            detectedType = 'channel';
        } else {
            detectedType = 'private';
        }

        const chatCheck = await TelegramService.getChat(profile.botToken, finalGroupId) as any;
        if (!chatCheck.ok) {
            setStatus({
                message: `Bot warning: ${chatCheck.description || 'No access to this chat.'}`,
                type: 'error'
            });
        }

        const storageId = threadId ? `${finalGroupId}:${threadId}` : finalGroupId;

        const newTarget: TelegramTarget = {
            id: storageId,
            name: title,
            type: detectedType,
            username: '',
            threadId: threadId
        };

        if (onAddTarget) {
            onAddTarget(newTarget);
        }

        setIsAddModalOpen(false);
    };

    // === COMPUTED VALUES ===
    const filteredTargets = targets
        .filter(t =>
            t.name.toLowerCase().includes(filter.toLowerCase()) ||
            t.username?.toLowerCase().includes(filter.toLowerCase())
        )
        .sort((a, b) => {
            if (a.pinned === b.pinned) return 0;
            return a.pinned ? -1 : 1;
        });

    const personal = filteredTargets.filter(t => t.type === 'private');
    const parents = filteredTargets.filter(t =>
        (t.type === 'channel' || t.type === 'group') && !t.parentId
    );

    const childrenMap = new Map<string, TelegramTarget[]>();
    filteredTargets
        .filter(t => t.parentId)
        .forEach(topic => {
            const existing = childrenMap.get(topic.parentId!) || [];
            existing.push(topic);
            childrenMap.set(topic.parentId!, existing);
        });

    const orphanTopics = filteredTargets.filter(t =>
        t.type === 'topic' &&
        t.parentId &&
        !parents.some(p => p.id === t.parentId)
    );

    // === RENDER HELPERS ===
    const renderTargetSection = (
        title: string,
        list: TelegramTarget[],
        includeChildren: boolean = false
    ) => (
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
                        children={includeChildren ? childrenMap.get(target.id) : undefined}
                        isSelected={selectedId === target.id}
                        isExpanded={expandedChannels[target.id] ?? true}
                        editingId={editingId}
                        editName={editName}
                        onSelect={handleSelect}
                        onToggleExpand={(id) => setExpandedChannels(prev => ({ ...prev, [id]: !prev[id] }))}
                        onStartEdit={startEditing}
                        onSaveEdit={saveEditing}
                        onCancelEdit={() => setEditingId(null)}
                        onEditNameChange={setEditName}
                        onDelete={onDeleteTarget}
                        onTogglePin={onTogglePin}
                        onSendDirect={handleSendDirect}
                        isSending={isSending}
                    />
                ))}
            </div>
        </div>
    );

    // === RENDER ===
    return (
        <div className="flex-1 flex flex-col h-full bg-background text-white overflow-hidden relative">

            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                    <img src="icons/icon128.png" className="w-5 h-5 object-contain" alt="SwiftShift Logo" />
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold tracking-tight leading-tight">SwiftShift</h1>
                        {profile.displayName && (
                            <span className="text-[10px] text-muted font-medium -mt-0.5">Hello, {profile.displayName}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    {activeTab === 'channels' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-white hover:bg-white/10 transition-all"
                            title="Add Chat"
                        >
                            <Plus size={18} />
                        </button>
                    )}
                    <button
                        onClick={handleManualRefresh}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-all"
                        title="Reload List"
                    >
                        <RefreshCw size={18} className={isSending ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-danger hover:bg-danger/10 transition-all"
                        title="Logout"
                    >
                        <LogOut size={18} className="-translate-x-[1px]" />
                    </button>
                </div>
            </header>

            {/* Status Toast */}
            {status && (
                <div className={`
                    absolute top-[52px] left-0 right-0 z-50 px-4 py-2 
                    ${isToastExiting ? 'toast-animate-out' : 'toast-animate-in'}
                    ${status.type === 'success' ? 'bg-primary/20 text-primary border-b border-primary/20' : 'bg-danger/20 text-danger border-b border-danger/20'}
                    backdrop-blur-md text-[11px] font-bold text-center shadow-lg
                `}>
                    {status.message}
                </div>
            )}

            {/* Bot Info & Search */}
            <div className="pt-3 pb-1 px-4 flex items-center justify-center gap-2">
                <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </div>
                <div
                    onClick={() => {
                        const botUser = profile.username || profile.name.replace(/\s+/g, '');
                        window.open(`https://t.me/${botUser}`, '_blank');
                    }}
                    className="text-muted text-[10px] font-bold tracking-widest uppercase cursor-pointer group"
                >
                    Bot: <span className="text-white group-hover:text-primary transition-colors">@{profile.username || profile.name}</span>
                </div>
            </div>

            <div className="px-4 py-3">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search size={16} className="text-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2 border border-white/5 rounded-xl bg-surface/40 text-sm text-white placeholder-muted/50 focus:ring-1 focus:ring-primary focus:border-primary/40 focus:bg-surface/60 transition-all outline-none"
                        placeholder="Quick search..."
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Tab Bar */}
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            {activeTab === 'channels' ? (
                <div className={`flex-1 overflow-y-auto px-4 pb-6 no-scrollbar ${filteredTargets.length === 0 ? 'flex flex-col items-center justify-center' : ''}`}>
                    {filteredTargets.length === 0 ? (
                        <div className="text-center py-10 px-6 flex flex-col items-center gap-4 bg-surface/20 rounded-2xl border border-white/5 w-full">
                            <Users size={20} className="text-muted" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold">No destinations added</p>
                                <p className="text-[9px] text-muted leading-tight">Click + to add a chat manually.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full">
                            {personal.length > 0 && renderTargetSection('Personal', personal)}
                            {parents.length > 0 && renderTargetSection('Channels & Groups', parents, true)}
                            {orphanTopics.length > 0 && renderTargetSection('Other Topics', orphanTopics)}
                        </div>
                    )}
                </div>
            ) : activeTab === 'recents' ? (
                <RecentsView
                    recents={recents}
                    onDelete={handleDeleteRecent}
                    onResend={handleResendRecent}
                    onClearAll={() => setClearModal({ open: true, type: 'recents' })}
                />
            ) : (
                <LogsView
                    logs={logs}
                    onClear={() => setClearModal({ open: true, type: 'logs' })}
                />
            )}

            {/* Add Destination Modal */}
            <AddDestinationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddDestination}
            />

            {/* Clear Confirmation Modal */}
            <ConfirmModal
                isOpen={clearModal.open}
                title={`Clear ${clearModal.type === 'recents' ? 'Recents' : 'Logs'}?`}
                message={`This action cannot be undone. All recorded ${clearModal.type} will be permanently deleted.`}
                confirmText="Clear All"
                onConfirm={confirmClear}
                onCancel={() => setClearModal({ ...clearModal, open: false })}
                variant="danger"
            />
        </div>
    );
};
