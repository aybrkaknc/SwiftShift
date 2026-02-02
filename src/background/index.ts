import { StorageService } from '../services/storage';
import { ContextMenuManager } from '../services/contextMenu';
import { LogService } from '../services/logService';
import { TelegramService } from '../services/telegram';
import { RecentsService } from '../services/recents';


// Initialize Services
chrome.runtime.onInstalled.addListener(async (details) => {
    await StorageService.init();
    await ContextMenuManager.init();

    await LogService.add({
        type: 'info',
        message: `System: Extension ${details.reason}`,
        details: `Reason: ${details.reason}`
    });

    if (details.reason === 'install') {
        chrome.tabs.create({ url: 'welcome.html' });
    }
});

// Re-init context menu on startup (browser open)
chrome.runtime.onStartup.addListener(async () => {
    await ContextMenuManager.init();
    await LogService.add({ type: 'info', message: 'System: Browser startup initialization' });
});

// Setup Context Menu Events
chrome.contextMenus.onClicked.addListener((info, tab) => {
    ContextMenuManager.onClicked(info, tab);
});

// Listen for Messages (e.g. from Popup to refresh menu)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'REFRESH_MENU') {
        ContextMenuManager.init().then(() => {
            sendResponse({ success: true });
        });
        return true; // Async response
    }

    // === REGION CAPTURE HANDLER ===
    if (message.type === 'REGION_CAPTURE_SELECTED') {
        handleRegionCapture(message, sender.tab).then(() => {
            sendResponse({ success: true });
        });
        return true;
    }
});

/**
 * Seçilen bölgeyi yakala ve Telegram'a gönder
 */
async function handleRegionCapture(message: any, tab?: chrome.tabs.Tab) {
    if (!tab?.windowId) return;

    const profile = await StorageService.getActiveProfile();
    if (!profile) return;

    const { targetId, threadId, targetName, region, devicePixelRatio, pageTitle, pageUrl } = message;

    try {
        // Tam ekran görüntüsü al
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

        // Görüntüyü kırp (OffscreenCanvas kullanarak)
        const croppedBlob = await cropImage(dataUrl, region, devicePixelRatio);

        // Dosya adı oluştur
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `region_${timestamp}.png`;

        // Telegram'a gönder
        const result = await TelegramService.sendDocument(profile.botToken, {
            chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
            threadId,
            document: new File([croppedBlob], fileName, { type: 'image/png' }),
            caption: `✂️ Region Capture\n${pageTitle}\n${pageUrl}`
        });

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: result.success ? 'Region Sent!' : 'Region Failed',
            message: result.success ? `Sent to ${targetName || 'Telegram'}` : result.error
        });

        // Recents'e ekle
        if (result.success) {
            // Blob'u dataUrl'e çevir (önizleme için)
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                await RecentsService.add({
                    type: 'file', // Uncompressed olduğu için file (resend için)
                    content: base64data,
                    preview: `✂️ Region: ${pageTitle?.slice(0, 50) || 'Selection'}`,
                    targetName: targetName || 'Unknown',
                    targetId,
                    threadId
                });
                await StorageService.addRecentTarget(targetId);
            };
            reader.readAsDataURL(croppedBlob);
        }

        await LogService.add({
            type: result.success ? 'success' : 'error',
            message: result.success ? `Region captured and sent to ${targetName}` : `Region capture failed: ${result.error}`,
            targetName,
            details: `Region: ${region.width}x${region.height}`
        });

    } catch (e) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Region Capture Error',
            message: 'Bölge yakalanamadı.'
        });
    }
}

/**
 * Data URL görüntüsünü belirtilen bölgeye kırp
 */
async function cropImage(
    dataUrl: string,
    region: { left: number; top: number; width: number; height: number },
    devicePixelRatio: number
): Promise<Blob> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    // DPR ile ölçekle
    const scaledRegion = {
        left: Math.round(region.left * devicePixelRatio),
        top: Math.round(region.top * devicePixelRatio),
        width: Math.round(region.width * devicePixelRatio),
        height: Math.round(region.height * devicePixelRatio)
    };

    // OffscreenCanvas ile kırp
    const canvas = new OffscreenCanvas(scaledRegion.width, scaledRegion.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    ctx.drawImage(
        bitmap,
        scaledRegion.left, scaledRegion.top, scaledRegion.width, scaledRegion.height,
        0, 0, scaledRegion.width, scaledRegion.height
    );

    return await canvas.convertToBlob({ type: 'image/png' });
}

// Listen for Commands (Alt+Q)
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'quick_send') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return;
        const tabId = tab.id;

        try {
            // 1. Capture Content - Safety Wrapper
            let payload;
            try {
                payload = await chrome.tabs.sendMessage(tabId, { type: 'CAPTURE_CONTENT' });
            } catch (err) {
                console.warn('SwiftShift: Content script connection failed.', err);
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'Connection Error',
                    message: 'Please refresh the page to use SwiftShift properly.'
                });
                return;
            }

            if (!payload || !payload.text) return;

            // 2. Get Profile
            const profile = await StorageService.getActiveProfile();
            if (!profile) return;

            // 3. Determine Target (Last Used or First Available)
            const { recentTargets } = await chrome.storage.local.get('recentTargets');
            const targetId = recentTargets && recentTargets.length > 0 ? recentTargets[0] : profile.targets[0]?.id;

            if (!targetId) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'No Target Found',
                    message: 'Please select a default target in the extension popup.'
                });
                return;
            }

            const target = profile.targets.find(t => t.id === targetId);

            // 4. Send
            const telegramPayload: any = {
                chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
                threadId: target?.threadId,
                text: payload.text
            };

            await LogService.add({
                type: 'info',
                message: 'Quick Send Triggered (Alt+Q)',
                details: `Target: ${target?.name || 'Unknown'}`
            });

            const result = await TelegramService.sendPayloadSmart(profile.botToken, telegramPayload);

            await LogService.add({
                type: result.success ? 'success' : 'error',
                message: result.success ? `Quick Sent: ${payload.text.slice(0, 30)}...` : `Quick Send Failed: ${result.error}`,
                targetName: target?.name,
                details: `Alt+Q Command`
            });

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: result.success ? 'Sent Successfully' : 'Failed to Send',
                message: result.success ? `Sent to ${target?.name || 'Telegram'}` : (result.error || 'Unknown error')
            });

        } catch (e) {
            console.error('Quick Send Error:', e);
            // Silently fail or log to internal service
        }
    }
});
