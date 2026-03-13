import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';

interface AssetRegisterHeaderProps {
  onAddAsset?: () => void;
}

const AssetRegisterHeader: React.FC<AssetRegisterHeaderProps> = ({ onAddAsset }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Asset Register
          </h1>
        </div>
      </div>
      
      {onAddAsset && (
        <Button
          onClick={onAddAsset}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      )}
    </div>
  );
};

export default AssetRegisterHeader;