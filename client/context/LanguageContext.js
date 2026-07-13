'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import en from '@/locales/en.json';
import es from '@/locales/es.json';
import hi from '@/locales/hi.json';
import pt from '@/locales/pt.json';
import zh from '@/locales/zh.json';
import fr from '@/locales/fr.json';

export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'pt', label: 'Português' },
    { code: 'zh', label: '中文' },
    { code: 'fr', label: 'Français' },
];

const DICTIONARIES = { en, es, hi, pt, zh, fr };
const STORAGE_KEY = 'app_language';
const DEFAULT_LANGUAGE = 'en';

// Reads a nested key like "job.applyNow" out of a dictionary object
function resolveKey(dict, key) {
    return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
}

const LanguageContext = createContext({
    language: DEFAULT_LANGUAGE,
    setLanguage: (_code) => { },
    t: (key) => key,
});

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored && DICTIONARIES[stored]) {
                setLanguageState(stored);
            }
        } catch (err) {
            // localStorage can throw in some privacy modes — fall back to default silently
            console.warn('Could not read stored language preference:', err);
        }
    }, []);

    const setLanguage = useCallback((code) => {
        if (!DICTIONARIES[code]) return;
        setLanguageState(code);
        try {
            window.localStorage.setItem(STORAGE_KEY, code);
        } catch (err) {
            console.warn('Could not persist language preference:', err);
        }
    }, []);

    const t = useCallback(
        (key, fallback) => {
            const dict = DICTIONARIES[language] || DICTIONARIES[DEFAULT_LANGUAGE];
            const value = resolveKey(dict, key);
            if (value !== undefined) return value;

            // Fall back to English if the current language is missing a key
            // (e.g. a newly added string not yet translated everywhere)
            const fallbackValue = resolveKey(DICTIONARIES[DEFAULT_LANGUAGE], key);
            return fallbackValue !== undefined ? fallbackValue : fallback ?? key;
        },
        [language]
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}