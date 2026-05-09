import { memo, useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileSkeleton } from '../components/profile/ProfileLoadState';
import { profileKeys } from '../services/profile/profile.queries';
import { profileApi } from '../services/profile/profile.api';

const STALE = 5 * 60 * 1000;

// Lazy-load each tab so only the active one's bundle is parsed on first render
const OverviewTab    = lazy(() => import('../components/profile/OverviewTab').then(m => ({ default: m.OverviewTab })));
const BasicInfoTab   = lazy(() => import('../components/profile/BasicInfoTab').then(m => ({ default: m.BasicInfoTab })));
const BiographicalTab = lazy(() => import('../components/profile/BiographicalTab').then(m => ({ default: m.BiographicalTab })));
const EmergencyTab   = lazy(() => import('../components/profile/EmergencyTab').then(m => ({ default: m.EmergencyTab })));
const FamilyTab      = lazy(() => import('../components/profile/FamilyTab').then(m => ({ default: m.FamilyTab })));
const GuarantorTab   = lazy(() => import('../components/profile/GuarantorTab').then(m => ({ default: m.GuarantorTab })));

const TAB_MAP: Record<string, React.ComponentType> = {
  overview:  OverviewTab,
  basic:     BasicInfoTab,
  bio:       BiographicalTab,
  emergency: EmergencyTab,
  family:    FamilyTab,
  guarantor: GuarantorTab,
};

// Fallback shown while a lazy tab chunk loads (first visit only)
const TabFallback = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    {Array.from({ length: 4 }).map((_, i) => <ProfileSkeleton key={i} rows={3} />)}
  </div>
);

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Prefetch all profile data in parallel on mount — tabs get instant data
  useEffect(() => {
    const opts = (fn: () => Promise<unknown>, key: readonly unknown[]) =>
      ({ queryKey: key, queryFn: fn, staleTime: STALE });

    queryClient.prefetchQuery(opts(profileApi.getInfo,        profileKeys.info()));
    queryClient.prefetchQuery(opts(profileApi.getPhoto,       profileKeys.photo()));
    queryClient.prefetchQuery(opts(profileApi.getCard,        profileKeys.card()));
    queryClient.prefetchQuery(opts(profileApi.getBasic,       profileKeys.basic()));
    queryClient.prefetchQuery(opts(profileApi.getBio,         profileKeys.bio()));
    queryClient.prefetchQuery(opts(profileApi.getEmContact,   profileKeys.emContact()));
    queryClient.prefetchQuery(opts(profileApi.getFamily,      profileKeys.family()));
    queryClient.prefetchQuery(opts(profileApi.getLeaveBalance, profileKeys.leaveBalance()));
  }, [queryClient]);

  // Stable callback — ProfileHeader won't re-render when tab content changes
  const handleTabChange = useCallback((id: string) => setActiveTab(id), []);

  const ActiveTab = TAB_MAP[activeTab] ?? OverviewTab;

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-4 overflow-y-auto h-full pb-8">
      <ProfileHeader activeTab={activeTab} onTabChange={handleTabChange} />
      <Suspense fallback={<TabFallback />}>
        <ActiveTab />
      </Suspense>
    </div>
  );
}

export default memo(ProfilePage);
