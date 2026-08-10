import React from 'react';
import { Search, Plus } from 'lucide-react';

interface EvaluationStepSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onAddClick: () => void;
}

const EvaluationStepSearchFilter: React.FC<EvaluationStepSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  onAddClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search steps..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Step
      </button>
    </div>
  );
};

export default EvaluationStepSearchFilter;
