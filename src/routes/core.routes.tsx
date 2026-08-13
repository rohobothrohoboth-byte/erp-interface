// src/routes/core.routes.tsx

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    LayoutDashboard,
    Users,
    Building2,
    Calendar,
    Settings,
    Shield,
    Database,
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

// Core Pages
const CoreDashboard = lazy(() => import('@/modules/core/pages/ModuleDashboard'));
const FiscalYearOverview = lazy(() => import('@/modules/core/pages/pageFiscYear'));
const FiscalYearHistory = lazy(() => import('@/modules/core/pages/pageFiscYearHist'));
const PagePeriod = lazy(() => import('@/modules/core/pages/pagePeriod'));
const HolidayHistory = lazy(() => import('@/modules/core/pages/pageHolidayHist'));
const UserOverview = lazy(() => import('@/modules/core/pages/usermanagement/pageUserManagement'));
const PageAddUser = lazy(() => import('@/modules/core/pages/usermanagement/pageAddUser'));
const PageAddUserV2 = lazy(() => import('@/modules/core/pages/usermanagement/pageAddUserV2'));
const EditAccountPage = lazy(() => import('@/modules/core/pages/usermanagement/pageEditAccount'));
const PageAddAccount = lazy(() => import('@/modules/core/pages/usermanagement/pageAddAccount'));
const DepartmentOverview = lazy(() => import('@/modules/core/pages/pageDepartments'));
//const CompanyBranchesPage = lazy(() => import('@/modules/core/pages/pageCompanies'));
const BranchesPage = lazy(() => import('@/modules/core/pages/pageBranches'));


const CompaniesPage = lazy(() => import('@/modules/core/pages/pageCompanies'));
const CompanyBranchesPage = lazy(() => import('@/modules/core/pages/pageCompanyBranches')); // NEW component



const PageModuleSettings = lazy(() => import('@/modules/settings/pages/coreSettings/PageModuleSettings'));
const PageCoreSettings = lazy(() => import('@/modules/settings/pages/coreSettings/PageCoreSettings'));
const PageApiSettings = lazy(() => import('@/modules/settings/pages/coreSettings/PageApiSettings'));
const PageMenuSettings = lazy(() => import('@/modules/settings/pages/coreSettings/PageMenuSettings'));
const AuditTrailPage = lazy(() => import('@/modules/finance/pages/generalledgerpage/AuditTrailPage'));
const PageSettings = lazy(() => import('@/modules/settings/pages/pageSettings'));

