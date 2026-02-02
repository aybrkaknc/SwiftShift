/**
 * Destination Handler
 * Telegram Web'den hedef ekleme işlemlerini yönetir.
 */

import { StorageService, TelegramTarget } from '../storage';
import { TelegramService } from '../telegram';
import { LogService } from '../logService';

/**
 * Telegram Web'den hedef ekler
 * @param tab Aktif sekme
 * @param onMenuRebuild Menü yeniden oluşturma callback'i
 */
export async function handleAddDestination(
    tab: chrome.tabs.Tab | undefined,
    onMenuRebuild: () => void
): Promise<void> {
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

    // URL'i parse et
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
    const storageId = threadId ? `${chatId}:${threadId}` : chatId;

    // Duplicate kontrolü
    const exists = profile.targets.some(t => {
        if (t.id === storageId) return true;
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

    // Başlıktan isim al
    let chatName = (tab.title || 'Unknown Chat').replace(/\s*-\s*Telegram$/, '').trim();
    let extractedParentName = '';
    if (threadId && (chatName.includes(' › ') || chatName.includes(' > '))) {
        const parts = chatName.split(/ [›>] /);
        extractedParentName = parts[0].trim();
        chatName = parts[parts.length - 1].trim();
    }

    // Tip belirleme
    let type: 'channel' | 'group' | 'private' | 'topic' = 'private';
    if (threadId) {
        type = 'topic';
    } else if (chatId.startsWith('-')) {
        type = 'channel';
    }

    let updatedTargets = [...profile.targets];

    // Parent otomatik ekleme
    if (threadId) {
        const parentExists = profile.targets.some(t => {
            const tId = t.id.replace('-100', '');
            const pId = chatId.replace('-100', '');
            return tId === pId && t.type !== 'topic';
        });

        if (!parentExists) {
            let parentName = extractedParentName || `Channel ${chatId.replace('-100', '').slice(-6)}`;
            try {
                const chatInfo = await TelegramService.getChat(profile.botToken, chatId);
                if (chatInfo.ok && chatInfo.result?.title) {
                    parentName = chatInfo.result.title;
                }
            } catch (e) { }

            updatedTargets.push({
                id: chatId,
                name: parentName,
                type: 'channel',
                username: ''
            });
        }
    }

    updatedTargets.push({
        id: storageId,
        name: chatName,
        type,
        username: '',
        threadId,
        parentId: threadId ? chatId : undefined
    } as TelegramTarget);

    await StorageService.updateProfileTargets(profile.id, updatedTargets);
    await LogService.add({
        type: 'success',
        message: `Target Added: ${chatName}`,
        details: `Type: ${type}, ID: ${storageId}`
    });

    chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    onMenuRebuild();

    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Added to SwiftShift!',
        message: `${chatName} is now in your destinations.`
    });
}
