import React from 'react';
import { motion } from 'framer-motion';
import { Search, BadgePlus, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface EvaluationFlowSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddClick: () => void;
}

const EvaluationFlowSearchFilter: React.FC<EvaluationFlowSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  onAddClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-4 rounded-lg shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            placeholder="Search evaluation flows..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-2 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <Button
          onClick={onAddClick}
          size="sm"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap cursor-pointer"
        >
          <BadgePlus className="h-4 w-4" />
          Add New
        </Button>
      </div>
    </motion.div>
  );
};

export default EvaluationFlowSearchFilter;