// HR Settings
const PageHrSettings = lazy(() => import('@/modules/settings/pages/hrSettings/PageHrSettings'));
const JobGrade = lazy(() => import('@/modules/settings/pages/hrSettings/jobgrade/JobGrade'));
const JobGradeSubgrades = lazy(() => import('@/modules/settings/pages/hrSettings/jobgrade/JobGradeSubgrades'));
const PageBenefitSet = lazy(() => import('@/modules/settings/pages/hrSettings/pageBenefitSet'));
const PageEducationalQual = lazy(() => import('@/modules/settings/pages/hrSettings/pageEducationalQual'));
const PagePosition = lazy(() => import('@/modules/settings/pages/hrSettings/position/pagePosition'));
const PositionDetails = lazy(() => import('@/modules/settings/pages/hrSettings/position/PositionDetails'));
const PageAnnualLeave = lazy(() => import('@/modules/settings/pages/hrSettings/pageAnnualLeave'));
const LeavePolicyAccrualPage = lazy(() => import('@/modules/settings/pages/hrSettings/leavepolicyaccrual/LeavePolicyAccrualPage'));
const LeavePolicy = lazy(() => import('@/modules/settings/pages/hrSettings/Leave/leavePolicy'));
const LeavePolicyConfig = lazy(() => import('@/modules/settings/pages/hrSettings/Leave/leavePolicyConfig'));
const LeaveAppChainHistory = lazy(() => import('@/modules/settings/pages/hrSettings/Leave/LeaveAppChainHistory'));
const LeavePolicyConfigHistory = lazy(() => import('@/modules/settings/pages/hrSettings/Leave/leavePolicyConfigHistory'));
const PolicyAssignmentRule = lazy(() => import('@/modules/settings/pages/hrSettings/Leave/policyAssignmentRule'));
const PolicyAssignmentRuleHistory = lazy(() => import('@/modules/settings/pages/hrSettings/Leave/policyAssignmentRuleHistory'));
const LeaveAppChainManagement = lazy(() => import('@/modules/settings/pages/hrSettings/Leave/LeaveAppChainManagement'));
const PageHrRecruitmentSettings = lazy(() => import('@/modules/settings/pages/hrSettings/Recruitment/PageHrRecruitmentSettings'));
const PageEvaluationType = lazy(() => import('@/modules/settings/pages/hrSettings/Recruitment/PageEvaluationType'));
const PageEvaluationFlow = lazy(() => import('@/modules/settings/pages/hrSettings/Recruitment/PageEvaluationFlow'));
const PageEvaluationStep = lazy(() => import('@/modules/settings/pages/hrSettings/Recruitment/PageEvaluationStep'));
const PageOnboardingTask = lazy(() => import('@/modules/settings/pages/hrSettings/Recruitment/PageOnboardingTask'));

// Finance Settings
const PageFinanceSettings = lazy(() => import('@/modules/settings/pages/FinanceSettings/PageFinanceSettings'));
const PageAccounts = lazy(() => import('@/modules/settings/pages/FinanceSettings/Account/PageAccounts'));
const PageAccountDetail = lazy(() => import('@/modules/settings/pages/FinanceSettings/Account/PageAccountDetail'));
const PageAccountCategory = lazy(() => import('@/modules/settings/pages/FinanceSettings/Account/PageAccountCategory'));
const PageCostCenter = lazy(() => import('@/modules/settings/pages/FinanceSettings/CostCenter/PageCostCenter'));
const PageBudgetCode = lazy(() => import('@/modules/settings/pages/FinanceSettings/BudgetCode/PageBudgetCode'));
const PageBudgetCategory = lazy(() => import('@/modules/settings/pages/FinanceSettings/BudgetCategory/PageBudgetCategory'));
const PagePaymentApprovalChain = lazy(() => import('@/modules/settings/pages/FinanceSettings/PagePaymentApprovalChain'));

// CRM Settings
const PageCrmSettings = lazy(() => import('@/modules/settings/pages/crmSettings/PageCrmSettings'));
const PageLeadSources = lazy(() => import('@/modules/settings/pages/crmSettings/pageLeadSources'));
const PageLeadStatuses = lazy(() => import('@/modules/settings/pages/crmSettings/pageLeadStatuses'));
const PageIndustries = lazy(() => import('@/modules/settings/pages/crmSettings/pageIndustries'));
const PageRoutingRules = lazy(() => import('@/modules/settings/pages/crmSettings/pageRoutingRules'));
const PageLeadScoring = lazy(() => import('@/modules/settings/pages/crmSettings/pageLeadScoring'));
const PageQuotationTemplates = lazy(() => import('@/modules/settings/pages/crmSettings/pageQuotationTemplates'));
const PageEmailTemplates = lazy(() => import('@/modules/settings/pages/crmSettings/pageEmailTemplates'));
const PageSMSTemplates = lazy(() => import('@/modules/settings/pages/crmSettings/pageSMSTemplates'));
const PageTicketStatus = lazy(() => import('@/modules/settings/pages/crmSettings/pageTicketStatus'));

