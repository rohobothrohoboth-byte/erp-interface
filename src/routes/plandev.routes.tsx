// src/routes/plandev.routes.tsx

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    LayoutDashboard,
    Target,
    BarChart3,
    Calendar,
    AlertTriangle,
    FileText,
    GitBranch,
    CheckCircle,
    Clock,
    Rocket,
    TrendingUp,
    Award,
    Shield,
    DollarSign,
    Gauge,
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

// Plan & Development Pages
const PlanDevDashboard = lazy(() => import('../pages/modules/PlanDev'));

// Strategic Plans
const StrategicPlansPage = lazy(() => import('../pages/plandev/strategic/StrategicPlansPage'));
const CreateStrategicPlan = lazy(() => import('../pages/plandev/strategic/CreateStrategicPlan'));
const EditStrategicPlan = lazy(() => import('../pages/plandev/strategic/EditStrategicPlan'));
const StrategicPlanDetail = lazy(() => import('../pages/plandev/strategic/StrategicPlanDetail'));

// Objectives
const ObjectivesPage = lazy(() => import('../pages/plandev/objectives/ObjectivesPage'));
const CreateObjective = lazy(() => import('../pages/plandev/objectives/CreateObjective'));
const EditObjective = lazy(() => import('../pages/plandev/objectives/EditObjective'));
const ObjectiveDetail = lazy(() => import('../pages/plandev/objectives/ObjectiveDetail'));

// KPIs
const KPIsPage = lazy(() => import('../pages/plandev/kpis/KPIsPage'));
const CreateKPI = lazy(() => import('../pages/plandev/kpis/CreateKPI'));
const EditKPI = lazy(() => import('../pages/plandev/kpis/EditKPI'));
const KPIDetail = lazy(() => import('../pages/plandev/kpis/KPIDetail'));

// Initiatives
const ActiveInitiativesPage = lazy(() => import('../pages/plandev/initiatives/ActiveInitiativesPage'));
const CompletedInitiativesPage = lazy(() => import('../pages/plandev/initiatives/CompletedInitiativesPage'));
const InitiativeBudgetPage = lazy(() => import('../pages/plandev/initiatives/InitiativeBudgetPage'));
const InitiativeDetail = lazy(() => import('../pages/plandev/initiatives/InitiativeDetail'));
const CreateInitiative = lazy(() => import('../pages/plandev/initiatives/CreateInitiative'));
const EditInitiative = lazy(() => import('../pages/plandev/initiatives/EditInitiative'));

// Planning
const PlanningCalendarPage = lazy(() => import('../pages/plandev/planning/PlanningCalendarPage'));
const MilestonesPage = lazy(() => import('../pages/plandev/planning/MilestonesPage'));
const CreateMilestone = lazy(() => import('../pages/plandev/planning/CreateMilestone'));
const EditMilestone = lazy(() => import('../pages/plandev/planning/EditMilestone'));
const MilestoneDetail = lazy(() => import('../pages/plandev/planning/MilestoneDetail'));

// Risks
const RiskManagementPage = lazy(() => import('../pages/plandev/risks/RiskManagementPage'));
const CreateRisk = lazy(() => import('../pages/plandev/risks/CreateRisk'));
const EditRisk = lazy(() => import('../pages/plandev/risks/EditRisk'));
const RiskDetail = lazy(() => import('../pages/plandev/risks/RiskDetail'));

// Reports
const ProgressReportsPage = lazy(() => import('../pages/plandev/reports/ProgressReportsPage'));
const PerformanceReportsPage = lazy(() => import('../pages/plandev/reports/PerformanceReportsPage'));
const ReportDetail = lazy(() => import('../pages/plandev/reports/ReportDetail'));
const GenerateReport = lazy(() => import('../pages/plandev/reports/GenerateReport'));

// Tasks
const TasksPage = lazy(() => import('../pages/plandev/tasks/TasksPage'));
const CreateTask = lazy(() => import('../pages/plandev/tasks/CreateTask'));
const EditTask = lazy(() => import('../pages/plandev/tasks/EditTask'));
const TaskDetail = lazy(() => import('../pages/plandev/tasks/TaskDetail'));

