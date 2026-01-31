import React, { useState, useEffect } from 'react';
import { TelegramTarget, UserProfile, StorageService } from '../../services/storage';
import { TelegramService } from '../../services/telegram';
import { Search, Hash, Megaphone, Users, Bookmark, Send, LogOut, Zap, RefreshCw, Trash2, Edit2, Check, Pin, ExternalLink } from 'lucide-react';

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

export const DashboardView: React.FC<DashboardViewProps> = ({ profile, targets, onRefresh, onLogout, onDeleteTarget, onAddTarget, onRenameTarget, onTogglePin }) => {
    // ... (state matches existing)
    const [selectedId, setSelectedId] = useState<string>('');
    const [isSending, setIsSending] = useState(false);
    const [filter, setFilter] = useState('');

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // ... (useEffect for initial selection matches existing)
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

    // ... (handleSelect matches existing)
    const handleSelect = async (id: string) => {
        if (editingId) return; // Prevent selection while editing
        setSelectedId(id);
        await StorageService.addRecentTarget(id);
        // Refresh context menu to update "Recent" items
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    };

    // ... (editing functions match existing)
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

    // ... (handleSendDirect UPDATED)
    const handleSendDirect = async (targetId: string) => {
        if (isSending) return;

        const target = targets.find(t => t.id === targetId);
        if (!target) return;

        setIsSending(true);

        // Use lastFocusedWindow to support sending from detached window
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        // If no tab found or url missing (maybe detached window focused), try current window as fallback
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

        // Native Notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: result.success ? 'Sent Successfully' : 'Failed to Send',
            message: result.success ? `Sent to ${target.name}` : (result.error || 'Unknown Error')
        });

        setIsSending(false);
        // Son kullanılan hedefi güncelle
        handleSelect(targetId);
    };

    // Filter AND Sort targets (Pinned first)
    const filteredTargets = targets
        .filter(t =>
            t.name.toLowerCase().includes(filter.toLowerCase()) ||
            t.username?.toLowerCase().includes(filter.toLowerCase())
        )
        .sort((a, b) => {
            if (a.pinned === b.pinned) return 0;
            return a.pinned ? -1 : 1;
        });

    // ... (helpers match existing)
    const renderIcon = (type: string) => {
        switch (type) {
            case 'channel': return <Megaphone size={14} />;
            case 'group': return <Users size={14} />;
            case 'private': return <Bookmark size={14} />;
            case 'topic': return <Hash size={14} />;
            default: return <Hash size={14} />;
        }
    };

    // ... (keep handleAdd logic & state)
    // State for Manual Add Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newChatId, setNewChatId] = useState('');
    const [newChatTitle, setNewChatTitle] = useState('');
    const [validationError, setValidationError] = useState(false);

    const handleAdd = async () => {
        const idInput = newChatId.trim();
        const titleInput = newChatTitle.trim();

        if (!idInput || !titleInput) {
            setValidationError(true);
            return;
        }

        let finalGroupId = idInput;
        let threadId: number | undefined = undefined;
        let detectedType: TelegramTarget['type'] = 'private';

        // 1. Handle URL or ID parsing
        // Supports: 
        // -100123456789 (Group/Channel)
        // -100123456789_123 (Topic URL style)
        // -100123456789:123 (Topic colon style)
        // https://web.telegram.org/a/#-100123456789_123 (Full URL)

        const urlMatch = idInput.match(/(-?\d+)[_: ](\d+)/);
        if (urlMatch) {
            finalGroupId = urlMatch[1];
            threadId = parseInt(urlMatch[2]);
        } else {
            // Check for simple ID which might be at the end of a URL
            const simpleIdMatch = idInput.match(/(-?\d+)$/);
            if (simpleIdMatch) {
                finalGroupId = simpleIdMatch[1];
            }
        }

        // 2. Auto-Detect Type
        if (threadId) {
            detectedType = 'topic';
        } else if (finalGroupId.startsWith('-')) {
            detectedType = 'channel';
        } else {
            detectedType = 'private';
        }

        // 3. Construct Unique ID for Storage
        // For topics, we use groupId:threadId to avoid collisions
        const storageId = threadId ? `${finalGroupId}:${threadId}` : finalGroupId;

        const newTarget: TelegramTarget = {
            id: storageId,
            name: titleInput,
            type: detectedType,
            username: '',
            threadId: threadId
        };

        if (onAddTarget) {
            onAddTarget(newTarget);
        }

        setIsAddModalOpen(false);
        setNewChatId('');
        setNewChatTitle('');
    };

    const personal = filteredTargets.filter(t => t.type === 'private');

    // === HIERARCHICAL GROUPING ===
    // Parents (channels/groups without parentId)
    const parents = filteredTargets.filter(t =>
        (t.type === 'channel' || t.type === 'group') && !t.parentId
    );

    // Build tree: parentId -> children map
    const childrenMap = new Map<string, TelegramTarget[]>();
    filteredTargets
        .filter(t => t.parentId)
        .forEach(topic => {
            const existing = childrenMap.get(topic.parentId!) || [];
            existing.push(topic);
            childrenMap.set(topic.parentId!, existing);
        });

    // Orphan topics (topics without a parent in the list)
    const orphanTopics = filteredTargets.filter(t =>
        t.type === 'topic' &&
        t.parentId &&
        !parents.some(p => p.id === t.parentId)
    );

    const renderTargetList = (list: TelegramTarget[]) => (
        <div className="flex flex-col gap-1.5">
            {list.map(target => (
                <div
                    key={target.id}
                    className={`
                        relative flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all group
                        ${selectedId === target.id
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-transparent hover:border-white/5 hover:bg-surface/30'
                        }
                    `}
                    onClick={() => handleSelect(target.id)}
                >
                    {/* Icon */}
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 relative
                        ${selectedId === target.id ? 'bg-primary/20 text-primary' : 'bg-surface/50 text-muted'}
                    `}>
                        {renderIcon(target.type)}
                        {/* Pinned Indicator on Icon */}
                        {target.pinned && (
                            <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5 border border-white/10">
                                <Pin size={8} className="text-primary fill-primary" />
                            </div>
                        )}
                    </div>

                    {/* Content (Editable) */}
                    <div className="flex flex-col overflow-hidden flex-1">
                        {editingId === target.id ? (
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <input
                                    className="w-full bg-black/50 border border-primary/50 rounded px-1 text-[13px] text-white focus:outline-none h-6"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') saveEditing();
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                />
                                <button onClick={saveEditing} className="text-primary hover:text-white">
                                    <Check size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className={`text-[13px] font-bold transition-colors truncate flex items-center gap-1.5 ${selectedId === target.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {target.name}
                                </p>
                                <p className="text-[9px] font-bold text-muted/60 uppercase tracking-tighter truncate">{target.type}</p>
                            </>
                        )}
                    </div>

                    {/* Actions (Floating Glass Pill) */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-xl bg-surface/80 backdrop-blur-md border border-white/10 shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-10">
                        {!editingId && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onTogglePin) onTogglePin(target.id);
                                    }}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${target.pinned ? 'text-primary bg-primary/10' : 'text-muted hover:text-white hover:bg-white/10'}`}
                                    title={target.pinned ? "Unpin" : "Pin to top"}
                                >
                                    <Pin size={14} className={target.pinned ? "fill-primary" : ""} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(target);
                                    }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-all"
                                    title="Rename"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTarget(target.id);
                                    }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all"
                                    title="Remove"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div className="w-px h-4 bg-white/10 mx-0.5" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendDirect(target.id);
                                    }}
                                    disabled={isSending}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-all active:scale-90"
                                    title="Send Current"
                                >
                                    <Send size={16} strokeWidth={2.5} className="rotate-45" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-background text-white overflow-hidden relative">

            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b border-white/5 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                    <Zap className="text-primary fill-primary" size={20} />
                    <h1 className="text-base font-bold tracking-tight">SwiftShift</h1>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            chrome.windows.create({
                                url: 'popup.html',
                                type: 'popup',
                                width: 400,
                                height: 580
                            });
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-all"
                        title="Pop Out Window (Keep Open)"
                    >
                        <ExternalLink size={16} />
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-all font-bold text-lg"
                        title="Add Chat"
                    >
                        +
                    </button>
                    <button
                        onClick={onRefresh}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-all"
                        title="Reload List"
                    >
                        <RefreshCw size={18} className={isSending ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Bot Info & Search */}
            <div className="pt-3 pb-1 px-5 flex items-center justify-center gap-2">
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

            <div className="px-5 py-3">
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

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
                {filteredTargets.length === 0 ? (
                    <div className="text-center py-10 px-6 flex flex-col items-center gap-4 bg-surface/20 rounded-2xl border border-white/5 mt-2">
                        <Users size={20} className="text-muted" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold">No destinations added</p>
                            <p className="text-[9px] text-muted leading-tight">Click + to add a chat manually.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">

                        {personal.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <h3 className="px-2 text-muted text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                                    <Bookmark size={10} strokeWidth={3} /> Personal
                                </h3>
                                {renderTargetList(personal)}
                            </div>
                        )}

                        {parents.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <h3 className="px-2 text-muted text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                                    <Megaphone size={10} strokeWidth={3} /> Channels & Groups
                                </h3>
                                <div className="flex flex-col gap-1.5">
                                    {parents.map(parent => {
                                        const children = childrenMap.get(parent.id) || [];
                                        return (
                                            <div key={parent.id}>
                                                {/* Parent Channel */}
                                                {renderTargetList([parent])}

                                                {/* Child Topics (indented) */}
                                                {children.length > 0 && (
                                                    <div className="ml-6 pl-3 border-l border-white/10 mt-1.5 flex flex-col gap-1">
                                                        {children.map(child => (
                                                            <div
                                                                key={child.id}
                                                                className={`
                                                                    relative flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all group
                                                                    ${selectedId === child.id
                                                                        ? 'border-primary/30 bg-primary/5'
                                                                        : 'border-transparent hover:border-white/5 hover:bg-surface/30'
                                                                    }
                                                                `}
                                                                onClick={() => handleSelect(child.id)}
                                                            >
                                                                <Hash size={12} className="text-muted flex-shrink-0" />

                                                                {/* Name Container */}
                                                                <div className="flex-1 overflow-hidden">
                                                                    {editingId === child.id ? (
                                                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                                            <input
                                                                                className="w-full bg-black/50 border border-primary/50 rounded px-1 text-xs text-white focus:outline-none h-5"
                                                                                value={editName}
                                                                                onChange={e => setEditName(e.target.value)}
                                                                                autoFocus
                                                                                onKeyDown={e => {
                                                                                    if (e.key === 'Enter') saveEditing();
                                                                                    if (e.key === 'Escape') setEditingId(null);
                                                                                }}
                                                                            />
                                                                            <button onClick={saveEditing} className="text-primary hover:text-white">
                                                                                <Check size={12} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`text-xs font-medium block truncate ${selectedId === child.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                                                            {child.name}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Actions (Floating Glass Pill - Compact) */}
                                                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-surface/90 backdrop-blur-md border border-white/10 shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-10">
                                                                    {!editingId && (
                                                                        <>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (onTogglePin) onTogglePin(child.id);
                                                                                }}
                                                                                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${child.pinned ? 'text-primary' : 'text-muted hover:text-white hover:bg-white/10'}`}
                                                                                title={child.pinned ? "Unpin" : "Pin"}
                                                                            >
                                                                                <Pin size={10} className={child.pinned ? "fill-primary" : ""} />
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    startEditing(child);
                                                                                }}
                                                                                className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-all"
                                                                                title="Rename"
                                                                            >
                                                                                <Edit2 size={10} />
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onDeleteTarget(child.id);
                                                                                }}
                                                                                className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all"
                                                                                title="Remove"
                                                                            >
                                                                                <Trash2 size={10} />
                                                                            </button>
                                                                            <div className="w-px h-3 bg-white/10 mx-0.5" />
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleSendDirect(child.id);
                                                                                }}
                                                                                disabled={isSending}
                                                                                className="w-6 h-6 rounded-md flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-all active:scale-90"
                                                                                title="Send"
                                                                            >
                                                                                <Send size={12} strokeWidth={2.5} className="rotate-45" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {orphanTopics.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <h3 className="px-2 text-muted text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                                    <Hash size={10} strokeWidth={3} /> Other Topics
                                </h3>
                                {renderTargetList(orphanTopics)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ADD M0DAL OVERLAY */}
            {isAddModalOpen && (
                <div
                    onClick={() => setIsAddModalOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-surface border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4"
                    >
                        <h3 className="text-lg font-bold text-center">Add Destination</h3>

                        <div className="space-y-3">


                            <div>
                                <label className={`text-[10px] font-bold uppercase ml-1 ${validationError && !newChatId ? 'text-danger' : 'text-muted'}`}>Chat ID or URL</label>
                                <input
                                    className={`w-full h-9 bg-black/20 border rounded-lg px-3 text-xs text-white focus:outline-none transition-colors ${validationError && !newChatId ? 'border-danger/50 bg-danger/5' : 'border-white/10 focus:border-primary/50'}`}
                                    placeholder="-100... or web.telegram.org/..."
                                    value={newChatId}
                                    onChange={e => {
                                        setNewChatId(e.target.value);
                                        setValidationError(false);
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className={`text-[10px] font-bold uppercase ml-1 ${validationError && !newChatTitle ? 'text-danger' : 'text-muted'}`}>Display Name</label>
                                <input
                                    className={`w-full h-9 bg-black/20 border rounded-lg px-3 text-xs text-white focus:outline-none transition-colors ${validationError && !newChatTitle ? 'border-danger/50 bg-danger/5' : 'border-white/10 focus:border-primary/50'}`}
                                    placeholder="My Channel"
                                    value={newChatTitle}
                                    onChange={e => {
                                        setNewChatTitle(e.target.value);
                                        setValidationError(false);
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                />
                            </div>
                            {validationError && (
                                <p className="text-[10px] text-danger font-bold text-center mt-1 animate-pulse">Required fields are missing!</p>
                            )}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 text-xs font-bold text-muted hover:bg-white/5 rounded-xl">Cancel</button>
                            <button onClick={handleAdd} className="flex-1 py-2 bg-primary text-background text-xs font-bold rounded-xl hover:bg-primary-hover">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
