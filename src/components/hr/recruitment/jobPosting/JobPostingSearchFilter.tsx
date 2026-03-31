import { Search, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { PostingStatus, JobPostingType } from '../../../../types/hr/enum';

interface JobPostingSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  onAddClick: () => void;
}

const JobPostingSearchFilter: React.FC<JobPostingSearchFilterProps> = ({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter,
  typeFilter, setTypeFilter, onAddClick,
}) => (
  <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search by post or req number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-2/3 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
    {/* <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
      <option value="">All Statuses</option>
      {Object.entries(PostingStatus).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
      <option value="">All Types</option>
      {Object.entries(JobPostingType).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select> */}
    <Button onClick={onAddClick} className="bg-green-600 hover:bg-green-700 text-white cursor-pointer flex items-center gap-2">
      <Plus className="h-4 w-4" /> Add Posting
    </Button>
  </div>
);

export default JobPostingSearchFilter;
