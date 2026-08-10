import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BadgePlus } from 'lucide-react';

interface TransactionsSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterAccount: string;
  setFilterAccount: (account: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  onAddTransaction: () => void;
  onExport: () => void;
}

export const TransactionsSearchFilters: React.FC<TransactionsSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterAccount,
  setFilterAccount,
  dateRange,
  setDateRange,
  onAddTransaction,
}) => {
  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasSearchTerm = searchTerm !== '';

  const typeOptions = ['All', 'Income', 'Expense', 'Transfer', 'Refund', 'Adjustment'];
  const accountOptions = ['All', 'Checking', 'Savings', 'Credit Card', 'Petty Cash', 'Investment'];
  const dateOptions = ['Today', 'This Week', 'This Month', 'Last Month', 'Custom Range'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search transactions
          </label>
          <div className="relative max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search transactions by description, reference, or amount..."
              className="block w-full pl-10 pr-10 py-2.5 border border-indigo-300 rounded-lg leading-5 bg-white placeholder-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {hasSearchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-indigo-400 hover:text-indigo-600 transition-colors duration-200"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="sr-only">Clear search</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-700 hidden sm:inline">Filters:</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-indigo-300 rounded-lg px-3 py-2 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {typeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="border border-indigo-300 rounded-lg px-3 py-2 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {accountOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-indigo-300 rounded-lg px-3 py-2 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {dateOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onAddTransaction}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
          >
            <BadgePlus size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};