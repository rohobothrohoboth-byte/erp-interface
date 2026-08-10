import { Search, LayoutGrid, List, SlidersHorizontal, PanelRight, ChevronDown } from 'lucide-react';
import type { SortField, SortDir, ViewMode } from '@/modules/file/types/folder.types';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface FileToolbarProps {
  query: string;
  onQuery: (v: string) => void;
  viewMode: ViewMode;
  onViewMode: (v: ViewMode) => void;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField, dir: SortDir) => void;
  previewEnabled: boolean;
  onTogglePreview: () => void;
}

const SORT_OPTIONS: { label: string; field: SortField; dir: SortDir }[] = [
  { label: 'Name (A → Z)',    field: 'name',      dir: 'asc'  },
  { label: 'Name (Z → A)',    field: 'name',      dir: 'desc' },
  { label: 'Date (Newest)',   field: 'updatedAt', dir: 'desc' },
  { label: 'Date (Oldest)',   field: 'updatedAt', dir: 'asc'  },
  { label: 'Size (Largest)',  field: 'size',      dir: 'desc' },
  { label: 'Size (Smallest)', field: 'size',      dir: 'asc'  },
  { label: 'Type',            field: 'type',      dir: 'asc'  },
];

export function FileToolbar({
  query, onQuery,
  viewMode, onViewMode,
  sortField, sortDir, onSort,
  previewEnabled, onTogglePreview,
}: FileToolbarProps) {
  const activeSort = SORT_OPTIONS.find((o) => o.field === sortField && o.dir === sortDir);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 max-w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search files..."
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {activeSort?.label ?? 'Sort'}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {SORT_OPTIONS.map((o) => (
            <DropdownMenuItem
              key={`${o.field}-${o.dir}`}
              onClick={() => onSort(o.field, o.dir)}
              className={sortField === o.field && sortDir === o.dir ? 'bg-green-50 text-green-700' : ''}
            >
              {o.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View toggle */}
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => onViewMode('grid')}
          className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          title="Grid view"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewMode('list')}
          className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          title="List view"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Preview toggle */}
      <button
        onClick={onTogglePreview}
        title={previewEnabled ? 'Hide preview' : 'Show preview'}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
          previewEnabled
            ? 'bg-green-500 text-white border-green-500'
            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
        }`}
      >
        <PanelRight className="w-4 h-4" />
        Preview
      </button>
    </div>
  );
}
