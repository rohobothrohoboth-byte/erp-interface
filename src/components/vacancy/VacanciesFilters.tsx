// src/components/vacancy/VacanciesFilters.tsx

import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';

interface VacanciesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: {
    department: string;
    location: string;
    type: string;
    status: string;
  };
  setFilters: (filters: any) => void;
  departments: string[];
  locations: string[];
}

const VacanciesFilters = ({
                            searchTerm,
                            setSearchTerm,
                            filters,
                            setFilters,
                            departments,
                            locations
                          }: VacanciesFiltersProps) => {
  const hasActiveFilters = filters.department !== 'all' ||
      filters.location !== 'all' ||
      filters.type !== 'all' ||
      filters.status !== 'open';

  const clearFilters = () => {
    setFilters({
      department: 'all',
      location: 'all',
      type: 'all',
      status: 'open'
    });
  };

  // ✅ Filter out empty or null values and ensure unique values
  const validDepartments = Array.from(
      new Set(departments.filter(dept => dept && dept.trim() !== ''))
  );

  const validLocations = Array.from(
      new Set(locations.filter(loc => loc && loc.trim() !== ''))
  );

  return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Vacancies</h3>
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
            )}
          </div>
          <span className="text-sm text-gray-500">
          {validDepartments.length} departments
        </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                  type="text"
                  placeholder="Search by title, department, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <Select
                value={filters.department || 'all'}
                onValueChange={(value) => setFilters({ ...filters, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {validDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div>
            <Select
                value={filters.location || 'all'}
                onValueChange={(value) => setFilters({ ...filters, location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {validLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div>
            <Select
                value={filters.type || 'all'}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select
                value={filters.status || 'open'}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
  );
};

export default VacanciesFilters; // ✅ Fixed: proper export name