// Strategic Plan Budget
const StrategicPlanBudget = lazy(() => import('../pages/plandev/strategic/StrategicPlanBudget'));
const CreateBudgetItem = lazy(() => import('../pages/plandev/strategic/CreateBudgetItem'));
const EditBudgetItem = lazy(() => import('../pages/plandev/strategic/EditBudgetItem'));

export const plandevRoutes: AppRoute[] = [
    // ============================================================
    // DASHBOARD
    // ============================================================
    {
        path: 'plandev',
        href: '/plandev',
        title: 'Plan & Development Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(PlanDevDashboard),
        nav: true,
        index: true,
    },

    // ============================================================
    // STRATEGIC PLANS - SPECIFIC ROUTES FIRST
    // ============================================================
    {
        path: 'plandev/strategic-plans',
        href: '/plandev/strategic-plans',
        title: 'Strategic Plans',
        icon: Target,
        element: withSuspense(StrategicPlansPage),
        nav: true,
    },
    {
        path: 'plandev/strategic-plans/create',
        href: '/plandev/strategic-plans/create',
        title: 'Create Strategic Plan',
        icon: Target,
        element: withSuspense(CreateStrategicPlan),
        nav: false,
    },

    // ============================================================
    // STRATEGIC PLAN - OBJECTIVES (Nested)
    // ============================================================
    {
        path: 'plandev/strategic-plans/:id/objectives',
        href: '/plandev/strategic-plans/:id/objectives',
        title: 'Strategic Plan Objectives',
        icon: GitBranch,
        element: withSuspense(ObjectivesPage),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/objectives/create',
        href: '/plandev/strategic-plans/:id/objectives/create',
        title: 'Create Strategic Plan Objective',
        icon: GitBranch,
        element: withSuspense(CreateObjective),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/objectives/:objectiveId',
        href: '/plandev/strategic-plans/:id/objectives/:objectiveId',
        title: 'Strategic Plan Objective Details',
        icon: GitBranch,
        element: withSuspense(ObjectiveDetail),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/objectives/:objectiveId/edit',
        href: '/plandev/strategic-plans/:id/objectives/:objectiveId/edit',
        title: 'Edit Strategic Plan Objective',
        icon: GitBranch,
        element: withSuspense(EditObjective),
        nav: false,
    },

    // ============================================================
    // STRATEGIC PLAN - MILESTONES (Nested)
    // ============================================================
    {
        path: 'plandev/strategic-plans/:id/milestones',
        href: '/plandev/strategic-plans/:id/milestones',
        title: 'Strategic Plan Milestones',
        icon: Award,
        element: withSuspense(MilestonesPage),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/milestones/create',
        href: '/plandev/strategic-plans/:id/milestones/create',
        title: 'Create Strategic Plan Milestone',
        icon: Award,
        element: withSuspense(CreateMilestone),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/milestones/:milestoneId',
        href: '/plandev/strategic-plans/:id/milestones/:milestoneId',
        title: 'Strategic Plan Milestone Details',
        icon: Award,
        element: withSuspense(MilestoneDetail),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/milestones/:milestoneId/edit',
        href: '/plandev/strategic-plans/:id/milestones/:milestoneId/edit',
        title: 'Edit Strategic Plan Milestone',
        icon: Award,
        element: withSuspense(EditMilestone),
        nav: false,
    },

    // ============================================================
    // STRATEGIC PLAN - TASKS (Nested)
    // ============================================================
    {
        path: 'plandev/strategic-plans/:id/tasks',
        href: '/plandev/strategic-plans/:id/tasks',
        title: 'Strategic Plan Tasks',
        icon: CheckCircle,
        element: withSuspense(TasksPage),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/tasks/create',
        href: '/plandev/strategic-plans/:id/tasks/create',
        title: 'Create Strategic Plan Task',
        icon: CheckCircle,
        element: withSuspense(CreateTask),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/tasks/:taskId',
        href: '/plandev/strategic-plans/:id/tasks/:taskId',
        title: 'Strategic Plan Task Details',
        icon: CheckCircle,
        element: withSuspense(TaskDetail),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/tasks/:taskId/edit',
        href: '/plandev/strategic-plans/:id/tasks/:taskId/edit',
        title: 'Edit Strategic Plan Task',
        icon: CheckCircle,
        element: withSuspense(EditTask),
        nav: false,
    },

    // ============================================================
    // STRATEGIC PLAN - BUDGET (Nested)
    // ============================================================
    {
        path: 'plandev/strategic-plans/:id/budget',
        href: '/plandev/strategic-plans/:id/budget',
        title: 'Strategic Plan Budget',
        icon: DollarSign,
        element: withSuspense(StrategicPlanBudget),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/budget/create',
        href: '/plandev/strategic-plans/:id/budget/create',
        title: 'Create Strategic Plan Budget Item',
        icon: DollarSign,
        element: withSuspense(CreateBudgetItem),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/budget/:budgetId/edit',
        href: '/plandev/strategic-plans/:id/budget/:budgetId/edit',
        title: 'Edit Strategic Plan Budget Item',
        icon: DollarSign,
        element: withSuspense(EditBudgetItem),
        nav: false,
    },

    // ============================================================
    // STRATEGIC PLAN - KPIs (Nested)
    // ============================================================
    {
        path: 'plandev/strategic-plans/:id/kpis',
        href: '/plandev/strategic-plans/:id/kpis',
        title: 'Strategic Plan KPIs',
        icon: TrendingUp,
        element: withSuspense(KPIsPage),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/kpis/create',
        href: '/plandev/strategic-plans/:id/kpis/create',
        title: 'Create Strategic Plan KPI',
        icon: TrendingUp,
        element: withSuspense(CreateKPI),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/kpis/:kpiId',
        href: '/plandev/strategic-plans/:id/kpis/:kpiId',
        title: 'Strategic Plan KPI Details',
        icon: TrendingUp,
        element: withSuspense(KPIDetail),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/kpis/:kpiId/edit',
        href: '/plandev/strategic-plans/:id/kpis/:kpiId/edit',
        title: 'Edit Strategic Plan KPI',
        icon: TrendingUp,
        element: withSuspense(EditKPI),
        nav: false,
    },

    // ============================================================
    // STRATEGIC PLAN - GENERAL :id ROUTE - MUST COME LAST
    // ============================================================
    {
        path: 'plandev/strategic-plans/:id',
        href: '/plandev/strategic-plans/:id',
        title: 'Strategic Plan Details',
        icon: Target,
        element: withSuspense(StrategicPlanDetail),
        nav: false,
    },
    {
        path: 'plandev/strategic-plans/:id/edit',
        href: '/plandev/strategic-plans/:id/edit',
        title: 'Edit Strategic Plan',
        icon: Target,
        element: withSuspense(EditStrategicPlan),
        nav: false,
    },

    // ============================================================
    // OBJECTIVES (Top Level)
    // ============================================================
    {
        path: 'plandev/objectives',
        href: '/plandev/objectives',
        title: 'Objectives',
        icon: GitBranch,
        element: withSuspense(ObjectivesPage),
        nav: true,
    },
    {
        path: 'plandev/objectives/create',
        href: '/plandev/objectives/create',
        title: 'Create Objective',
        icon: GitBranch,
        element: withSuspense(CreateObjective),
        nav: false,
    },
    {
        path: 'plandev/objectives/:id',
        href: '/plandev/objectives/:id',
        title: 'Objective Details',
        icon: GitBranch,
        element: withSuspense(ObjectiveDetail),
        nav: false,
    },
    {
        path: 'plandev/objectives/:id/edit',
        href: '/plandev/objectives/:id/edit',
        title: 'Edit Objective',
        icon: GitBranch,
        element: withSuspense(EditObjective),
        nav: false,
    },

    // ============================================================
    // KPIs (Top Level)
    // ============================================================
    {
        path: 'plandev/kpis',
        href: '/plandev/kpis',
        title: 'KPIs',
        icon: TrendingUp,
        element: withSuspense(KPIsPage),
        nav: true,
    },
    {
        path: 'plandev/kpis/create',
        href: '/plandev/kpis/create',
        title: 'Create KPI',
        icon: TrendingUp,
        element: withSuspense(CreateKPI),
        nav: false,
    },
    {
        path: 'plandev/kpis/:id',
        href: '/plandev/kpis/:id',
        title: 'KPI Details',
        icon: TrendingUp,
        element: withSuspense(KPIDetail),
        nav: false,
    },
    {
        path: 'plandev/kpis/:id/edit',
        href: '/plandev/kpis/:id/edit',
        title: 'Edit KPI',
        icon: TrendingUp,
        element: withSuspense(EditKPI),
        nav: false,
    },

    // ============================================================
    // INITIATIVES - SPECIFIC ROUTES FIRST
    // ============================================================
    {
        path: 'plandev/initiatives/active',
        href: '/plandev/initiatives/active',
        title: 'Active Initiatives',
        icon: Rocket,
        element: withSuspense(ActiveInitiativesPage),
        nav: true,
    },
    {
        path: 'plandev/initiatives/completed',
        href: '/plandev/initiatives/completed',
        title: 'Completed Initiatives',
        icon: CheckCircle,
        element: withSuspense(CompletedInitiativesPage),
        nav: true,
    },
    {
        path: 'plandev/initiatives/create',
        href: '/plandev/initiatives/create',
        title: 'Create Initiative',
        icon: Rocket,
        element: withSuspense(CreateInitiative),
        nav: false,
    },

    // ============================================================
    // INITIATIVE - TASKS (Nested) - SPECIFIC ROUTES FIRST
    // ============================================================
    {
        path: 'plandev/initiatives/:id/tasks',
        href: '/plandev/initiatives/:id/tasks',
        title: 'Initiative Tasks',
        icon: CheckCircle,
        element: withSuspense(TasksPage),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/tasks/create',
        href: '/plandev/initiatives/:id/tasks/create',
        title: 'Create Initiative Task',
        icon: CheckCircle,
        element: withSuspense(CreateTask),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/tasks/:taskId',
        href: '/plandev/initiatives/:id/tasks/:taskId',
        title: 'Initiative Task Details',
        icon: CheckCircle,
        element: withSuspense(TaskDetail),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/tasks/:taskId/edit',
        href: '/plandev/initiatives/:id/tasks/:taskId/edit',
        title: 'Edit Initiative Task',
        icon: CheckCircle,
        element: withSuspense(EditTask),
        nav: false,
    },

    // ============================================================
    // INITIATIVE - OBJECTIVES (Nested)
    // ============================================================
    {
        path: 'plandev/initiatives/:id/objectives',
        href: '/plandev/initiatives/:id/objectives',
        title: 'Initiative Objectives',
        icon: GitBranch,
        element: withSuspense(ObjectivesPage),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/objectives/create',
        href: '/plandev/initiatives/:id/objectives/create',
        title: 'Create Initiative Objective',
        icon: GitBranch,
        element: withSuspense(CreateObjective),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/objectives/:objectiveId',
        href: '/plandev/initiatives/:id/objectives/:objectiveId',
        title: 'Initiative Objective Details',
        icon: GitBranch,
        element: withSuspense(ObjectiveDetail),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/objectives/:objectiveId/edit',
        href: '/plandev/initiatives/:id/objectives/:objectiveId/edit',
        title: 'Edit Initiative Objective',
        icon: GitBranch,
        element: withSuspense(EditObjective),
        nav: false,
    },

    // ============================================================
    // INITIATIVE - MILESTONES (Nested)
    // ============================================================
    {
        path: 'plandev/initiatives/:id/milestones',
        href: '/plandev/initiatives/:id/milestones',
        title: 'Initiative Milestones',
        icon: Award,
        element: withSuspense(MilestonesPage),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/milestones/create',
        href: '/plandev/initiatives/:id/milestones/create',
        title: 'Create Initiative Milestone',
        icon: Award,
        element: withSuspense(CreateMilestone),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/milestones/:milestoneId',
        href: '/plandev/initiatives/:id/milestones/:milestoneId',
        title: 'Initiative Milestone Details',
        icon: Award,
        element: withSuspense(MilestoneDetail),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/milestones/:milestoneId/edit',
        href: '/plandev/initiatives/:id/milestones/:milestoneId/edit',
        title: 'Edit Initiative Milestone',
        icon: Award,
        element: withSuspense(EditMilestone),
        nav: false,
    },

    // ============================================================
    // INITIATIVE - BUDGET (Nested)
    // ============================================================
    {
        path: 'plandev/initiatives/:id/budget',
        href: '/plandev/initiatives/:id/budget',
        title: 'Initiative Budget',
        icon: DollarSign,
        element: withSuspense(InitiativeBudgetPage),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/budget/create',
        href: '/plandev/initiatives/:id/budget/create',
        title: 'Create Initiative Budget Item',
        icon: DollarSign,
        element: withSuspense(CreateBudgetItem),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/budget/:budgetId/edit',
        href: '/plandev/initiatives/:id/budget/:budgetId/edit',
        title: 'Edit Initiative Budget Item',
        icon: DollarSign,
        element: withSuspense(EditBudgetItem),
        nav: false,
    },

    // ============================================================
    // INITIATIVE - KPIs (Nested)
    // ============================================================
    {
        path: 'plandev/initiatives/:id/kpis',
        href: '/plandev/initiatives/:id/kpis',
        title: 'Initiative KPIs',
        icon: TrendingUp,
        element: withSuspense(KPIsPage),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/kpis/create',
        href: '/plandev/initiatives/:id/kpis/create',
        title: 'Create Initiative KPI',
        icon: TrendingUp,
        element: withSuspense(CreateKPI),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/kpis/:kpiId',
        href: '/plandev/initiatives/:id/kpis/:kpiId',
        title: 'Initiative KPI Details',
        icon: TrendingUp,
        element: withSuspense(KPIDetail),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/kpis/:kpiId/edit',
        href: '/plandev/initiatives/:id/kpis/:kpiId/edit',
        title: 'Edit Initiative KPI',
        icon: TrendingUp,
        element: withSuspense(EditKPI),
        nav: false,
    },

    // ============================================================
    // INITIATIVE - RISKS (Nested)
    // ============================================================
    {
        path: 'plandev/initiatives/:id/risks',
        href: '/plandev/initiatives/:id/risks',
        title: 'Initiative Risks',
        icon: Shield,
        element: withSuspense(RiskManagementPage),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/risks/create',
        href: '/plandev/initiatives/:id/risks/create',
        title: 'Create Initiative Risk',
        icon: Shield,
        element: withSuspense(CreateRisk),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/risks/:riskId',
        href: '/plandev/initiatives/:id/risks/:riskId',
        title: 'Initiative Risk Details',
        icon: Shield,
        element: withSuspense(RiskDetail),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/risks/:riskId/edit',
        href: '/plandev/initiatives/:id/risks/:riskId/edit',
        title: 'Edit Initiative Risk',
        icon: Shield,
        element: withSuspense(EditRisk),
        nav: false,
    },

    // ============================================================
    // INITIATIVE - GENERAL :id ROUTE - MUST COME LAST
    // ============================================================
    {
        path: 'plandev/initiatives/:id',
        href: '/plandev/initiatives/:id',
        title: 'Initiative Details',
        icon: Rocket,
        element: withSuspense(InitiativeDetail),
        nav: false,
    },
    {
        path: 'plandev/initiatives/:id/edit',
        href: '/plandev/initiatives/:id/edit',
        title: 'Edit Initiative',
        icon: Rocket,
        element: withSuspense(EditInitiative),
        nav: false,
    },

    // ============================================================
    // PLANNING
    // ============================================================
    {
        path: 'plandev/calendar',
        href: '/plandev/calendar',
        title: 'Planning Calendar',
        icon: Calendar,
        element: withSuspense(PlanningCalendarPage),
        nav: true,
    },
    {
        path: 'plandev/milestones',
        href: '/plandev/milestones',
        title: 'Milestones',
        icon: Award,
        element: withSuspense(MilestonesPage),
        nav: true,
    },
    {
        path: 'plandev/milestones/create',
        href: '/plandev/milestones/create',
        title: 'Create Milestone',
        icon: Award,
        element: withSuspense(CreateMilestone),
        nav: false,
    },
    {
        path: 'plandev/milestones/:id',
        href: '/plandev/milestones/:id',
        title: 'Milestone Details',
        icon: Award,
        element: withSuspense(MilestoneDetail),
        nav: false,
    },
    {
        path: 'plandev/milestones/:id/edit',
        href: '/plandev/milestones/:id/edit',
        title: 'Edit Milestone',
        icon: Award,
        element: withSuspense(EditMilestone),
        nav: false,
    },

    // ============================================================
    // RISK MANAGEMENT
    // ============================================================
    {
        path: 'plandev/risks',
        href: '/plandev/risks',
        title: 'Risk Management',
        icon: AlertTriangle,
        element: withSuspense(RiskManagementPage),
        nav: true,
    },
    {
        path: 'plandev/risks/create',
        href: '/plandev/risks/create',
        title: 'Create Risk',
        icon: AlertTriangle,
        element: withSuspense(CreateRisk),
        nav: false,
    },
    {
        path: 'plandev/risks/:id',
        href: '/plandev/risks/:id',
        title: 'Risk Details',
        icon: AlertTriangle,
        element: withSuspense(RiskDetail),
        nav: false,
    },
    {
        path: 'plandev/risks/:id/edit',
        href: '/plandev/risks/:id/edit',
        title: 'Edit Risk',
        icon: AlertTriangle,
        element: withSuspense(EditRisk),
        nav: false,
    },

    // ============================================================
    // REPORTS
    // ============================================================
    {
        path: 'plandev/reports/progress',
        href: '/plandev/reports/progress',
        title: 'Progress Reports',
        icon: FileText,
        element: withSuspense(ProgressReportsPage),
        nav: true,
    },
    {
        path: 'plandev/reports/performance',
        href: '/plandev/reports/performance',
        title: 'Performance Reports',
        icon: FileText,
        element: withSuspense(PerformanceReportsPage),
        nav: true,
    },
    {
        path: 'plandev/reports/:id',
        href: '/plandev/reports/:id',
        title: 'Report Details',
        icon: FileText,
        element: withSuspense(ReportDetail),
        nav: false,
    },
    {
        path: 'plandev/reports/generate',
        href: '/plandev/reports/generate',
        title: 'Generate Report',
        icon: FileText,
        element: withSuspense(GenerateReport),
        nav: false,
    },
];

