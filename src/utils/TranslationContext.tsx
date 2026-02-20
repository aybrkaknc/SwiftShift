/**
 * TranslationContext
 * Uygulama genelinde dil durumunu yöneten React Context.
 * useTranslation hook'unun senkronize çalışmasını sağlar.
 */

import React, { createContext, useState, ReactNode } from 'react';
import { en, tr } from './locales';
import { getLocale, saveLocale, setCachedLocale } from './i18nUtils';

type Locale = 'en' | 'tr';
export type Translations = typeof en;

interface TranslationContextType {
    t: Translations;
    locale: Locale;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
}

// Varsayılan değerler (Provider dışı kullanım için fallback)
const defaultContext: TranslationContextType = {
    t: en,
    locale: 'en',
    setLocale: () => { },
    toggleLocale: () => { }
};

export const TranslationContext = createContext<TranslationContextType>(defaultContext);

export const getInitialLocale = (): Locale => {
    return getLocale();
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Popup açıldığında chrome.storage'dan da okumayı dene (async olduğu için state update gerekir)
    const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        saveLocale(newLocale);          // localStorage (Popup için)
        setCachedLocale(newLocale);     // Memory cache (Popup içindeki helperlar için)

        // Background script'i güncelle: Storage + Message
        try {
            chrome.storage.local.set({ swiftshift_locale: newLocale });
            chrome.runtime.sendMessage({ type: 'LOCALE_CHANGED', locale: newLocale });
        } catch (e) {
            console.error('Failed to notify background script about locale change', e);
        }
    };

    const toggleLocale = () => {
        setLocale(locale === 'en' ? 'tr' : 'en');
    };

    const t = locale === 'tr' ? tr : en;

    return (
        <TranslationContext.Provider value={{ t, locale, setLocale, toggleLocale }}>
            {children}
        </TranslationContext.Provider>
    );
};
