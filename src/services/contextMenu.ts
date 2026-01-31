import { StorageService } from './storage';
import { TelegramService } from './telegram';

/**
 * ContextMenuManager
 * Manages the "Send to Telegram" Right-Click Menu.
 * Implements "Smart Topology" (Top 3 Recent + More).
 */
export const ContextMenuManager = {
    /**
     * Initialize Context Menu
     */
    async init() {
        chrome.contextMenus.removeAll(async () => {
            // Create Root Item
            chrome.contextMenus.create({
                id: 'swiftshift-root',
                title: 'SwiftShift: Send to Telegram',
                contexts: ['selection', 'link', 'image', 'video', 'page']
            });

            // Load Profile & Targets
            const profile = await StorageService.getActiveProfile();
            if (!profile || !profile.botToken) {
                this.createSetupPlaceholder();
                return;
            }

            const { recentTargets } = await chrome.storage.local.get('recentTargets');

            // Build Submenus
            if (recentTargets && recentTargets.length > 0) {
                // 1. Add Recent Targets (Top 3)
                const top3 = recentTargets.slice(0, 3);

                for (const targetId of top3) {
                    const target = profile.targets.find(t => t.id === targetId);
                    if (target) {
                        chrome.contextMenus.create({
                            id: `target-${target.id}`,
                            parentId: 'swiftshift-root',
                            title: `📤 ${target.name}`,
                            contexts: ['all']
                        });
                    }
                }

                // 2. Add Separator
                chrome.contextMenus.create({
                    id: 'separator-1',
                    parentId: 'swiftshift-root',
                    type: 'separator',
                    contexts: ['all']
                });
            }

            // 3. Add "All Targets" Submenu (More...)
            if (profile.targets.length > 0) {
                const top3Ids = recentTargets ? recentTargets.slice(0, 3) : [];

                chrome.contextMenus.create({
                    id: 'more-targets',
                    parentId: 'swiftshift-root',
                    title: 'More...',
                    contexts: ['all']
                });

                // Add all targets under "More..." EXCEPT those already shown in Top 3
                profile.targets.forEach(target => {
                    if (top3Ids.includes(target.id)) return; // Don't duplicate

                    chrome.contextMenus.create({
                        id: `more-${target.id}`,
                        parentId: 'more-targets',
                        title: target.name,
                        contexts: ['all']
                    });
                });
            } else {
                // Profile exists but no targets detected yet
                chrome.contextMenus.create({
                    id: 'setup-inbox',
                    parentId: 'swiftshift-root',
                    title: `✉️ Shift to Bot Inbox (${profile.name})`,
                    contexts: ['all']
                });

                chrome.contextMenus.create({
                    id: 'setup-guide',
                    parentId: 'setup-inbox',
                    title: 'Help: Message your bot first!',
                    enabled: false,
                    contexts: ['all']
                });
            }

            // === ADD TO SWIFTSHIFT (Telegram Web Only) ===
            chrome.contextMenus.create({
                id: 'separator-add',
                parentId: 'swiftshift-root',
                type: 'separator',
                contexts: ['all'],
                documentUrlPatterns: ['https://web.telegram.org/*']
            });

            chrome.contextMenus.create({
                id: 'add-destination',
                parentId: 'swiftshift-root',
                title: '➕ Add This Chat to SwiftShift',
                contexts: ['all'],
                documentUrlPatterns: ['https://web.telegram.org/*']
            });
        });
    },

    createSetupPlaceholder() {
        chrome.contextMenus.create({
            id: 'setup-required',
            parentId: 'swiftshift-root',
            title: '⚠️ Setup Required (Click Extension Icon)',
            enabled: false,
            contexts: ['all']
        });
    },

    /**
     * Handle Menu Clicks
     */
    async onClicked(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
        const menuId = info.menuItemId.toString();

        // === ADD DESTINATION HANDLER ===
        if (menuId === 'add-destination') {
            await this.handleAddDestination(tab);
            return;
        }

        if (menuId === 'setup-inbox') {
            const profile = await StorageService.getActiveProfile();
            if (profile) {
                // Determine bot username to redirect
                const botName = profile.name.replace(/\s+/g, '');
                // We'll try to find username from profile if available or just open web telegram search
                chrome.tabs.create({ url: `https://t.me/${botName}` });
            }
            return;
        }

        if (!menuId.startsWith('target-') && !menuId.startsWith('more-')) {
            return;
        }

        // Extract Target ID
        const targetId = menuId.replace('target-', '').replace('more-', '');

        // Get Payload Data
        const payload = await this.buildPayload(info, tab);
        if (!payload) return;

        // Get Active Profile for Token
        const profile = await StorageService.getActiveProfile();
        if (!profile) return;

        // Send
        // NOTE: In a real implementation, we would determine if the target has a threadId or is a Topic
        // For now assuming targetId corresponds to chatId (basic)
        // We need to look up the target object to get threadId if it exists
        const target = profile.targets.find(t => t.id === targetId);

        const telegramPayload = {
            chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
            threadId: target?.threadId, // Support for topics
            ...payload
        };

        const result = await TelegramService.sendPayloadSmart(profile.botToken, telegramPayload); // Using 'Smart' wrapper we will implement in TelegramService or here

        // Handle Result (Success/Fail) -> Send message to Content Script for Toast
        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, {
                type: 'TOAST_NOTIFICATION',
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Sent successfully' : result.error
            }).catch(() => {
                // Content script might not be loaded on some pages (e.g. Chrome Web Store)
                console.log('Could not send toast to tab');
            });
        }

        // Update Recent
        await StorageService.addRecentTarget(targetId);
        // Re-render menu to update Top 3
        this.init();
    },

    /**
     * Extract content from Context Menu Info
     */
    async buildPayload(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
        // 1. Text Selection
        if (info.selectionText) {
            return { text: info.selectionText };
        }

        // 2. Link
        if (info.linkUrl) {
            return { text: info.linkUrl }; // API Preview will handle it
        }

        // 3. Image (URL)
        if (info.mediaType === 'image' && info.srcUrl) {
            return { photo: info.srcUrl, caption: tab?.url };
        }

        // 4. Video (Link)
        if (info.mediaType === 'video' && info.srcUrl) {
            // Special Video Logic would go here
            return { text: `Video: ${info.srcUrl} \nSource: ${tab?.url}` };
        }

        // 5. Page (Default)
        if (tab?.url) {
            return { text: `${tab.title || 'Page'}\n${tab.url}` };
        }

        return null;
    },

    /**
     * Telegram Web'den Hedef Ekle
     * URL'den Chat ID ve Topic ID çıkarır, sayfa başlığını alır ve listeye ekler.
     */
    async handleAddDestination(tab?: chrome.tabs.Tab) {
        if (!tab?.url || !tab.id) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Error',
                message: 'Could not detect current page.'
            });
            return;
        }

        const profile = await StorageService.getActiveProfile();
        if (!profile) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Setup Required',
                message: 'Please connect your bot first.'
            });
            return;
        }

        // Parse URL: #-1002562603676_116 or #-1002562603676
        const hash = tab.url.split('#')[1] || '';
        const match = hash.match(/(-?\d+)(?:_(\d+))?/);

        if (!match) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Error',
                message: 'Could not detect Chat ID from URL.'
            });
            return;
        }

        const chatId = match[1];
        const threadId = match[2] ? parseInt(match[2]) : undefined;

        // ID oluştur (topic için groupId:threadId formatı)
        const storageId = threadId ? `${chatId}:${threadId}` : chatId;

        // Duplikat kontrolü
        const exists = profile.targets.some(t => {
            if (t.id === storageId) return true;
            // Normalize ID check
            const tId = t.id.replace('-100', '');
            const sId = storageId.replace('-100', '');
            return tId === sId;
        });

        if (exists) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Already Exists',
                message: 'This chat is already in your destinations.'
            });
            return;
        }

        // Sayfa başlığından isim al
        let chatName = tab.title || 'Unknown Chat';
        // Telegram title formatı: "Chat Name" veya "Chat Name - Telegram"
        chatName = chatName.replace(/\s*-\s*Telegram$/, '').trim();

        // Topic ise sadece konu ismini al (Örn: "Kanal › Konu" -> "Konu")
        if (match[2] && (chatName.includes(' › ') || chatName.includes(' > '))) {
            const parts = chatName.split(/ [›>] /);
            chatName = parts[parts.length - 1].trim();
        }

        // Tür belirle
        let type: 'channel' | 'group' | 'private' | 'topic' = 'private';
        if (threadId) {
            type = 'topic';
        } else if (chatId.startsWith('-')) {
            type = 'channel';
        }

        let updatedTargets = [...profile.targets];

        // === PARENT AUTO-ADD ===
        // Topic ise, parent channel/group'un var olup olmadığını kontrol et
        if (threadId) {
            const parentExists = profile.targets.some(t => {
                if (t.id === chatId) return true;
                const tId = t.id.replace('-100', '');
                const pId = chatId.replace('-100', '');
                return tId === pId && t.type !== 'topic';
            });

            if (!parentExists) {
                // Parent kanalı ekle
                // İsmi almak için Telegram API'den getChat kullan
                let parentName = `Channel ${chatId.replace('-100', '').slice(-6)}`;

                try {
                    const { TelegramService } = await import('./telegram');
                    const chatInfo = await TelegramService.getChat(profile.botToken, chatId);
                    if (chatInfo.ok && chatInfo.result?.title) {
                        parentName = chatInfo.result.title;
                    }
                } catch (e) {
                    console.log('Could not fetch parent channel name');
                }

                const parentTarget = {
                    id: chatId,
                    name: parentName,
                    type: 'channel' as const,
                    username: ''
                };
                updatedTargets.push(parentTarget);
            }
        }

        const newTarget = {
            id: storageId,
            name: chatName,
            type,
            username: '',
            threadId,
            parentId: threadId ? chatId : undefined // Topic ise parent'ı referansla
        };

        updatedTargets.push(newTarget);

        // Kaydet
        await StorageService.updateProfileTargets(profile.id, updatedTargets);

        // Menüyü yenile
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
        this.init();

        // Başarı bildirimi
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Added to SwiftShift!',
            message: `${chatName} is now in your destinations.`
        });
    }
};
