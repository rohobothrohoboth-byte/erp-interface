// src/i18n/LanguageSelector.tsx
import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage, availableLanguages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = availableLanguages.find(l => l.code === language);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm text-sm"
                aria-label="Select language"
            >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 dark:text-slate-300 hidden sm:inline">
                    {currentLanguage?.name}
                </span>
                <span className="text-base">{currentLanguage?.flag}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                        {availableLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                    language === lang.code ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-base">{lang.flag}</span>
                                    <span className="text-slate-700 dark:text-slate-300">{lang.name}</span>
                                </div>
                                {language === lang.code && (
                                    <Check className="w-4 h-4 text-emerald-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};