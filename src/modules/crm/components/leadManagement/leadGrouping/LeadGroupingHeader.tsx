// src/components/crm/leadManagement/leadGrouping/LeadGroupingHeader.tsx
import React from 'react';
import { Layers, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface LeadGroupingHeaderProps {
  onRefresh: () => void;
  loading?: boolean;
}

const LeadGroupingHeader: React.FC<LeadGroupingHeaderProps> = ({
                                                                 onRefresh,
                                                                 loading = false,
                                                               }) => {
  return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Layers className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Grouping</h1>
            <p className="text-sm text-gray-500">
              View and manage leads organized by different criteria
            </p>
          </div>
        </div>
        <Button
            onClick={onRefresh}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>
  );
};

export default LeadGroupingHeader;