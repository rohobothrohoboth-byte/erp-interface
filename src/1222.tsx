import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import Layout from "./layout/layout";
import Dashboard from "./pages/modules/HR";
import Modules from "./pages/Modules";
import InventoryDashboard from "./pages/modules/Inventory";
import CoreDashboard from "./pages/modules/Core";
import Finance from "./pages/modules/Finance";
import Procurement from "./pages/modules/Procurement";
import JobGrade from "./pages/settings/hrSettings/jobgrade/JobGrade";
import Termination from "./pages/hr/employeepage/Termination";
import CandidatePipeline from "./pages/hr/recruitmentpage/CandidatePipeline";
import OnBoarding from "./pages/hr/recruitmentpage/OnBoarding";
import RecruitmentList from "./pages/hr/recruitmentpage/RecruitmentList";
import CRMDashboard from "./pages/modules/CRM";
import EmployeeManagementPage from "./pages/hr/employeepage/EmployeeRecord";
import LeaveEntitlementPage from "./pages/hr/leavepage/LeaveEntitlementPage";
import LeaveList from "./pages/hr/leavepage/MyLeavePage";
import YearEndProcessingPage from "./pages/hr/leavepage/YearEndProcessingPage";

import LeaveApprovalPage from './pages/hr/leavepage/LeaveApprovalPage';
import LeaveRequestForm from "./pages/hr/leavepage/LeaveRequestForm";
import LeaveAppChainManagement from "./pages/settings/hrSettings/Leave/LeaveAppChainManagement";
import AppChainHistorySection from "./components/settings/hrSettings/leave/LeaveAppChain/appChainHistory/AppChainHistorySection";
import MyLeaveRequestsPage from './pages/hr/leavepage/MyLeaveRequestsPage';
import Training from "./pages/hr/trainingpage/Training";
import AttendanceList from "./pages/hr/attendancepage/AttendanceList";
import ShiftScheduler from "./pages/hr/attendancepage/ShiftScheduler";
import TimeClock from "./pages/hr/attendancepage/TimeClock";
import TimeClockFormContainer from "./pages/hr/attendancepage/TimeClockFormContainer";
import BudgetList from "./pages/finance/budgetpage/BudgetList";
import BudgetCreate from "./pages/finance/budgetpage/BudgetCreate";
import GlPage from "./pages/finance/generalledgerpage/GlPage";
import ChartOfAccountsPage from "./pages/finance/generalledgerpage/ChartOfAccountsPage";
import JournalEntriesPage from "./pages/finance/generalledgerpage/JournalEntriesPage";
import AuditTrailPage from "./pages/finance/generalledgerpage/AuditTrailPage";
import FiscalYearOverview from "./pages/core/pageFiscYear";
import UserOverview from "./pages/core/usermanagement/pageUserManagement";
import DepartmentOverview from "./pages/core/pageDepartments";
import CompanyBranchesPage from "./pages/core/pageCompanies";
import BranchesPage from "./pages/core/pageBranches";
import FiscalYearHistory from "./pages/core/pageFiscYearHist";
import PageModuleSettings from './pages/settings/coresettings/PageModuleSettings';
import PagePeriod from "./pages/core/pagePeriod";
import PageSettings from "./pages/settings/pageSettings";
import JobGradeSubgrades from "./pages/settings/hrSettings/jobgrade/JobGradeSubgrades";
import PageBenefitSet from "./pages/settings/hrSettings/pageBenefitSet";
import PageEducationalQual from "./pages/settings/hrSettings/pageEducationalQual";
import PagePosition from "./pages/settings/hrSettings/position/pagePosition";
import PositionDetails from "./pages/settings/hrSettings/position/PositionDetails";
import AddEmployeePage from "./pages/hr/employeepage/AddEmployeePage";
import EditEmployeePage from "./pages/hr/employeepage/EditEmployeePage";
import PageAnnualLeave from "./pages/settings/hrSettings/pageAnnualLeave";
import LeavePolicyAccrualPage from "./pages/settings/hrSettings/leavepolicyaccrual/LeavePolicyAccrualPage";
import { HolidayHistory } from "./pages/core/pageHolidayHist";
import ProfilePage from "./pages/profile";
import PageAddUser from "./pages/core/usermanagement/pageAddUser";
import PageHrSettings from "./pages/settings/hrSettings/PageHrSettings";
import PageEvaluationType from "./pages/settings/hrSettings/Recruitment/PageEvaluationType";
import PageEvaluationFlow from "./pages/settings/hrSettings/Recruitment/PageEvaluationFlow";
import PageEvaluationStep from "./pages/settings/hrSettings/Recruitment/PageEvaluationStep";
import PageOnboardingTask from "./pages/settings/hrSettings/Recruitment/PageOnboardingTask";
import PageHrRecruitmentSettings from "./pages/settings/hrSettings/Recruitment/PageHrRecruitmentSettings";
import WorkforcePlanPage from "./pages/hr/recruitmentpage/workforcePlan/WorkforcePlanPage.tsx";
import JobRequisitionPage from "./pages/hr/recruitmentpage/JobRequisitionPage";
import JobPostingPage from "./pages/hr/recruitmentpage/JobPostingPage";
import ApprovedJobRequisitionPage from "./pages/hr/recruitmentpage/ApprovedJobRequisitionPage";
import ApplicantsPage from "./pages/hr/recruitmentpage/ApplicantsPage.tsx";
import JpEvalFlowPage from "./pages/hr/recruitmentpage/JpEvalFlowPage";
import JobPostingDashboardPage from "./pages/hr/recruitmentpage/JobPostingDashboardPage";
import PostApplicantsPage from "./pages/hr/recruitmentpage/PostApplicantsPage";
import ApplicantEvaluationPageWrapper from "./pages/hr/recruitmentpage/ApplicantEvaluationPageWrapper";
import PageCoreSettings from "./pages/settings/coreSettings/PageCoreSettings";
import PageApiSettings from "./pages/settings/coreSettings/PageApiSettings";
import PageMenuSettings from "./pages/settings/coreSettings/PageMenuSettings";
import FileDashboard from "./pages/modules/File";
import FolderDocumentsPage from "./pages/File/FolderDocumentsPage";
import PlanDevDashboard from "./pages/modules/PlanDev";
import ProjectManagementDashboard from "./pages/modules/ProjectManagement";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAuthStore } from "./stores/auth.store";
import { useEffect } from "react";
import LeavePolicy from "./pages/settings/hrSettings/Leave/leavePolicy";

