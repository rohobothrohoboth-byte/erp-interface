import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

interface PaymentEntrySearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function PaymentEntrySearchFilter({
  searchTerm,
  setSearchTerm,
}: PaymentEntrySearchFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by PV number, vendor, invoice, or bank reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-indigo-200 "
          />
        </div>
      </div>
    </div>
  );
}
