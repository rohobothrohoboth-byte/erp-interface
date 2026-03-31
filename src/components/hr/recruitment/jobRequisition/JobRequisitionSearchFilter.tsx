import { Search, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { ReviewStat } from '../../../../types/hr/enum';

interface JobRequisitionSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onAddClick: () => void;
}

const JobRequisitionSearchFilter: React.FC<JobRequisitionSearchFilterProps> = ({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter, onAddClick,
}) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search by req number or reason..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="md:w-2/3 w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
    <Button onClick={onAddClick} className="bg-green-600 hover:bg-green-700 text-white cursor-pointer flex items-center gap-2">
      <Plus className="h-4 w-4" /> Add Requisition
    </Button>
  </div>
);

export default JobRequisitionSearchFilter;
