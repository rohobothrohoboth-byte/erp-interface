import { FolderOpen, Plus, Search } from 'lucide-react';

interface FolderHeaderProps {
  title: string;
  subtitle: string;
  onNew?: () => void;
  onSearch?: (q: string) => void;
}

export function FolderHeader({ title, subtitle, onNew, onSearch }: FolderHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <FolderOpen className="w-5 h-5" />
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
              placeholder="Search folders..."
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 w-56"
            />
          </div>
        )}
        {onNew && (
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        )}
      </div>
    </div>
  );
}
