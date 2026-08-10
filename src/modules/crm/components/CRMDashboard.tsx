// src/pages/crm/CRMDashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, Plus, Activity, Sparkles, Shield,
  Sun, Moon
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useCrmData } from '@/modules/crm/hooks/useCrmData';
import LeadOverview from '@/modules/crm/components/LeadOverview';
import ContactOverview from '@/modules/crm/components/ContactOverview';
import SalesOverview from '@/modules/crm/components/SalesOverview';
import MarketingOverview from '@/modules/crm/components/MarketingOverview';
import SupportOverview from '@/modules/crm/components/SupportOverview';
import ActivityOverview from '@/modules/crm/components/ActivityOverview';
import AnalyticsOverview from '@/modules/crm/components/AnalyticsOverview';

// Dark mode hook
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  return { isDarkMode, toggleDarkMode };
};

export default function CRMDashboard() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { loading, refreshing, refresh, stats, dashboardData } = useCrmData();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-amber-400/10 dark:from-orange-400/5 dark:to-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-400/10 to-pink-400/10 dark:from-red-400/5 dark:to-pink-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                CRM
                            </span>{" "}
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage leads, contacts, sales, marketing, support, and customer interactions
                {stats && (
                    <span className="ml-2 font-medium">
                                    • {stats.totalLeads} leads • {dashboardData?.activeOpportunities || 0} active opportunities
                                </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Current Time */}
              <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Activity size={14} />
                <span className="font-mono">
                                {formatDate(currentTime)} • {formatTime(currentTime)}
                            </span>
              </div>

              {/* Dark Mode Toggle */}
              <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              {/* Refresh Button */}
              <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={refreshing}
                  className="gap-2 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </Button>

              {/* New Entry Button */}
              <Button
                  size="sm"
                  className="flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md transition-all"
                  onClick={() => window.location.href = '/crm/leads/add'}
              >
                <Plus size={16} className="mr-2" />
                <span>New Lead</span>
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
                </div>
              </div>
          )}

          {/* Dashboard Content */}
          {!loading && (
              <>
                {/* Main Dashboard Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <LeadOverview />
                  <ContactOverview />
                  <SalesOverview />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  <MarketingOverview />
                  <SupportOverview />
                  <ActivityOverview />
                </div>

                <div className="mt-6">
                  <AnalyticsOverview />
                </div>
              </>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Live Data</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="w-3 h-3" />
                <span>Secure Connection</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>Real-time Sync</span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
                .bg-grid-slate-100 {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                    background-repeat: repeat;
                    background-size: 32px 32px;
                }
                .dark .bg-grid-slate-100 {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
            `}</style>
      </div>
  );
}