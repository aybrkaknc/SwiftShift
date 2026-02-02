/**
 * Menu Builder
 * Context menü oluşturma ve yapılandırma işlemlerini yönetir.
 * Option A: Tek Kök, Hızlı Erişim ve Sabitlenenler.
 */

import { StorageService } from '../storage';
import { LogService } from '../logService';
import { onClicked } from './clickHandler';
import { TelegramTarget } from '../storage';

/**
 * Context Menu Manager
 * Telegram'a "Gönder" sağ tık menüsünü yönetir.
 */
export const ContextMenuManager = {
    /**
     * Context Menu'yü başlatır
     */
    async init() {
        await LogService.add({ type: 'info', message: 'Rebuilding context menus (v0.4.0)...' });

        chrome.contextMenus.removeAll(async () => {
            const ROOT_ID = 'swiftshift-root';

            // 1. Ana Kök Menü
            chrome.contextMenus.create({
                id: ROOT_ID,
                title: 'SwiftShift',
                contexts: ['all'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });

            // Profil ve Hedefleri Yükle
            const profile = await StorageService.getActiveProfile();
            if (!profile || !profile.botToken) {
                this.createSetupPlaceholder(ROOT_ID);
                return;
            }

            // Hedefleri Gruplama
            const { targets } = profile;
            const pinnedTargets = targets.filter(t => t.pinned);

            // Son Kullanılan Hedef
            const { recentTargets } = await chrome.storage.local.get('recentTargets') as { recentTargets: string[] };
            const lastTargetId = recentTargets && recentTargets.length > 0 ? recentTargets[0] : null;
            const lastTarget = lastTargetId ? targets.find(t => t.id === lastTargetId) : null;

            // === 2. QUICK SEND (En Üst) ===
            if (lastTarget) {
                this.createQuickSendItem(ROOT_ID, lastTarget);

                // Ayırıcı
                chrome.contextMenus.create({
                    id: `${ROOT_ID}-sep-quick`,
                    parentId: ROOT_ID,
                    type: 'separator',
                    contexts: ['all']
                });
            }

            // === 3. PINNED TARGETS (Sabitlenenler) ===
            if (pinnedTargets.length > 0) {
                pinnedTargets.forEach(target => {
                    this.createTargetMenuItem(ROOT_ID, target, '📌');
                });

                // Ayırıcı
                chrome.contextMenus.create({
                    id: `${ROOT_ID}-sep-pinned`,
                    parentId: ROOT_ID,
                    type: 'separator',
                    contexts: ['all']
                });
            }

            // === 4. ALL TARGETS (Alt Menü) ===
            if (targets.length > 0) {
                const ALL_ID = `${ROOT_ID}-all-targets`;

                chrome.contextMenus.create({
                    id: ALL_ID,
                    parentId: ROOT_ID,
                    title: '📂 All Targets',
                    contexts: ['all']
                });

                // Hiyerarşik Yapı (Klasik)
                const parents = targets.filter(t => t.type !== 'topic');
                const topics = targets.filter(t => t.type === 'topic');

                parents.forEach(parent => {
                    const childTopics = topics.filter(t => t.parentId === parent.id);

                    if (childTopics.length > 0) {
                        // Parent Folder
                        const PARENT_MENU_ID = `${ALL_ID}-parent-${parent.id}`;
                        chrome.contextMenus.create({
                            id: PARENT_MENU_ID,
                            parentId: ALL_ID,
                            title: `📁 ${parent.name}`,
                            contexts: ['all']
                        });

                        // Direct Send to Parent
                        this.createTargetMenuItem(PARENT_MENU_ID, parent, '📥'); // true = force submenu for details

                        chrome.contextMenus.create({
                            id: `${PARENT_MENU_ID}-sep`,
                            parentId: PARENT_MENU_ID,
                            type: 'separator',
                            contexts: ['all']
                        });

                        // Topics
                        childTopics.forEach(topic => {
                            this.createTargetMenuItem(PARENT_MENU_ID, topic, '#');
                        });
                    } else {
                        // No topics, direct item
                        this.createTargetMenuItem(ALL_ID, parent, parent.type === 'private' ? '👤' : '📢');
                    }
                });

                // Orphan Topics
                const orphans = topics.filter(t => !parents.some(p => p.id === t.parentId));
                if (orphans.length > 0) {
                    chrome.contextMenus.create({
                        id: `${ALL_ID}-sep-orphans`,
                        parentId: ALL_ID,
                        type: 'separator',
                        contexts: ['all']
                    });
                    orphans.forEach(topic => {
                        this.createTargetMenuItem(ALL_ID, topic, '#');
                    });
                }
            } else {
                // No targets
                chrome.contextMenus.create({
                    id: `${ROOT_ID}-no-targets`,
                    parentId: ROOT_ID,
                    title: '⚠️ No targets found. Open extension to add one.',
                    enabled: false,
                    contexts: ['all']
                });
            }

            // === ADD TO SWIFTSHIFT (Telegram Web Only) ===
            chrome.contextMenus.create({
                id: `${ROOT_ID}-sep-add`,
                parentId: ROOT_ID,
                type: 'separator',
                contexts: ['all'],
                documentUrlPatterns: ['https://web.telegram.org/*']
            });

            chrome.contextMenus.create({
                id: `${ROOT_ID}-add-destination`,
                parentId: ROOT_ID,
                title: '➕ Add to SwiftShift',
                contexts: ['all'],
                documentUrlPatterns: ['https://web.telegram.org/*']
            });

            await LogService.add({
                type: 'success',
                message: `Context Menu v0.4.0 built.`,
                details: `${pinnedTargets.length} pinned, ${targets.length} total.`
            });
        });
    },

    /**
     * Hızlı Gönder Öğesi Oluşturur
     */
    createQuickSendItem(parentId: string, target: TelegramTarget) {
        // Selection
        chrome.contextMenus.create({
            id: `${parentId}-quick-text`,
            parentId: parentId,
            title: `⚡ Send Text to ${target.name}`,
            contexts: ['selection']
        });

        // Link
        chrome.contextMenus.create({
            id: `${parentId}-quick-link`,
            parentId: parentId,
            title: `⚡ Send Link to ${target.name}`,
            contexts: ['link']
        });

        // Image
        chrome.contextMenus.create({
            id: `${parentId}-quick-image`,
            parentId: parentId,
            title: `⚡ Send Image to ${target.name}`,
            contexts: ['image']
        });

        // Page (Default)
        chrome.contextMenus.create({
            id: `${parentId}-quick-page`,
            parentId: parentId,
            title: `⚡ Send Page to ${target.name}`,
            contexts: ['page', 'video', 'audio']
        });
    },

    /**
     * Hedef Menü Öğesi Oluşturur
     * Otomatik olarak Compressed/Uncompressed alt menülerini ekler.
     */
    createTargetMenuItem(parentId: string, target: TelegramTarget, icon: string) {
        const itemId = `${parentId}-target-${target.id}`;

        chrome.contextMenus.create({
            id: itemId,
            parentId: parentId,
            title: `${icon} ${target.name}`,
            contexts: ['all']
        });

        // Alt Menüler (Formats)

        // 1. Auto / Compressed (Varsayılan davranış için üst öğeye tıklanabilir ama detay için alt menü şart)
        // Not: Chrome Context Menu API'de bir öğe hem tıklanabilir hem de alt menüye sahip olamaz (parent ise tıklanamaz).
        // Bu yüzden "Smart" bir yapı kuruyoruz: 
        // Ana öğe -> Alt menüleri açar. Alt menülerde seçenekler sunar.

        // Smart Send (Default)
        chrome.contextMenus.create({
            id: `${itemId}-smart`,
            parentId: itemId,
            title: `🚀 Smart Send (Auto)`,
            contexts: ['all']
        });

        chrome.contextMenus.create({
            id: `${itemId}-sep1`,
            parentId: itemId,
            type: 'separator',
            contexts: ['all']
        });

        // Image Formats
        chrome.contextMenus.create({
            id: `${itemId}-photo`,
            parentId: itemId,
            title: `🖼️ Send as Photo (Compressed)`,
            contexts: ['image']
        });

        chrome.contextMenus.create({
            id: `${itemId}-file`,
            parentId: itemId,
            title: `📄 Send as File (Uncompressed)`,
            contexts: ['image', 'link', 'selection']
        });

        // PDF Option
        chrome.contextMenus.create({
            id: `${itemId}-pdf`,
            parentId: itemId,
            title: `📑 Send as PDF`,
            contexts: ['all'] // Her yerde göster
        });

        // Access to Page Capture inside Target
        chrome.contextMenus.create({
            id: `${itemId}-capture`,
            parentId: itemId,
            title: `📷 Capture Page & Send`,
            contexts: ['page', 'selection', 'link']
        });
    },

    /**
     * Kurulum placeholder'ı
     */
    createSetupPlaceholder(rootId: string) {
        chrome.contextMenus.create({
            id: `${rootId}-setup-required`,
            parentId: rootId,
            title: '⚠️ Setup Required (Click Extension Icon)',
            enabled: false,
            contexts: ['all']
        });
    },

    /**
     * Menü tıklama olayını işler
     */
    async onClicked(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
        await onClicked(info, tab, () => this.init());
    }
};
