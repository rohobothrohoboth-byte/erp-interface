// src/components/hr/recruitment/jobPosting/JobPostingSearchFilter.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Send, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

interface JobPostingSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  onPublishAll?: () => void;
  isPublishAllLoading?: boolean;
  onRefresh?: () => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Expired', label: 'Expired' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Internal', label: 'Internal' },
  { value: 'External', label: 'External' },
  { value: 'Both', label: 'Both' },
];

const JobPostingSearchFilter: React.FC<JobPostingSearchFilterProps> = ({
                                                                         searchTerm,
                                                                         setSearchTerm,
                                                                         statusFilter,
                                                                         setStatusFilter,
                                                                         typeFilter,
                                                                         setTypeFilter,
                                                                         onPublishAll,
                                                                         isPublishAllLoading,
                                                                         onRefresh,
                                                                       }) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = statusFilter || typeFilter;

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Search by post or req number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
            />
            {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                  <Badge className="bg-emerald-100 text-emerald-700 ml-1 h-5 px-1.5 text-[10px]">
                    {[statusFilter, typeFilter].filter(Boolean).length}
                  </Badge>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {onRefresh && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
            )}

            {onPublishAll && (
                <Button
                    onClick={onPublishAll}
                    size="sm"
                    disabled={isPublishAllLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  {isPublishAllLoading ? 'Publishing...' : 'Publish All'}
                </Button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
              <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
              >
                <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {typeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {hasActiveFilters && (
                      <div className="flex items-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStatusFilter('');
                              setTypeFilter('');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                          Clear All
                        </Button>
                      </div>
                  )}
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
};

export default JobPostingSearchFilter;