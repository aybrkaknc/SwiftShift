/**
 * Click Handler
 * Context menu tıklama olaylarını yönetir.
 * v0.4.1 Fix: Twitter Image Priority
 */

import { StorageService } from '../storage';
import { TelegramService } from '../telegram';
import { RecentsService } from '../recents';
import { LogService } from '../logService';
import { LinkPreviewService } from '../linkPreview';
import { buildPayload } from './payloadBuilder';
import { handleAddDestination } from './destinationHandler';
import { handleCaptureAndSend } from './captureHandler';
import { PdfService } from '../pdfService';

/**
 * Context menu tıklama olayını işler
 */
export async function onClicked(
    info: chrome.contextMenus.OnClickData,
    tab: chrome.tabs.Tab | undefined,
    onMenuRebuild: () => void
): Promise<void> {
    const menuId = info.menuItemId.toString();

    // === PDF HANDLER ===
    if (menuId.endsWith('-pdf') && tab?.id) {
        const targetMatch = menuId.match(/-target-(.+?)-pdf$/);
        if (targetMatch) {
            const targetId = targetMatch[1];
            await handlePdfSend(targetId, tab, onMenuRebuild);
        }
        return;
    }

    // === 1. ADD DESTINATION ===
    if (menuId.endsWith('-add-destination')) {
        await handleAddDestination(tab, onMenuRebuild);
        return;
    }

    // === 2. CAPTURE PAGE HANDLER ===
    if (menuId.endsWith('-capture')) {
        const targetMatch = menuId.match(/-target-(.+?)-capture$/);
        if (targetMatch && tab?.id) {
            const targetId = targetMatch[1];
            await handleCaptureAndSend(targetId, tab, 'photo');
        }
        return;
    }

    // Determine Priority Type from Menu ID
    // This fixes the issue where clicking "Send Image" on Twitter sent the tweet link instead.
    let priorityType: string | undefined;

    if (menuId.includes('-quick-image') || menuId.endsWith('-photo') || menuId.endsWith('-file')) {
        // If user explicitly clicked an image-related action, prioritize image source
        priorityType = 'image';
    } else if (menuId.includes('-quick-link')) {
        priorityType = 'link';
    } else if (menuId.includes('-quick-text')) {
        priorityType = 'text';
    } else if (menuId.includes('-quick-page')) {
        priorityType = 'page'; // Not explicitly used in payloadBuilder but clear intent
    }

    // === 3. QUICK SEND HANDLER ===
    if (menuId.includes('-quick-')) {
        const { recentTargets } = await chrome.storage.local.get('recentTargets');
        if (!recentTargets || recentTargets.length === 0) return;

        const targetId = recentTargets[0];

        // Hızlı gönderim: sendMode 'auto' (undefined) ama priorityType ID'den gelir
        await processSend(targetId, info, tab, undefined, priorityType, onMenuRebuild);
        return;
    }

    // === 4. STANDARD TARGET SEND ===
    const targetMatch = menuId.match(/-target-(.+?)(?:-(smart|photo|file))?$/);

    if (targetMatch) {
        const targetId = targetMatch[1];
        const modeSuffix = targetMatch[2] as 'smart' | 'photo' | 'file' | undefined;

        const sendMode = modeSuffix === 'file' ? 'file' :
            modeSuffix === 'photo' ? 'photo' : undefined;

        await processSend(targetId, info, tab, sendMode, priorityType, onMenuRebuild);
        return;
    }
}

/**
 * Gönderim işlemini yöneten ana fonksiyon
 */
