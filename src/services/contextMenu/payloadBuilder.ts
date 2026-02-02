/**
 * Payload Builder
 * Context menu bilgilerinden Telegram payload'ı oluşturur.
 */

/**
 * Payload arayüzü
 */
export interface TelegramPayloadData {
    text?: string;
    photo?: string;
    document?: string;
    audio?: string;
    caption?: string;
}

/**
 * Context menu bilgilerinden payload oluşturur
 * @param info Context menu click bilgisi
 * @param tab Aktif sekme bilgisi
 * @param priorityType Öncelikli içerik tipi (image, link, audio, text)
 * @param sendAsFile Dosya olarak mı gönderilsin
 * @returns Telegram payload'ı veya null
 */
export async function buildPayload(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
    priorityType?: string,
    sendAsFile?: boolean
): Promise<TelegramPayloadData | null> {

    // --- PRIORITY CHECKS ---
    if (priorityType === 'image' && info.mediaType === 'image' && info.srcUrl) {
        const isSvg = info.srcUrl.toLowerCase().endsWith('.svg') ||
            info.srcUrl.toLowerCase().includes('.svg?') ||
            info.srcUrl.startsWith('data:image/svg+xml');

        if (sendAsFile || isSvg) {
            return { document: info.srcUrl, caption: tab?.url };
        }
        return { photo: info.srcUrl, caption: tab?.url };
    }

    if (priorityType === 'link' && info.linkUrl) {
        return { text: info.linkUrl };
    }

    if (priorityType === 'audio' && info.mediaType === 'audio' && info.srcUrl) {
        return { audio: info.srcUrl, caption: tab?.url };
    }

    if (priorityType === 'text' && info.selectionText) {
        return { text: info.selectionText };
    }

    // --- FALLBACK CHECKS (Mevcut Mantık) ---

    // 1. Metin Seçimi
    if (info.selectionText) {
        return { text: info.selectionText };
    }

    // 2. Link
    if (info.linkUrl) {
        return { text: info.linkUrl };
    }

    // 3. Görsel (URL)
    if (info.mediaType === 'image' && info.srcUrl) {
        const isSvg = info.srcUrl.toLowerCase().endsWith('.svg') ||
            info.srcUrl.toLowerCase().includes('.svg?') ||
            info.srcUrl.startsWith('data:image/svg+xml');

        if (sendAsFile || isSvg) {
            return { document: info.srcUrl, caption: tab?.url };
        }
        return { photo: info.srcUrl, caption: tab?.url };
    }

    // 4. Video (Link)
    if (info.mediaType === 'video' && info.srcUrl) {
        return { text: `Video: ${info.srcUrl}\nSource: ${tab?.url}` };
    }

    // 4.5 Audio
    if (info.mediaType === 'audio' && info.srcUrl) {
        return { audio: info.srcUrl, caption: tab?.url };
    }

    // 5. Sayfa (Varsayılan)
    if (tab?.url) {
        return { text: `${tab.title || 'Page'}\n${tab.url}` };
    }

    return null;
}