export const coreRoutes: AppRoute[] = [
    // Dashboard
    {
        path: 'core',
        href: '/core',
        title: 'Core Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(CoreDashboard),
        nav: true,
        index: true,
    },

    // Fiscal Year
    {
        path: 'core/fiscal-year',
        href: '/core/fiscal-year',
        title: 'Fiscal Year',
        icon: Calendar,
        element: withSuspense(FiscalYearOverview),
        nav: true,
    },
    {
        path: 'core/fiscal-year/history',
        href: '/core/fiscal-year/history',
        title: 'Fiscal Year History',
        icon: Calendar,
        element: withSuspense(FiscalYearHistory),
        nav: false,
    },
    {
        path: 'core/fiscal-year/period-history',
        href: '/core/fiscal-year/period-history',
        title: 'Period History',
        icon: Calendar,
        element: withSuspense(PagePeriod),
        nav: false,
    },
    {
        path: 'core/fiscal-year/holiday-history',
        href: '/core/fiscal-year/holiday-history',
        title: 'Holiday History',
        icon: Calendar,
        element: withSuspense(HolidayHistory),
        nav: false,
    },

    // User Management
    {
        path: 'core/users',
        href: '/core/users',
        title: 'User Management',
        icon: Users,
        element: withSuspense(UserOverview),
        nav: true,
    },
    {
        path: 'core/add-employee',
        href: '/core/add-employee',
        title: 'Add Employee',
        icon: Users,
        element: withSuspense(PageAddUser),
        nav: false,
    },
    {
        path: 'core/user-management/add-account/:empId',
        href: '/core/user-management/add-account/:empId',
        title: 'Add Account',
        icon: Users,
        element: withSuspense(PageAddAccount),
        nav: false,
    },
    {
        path: 'core/user-management/add-v2',
        href: '/core/user-management/add-v2',
        title: 'Add User V2',
        icon: Users,
        element: withSuspense(PageAddUserV2),
        nav: false,
    },
    {
        path: 'core/user-management/edit/:empId',
        href: '/core/user-management/edit/:empId',
        title: 'Edit Account',
        icon: Users,
        element: withSuspense(EditAccountPage),
        nav: false,
    },

    // Department
    {
        path: 'core/department',
        href: '/core/department',
        title: 'Departments',
        icon: Building2,
        element: withSuspense(DepartmentOverview),
        nav: true,
    },

    // Company & Branches
    {
        path: 'core/company',
        href: '/core/company',
        title: 'Companies',
        icon: Building2,
        element: withSuspense(CompaniesPage),
        nav: true,
    },

    {
        path: 'core/company/:companyId/branches',
        href: '/core/company/:companyId/branches',
        title: 'Company Branches',
        icon: Building2,
        element: withSuspense(CompanyBranchesPage),
        nav: false,
    },
    {
        path: 'core/branch',
        href: '/core/branch',
        title: 'Branches',
        icon: Building2,
        element: withSuspense(BranchesPage),
        nav: true,
    },
    // ═══════════════════════════════════════════════════════════════
    // SETTINGS ROUTES - ONLY ONE DEFINITION PER PATH
    // ═══════════════════════════════════════════════════════════════

    // Main Settings Page - This is the entry point for /settings
    {
        path: 'settings',
        href: '/settings',
        title: 'Settings',
        icon: Settings,
        element: withSuspense(PageSettings),
        nav: true,
        index: true,
    },

    // Core Settings
    {
        path: 'settings/core',
        href: '/settings/core',
        title: 'Core Settings',
        icon: Settings,
        element: withSuspense(PageCoreSettings),
        nav: false,
    },
    {
        path: 'settings/core/modules',
        href: '/settings/core/modules',
        title: 'Module Settings',
        icon: Settings,
        element: withSuspense(PageModuleSettings),
        nav: false,
    },
    {
        path: 'settings/core/api-permissions',
        href: '/settings/core/api-permissions',
        title: 'API Permissions',
        icon: Shield,
        element: withSuspense(PageApiSettings),
        nav: false,
    },
    {
        path: 'settings/core/menu-permissions',
        href: '/settings/core/menu-permissions',
        title: 'Menu Permissions',
        icon: Shield,
        element: withSuspense(PageMenuSettings),
        nav: false,
    },

    // HR Settings
    {
        path: 'settings/hr',
        href: '/settings/hr',
        title: 'HR Settings',
        icon: Settings,
        element: withSuspense(PageHrSettings),
        nav: false,
    },
    {
        path: 'settings/hr/jobgrade',
        href: '/settings/hr/jobgrade',
        title: 'Job Grades',
        icon: Settings,
        element: withSuspense(JobGrade),
        nav: false,
    },
    {
        path: 'settings/hr/jobgrade/:gradeId/steps',
        href: '/settings/hr/jobgrade/:gradeId/steps',
        title: 'Job Grade Steps',
        icon: Settings,
        element: withSuspense(JobGradeSubgrades),
        nav: false,
    },
    {
        path: 'settings/hr/benefitset',
        href: '/settings/hr/benefitset',
        title: 'Benefit Sets',
        icon: Settings,
        element: withSuspense(PageBenefitSet),
        nav: false,
    },
    {
        path: 'settings/hr/educationqual',
        href: '/settings/hr/educationqual',
        title: 'Educational Qualifications',
        icon: Settings,
        element: withSuspense(PageEducationalQual),
        nav: false,
    },
    {
        path: 'settings/hr/position',
        href: '/settings/hr/position',
        title: 'Positions',
        icon: Settings,
        element: withSuspense(PagePosition),
        nav: false,
    },
    {
        path: 'settings/hr/position/:id',
        href: '/settings/hr/position/:id',
        title: 'Position Details',
        icon: Settings,
        element: withSuspense(PositionDetails),
        nav: false,
    },
    {
        path: 'settings/hr/annualleave',
        href: '/settings/hr/annualleave',
        title: 'Annual Leave',
        icon: Settings,
        element: withSuspense(PageAnnualLeave),
        nav: false,
    },
    {
        path: 'settings/hr/annualleave/:id/policy',
        href: '/settings/hr/annualleave/:id/policy',
        title: 'Leave Policy Accrual',
        icon: Settings,
        element: withSuspense(LeavePolicyAccrualPage),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leavePolicy',
        href: '/settings/hr/leave/leavePolicy',
        title: 'Leave Policies',
        icon: Settings,
        element: withSuspense(LeavePolicy),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leavePolicyConfig/:leavePolicyId',
        href: '/settings/hr/leave/leavePolicyConfig/:leavePolicyId',
        title: 'Leave Policy Config',
        icon: Settings,
        element: withSuspense(LeavePolicyConfig),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leaveAppChainManagement/:policyId',
        href: '/settings/hr/leave/leaveAppChainManagement/:policyId',
        title: 'Leave Approval Chain',
        icon: Settings,
        element: withSuspense(LeaveAppChainManagement),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leaveAppChainHistory/:leavePolicyId',
        href: '/settings/hr/leave/leaveAppChainHistory/:leavePolicyId',
        title: 'Leave App Chain History',
        icon: Settings,
        element: withSuspense(LeaveAppChainHistory),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leavePolicyConfigHistory/:leavePolicyId',
        href: '/settings/hr/leave/leavePolicyConfigHistory/:leavePolicyId',
        title: 'Leave Policy Config History',
        icon: Settings,
        element: withSuspense(LeavePolicyConfigHistory),
        nav: false,
    },
    {
        path: 'settings/hr/leave/policyAssignmentRule/:leavePolicyId',
        href: '/settings/hr/leave/policyAssignmentRule/:leavePolicyId',
        title: 'Policy Assignment Rule',
        icon: Settings,
        element: withSuspense(PolicyAssignmentRule),
        nav: false,
    },
    {
        path: 'settings/hr/leave/policyAssignmentRuleHistory/:leavePolicyId',
        href: '/settings/hr/leave/policyAssignmentRuleHistory/:leavePolicyId',
        title: 'Policy Assignment Rule History',
        icon: Settings,
        element: withSuspense(PolicyAssignmentRuleHistory),
        nav: false,
    },
    {
        path: 'settings/hr/recruitment',
        href: '/settings/hr/recruitment',
        title: 'Recruitment Settings',
        icon: Settings,
        element: withSuspense(PageHrRecruitmentSettings),
        nav: false,
    },
    {
        path: 'settings/hr/evaluation-types',
        href: '/settings/hr/evaluation-types',
        title: 'Evaluation Types',
        icon: Settings,
        element: withSuspense(PageEvaluationType),
        nav: false,
    },
    {
        path: 'settings/hr/evaluation-flows',
        href: '/settings/hr/evaluation-flows',
        title: 'Evaluation Flows',
        icon: Settings,
        element: withSuspense(PageEvaluationFlow),
        nav: false,
    },
    {
        path: 'settings/hr/evaluation-flows/:flowId/steps',
        href: '/settings/hr/evaluation-flows/:flowId/steps',
        title: 'Evaluation Steps',
        icon: Settings,
        element: withSuspense(PageEvaluationStep),
        nav: false,
    },
    {
        path: 'settings/hr/onboarding-tasks',
        href: '/settings/hr/onboarding-tasks',
        title: 'Onboarding Tasks',
        icon: Settings,
        element: withSuspense(PageOnboardingTask),
        nav: false,
    },

    // Finance Settings
    {
        path: 'settings/finance',
        href: '/settings/finance',
        title: 'Finance Settings',
        icon: Settings,
        element: withSuspense(PageFinanceSettings),
        nav: false,
    },
    {
        path: 'settings/finance/accounts',
        href: '/settings/finance/accounts',
        title: 'Accounts Settings',
        icon: Settings,
        element: withSuspense(PageAccounts),
        nav: false,
    },
    {
        path: 'settings/finance/accounts/:accountId',
        href: '/settings/finance/accounts/:accountId',
        title: 'Account Detail',
        icon: Settings,
        element: withSuspense(PageAccountDetail),
        nav: false,
    },
    {
        path: 'settings/finance/account-category',
        href: '/settings/finance/account-category',
        title: 'Account Categories',
        icon: Settings,
        element: withSuspense(PageAccountCategory),
        nav: false,
    },
    {
        path: 'settings/finance/cost-center',
        href: '/settings/finance/cost-center',
        title: 'Cost Centers',
        icon: Settings,
        element: withSuspense(PageCostCenter),
        nav: false,
    },
    {
        path: 'settings/finance/budget-code',
        href: '/settings/finance/budget-code',
        title: 'Budget Codes',
        icon: Settings,
        element: withSuspense(PageBudgetCode),
        nav: false,
    },
    {
        path: 'settings/finance/budget-category',
        href: '/settings/finance/budget-category',
        title: 'Budget Categories',
        icon: Settings,
        element: withSuspense(PageBudgetCategory),
        nav: false,
    },
    {
        path: 'settings/finance/payment-approval-chain',
        href: '/settings/finance/payment-approval-chain',
        title: 'Payment Approval Chain',
        icon: Settings,
        element: withSuspense(PagePaymentApprovalChain),
        nav: false,
    },

    // CRM Settings
    {
        path: 'settings/crm',
        href: '/settings/crm',
        title: 'CRM Settings',
        icon: Settings,
        element: withSuspense(PageCrmSettings),
        nav: false,
    },
    {
        path: 'settings/crm/lead-sources',
        href: '/settings/crm/lead-sources',
        title: 'Lead Sources',
        icon: Settings,
        element: withSuspense(PageLeadSources),
        nav: false,
    },
    {
        path: 'settings/crm/lead-statuses',
        href: '/settings/crm/lead-statuses',
        title: 'Lead Statuses',
        icon: Settings,
        element: withSuspense(PageLeadStatuses),
        nav: false,
    },
    {
        path: 'settings/crm/industries',
        href: '/settings/crm/industries',
        title: 'Industries',
        icon: Settings,
        element: withSuspense(PageIndustries),
        nav: false,
    },
    {
        path: 'settings/crm/routing-rules',
        href: '/settings/crm/routing-rules',
        title: 'Routing Rules',
        icon: Settings,
        element: withSuspense(PageRoutingRules),
        nav: false,
    },
    {
        path: 'settings/crm/lead-scoring',
        href: '/settings/crm/lead-scoring',
        title: 'Lead Scoring',
        icon: Settings,
        element: withSuspense(PageLeadScoring),
        nav: false,
    },
    {
        path: 'settings/crm/quotation-templates',
        href: '/settings/crm/quotation-templates',
        title: 'Quotation Templates',
        icon: Settings,
        element: withSuspense(PageQuotationTemplates),
        nav: false,
    },
    {
        path: 'settings/crm/email-templates',
        href: '/settings/crm/email-templates',
        title: 'Email Templates',
        icon: Settings,
        element: withSuspense(PageEmailTemplates),
        nav: false,
    },
    {
        path: 'settings/crm/sms-templates',
        href: '/settings/crm/sms-templates',
        title: 'SMS Templates',
        icon: Settings,
        element: withSuspense(PageSMSTemplates),
        nav: false,
    },
    {
        path: 'settings/crm/ticket-status',
        href: '/settings/crm/ticket-status',
        title: 'Ticket Status',
        icon: Settings,
        element: withSuspense(PageTicketStatus),
        nav: false,
    },

    // Audit
    {
        path: 'core/audit',
        href: '/core/audit',
        title: 'Audit Trail',
        icon: Database,
        element: withSuspense(AuditTrailPage),
        nav: false,
    },
];

