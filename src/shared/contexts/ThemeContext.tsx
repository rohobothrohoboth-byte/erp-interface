// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type ThemeMode = 'dark' | 'light' | 'high-contrast';

interface ThemeContextType {
    themeMode: ThemeMode;
    colorBlindMode: ColorBlindMode;
    highContrast: boolean;
    toggleThemeMode: () => void;
    setColorBlindMode: (mode: ColorBlindMode) => void;
    toggleHighContrast: () => void;
    isDark: boolean;
    isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
    const [colorBlindMode, setColorBlindMode] = useState<ColorBlindMode>('none');
    const [highContrast, setHighContrast] = useState(false);

    useEffect(() => {
        // Load saved preferences
        const savedTheme = localStorage.getItem('theme-mode') as ThemeMode | null;
        const savedColorBlind = localStorage.getItem('color-blind-mode') as ColorBlindMode | null;
        const savedHighContrast = localStorage.getItem('high-contrast') === 'true';

        if (savedTheme) setThemeMode(savedTheme);
        if (savedColorBlind) setColorBlindMode(savedColorBlind);
        if (savedHighContrast) setHighContrast(savedHighContrast);

        // Apply to document
        applyThemeToDocument(savedTheme || 'dark', savedColorBlind || 'none', savedHighContrast);
    }, []);

    const applyThemeToDocument = (theme: ThemeMode, colorBlind: ColorBlindMode, contrast: boolean) => {
        const root = document.documentElement;

        // Remove all theme data attributes
        root.removeAttribute('data-theme');
        root.removeAttribute('data-color-blind');
        root.removeAttribute('data-high-contrast');

        // Apply new settings
        if (theme) root.setAttribute('data-theme', theme);
        if (colorBlind && colorBlind !== 'none') {
            root.setAttribute('data-color-blind', colorBlind);
        }
        if (contrast) root.setAttribute('data-high-contrast', 'true');
    };

    const toggleThemeMode = () => {
        const newMode = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newMode);
        localStorage.setItem('theme-mode', newMode);
        applyThemeToDocument(newMode, colorBlindMode, highContrast);
    };

    const handleSetColorBlindMode = (mode: ColorBlindMode) => {
        setColorBlindMode(mode);
        localStorage.setItem('color-blind-mode', mode);
        applyThemeToDocument(themeMode, mode, highContrast);
    };

    const toggleHighContrast = () => {
        const newValue = !highContrast;
        setHighContrast(newValue);
        localStorage.setItem('high-contrast', String(newValue));
        applyThemeToDocument(themeMode, colorBlindMode, newValue);
    };

    const value = {
        themeMode,
        colorBlindMode,
        highContrast,
        toggleThemeMode,
        setColorBlindMode: handleSetColorBlindMode,
        toggleHighContrast,
        isDark: themeMode === 'dark' || themeMode === 'high-contrast',
        isHighContrast: highContrast,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};