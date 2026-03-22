import { browser } from '../utils/browser-api';
import { LogService } from '../services/logService';
import { setCachedLocale } from '../utils/i18nUtils';
import { ContextMenuManager } from '../services/contextMenu/menuBuilder';

// Global Locale Init (Async - Restore language on wake up)
(async () => {
    const res = await browser.storage.local.get('swiftshift_locale');
    if (res && res.swiftshift_locale) {
        setCachedLocale(res.swiftshift_locale as any);
    }
})();

// === LIFECYCLE EVENTS ===

/**
 * Extension Kurulduğunda
 */
browser.runtime.onInstalled.addListener(async (details) => {
    // 1. Dili yükle
    const localeData = await browser.storage.local.get('swiftshift_locale');
    if (localeData.swiftshift_locale) {
        setCachedLocale(localeData.swiftshift_locale as any);
    }

    // 2. Menüyü oluştur
    await ContextMenuManager.init();

    // 3. Loglama
    await LogService.add({
        type: 'info',
        message: `System: Extension ${details.reason}`,
        details: `Reason: ${details.reason}`
    });

    if (details.reason === 'install') {
        browser.tabs.create({ url: 'welcome.html' });
    }
});

/**
 * Tarayıcı Başlatıldığında
 */
browser.runtime.onStartup.addListener(async () => {
    // 1. Dili yükle
    const localeData = await browser.storage.local.get('swiftshift_locale');
    if (localeData.swiftshift_locale) {
        setCachedLocale(localeData.swiftshift_locale as any);
    }

    // 2. Menüyü oluştur
    await ContextMenuManager.init();
});

// === CONTEXT MENU EVENTS ===
browser.contextMenus.onClicked.addListener((info, tab) => {
    ContextMenuManager.onClicked(info as any, tab);
});

// === MESSAGE LISTENER ===
browser.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
    // 1. REFRESH_MENU
    if (message.type === 'REFRESH_MENU') {
        ContextMenuManager.init();
        sendResponse({ success: true });
        return true as any;
    }

    // 2. LOCALE_CHANGED
    if (message.type === 'LOCALE_CHANGED' && message.locale) {
        setCachedLocale(message.locale);
        ContextMenuManager.init(); // Dil değiştiği için menüyü yeniden oluştur
        sendResponse({ success: true });
        return true as any;
    }

    // 3. CAPTURE_COMPLETE
    if (message && message.type === "CAPTURE_COMPLETE") {
        return true as any; // Async response
    }
});
