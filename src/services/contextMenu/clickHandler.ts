/**
 * Click Handler
 * Context menu tıklama olaylarını yönetir.
 * v0.4.1 Fix: Twitter Image Priority
 * i18n: getTranslations() ile çeviri desteği.
 */

import { StorageService } from '../storage';
import { TelegramService } from '../telegram';
import { RecentsService } from '../recents';
import { LogService } from '../logService';
import { LinkPreviewService } from '../linkPreview';
import { buildPayload } from './payloadBuilder';
import { handleAddDestination } from './destinationHandler';
import { handleCaptureAndSend } from './captureHandler';
import { getTranslations } from '../../utils/i18nUtils';
import { injectToast } from '../injectToast';

/**
 * Context menu tıklama olayını işler
 */
export async function onClicked(
    info: chrome.contextMenus.OnClickData,
    tab: chrome.tabs.Tab | undefined,
    onMenuRebuild: () => void
): Promise<void> {
    const menuId = info.menuItemId.toString();



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
    let priorityType: string | undefined;

    if (menuId.includes('-quick-image') || menuId.endsWith('-photo') || menuId.endsWith('-file')) {
        priorityType = 'image';
    } else if (menuId.includes('-quick-link')) {
        priorityType = 'link';
    } else if (menuId.includes('-quick-text')) {
        priorityType = 'text';
    } else if (menuId.includes('-quick-page')) {
        priorityType = 'page';
    }

    // === 3. QUICK SEND HANDLER ===
    if (menuId.includes('-quick-')) {
        const { recentTargets } = await chrome.storage.local.get('recentTargets');
        if (!recentTargets || recentTargets.length === 0) return;

        const targetId = recentTargets[0];
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
    const t = getTranslations();
    const forceFile = sendMode === 'file';
    let payload = await buildPayload(info, tab, priorityType, forceFile);

    // --- Content Script Fallback (Twitter Fix) ---
    const isImageRequestedButNotFound = priorityType === 'image' && (!payload || !payload.photo);
    const isGenericCheck = !priorityType && (!payload || (!payload.photo && !payload.document));

    if (isImageRequestedButNotFound || isGenericCheck) {
        if (tab?.id) {
            try {
                const media: any = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CLICKED_MEDIA' });

                if (media && media.src) {
                    if (!payload) payload = {};
                    payload.photo = media.src;
                    if (!payload.caption) payload.caption = tab.url;

                    if (forceFile) {
                        payload.document = media.src;
                        delete payload.photo;
                    }

                    if (priorityType === 'image') {
                        delete payload.text;
                    }
                }
            } catch (e) {
                console.warn('Media detection failed:', e);
            }
        }
    }

    if (!payload) return;

    // 2. Profili ve Hedefi Bul
    const profile = await StorageService.getActiveProfile();
    if (!profile) return;

    const target = profile.targets.find(tgt => tgt.id === targetId);

    // 3. Telegram Payload Hazırla
    const isSelfSend = targetId === profile.id;
    let finalChatId = isSelfSend ? profile.chatId : (targetId.includes(':') ? targetId.split(':')[0] : targetId);

    // Self send validation & Auto-fix
    if (isSelfSend && !finalChatId) {
        // Try to detect it one last time
        const detectedId = await TelegramService.detectUserChatId(profile.botToken);

        if (detectedId) {
            // Update local variable
            finalChatId = detectedId;

            // Update profile for future
            const updatedProfile = { ...profile, chatId: detectedId };
            await StorageService.saveProfile(updatedProfile);
        } else {
            if (tab?.id) {
                await injectToast(tab.id, t.background.noTargetFound, 'Please send a message to your bot first!', 'error');
            }
            // Try to open the bot chat to help the user
            if (profile.username) {
                chrome.tabs.create({ url: `https://t.me/${profile.username}` });
            }
            return;
        }
    }

    const telegramPayload: any = {
        chatId: finalChatId,
        threadId: isSelfSend ? undefined : target?.threadId,
        ...payload
    };

    // sendMode 'file' ve resim URL geldi -> document'a çevir
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
        result = await TelegramService.sendDocument(profile.botToken, telegramPayload);
    } else {
        result = await TelegramService.sendPayloadSmart(profile.botToken, telegramPayload);
    }

    // 5. Sonuç Bildirimi (In-Page Toast)
    if (tab?.id) {
        if (result.success) {
            await injectToast(tab.id, t.dashboard.sentSuccess, t.clickHandler.sentTo.replace('{name}', target?.name || 'Telegram'), 'success');
        } else {
            await injectToast(tab.id, t.dashboard.failedToSend, result.error, 'error');
        }
    }

    // 6. Logla
    await LogService.add({
        type: result.success ? 'success' : 'error',
        message: result.success
            ? t.clickHandler.sentTo.replace('{name}', target?.name || 'Unknown')
            : t.clickHandler.failedSend.replace('{error}', result.error),
        targetName: target?.name,
        details: `TargetID: ${targetId}, Mode: ${sendMode || 'auto'}`
    });

    // 7. Recents'e Ekle
    if (result.success) {
        await addToRecents(telegramPayload, targetId, target?.name, target?.threadId);
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

        if (typeof content !== 'string') content = '[Binary Data]';

        const isImg = !!payload.photo;
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


