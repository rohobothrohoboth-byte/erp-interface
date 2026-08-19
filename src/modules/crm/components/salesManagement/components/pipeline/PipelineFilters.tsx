import React from 'react';
import { Search, Filter, Calendar, User, Building } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DatePickerWithRange } from '@/shared/components/ui/date-picker';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface PipelineFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
}

const stageOptions = [
  'Qualification',
  'Needs Analysis', 
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

const assigneeOptions = [
  'Sarah Johnson',
  'Mike Wilson', 
  'Emily Davis',
  'Robert Chen',
  'Lisa Anderson'
];

export default function PipelineFilters({
  searchTerm,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  dateRange,
  onDateRangeChange,
  onClearFilters
}: PipelineFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search opportunities, accounts, contacts..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stage Filter */}
          <Select value={stageFilter} onValueChange={onStageFilterChange}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stageOptions.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Assignee Filter */}
          <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
            <SelectTrigger className="w-48">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {assigneeOptions.map(assignee => (
                <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <DatePickerWithRange
              date={dateRange}
              onDateChange={onDateRangeChange}
              placeholder="Expected close date"
            />
          </div>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600"
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}