export const plandevSidebarRoutes: SidebarNavSection[] = [
    {
        id: 'plandev-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'Plan & Development', href: '/plandev', activeMatch: 'exact' },
        ],
    },
    {
        id: 'plandev-strategic',
        title: 'Strategic Planning',
        icon: Target,
        items: [
            { title: 'Strategic Plans', href: '/plandev/strategic-plans', activeMatch: 'prefix' },
            { title: 'Objectives', href: '/plandev/objectives', activeMatch: 'prefix' },
            { title: 'KPIs', href: '/plandev/kpis', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'plandev-initiatives',
        title: 'Initiatives',
        icon: Rocket,
        items: [
            { title: 'Active Initiatives', href: '/plandev/initiatives/active', activeMatch: 'prefix' },
            { title: 'Completed Initiatives', href: '/plandev/initiatives/completed', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'plandev-planning',
        title: 'Planning',
        icon: Calendar,
        items: [
            { title: 'Calendar', href: '/plandev/calendar', activeMatch: 'prefix' },
            { title: 'Milestones', href: '/plandev/milestones', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'plandev-risks',
        title: 'Risk Management',
        icon: AlertTriangle,
        items: [
            { title: 'Risk Management', href: '/plandev/risks', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'plandev-reports',
        title: 'Reports',
        icon: FileText,
        items: [
            { title: 'Progress Reports', href: '/plandev/reports/progress', activeMatch: 'prefix' },
            { title: 'Performance Reports', href: '/plandev/reports/performance', activeMatch: 'prefix' },
        ],
    },
];

const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/plandev/strategic-plans', 'Strategic Plans'],
    ['/plandev/objectives', 'Objectives'],
    ['/plandev/kpis', 'KPIs'],
    ['/plandev/initiatives', 'Initiatives'],
    ['/plandev/calendar', 'Calendar'],
    ['/plandev/milestones', 'Milestones'],
    ['/plandev/risks', 'Risks'],
    ['/plandev/reports', 'Reports'],
];

export const getPlandevRouteTitle = (path: string): string => {
    const exact = plandevRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'Plan & Development';
};