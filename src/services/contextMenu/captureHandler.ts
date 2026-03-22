/**
 * Capture Handler
 * Sayfa yakalama ve Telegram'a gönderme işlemlerini yönetir.
 * i18n: getTranslations() ile çeviri desteği.
 */

import { browser } from '../../utils/browser-api';
import { StorageService } from '../storage';
import { TelegramService } from '../telegram';
import { RecentsService } from '../recents';
import { LogService } from '../logService';
import { getTranslations } from '../../utils/i18nUtils';
import { injectToast } from '../injectToast';

/**
 * Sayfa görünür alanını yakalar ve Telegram'a gönderir
 * @param targetId Hedef kanal/grup ID'si
 * @param tab Yakalanacak sekme
 * @param captureMode 'photo' (compressed), 'file' (uncompressed), veya 'region' (bölge seçimi)
 */
export async function handleCaptureAndSend(
    targetId: string,
    tab: any,
    captureMode: 'photo' | 'file' | 'region' = 'file'
): Promise<void> {
    const t = getTranslations();
    const profile = await StorageService.getActiveProfile();
    if (!profile) {
        if (tab.id) {
            await injectToast(tab.id, t.destination.error, t.capture.noBot, 'error');
        }
        return;
    }

    const target = profile.targets.find(tgt => tgt.id === targetId);

    // Region mode: Content script'e seçim UI'ını başlatması için mesaj gönder
    if (captureMode === 'region' && tab.id) {
        try {
            await browser.tabs.sendMessage(tab.id, {
                type: 'START_REGION_CAPTURE',
                targetId,
                threadId: target?.threadId,
                targetName: target?.name,
                regionInstruction: t.capture.regionInstruction
            });
        } catch (e) {
            await injectToast(tab.id, 'Region Capture Error', t.capture.regionUnavailable, 'error');
        }
        return;
    }

    try {
        // Görünür alanı PNG olarak yakala
        const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

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
            result = await TelegramService.sendPhoto(profile.botToken, {
                ...telegramPayload,
                photo: new File([blob], fileName, { type: 'image/png' })
            });
        } else {
            result = await TelegramService.sendDocument(profile.botToken, {
                ...telegramPayload,
                document: new File([blob], fileName, { type: 'image/png' })
            });
        }

        // Bildirim göster (In-Page Toast)
        if (tab.id) {
            if (result.success) {
                const successMsg = (captureMode === 'photo'
                    ? t.capture.sentToCompressed
                    : t.capture.sentToUncompressed
                ).replace('{name}', target?.name || 'Telegram');
                await injectToast(tab.id, t.capture.captureSent, successMsg, 'success');
            } else {
                await injectToast(tab.id, t.capture.captureFailed, result.error, 'error');
            }
        }

        // Log kaydet
        await LogService.add({
            type: result.success ? 'success' : 'error',
            message: result.success
                ? t.background.regionCapturedSent.replace('{name}', target?.name || 'Unknown')
                : t.clickHandler.failedSend.replace('{error}', result.error),
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
        if (tab.id) {
            await injectToast(tab.id, t.capture.captureError, t.capture.captureErrorMsg, 'error');
        }
        await LogService.add({
            type: 'error',
            message: t.capture.captureFailedLog,
            details: String(e)
        });
    }
}
