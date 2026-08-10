import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { BadgePlus } from 'lucide-react';

interface LeavePolicyTableHeaderProps {
  onAdd: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

const LeavePolicyAccrualHeader: React.FC<LeavePolicyTableHeaderProps> = ({

  onAdd
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-green-600">Leave <span className='text-gray-900'>Policies</span> </h2>
        
      </div>
      
      <div className="flex items-center gap-2">
   
        <Button 
          onClick={onAdd} 
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 cursor-pointer"
        >
          <BadgePlus className="h-4 w-4" />
          Add Accrual
        </Button>
      </div>
    </div>
  );
};

export default LeavePolicyAccrualHeader;