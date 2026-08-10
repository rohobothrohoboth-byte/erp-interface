import { Search, BadgePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';

export interface TaskFilterState {
  searchTerm: string;
  status: string;
  type: string;
  dateRange: string;
}

interface TasksSearchFilterProps {
  filters: TaskFilterState;
  onFiltersChange: (filters: TaskFilterState) => void;
  onAddClick: () => void;
}

export default function TasksSearchFilter({ filters, onFiltersChange, onAddClick }: TasksSearchFilterProps) {
  const update = (key: keyof TaskFilterState, value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const clearFilters = () =>
    onFiltersChange({ searchTerm: '', status: 'all', type: 'all', dateRange: 'all' });

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search activities..."
            value={filters.searchTerm}
            onChange={(e) => update('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <Select value={filters.status} onValueChange={(v) => update('status', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={(v) => update('type', v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Call">Call</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Meeting">Meeting</SelectItem>
            <SelectItem value="Task">Task</SelectItem>
            <SelectItem value="Note">Note</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.dateRange} onValueChange={(v) => update('dateRange', v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear
        </Button>

        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors ml-auto"
        >
          <BadgePlus className="w-4 h-4" />
          New Activity
        </button>
      </div>
    </motion.div>
  );
}
