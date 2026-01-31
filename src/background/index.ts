import { StorageService } from '../services/storage';
import { ContextMenuManager } from '../services/contextMenu';


console.log('SwiftShift Background Worker Starting...');

// Initialize Services
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Extension Installed/Updated');
    await StorageService.init();
    await ContextMenuManager.init();

    if (details.reason === 'install') {
        chrome.tabs.create({ url: 'welcome.html' });
    }
});

// Re-init context menu on startup (browser open)
chrome.runtime.onStartup.addListener(async () => {
    await ContextMenuManager.init();
});

// Setup Context Menu Events
chrome.contextMenus.onClicked.addListener((info, tab) => {
    ContextMenuManager.onClicked(info, tab);
});

// Listen for Messages (e.g. from Popup to refresh menu)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'REFRESH_MENU') {
        ContextMenuManager.init().then(() => {
            sendResponse({ success: true });
        });
        return true; // Async response
    }
});

// Listen for Commands (Alt+Q)
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'quick_send') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return;
        const tabId = tab.id;

        try {
            // 1. Capture Content
            const payload = await chrome.tabs.sendMessage(tabId, { type: 'CAPTURE_CONTENT' });

            if (!payload || !payload.text) return;

            // 2. Get Profile
            const profile = await StorageService.getActiveProfile();
            if (!profile) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'Setup Required',
                    message: 'Please click the extension icon to connect Telegram.'
                });
                return;
            }

            // 3. Determine Target (Last Used or First Available)
            const { recentTargets } = await chrome.storage.local.get('recentTargets');
            const targetId = recentTargets && recentTargets.length > 0 ? recentTargets[0] : profile.targets[0]?.id;

            if (!targetId) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'No Channels Found',
                    message: 'Please add the bot to a channel or chat first.'
                });
                return;
            }

            const target = profile.targets.find(t => t.id === targetId);
            const statusMessage = target ? `Sending to ${target.name}...` : 'Sending to Telegram...';

            // 4. Send
            // Optional: Show "Sending" notification? 
            // Might be annoying if fast. Let's show it if user wants feedback, or just succeed/fail.
            // Let's keep it for feedback on long uploads, maybe silent?
            /* 
            chrome.notifications.create('sending-notification', {
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'SwiftShift',
                message: statusMessage,
                silent: true
            }); 
            */

            // Using 'sendMessage' directly for now as payload is text-based (selection or URL)
            const telegramPayload: any = {
                chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
                threadId: target?.threadId,
                text: payload.text
            };

            import('../services/telegram').then(async ({ TelegramService }) => {
                const result = await TelegramService.sendPayloadSmart(profile.botToken, telegramPayload);

                // Clear "sending" if we used it
                // chrome.notifications.clear('sending-notification');

                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: result.success ? 'Sent Successfully' : 'Failed to Send',
                    message: result.success ? `Sent to ${target?.name || 'Telegram'}` : (result.error || 'Unknown error')
                });
            });

        } catch (e) {
            console.error(e);
            // Likely content script not loaded (e.g. chrome:// pages)
            // Silently fail or minimal logic
        }
    }
});
