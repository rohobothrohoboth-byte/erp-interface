import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../../ui/input';

interface AssetRegisterSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

const AssetRegisterSearchFilter: React.FC<AssetRegisterSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
}) => {


  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full lg:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by asset ID, name, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
  );
};

export default AssetRegisterSearchFilter;