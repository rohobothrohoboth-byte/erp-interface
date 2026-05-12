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
import LeaveList from "./pages/hr/leavepage/myLeavePage";
import LeaveRequestForm from "./pages/hr/leavepage/LeaveRequestForm";
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
// import BranchOverview from './pages/core/branchpage/BranchOverview';
import FiscalYearOverview from "./pages/core/pageFiscYear";
// import HierarchyOverview from './pages/core/hierarchypage/HierarchyOverview';
import UserOverview from "./pages/core/usermanagement/pageUserManagement";
import DepartmentOverview from "./pages/core/pageDepartments";
import CompanyBranchesPage from "./pages/core/pageCompanies";
// import CompanyDetailsPage from './components/core/company/CompDetails';
import BranchesPage from "./pages/core/pageBranches";
import FiscalYearHistory from "./pages/core/pageFiscYearHist";
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
import { PageHolidayHist } from "./pages/core/pageHolidayHist";
import ProfilePage from "./pages/profile";
import PageAddUser from "./pages/core/usermanagement/pageAddUser";
import PageHrSettings from "./pages/settings/hrSettings/PageHrSettings";
import PageEvaluationType from "./pages/settings/hrSettings/Recruitment/PageEvaluationType";
import PageEvaluationFlow from "./pages/settings/hrSettings/Recruitment/PageEvaluationFlow";
import PageEvaluationStep from "./pages/settings/hrSettings/Recruitment/PageEvaluationStep";
import PageOnboardingTask from "./pages/settings/hrSettings/Recruitment/PageOnboardingTask";
import PageHrRecruitmentSettings from "./pages/settings/hrSettings/Recruitment/PageHrRecruitmentSettings";
import WorkforcePlanPage from "./pages/hr/recruitmentpage/WorkforcePlanPage";
import JobRequisitionPage from "./pages/hr/recruitmentpage/JobRequisitionPage";
import JobPostingPage from "./pages/hr/recruitmentpage/JobPostingPage";
import ApprovedJobRequisitionPage from "./pages/hr/recruitmentpage/ApprovedJobRequisitionPage";
import ApplicantsPage from "./pages/hr/recruitmentpage/ApplicantsPage";
import JpEvalFlowPage from "./pages/hr/recruitmentpage/JpEvalFlowPage";
import JobPostingDashboardPage from "./pages/hr/recruitmentpage/JobPostingDashboardPage";
import PostApplicantsPage from "./pages/hr/recruitmentpage/PostApplicantsPage";
import ApplicantEvaluationPageWrapper from "./pages/hr/recruitmentpage/ApplicantEvaluationPageWrapper";
import PageCoreSettings from "./pages/settings/coreSettings/PageCoreSettings";
import PageApiSettings from "./pages/settings/coreSettings/PageApiSettings";
import PageMenuSettings from "./pages/settings/coreSettings/PageMenuSettings";
import FileDashboard from "./pages/modules/File";
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
import AddAccountPage from "./pages/core/usermanagement/pageAddAccount";
import EditAccountPage from "./pages/core/usermanagement/pageEditAccount";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PagePaymentApprovalChain from "./pages/settings/FinanceSettings/PagePaymentApprovalChain";
import EmployeeDetailsPage from "./pages/hr/employeepage/EmployeeDetailsPage";