import LeavePolicyConfig from "./pages/settings/hrSettings/Leave/leavePolicyConfig";
import LeaveAppChainHistory from "./pages/settings/hrSettings/Leave/LeaveAppChainHistory";
import LeavePolicyConfigHistory from "./pages/settings/hrSettings/Leave/leavePolicyConfigHistory";
import PolicyAssignmentRule from "./pages/settings/hrSettings/Leave/policyAssignmentRule";
import PolicyAssignmentRuleHistory from "./pages/settings/hrSettings/Leave/policyAssignmentRuleHistory";
import PageAccounts from "./pages/settings/FinanceSettings/Account/PageAccounts";
import PageAccountDetail from "./pages/settings/FinanceSettings/Account/PageAccountDetail";
import PageAccountCategory from "./pages/settings/FinanceSettings/Account/PageAccountCategory";
import PageFinanceSettings from "./pages/settings/FinanceSettings/PageFinanceSettings";
import PageCostCenter from "./pages/settings/FinanceSettings/CostCenter/PageCostCenter";
import PageBudgetCode from "./pages/settings/FinanceSettings/BudgetCode/PageBudgetCode";
import PageBudgetCategory from "./pages/settings/FinanceSettings/BudgetCategory/PageBudgetCategory";
import FinancePageAccounts from "./pages/finance/Account/PageAccounts";
import FinancePageAccountDetail from "./pages/finance/Account/PageAccountDetail";
import PageBudget from "./pages/finance/budgeting/PageBudget";
import PageBudgetPlan from "./pages/finance/budgeting/PageBudgetPlan";
import PageBudgetExpenses from "./pages/finance/budgeting/PageBudgetExpenses";
import PageBudgetApproval from "./pages/finance/budgeting/PageBudgetApproval";
import PageExpenseApproval from "./pages/finance/budgeting/PageExpenseApproval";
import PageAdditionalBudget from "./pages/finance/budgeting/PageAdditionalBudget";
import PageBudgetReview from "./pages/finance/budgeting/PageBudgetReview";
import PageAdditionalBudgetApproval from "./pages/finance/budgeting/PageAdditionalBudgetApproval";
import PageBudgetVersions from "./pages/finance/budgeting/PageBudgetVersions";
import PageJournal from "./pages/finance/PageJournal";
import PageInvoiceApproval from "./pages/finance/PageInvoiceApproval";
import PageAccountsPayable from "./pages/finance/PageAccountsPayable";
import PagePayments from "./pages/finance/PagePayments";
import PageInvoicePosting from "./pages/finance/PageInvoicePosting";
import PagePaymentReceipt from "./pages/finance/PagePaymentReceipt";
import PageReports from "./pages/finance/PageReports";
import PageAssets from "./pages/finance/PageAssets";
import AssetCapitalizationPage from "./pages/finance/assetCapitalizationPage/AssetCapitalizationPage";
import AssetRegisterPage from "./pages/finance/assetRegisterPage/AssetRegisterPage";
import AssetDetailPage from "./pages/finance/assetDetailPage/AssetDetailPage";
import DepreciationManagementPage from "./pages/finance/depreciationManagementPage/DepreciationManagementPage";
import PageTransactions from "./pages/finance/PageTransactions";
import PagePayroll from "./pages/finance/PagePayroll";
import LeadGenerationPage from "./pages/crm/leadManagement/LeadGenerationPage";
import AssignedLeadsPage from "./pages/crm/leadManagement/AssignedLeadsPage";
import LeadGroupingPage from "./pages/crm/leadManagement/LeadGroupingPage";
import AddLeadPage from "./pages/crm/leadManagement/AddLeadPage";
import EditLeadPage from "./pages/crm/leadManagement/EditLeadPage";
import LeadRoutingPage from "./pages/crm/leadManagement/LeadRoutingPage";
import ImportLeadPage from "./pages/crm/leadManagement/ImportLeadPage";
import LeadDetailPage from "./pages/crm/leadManagement/LeadDetailPage";
import LeadConversion from "./pages/crm/leadManagement/LeadConversion";
import ContactsPage from "./pages/crm/contactManagement/ContactsPage";
import ContactGroupingPage from "./pages/crm/contactManagement/ContactGroupingPage";
import AssignedContactsPage from "./pages/crm/contactManagement/AssignedContactsPage";
import AssignedContactDetailPage from "./pages/crm/contactManagement/AssignedContactDetailPage";
import AddContactPage from "./pages/crm/contactManagement/AddContactPage";
import EditContactPage from "./pages/crm/contactManagement/EditContactPage";
import ContactDetailPage from "./pages/crm/contactManagement/ContactDetailPage";
import OpportunityDetailPage from "./pages/crm/salesManagement/OpportunityDetailPage";
import SalesManagement from "./pages/crm/salesManagement/SalesManagement";
import OpportunitiesPage from "./pages/crm/salesManagement/OpportunitiesPage";
import QuotationsPage from "./pages/crm/salesManagement/QuotationsPage";
import OrdersPage from "./pages/crm/salesManagement/OrdersPage";
import OrderDetailPage from "./pages/crm/salesManagement/OrderDetailPage";
import MarketingAutomation from "./pages/crm/marketingAutomation/MarketingAutomation";
import CampaignsPage from "./pages/crm/marketingAutomation/CampaignsPage";
import EmailCampaignsPage from "./pages/crm/marketingAutomation/EmailCampaignsPage";
import SMSCampaignsPage from "./pages/crm/marketingAutomation/SMSCampaignsPage";
import CustomerSupport from "./pages/crm/customerService/CustomerService";
import TicketsPage from "./pages/crm/customerService/TicketsPage";
import KnowledgeBasePage from "./pages/crm/customerService/KnowledgeBasePage";
import ActivityManagement from "./pages/crm/activityManagement/ActivityManagement";
import TasksPage from "./pages/crm/activityManagement/TasksPage";
import CalendarPage from "./pages/crm/activityManagement/CalendarPage";
import TimeTrackingPage from "./pages/crm/activityManagement/TimeTrackingPage";
import NotificationsPage from "./pages/crm/activityManagement/NotificationsPage";
import AnalyticsReporting from "./pages/crm/analytics/AnalyticsReporting";
import PageCrmSettings from "./pages/settings/crmSettings/PageCrmSettings";
import PageLeadSources from "./pages/settings/crmSettings/pageLeadSources";
import PageLeadStatuses from "./pages/settings/crmSettings/pageLeadStatuses";
import PageIndustries from "./pages/settings/crmSettings/pageIndustries";
import PageRoutingRules from "./pages/settings/crmSettings/pageRoutingRules";
import PageLeadScoring from "./pages/settings/crmSettings/pageLeadScoring";
import PageQuotationTemplates from "./pages/settings/crmSettings/pageQuotationTemplates";
import PageEmailTemplates from "./pages/settings/crmSettings/pageEmailTemplates";
import PageSMSTemplates from "./pages/settings/crmSettings/pageSMSTemplates";
import PageTicketStatus from "./pages/settings/crmSettings/pageTicketStatus";
import VacanciesPage from "./pages/vacancy/VacanciesPage";

