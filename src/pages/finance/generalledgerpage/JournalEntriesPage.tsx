import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import JournalEntriesSection from '../../../components/finance/generalledger/journalEntries/JournalEntriesSection';

function JournalEntriesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto space-y-4">
        {/* Page Header */}
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex flex-col space-y-1">
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 bg-clip-text text-transparent mr-2">
                  Journal
                </span>
                Entries
              </h1>
            </div>
          </div>
        </div>

        {/* Journal Entries Content */}
        <JournalEntriesSection />
      </div>
    </motion.div>
  );
}

export default JournalEntriesPage;
