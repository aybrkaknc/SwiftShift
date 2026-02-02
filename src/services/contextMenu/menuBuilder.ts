/**
 * Menu Builder
 * Context menü oluşturma ve yapılandırma işlemlerini yönetir.
 */

import { StorageService } from '../storage';
import { LogService } from '../logService';
import { onClicked } from './clickHandler';

/**
 * Context Menu Manager
 * Telegram'a "Gönder" sağ tık menüsünü yönetir.
 * "Smart Topology" (Top 5 Recent + More) uygular.
 */
export const ContextMenuManager = {
    /**
     * Context Menu'yü başlatır
     */
    async init() {
        // Log menu rebuild start
        await LogService.add({ type: 'info', message: 'Rebuilding context menus...' });

        chrome.contextMenus.removeAll(async () => {
            // Her içerik tipi için dinamik kök öğeler oluştur
            const contextConfigs = [
                { id: 'swiftshift-text', title: 'Send Text to Telegram', contexts: ['selection'] as chrome.contextMenus.ContextType[] },
                { id: 'swiftshift-link', title: 'Send Link to Telegram', contexts: ['link'] as chrome.contextMenus.ContextType[] },
                { id: 'swiftshift-image', title: 'Send Image to Telegram', contexts: ['image'] as chrome.contextMenus.ContextType[] },
                { id: 'swiftshift-video', title: 'Send Video to Telegram', contexts: ['video'] as chrome.contextMenus.ContextType[] },
                { id: 'swiftshift-audio', title: 'Send Audio to Telegram', contexts: ['audio'] as chrome.contextMenus.ContextType[] },
                { id: 'swiftshift-page', title: 'Send Page to Telegram', contexts: ['page'] as chrome.contextMenus.ContextType[] },
                { id: 'swiftshift-capture', title: '📷 Capture Page to Telegram', contexts: ['page'] as chrome.contextMenus.ContextType[] }
            ];

            contextConfigs.forEach(config => {
                chrome.contextMenus.create({
                    id: config.id,
                    title: config.title,
                    contexts: config.contexts,
                    documentUrlPatterns: ['http://*/*', 'https://*/*']
                });
            });

            // Profil ve Hedefleri Yükle
            const profile = await StorageService.getActiveProfile();
            if (!profile || !profile.botToken) {
                this.createSetupPlaceholder(contextConfigs.map(c => c.id));
                return;
            }

            // İterasyon için kök ID'leri
            const rootIds = contextConfigs.map(c => c.id);

            // Her kök için hiyerarşik menü oluştur
            if (profile.targets.length > 0) {
                const parents = profile.targets.filter(t => t.type !== 'topic');
                const topics = profile.targets.filter(t => t.type === 'topic');

                // Smart Topology sıralama için recentTargets'i önceden al
                const { recentTargets } = await chrome.storage.local.get('recentTargets') as { recentTargets: string[] };
                const recents = recentTargets || [];

                rootIds.forEach(rootId => {
                    const isImageContext = rootId === 'swiftshift-image';
                    const isCaptureContext = rootId === 'swiftshift-capture';

                    parents.forEach(parent => {
                        const childTopics = topics.filter(t => t.parentId === parent.id);

                        if (childTopics.length > 0) {
                            // Parent için submenu oluştur
                            chrome.contextMenus.create({
                                id: `${rootId}-parent-${parent.id}`,
                                parentId: rootId,
                                title: `📁 ${parent.name}`,
                                contexts: ['all']
                            });

                            // === IMAGE CONTEXT: Sub-sub-menu ===
                            if (isImageContext) {
                                chrome.contextMenus.create({
                                    id: `${rootId}-send-parent-${parent.id}`,
                                    parentId: `${rootId}-parent-${parent.id}`,
                                    title: `📤 Send to ${parent.name}`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}-photo`,
                                    parentId: `${rootId}-send-parent-${parent.id}`,
                                    title: `🖼️ Send Compressed`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}-file`,
                                    parentId: `${rootId}-send-parent-${parent.id}`,
                                    title: `📄 Send Uncompressed`,
                                    contexts: ['all']
                                });
                            } else if (isCaptureContext) {
                                // === CAPTURE CONTEXT: Photo/File + Region Selection ===
                                chrome.contextMenus.create({
                                    id: `${rootId}-send-parent-${parent.id}`,
                                    parentId: `${rootId}-parent-${parent.id}`,
                                    title: `📤 Capture to ${parent.name}`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}-photo`,
                                    parentId: `${rootId}-send-parent-${parent.id}`,
                                    title: `🖼️ Compressed (Photo)`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}-file`,
                                    parentId: `${rootId}-send-parent-${parent.id}`,
                                    title: `📄 Uncompressed (File)`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-sep-region-${parent.id}`,
                                    parentId: `${rootId}-send-parent-${parent.id}`,
                                    type: 'separator',
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}-region`,
                                    parentId: `${rootId}-send-parent-${parent.id}`,
                                    title: `✂️ Select Region...`,
                                    contexts: ['all']
                                });
                            } else {
                                // Non-image: Direct send
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}`,
                                    parentId: `${rootId}-parent-${parent.id}`,
                                    title: `📤 Send directly to ${parent.name}`,
                                    contexts: ['all']
                                });
                            }

                            chrome.contextMenus.create({
                                id: `${rootId}-sep-${parent.id}`,
                                parentId: `${rootId}-parent-${parent.id}`,
                                type: 'separator',
                                contexts: ['all']
                            });

                            // === SMART TOPOLOGY: Topic'leri sırala ve sınırla ===
                            const sortedTopics = [...childTopics].sort((a, b) => {
                                // Önce pinned
                                if (a.pinned && !b.pinned) return -1;
                                if (!a.pinned && b.pinned) return 1;

                                // Sonra recency
                                const aRecent = recents.indexOf(a.id);
                                const bRecent = recents.indexOf(b.id);
                                if (aRecent !== -1 && bRecent === -1) return -1;
                                if (aRecent === -1 && bRecent !== -1) return 1;
                                if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;

                                return 0;
                            });

                            const TOP_LIMIT = 5;
                            const topTopics = sortedTopics.slice(0, TOP_LIMIT);
                            const moreTopics = sortedTopics.slice(TOP_LIMIT).sort((a, b) => a.name.localeCompare(b.name));

                            // Topic menü öğesi oluşturma helper'ı
                            const createTopicMenuItem = (topic: typeof childTopics[0], parentMenuId: string) => {
                                if (isImageContext || isCaptureContext) {
                                    chrome.contextMenus.create({
                                        id: `${rootId}-topic-menu-${topic.id}`,
                                        parentId: parentMenuId,
                                        title: `# ${topic.name}`,
                                        contexts: ['all']
                                    });
                                    chrome.contextMenus.create({
                                        id: `${rootId}-target-${topic.id}-photo`,
                                        parentId: `${rootId}-topic-menu-${topic.id}`,
                                        title: isCaptureContext ? `🖼️ Compressed (Photo)` : `🖼️ Send Compressed`,
                                        contexts: ['all']
                                    });
                                    chrome.contextMenus.create({
                                        id: `${rootId}-target-${topic.id}-file`,
                                        parentId: `${rootId}-topic-menu-${topic.id}`,
                                        title: isCaptureContext ? `📄 Uncompressed (File)` : `📄 Send Uncompressed`,
                                        contexts: ['all']
                                    });
                                    if (isCaptureContext) {
                                        chrome.contextMenus.create({
                                            id: `${rootId}-sep-region-${topic.id}`,
                                            parentId: `${rootId}-topic-menu-${topic.id}`,
                                            type: 'separator',
                                            contexts: ['all']
                                        });
                                        chrome.contextMenus.create({
                                            id: `${rootId}-target-${topic.id}-region`,
                                            parentId: `${rootId}-topic-menu-${topic.id}`,
                                            title: `✂️ Select Region...`,
                                            contexts: ['all']
                                        });
                                    }
                                } else {
                                    chrome.contextMenus.create({
                                        id: `${rootId}-target-${topic.id}`,
                                        parentId: parentMenuId,
                                        title: `# ${topic.name}`,
                                        contexts: ['all']
                                    });
                                }
                            };

                            // Top topic'leri doğrudan ekle
                            topTopics.forEach(topic => {
                                createTopicMenuItem(topic, `${rootId}-parent-${parent.id}`);
                            });

                            // Gerekirse "More Topics..." submenu ekle
                            if (moreTopics.length > 0) {
                                chrome.contextMenus.create({
                                    id: `${rootId}-sep-more-${parent.id}`,
                                    parentId: `${rootId}-parent-${parent.id}`,
                                    type: 'separator',
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-more-${parent.id}`,
                                    parentId: `${rootId}-parent-${parent.id}`,
                                    title: `📂 More Topics... (${moreTopics.length})`,
                                    contexts: ['all']
                                });
                                moreTopics.forEach(topic => {
                                    createTopicMenuItem(topic, `${rootId}-more-${parent.id}`);
                                });
                            }
                        } else {
                            // Topic'siz kanallar veya özel sohbetler için doğrudan öğe
                            if (isImageContext) {
                                chrome.contextMenus.create({
                                    id: `${rootId}-menu-${parent.id}`,
                                    parentId: rootId,
                                    title: parent.type === 'private' ? `👤 ${parent.name}` : `📤 ${parent.name}`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}-photo`,
                                    parentId: `${rootId}-menu-${parent.id}`,
                                    title: `🖼️ Send Compressed`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}-file`,
                                    parentId: `${rootId}-menu-${parent.id}`,
                                    title: `📄 Send Uncompressed`,
                                    contexts: ['all']
                                });
                            } else {
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${parent.id}`,
                                    parentId: rootId,
                                    title: parent.type === 'private' ? `👤 ${parent.name}` : `📤 ${parent.name}`,
                                    contexts: ['all']
                                });
                            }
                        }
                    });

                    // Orphan topic'ler (güvenlik)
                    const orphans = topics.filter(t => !parents.some(p => t.parentId === p.id));
                    if (orphans.length > 0) {
                        orphans.forEach(topic => {
                            if (isImageContext) {
                                chrome.contextMenus.create({
                                    id: `${rootId}-orphan-menu-${topic.id}`,
                                    parentId: rootId,
                                    title: `# ${topic.name}`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${topic.id}-photo`,
                                    parentId: `${rootId}-orphan-menu-${topic.id}`,
                                    title: `🖼️ Send Compressed`,
                                    contexts: ['all']
                                });
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${topic.id}-file`,
                                    parentId: `${rootId}-orphan-menu-${topic.id}`,
                                    title: `📄 Send Uncompressed`,
                                    contexts: ['all']
                                });
                            } else {
                                chrome.contextMenus.create({
                                    id: `${rootId}-target-${topic.id}`,
                                    parentId: rootId,
                                    title: `# ${topic.name}`,
                                    contexts: ['all']
                                });
                            }
                        });
                    }

                    // === QUICK SEND SHORTCUT (Last Used) ===
                    const lastTargetId = recents[0];
                    const lastTarget = lastTargetId ? profile.targets.find(t => t.id === lastTargetId) : null;

                    if (lastTarget) {
                        chrome.contextMenus.create({
                            id: `${rootId}-sep-quick`,
                            parentId: rootId,
                            type: 'separator',
                            contexts: ['all']
                        });

                        if (isImageContext) {
                            chrome.contextMenus.create({
                                id: `${rootId}-quick-menu-${lastTarget.id}`,
                                parentId: rootId,
                                title: `⚡ Quick: ${lastTarget.name}`,
                                contexts: ['all']
                            });
                            chrome.contextMenus.create({
                                id: `${rootId}-quick-target-${lastTarget.id}-photo`,
                                parentId: `${rootId}-quick-menu-${lastTarget.id}`,
                                title: `🖼️ Send Compressed`,
                                contexts: ['all']
                            });
                            chrome.contextMenus.create({
                                id: `${rootId}-quick-target-${lastTarget.id}-file`,
                                parentId: `${rootId}-quick-menu-${lastTarget.id}`,
                                title: `📄 Send Uncompressed`,
                                contexts: ['all']
                            });
                        } else {
                            chrome.contextMenus.create({
                                id: `${rootId}-quick-target-${lastTarget.id}`,
                                parentId: rootId,
                                title: `⚡ Sent last to: ${lastTarget.name}`,
                                contexts: ['all']
                            });
                        }
                    }
                });
            } else {
                // Profil var ama henüz hedef yok
                rootIds.forEach(rootId => {
                    chrome.contextMenus.create({
                        id: `${rootId}-setup-inbox`,
                        parentId: rootId,
                        title: `✉️ Shift to Bot Inbox (${profile.name})`,
                        contexts: ['all']
                    });

                    chrome.contextMenus.create({
                        id: `${rootId}-setup-guide`,
                        parentId: `${rootId}-setup-inbox`,
                        title: 'Help: Message your bot first!',
                        enabled: false,
                        contexts: ['all']
                    });
                });
            }

            // === ADD TO SWIFTSHIFT (Telegram Web Only) ===
            rootIds.forEach(rootId => {
                chrome.contextMenus.create({
                    id: `${rootId}-separator-add`,
                    parentId: rootId,
                    type: 'separator',
                    contexts: ['all'],
                    documentUrlPatterns: ['https://web.telegram.org/*']
                });

                chrome.contextMenus.create({
                    id: `${rootId}-add-destination`,
                    parentId: rootId,
                    title: '➕ Add to SwiftShift',
                    contexts: ['all'],
                    documentUrlPatterns: ['https://web.telegram.org/*']
                });
            });

            await LogService.add({
                type: 'success',
                message: `Menu built with ${profile.targets.length} targets`,
                details: `Profile: ${profile.name}`
            });
        });
    },

    /**
     * Kurulum placeholder'ı oluşturur
     */
    createSetupPlaceholder(rootIds: string[]) {
        rootIds.forEach(rootId => {
            chrome.contextMenus.create({
                id: `${rootId}-setup-required`,
                parentId: rootId,
                title: '⚠️ Setup Required (Click Extension Icon)',
                enabled: false,
                contexts: ['all']
            });
        });
    },

    /**
     * Menü tıklama olayını işler
     */
    async onClicked(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
        await onClicked(info, tab, () => this.init());
    }
};
