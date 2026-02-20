/**
 * Destination Handler
 * Telegram Web'den hedef ekleme işlemlerini yönetir.
 * i18n: getTranslations() ile çeviri desteği.
 */

import { StorageService, TelegramTarget } from '../storage';
import { TelegramService } from '../telegram';
import { LogService } from '../logService';
import { getTranslations } from '../../utils/i18nUtils';
import { injectToast } from '../injectToast';

/**
 * Telegram Web'den hedef ekler
 * @param tab Aktif sekme
 * @param onMenuRebuild Menü yeniden oluşturma callback'i
 */
export async function handleAddDestination(
    tab: chrome.tabs.Tab | undefined,
    onMenuRebuild: () => void
): Promise<void> {
    const t = getTranslations();

    if (!tab?.url || !tab.id) {
        if (tab?.id) {
            await injectToast(tab.id, t.destination.error, t.destination.cannotDetectPage, 'error');
        }
        return;
    }

    const profile = await StorageService.getActiveProfile();
    if (!profile) {
        if (tab.id) {
            await injectToast(tab.id, t.destination.setupRequired, t.destination.setupRequiredMsg, 'error');
        }
        return;
    }

    // URL'i parse et
    const hash = tab.url.split('#')[1] || '';
    const match = hash.match(/(-?\d+)(?:_(\d+))?/);

    if (!match) {
        if (tab.id) {
            await injectToast(tab.id, t.destination.error, t.destination.cannotDetectChatId, 'error');
        }
        return;
    }

    const chatId = match[1];
    const threadId = match[2] ? parseInt(match[2]) : undefined;
    const storageId = threadId ? `${chatId}:${threadId}` : chatId;

    // Duplicate kontrolü
    const exists = profile.targets.some(tgt => {
        if (tgt.id === storageId) return true;
        const tId = tgt.id.replace('-100', '');
        const sId = storageId.replace('-100', '');
        return tId === sId;
    });

    if (exists) {
        if (tab.id) {
            await injectToast(tab.id, t.destination.alreadyExists, t.destination.alreadyExistsMsg, 'info');
        }
        return;
    }

    // Başlıktan isim al
    let chatName = (tab.title || 'Unknown Chat').replace(/\s*-\s*Telegram.*$/i, '').trim();
    let extractedParentName = '';
    if (threadId && (chatName.includes(' › ') || chatName.includes(' > '))) {
        const parts = chatName.split(/ [›>] /);
        extractedParentName = parts[0].trim();
        chatName = parts[parts.length - 1].trim();
    }

    // Telegram Web A: Tab başlığında topic adı yok, DOM'dan oku
    if (threadId && !extractedParentName && tab.id) {
        try {
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    // Telegram Web A/K: Konu başlığını header'dan bul
                    const selectors = [
                        '.MiddleHeader h3',
                        '.TopicHeader h3',
                        '#MiddleColumn h3',
                        '.chat-info .user-title',
                        '.messages-layout h3'
                    ];
                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el?.textContent?.trim()) return el.textContent.trim();
                    }
                    return null;
                }
            });

            if (result?.result) {
                extractedParentName = chatName; // Tab title = kanal adı
                chatName = result.result;       // DOM'dan okunan = topic adı
            }
        } catch (e) {
            console.warn('Could not extract topic name from DOM:', e);
        }
    }

    // Son çare: topic adı hala kanal adıyla aynıysa fallback
    if (threadId && chatName === extractedParentName) {
        chatName = `Topic #${threadId}`;
    }

    // Tip belirleme
    let type: 'channel' | 'group' | 'private' | 'topic' = 'private';
    if (threadId) {
        type = 'topic';
    } else if (chatId.startsWith('-')) {
        type = 'channel';
    }

    // 4. Bot Üyelik/Erişim Kontrolü
    try {
        const chatInfo = await TelegramService.getChat(profile.botToken, chatId);

        if (!chatInfo.ok) {
            const errorMsg = TelegramService.translateError(chatInfo.description || 'Unknown Error');
            if (tab.id) {
                await injectToast(tab.id, t.destination.error, errorMsg, 'error');
            }
            return;
        }

        // API'den gelen başlık: topic ekliyorsak parent ismi, değilse direkt chatName
        if (chatInfo.result?.title) {
            if (threadId) {
                extractedParentName = chatInfo.result.title;
            } else {
                chatName = chatInfo.result.title;
            }
        }

    } catch (e) {
        console.error('Chat validation failed', e);
        if (tab.id) {
            await injectToast(tab.id, t.destination.error, 'Network error or invalid token. Cannot validate chat.', 'error');
        }
        return;
    }

    let updatedTargets = [...profile.targets];

    // Parent otomatik ekleme
    if (threadId) {
        const parentExists = profile.targets.some(tgt => {
            const tId = tgt.id.replace('-100', '');
            const pId = chatId.replace('-100', '');
            return tId === pId && tgt.type !== 'topic';
        });

        if (!parentExists) {
            let parentName = extractedParentName || `Channel ${chatId.replace('-100', '').slice(-6)}`;

            // Parent ismi zaten yukarıdaki getChat ile güncellenmiş olabilir
            // Ancak topic eklerken parent ID (chatId) sorguladığımız için yukarıdaki chatName aslında parentName'dir.
            if (chatName && !extractedParentName) {
                parentName = chatName;
                // Topic ismi URL'den geleni korusun veya "General" olsun, 
                // ama biz burada sadece Target ekliyoruz. 
                // Topic eklendiğinde Parent Target da ekleniyor.
            }

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

    if (tab.id) {
        await injectToast(tab.id, t.destination.addedToSwiftShift, chatName, 'success');
    }
}