export const coreSidebarRoutes: SidebarNavSection[] = [
    {
        id: 'core-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'Core Dashboard', href: '/core', activeMatch: 'exact' },
        ],
    },
    {
        id: 'core-organization',
        title: 'Organization',
        icon: Building2,
        items: [
            { title: 'Companies', href: '/core/company', activeMatch: 'prefix' },
            { title: 'Departments', href: '/core/department', activeMatch: 'prefix' },
            { title: 'Branches', href: '/core/branch', activeMatch: 'prefix' },
            { title: 'Fiscal Year', href: '/core/fiscal-year', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'core-users',
        title: 'User Management',
        icon: Users,
        items: [
            { title: 'Users', href: '/core/users', activeMatch: 'prefix' },
            { title: 'Add Employee', href: '/core/add-employee', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'core-settings',
        title: 'Settings',
        icon: Settings,
        items: [
            { title: 'Settings', href: '/settings', activeMatch: 'prefix' },
            { title: 'Core Settings', href: '/settings/core', activeMatch: 'prefix' },
            { title: 'HR Settings', href: '/settings/hr', activeMatch: 'prefix' },
            { title: 'Finance Settings', href: '/settings/finance', activeMatch: 'prefix' },
            { title: 'CRM Settings', href: '/settings/crm', activeMatch: 'prefix' },
        ],
    },
];

const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/core/fiscal-year', 'Fiscal Year'],
    ['/core/users', 'User Management'],
    ['/core/department', 'Departments'],
    ['/core/company', 'Companies'],
    ['/core/branch', 'Branches'],
    ['/settings', 'Settings'],
    ['/settings/core', 'Core Settings'],
    ['/settings/hr', 'HR Settings'],
    ['/settings/finance', 'Finance Settings'],
    ['/settings/crm', 'CRM Settings'],
];

export const getCoreRouteTitle = (path: string): string => {
    const exact = coreRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'Core Management';
};

export default coreRoutes;