// src/components/crm/leadManagement/leadGeneration/LeadGenerationHeader.tsx
import React from 'react';
import { Users, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../../ui/button';

interface LeadGenerationHeaderProps {
  onRefresh: () => void;
  onAddLead: () => void;
  loading?: boolean;
}

const LeadGenerationHeader: React.FC<LeadGenerationHeaderProps> = ({
                                                                     onRefresh,
                                                                     onAddLead,
                                                                     loading = false,
                                                                   }) => {
  return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-sm text-gray-500">Manage and track all your leads</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
              onClick={onRefresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button
              onClick={onAddLead}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={16} />
            New Lead
          </Button>
        </div>
      </div>
  );
};

export default LeadGenerationHeader;