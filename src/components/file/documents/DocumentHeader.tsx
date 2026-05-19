import { FileText, Plus, Search, LayoutGrid, List } from 'lucide-react';

interface DocumentHeaderProps {
  title: string;
  subtitle: string;
  view: 'grid' | 'list';
  onViewChange: (v: 'grid' | 'list') => void;
  onUpload?: () => void;
  onSearch?: (q: string) => void;
}

export function DocumentHeader({ title, subtitle, view, onViewChange, onUpload, onSearch }: DocumentHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 w-56"
            />
          </div>
        )}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-2 transition-colors ${view === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-2 transition-colors ${view === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        {onUpload && (
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload
          </button>
        )}
      </div>
    </div>
  );
}
