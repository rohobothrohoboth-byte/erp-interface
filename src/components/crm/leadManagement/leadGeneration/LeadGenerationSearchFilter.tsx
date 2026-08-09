// src/components/crm/leadManagement/leadGeneration/LeadGenerationSearchFilter.tsx
import React from 'react';
import { Search, Filter, Star, Tag } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';

interface LeadGenerationSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterPriority: string;
  onPriorityChange: (value: string) => void;
  filterSource: string;
  onSourceChange: (value: string) => void;
  onClearFilters: () => void;
  onSearch: () => void;
}

const LeadGenerationSearchFilter: React.FC<LeadGenerationSearchFilterProps> = ({
                                                                                 searchTerm,
                                                                                 onSearchChange,
                                                                                 filterStatus,
                                                                                 onStatusChange,
                                                                                 filterPriority,
                                                                                 onPriorityChange,
                                                                                 filterSource,
                                                                                 onSourceChange,
                                                                                 onClearFilters,
                                                                                 onSearch,
                                                                               }) => {
  return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
              placeholder="Search leads by name, email, or company..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>

        <Select value={filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Proposal">Proposal</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-40">
            <Star className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priority</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSource} onValueChange={onSourceChange}>
          <SelectTrigger className="w-40">
            <Tag className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sources</SelectItem>
            <SelectItem value="Website">Website</SelectItem>
            <SelectItem value="Referral">Referral</SelectItem>
            <SelectItem value="SocialMedia">Social Media</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="ColdCall">Cold Call</SelectItem>
            <SelectItem value="Event">Event</SelectItem>
          </SelectContent>
        </Select>

        <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
        >
          Clear Filters
        </Button>
      </div>
  );
};

export default LeadGenerationSearchFilter;