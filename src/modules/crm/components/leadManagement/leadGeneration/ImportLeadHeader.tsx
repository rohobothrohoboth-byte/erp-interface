// src/components/crm/leadManagement/leadGeneration/ImportLeadHeader.tsx
import React from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

const ImportLeadHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
              onClick={() => navigate('/crm/leads')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import Leads</h1>
            <p className="text-sm text-gray-500">Import leads from CSV or Excel file</p>
          </div>
        </div>
        <Button
            variant="outline"
            onClick={() => navigate('/crm/leads')}
            className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Leads
        </Button>
      </div>
  );
};

export default ImportLeadHeader;