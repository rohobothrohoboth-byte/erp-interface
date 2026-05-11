import { memo, useState, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { EmpDetailHeader } from './EmpDetailHeader';
import { empDetailApi } from './empDetail.api';
import { empDetailKeys } from './empDetail.queries';
import { DetailSkeleton } from './LoadState';

const STALE = 5 * 60 * 1000;

const OverviewTab     = lazy(() => import('./OverviewTab').then(m => ({ default: m.OverviewTab })));
const BasicInfoTab    = lazy(() => import('./BasicInfoTab').then(m => ({ default: m.BasicInfoTab })));
const BiographicalTab = lazy(() => import('./BiographicalTab').then(m => ({ default: m.BiographicalTab })));
const EmergencyTab    = lazy(() => import('./EmergencyTab').then(m => ({ default: m.EmergencyTab })));
const FamilyTab       = lazy(() => import('./FamilyTab').then(m => ({ default: m.FamilyTab })));
const GuarantorTab    = lazy(() => import('./GuarantorTab').then(m => ({ default: m.GuarantorTab })));
const DocumentsTab    = lazy(() => import('./DocumentsTab').then(m => ({ default: m.DocumentsTab })));

type TabComponent = React.ComponentType<{ employeeId: string }>;

const TAB_MAP: Record<string, TabComponent> = {
  overview:  OverviewTab,
  basic:     BasicInfoTab,
  bio:       BiographicalTab,
  emergency: EmergencyTab,
  family:    FamilyTab,
  guarantor: GuarantorTab,
  documents: DocumentsTab,
};

const TabFallback = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    {Array.from({ length: 4 }).map((_, i) => <DetailSkeleton key={i} rows={3} />)}
  </div>
);

export const EmpDetailView = memo(function EmpDetailView() {
  const { id } = useParams<{ id: string }>();
  const employeeId = id ?? '';
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Prefetch all data on mount
  useState(() => {
    if (!employeeId) return;
    const opts = (fn: () => Promise<unknown>, key: readonly unknown[]) =>
      ({ queryKey: key, queryFn: fn, staleTime: STALE });

    queryClient.prefetchQuery(opts(() => empDetailApi.getInfo(employeeId),      empDetailKeys.info(employeeId)));
    queryClient.prefetchQuery(opts(() => empDetailApi.getPhoto(employeeId),     empDetailKeys.photo(employeeId)));
    queryClient.prefetchQuery(opts(() => empDetailApi.getOverview(employeeId),  empDetailKeys.overview(employeeId)));
    queryClient.prefetchQuery(opts(() => empDetailApi.getBasic(employeeId),     empDetailKeys.basic(employeeId)));
    queryClient.prefetchQuery(opts(() => empDetailApi.getBio(employeeId),       empDetailKeys.bio(employeeId)));
    queryClient.prefetchQuery(opts(() => empDetailApi.getContact(employeeId),   empDetailKeys.contact(employeeId)));
    queryClient.prefetchQuery(opts(() => empDetailApi.getFamily(employeeId),    empDetailKeys.family(employeeId)));
    queryClient.prefetchQuery(opts(() => empDetailApi.getLeave(employeeId),     empDetailKeys.leave(employeeId)));
  });

  const handleTabChange = useCallback((id: string) => setActiveTab(id), []);

  const ActiveTab = TAB_MAP[activeTab] ?? OverviewTab;

  if (!employeeId) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-500">Employee not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50  overflow-y-auto h-full pb-8">
      <EmpDetailHeader
        employeeId={employeeId}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <Suspense fallback={<TabFallback />}>
        <ActiveTab employeeId={employeeId} />
      </Suspense>
    </div>
  );
});

export default EmpDetailView;
