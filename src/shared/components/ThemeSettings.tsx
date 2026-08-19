// src/components/ThemeSettings.tsx
import React, { useState } from 'react';
import { Settings, Moon, Sun, Eye, EyeOff, Contrast, Check } from 'lucide-react';
import { useTheme, ColorBlindMode } from '@/contexts/ThemeContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const ThemeSettings: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        themeMode,
        colorBlindMode,
        highContrast,
        toggleThemeMode,
        setColorBlindMode,
        toggleHighContrast,
        isDark
    } = useTheme();

    const colorBlindModes: { label: string; value: ColorBlindMode; icon: React.ReactNode }[] = [
        { label: 'None', value: 'none', icon: <Eye className="w-4 h-4" /> },
        { label: 'Deuteranopia (Red-Green)', value: 'deuteranopia', icon: <Eye className="w-4 h-4" /> },
        { label: 'Protanopia (Red-Green)', value: 'protanopia', icon: <Eye className="w-4 h-4" /> },
        { label: 'Tritanopia (Blue-Yellow)', value: 'tritanopia', icon: <Eye className="w-4 h-4" /> },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-[var(--color-gold-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Theme settings"
            >
                <Settings className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-xl p-4 z-50">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
                        Theme & Accessibility
                    </h3>

                    {/* Theme Mode Toggle */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-2">
                            Theme Mode
                        </label>
                        <button
                            onClick={toggleThemeMode}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
                        >
              <span className="text-[var(--color-text-primary)]">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
                            {isDark ? <Moon className="w-4 h-4 text-[var(--color-gold)]" /> : <Sun className="w-4 h-4 text-[var(--color-gold)]" />}
                        </button>
                    </div>

                    {/* High Contrast Toggle */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-2">
                            High Contrast
                        </label>
                        <button
                            onClick={toggleHighContrast}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
                        >
              <span className="text-[var(--color-text-primary)]">
                {highContrast ? 'High Contrast On' : 'High Contrast Off'}
              </span>
                            <Contrast className={`w-4 h-4 ${highContrast ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-muted)]'}`} />
                        </button>
                    </div>

                    {/* Color Blind Mode */}
                    <div>
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-2">
                            Color Blind Mode
                        </label>
                        <div className="space-y-2">
                            {colorBlindModes.map((mode) => (
                                <button
                                    key={mode.value}
                                    onClick={() => setColorBlindMode(mode.value)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                        colorBlindMode === mode.value
                                            ? 'bg-[var(--color-gold-subtle)] border border-[var(--color-border-hover)]'
                                            : 'bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {mode.icon}
                                        <span className="text-[var(--color-text-primary)] text-sm">
                      {mode.label}
                    </span>
                                    </div>
                                    {colorBlindMode === mode.value && (
                                        <Check className="w-4 h-4 text-[var(--color-gold)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};