// src/routes/file.routes.tsx

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    LayoutDashboard,
    Folder,
    FolderOpen,
    File,
    FileText,
    Archive,
    Settings,
    Building2,
    Star,
    Users,
    User,
    Clock,
    type LucideIcon
} from 'lucide-react';
import { PageLoader } from '@/shared/components/ui/page-loader';
import type { AppRoute, SidebarNavSection } from './types';

const withSuspense = (
    Component: LazyExoticComponent<ComponentType<any>>
): ReactNode => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

// File Pages - Updated with all the new pages
const FileDashboard = lazy(() => import('@/modules/file/pages/ModuleDashboard'));
const CompanyDocumentsPage = lazy(() => import('@/modules/file/pages/CompanyDocumentsPage'));
const CompanyFoldersPage = lazy(() => import('@/modules/file/pages/CompanyFoldersPage'));
const SharedDocumentsPage = lazy(() => import('@/modules/file/pages/SharedDocumentsPage'));
const PersonalDocumentsPage = lazy(() => import('@/modules/file/pages/PersonalDocumentsPage'));
const MyFoldersPage = lazy(() => import('@/modules/file/pages/MyFoldersPage'));
const RecentFilesPage = lazy(() => import('@/modules/file/pages/RecentFilesPage'));
const ArchivePage = lazy(() => import('@/modules/file/pages/ArchivePage'));
const StarredFilesPage = lazy(() => import('@/modules/file/pages/StarredFilesPage'));
const FolderContentsPage = lazy(() => import('@/modules/file/pages/FolderContentsPage/index'));
const FileSettings = lazy(() => import('@/modules/file/pages/FileSettings'));
const FolderDocumentsPage = lazy(() => import('@/modules/file/pages/FolderDocumentsPage'));

// ✅ DocumentDetailPage - Keep as a regular import since it's already a component
// or use lazy if you want code splitting
const DocumentDetailPage = lazy(() => import('@/modules/file/pages/DocumentDetailPage'));

export const fileRoutes: AppRoute[] = [
    // Dashboard
    {
        path: 'file',
        href: '/file',
        title: 'File Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(FileDashboard),
        nav: true,
        index: true,
    },
    {
        path: 'file/documents/starred',
        href: '/file/documents/starred',
        title: 'Starred Files',
        icon: Star,
        element: withSuspense(StarredFilesPage),
        nav: true,
    },
    // ✅ Document Detail - Dynamic route
    {
        path: '/document/:id',
        element: withSuspense(DocumentDetailPage),
        nav: false, // Not shown in sidebar
        title: 'Document Details', // Add title for breadcrumb
    },
    {
        path: 'file/documents/company',
        href: '/file/documents/company',
        title: 'Company Documents',
        icon: Building2,
        element: withSuspense(CompanyDocumentsPage),
        nav: true,
    },
    // Company Folders
    {
        path: 'file/folders/company',
        href: '/file/folders/company',
        title: 'Company Folders',
        icon: Folder,
        element: withSuspense(CompanyFoldersPage),
        nav: true,
    },
    // ✅ Folder Contents - Dynamic route for viewing folder contents
    {
        path: 'folder/:id',
        href: '/folder/:id',
        title: 'Folder Contents',
        icon: FolderOpen,
        element: withSuspense(FolderContentsPage),
        nav: false, // Not shown in sidebar
    },
    // Shared Documents
    {
        path: 'file/documents/shared',
        href: '/file/documents/shared',
        title: 'Shared Documents',
        icon: Users,
        element: withSuspense(SharedDocumentsPage),
        nav: true,
    },
    // Personal Documents
    {
        path: 'file/documents/personal',
        href: '/file/documents/personal',
        title: 'Personal Documents',
        icon: User,
        element: withSuspense(PersonalDocumentsPage),
        nav: true,
    },
    // My Folders
    {
        path: 'file/folders/personal',
        href: '/file/folders/personal',
        title: 'My Folders',
        icon: FolderOpen,
        element: withSuspense(MyFoldersPage),
        nav: true,
    },
    // Recent Files
    {
        path: 'file/documents/recent',
        href: '/file/documents/recent',
        title: 'Recent Files',
        icon: Clock,
        element: withSuspense(RecentFilesPage),
        nav: true,
    },
    // Archive
    {
        path: 'file/documents/archive',
        href: '/file/documents/archive',
        title: 'Archive',
        icon: Archive,
        element: withSuspense(ArchivePage),
        nav: true,
    },
    // Settings
    {
        path: 'file/settings',
        href: '/file/settings',
        title: 'File Settings',
        icon: Settings,
        element: withSuspense(FileSettings),
        nav: false,
    },
    // Documents inside a folder
    {
        path: 'file/folders/:id/documents',
        href: '/file/folders/:id/documents',
        title: 'Folder Documents',
        icon: File,
        element: withSuspense(FolderDocumentsPage),
        nav: false,
    },
];

export const fileSidebarRoutes: SidebarNavSection[] = [
    {
        id: 'file-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'File Dashboard', href: '/file', activeMatch: 'exact' },
        ],
    },
    {
        id: 'file-company',
        title: 'Company',
        icon: Building2,
        items: [
            { title: 'Company Documents', href: '/file/documents/company', activeMatch: 'prefix' },
            { title: 'Company Folders', href: '/file/folders/company', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'file-personal',
        title: 'Personal',
        icon: User,
        items: [
            { title: 'Personal Documents', href: '/file/documents/personal', activeMatch: 'prefix' },
            { title: 'My Folders', href: '/file/folders/personal', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'file-social',
        title: 'Social',
        icon: Users,
        items: [
            { title: 'Shared Documents', href: '/file/documents/shared', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'file-other',
        title: 'Other',
        icon: FileText,
        items: [
            { title: 'Recent Files', href: '/file/documents/recent', activeMatch: 'prefix' },
            { title: 'Archive', href: '/file/documents/archive', activeMatch: 'prefix' },
            { title: 'Settings', href: '/file/settings', activeMatch: 'prefix' },
        ],
    },
];

const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/file/documents/company', 'Company Documents'],
    ['/file/folders/company', 'Company Folders'],
    ['/file/documents/shared', 'Shared Documents'],
    ['/file/documents/personal', 'Personal Documents'],
    ['/file/folders/personal', 'My Folders'],
    ['/file/documents/recent', 'Recent Files'],
    ['/file/documents/archive', 'Archive'],
    ['/file/settings', 'File Settings'],
    ['/folder/', 'Folder Contents'],
    ['/document/', 'Document Details'], // ✅ Add document detail route title
];

export const getFileRouteTitle = (path: string): string => {
    const exact = fileRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'File Management';
};