function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Root path redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public route */}
          <Route path="/login" element={<SignInPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* START MENU ROUTES */}
              <Route path="/hr" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/core" element={<CoreDashboard />} />
              <Route path="/crm" element={<CRMDashboard />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/procurement" element={<Procurement />} />
              <Route path="/file" element={<FileDashboard />} />
              <Route path="/plandev" element={<PlanDevDashboard />} />
              <Route
                path="/project-management"
                element={<ProjectManagementDashboard />}
              />
              {/* End MENU ROUTES */}
              {/* START CRM ROUTES */}
              <Route
                path="/crm/leads/generation"
                element={<LeadGenerationPage />}
              />
              <Route
                path="/crm/leads/generation/import"
                element={<ImportLeadPage />}
              />
              <Route
                path="/crm/leads/assigned"
                element={<AssignedLeadsPage />}
              />
              <Route
                path="/crm/leads/assigned/:id"
                element={<LeadDetailPage />}
              />
              <Route
                path="/crm/leads/grouping"
                element={<LeadGroupingPage />}
              />
              <Route path="/crm/leads/add" element={<AddLeadPage />} />
              <Route path="/crm/leads/:id/edit" element={<EditLeadPage />} />
              <Route path="/crm/leads/routing" element={<LeadRoutingPage />} />
              <Route
                path="/crm/leads/:id/convert"
                element={<LeadConversion />}
              />
              <Route path="/crm/contacts" element={<ContactsPage />} />
              <Route
                path="/crm/contacts/grouping"
                element={<ContactGroupingPage />}
              />
              <Route
                path="/crm/contacts/assigned"
                element={<AssignedContactsPage />}
              />
              <Route
                path="/crm/contacts/assigned/:id"
                element={<AssignedContactDetailPage />}
              />
              <Route path="/crm/contacts/add" element={<AddContactPage />} />
              <Route
                path="/crm/contacts/:id/edit"
                element={<EditContactPage />}
              />
              <Route path="/crm/contacts/:id" element={<ContactDetailPage />} />
              <Route
                path="/crm/contacts/:id/activities"
                element={<ContactDetailPage />}
              />
              <Route path="/crm/sales" element={<SalesManagement />} />
              <Route
                path="/crm/sales/opportunities"
                element={<OpportunitiesPage />}
              />
              <Route path="/crm/quotations" element={<QuotationsPage />} />
              <Route path="/crm/orders" element={<OrdersPage />} />
              <Route path="/crm/orders/:id" element={<OrderDetailPage />} />
              <Route
                path="/crm/opportunity/:id"
                element={<OpportunityDetailPage />}
              />
              <Route path="/crm/marketing" element={<MarketingAutomation />} />
              <Route path="/crm/campaigns" element={<CampaignsPage />} />
              <Route
                path="/crm/campaigns/email"
                element={<EmailCampaignsPage />}
              />
              <Route path="/crm/campaigns/sms" element={<SMSCampaignsPage />} />
              <Route path="/crm/support" element={<CustomerSupport />} />
              <Route path="/crm/support/tickets" element={<TicketsPage />} />
              <Route
                path="/crm/support/knowledge-base"
                element={<KnowledgeBasePage />}
              />
              <Route path="/crm/activities" element={<ActivityManagement />} />
              <Route path="/crm/activities/tasks" element={<TasksPage />} />
              <Route
                path="/crm/activities/calendar"
                element={<CalendarPage />}
              />
              <Route
                path="/crm/activities/time-tracking"
                element={<TimeTrackingPage />}
              />
              <Route
                path="/crm/activities/notifications"
                element={<NotificationsPage />}
              />
              <Route path="/crm/analytics" element={<AnalyticsReporting />} />
              <Route path="/settings/crm" element={<PageCrmSettings />} />
              <Route
                path="/settings/crm/routing-rules"
                element={<PageRoutingRules />}
              />
              <Route
                path="/settings/crm/lead-scoring"
                element={<PageLeadScoring />}
              />
              <Route
                path="/settings/crm/lead-sources"
                element={<PageLeadSources />}
              />
              <Route
                path="/settings/crm/quotation-templates"
                element={<PageQuotationTemplates />}
              />
              <Route
                path="/settings/crm/email-templates"
                element={<PageEmailTemplates />}
              />
              <Route
                path="/settings/crm/sms-templates"
                element={<PageSMSTemplates />}
              />
              <Route
                path="/settings/crm/lead-statuses"
                element={<PageLeadStatuses />}
              />
              <Route
                path="/settings/crm/industries"
                element={<PageIndustries />}
              />
              <Route
                path="/settings/crm/ticket-status"
                element={<PageTicketStatus />}
              />
              {/* END CRM ROUTES */}
              {/* START HR ROUTES */}
              <Route
                path="/hr/employees/record"
                element={<EmployeeManagementPage />}
              />
              <Route
                path="/hr/employees/record/Add"
                element={<AddEmployeePage />}
              />
              <Route
                path="/hr/employees/edit/:employeeId"
                element={<EditEmployeePage />}
              />
              <Route
                path="/hr/employees/:id"
                element={<EmployeeDetailsPage />}
              />
              <Route path="/settings/hr/jobgrade" element={<JobGrade />} />
              <Route
                path="/settings/hr/jobgrade/:gradeId/steps"
                element={<JobGradeSubgrades />}
              />
              <Route
                path="/hr/employees/termination"
                element={<Termination />}
              />
              <Route
                path="/hr/recruitment/pipeline"
                element={<CandidatePipeline />}
              />
              <Route
                path="/hr/recruitment/candidates/:candidateId"
                element={<CandidatePipeline />}
              />
              <Route
                path="/hr/recruitment/onboarding"
                element={<OnBoarding />}
              />
              <Route
                path="/hr/recruitment/list"
                element={<RecruitmentList />}
              />
              <Route
                path="/hr/recruitment/workforce-plan"
                element={<WorkforcePlanPage />}
              />
              <Route
                path="/hr/recruitment/workforce-plan/:planId/requisitions"
                element={<JobRequisitionPage />}
              />
              <Route
                path="/hr/recruitment/job-requisition/:reqId/postings"
                element={<JobPostingPage />}
              />
              <Route
                path="/hr/recruitment/workforce-plan/:planId/postings"
                element={<JobPostingPage />}
              />
              <Route
                path="/hr/recruitment/approved-requisitions"
                element={<ApprovedJobRequisitionPage />}
              />
              <Route
                path="/hr/recruitment/applicants"
                element={<ApplicantsPage />}
              />
              <Route
                path="/hr/recruitment/job-posting/:postId/eval-flow"
                element={<JpEvalFlowPage />}
              />
              <Route
                path="/hr/recruitment/job-posting/:postId/eval-flow/:postNumber"
                element={<JpEvalFlowPage />}
              />
              <Route
                path="/hr/recruitment/job-posting/:postId/dashboard"
                element={<JobPostingDashboardPage />}
              />
              <Route
                path="/hr/recruitment/job-posting/:postId/dashboard/:postNumber"
                element={<JobPostingDashboardPage />}
              />
              <Route
                path="/hr/recruitment/job-posting/:postId/applicants/:postNumber"
                element={<PostApplicantsPage />}
              />
              <Route
                path="/hr/recruitment/job-posting/:postId/applicants"
                element={<PostApplicantsPage />}
              />
              <Route
                path="/hr/recruitment/applicant/:applicantId/evaluate"
                element={<ApplicantEvaluationPageWrapper />}
              />
              <Route path="/hr/leave/list" element={<LeaveList />} />
              <Route path="/hr/leave/form" element={<LeaveRequestForm />} />
              <Route
                path="/hr/leave/entitlement"
                element={<LeaveEntitlementPage />}
              />
              <Route path="/hr/attendance/list" element={<AttendanceList />} />
              <Route path="/hr/shift-scheduler" element={<ShiftScheduler />} />
              <Route path="/hr/time-clock" element={<TimeClock />} />
              <Route
                path="/hr/attendance/form"
                element={<TimeClockFormContainer />}
              />
              <Route path="/settings" element={<PageSettings />} />
              <Route
                path="/settings/finance"
                element={<PageFinanceSettings />}
              />
              <Route
                path="/settings/finance/accounts"
                element={<PageAccounts />}
              />
              <Route
                path="/settings/finance/accounts/:accountId"
                element={<PageAccountDetail />}
              />
              <Route
                path="/settings/finance/account-category"
                element={<PageAccountCategory />}
              />
              <Route
                path="/settings/finance/cost-center"
                element={<PageCostCenter />}
              />
              <Route
                path="/settings/finance/budget-code"
                element={<PageBudgetCode />}
              />
              <Route
                path="/settings/finance/budget-category"
                element={<PageBudgetCategory />}
              />
              <Route
                path="/settings/finance/payment-approval-chain"
                element={<PagePaymentApprovalChain />}
              />
              <Route
                path="/settings/hr/benefitset"
                element={<PageBenefitSet />}
              />
              <Route
                path="/settings/hr/educationqual"
                element={<PageEducationalQual />}
              />
              <Route path="/settings/hr/position" element={<PagePosition />} />
              <Route
                path="/settings/hr/position/:id"
                element={<PositionDetails />}
              />
              <Route
                path="/settings/hr/annualleave"
                element={<PageAnnualLeave />}
              />
              <Route
                path="/settings/hr/leave/leavePolicy"
                element={<LeavePolicy />}
              />
              <Route
                path="/settings/hr/leave/leavePolicyConfig/:leavePolicyId"
                element={<LeavePolicyConfig />}
              />
              <Route
                path="/settings/hr/leave/leaveAppChainHistory/:leavePolicyId"
                element={<LeaveAppChainHistory />}
              />
              <Route
                path="/settings/hr/leave/leavePolicyConfigHistory/:leavePolicyId"
                element={<LeavePolicyConfigHistory />}
              />
              <Route
                path="/settings/hr/leave/policyAssignmentRule/:leavePolicyId"
                element={<PolicyAssignmentRule />}
              />
              <Route
                path="/settings/hr/leave/policyAssignmentRuleHistory/:leavePolicyId"
                element={<PolicyAssignmentRuleHistory />}
              />
              <Route
                path="/settings/hr/annualleave/:id/policy"
                element={<LeavePolicyAccrualPage />}
              />
              <Route path="/settings/hr" element={<PageHrSettings />} />
              <Route
                path="/settings/hr/recruitment"
                element={<PageHrRecruitmentSettings />}
              />
              <Route
                path="/settings/hr/evaluation-types"
                element={<PageEvaluationType />}
              />
              <Route
                path="/settings/hr/evaluation-flows"
                element={<PageEvaluationFlow />}
              />
              <Route
                path="/settings/hr/evaluation-flows/:flowId/steps"
                element={<PageEvaluationStep />}
              />
              <Route
                path="/settings/hr/onboarding-tasks"
                element={<PageOnboardingTask />}
              />
              <Route path="/hr/training" element={<Training />} />
              {/* END HR ROUTES */}
              {/* START FINANCE ROUTES */}
              <Route path="/finance/gl" element={<GlPage />} />
              <Route
                path="/finance/gl/chart-of-accounts"
                element={<ChartOfAccountsPage />}
              />
              <Route
                path="/finance/gl/journal-entries"
                element={<JournalEntriesPage />}
              />
              <Route
                path="/finance/gl/audit-trail"
                element={<AuditTrailPage />}
              />
              <Route path="/finance/budget-list" element={<BudgetList />} />
              <Route path="/finance/budget" element={<PageBudget />} />
              <Route
                path="/finance/budget/:budgetId/versions"
                element={<PageBudgetVersions />}
              />
              <Route path="/finance/budget-plan" element={<PageBudgetPlan />} />
              <Route
                path="/finance/budget-plan/:budgetPlanId/expenses"
                element={<PageBudgetExpenses />}
              />
              <Route
                path="/finance/budget-approval"
                element={<PageBudgetApproval />}
              />
              <Route
                path="/finance/budget-approval/:budgetPlanId/expenses"
                element={<PageExpenseApproval />}
              />
              <Route
                path="/finance/additional-budget"
                element={<PageAdditionalBudget />}
              />
              <Route
                path="/finance/budget-review"
                element={<PageBudgetReview />}
              />
              <Route
                path="/finance/additional-budget-approval"
                element={<PageAdditionalBudgetApproval />}
              />
              <Route
                path="/finance/accounts"
                element={<FinancePageAccounts />}
              />
              <Route
                path="/finance/invoice-approval"
                element={<PageInvoiceApproval />}
              />
              <Route
                path="/finance/accounts-payable"
                element={<PageAccountsPayable />}
              />
              <Route path="/finance/payments" element={<PagePayments />} />
              <Route
                path="/finance/invoice-posting"
                element={<PageInvoicePosting />}
              />
              <Route
                path="/finance/payment-receipt"
                element={<PagePaymentReceipt />}
              />
              <Route
                path="/finance/accounts/:accountId"
                element={<FinancePageAccountDetail />}
              />
              <Route path="/finance/journals" element={<PageJournal />} />
              <Route path="/finance/payroll" element={<PagePayroll />} />
              <Route
                path="/finance/transactions"
                element={<PageTransactions />}
              />
              <Route path="/finance/assets" element={<PageAssets />} />
              <Route
                path="/finance/asset-register"
                element={<AssetRegisterPage />}
              />
              <Route
                path="/finance/asset-register/:assetId"
                element={<AssetDetailPage />}
              />
              <Route
                path="/finance/asset-capitalization"
                element={<AssetCapitalizationPage />}
              />
              <Route
                path="/finance/depreciation"
                element={<DepreciationManagementPage />}
              />
              <Route path="/finance/reports" element={<PageReports />} />
              <Route path="/finance/budget-create" element={<BudgetCreate />} />
              {/* End FINANCE ROUTES */}
              {/*sTART CORE ROUTES */}
              <Route
                path="/core/company/:companyId/branches"
                element={<CompanyBranchesPage />}
              />
              <Route path="/branches" element={<BranchesPage />} />{" "}
              <Route path="/core/company" element={<CompanyBranchesPage />} />
              {/* <Route path='/core/branch' element={<BranchOverview />} /> */}
              <Route
                path="/core/fiscal-year"
                element={<FiscalYearOverview />}
              />
              <Route
                path="/core/fiscal-year/history"
                element={<FiscalYearHistory />}
              />
              <Route
                path="/core/fiscal-year/period-history"
                element={<PagePeriod />}
              />
              {/* <Route path='/core/hierarchy' element={<HierarchyOverview />} /> */}
              <Route path="/core/users" element={<UserOverview />} />
              <Route path="/core/add-employee" element={<PageAddUser />} />
              <Route
                path="/core/user-management/add/:empId"
                element={<AddAccountPage />}
              />
              <Route
                path="/core/user-management/edit/:empId"
                element={<EditAccountPage />}
              />
              <Route path="/core/department" element={<DepartmentOverview />} />
              {/* <Route path="/core/company/:id" element={<CompanyDetailsPage />} /> */}
              <Route
                path="/core/fiscal-year/holiday-history"
                element={<PageHolidayHist />}
              />
              <Route path="/settings/core" element={<PageCoreSettings />} />
              <Route
                path="/settings/core/api-permissions"
                element={<PageApiSettings />}
              />
              <Route
                path="/settings/core/menu-permissions"
                element={<PageMenuSettings />}
              />
            </Route>
          </Route>
          {/* END CORE ROUTES */}

          <Route element={<ProtectedRoute />}>
            {/* Modules route at /modules */}
            <Route path="/modules" element={<Modules />} />
            {/* Emp Profile */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Standalone Vacancies Routes */}
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/vacancies/:id" element={<VacanciesPage />} />

          {/* 404 Page */}
          <Route path="/404" element={<NotFoundPage />} />

          {/* Catch-all route */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/404" : "/login"} replace />
            }
          />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
