/**
 * useTranslation Hook (Wrapper)
 * TranslationContext kullanarak tüm bileşenlerin senkronize çalışmasını sağlar.
 * Non-React helper (getTranslations) da burada yer alır.
 */
import { useContext } from 'react';
import { TranslationContext, getInitialLocale } from './TranslationContext';
import { en, tr } from './locales';

export type Translations = typeof en;

/**
 * React hook: Bileşen içinde kullanım için
 * TranslationContext kullanarak global state'e erişir.
 */
export const useTranslation = () => {
    return useContext(TranslationContext);
};

/**
 * Non-React context: Background script veya service worker'da kullanım için
 * Service Worker'da localStorage çalışmaz, bu yüzden navigator.language kullanılır.
 * Eğer localStorage varsa (Popup/Content Script) oradan okur.
 */
export const getTranslations = (): Translations => {
    const locale = getInitialLocale();
    return locale === 'tr' ? tr : en;
};

// Helper for pure browser language check without storage
export const getBrowserLocale = (): 'en' | 'tr' => {
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('tr') ? 'tr' : 'en';
};
