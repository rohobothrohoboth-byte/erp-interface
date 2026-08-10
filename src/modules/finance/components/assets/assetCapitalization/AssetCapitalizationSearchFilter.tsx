import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

interface AssetCapitalizationSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const AssetCapitalizationSearchFilter: React.FC<AssetCapitalizationSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 gap-4 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by asset name, reference, vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCapitalizationSearchFilter;
