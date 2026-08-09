import React, { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    Users,
    Calendar,
    Clock,
    Briefcase,
    GraduationCap,
    UserPlus,
    UserCheck,
    UserX,
    FileText,
    BarChart3,
    ClipboardList,
    LayoutDashboard,
    type LucideIcon,
    BookOpen,
    Award,
} from 'lucide-react';
import { PageLoader } from '../components/ui/page-loader';
import type { AppRoute, SidebarNavSection } from './types';

// ✅ Error Boundary Component
class LazyErrorBoundary extends React.Component<
    { children: ReactNode; fallback?: ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        console.error('❌ HR Lazy loading error:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('❌ HR Lazy loading error details:', {
            error,
            componentStack: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="min-h-[400px] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full text-center border border-red-200 dark:border-red-800 shadow-xl">
                            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Failed to Load Module</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {this.state.error?.message || 'An error occurred while loading this component.'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

// ✅ Fixed withSuspense - includes error boundary
const withSuspense = (
    Component: LazyExoticComponent<ComponentType<any>>,
    fallback?: ReactNode
): ReactNode => (
    <LazyErrorBoundary fallback={fallback}>
        <Suspense fallback={<PageLoader />}>
            <Component />
        </Suspense>
    </LazyErrorBoundary>
);

// ✅ Safe lazy wrapper with error handling
const safeLazy = (importFn: () => Promise<any>) => {
    return lazy(() =>
        importFn().catch((error) => {
            console.error('❌ HR lazy import failed:', error);
            return {
                default: () => (
                    <div className="min-h-[400px] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full text-center border border-red-200 dark:border-red-800 shadow-xl">
                            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Component Load Error</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {error?.message || 'Failed to load component. Please try again.'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                ),
            };
        })
    );
};

// ==================== HR MODULE PAGES ====================
// All imports go up one level (../) from src/routes/ to src/
const Dashboard =safeLazy(() => import('../pages/modules/HR'));
const EmployeeManagementPage =safeLazy(() => import('../pages/hr/employeepage/EmployeeRecord'));
const EmployeeDetailsPage =safeLazy(() => import('../pages/hr/employeepage/EmployeeDetailsPage'));
const AddEmployeePage =safeLazy(() => import('../pages/hr/employeepage/AddEmployeePage'));
const EditEmployeePage =safeLazy(() => import('../pages/hr/employeepage/EditEmployeePage'));
const PendingEmployeePage =safeLazy(() => import('../pages/hr/employeepage/PendingEmployeePage'));
const PendingEmployeeDetail =safeLazy(() => import('../components/hr/employee/PendingEmployee/PendingEmployeeDetail'));
const Termination =safeLazy(() => import('../pages/hr/employeepage/Termination'));

// ✅ Add Pending Education/Experience Page
const PendingEmpEduExpPage =safeLazy(() => import('../pages/hr/employeepage/PendingEmpEduExpPage'));

// Leave Management
const LeaveList =safeLazy(() => import('../pages/hr/leavepage/MyLeavePage'));
const LeaveApprovalPage =safeLazy(() => import('../pages/hr/leavepage/LeaveApprovalPage'));
const LeaveRequestForm =safeLazy(() => import('../pages/hr/leavepage/LeaveRequestForm'));
const LeaveEntitlementPage =safeLazy(() => import('../pages/hr/leavepage/LeaveEntitlementPage'));
const YearEndProcessingPage =safeLazy(() => import('../pages/hr/leavepage/YearEndProcessingPage'));
const MyLeaveRequestsPage =safeLazy(() => import('../pages/hr/leavepage/MyLeaveRequestsPage'));
const LeaveAppChainManagement =safeLazy(() => import('../pages/settings/hrSettings/Leave/LeaveAppChainManagement'));
const AppChainHistorySection =safeLazy(() => import('../components/settings/hrSettings/leave/LeaveAppChain/appChainHistory/AppChainHistorySection'));

// Attendance
const AttendanceList =safeLazy(() => import('../pages/hr/attendancepage/AttendanceList'));
const AttendanceReport =safeLazy(() => import('../pages/hr/attendancepage/AttendanceReport'));
const ShiftScheduler =safeLazy(() => import('../pages/hr/attendancepage/ShiftScheduler'));
const TimeClock =safeLazy(() => import('../pages/hr/attendancepage/TimeClock'));
const TimeClockFormContainer =safeLazy(() => import('../pages/hr/attendancepage/TimeClockFormContainer'));

// Training
const Training =safeLazy(() => import('../pages/hr/trainingpage/Training'));

// ==================== RECRUITMENT MODULE PAGES ====================
const RecruitmentDashboard =safeLazy(() => import('../pages/hr/recruitmentpage/RecruitmentDashboard'));
const RecruitmentAnalytics =safeLazy(() => import('../pages/hr/recruitmentpage/RecruitmentAnalytics'));
const CandidatePipeline =safeLazy(() => import('../pages/hr/recruitmentpage/CandidatePipeline'));
const OnBoarding =safeLazy(() => import('../pages/hr/recruitmentpage/OnBoarding'));
const RecruitmentList =safeLazy(() => import('../pages/hr/recruitmentpage/RecruitmentList'));
const TestMenuTreePage =safeLazy(() => import('../pages/TestMenuTreePage'));

// Workforce Planning
const WorkforcePlansPage =safeLazy(() => import('../pages/hr/recruitmentpage/workforcePlan/WorkforcePlansPage'));
const WorkforcePlanCreate =safeLazy(() => import('../components/hr/recruitment/workforcePlan/WorkforcePlanCreate'));
const WorkforcePlanEdit =safeLazy(() => import('../components/hr/recruitment/workforcePlan/WorkforcePlanEdit'));
const WorkforcePlanDetail =safeLazy(() => import('../components/hr/recruitment/workforcePlan/WorkforcePlanDetail'));
const WorkforcePlanReviewSection =safeLazy(() => import('../components/hr/recruitment/workforcePlan/WorkforcePlanReviewSection'));

// Job Requisition
const JobRequisitionsPage =safeLazy(() => import('../pages/hr/recruitmentpage/jobRequisition/JobRequisitionsPage'));
const JobRequisitionCreate =safeLazy(() => import('../pages/hr/recruitmentpage/jobRequisition/JobRequisitionCreate'));
const JobRequisitionEdit =safeLazy(() => import('../pages/hr/recruitmentpage/jobRequisition/JobRequisitionEdit'));
const JobRequisitionDetail =safeLazy(() => import('../pages/hr/recruitmentpage/jobRequisition/JobRequisitionDetail'));

// Job Posting
const JobPostingsPage =safeLazy(() => import('../pages/hr/recruitmentpage/jobPosting/JobPostingsPage'));
const JobPostingCreate =safeLazy(() => import('../pages/hr/recruitmentpage/jobPosting/JobPostingCreate'));
const JobPostingEdit =safeLazy(() => import('../pages/hr/recruitmentpage/jobPosting/JobPostingEdit'));
const JobPostingDetail =safeLazy(() => import('../components/hr/recruitment/jobPosting/JobPostingDetail'));
const JobPostingDashboardPage =safeLazy(() => import('../pages/hr/recruitmentpage/JobPostingDashboardPage'));
const PostApplicantsPage =safeLazy(() => import('../pages/hr/recruitmentpage/PostApplicantsPage'));
const JpEvalFlowPage =safeLazy(() => import('../pages/hr/recruitmentpage/JpEvalFlowPage'));

// Applicant Management
const ApplicantsPage =safeLazy(() => import('../pages/hr/recruitmentpage/applicant/ApplicantsPage'));
const ApplicantDetail =safeLazy(() => import('../pages/hr/recruitmentpage/applicant/ApplicantDetail'));
const ApplicantEvaluation =safeLazy(() => import('../pages/hr/recruitmentpage/applicant/ApplicantEvaluation'));
const ApplicantEvaluationPageWrapper =safeLazy(() => import('../pages/hr/recruitmentpage/ApplicantEvaluationPageWrapper'));

// Interview Management
const InterviewsPage =safeLazy(() => import('../pages/hr/recruitmentpage/interview/InterviewsPage'));
const InterviewSchedule =safeLazy(() => import('../pages/hr/recruitmentpage/interview/InterviewSchedule'));
const InterviewDetail =safeLazy(() => import('../pages/hr/recruitmentpage/interview/InterviewDetail'));
const InterviewEdit =safeLazy(() => import('../pages/hr/recruitmentpage/interview/InterviewEdit'));

// Offer Management
const OffersPage =safeLazy(() => import('../pages/hr/recruitmentpage/offer/OffersPage'));
const OfferDetail =safeLazy(() => import('../pages/hr/recruitmentpage/offer/OfferDetail'));

// Onboarding
const OnboardingTasksPage =safeLazy(() => import('../pages/hr/recruitmentpage/onboarding/OnboardingTasksPage'));
const OnboardingTaskDetail =safeLazy(() => import('../pages/hr/recruitmentpage/onboarding/OnboardingTaskDetail'));
const OnboardingAssignmentPage =safeLazy(() => import('../pages/hr/recruitmentpage/onboarding/OnboardingAssignmentPage'));
const OnboardingAssignmentDetail =safeLazy(() => import('../pages/hr/recruitmentpage/onboarding/OnboardingAssignmentDetail'));

// Legacy Recruitment
const JobRequisitionPage =safeLazy(() => import('../pages/hr/recruitmentpage/JobRequisitionPage'));
const JobPostingPage =safeLazy(() => import('../pages/hr/recruitmentpage/JobPostingPage'));
const ApprovedJobRequisitionPage =safeLazy(() => import('../pages/hr/recruitmentpage/ApprovedJobRequisitionPage'));

// Settings Pages (HR)
const PageEvaluationFlow =safeLazy(() => import('../pages/settings/hrSettings/Recruitment/PageEvaluationFlow'));
const PageEvaluationType =safeLazy(() => import('../pages/settings/hrSettings/Recruitment/PageEvaluationType'));
const PageEvaluationStep =safeLazy(() => import('../pages/settings/hrSettings/Recruitment/PageEvaluationStep'));
const PageOnboardingTask =safeLazy(() => import('../pages/settings/hrSettings/Recruitment/PageOnboardingTask'));
const PageHrRecruitmentSettings =safeLazy(() => import('../pages/settings/hrSettings/Recruitment/PageHrRecruitmentSettings'));
const JobGrade =safeLazy(() => import('../pages/settings/hrSettings/jobgrade/JobGrade'));
const JobGradeSubgrades =safeLazy(() => import('../pages/settings/hrSettings/jobgrade/JobGradeSubgrades'));
const PageBenefitSet =safeLazy(() => import('../pages/settings/hrSettings/pageBenefitSet'));
const PageEducationalQual =safeLazy(() => import('../pages/settings/hrSettings/pageEducationalQual'));
const PagePosition =safeLazy(() => import('../pages/settings/hrSettings/position/pagePosition'));
const PositionDetails =safeLazy(() => import('../pages/settings/hrSettings/position/PositionDetails'));
const PageAnnualLeave =safeLazy(() => import('../pages/settings/hrSettings/pageAnnualLeave'));
const LeavePolicyAccrualPage =safeLazy(() => import('../pages/settings/hrSettings/leavepolicyaccrual/LeavePolicyAccrualPage'));
const LeavePolicy =safeLazy(() => import('../pages/settings/hrSettings/Leave/leavePolicy'));
const LeavePolicyConfig =safeLazy(() => import('../pages/settings/hrSettings/Leave/leavePolicyConfig'));
const LeaveAppChainHistory =safeLazy(() => import('../pages/settings/hrSettings/Leave/LeaveAppChainHistory'));
const LeavePolicyConfigHistory =safeLazy(() => import('../pages/settings/hrSettings/Leave/leavePolicyConfigHistory'));
const PolicyAssignmentRule =safeLazy(() => import('../pages/settings/hrSettings/Leave/policyAssignmentRule'));
const PolicyAssignmentRuleHistory =safeLazy(() => import('../pages/settings/hrSettings/Leave/policyAssignmentRuleHistory'));
const PageHrSettings =safeLazy(() => import('../pages/settings/hrSettings/PageHrSettings'));

// ==================== HR ROUTES ====================
export const hrRoutes: AppRoute[] = [
    // Dashboard
    {
        path: 'hr',
        href: '/hr',
        title: 'HR Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(Dashboard),
        nav: true,
        index: true,
    },

    // Employee Management
    {
        path: 'hr/employees/record',
        href: '/hr/employees/record',
        title: 'Employee Record',
        icon: Users,
        element: withSuspense(EmployeeManagementPage),
        nav: true,
    },
    {
        path: 'hr/employees/record/Add',
        href: '/hr/employees/record/Add',
        title: 'Add Employee',
        icon: UserPlus,
        element: withSuspense(AddEmployeePage),
        nav: false,
    },
    {
        path: 'hr/employees/edit/:employeeId',
        href: '/hr/employees/edit/:employeeId',
        title: 'Edit Employee',
        icon: UserCheck,
        element: withSuspense(EditEmployeePage),
        nav: false,
    },
    {
        path: 'test-menu-tree',
        href: '/test-menu-tree',
        title: 'Test Menu Tree',
        icon: UserCheck,
        element: withSuspense(TestMenuTreePage),
        nav: false,
    },
    {
        path: 'hr/employees/:id',
        href: '/hr/employees/:id',
        title: 'Employee Details',
        icon: Users,
        element: withSuspense(EmployeeDetailsPage),
        nav: false,
    },
    {
        path: 'hr/pend-employees',
        href: '/hr/pend-employees',
        title: 'Pending Employees',
        icon: UserPlus,
        element: withSuspense(PendingEmployeePage),
        nav: false,
    },
    {
        path: 'hr/pend-employees/:id',
        href: '/hr/pend-employees/:id',
        title: 'Pending Employee Detail',
        icon: UserCheck,
        element: withSuspense(PendingEmployeeDetail),
        nav: false,
    },
    {
        path: 'hr/employees/termination',
        href: '/hr/employees/termination',
        title: 'Terminations',
        icon: UserX,
        element: withSuspense(Termination),
        nav: false,
    },
    // ✅ Add Pending Education/Experience Route
    {
        path: 'hr/employees/pending-edu-exp',
        href: '/hr/employees/pending-edu-exp',
        title: 'Pending Education & Experience',
        icon: BookOpen,
        element: withSuspense(PendingEmpEduExpPage),
        nav: false,
    },

    // Leave Management
    {
        path: 'hr/leave/list',
        href: '/hr/leave/list',
        title: 'My Leave',
        icon: Calendar,
        element: withSuspense(LeaveList),
        nav: true,
    },
    {
        path: 'hr/leave/approval',
        href: '/hr/leave/approval',
        title: 'Leave Approvals',
        icon: Calendar,
        element: withSuspense(LeaveApprovalPage),
        nav: false,
    },
    {
        path: 'hr/leave/form',
        href: '/hr/leave/form',
        title: 'Request Leave',
        icon: Calendar,
        element: withSuspense(LeaveRequestForm),
        nav: false,
    },
    {
        path: 'hr/leave/balance',
        href: '/hr/leave/balance',
        title: 'Leave Balance',
        icon: Calendar,
        element: withSuspense(LeaveEntitlementPage),
        nav: false,
    },
    {
        path: 'hr/leave/entitlement',
        href: '/hr/leave/entitlement',
        title: 'Leave Entitlement',
        icon: Calendar,
        element: withSuspense(LeaveEntitlementPage),
        nav: false,
    },
    {
        path: 'hr/leave/my-requests',
        href: '/hr/leave/my-requests',
        title: 'My Leave Requests',
        icon: Calendar,
        element: withSuspense(MyLeaveRequestsPage),
        nav: false,
    },
    {
        path: 'hr/leave/approval-chain/:policyId',
        href: '/hr/leave/approval-chain/:policyId',
        title: 'Approval Chain',
        icon: Calendar,
        element: withSuspense(LeaveAppChainManagement),
        nav: false,
    },
    {
        path: 'hr/leave/approval-chain-history/:leavePolicyId',
        href: '/hr/leave/approval-chain-history/:leavePolicyId',
        title: 'Approval Chain History',
        icon: Calendar,
        element: withSuspense(AppChainHistorySection),
        nav: false,
    },
    {
        path: 'hr/leave/policies',
        href: '/hr/leave/policies',
        title: 'Leave Policies',
        icon: Calendar,
        element: withSuspense(YearEndProcessingPage),
        nav: false,
    },

    // Attendance
    {
        path: 'hr/attendance/list',
        href: '/hr/attendance/list',
        title: 'Attendance',
        icon: Clock,
        element: withSuspense(AttendanceList),
        nav: true,
    },
    {
        path: 'hr/attendance/report',
        href: '/hr/attendance/report',
        title: 'Attendance Report',
        icon: BarChart3,
        element: withSuspense(AttendanceReport),
        nav: false,
    },
    {
        path: 'hr/shift-scheduler',
        href: '/hr/shift-scheduler',
        title: 'Shift Scheduler',
        icon: Clock,
        element: withSuspense(ShiftScheduler),
        nav: false,
    },
    {
        path: 'hr/time-clock',
        href: '/hr/time-clock',
        title: 'Time Clock',
        icon: Clock,
        element: withSuspense(TimeClock),
        nav: false,
    },
    {
        path: 'hr/attendance/form',
        href: '/hr/attendance/form',
        title: 'Attendance Form',
        icon: Clock,
        element: withSuspense(TimeClockFormContainer),
        nav: false,
    },
    {
        path: 'hr/attendance/checkin',
        href: '/hr/attendance/checkin',
        title: 'Check In',
        icon: Clock,
        element: withSuspense(TimeClock),
        nav: false,
    },

    // Training
    {
        path: 'hr/training',
        href: '/hr/training',
        title: 'Training',
        icon: GraduationCap,
        element: withSuspense(Training),
        nav: true,
    },

    // Recruitment Dashboard & Analytics
    {
        path: 'hr/recruitment/dashboard',
        href: '/hr/recruitment/dashboard',
        title: 'Recruitment Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(RecruitmentDashboard),
        nav: true,
    },
    {
        path: 'hr/recruitment/analytics',
        href: '/hr/recruitment/analytics',
        title: 'Recruitment Analytics',
        icon: ClipboardList,
        element: withSuspense(RecruitmentAnalytics),
        nav: false,
    },

    // Workforce Planning
    {
        path: 'hr/recruitment/workforce-plans',
        href: '/hr/recruitment/workforce-plans',
        title: 'Workforce Plans',
        icon: Briefcase,
        element: withSuspense(WorkforcePlansPage),
        nav: true,
    },
    {
        path: 'hr/recruitment/workforce-plan/new',
        href: '/hr/recruitment/workforce-plan/new',
        title: 'Create Workforce Plan',
        icon: Briefcase,
        element: withSuspense(WorkforcePlanCreate),
        nav: false,
    },
    {
        path: 'hr/recruitment/workforce-plan/edit/:planId',
        href: '/hr/recruitment/workforce-plan/edit/:planId',
        title: 'Edit Workforce Plan',
        icon: Briefcase,
        element: withSuspense(WorkforcePlanEdit),
        nav: false,
    },
    {
        path: 'hr/recruitment/workforce-plan/:planId',
        href: '/hr/recruitment/workforce-plan/:planId',
        title: 'Workforce Plan Detail',
        icon: Briefcase,
        element: withSuspense(WorkforcePlanDetail),
        nav: false,
    },
    {
        path: 'hr/recruitment/workforce-plan/review/:planId',
        href: '/hr/recruitment/workforce-plan/review/:planId',
        title: 'Review Workforce Plan',
        icon: Briefcase,
        element: withSuspense(WorkforcePlanReviewSection),
        nav: false,
    },

    // Job Requisition
    {
        path: 'hr/recruitment/requisitions',
        href: '/hr/recruitment/requisitions',
        title: 'Job Requisitions',
        icon: FileText,
        element: withSuspense(JobRequisitionsPage),
        nav: true,
    },
    {
        path: 'hr/recruitment/requisition/new',
        href: '/hr/recruitment/requisition/new',
        title: 'Create Requisition',
        icon: FileText,
        element: withSuspense(JobRequisitionCreate),
        nav: false,
    },
    {
        path: 'hr/recruitment/requisition/edit/:reqId',
        href: '/hr/recruitment/requisition/edit/:reqId',
        title: 'Edit Requisition',
        icon: FileText,
        element: withSuspense(JobRequisitionEdit),
        nav: false,
    },
    {
        path: 'hr/recruitment/requisition/:reqId',
        href: '/hr/recruitment/requisition/:reqId',
        title: 'Requisition Detail',
        icon: FileText,
        element: withSuspense(JobRequisitionDetail),
        nav: false,
    },
    {
        path: 'hr/recruitment/requisition/:reqId/postings',
        href: '/hr/recruitment/requisition/:reqId/postings',
        title: 'Requisition Postings',
        icon: FileText,
        element: withSuspense(JobPostingsPage),
        nav: false,
    },

    // Job Posting
    {
        path: 'hr/recruitment/postings',
        href: '/hr/recruitment/postings',
        title: 'Job Postings',
        icon: FileText,
        element: withSuspense(JobPostingsPage),
        nav: true,
    },
    {
        path: 'hr/recruitment/posting/new',
        href: '/hr/recruitment/posting/new',
        title: 'Create Job Posting',
        icon: FileText,
        element: withSuspense(JobPostingCreate),
        nav: false,
    },
    {
        path: 'hr/recruitment/posting/edit/:postId',
        href: '/hr/recruitment/posting/edit/:postId',
        title: 'Edit Job Posting',
        icon: FileText,
        element: withSuspense(JobPostingEdit),
        nav: false,
    },
    {
        path: 'hr/recruitment/posting/:postId',
        href: '/hr/recruitment/posting/:postId',
        title: 'Job Posting Detail',
        icon: FileText,
        element: withSuspense(JobPostingDetail),
        nav: false,
    },
    {
        path: 'hr/recruitment/posting/:postId/dashboard',
        href: '/hr/recruitment/posting/:postId/dashboard',
        title: 'Posting Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(JobPostingDashboardPage),
        nav: false,
    },
    {
        path: 'hr/recruitment/posting/:postId/applicants',
        href: '/hr/recruitment/posting/:postId/applicants',
        title: 'Posting Applicants',
        icon: Users,
        element: withSuspense(PostApplicantsPage),
        nav: false,
    },
    {
        path: 'hr/recruitment/posting/:postId/eval-flow',
        href: '/hr/recruitment/posting/:postId/eval-flow',
        title: 'Evaluation Flow',
        icon: ClipboardList,
        element: withSuspense(JpEvalFlowPage),
        nav: false,
    },

    // Applicants
    {
        path: 'hr/recruitment/applicants',
        href: '/hr/recruitment/applicants',
        title: 'Applicants',
        icon: Users,
        element: withSuspense(ApplicantsPage),
        nav: true,
    },
    {
        path: 'hr/recruitment/applicant/:applicantId',
        href: '/hr/recruitment/applicant/:applicantId',
        title: 'Applicant Detail',
        icon: Users,
        element: withSuspense(ApplicantDetail),
        nav: false,
    },
    {
        path: 'hr/recruitment/applicant/:applicantId/evaluate',
        href: '/hr/recruitment/applicant/:applicantId/evaluate',
        title: 'Evaluate Applicant',
        icon: ClipboardList,
        element: withSuspense(ApplicantEvaluation),
        nav: false,
    },

    // Interviews
    {
        path: 'hr/recruitment/interviews',
        href: '/hr/recruitment/interviews',
        title: 'Interviews',
        icon: Calendar,
        element: withSuspense(InterviewsPage),
        nav: true,
    },
    {
        path: 'hr/recruitment/interview/schedule',
        href: '/hr/recruitment/interview/schedule',
        title: 'Schedule Interview',
        icon: Calendar,
        element: withSuspense(InterviewSchedule),
        nav: false,
    },
    {
        path: 'hr/recruitment/interviews/:id',
        href: '/hr/recruitment/interviews/:id',
        title: 'Interview Detail',
        icon: Calendar,
        element: withSuspense(InterviewDetail),
        nav: false,
    },
    {
        path: 'hr/recruitment/interviews/:id/edit',
        href: '/hr/recruitment/interviews/:id/edit',
        title: 'Edit Interview',
        icon: Calendar,
        element: withSuspense(InterviewEdit),
        nav: false,
    },

    // Offers
    {
        path: 'hr/recruitment/offers',
        href: '/hr/recruitment/offers',
        title: 'Offers',
        icon: FileText,
        element: withSuspense(OffersPage),
        nav: true,
    },
    {
        path: 'hr/recruitment/offer/:offerId',
        href: '/hr/recruitment/offer/:offerId',
        title: 'Offer Detail',
        icon: FileText,
        element: withSuspense(OfferDetail),
        nav: false,
    },

    // Onboarding
    {
        path: 'hr/recruitment/onboarding/tasks',
        href: '/hr/recruitment/onboarding/tasks',
        title: 'Onboarding Tasks',
        icon: ClipboardList,
        element: withSuspense(OnboardingTasksPage),
        nav: true,
    },
    {
        path: 'hr/recruitment/onboarding/assignments',
        href: '/hr/recruitment/onboarding/assignments',
        title: 'Onboarding Assignments',
        icon: UserCheck,
        element: withSuspense(OnboardingAssignmentPage),
        nav: false,
    },
    {
        path: 'hr/recruitment/onboarding/task/:taskId',
        href: '/hr/recruitment/onboarding/task/:taskId',
        title: 'Task Detail',
        icon: ClipboardList,
        element: withSuspense(OnboardingTaskDetail),
        nav: false,
    },
    {
        path: 'hr/recruitment/onboarding/assignment/:assignmentId',
        href: '/hr/recruitment/onboarding/assignment/:assignmentId',
        title: 'Assignment Detail',
        icon: UserCheck,
        element: withSuspense(OnboardingAssignmentDetail),
        nav: false,
    },

    // Evaluation
    {
        path: 'hr/recruitment/evaluation/flows',
        href: '/hr/recruitment/evaluation/flows',
        title: 'Evaluation Flows',
        icon: ClipboardList,
        element: withSuspense(PageEvaluationFlow),
        nav: false,
    },
    {
        path: 'hr/recruitment/evaluation',
        href: '/hr/recruitment/evaluation',
        title: 'Evaluation',
        icon: ClipboardList,
        element: withSuspense(ApplicantEvaluationPageWrapper),
        nav: false,
    },
    {
        path: 'hr/recruitment/evaluation/:applicantId',
        href: '/hr/recruitment/evaluation/:applicantId',
        title: 'Applicant Evaluation',
        icon: ClipboardList,
        element: withSuspense(ApplicantEvaluation),
        nav: false,
    },

    // HR Settings
    {
        path: 'settings/hr',
        href: '/settings/hr',
        title: 'HR Settings',
        icon: LayoutDashboard,
        element: withSuspense(PageHrSettings),
        nav: false,
    },
    {
        path: 'settings/hr/jobgrade',
        href: '/settings/hr/jobgrade',
        title: 'Job Grades',
        icon: LayoutDashboard,
        element: withSuspense(JobGrade),
        nav: false,
    },
    {
        path: 'settings/hr/jobgrade/:gradeId/steps',
        href: '/settings/hr/jobgrade/:gradeId/steps',
        title: 'Job Grade Steps',
        icon: LayoutDashboard,
        element: withSuspense(JobGradeSubgrades),
        nav: false,
    },
    {
        path: 'settings/hr/benefitset',
        href: '/settings/hr/benefitset',
        title: 'Benefit Sets',
        icon: LayoutDashboard,
        element: withSuspense(PageBenefitSet),
        nav: false,
    },
    {
        path: 'settings/hr/educationqual',
        href: '/settings/hr/educationqual',
        title: 'Educational Qualifications',
        icon: LayoutDashboard,
        element: withSuspense(PageEducationalQual),
        nav: false,
    },
    {
        path: 'settings/hr/position',
        href: '/settings/hr/position',
        title: 'Positions',
        icon: LayoutDashboard,
        element: withSuspense(PagePosition),
        nav: false,
    },
    {
        path: 'settings/hr/position/:id',
        href: '/settings/hr/position/:id',
        title: 'Position Details',
        icon: LayoutDashboard,
        element: withSuspense(PositionDetails),
        nav: false,
    },
    {
        path: 'settings/hr/annualleave',
        href: '/settings/hr/annualleave',
        title: 'Annual Leave',
        icon: LayoutDashboard,
        element: withSuspense(PageAnnualLeave),
        nav: false,
    },
    {
        path: 'settings/hr/annualleave/:id/policy',
        href: '/settings/hr/annualleave/:id/policy',
        title: 'Leave Policy Accrual',
        icon: LayoutDashboard,
        element: withSuspense(LeavePolicyAccrualPage),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leavePolicy',
        href: '/settings/hr/leave/leavePolicy',
        title: 'Leave Policies',
        icon: LayoutDashboard,
        element: withSuspense(LeavePolicy),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leavePolicyConfig/:leavePolicyId',
        href: '/settings/hr/leave/leavePolicyConfig/:leavePolicyId',
        title: 'Leave Policy Config',
        icon: LayoutDashboard,
        element: withSuspense(LeavePolicyConfig),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leaveAppChainHistory/:leavePolicyId',
        href: '/settings/hr/leave/leaveAppChainHistory/:leavePolicyId',
        title: 'Leave App Chain History',
        icon: LayoutDashboard,
        element: withSuspense(LeaveAppChainHistory),
        nav: false,
    },
    {
        path: 'settings/hr/leave/leavePolicyConfigHistory/:leavePolicyId',
        href: '/settings/hr/leave/leavePolicyConfigHistory/:leavePolicyId',
        title: 'Leave Policy Config History',
        icon: LayoutDashboard,
        element: withSuspense(LeavePolicyConfigHistory),
        nav: false,
    },
    {
        path: 'settings/hr/leave/policyAssignmentRule/:leavePolicyId',
        href: '/settings/hr/leave/policyAssignmentRule/:leavePolicyId',
        title: 'Policy Assignment Rule',
        icon: LayoutDashboard,
        element: withSuspense(PolicyAssignmentRule),
        nav: false,
    },
    {
        path: 'settings/hr/leave/policyAssignmentRuleHistory/:leavePolicyId',
        href: '/settings/hr/leave/policyAssignmentRuleHistory/:leavePolicyId',
        title: 'Policy Assignment Rule History',
        icon: LayoutDashboard,
        element: withSuspense(PolicyAssignmentRuleHistory),
        nav: false,
    },
    {
        path: 'settings/hr/recruitment',
        href: '/settings/hr/recruitment',
        title: 'Recruitment Settings',
        icon: LayoutDashboard,
        element: withSuspense(PageHrRecruitmentSettings),
        nav: false,
    },
    {
        path: 'settings/hr/evaluation-types',
        href: '/settings/hr/evaluation-types',
        title: 'Evaluation Types',
        icon: LayoutDashboard,
        element: withSuspense(PageEvaluationType),
        nav: false,
    },
    {
        path: 'settings/hr/evaluation-flows',
        href: '/settings/hr/evaluation-flows',
        title: 'Evaluation Flows',
        icon: LayoutDashboard,
        element: withSuspense(PageEvaluationFlow),
        nav: false,
    },
    {
        path: 'settings/hr/evaluation-flows/:flowId/steps',
        href: '/settings/hr/evaluation-flows/:flowId/steps',
        title: 'Evaluation Steps',
        icon: LayoutDashboard,
        element: withSuspense(PageEvaluationStep),
        nav: false,
    },
    {
        path: 'settings/hr/onboarding-tasks',
        href: '/settings/hr/onboarding-tasks',
        title: 'Onboarding Tasks',
        icon: LayoutDashboard,
        element: withSuspense(PageOnboardingTask),
        nav: false,
    },

    // Legacy Routes
    {
        path: 'hr/recruitment/list',
        href: '/hr/recruitment/list',
        title: 'Recruitment List',
        icon: Users,
        element: withSuspense(RecruitmentList),
        nav: false,
    },
    {
        path: 'hr/recruitment/pipeline',
        href: '/hr/recruitment/pipeline',
        title: 'Candidate Pipeline',
        icon: Users,
        element: withSuspense(CandidatePipeline),
        nav: false,
    },
    {
        path: 'hr/recruitment/candidates/:candidateId',
        href: '/hr/recruitment/candidates/:candidateId',
        title: 'Candidate Detail',
        icon: Users,
        element: withSuspense(CandidatePipeline),
        nav: false,
    },
    {
        path: 'hr/recruitment/onboarding',
        href: '/hr/recruitment/onboarding',
        title: 'Onboarding',
        icon: UserCheck,
        element: withSuspense(OnBoarding),
        nav: false,
    },
    {
        path: 'hr/recruitment/workforce-plan',
        href: '/hr/recruitment/workforce-plan',
        title: 'Workforce Plan',
        icon: Briefcase,
        element: withSuspense(WorkforcePlansPage),
        nav: false,
    },
    {
        path: 'hr/recruitment/jobs',
        href: '/hr/recruitment/jobs',
        title: 'Jobs',
        icon: Briefcase,
        element: withSuspense(JobPostingPage),
        nav: false,
    },
    {
        path: 'hr/recruitment/approved-requisitions',
        href: '/hr/recruitment/approved-requisitions',
        title: 'Approved Requisitions',
        icon: FileText,
        element: withSuspense(ApprovedJobRequisitionPage),
        nav: false,
    },
];

// ==================== HR SIDEBAR NAVIGATION ====================
export const hrSidebarRoutes: SidebarNavSection[] = [
    {
        id: 'hr-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'HR Dashboard', href: '/hr', activeMatch: 'exact' },
            { title: 'Recruitment Dashboard', href: '/hr/recruitment/dashboard', activeMatch: 'exact' },
        ],
    },
    {
        id: 'hr-employees',
        title: 'Employee Management',
        icon: Users,
        items: [
            { title: 'Employee Record', href: '/hr/employees/record', activeMatch: 'exact' },
            { title: 'Pending Employees', href: '/hr/pend-employees', activeMatch: 'prefix' },
            { title: 'Pending Education/Experience', href: '/hr/employees/pending-edu-exp', activeMatch: 'prefix' }, // ✅ Add this
            { title: 'Terminations', href: '/hr/employees/termination', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'hr-leave',
        title: 'Leave Management',
        icon: Calendar,
        items: [
            { title: 'My Leave', href: '/hr/leave/list', activeMatch: 'exact' },
            { title: 'Leave Approvals', href: '/hr/leave/approval', activeMatch: 'prefix' },
            { title: 'Request Leave', href: '/hr/leave/form', activeMatch: 'prefix' },
            { title: 'My Requests', href: '/hr/leave/my-requests', activeMatch: 'prefix' },
            { title: 'Leave Balance', href: '/hr/leave/balance', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'hr-attendance',
        title: 'Attendance',
        icon: Clock,
        items: [
            { title: 'Attendance', href: '/hr/attendance/list', activeMatch: 'prefix' },
            { title: 'Shift Scheduler', href: '/hr/shift-scheduler', activeMatch: 'prefix' },
            { title: 'Time Clock', href: '/hr/time-clock', activeMatch: 'prefix' },
            { title: 'Attendance Report', href: '/hr/attendance/report', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'hr-recruitment',
        title: 'Recruitment',
        icon: Briefcase,
        items: [
            { title: 'Workforce Plans', href: '/hr/recruitment/workforce-plans', activeMatch: 'prefix' },
            { title: 'Job Requisitions', href: '/hr/recruitment/requisitions', activeMatch: 'prefix' },
            { title: 'Job Postings', href: '/hr/recruitment/postings', activeMatch: 'prefix' },
            { title: 'Applicants', href: '/hr/recruitment/applicants', activeMatch: 'prefix' },
            { title: 'Interviews', href: '/hr/recruitment/interviews', activeMatch: 'prefix' },
            { title: 'Offers', href: '/hr/recruitment/offers', activeMatch: 'prefix' },
            { title: 'Onboarding', href: '/hr/recruitment/onboarding/tasks', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'hr-training',
        title: 'Training',
        icon: GraduationCap,
        items: [
            { title: 'Training Programs', href: '/hr/training', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'hr-settings',
        title: 'Settings',
        icon: LayoutDashboard,
        items: [
            { title: 'HR Settings', href: '/settings/hr', activeMatch: 'prefix' },
            { title: 'Job Grades', href: '/settings/hr/jobgrade', activeMatch: 'prefix' },
            { title: 'Leave Policies', href: '/settings/hr/leave/leavePolicy', activeMatch: 'prefix' },
            { title: 'Recruitment Settings', href: '/settings/hr/recruitment', activeMatch: 'prefix' },
            { title: 'Evaluation Types', href: '/settings/hr/evaluation-types', activeMatch: 'prefix' },
            { title: 'Evaluation Flows', href: '/settings/hr/evaluation-flows', activeMatch: 'prefix' },
            { title: 'Onboarding Tasks', href: '/settings/hr/onboarding-tasks', activeMatch: 'prefix' },
        ],
    },
];

// ==================== ROUTE TITLE HELPER ====================
const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/hr/employees/record', 'Employee Record'],
    ['/hr/employees/edit/', 'Edit Employee'],
    ['/hr/employees/', 'Employee Details'],
    ['/hr/pend-employees/', 'Pending Employee'],
    ['/hr/employees/pending-edu-exp', 'Pending Education & Experience'], // ✅ Add this
    ['/hr/leave/approval-chain/', 'Approval Chain'],
    ['/hr/leave/approval-chain-history/', 'Approval Chain History'],
    ['/hr/recruitment/workforce-plan/', 'Workforce Plan'],
    ['/hr/recruitment/requisition/', 'Job Requisition'],
    ['/hr/recruitment/posting/', 'Job Posting'],
    ['/hr/recruitment/applicant/', 'Applicant'],
    ['/hr/recruitment/interviews/', 'Interview'],
    ['/hr/recruitment/offer/', 'Offer'],
    ['/hr/recruitment/onboarding/task/', 'Onboarding Task'],
    ['/hr/recruitment/onboarding/assignment/', 'Onboarding Assignment'],
    ['/hr/recruitment/candidates/', 'Candidate'],
    ['/settings/hr', 'HR Settings'],
];

export const getHrRouteTitle = (path: string): string => {
    // Check exact matches first
    const exact = hrRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    // Check prefix matches
    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'HR Management';
};