import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import { DatabaseBackup, ShieldCheck } from 'lucide-react';
import { PageLoader } from '@/shared/components/ui/page-loader';
import type { AppRoute, SidebarNavSection } from './types';

const withSuspense = (Component: LazyExoticComponent<ComponentType<any>>): ReactNode => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const RolesPermissionsPage = lazy(() => import('@/modules/core/pages/RolesPermissionsPage'));
const BackupRestorePage = lazy(() => import('@/modules/core/pages/BackupRestorePage'));

export const coreAdminRoutes: AppRoute[] = [
  {
    path: 'core/roles',
    href: '/core/roles',
    title: 'Roles & Permissions',
    icon: ShieldCheck,
    element: withSuspense(RolesPermissionsPage),
    nav: true,
  },
  {
    path: 'core/backup',
    href: '/core/backup',
    title: 'Backup & Restore',
    icon: DatabaseBackup,
    element: withSuspense(BackupRestorePage),
    nav: true,
  },
];

export const coreAdminSidebarRoutes: SidebarNavSection[] = [
  {
    id: 'core-security-data',
    title: 'Security & Data',
    icon: ShieldCheck,
    items: [
      { title: 'Roles & Permissions', href: '/core/roles', activeMatch: 'prefix' },
      { title: 'Backup & Restore', href: '/core/backup', activeMatch: 'prefix' },
    ],
  },
];
