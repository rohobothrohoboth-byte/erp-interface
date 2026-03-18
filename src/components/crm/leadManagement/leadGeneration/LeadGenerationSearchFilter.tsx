import React from 'react';
import { Search, X, Upload, Plus } from 'lucide-react';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Button } from '../../../ui/button';
import { motion } from 'framer-motion';
import { useCRMSettings } from '../../../../hooks/useCRMSettings';
import { useNavigate } from 'react-router-dom';

interface FilterState {
  searchTerm: string;
  status: string;
  source: string;
  assignedTo: string;
  scoreRange: string;
  dateRange: string;
}

interface LeadSearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export default function LeadSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters
}: LeadSearchFiltersProps) {
  const { 
    leadStatusNames, 
    leadSourceNames,
    loading: settingsLoading 
  } = useCRMSettings();

  const salesReps = [
    'Sarah Johnson',
    'Mike Wilson',
    'Emily Davis',
    'Robert Chen',
    'Lisa Anderson'
  ];

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex flex-col space-y-4">
        {/* Search Bar */}
        <div className="relative flex justify-between">
          <div className='w-full max-w-md'>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leads by name, email, or company..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10 pr-10"
            />
            {filters.searchTerm && (
              <button
                onClick={() => handleFilterChange('searchTerm', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}</div>
            
      <div className="flex space-x-2">
        <Button 
          variant="outline"
          onClick={() => navigate('/crm/leads/generation/import')}
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        {/* <Button 
          variant="outline"
          onClick={() => {}}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button> */}
        <Button 
          onClick={() => navigate('/crm/leads/add')}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {settingsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    leadStatusNames.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
              <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {settingsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    leadSourceNames.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Assigned To</label>
              <Select value={filters.assignedTo} onValueChange={(value) => handleFilterChange('assignedTo', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Reps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales Reps</SelectItem>
                  {salesReps.map((rep) => (
                    <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                  ))}
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Lead Score</label>
              <Select value={filters.scoreRange} onValueChange={(value) => handleFilterChange('scoreRange', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="hot">Hot (80-100)</SelectItem>
                  <SelectItem value="warm">Warm (60-79)</SelectItem>
                  <SelectItem value="cold">Cold (0-59)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Created</label>
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </Button>
            </div>
          </div>
        </div>
    </motion.div>
  );
}