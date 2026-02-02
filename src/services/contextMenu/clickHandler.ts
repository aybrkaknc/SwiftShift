/**
 * Click Handler
 * Context menu tıklama olaylarını yönetir.
 */

import { StorageService } from '../storage';
import { TelegramService } from '../telegram';
import { RecentsService } from '../recents';
import { LogService } from '../logService';
import { LinkPreviewService } from '../linkPreview';
import { buildPayload } from './payloadBuilder';
import { handleAddDestination } from './destinationHandler';
import { handleCaptureAndSend } from './captureHandler';

/**
 * Context menu tıklama olayını işler
 * @param info Tıklama bilgisi
 * @param tab Aktif sekme
 * @param onMenuRebuild Menü yeniden oluşturma callback'i
 */
export async function onClicked(
    info: chrome.contextMenus.OnClickData,
    tab: chrome.tabs.Tab | undefined,
    onMenuRebuild: () => void
): Promise<void> {
    const menuId = info.menuItemId.toString();

    // === ADD DESTINATION HANDLER ===
    if (menuId.endsWith('-add-destination')) {
        await handleAddDestination(tab, onMenuRebuild);
        return;
    }

    if (menuId.endsWith('-setup-inbox')) {
        const profile = await StorageService.getActiveProfile();
        if (profile) {
            const botName = profile.name.replace(/\s+/g, '');
            chrome.tabs.create({ url: `https://t.me/${botName}` });
        }
        return;
    }

    // === CAPTURE PAGE HANDLER ===
    if (menuId.includes('swiftshift-capture-target-')) {
        const captureTargetMatch = menuId.match(/swiftshift-capture-target-(.+?)-(photo|file|region)$/);
        if (captureTargetMatch && tab?.id) {
            const targetId = captureTargetMatch[1];
            const captureMode = captureTargetMatch[2] as 'photo' | 'file' | 'region';
            await handleCaptureAndSend(targetId, tab, captureMode);
        }
        return;
    }

    // Match target IDs in format: swiftshift-{type}-target-{id} or swiftshift-{type}-target-{id}-photo/file
    const targetMatch = menuId.match(/-target-(.+?)(?:-(photo|file))?$/);
    if (!targetMatch) {
        return;
    }

    // Extract Target ID and Send Mode
    const targetId = targetMatch[1];
    const sendMode = targetMatch[2] as 'photo' | 'file' | undefined;

    // Extract Priority Type from Menu ID
    const typeMatch = menuId.match(/swiftshift-(.+?)-target/);
    const priorityType = typeMatch ? typeMatch[1] : undefined;

    // Get Payload Data
    const payload = await buildPayload(info, tab, priorityType, sendMode === 'file');
    if (!payload) return;

    // Get Active Profile for Token
    const profile = await StorageService.getActiveProfile();
    if (!profile) return;

    // Look up target to get threadId
    const target = profile.targets.find(t => t.id === targetId);

    const telegramPayload: any = {
        chatId: targetId.includes(':') ? targetId.split(':')[0] : targetId,
        threadId: target?.threadId,
        ...payload
    };

    // Choose send method based on mode
    const result = sendMode === 'file' && payload.document
        ? await TelegramService.sendDocument(profile.botToken, telegramPayload)
        : await TelegramService.sendPayloadSmart(profile.botToken, telegramPayload);

    // Handle Result
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: result.success ? 'Sent Successfully' : 'Failed to Send',
        message: result.success ? `Sent to ${target?.name || 'Telegram'}` : result.error
    });

    // Log the operation
    await LogService.add({
        type: result.success ? 'success' : 'error',
        message: result.success ? `Sent to ${target?.name || 'Unknown'}` : `Failed: ${result.error}`,
        targetName: target?.name,
        details: `MenuID: ${menuId}, Mode: ${sendMode || 'auto'}`
    });

    // Save to Recents if successful
    if (result.success) {
        let content = '';
        let type: 'text' | 'link' | 'image' | 'file' | 'audio' | 'location' = 'text';
        let metadata: any = undefined;

        if (telegramPayload.text) {
            const isSpecialLink = /^(http|mailto|tel|magnet|ftp|tg):/i.test(telegramPayload.text);
            const isSingleLine = !telegramPayload.text.includes('\n');
            const mapsMatch = telegramPayload.text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            const hasCoordinates = telegramPayload.latitude !== undefined || !!mapsMatch;

            if (hasCoordinates) {
                type = 'location';
                content = telegramPayload.text;
            } else if (isSpecialLink && isSingleLine) {
                type = 'link';
                content = telegramPayload.text;
                if (telegramPayload.text.startsWith('http')) {
                    metadata = await LinkPreviewService.fetchMetadata(content) || undefined;
                }
            } else {
                type = 'text';
                content = telegramPayload.text;
            }
        } else if (telegramPayload.audio) {
            type = 'audio';
            content = telegramPayload.audio as string;
        } else if (telegramPayload.photo || telegramPayload.document) {
            const mediaUrl = (telegramPayload.photo || telegramPayload.document) as string;
            content = mediaUrl;
            const isImg = priorityType === 'image' || mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)/i) || mediaUrl.startsWith('data:image/');

            if (isImg) {
                type = 'image';
            } else {
                type = 'file';
            }

            if (typeof content !== 'string') content = 'Binary Content';
        }

        await RecentsService.add({
            type,
            content,
            preview: type === 'image' ? content : (content.length > 100 ? content.slice(0, 100) + '...' : content),
            targetName: target?.name || 'Unknown',
            targetId: targetId,
            threadId: target?.threadId,
            metadata
        });
    }

    // Update Recent
    await StorageService.addRecentTarget(targetId);
    // Re-render menu to update Top 3
    onMenuRebuild();
}