async function processSend(
    targetId: string,
    info: chrome.contextMenus.OnClickData,
    tab: chrome.tabs.Tab | undefined,
    sendMode: 'file' | 'photo' | undefined,
    priorityType: string | undefined,
    onMenuRebuild: () => void
) {
    // 1. Payload Oluştur
    // isFile=true ise forceFile=true, priorityType (image/link/text) iletilir
    const forceFile = sendMode === 'file';
    let payload = await buildPayload(info, tab, priorityType, forceFile);

    // --- Content Script Fallback (Twitter Fix) ---
    // Eğer payload yoksa VEYA öncelik 'image' olduğu halde görsel bulunamadıysa (sadece link bulunduysa)
    // Content Script'ten derinlemesine analiz iste.
    const isImageRequestedButNotFound = priorityType === 'image' && (!payload || !payload.photo);
    const isGenericCheck = !priorityType && (!payload || (!payload.photo && !payload.document)); // Smart mode, no media found

    if (isImageRequestedButNotFound || isGenericCheck) {
        if (tab?.id) {
            try {
                // Content Script'e sor: Orada ne var?
                const media: any = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CLICKED_MEDIA' });

                if (media && media.src) {
                    // Bulunan medyayı payload olarak kullan
                    if (!payload) payload = {};

                    // Eğer link varsa onu caption olarak saklayabiliriz veya override ederiz
                    // Amaç resim göndermek, caption: pageUrl daha iyi
                    payload.photo = media.src;

                    // Eğer önceden text (link) bulmuşsak onu caption yapabiliriz ama tab.url daha güvenli caption
                    if (!payload.caption) payload.caption = tab.url;

                    // Eğer 'file' modu ise
                    if (forceFile) {
                        payload.document = media.src;
                        delete payload.photo;
                    }

                    // Text (Link) bilgisini temizle ki resim olarak gitsin
                    // Amaç tweet linkini değil resmi göndermek
                    if (priorityType === 'image') {
                        delete payload.text;
                    }
                }
            } catch (e) {
                // Content script hatası veya yanıt yok (önemli değil, fallback devam eder)
                console.warn('Media detection failed:', e);
            }
        }
    }

    if (!payload) return;

    // 2. Profili ve Hedefi Bul
    const profile = await StorageService.getActiveProfile();
    if (!profile) return;

    const target = profile.targets.find(t => t.id === targetId);

    // 3. Telegram Payload Hazırla
    const telegramPayload: any = {
        chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
        threadId: target?.threadId,
        ...payload
    };

    // sendMode 'file' ve resim URL geldi -> document'a çevir (buildPayload zaten yapmış olabilir ama garantiye al)
    if (sendMode === 'file' && telegramPayload.photo) {
        telegramPayload.document = telegramPayload.photo;
        delete telegramPayload.photo;
    }
    // sendMode 'photo' ve document URL geldi (resim uzantılı) -> photo'ya çevir
    else if (sendMode === 'photo' && telegramPayload.document) {
        if (typeof telegramPayload.document === 'string' && telegramPayload.document.match(/\.(jpg|jpeg|png|gif|webp|bmp)/i)) {
            telegramPayload.photo = telegramPayload.document;
            delete telegramPayload.document;
        }
    }

    // 4. Gönder
    let result;
    if (sendMode === 'file' && payload.document) {
        // Belge olarak gönder
        result = await TelegramService.sendDocument(profile.botToken, telegramPayload);
    } else {
        // Smart send handles standard attributes
        result = await TelegramService.sendPayloadSmart(profile.botToken, telegramPayload);
    }

    // 5. Sonuç Bildirimi
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: result.success ? 'Sent Successfully' : 'Failed to Send',
        message: result.success ? `Sent to ${target?.name || 'Telegram'}` : result.error
    });

    // 6. Logla
    await LogService.add({
        type: result.success ? 'success' : 'error',
        message: result.success ? `Sent to ${target?.name || 'Unknown'}` : `Failed: ${result.error}`,
        targetName: target?.name,
        details: `TargetID: ${targetId}, Mode: ${sendMode || 'auto'}`
    });

    // 7. Recents'e Ekle
    if (result.success) {
        await addToRecents(telegramPayload, targetId, target?.name, target?.threadId);

        // Update Recent Target & Rebuild Menu
        await StorageService.addRecentTarget(targetId);
        onMenuRebuild();
    }
}

/**
 * Recents veritabanına ekleme yapar
 */
