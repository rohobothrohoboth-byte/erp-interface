import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type PeriodFiltersProps = {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
};

export default function PeriodFilters({
  searchTerm = '',
  onSearchChange,
  status = 'all',
  onStatusChange,
}: PeriodFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <Input
        value={searchTerm}
        onChange={(e) => onSearchChange?.(e.target.value)}
        placeholder="Search periods..."
        className="md:max-w-xs"
      />
      <Select value={status} onValueChange={(v) => onStatusChange?.(v)}>
        <SelectTrigger className="md:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="locked">Locked</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