import EditAccountPage from "./pages/core/usermanagement/pageEditAccount";
import PageAddUserV2 from "./pages/core/usermanagement/pageAddUserV2";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PagePaymentApprovalChain from "./pages/settings/FinanceSettings/PagePaymentApprovalChain";
import EmployeeDetailsPage from "./pages/hr/employeepage/EmployeeDetailsPage";
import PendingEmployeePage from "./pages/hr/employeepage/PendingEmployeePage";
import { PendingEmployeeDetail } from './components/hr/employee/PendingEmployee/PendingEmployeeDetail';
import PageAddAccount from './pages/core/usermanagement/pageAddAccount';
import EmpDetailView from "./components/hr/employee/EmployeeDetail/EmpDetailView";
import TaskManagement from './pages/TaskManagement';
import EditTaskPage from './pages/EditTaskPage';
import TaskCalendar from './components/Dashboard/TaskCalendar';

import { LanguageProvider } from './i18n';

// Import Notification Components
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from 'react-hot-toast';

function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<SignInPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  {/* ==================== MAIN MODULE DASHBOARDS ==================== */}
                  <Route path="/hr" element={<Dashboard />} />
                  <Route path="/inventory" element={<InventoryDashboard />} />
                  <Route path="/core" element={<CoreDashboard />} />
                  <Route path="/crm" element={<CRMDashboard />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/procurement" element={<Procurement />} />
                  <Route path="/file" element={<FileDashboard />} />
                  <Route path="/file/documents/:folderId" element={<FolderDocumentsPage />} />
                  <Route path="/plandev" element={<PlanDevDashboard />} />
                  <Route path="/project-management" element={<ProjectManagementDashboard />} />

                  {/* ==================== CORE MODULE ROUTES ==================== */}
                  <Route path="/core/audit" element={<AuditTrailPage />} />
                  <Route path="/core/settings" element={<PageCoreSettings />} />
                  <Route path="/core/backup" element={<div>Backup & Restore Page</div>} />
                  <Route path="/core/roles" element={<PageMenuSettings />} />
                  <Route path="/core/company/:companyId/branches" element={<CompanyBranchesPage />} />
                  <Route path="/branches" element={<BranchesPage />} />
                  <Route path="/core/branch" element={<BranchesPage />} />
                  <Route path="/core/company" element={<CompanyBranchesPage />} />
                  <Route path="/core/fiscal-year" element={<FiscalYearOverview />} />
                  <Route path="/core/fiscal-year/history" element={<FiscalYearHistory />} />
                  <Route path="/core/fiscal-year/period-history" element={<PagePeriod />} />
                  <Route path="/core/fiscal-year/holiday-history" element={<HolidayHistory />} />
                  <Route path="/core/users" element={<UserOverview />} />
                  <Route path="/core/add-employee" element={<PageAddUser />} />
                  <Route path="/core/user-management/add-account/:empId" element={<PageAddAccount />} />
                  <Route path="/core/user-management/add-v2" element={<PageAddUserV2 />} />
                  <Route path="/core/user-management/edit/:empId" element={<EditAccountPage />} />
                  <Route path="/core/department" element={<DepartmentOverview />} />
                  <Route path="/settings/core/modules" element={<PageModuleSettings />} />

                  {/* ==================== HR MODULE ROUTES ==================== */}
                  <Route path="/hr/employees/record" element={<EmployeeManagementPage />} />
                  <Route path="/hr/employees/record/Add" element={<AddEmployeePage />} />
                  <Route path="/hr/employees/edit/:employeeId" element={<EditEmployeePage />} />
                  <Route path="/hr/employees/:id" element={<EmployeeDetailsPage />} />
                  <Route path="/hr/employees/termination" element={<Termination />} />
                  <Route path="/hr/employees/profile" element={<EmployeeDetailsPage />} />
                  <Route path="/hr/employees/documents" element={<div>Employee Documents</div>} />
                  <Route path="/hr/employees/contracts" element={<div>Employee Contracts</div>} />
                  <Route path="/hr/employees/performance" element={<div>Performance Reviews</div>} />
                  <Route path="/hr/employees/promotions" element={<div>Promotions</div>} />
                  <Route path="/hr/employees/terminations" element={<Termination />} />
                  <Route path="/hr/pend-employees" element={<PendingEmployeePage />} />
                  <Route path="/hr/pend-employees/:id" element={<PendingEmployeeDetail />} />

                  {/* Recruitment */}
                  <Route path="/hr/recruitment/list" element={<RecruitmentList />} />
                  <Route path="/hr/recruitment/pipeline" element={<CandidatePipeline />} />
                  <Route path="/hr/recruitment/candidates/:candidateId" element={<CandidatePipeline />} />
                  <Route path="/hr/recruitment/onboarding" element={<OnBoarding />} />
                  <Route path="/hr/recruitment/workforce-plan" element={<WorkforcePlanPage />} />
                  <Route path="/hr/recruitment/workforce-plan/:planId/requisitions" element={<JobRequisitionPage />} />
                  <Route path="/hr/recruitment/job-requisition/:reqId/postings" element={<JobPostingPage />} />
                  <Route path="/hr/recruitment/workforce-plan/:planId/postings" element={<JobPostingPage />} />
                  <Route path="/hr/recruitment/approved-requisitions" element={<ApprovedJobRequisitionPage />} />
                  <Route path="/hr/recruitment/applicants" element={<ApplicantsPage />} />
                  <Route path="/hr/recruitment/jobs" element={<JobPostingPage />} />
                  <Route path="/hr/recruitment/interviews" element={<div>Interviews</div>} />
                  <Route path="/hr/recruitment/job-posting/:postId/eval-flow" element={<JpEvalFlowPage />} />
                  <Route path="/hr/recruitment/job-posting/:postId/eval-flow/:postNumber" element={<JpEvalFlowPage />} />
                  <Route path="/hr/recruitment/job-posting/:postId/dashboard" element={<JobPostingDashboardPage />} />
                  <Route path="/hr/recruitment/job-posting/:postId/dashboard/:postNumber" element={<JobPostingDashboardPage />} />
                  <Route path="/hr/recruitment/job-posting/:postId/applicants" element={<PostApplicantsPage />} />
                  <Route path="/hr/recruitment/job-posting/:postId/applicants/:postNumber" element={<PostApplicantsPage />} />
                  <Route path="/hr/recruitment/applicant/:applicantId/evaluate" element={<ApplicantEvaluationPageWrapper />} />

                  {/* Leave Management */}
                  <Route path="/hr/leave/list" element={<LeaveList />} />
                  <Route path="/hr/leave/approval-chain-history/:leavePolicyId" element={<AppChainHistorySection />} />
                  <Route path="/hr/leave/policy/config/:leavePolicyId" element={<LeavePolicyConfig />} />
                  <Route path="/hr/leave/approval" element={<LeaveApprovalPage />} />
                  <Route path="/hr/leave/form" element={<LeaveRequestForm />} />
                  <Route path="/hr/leave/approval-chain/:policyId" element={<LeaveAppChainManagement />} />
                  <Route path="/hr/leave/balance" element={<LeaveEntitlementPage />} />
                  <Route path="/hr/leave/entitlement" element={<LeaveEntitlementPage />} />
                  <Route path="/hr/leave/types" element={<LeavePolicy />} />
                  <Route path="/hr/leave/policies" element={<YearEndProcessingPage />} />
                  <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
                  <Route path="/page/task" element={<TaskManagement />} />

                  {/* Attendance */}
                  <Route path="/hr/attendance/list" element={<AttendanceList />} />
                  <Route path="/hr/shift-scheduler" element={<ShiftScheduler />} />
                  <Route path="/hr/time-clock" element={<TimeClock />} />
                  <Route path="/hr/attendance/checkin" element={<TimeClock />} />
                  <Route path="/hr/attendance/report" element={<div>Attendance Report</div>} />
                  <Route path="/hr/attendance/form" element={<TimeClockFormContainer />} />
                  <Route path="/hr/leave/my-requests" element={ <MyLeaveRequestsPage />} />

                  {/* Payroll */}
                  <Route path="/hr/payroll/run" element={<PagePayroll />} />
                  <Route path="/hr/payroll/history" element={<PagePayroll />} />
                  <Route path="/hr/payroll/salary-structure" element={<div>Salary Structure</div>} />
                  <Route path="/hr/payroll/tax" element={<div>Tax Configurations</div>} />

                  {/* Training */}
                  <Route path="/hr/training" element={<Training />} />
                  <Route path="/hr/training/programs" element={<Training />} />
                  <Route path="/hr/training/calendar" element={<Training />} />
                  <Route path="/hr/training/feedback" element={<Training />} />
                  <Route path="/hr/training/certificates" element={<Training />} />

                  {/* HR Reports */}
                  <Route path="/hr/reports/employees" element={<div>Employee Reports</div>} />
                  <Route path="/hr/reports/attendance" element={<div>Attendance Reports</div>} />
                  <Route path="/hr/reports/leave" element={<div>Leave Reports</div>} />
                  <Route path="/hr/reports/payroll" element={<div>Payroll Reports</div>} />
                  <Route path="/hr/reports/recruitment" element={<div>Recruitment Reports</div>} />

                  {/* ==================== FINANCE MODULE ROUTES ==================== */}
                  {/* General Ledger */}
                  <Route path="/finance/gl" element={<GlPage />} />
                  <Route path="/finance/gl/chart-of-accounts" element={<ChartOfAccountsPage />} />
                  <Route path="/finance/gl/journal-entries" element={<JournalEntriesPage />} />
                  <Route path="/finance/gl/audit-trail" element={<AuditTrailPage />} />
                  <Route path="/finance/gl/budget" element={<PageBudget />} />
                  <Route path="/finance/gl/closing" element={<div>Period Closing</div>} />

                  {/* Accounts Payable */}
                  <Route path="/finance/accounts-payable" element={<PageAccountsPayable />} />
                  <Route path="/finance/ap/vendors" element={<div>Vendors Management</div>} />
                  <Route path="/finance/ap/invoices" element={<div>AP Invoices</div>} />
                  <Route path="/finance/ap/payments" element={<PagePayments />} />
                  <Route path="/finance/ap/approval" element={<PageInvoiceApproval />} />
                  <Route path="/finance/ap/reports" element={<div>AP Reports</div>} />

                  {/* Accounts Receivable */}
                  <Route path="/finance/ar/customers" element={<div>Customers Management</div>} />
                  <Route path="/finance/ar/invoices" element={<PageInvoicePosting />} />
                  <Route path="/finance/ar/receipts" element={<PagePaymentReceipt />} />
                  <Route path="/finance/ar/collections" element={<div>Collections</div>} />
                  <Route path="/finance/ar/reports" element={<div>AR Reports</div>} />

                  {/* Cash & Bank */}
                  <Route path="/finance/cash/bank-accounts" element={<div>Bank Accounts</div>} />
                  <Route path="/finance/cash/transactions" element={<PageTransactions />} />
                  <Route path="/finance/cash/reconciliation" element={<div>Bank Reconciliation</div>} />
                  <Route path="/finance/cash/petty-cash" element={<div>Petty Cash</div>} />

                  {/* Fixed Assets */}
                  <Route path="/finance/assets" element={<PageAssets />} />
                  <Route path="/finance/asset-register" element={<AssetRegisterPage />} />
                  <Route path="/finance/assets/register" element={<AssetRegisterPage />} />
                  <Route path="/finance/assets/depreciation" element={<DepreciationManagementPage />} />
                  <Route path="/finance/assets/disposal" element={<div>Asset Disposal</div>} />
                  <Route path="/finance/depreciation" element={<DepreciationManagementPage />} />
                  <Route path="/finance/asset-capitalization" element={<AssetCapitalizationPage />} />

                  {/* Tax Management */}
                  <Route path="/finance/tax/vat" element={<div>VAT Management</div>} />
                  <Route path="/finance/tax/withholding" element={<div>Withholding Tax</div>} />
                  <Route path="/finance/tax/reports" element={<div>Tax Reports</div>} />

                  {/* Financial Reports */}
                  <Route path="/finance/reports" element={<PageReports />} />
                  <Route path="/finance/reports/balance-sheet" element={<div>Balance Sheet</div>} />
                  <Route path="/finance/reports/income-statement" element={<div>Income Statement</div>} />
                  <Route path="/finance/reports/cash-flow" element={<div>Cash Flow Statement</div>} />
                  <Route path="/finance/reports/trial-balance" element={<div>Trial Balance</div>} />
                  <Route path="/finance/reports/general-ledger" element={<div>General Ledger Report</div>} />

                  {/* Budgeting */}
                  <Route path="/finance/budget" element={<PageBudget />} />
                  <Route path="/finance/budget/:budgetId/versions" element={<PageBudgetVersions />} />
                  <Route path="/finance/budget-plan" element={<PageBudgetPlan />} />
                  <Route path="/finance/budget-plan/:budgetPlanId/expenses" element={<PageBudgetExpenses />} />
                  <Route path="/finance/budget-approval" element={<PageBudgetApproval />} />
                  <Route path="/finance/budget-approval/:budgetPlanId/expenses" element={<PageExpenseApproval />} />
                  <Route path="/finance/additional-budget" element={<PageAdditionalBudget />} />
                  <Route path="/finance/budget-review" element={<PageBudgetReview />} />
                  <Route path="/finance/additional-budget-approval" element={<PageAdditionalBudgetApproval />} />
                  <Route path="/finance/budget-list" element={<BudgetList />} />
                  <Route path="/finance/budget-create" element={<BudgetCreate />} />

                  {/* Other Finance */}
                  <Route path="/finance/accounts" element={<FinancePageAccounts />} />
                  <Route path="/finance/accounts/:accountId" element={<FinancePageAccountDetail />} />
                  <Route path="/finance/invoice-approval" element={<PageInvoiceApproval />} />
                  <Route path="/finance/payments" element={<PagePayments />} />
                  <Route path="/finance/invoice-posting" element={<PageInvoicePosting />} />
                  <Route path="/finance/payment-receipt" element={<PagePaymentReceipt />} />
                  <Route path="/finance/journals" element={<PageJournal />} />
                  <Route path="/finance/payroll" element={<PagePayroll />} />
                  <Route path="/finance/transactions" element={<PageTransactions />} />

                  {/* ==================== CRM MODULE ROUTES ==================== */}
                  <Route path="/crm/leads/generation" element={<LeadGenerationPage />} />
                  <Route path="/crm/leads/generation/import" element={<ImportLeadPage />} />
                  <Route path="/crm/leads/assigned" element={<AssignedLeadsPage />} />
                  <Route path="/crm/leads/assigned/:id" element={<LeadDetailPage />} />
                  <Route path="/crm/leads/grouping" element={<LeadGroupingPage />} />
                  <Route path="/crm/leads/add" element={<AddLeadPage />} />
                  <Route path="/crm/leads/:id/edit" element={<EditLeadPage />} />
                  <Route path="/crm/leads/routing" element={<LeadRoutingPage />} />
                  <Route path="/crm/leads/qualification" element={<div>Lead Qualification</div>} />
                  <Route path="/crm/leads/conversion" element={<LeadConversion />} />
                  <Route path="/crm/leads/:id/convert" element={<LeadConversion />} />

                  <Route path="/crm/contacts" element={<ContactsPage />} />
                  <Route path="/crm/contacts/grouping" element={<ContactGroupingPage />} />
                  <Route path="/crm/contacts/assigned" element={<AssignedContactsPage />} />
                  <Route path="/crm/contacts/assigned/:id" element={<AssignedContactDetailPage />} />
                  <Route path="/crm/contacts/add" element={<AddContactPage />} />
                  <Route path="/crm/contacts/:id/edit" element={<EditContactPage />} />
                  <Route path="/crm/contacts/:id" element={<ContactDetailPage />} />
                  <Route path="/crm/contacts/:id/activities" element={<ContactDetailPage />} />
                  <Route path="/crm/companies" element={<div>Companies</div>} />
                  <Route path="/crm/interactions" element={<div>Interactions</div>} />

                  <Route path="/crm/sales" element={<SalesManagement />} />
                  <Route path="/crm/sales/opportunities" element={<OpportunitiesPage />} />
                  <Route path="/crm/quotations" element={<QuotationsPage />} />
                  <Route path="/crm/sales/quotes" element={<QuotationsPage />} />
                  <Route path="/crm/orders" element={<OrdersPage />} />
                  <Route path="/crm/sales/orders" element={<OrdersPage />} />
                  <Route path="/crm/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/crm/sales/contracts" element={<div>Contracts</div>} />
                  <Route path="/crm/sales/forecast" element={<div>Sales Forecast</div>} />
                  <Route path="/crm/opportunity/:id" element={<OpportunityDetailPage />} />

                  <Route path="/crm/marketing" element={<MarketingAutomation />} />
                  <Route path="/crm/campaigns" element={<CampaignsPage />} />
                  <Route path="/crm/campaigns/email" element={<EmailCampaignsPage />} />
                  <Route path="/crm/campaigns/sms" element={<SMSCampaignsPage />} />
                  <Route path="/crm/email-marketing" element={<EmailCampaignsPage />} />
                  <Route path="/crm/social-media" element={<div>Social Media</div>} />

                  <Route path="/crm/support" element={<CustomerSupport />} />
                  <Route path="/crm/support/tickets" element={<TicketsPage />} />
                  <Route path="/crm/support/knowledge-base" element={<KnowledgeBasePage />} />
                  <Route path="/crm/feedback" element={<div>Customer Feedback</div>} />

                  <Route path="/crm/activities" element={<ActivityManagement />} />
                  <Route path="/crm/activities/tasks" element={<TasksPage />} />
                  <Route path="/crm/activities/calendar" element={<CalendarPage />} />
                  <Route path="/crm/activities/time-tracking" element={<TimeTrackingPage />} />
                  <Route path="/crm/activities/notifications" element={<NotificationsPage />} />

                  <Route path="/crm/analytics" element={<AnalyticsReporting />} />
                  <Route path="/crm/analytics/sales" element={<AnalyticsReporting />} />
                  <Route path="/crm/analytics/customers" element={<AnalyticsReporting />} />
                  <Route path="/crm/analytics/marketing" element={<AnalyticsReporting />} />

                  {/* ==================== INVENTORY MODULE ROUTES ==================== */}
                  <Route path="/inventory/products" element={<div>Product List</div>} />
                  <Route path="/inventory/categories" element={<div>Categories</div>} />
                  <Route path="/inventory/units" element={<div>Units of Measure</div>} />
                  <Route path="/inventory/barcodes" element={<div>Barcode Management</div>} />
                  <Route path="/inventory/stock-in" element={<div>Stock In</div>} />
                  <Route path="/inventory/stock-out" element={<div>Stock Out</div>} />
                  <Route path="/inventory/stock-transfer" element={<div>Stock Transfer</div>} />
                  <Route path="/inventory/stock-adjustment" element={<div>Stock Adjustment</div>} />
                  <Route path="/inventory/stock-count" element={<div>Stock Count</div>} />
                  <Route path="/inventory/warehouses" element={<div>Warehouses</div>} />
                  <Route path="/inventory/warehouse-zones" element={<div>Zones & Bins</div>} />
                  <Route path="/inventory/warehouse-layout" element={<div>Warehouse Layout</div>} />
                  <Route path="/inventory/valuation-methods" element={<div>Valuation Methods</div>} />
                  <Route path="/inventory/valuation-report" element={<div>Valuation Report</div>} />
                  <Route path="/inventory/reorder-levels" element={<div>Reorder Levels</div>} />
                  <Route path="/inventory/reorder-requests" element={<div>Reorder Requests</div>} />
                  <Route path="/inventory/stock-reports" element={<div>Stock Reports</div>} />
                  <Route path="/inventory/movement-reports" element={<div>Movement Reports</div>} />
                  <Route path="/inventory/forecast" element={<div>Demand Forecast</div>} />

                  {/* ==================== PROCUREMENT MODULE ROUTES ==================== */}
                  <Route path="/procurement/requisitions/create" element={<div>Create Requisition</div>} />
                  <Route path="/procurement/requisitions" element={<div>Requisition List</div>} />
                  <Route path="/procurement/requisitions/approval" element={<div>Requisition Approval</div>} />
                  <Route path="/procurement/vendors" element={<div>Vendors</div>} />
                  <Route path="/procurement/vendor-evaluation" element={<div>Vendor Evaluation</div>} />
                  <Route path="/procurement/vendor-contracts" element={<div>Vendor Contracts</div>} />
                  <Route path="/procurement/po/create" element={<div>Create PO</div>} />
                  <Route path="/procurement/po" element={<div>PO List</div>} />
                  <Route path="/procurement/po/approval" element={<div>PO Approval</div>} />
                  <Route path="/procurement/po/tracking" element={<div>PO Tracking</div>} />
                  <Route path="/procurement/receipt/create" element={<div>Create GRN</div>} />
                  <Route path="/procurement/receipt" element={<div>GRN List</div>} />
                  <Route path="/procurement/inspection" element={<div>Quality Inspection</div>} />
                  <Route path="/procurement/invoice/verify" element={<div>Invoice Verification</div>} />
                  <Route path="/procurement/invoice" element={<div>Invoice List</div>} />
                  <Route path="/procurement/invoice/payment" element={<div>Payment Processing</div>} />
                  <Route path="/procurement/analytics/spend" element={<div>Spend Analysis</div>} />
                  <Route path="/procurement/analytics/vendor" element={<div>Vendor Performance</div>} />
                  <Route path="/procurement/reports" element={<div>Procurement Reports</div>} />

                  {/* ==================== PLAN & DEVELOPMENT MODULE ROUTES ==================== */}
                  <Route path="/plandev/strategic-plans" element={<div>Strategic Plans</div>} />
                  <Route path="/plandev/objectives" element={<div>Objectives</div>} />
                  <Route path="/plandev/kpis" element={<div>KPIs</div>} />
                  <Route path="/plandev/initiatives/active" element={<div>Active Initiatives</div>} />
                  <Route path="/plandev/initiatives/completed" element={<div>Completed Initiatives</div>} />
                  <Route path="/plandev/initiatives/budget" element={<div>Initiative Budget</div>} />
                  <Route path="/plandev/calendar" element={<div>Planning Calendar</div>} />
                  <Route path="/plandev/milestones" element={<div>Milestones</div>} />
                  <Route path="/plandev/risks" element={<div>Risk Management</div>} />
                  <Route path="/plandev/reports/progress" element={<div>Progress Reports</div>} />
                  <Route path="/plandev/reports/performance" element={<div>Performance Reports</div>} />

                  {/* ==================== PROJECT MANAGEMENT MODULE ROUTES ==================== */}
                  <Route path="/project-management/projects" element={<div>All Projects</div>} />
                  <Route path="/project-management/projects/create" element={<div>Create Project</div>} />
                  <Route path="/project-management/templates" element={<div>Project Templates</div>} />
                  <Route path="/project-management/tasks/my" element={<div>My Tasks</div>} />
                  <Route path="/project-management/tasks" element={<div>All Tasks</div>} />
                  <Route path="/project-management/tasks/board" element={<div>Task Board</div>} />
                  <Route path="/project-management/tasks/calendar" element={<div>Task Calendar</div>} />
                  <Route path="/project-management/milestones" element={<div>Milestones</div>} />
                  <Route path="/project-management/team" element={<div>Team Members</div>} />
                  <Route path="/project-management/team/roles" element={<div>Roles & Responsibilities</div>} />
                  <Route path="/project-management/team/workload" element={<div>Workload</div>} />
                  <Route path="/project-management/timeline" element={<div>Timeline</div>} />
                  <Route path="/project-management/budget" element={<div>Budget & Costs</div>} />
                  <Route path="/project-management/risks" element={<div>Risk Register</div>} />
                  <Route path="/project-management/reports/progress" element={<div>Progress Reports</div>} />
                  <Route path="/project-management/reports/time" element={<div>Time Reports</div>} />
                  <Route path="/project-management/reports/financial" element={<div>Financial Reports</div>} />

                  {/* ==================== FILE MANAGEMENT MODULE ROUTES ==================== */}
                  <Route path="/file/folders/company" element={<FolderDocumentsPage />} />
                  <Route path="/file/shared" element={<FolderDocumentsPage />} />
                  <Route path="/file/folders/personal" element={<FolderDocumentsPage />} />
                  <Route path="/file/recent" element={<FolderDocumentsPage />} />
                  <Route path="/file/archive" element={<FolderDocumentsPage />} />
                  <Route path="/file/settings" element={<PageSettings />} />

                  {/* ==================== REPORTS MODULE ROUTES ==================== */}
                  <Route path="/reports" element={<div>Reports Dashboard</div>} />
                  <Route path="/reports/hr" element={<div>HR Reports</div>} />
                  <Route path="/reports/finance" element={<PageReports />} />
                  <Route path="/reports/inventory" element={<div>Inventory Reports</div>} />
                  <Route path="/reports/crm" element={<div>CRM Reports</div>} />
                  <Route path="/reports/procurement" element={<div>Procurement Reports</div>} />
                  <Route path="/reports/project" element={<div>Project Reports</div>} />
                  <Route path="/reports/custom" element={<div>Custom Reports</div>} />
                  <Route path="/reports/scheduler" element={<div>Report Scheduler</div>} />

                  {/* ==================== SETTINGS ROUTES ==================== */}
                  <Route path="/settings" element={<PageSettings />} />
                  <Route path="/settings/core" element={<PageCoreSettings />} />
                  <Route path="/settings/core/api-permissions" element={<PageApiSettings />} />
                  <Route path="/settings/core/menu-permissions" element={<PageMenuSettings />} />

                  <Route path="/settings/hr" element={<PageHrSettings />} />
                  <Route path="/settings/hr/jobgrade" element={<JobGrade />} />
                  <Route path="/settings/hr/jobgrade/:gradeId/steps" element={<JobGradeSubgrades />} />
                  <Route path="/settings/hr/benefitset" element={<PageBenefitSet />} />
                  <Route path="/settings/hr/educationqual" element={<PageEducationalQual />} />
                  <Route path="/settings/hr/position" element={<PagePosition />} />
                  <Route path="/settings/hr/position/:id" element={<PositionDetails />} />
                  <Route path="/settings/hr/annualleave" element={<PageAnnualLeave />} />
                  <Route path="/settings/hr/annualleave/:id/policy" element={<LeavePolicyAccrualPage />} />

                  <Route path="/settings/hr/leave/leavePolicy" element={<LeavePolicy />} />
                  <Route path="/settings/hr/leave/leavePolicyConfig/:leavePolicyId" element={<LeavePolicyConfig />} />
                  <Route path="/settings/hr/leave/leaveAppChainHistory/:leavePolicyId" element={<LeaveAppChainHistory />} />
                  <Route path="/settings/hr/leave/leavePolicyConfigHistory/:leavePolicyId" element={<LeavePolicyConfigHistory />} />
                  <Route path="/settings/hr/leave/policyAssignmentRule/:leavePolicyId" element={<PolicyAssignmentRule />} />
                  <Route path="/settings/hr/leave/policyAssignmentRuleHistory/:leavePolicyId" element={<PolicyAssignmentRuleHistory />} />

                  <Route path="/settings/hr/recruitment" element={<PageHrRecruitmentSettings />} />
                  <Route path="/settings/hr/evaluation-types" element={<PageEvaluationType />} />
                  <Route path="/settings/hr/evaluation-flows" element={<PageEvaluationFlow />} />
                  <Route path="/settings/hr/evaluation-flows/:flowId/steps" element={<PageEvaluationStep />} />
                  <Route path="/settings/hr/onboarding-tasks" element={<PageOnboardingTask />} />

                  <Route path="/settings/finance" element={<PageFinanceSettings />} />
                  <Route path="/settings/finance/accounts" element={<PageAccounts />} />
                  <Route path="/settings/finance/accounts/:accountId" element={<PageAccountDetail />} />
                  <Route path="/settings/finance/account-category" element={<PageAccountCategory />} />
                  <Route path="/settings/finance/cost-center" element={<PageCostCenter />} />
                  <Route path="/settings/finance/budget-code" element={<PageBudgetCode />} />
                  <Route path="/settings/finance/budget-category" element={<PageBudgetCategory />} />
                  <Route path="/settings/finance/payment-approval-chain" element={<PagePaymentApprovalChain />} />

                  <Route path="/settings/crm" element={<PageCrmSettings />} />
                  <Route path="/settings/crm/lead-sources" element={<PageLeadSources />} />
                  <Route path="/settings/crm/lead-statuses" element={<PageLeadStatuses />} />
                  <Route path="/settings/crm/industries" element={<PageIndustries />} />
                  <Route path="/settings/crm/routing-rules" element={<PageRoutingRules />} />
                  <Route path="/settings/crm/lead-scoring" element={<PageLeadScoring />} />
                  <Route path="/settings/crm/quotation-templates" element={<PageQuotationTemplates />} />
                  <Route path="/settings/crm/email-templates" element={<PageEmailTemplates />} />
                  <Route path="/settings/crm/sms-templates" element={<PageSMSTemplates />} />
                  <Route path="/settings/crm/ticket-status" element={<PageTicketStatus />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/modules" element={<Modules />} />
                <Route path="/TaskCalendar" element={<TaskCalendar />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="/vacancies" element={<VacanciesPage />} />
              <Route path="/vacancies/:id" element={<VacanciesPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to={isAuthenticated ? "/404" : "/login"} replace />} />
            </Routes>

            {/* Global Toast Container */}
            <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#059669',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#dc2626',
                    },
                  },
                  loading: {
                    style: {
                      background: '#3b82f6',
                    },
                  },
                }}
            />
          </NotificationProvider>
        </QueryClientProvider>
      </LanguageProvider>
  );
}

export default App;