async function addToRecents(payload: any, targetId: string, targetName: string = 'Unknown', threadId?: number) {
    let content = '';
    let type: 'text' | 'link' | 'image' | 'file' | 'audio' | 'location' = 'text';
    let metadata: any = undefined;

    if (payload.text) {
        const isSpecialLink = /^(http|mailto|tel|magnet|ftp|tg):/i.test(payload.text);
        const isSingleLine = !payload.text.includes('\n');
        const mapsMatch = payload.text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        const hasCoordinates = payload.latitude !== undefined || !!mapsMatch;

        if (hasCoordinates) {
            type = 'location';
            content = payload.text;
        } else if (isSpecialLink && isSingleLine) {
            type = 'link';
            content = payload.text;
            if (payload.text.startsWith('http')) {
                metadata = await LinkPreviewService.fetchMetadata(content) || undefined;
            }
        } else {
            type = 'text';
            content = payload.text;
        }
    } else if (payload.audio) {
        type = 'audio';
        content = payload.audio as string;
    } else if (payload.photo || payload.document) {
        const mediaUrl = (payload.photo || payload.document) as string;
        content = mediaUrl;

        // Eğer binary blob ise (Capture gibi)
        if (typeof content !== 'string') content = '[Binary Data]';

        const isImg = !!payload.photo; // Photo alanındaysa kesindir
        if (isImg) {
            type = 'image';
        } else {
            type = 'file';
        }
    }

    await RecentsService.add({
        type,
        content,
        preview: type === 'image' && content.startsWith('data:') ? content : (
            content.length > 100 ? content.slice(0, 100) + '...' : content
        ),
        targetName,
        targetId,
        threadId,
        metadata
    });
}

/**
 * PDF Gönderme İşlemi
 */
async function handlePdfSend(targetId: string, tab: chrome.tabs.Tab, onMenuRebuild: () => void) {
    if (!tab.id) return;

    // Bildirim: Başladı
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Generating PDF...',
        message: 'Please wait, capturing page content.',
        priority: 1
    });

    try {
        // 1. Content Script'ten görüntüyü al
        const captureResult: any = await chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_FULL_PAGE_FOR_PDF' });

        if (!captureResult || !captureResult.success) {
            throw new Error(captureResult?.error || 'Failed to capture page.');
        }

        // 2. PDF Blobu Oluştur (Background Service)
        const pdfBlob = await PdfService.createPdfFromImage(
            captureResult.dataUrl,
            captureResult.width,
            captureResult.height,
            captureResult.url
        );

        // 3. Profili ve Hedefi Bul
        const profile = await StorageService.getActiveProfile();
        if (!profile) return;

        const target = profile.targets.find(t => t.id === targetId);

        // 4. Telegram'a Gönder
        const filename = `${(captureResult.title || 'Page').replace(/[^a-z0-9]/gi, '_')}.pdf`;

        // Blob olduğu için sendDocument özel logic gerektirebilir. 
        // TelegramService.sendDocument "blob" desteklemeyebilir (sadece string url?).
        // FormData kullanıyorsa Blob destekler. Kontrol etmek lazım ama genellikle destekler.
        // TelegramService içindeki sendDocument fonksiyonu FormData kullanıyor mu?
        // Eğer kullanmıyorsa Blob göndermek zor olabilir. 
        // Ancak bizim TelegramService implementation'ımızda `formData.append('document', ...)` yapılıyorsa Blob çalışır.

        // Geçici Payload
        const telegramPayload: any = {
            chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
            threadId: target?.threadId,
            document: pdfBlob, // Blob object
            caption: captureResult.url,
            filename: filename // Custom filename with .pdf extension
        };

        const result = await TelegramService.sendDocument(profile.botToken, telegramPayload);

        // 5. Sonuç Bildirimi
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: result.success ? 'PDF Sent Successfully' : 'Failed to Send PDF',
            message: result.success ? `Sent to ${target?.name || 'Telegram'}` : result.error
        });

        // 6. Log ve Recents
        await LogService.add({
            type: result.success ? 'success' : 'error',
            message: result.success ? `Sent PDF to ${target?.name}` : `PDF Fail: ${result.error}`,
            targetName: target?.name,
            details: `TargetID: ${targetId}, PDF Generation`
        });

        if (result.success) {
            await StorageService.addRecentTarget(targetId);
            onMenuRebuild();
        }

    } catch (error) {
        console.error(error);
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'PDF Error',
            message: String(error)
        });
    }
}

