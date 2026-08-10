import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface PaymentListSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (method: string) => void;
}

export default function PaymentListSearchFilter({
  searchTerm,
  setSearchTerm,
  paymentMethodFilter,
  setPaymentMethodFilter,
}: PaymentListSearchFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by PV number, vendor, or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-indigo-200"
          />
        </div>
        
        <div className="w-64">
          <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
            <SelectTrigger className="border-indigo-200">
              <SelectValue placeholder="All Payment Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Bank_Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Check">Check</SelectItem>
              <SelectItem value="Telebirr">Telebirr</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
