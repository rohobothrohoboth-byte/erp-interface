import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, DollarSign, UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface PayrollSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterDepartment: string;
  setFilterDepartment: (department: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onProcessPayroll: () => void;
  onAddEmployee: () => void;
  onExport?: () => void;
  departments?: string[];
  statuses?: string[];
}

export const PayrollSearchFilters: React.FC<PayrollSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterDepartment,
  setFilterDepartment,
  filterStatus,
  setFilterStatus,
  onProcessPayroll,
  onAddEmployee,
  departments = ['All', 'IT', 'HR', 'Finance', 'Sales', 'Operations', 'Marketing', 'Engineering', 'Customer Service'],
  statuses = ['All', 'Active', 'On Leave', 'Pending', 'Terminated'],
}) => {
  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasSearchTerm = searchTerm !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Search Input */}
        <div className="flex-1 max-w-xl">
          <label htmlFor="search" className="sr-only">
            Search payroll
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search employees by name, ID, position, or grade..."
              className="block w-full pl-10 pr-10 py-3 border border-indigo-300 rounded-lg leading-5 bg-white placeholder-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {hasSearchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-indigo-400 hover:text-indigo-600 transition-colors duration-200 p-1"
                  aria-label="Clear search"
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
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-700">Filters</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="appearance-none border border-indigo-300 rounded-lg px-4 py-2.5 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white pr-10 cursor-pointer hover:border-indigo-400 transition-colors duration-200"
              >
                <option value="" disabled>Select Department</option>
                {departments.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none border border-indigo-300 rounded-lg px-4 py-2.5 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white pr-10 cursor-pointer hover:border-indigo-400 transition-colors duration-200"
              >
                <option value="" disabled>Select Status</option>
                {statuses.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onAddEmployee}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
          >
            <UserPlus size={18} />
            <span>Add Employee</span>
          </Button>
          
          <Button
            onClick={onProcessPayroll}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
          >
            <DollarSign size={18} />
            <span>Process Payroll</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PayrollSearchFilters;