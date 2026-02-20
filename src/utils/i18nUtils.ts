/**
 * i18n Utils (React-Free)
 * Service Worker ve React olmayan ortamlar için çeviri yardımcıları.
 * React bağımlılığı İÇERMEMELİDİR.
 */

import { en, tr } from './locales';

export type Locale = 'en' | 'tr';
export type Translations = typeof en;

const LOCALE_KEY = 'swiftshift_locale';

// Service Worker için bellek önbelleği
let cachedLocale: Locale | null = null;

/**
 * Service Worker için dili bellekte günceller
 */
export const setCachedLocale = (locale: Locale) => {
    cachedLocale = locale;
};

/**
 * Tarayıcı veya kayıtlı dili algılar
 */
export const getLocale = (): Locale => {
    // 1. Önce bellek önbelleğine bak (Service Worker için)
    if (cachedLocale) {
        return cachedLocale;
    }

    // 2. localStorage kontrol et (Popup/Content Script için)
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const saved = window.localStorage.getItem(LOCALE_KEY);
            if (saved === 'en' || saved === 'tr') {
                return saved;
            }
        }
    } catch (e) {
        // Service worker veya localStorage erişim hatası
    }

    // 3. Fallback: Tarayıcı dili
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('tr') ? 'tr' : 'en';
};

/**
 * Non-React helper: Background script kullanımı için
 */
export const getTranslations = (): Translations => {
    const locale = getLocale();
    return locale === 'tr' ? tr : en;
};

export const saveLocale = (locale: Locale) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(LOCALE_KEY, locale);
        }
    } catch (e) { }
};
