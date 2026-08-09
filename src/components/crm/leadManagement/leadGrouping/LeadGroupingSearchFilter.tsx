// src/components/crm/leadManagement/leadGrouping/LeadGroupingSearchFilter.tsx
import React from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../ui/select';

interface LeadGroupingSearchFilterProps {
    groupBy: string;
    onGroupByChange: (value: string) => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

const LeadGroupingSearchFilter: React.FC<LeadGroupingSearchFilterProps> = ({
                                                                               groupBy,
                                                                               onGroupByChange,
                                                                               onExpandAll,
                                                                               onCollapseAll,
                                                                           }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Group By:</span>
            </div>
            <Select value={groupBy} onValueChange={onGroupByChange}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="source">Source</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="assigned">Assigned To</SelectItem>
                </SelectContent>
            </Select>
            <Button
                size="sm"
                variant="outline"
                onClick={onExpandAll}
                className="flex items-center gap-1"
            >
                <ChevronDown size={14} />
                Expand All
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={onCollapseAll}
                className="flex items-center gap-1"
            >
                <ChevronRight size={14} />
                Collapse All
            </Button>
        </div>
    );
};

export default LeadGroupingSearchFilter;