import { Search, RefreshCw, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface BranchSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const BranchSearch: React.FC<BranchSearchProps> = ({
                                                            searchTerm,
                                                            onSearchChange,
                                                            onRefresh,
                                                            loading = false
                                                          }) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  const hasSearchTerm = searchTerm !== '';

  return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                  type="text"
                  placeholder="Search branches by name, status..."
                  className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
              />
              {hasSearchTerm && (
                  <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
  );
};