// src/pages/finance/GlPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, FileText, History, BookOpen, BarChart3, Calendar, CheckCircle } from 'lucide-react';
import ChartOfAccountsPage from './ChartOfAccountsPage';
import JournalEntriesPage from './JournalEntriesPage';
import AuditTrailPage from './AuditTrailPage';

interface GlTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
  description: string;
  badge?: string;
}

const glTabs: GlTab[] = [
  {
    id: 'accounts',
    label: 'Chart of Accounts',
    icon: Layers,
    component: ChartOfAccountsPage,
    description: 'Manage account hierarchy and structure',
  },
  {
    id: 'journals',
    label: 'Journal Entries',
    icon: BookOpen,
    component: JournalEntriesPage,
    description: 'Create and manage journal entries',
    badge: 'Active',
  },
  {
    id: 'audit',
    label: 'Audit Trail',
    icon: History,
    component: AuditTrailPage,
    description: 'Track all changes and activities',
  },
];

function GlPage() {
  const [activeTab, setActiveTab] = useState('accounts');

  const ActiveTabComponent = glTabs.find(tab => tab.id === activeTab)?.component || ChartOfAccountsPage;
  const activeTabData = glTabs.find(tab => tab.id === activeTab);

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* General Ledger Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent">
                General
              </span>
                <span className="text-gray-800"> Ledger</span>
              </h1>
              <p className="text-sm text-gray-500">
                {activeTabData?.description || 'Manage accounts, journals, and audit trails'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5">
          <nav className="flex gap-1 overflow-x-auto">
            {glTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap flex-1 justify-center relative ${
                          isActive
                              ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/80 text-indigo-700 shadow-sm border border-indigo-200'
                              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                  >
                    <IconComponent className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isActive
                                ? 'bg-indigo-200 text-indigo-700'
                                : 'bg-gray-200 text-gray-500'
                        }`}>
                    {tab.badge}
                  </span>
                    )}
                    {isActive && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full"
                            transition={{ duration: 0.2 }}
                        />
                    )}
                  </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content with Animation */}
        <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
        >
          <ActiveTabComponent />
        </motion.div>
      </motion.div>
  );
}

export default GlPage;