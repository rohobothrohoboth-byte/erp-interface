// src/i18n/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LanguageCode, Translation } from './types';  // Changed to type-only import
import { en } from './translations/en';
import { am } from './translations/am';
import { om } from './translations/om';
import { ti } from './translations/ti';
import { so } from './translations/so';
import { ar } from './translations/ar';

const translations: Record<LanguageCode, Translation> = { en, am, om, ti, so, ar };

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: Translation;
    availableLanguages: { code: LanguageCode; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageCode>('en');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') as LanguageCode;
        if (savedLanguage && translations[savedLanguage]) {
            setLanguage(savedLanguage);
        }
    }, []);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    };

    const availableLanguages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
        { code: 'om', name: 'Oromoo', flag: '🇪🇹' },
        { code: 'ti', name: 'ትግርኛ', flag: '🇪🇷' },
        { code: 'so', name: 'Soomaali', flag: '🇸🇴' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage: handleSetLanguage,
                t: translations[language],
                availableLanguages,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};