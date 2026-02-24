"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    translations,
    Language,
    Translations,
    LANGUAGE_STORAGE_KEY,
    DEFAULT_LANGUAGE,
} from "@/i18n/translations";

interface LanguageContextValue {
    lang: Language;
    t: Translations;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
    lang: DEFAULT_LANGUAGE,
    t: translations[DEFAULT_LANGUAGE],
    setLanguage: () => { },
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>(DEFAULT_LANGUAGE);

    // Read from localStorage on mount (client only)
    useEffect(() => {
        try {
            const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
            if (stored && stored in translations) {
                setLang(stored);
            }
        } catch {
            // localStorage not available (SSR)
        }
    }, []);

    const setLanguage = useCallback((newLang: Language) => {
        setLang(newLang);
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
        } catch {
            // ignore
        }
    }, []);

    return (
        <LanguageContext.Provider
            value={{ lang, t: translations[lang], setLanguage }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

// Convenience hook used by every component
export function useT() {
    return useContext(LanguageContext);
}
