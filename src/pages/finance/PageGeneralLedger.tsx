// src/pages/finance/PageGeneralLedger.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import ChartOfAccountsSection from '../../components/finance/generalledger/chartOfAccounts/ChartOfAccountsSection';

const PageGeneralLedger: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">General Ledger</h1>
                        <p className="text-sm text-gray-500">View account balances and transactions</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => window.location.reload()}
                >
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            {/* Chart of Accounts Section */}
            <ChartOfAccountsSection />
        </motion.div>
    );
};

export default PageGeneralLedger;