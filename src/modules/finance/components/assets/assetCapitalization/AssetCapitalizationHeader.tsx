import React from 'react';
import { Package } from 'lucide-react';

const AssetCapitalizationHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Package className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Asset Capitalization
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AssetCapitalizationHeader;
