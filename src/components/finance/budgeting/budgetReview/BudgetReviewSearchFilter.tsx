import { Search } from 'lucide-react';
import { Input } from '../../../ui/input';

interface BudgetReviewSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function BudgetReviewSearchFilter({
  searchTerm,
  setSearchTerm
}: BudgetReviewSearchFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-200 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search by budget plan, expense, budget code, or account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
