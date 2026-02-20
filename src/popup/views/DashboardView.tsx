/**
 * DashboardView
 * Ana dashboard görünümü - Optimize edilmiş versiyon (v0.3.1).
 * - O(N) orphan topic tespiti
 * - useMemo ve useCallback ile render optimizasyonu
 * - TargetSectionList bileşeni kullanımı
 * - i18n desteği (useTranslation)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TelegramTarget, UserProfile, StorageService } from '../../services/storage';
import { TelegramService } from '../../services/telegram';
import { RecentsService, RecentSend } from '../../services/recents';
import { RecentsView } from './RecentsView';
import { LogService, LogEntry } from '../../services/logService';
import { LogsView } from './LogsView';
import { Search, Users, LogOut, RefreshCw, Plus } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { AddDestinationModal } from '../components/AddDestinationModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { TabBar, TabType } from '../components/TabBar';
import { TargetSectionList } from '../components/TargetSectionList';
import { ErrorService } from '../../services/errorService';
import { useTranslation } from '../../utils/useTranslation';

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
    const { t, locale, toggleLocale } = useTranslation();

    // === STATE ===
    const [selectedId, setSelectedId] = useState<string>('');
    const [isSending, setIsSending] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState('');
    const [expandedChannels, setExpandedChannels] = useState<Record<string, boolean>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        personal: true,
        channels: true,
        orphans: true
    });

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
            if (recent && recent.length > 0 && targets.find(t2 => t2.id === recent[0])) {
                setSelectedId(recent[0]);
            } else if (targets.length > 0) {
                setSelectedId(targets[0].id);
            }
        });
    }, [targets]);

    // === MEMOIZED CALCULATIONS ===

    // 1. Structural Memo (depends only on targets)
    const { childrenMap, parentIds } = useMemo(() => {
        const cMap = new Map<string, TelegramTarget[]>();
        const pIds = new Set<string>();

        targets.forEach(tItem => {
            if (tItem.parentId) {
                const existing = cMap.get(tItem.parentId) || [];
                existing.push(tItem);
                cMap.set(tItem.parentId, existing);
            } else {
                pIds.add(tItem.id);
            }
        });

        return { childrenMap: cMap, parentIds: pIds };
    }, [targets]);

    // 2. Filter Memo (depends on filter, targets, and structure)
    const { filteredTargets, personal, parents, orphanTopics } = useMemo(() => {
        // Filter
        const filtered = targets
            .filter(tItem =>
                tItem.name.toLowerCase().includes(filter.toLowerCase()) ||
                tItem.username?.toLowerCase().includes(filter.toLowerCase())
            )
            .sort((a, b) => {
                if (a.pinned === b.pinned) return 0;
                return a.pinned ? -1 : 1;
            });

        // Grouping
        const personalList = filtered.filter(tItem => tItem.type === 'private');
        const parentsList = filtered.filter(tItem =>
            (tItem.type === 'channel' || tItem.type === 'group') && !tItem.parentId
        );

        // Orphan Topics Check - Optimized O(N) using Set from structure memo
        const orphans = filtered.filter(tItem =>
            tItem.type === 'topic' &&
            tItem.parentId &&
            !parentIds.has(tItem.parentId)
        );

        return {
            filteredTargets: filtered,
            personal: personalList,
            parents: parentsList,
            orphanTopics: orphans
        };
    }, [targets, filter, parentIds]);

    // === HANDLERS (CALLBACKS) ===

    const handleToggleSection = useCallback((section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    const handleSelect = useCallback(async (id: string) => {
        if (editingId) return;
        setSelectedId(id);
        await StorageService.addRecentTarget(id);
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    }, [editingId]);

    const startEditing = useCallback((target: TelegramTarget) => {
        setEditingId(target.id);
        setEditName(target.name);
    }, []);

    const saveEditing = useCallback(() => {
        if (editingId && onRenameTarget) {
            onRenameTarget(editingId, editName);
        }
        setEditingId(null);
        setEditName('');
    }, [editingId, editName, onRenameTarget]);

    const cancelEditing = useCallback(() => {
        setEditingId(null);
    }, []);

    const handleToggleExpand = useCallback((id: string) => {
        setExpandedChannels(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const handleSendDirect = useCallback(async (targetId: string) => {
        if (isSending) return;

        const target = targets.find(tItem => tItem.id === targetId);
        if (!target) return;

        setIsSending(true);

        try {
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

            const isSelfSend = targetId === profile.id;
            let finalChatId = isSelfSend ? profile.chatId : (targetId.includes(':') ? targetId.split(':')[0] : targetId);

            // Self send validation & Auto-fix
            if (isSelfSend && !finalChatId) {
                // Try to detect it one last time
                const detectedId = await TelegramService.detectUserChatId(profile.botToken);
                if (detectedId) {
                    finalChatId = detectedId;
                    // Update profile for future
                    const updatedProfile = { ...profile, chatId: detectedId };
                    await StorageService.saveProfile(updatedProfile);
                } else {
                    setStatus({
                        message: "Please send a message to your bot first!",
                        type: 'error'
                    });
                    chrome.tabs.create({ url: `https://t.me/${profile.username}` });
                    setIsSending(false);
                    return;
                }
            }

            const payload = {
                chatId: finalChatId,
                threadId: isSelfSend ? undefined : target.threadId,
                text: `${tab.title}\n${tab.url}`
            };

            const result = await TelegramService.sendPayloadSmart(profile.botToken, payload);

            setStatus({
                message: result.success
                    ? t.dashboard.sentTo.replace('{name}', target.name)
                    : t.dashboard.sendError.replace('{error}', result.error || ''),
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

                await LogService.add({
                    type: 'success',
                    message: t.dashboard.sentTo.replace('{name}', target.name),
                    targetName: target.name
                });
            } else {
                await ErrorService.handle(result.error || 'Send failed', 'DashboardView.sendDirect');
            }

            if (result.success) {
                handleSelect(targetId);
            }

        } catch (error) {
            await ErrorService.handle(error, 'DashboardView.sendDirect');
        } finally {
            setIsSending(false);
        }
    }, [isSending, targets, profile.botToken, handleSelect, t]);

    const handleDeleteRecent = useCallback(async (id: string) => {
        await RecentsService.delete(id);
        const updated = await RecentsService.getAll();
        setRecents(updated);
    }, []);

    const handleResendRecent = useCallback(async (item: RecentSend) => {
        if (isSending) return;
        setIsSending(true);

        try {
            const isSelfSend = item.targetId === profile.id;
            let finalChatId = isSelfSend ? profile.chatId : (item.targetId.includes(':') ? item.targetId.split(':')[0] : item.targetId);

            if (isSelfSend && !finalChatId) {
                // Try to detect it one last time
                const detectedId = await TelegramService.detectUserChatId(profile.botToken);
                if (detectedId) {
                    finalChatId = detectedId;
                    // Update profile for future
                    const updatedProfile = { ...profile, chatId: detectedId };
                    await StorageService.saveProfile(updatedProfile);
                } else {
                    setStatus({
                        message: "Please send a message to your bot first!",
                        type: 'error'
                    });
                    chrome.tabs.create({ url: `https://t.me/${profile.username}` });
                    setIsSending(false);
                    return;
                }
            }

            const payload: any = {
                chatId: finalChatId,
                threadId: isSelfSend ? undefined : item.threadId,
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
                message: result.success
                    ? t.dashboard.resentTo.replace('{name}', item.targetName)
                    : t.dashboard.resendError.replace('{error}', result.error || ''),
                type: result.success ? 'success' : 'error'
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

                await LogService.add({
                    type: 'success',
                    message: t.dashboard.resentTo.replace('{name}', item.targetName),
                    targetName: item.targetName
                });
            } else {
                await ErrorService.handle(result.error || 'Resend failed', 'DashboardView.resend');
            }
        } catch (error) {
            await ErrorService.handle(error, 'DashboardView.resend');
        } finally {
            setIsSending(false);
        }
    }, [isSending, profile.botToken, t]);


    const handleManualRefresh = useCallback(async () => {
        setIsRefreshing(true);

        // At least 600ms of spinning for visual feedback
        const minSpin = new Promise(resolve => setTimeout(resolve, 600));

        try {
            if (activeTab === 'channels') {
                onRefresh();
                setStatus({ message: t.dashboard.channelsUpdated, type: 'success' });
            } else if (activeTab === 'recents') {
                const data = await RecentsService.getAll();
                setRecents(data);
                setStatus({ message: t.dashboard.recentsUpdated, type: 'success' });
            } else if (activeTab === 'logs') {
                const data = await LogService.getAll();
                setLogs(data);
                setStatus({ message: t.dashboard.logsUpdated, type: 'success' });
            }
            await minSpin;
        } finally {
            setIsRefreshing(false);
        }
    }, [activeTab, onRefresh, t]);

    const confirmClear = useCallback(async () => {
        if (clearModal.type === 'recents') {
            await RecentsService.clear();
            setRecents([]);
            setStatus({ message: t.recents.recentsCleared, type: 'success' });
        } else {
            await LogService.clear();
            setLogs([]);
            setStatus({ message: t.logs.logsCleared, type: 'success' });
        }
        setClearModal({ ...clearModal, open: false });
    }, [clearModal, t]);

    const handleAddDestination = useCallback(async (chatId: string, title: string) => {
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
                message: t.dashboard.botWarning.replace('{error}', chatCheck.description || 'No access to this chat.'),
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
    }, [profile.botToken, onAddTarget, t]);

    // === RENDER ===
    return (
        <div className="flex-1 flex flex-col h-full bg-background text-white overflow-hidden relative">

            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                    <img src="icons/icon128.png" className="w-7 h-7 object-contain" alt="SwiftShift Logo" />
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold tracking-tight leading-tight">SwiftShift</h1>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    {activeTab === 'channels' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-white hover:bg-white/10 transition-all"
                            title={t.dashboard.addChat}
                        >
                            <Plus size={18} />
                        </button>
                    )}
                    <button
                        onClick={handleManualRefresh}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-all"
                        title={t.dashboard.reloadList}
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={toggleLocale}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-white hover:bg-white/10 transition-all text-[10px] font-black tracking-wide"
                        title={locale === 'en' ? 'Switch to Turkish' : 'İngilizceye Geç'}
                    >
                        {locale.toUpperCase()}
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-danger hover:bg-danger/10 transition-all"
                        title={t.dashboard.logout}
                    >
                        <LogOut size={18} className="-translate-x-[1px]" />
                    </button>
                </div>
            </header>

            {/* Status Toast */}
            {status && (
                <div className={`
                    absolute bottom-0 left-0 right-0 z-50 px-4 py-2 
                    ${isToastExiting ? 'toast-animate-out-bottom' : 'toast-animate-in-bottom'}
                    ${status.type === 'success' ? 'bg-primary/20 text-primary border-t border-primary/20' : 'bg-danger/20 text-danger border-t border-danger/20'}
                    backdrop-blur-md text-[11px] font-bold text-center shadow-lg
                `}>
                    {status.message}
                </div>
            )}



            <div className="px-4 py-3">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search size={16} className="text-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-36 py-2 border border-white/5 rounded-xl bg-surface/40 text-sm text-white placeholder-muted/50 focus:ring-1 focus:ring-primary focus:border-primary/40 focus:bg-surface/60 transition-all outline-none"
                        placeholder={t.dashboard.searchPlaceholder}
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    {/* Integrated Bot Badge */}
                    <div
                        onClick={() => {
                            const botUser = profile.username || profile.name.replace(/\s+/g, '');
                            window.open(`https://t.me/${botUser}`, '_blank');
                        }}
                        className="absolute inset-y-0 right-2 flex items-center cursor-pointer group/bot"
                        title="View Bot on Telegram"
                    >
                        <div className="flex items-center gap-2 px-3 py-0.5 rounded-lg bg-white/[0.03] border border-white/5 group-hover/bot:bg-primary/10 group-hover/bot:border-primary/20 transition-all">
                            <div className="w-1 h-1 rounded-full bg-primary/40 group-hover/bot:bg-primary transition-colors"></div>
                            <span className="text-[9px] font-bold text-muted/40 group-hover/bot:text-primary transition-colors uppercase tracking-wider">
                                @{profile.username || profile.name}
                            </span>
                        </div>
                    </div>
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
                                <p className="text-xs font-bold">{t.dashboard.noDestinations}</p>
                                <p className="text-[9px] text-muted leading-tight">{t.dashboard.noDestinationsHint}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full">
                            {/* Personal Chats */}
                            <TargetSectionList
                                title={t.dashboard.sectionPersonal}
                                list={personal}
                                childrenMap={childrenMap}
                                selectedId={selectedId}
                                expandedChannels={expandedChannels}
                                editingId={editingId}
                                editName={editName}
                                isSending={isSending}
                                isSectionExpanded={expandedSections.personal}
                                onToggleSection={() => handleToggleSection('personal')}
                                onSelect={handleSelect}
                                onToggleExpand={handleToggleExpand}
                                onStartEdit={startEditing}
                                onSaveEdit={saveEditing}
                                onCancelEdit={cancelEditing}
                                onEditNameChange={setEditName}
                                onDelete={onDeleteTarget}
                                onTogglePin={onTogglePin}
                                onSendDirect={handleSendDirect}
                            />

                            {/* Channels & Groups */}
                            <TargetSectionList
                                title={t.dashboard.sectionChannels}
                                list={parents}
                                childrenMap={childrenMap}
                                selectedId={selectedId}
                                expandedChannels={expandedChannels}
                                editingId={editingId}
                                editName={editName}
                                isSending={isSending}
                                isSectionExpanded={expandedSections.channels}
                                onToggleSection={() => handleToggleSection('channels')}
                                onSelect={handleSelect}
                                onToggleExpand={handleToggleExpand}
                                onStartEdit={startEditing}
                                onSaveEdit={saveEditing}
                                onCancelEdit={cancelEditing}
                                onEditNameChange={setEditName}
                                onDelete={onDeleteTarget}
                                onTogglePin={onTogglePin}
                                onSendDirect={handleSendDirect}
                            />

                            {/* Orphan Topics (Topics without known parent channel) */}
                            <TargetSectionList
                                title={t.dashboard.sectionOrphans}
                                list={orphanTopics}
                                childrenMap={childrenMap}
                                selectedId={selectedId}
                                expandedChannels={expandedChannels}
                                editingId={editingId}
                                editName={editName}
                                isSending={isSending}
                                isSectionExpanded={expandedSections.orphans}
                                onToggleSection={() => handleToggleSection('orphans')}
                                onSelect={handleSelect}
                                onToggleExpand={handleToggleExpand}
                                onStartEdit={startEditing}
                                onSaveEdit={saveEditing}
                                onCancelEdit={cancelEditing}
                                onEditNameChange={setEditName}
                                onDelete={onDeleteTarget}
                                onTogglePin={onTogglePin}
                                onSendDirect={handleSendDirect}
                            />
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
                title={clearModal.type === 'recents' ? t.confirmModal.clearRecents : t.confirmModal.clearLogs}
                message={clearModal.type === 'recents' ? t.confirmModal.clearRecentsMsg : t.confirmModal.clearLogsMsg}
                confirmText={t.confirmModal.clearAll}
                onConfirm={confirmClear}
                onCancel={() => setClearModal({ ...clearModal, open: false })}
                variant="danger"
            />
        </div>
    );
};
