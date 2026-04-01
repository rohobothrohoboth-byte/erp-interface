import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { Button } from '../../../ui/button';
import { ReviewStat } from '../../../../types/hr/enum';

interface WorkforcePlanSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onAddClick: () => void;
}

const WorkforcePlanSearchFilter: React.FC<WorkforcePlanSearchFilterProps> = ({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter, onAddClick,
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title or plan code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button type="button" onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        {/* <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Statuses</option>
          {Object.entries(ReviewStat).map(([key, label]) => (
            <option key={key} value={label}>{label}</option>
          ))}
        </select> */}
      </div>
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={onAddClick} size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer">
          <Plus className="w-4 h-4" /> Add Plan
        </Button>
      </div>
    </div>
  </motion.div>
);

export default WorkforcePlanSearchFilter;
