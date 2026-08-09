// src/routes/project.routes.tsx

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    LayoutDashboard,
    Projector,
    ListTodo,
    Users,
    Clock,
    Calendar,
    FileText,
    BarChart3,
    AlertTriangle,
    type LucideIcon
} from 'lucide-react';
import { PageLoader } from '../components/ui/page-loader';
import type { AppRoute, SidebarNavSection } from './types';

const withSuspense = (
    Component: LazyExoticComponent<ComponentType<any>>
): ReactNode => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

// Project Management Pages
const ProjectManagementDashboard = lazy(() => import('../pages/modules/ProjectManagement'));

export const projectRoutes: AppRoute[] = [
    // Dashboard
    {
        path: 'project-management',
        href: '/project-management',
        title: 'Project Management Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(ProjectManagementDashboard),
        nav: true,
        index: true,
    },
    // Projects
    {
        path: 'project-management/projects',
        href: '/project-management/projects',
        title: 'Projects',
        icon: Projector,
        element: withSuspense(() => import('../pages/projectmanagement/projects/ProjectList')),
        nav: true,
    },
    {
        path: 'project-management/projects/create',
        href: '/project-management/projects/create',
        title: 'Create Project',
        icon: Projector,
        element: withSuspense(() => import('../pages/projectmanagement/projects/CreateProject')),
        nav: false,
    },
    {
        path: 'project-management/templates',
        href: '/project-management/templates',
        title: 'Project Templates',
        icon: Projector,
        element: withSuspense(() => import('../pages/projectmanagement/projects/ProjectTemplates')),
        nav: false,
    },
    // Tasks
    {
        path: 'project-management/tasks',
        href: '/project-management/tasks',
        title: 'Tasks',
        icon: ListTodo,
        element: withSuspense(() => import('../pages/projectmanagement/tasks/TaskList')),
        nav: true,
    },
    {
        path: 'project-management/tasks/my',
        href: '/project-management/tasks/my',
        title: 'My Tasks',
        icon: ListTodo,
        element: withSuspense(() => import('../pages/projectmanagement/tasks/MyTasksPage')),
        nav: false,
    },
    {
        path: 'project-management/tasks/board',
        href: '/project-management/tasks/board',
        title: 'Task Board',
        icon: ListTodo,
        element: withSuspense(() => import('../pages/projectmanagement/tasks/TaskBoardPage')),
        nav: false,
    },
    {
        path: 'project-management/tasks/calendar',
        href: '/project-management/tasks/calendar',
        title: 'Task Calendar',
        icon: Calendar,
        element: withSuspense(() => import('../pages/projectmanagement/tasks/TaskCalendarPage')),
        nav: false,
    },
    // Team
    {
        path: 'project-management/team',
        href: '/project-management/team',
        title: 'Team Members',
        icon: Users,
        element: withSuspense(() => import('../pages/projectmanagement/team/TeamMembersPage')),
        nav: true,
    },
    {
        path: 'project-management/team/roles',
        href: '/project-management/team/roles',
        title: 'Roles & Responsibilities',
        icon: Users,
        element: withSuspense(() => import('../pages/projectmanagement/team/RolesPage')),
        nav: false,
    },
    {
        path: 'project-management/team/workload',
        href: '/project-management/team/workload',
        title: 'Workload',
        icon: Users,
        element: withSuspense(() => import('../pages/projectmanagement/team/WorkloadPage')),
        nav: false,
    },
    // Timeline & Milestones
    {
        path: 'project-management/timeline',
        href: '/project-management/timeline',
        title: 'Timeline',
        icon: Clock,
        element: withSuspense(() => import('../pages/projectmanagement/timeline/TimelinePage')),
        nav: false,
    },
    {
        path: 'project-management/milestones',
        href: '/project-management/milestones',
        title: 'Milestones',
        icon: Calendar,
        element: withSuspense(() => import('../pages/projectmanagement/milestones/MilestonesPage')),
        nav: false,
    },
    // Budget
    {
        path: 'project-management/budget',
        href: '/project-management/budget',
        title: 'Budget & Costs',
        icon: BarChart3,
        element: withSuspense(() => import('../pages/projectmanagement/budget/BudgetPage')),
        nav: false,
    },
    // Risks
    {
        path: 'project-management/risks',
        href: '/project-management/risks',
        title: 'Risk Register',
        icon: AlertTriangle,
        element: withSuspense(() => import('../pages/projectmanagement/risks/RiskRegisterPage')),
        nav: false,
    },
    // Reports
    {
        path: 'project-management/reports/progress',
        href: '/project-management/reports/progress',
        title: 'Progress Reports',
        icon: FileText,
        element: withSuspense(() => import('../pages/projectmanagement/reports/ProgressReportsPage')),
        nav: false,
    },
    {
        path: 'project-management/reports/time',
        href: '/project-management/reports/time',
        title: 'Time Reports',
        icon: FileText,
        element: withSuspense(() => import('../pages/projectmanagement/reports/TimeReportsPage')),
        nav: false,
    },
    {
        path: 'project-management/reports/financial',
        href: '/project-management/reports/financial',
        title: 'Financial Reports',
        icon: FileText,
        element: withSuspense(() => import('../pages/projectmanagement/reports/FinancialReportsPage')),
        nav: false,
    },
];

export const projectSidebarRoutes: SidebarNavSection[] = [
    {
        id: 'pm-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'Project Dashboard', href: '/project-management', activeMatch: 'exact' },
        ],
    },
    {
        id: 'pm-projects',
        title: 'Projects',
        icon: Projector,
        items: [
            { title: 'Projects', href: '/project-management/projects', activeMatch: 'prefix' },
            { title: 'Templates', href: '/project-management/templates', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'pm-tasks',
        title: 'Tasks',
        icon: ListTodo,
        items: [
            { title: 'Tasks', href: '/project-management/tasks', activeMatch: 'prefix' },
            { title: 'My Tasks', href: '/project-management/tasks/my', activeMatch: 'prefix' },
            { title: 'Task Board', href: '/project-management/tasks/board', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'pm-team',
        title: 'Team',
        icon: Users,
        items: [
            { title: 'Team Members', href: '/project-management/team', activeMatch: 'prefix' },
            { title: 'Roles', href: '/project-management/team/roles', activeMatch: 'prefix' },
            { title: 'Workload', href: '/project-management/team/workload', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'pm-timeline',
        title: 'Timeline',
        icon: Clock,
        items: [
            { title: 'Timeline', href: '/project-management/timeline', activeMatch: 'prefix' },
            { title: 'Milestones', href: '/project-management/milestones', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'pm-budget',
        title: 'Budget',
        icon: BarChart3,
        items: [
            { title: 'Budget', href: '/project-management/budget', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'pm-risks',
        title: 'Risks',
        icon: AlertTriangle,
        items: [
            { title: 'Risk Register', href: '/project-management/risks', activeMatch: 'prefix' },
        ],
    },
];

const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/project-management/projects', 'Projects'],
    ['/project-management/tasks', 'Tasks'],
    ['/project-management/team', 'Team'],
    ['/project-management/timeline', 'Timeline'],
    ['/project-management/milestones', 'Milestones'],
    ['/project-management/budget', 'Budget'],
    ['/project-management/risks', 'Risks'],
    ['/project-management/reports', 'Reports'],
];

export const getProjectRouteTitle = (path: string): string => {
    const exact = projectRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'Project Management';
};