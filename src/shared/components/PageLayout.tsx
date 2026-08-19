// src/shared/components/PageLayout.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useCompanyStore } from '@/shared/stores/company.store';

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    headerActions?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
                                                          title,
                                                          subtitle,
                                                          icon,
                                                          children,
                                                          className = '',
                                                          headerActions,
                                                      }) => {
    const { t } = useLanguage();
    const { company } = useCompanyStore();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#c9a84c]/10 p-2 border border-[#c9a84c]/20">
                        {icon || <Building2 className="h-5 w-5 text-[#d4af37]" />}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#d4af37]">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-[#c9a84c]/60">{subtitle}</p>
                        )}
                    </div>
                </div>
                {headerActions && (
                    <div className="flex items-center gap-2">
                        {headerActions}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-xl border border-[#c9a84c]/20 bg-[#0d1f3c] p-6 shadow-lg shadow-[#c9a84c]/5 ${className}`}
            >
                {children}
            </motion.div>
        </div>
    );
};