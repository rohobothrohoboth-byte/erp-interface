import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, X, Megaphone } from 'lucide-react';
import { Button } from '../../../ui/button';
import { ReviewStat } from '../../../../types/hr/enum';

interface JobRequisitionSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onAddClick: () => void;
  onViewPostings: () => void;
}

const JobRequisitionSearchFilter: React.FC<JobRequisitionSearchFilterProps> = ({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter, onAddClick, onViewPostings,
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Search + status */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by req number or reason..."
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
      {/* Action buttons */}
      <div className="flex items-center gap-2 justify-end">
        <Button onClick={onViewPostings} size="sm" variant="outline"
          className="flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50 cursor-pointer">
          <Megaphone className="w-4 h-4" /> Job Postings
        </Button>
        <Button onClick={onAddClick} size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer">
          <Plus className="w-4 h-4" /> Add Requisition
        </Button>
      </div>
    </div>
  </motion.div>
);

export default JobRequisitionSearchFilter;
