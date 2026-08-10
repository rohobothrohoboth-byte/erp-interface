// pages/CoreDashboard.tsx
import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  RefreshCw, Building, Users, Calendar,
  MapPin, ChevronRight, TrendingUp, Shield, Activity, Sun, Moon,
  Building2, Clock, Gift, ChevronLeft, ChevronRight as ChevronRightIcon, Plus
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useCompanies } from '@/modules/core/services/company/company.queries';
import { useBranches } from '@/modules/core/services/branch/branch.queries';
import { useDepartments } from '@/modules/core/services/department/dept.queries';
import { useFiscalYears } from '@/modules/core/services/fiscalyear/fisc.queries';
import { usePeriods } from '@/modules/core/services/period/period.queries';
import { useHolidays } from '@/modules/core/services/holiday/holiday.queries';
//import { coreKeys } from '@/modules/core/services/core.keys';
import { useThemeStore } from '@/shared/stores/theme.store';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/shared/i18n/LanguageContext';

// Optimized animation variants
const useOptimizedVariants = () => {
  const prefersReducedMotion = useReducedMotion();
  return useMemo(() => ({
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: prefersReducedMotion ? 0 : 0.05 }
      }
    },
    item: {
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
    }
  }), [prefersReducedMotion]);
};

// Pagination Component
const Pagination = memo(({ currentPage, totalPages, onPageChange }: any) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
      <div className="flex items-center justify-center gap-1 mt-4">
        <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map(page => (
            <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === page
                        ? 'bg-slate-800 dark:bg-slate-700 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {page}
            </button>
        ))}

        <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
  );
});

Pagination.displayName = 'Pagination';

// Stat Card Component
const StatCard = memo(({ stat, value, description, icon, color, trend, onClick, loading }: any) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    green: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    slate: { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' }
  };

  const colors = colorMap[color as keyof typeof colorMap] || colorMap.slate;

  if (loading) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
    );
  }

  return (
      <div
          onClick={onClick}
          className={`bg-white dark:bg-slate-900 rounded-lg border ${colors.border} p-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
          </div>
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} shrink-0 ml-3`}>
            {icon}
          </div>
        </div>
        {trend && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400">{trend}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">active</span>
              </div>
            </div>
        )}
      </div>
  );
});

StatCard.displayName = 'StatCard';

// Company Item Component
const CompanyItem = memo(({ company, onClick }: { company: any; onClick: (id: string) => void }) => (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 shrink-0">
            <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{company.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{company.nameAm}</p>
          </div>
          <Badge variant="outline" className="shrink-0">
            {company.branchCount || 0} branches
          </Badge>
        </div>
        <div className="mt-3 flex items-center justify-end">
          <Button
              variant="ghost"
              size="sm"
              onClick={() => onClick(company.id)}
              className="h-8 text-xs text-green-600 dark:text-green-400"
          >
            View Branches <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
));

CompanyItem.displayName = 'CompanyItem';

// Department Item Component
const DepartmentItem = memo(({ dept }: { dept: any }) => (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{dept.name}</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-8">
            Branch: <span className="font-medium text-slate-700 dark:text-slate-300">{dept.branch || 'N/A'}</span>
          </p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{dept.employeeCount || 0}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">employees</p>
        </div>
      </div>
    </div>
));

DepartmentItem.displayName = 'DepartmentItem';

// Holiday Item Component
const HolidayItem = memo(({ holiday }: { holiday: any }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 shrink-0">
            <Gift className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {holiday.name}
              </h4>
              <Badge variant="outline" className="text-xs">
                {formatDate(holiday.date)}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {holiday.isPublic ? 'Public Holiday' : 'Private Holiday'}
            </p>
          </div>
        </div>
      </div>
  );
});

HolidayItem.displayName = 'HolidayItem';

