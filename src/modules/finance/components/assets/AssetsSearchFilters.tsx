import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, PlusCircle, Download } from 'lucide-react';

interface AssetsSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDepartment: string;
  setFilterDepartment: (department: string) => void;
  onAddNew: () => void;
  onExport: () => void;
}

export const AssetsSearchFilters: React.FC<AssetsSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterDepartment,
  setFilterDepartment,
  onAddNew,
  onExport,
}) => {
  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasSearchTerm = searchTerm !== '';

  const statusOptions = ['All', 'Active', 'In Use', 'Idle', 'Under Maintenance', 'Disposed'];
  const departmentOptions = ['All', 'IT', 'Operations', 'Finance', 'Sales', 'HR', 'Manufacturing', 'Administration'];

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
            Search assets
          </label>
          <div className="relative max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search assets by name, tag, serial number, or location..."
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

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-700 hidden sm:inline">Filter:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-indigo-300 rounded-lg px-3 py-2 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border border-indigo-300 rounded-lg px-3 py-2 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {departmentOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onAddNew}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
          >
            <PlusCircle size={18} />
            <span>Add Asset</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};