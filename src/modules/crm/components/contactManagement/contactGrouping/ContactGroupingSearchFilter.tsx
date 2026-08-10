import { Search } from 'lucide-react';
import { BadgePlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContactGroupingSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export default function ContactGroupingSearchFilter({
  searchTerm,
  onSearchChange,
  onAddClick,
}: ContactGroupingSearchFilterProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap- justify-between"
    >
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search contact groups..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        <BadgePlus className="w-4 h-4" />
        Add Group
      </button>
    </motion.div>
  );
}