// Period Item Component
const PeriodItem = memo(({ period }: { period: any }) => (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 shrink-0">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
              {period.name}
            </h4>
            <Badge variant={period.isActive === '0' ? 'default' : 'outline'} className="text-xs">
              {period.isActive === '0' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {period.dateStartStr} - {period.dateEndStr}
          </p>
        </div>
      </div>
    </div>
));

PeriodItem.displayName = 'PeriodItem';

const CoreDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const variants = useOptimizedVariants();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch all data (no pagination needed for stats)
  const {
    data: companies = [],
    isLoading: companiesLoading,
    refetch: refetchCompanies
  } = useCompanies();

  const {
    data: branches = [],
    isLoading: branchesLoading,
    refetch: refetchBranches
  } = useBranches();

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    refetch: refetchDepartments
  } = useDepartments();

  const {
    data: fiscalYears = [],
    isLoading: fiscalYearsLoading,
    refetch: refetchFiscalYears
  } = useFiscalYears();

  const {
    data: holidays = [],
    isLoading: holidaysLoading,
    refetch: refetchHolidays
  } = useHolidays();

  const {
    data: periods = [],
    isLoading: periodsLoading,
    refetch: refetchPeriods
  } = usePeriods();

  // Get active fiscal year
  const activeFiscalYear = fiscalYears?.find((fy: any) => fy.isActive === '0');

  // Get upcoming holidays (next 3)
  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    return (holidays || [])
        .filter((h: any) => new Date(h.date) >= today)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
  }, [holidays]);

  // Get active periods (first 3)
  const activePeriods = useMemo(() => {
    return (periods || []).filter((p: any) => p.isActive === '0').slice(0, 3);
  }, [periods]);

  // Calculate stats with proper data
  const stats = useMemo(() => [
    {
      key: 'companies',
      stat: t.companies || 'ኩባንያዎች',
      value: companies?.length || 0,
      description: t.registeredCompanies || 'የተመዘገቡ ኩባንያዎች',
      icon: <Building2 className="h-4 w-4" />,
      color: 'blue',
      onClick: () => navigate('/core/company')
    },
    {
      key: 'branches',
      stat: t.branches || 'ቅርንጫፎች',
      value: branches?.length || 0,
      description: t.operationalUnits || 'የስራ ክፍሎች',
      icon: <Building className="h-4 w-4" />,
      color: 'green',
      onClick: () => navigate('/branches')
    },
    {
      key: 'departments',
      stat: t.departments || 'ዲፓርትመንቶች',
      value: departments?.length || 0,
      description: t.functionalDivisions || 'የተግባር ክፍሎች',
      icon: <Users className="h-4 w-4" />,
      color: 'purple',
      onClick: () => navigate('/core/department')
    },
    {
      key: 'fiscalYear',
      stat: t.fiscalYear || 'የበጀት ዓመት',
      value: activeFiscalYear?.name || 'N/A',
      description: activeFiscalYear ? `${activeFiscalYear.dateStartStr} - ${activeFiscalYear.dateEndStr}` : t.noActiveFiscalYear || 'ምንም ንቁ የበጀት ዓመት የለም',
      icon: <Calendar className="h-4 w-4" />,
      color: 'amber',
      trend: activeFiscalYear ? t.active || 'ንቁ' : t.inactive || 'ንቁ ያልሆነ',
      onClick: () => navigate('/core/fiscal-year')
    },
    {
      key: 'holidays',
      stat: t.holidays || 'በዓላት',
      value: holidays?.length || 0,
      description: t.totalHolidays || 'ጠቅላላ በዓላት',
      icon: <Gift className="h-4 w-4" />,
      color: 'rose',
      trend: `${upcomingHolidays.length} ${t.upcoming || 'የሚመጡ'}`,
      onClick: () => navigate('/core/fiscal-year/holiday-history')
    }
  ], [companies, branches, departments, activeFiscalYear, holidays, upcomingHolidays, navigate, t]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: coreKeys.companies() }),
      queryClient.invalidateQueries({ queryKey: coreKeys.branches() }),
      queryClient.invalidateQueries({ queryKey: coreKeys.departments() }),
      queryClient.invalidateQueries({ queryKey: coreKeys.fiscalYears() }),
      queryClient.invalidateQueries({ queryKey: coreKeys.holidays() }),
      queryClient.invalidateQueries({ queryKey: coreKeys.periods() })
    ]);
    await Promise.all([
      refetchCompanies(),
      refetchBranches(),
      refetchDepartments(),
      refetchFiscalYears(),
      refetchHolidays(),
      refetchPeriods()
    ]);
    setIsRefreshing(false);
  }, [queryClient, refetchCompanies, refetchBranches, refetchDepartments, refetchFiscalYears, refetchHolidays, refetchPeriods]);

  const isLoading = companiesLoading || branchesLoading || departmentsLoading || fiscalYearsLoading || holidaysLoading || periodsLoading;

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none opacity-30" />

        <div className="relative container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-5 bg-slate-600 dark:bg-slate-400 rounded-full" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t.coreModule || 'Core Module'}</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">
                {t.organizationManagement || 'Organization Management'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t.coreDashboardDescription || 'Central hub for managing organizational structure'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <Activity size={12} className="text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </span>
              </div>

              <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="gap-2"
              >
                <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{t.refresh || 'Refresh'}</span>
              </Button>

              <Button
                  onClick={() => navigate('/core/company/add')}
                  className="gap-2 bg-slate-800 hover:bg-slate-700 text-white"
              >
                <Plus size={14} />
                <span>{t.addCompany || 'Add Company'}</span>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div
              variants={variants.container}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
          >
            {stats.map((stat) => {
              const { key, ...statProps } = stat;
              return (
                  <motion.div key={key} variants={variants.item}>
                    <StatCard {...statProps} loading={isLoading} />
                  </motion.div>
              );
            })}
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Companies Overview */}
            <div className="lg:col-span-2">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {t.companies || 'ኩባንያዎች'}
                  </CardTitle>
                  <CardDescription>{t.manageCompanyProfiles || 'የኩባንያ መገለጫዎችን እና የቅርንጫፍ ቦታዎችን ያስተዳድሩ'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                  ) : companies?.length > 0 ? (
                      <div className="space-y-3">
                        {companies.map((company: any) => (
                            <CompanyItem
                                key={company.id}
                                company={company}
                                onClick={(id: string) => navigate(`/core/company/${id}/branches`)}
                            />
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        {t.noCompaniesFound || 'ምንም ኩባንያዎች አልተገኙም'}
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Departments */}
            <div>
              <Card className="h-full border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {t.departments || 'ዲፓርትመንቶች'}
                  </CardTitle>
                  <CardDescription>{t.functionalDivisions || 'የተግባር ክፍሎች'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                  ) : departments?.length > 0 ? (
                      <div className="space-y-3">
                        {departments.slice(0, 5).map((dept: any) => (
                            <DepartmentItem key={dept.id} dept={dept} />
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        {t.noDepartmentsFound || 'ምንም ዲፓርትመንቶች አልተገኙም'}
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Info Sidebar */}
            <div className="space-y-6">
              {/* Active Fiscal Year */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {t.fiscalYear || 'የበጀት ዓመት'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeFiscalYear ? (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{activeFiscalYear.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {activeFiscalYear.dateStartStr} - {activeFiscalYear.dateEndStr}
                        </p>
                      </div>
                  ) : (
                      <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                        {t.noActiveFiscalYear || 'ምንም ንቁ የበጀት ዓመት የለም'}
                      </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Holidays */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {t.upcomingHolidays || 'የሚመጡ በዓላት'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                  ) : upcomingHolidays.length > 0 ? (
                      upcomingHolidays.map((holiday: any) => (
                          <HolidayItem key={holiday.id} holiday={holiday} />
                      ))
                  ) : (
                      <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                        {t.noUpcomingHolidays || 'የሚመጡ በዓላት የሉም'}
                      </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Periods */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {t.activePeriods || 'ንቁ የጊዜ ክፍሎች'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                  ) : activePeriods.length > 0 ? (
                      activePeriods.map((period: any) => (
                          <PeriodItem key={period.id} period={period} />
                      ))
                  ) : (
                      <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                        {t.noActivePeriods || 'ምንም ንቁ የጊዜ ክፍሎች የሉም'}
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Status Bar */}
          <div className="text-center pt-6 mt-2">
            <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.live || 'ቀጥታ'}</span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:border-slate-700" />
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.secure || 'ደህንነቱ የተጠበቀ'}</span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:border-slate-700" />
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.autoSync || 'ራስ-ሰር ማመሳሰል'}</span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:border-slate-700" />
              <div className="flex items-center gap-1.5">
                <RefreshCw size={12} className="text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.cached || 'በመሸጎጫ ላይ'}</span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 32px 32px;
        }
        .dark .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
        }
      `}</style>
      </div>
  );
};

export default memo(CoreDashboard);