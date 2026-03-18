import { motion } from 'framer-motion';
import { BadgePlus, List, Calendar } from 'lucide-react';
import { Button } from '../../../ui/button';

interface ActivityHeaderProps {
  viewMode: 'list' | 'calendar';
  onViewModeChange: (mode: 'list' | 'calendar') => void;
  onAddActivity: () => void;
}

export default function ActivityHeader({ viewMode, onViewModeChange, onAddActivity }: ActivityHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between"
    >
      <h1 className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent text-2xl font-bold">
        Activity Management
      </h1>
      <div className="flex items-center gap-2">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => onViewModeChange('calendar')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'calendar' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
        </div>
        <Button
          onClick={onAddActivity}
          size="sm"
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <BadgePlus className="h-4 w-4" />
          Add Activity
        </Button>
      </div>
    </motion.div>
  );
}
