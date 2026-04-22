import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Send } from 'lucide-react';
import { Button } from '../../../ui/button';

interface JobPostingSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  onPublishAll?: () => void;
  isPublishAllLoading?: boolean;
}

const JobPostingSearchFilter: React.FC<JobPostingSearchFilterProps> = ({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter, typeFilter, setTypeFilter,
  onPublishAll, isPublishAllLoading,
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by post or req number..."
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
      {onPublishAll && (
        <Button onClick={onPublishAll} size="sm" disabled={isPublishAllLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer whitespace-nowrap">
          <Send className="w-4 h-4" />
          {isPublishAllLoading ? 'Publishing...' : 'Publish All'}
        </Button>
      )}
    </div>
  </motion.div>
);

export default JobPostingSearchFilter;
