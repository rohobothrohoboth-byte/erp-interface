import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import { HolidayList } from '@/modules/core/components/holiday/HolidayList';
import { HolidaySearch } from '@/modules/core/components/holiday/HolidaySearch';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  useHolidays,
  useUpdateHoliday,
  useDeleteHoliday
} from '@/modules/core/services/holiday/holiday.queries';
import { useFiscalYears } from '@/modules/core/services/fiscalyear/fisc.queries';
import type { HolidayListDto, EditHolidayDto } from '@/modules/core/types/holiday';

export const HolidayHistory = () => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredHolidays, setFilteredHolidays] = useState<HolidayListDto[]>([]);
  const [currentYearHolidays, setCurrentYearHolidays] = useState<HolidayListDto[]>([]);
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: allHolidays = [],
    isLoading: holidaysLoading,
    error: holidaysError,
    refetch: refetchHolidays,
  } = useHolidays();

  const {
    data: fiscalYears = [],
    isLoading: fiscalYearsLoading,
    error: fiscalYearsError,
  } = useFiscalYears();

  // Set default selected year when fiscal years are loaded
  useMemo(() => {
    if (fiscalYears.length > 0 && !selectedYear) {
      const currentYear = fiscalYears.find(fy => fy.isActive === '0') || fiscalYears[0];
      setSelectedYear(currentYear.name);
    }
  }, [fiscalYears, selectedYear]);

  // Filter current year holidays
  useMemo(() => {
    if (selectedYear && allHolidays.length > 0) {
      const yearHolidays = allHolidays.filter(holiday =>
          holiday.fiscYear === selectedYear || holiday.fiscalYearName === selectedYear
      );
      setCurrentYearHolidays(yearHolidays);
      setFilteredHolidays(yearHolidays);
    }
  }, [selectedYear, allHolidays]);

  // Filter by search term
  useMemo(() => {
    if (searchTerm.trim() === '') {
      setFilteredHolidays(currentYearHolidays);
      setSearchMode(false);
    } else {
      const filtered = allHolidays.filter(holiday =>
          holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          holiday.fiscYear.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHolidays(filtered);
      setSearchMode(true);
    }
  }, [searchTerm, currentYearHolidays, allHolidays]);

  const handleYearChange = (yearName: string) => {
    setSelectedYear(yearName);
    setSearchTerm('');
    setSearchMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const getTotalHolidays = (yearName: string) => {
    return allHolidays.filter(holiday =>
        holiday.fiscYear === yearName || holiday.fiscalYearName === yearName
    ).length;
  };

  const availableYears = useMemo(() => {
    return fiscalYears.map(fy => fy.name).sort((a, b) => b.localeCompare(a));
  }, [fiscalYears]);

  const isLoading = holidaysLoading || fiscalYearsLoading;
  const displayError = holidaysError?.message || fiscalYearsError?.message || formError;

  const clearErrors = () => {
    setFormError(null);
    if (holidaysError || fiscalYearsError) refetchHolidays();
  };

  const handleRefresh = () => refetchHolidays();

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Holiday History
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View holiday records across fiscal years
            </p>
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
            <span className="text-sm text-red-700 dark:text-red-400">
              {displayError.includes("load") ? (
                  <>
                    Failed to load holidays.{' '}
                    <button
                        onClick={handleRefresh}
                        className="underline hover:text-red-800 font-medium"
                    >
                      Try again
                    </button>
                  </>
              ) : (
                  displayError
              )}
            </span>
                <button onClick={clearErrors} className="text-red-700 dark:text-red-400 hover:text-red-900 font-bold text-lg ml-4">×</button>
              </div>
            </div>
        )}

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400" />
            </div>
        )}

        {/* Content */}
        {!isLoading && fiscalYears.length > 0 && (
            <>
              <HolidaySearch searchTerm={searchTerm} onSearchChange={handleSearchChange} />

              {/* Current Year Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {searchMode ? 'Search Results' : `${selectedYear} Holidays`}
                  </h2>
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                    {filteredHolidays.length} holidays
                  </Badge>
                </div>
              </div>

              <HolidayList
                  holidays={filteredHolidays}
                  loading={isLoading}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  currentFiscalYear={searchMode ? 'all' : selectedYear}
              />

              {/* Previous Years Section */}
              {!searchMode && availableYears.filter(year => year !== selectedYear).length > 0 && (
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                      Previous Years
                    </h3>
                    <div className="grid gap-3">
                      {availableYears
                          .filter(year => year !== selectedYear)
                          .map((year, index) => (
                              <div
                                  key={year}
                                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                      {year} Holidays
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {getTotalHolidays(year)} holidays
                                    </p>
                                  </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleYearChange(year)}
                                    className="h-8 px-3 text-sm"
                                >
                                  View
                                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                                </Button>
                              </div>
                          ))}
                    </div>
                  </div>
              )}
            </>
        )}

        {/* Empty State */}
        {!isLoading && fiscalYears.length === 0 && !displayError && (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No fiscal years found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please create a fiscal year first
              </p>
            </div>
        )}
      </div>
  );
};