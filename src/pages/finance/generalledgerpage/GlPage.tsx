import React, { useState } from 'react';
import { 
  Layers,
  FileText,
  History,
} from 'lucide-react';
import ChartOfAccountsSection from '../../../components/finance/generalledger/chartOfAccounts/ChartOfAccountsSection';
import JournalEntriesSection from '../../../components/finance/generalledger/journalEntries/JournalEntriesSection';
import AuditTrailSection from '../../../components/finance/generalledger/auditTrail/AuditTrailSection';

// Define the tab interface
interface GlTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
}

const glTabs: GlTab[] = [
  {
    id: 'accounts',
    label: 'Chart of Accounts',
    icon: Layers,
    component: ChartOfAccountsSection,
  },
  {
    id: 'journals',
    label: 'Journal Entries',
    icon: FileText,
    component: JournalEntriesSection,
  },
  {
    id: 'audit',
    label: 'Audit Trail',
    icon: History,
    component: AuditTrailSection,
  },
];

function GlPage() {
  const [activeTab, setActiveTab] = useState('accounts');
  
  const ActiveTabComponent = glTabs.find(tab => tab.id === activeTab)?.component || ChartOfAccountsSection;

  return (
    <div>
      <div className='mx-auto space-y-4'>
        {/* General Ledger Header */}
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 bg-clip-text text-transparent mr-2">
                General 
              </span>
              Ledger
            </h1>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-2">
            <nav className="flex space-x-2">
              {glTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? `bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-sm`
                        : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    <IconComponent
                      className={`h-5 w-5 ${
                        isActive ? 'text-indigo-600' : 'text-gray-400'
                      }`}
                    />
                    {tab.label}
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="min-h-screen">
          {/* Tab Content */}
            <ActiveTabComponent />
        </div>
      </div>
    </div>
  );
}

export default GlPage;