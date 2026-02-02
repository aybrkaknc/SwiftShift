/**
 * Capture Handler
 * Sayfa yakalama ve Telegram'a gönderme işlemlerini yönetir.
 */

import { StorageService } from '../storage';
import { TelegramService } from '../telegram';
import { RecentsService } from '../recents';
import { LogService } from '../logService';

/**
 * Sayfa görünür alanını yakalar ve Telegram'a gönderir
 * @param targetId Hedef kanal/grup ID'si
 * @param tab Yakalanacak sekme
 * @param captureMode 'photo' (compressed), 'file' (uncompressed), veya 'region' (bölge seçimi)
 */
export async function handleCaptureAndSend(
    targetId: string,
    tab: chrome.tabs.Tab,
    captureMode: 'photo' | 'file' | 'region' = 'file'
): Promise<void> {
    const profile = await StorageService.getActiveProfile();
    if (!profile) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Error',
            message: 'Bot bağlantısı bulunamadı.'
        });
        return;
    }

    const target = profile.targets.find(t => t.id === targetId);

    // Region mode: Content script'e seçim UI'ını başlatması için mesaj gönder
    if (captureMode === 'region' && tab.id) {
        try {
            chrome.tabs.sendMessage(tab.id, {
                type: 'START_REGION_CAPTURE',
                targetId,
                threadId: target?.threadId,
                targetName: target?.name
            });
        } catch (e) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Region Capture Error',
                message: 'Bu sayfada bölge seçimi yapılamıyor.'
            });
        }
        return;
    }

    try {
        // Görünür alanı PNG olarak yakala
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

        // Data URL'i Blob'a çevir
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Dosya adı oluştur
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `capture_${timestamp}.png`;

        // Telegram'a gönder - photo veya file moduna göre
        let result;
        const telegramPayload = {
            chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
            threadId: target?.threadId,
            caption: `📷 ${tab.title || 'Page Capture'}\n${tab.url}`
        };

        if (captureMode === 'photo') {
            // Compressed (Photo) - Telegram sıkıştırır
            result = await TelegramService.sendPhoto(profile.botToken, {
                ...telegramPayload,
                photo: new File([blob], fileName, { type: 'image/png' })
            });
        } else {
            // Uncompressed (File) - Orijinal kalite
            result = await TelegramService.sendDocument(profile.botToken, {
                ...telegramPayload,
                document: new File([blob], fileName, { type: 'image/png' })
            });
        }

        // Bildirim göster
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: result.success ? 'Capture Sent!' : 'Capture Failed',
            message: result.success ? `Sent to ${target?.name || 'Telegram'} (${captureMode === 'photo' ? 'Compressed' : 'Uncompressed'})` : result.error
        });

        // Log kaydet
        await LogService.add({
            type: result.success ? 'success' : 'error',
            message: result.success ? `Page captured and sent to ${target?.name}` : `Capture failed: ${result.error}`,
            targetName: target?.name,
            details: `URL: ${tab.url}, Mode: ${captureMode}`
        });

        // Recents'e ekle
        if (result.success) {
            const isPhoto = captureMode === 'photo';
            await RecentsService.add({
                type: isPhoto ? 'image' : 'file',
                content: dataUrl,
                preview: isPhoto ?
                    `📷 Capture: ${tab.title?.slice(0, 50) || 'Unknown'}` :
                    `📄 Uncompressed: ${tab.title?.slice(0, 50) || 'Unknown'}`,
                targetName: target?.name || 'Unknown',
                targetId: targetId,
                threadId: target?.threadId
            });
            await StorageService.addRecentTarget(targetId);
        }

    } catch (e) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Capture Error',
            message: 'Sayfa yakalanamadı. Chrome:// veya kısıtlı sayfalarda çalışmaz.'
        });
        await LogService.add({
            type: 'error',
            message: 'Page capture failed',
            details: String(e)
        });
    }
}
