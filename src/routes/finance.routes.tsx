// src/routes/finance.routes.tsx

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    LayoutDashboard,
    Wallet,
    Receipt,
    CreditCard,
    Building2,
    FileText,
    BarChart3,
    Coins,
    Settings,
    Users,
    DollarSign,
    Calendar,
    Clock,
    TrendingUp,
    Shield,
    Calculator,
    UserPlus,
    History,
    Database,
    FileCheck,
    RefreshCw,
    CheckCircle,
    CheckSquare,
    ReceiptText,
    Package,
    PieChart,
    Eye,
    GitBranch,
    Plus,
    BookOpen,
    ChartBar,
    Trash2,
    Percent,
    Scale,
    Target,
    GitMerge,
    Globe,
    Upload,
    Bell,
    Activity,
    ListChecks,
    ClipboardCheck,
    Unlink,
    Layers,
    Truck,
    Phone,
    Briefcase,
    TrendingDown,
    LineChart,
    Repeat,
    Building,
    Lock,
    FileCheck as VoucherIcon,
    AlertCircle,
    FileSearch,
    FolderOpen,
    Gift,
    BadgeDollarSign,
    HandCoins,
    Landmark,
    PiggyBank,
    Sigma,
    BarChart4,
    Banknote,
    Coins as CoinsIcon,
    ArrowLeftRight,
    Scale as ScaleIcon,
    ClipboardList,
    FilePenLine,
    ScrollText,
    SquareStack,
    UserRound,
    ShoppingBag,
    TicketCheck,
    Send,
    Check,
    X,
    MoreVertical,
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

// ============================================
// ✅ EXISTING FINANCE PAGES
// ============================================
const FinanceDashboard = lazy(() => import('../pages/modules/Finance'));

// General Ledger
const GlPage = lazy(() => import('../pages/finance/generalledgerpage/GlPage'));
const ChartOfAccountsPage = lazy(() => import('../pages/finance/generalledgerpage/ChartOfAccountsPage'));
const JournalEntriesPage = lazy(() => import('../pages/finance/generalledgerpage/JournalEntriesPage'));
const AuditTrailPage = lazy(() => import('../pages/finance/generalledgerpage/AuditTrailPage'));

// Budget
const BudgetList = lazy(() => import('../pages/finance/budgetpage/BudgetList'));
const BudgetCreate = lazy(() => import('../pages/finance/budgetpage/BudgetCreate'));
const PageBudget = lazy(() => import('../pages/finance/budgeting/PageBudget'));
const PageBudgetPlan = lazy(() => import('../pages/finance/budgeting/PageBudgetPlan'));
const PageBudgetExpenses = lazy(() => import('../pages/finance/budgeting/PageBudgetExpenses'));
const PageBudgetApproval = lazy(() => import('../pages/finance/budgeting/PageBudgetApproval'));
const PageExpenseApproval = lazy(() => import('../pages/finance/budgeting/PageExpenseApproval'));
const PageAdditionalBudget = lazy(() => import('../pages/finance/budgeting/PageAdditionalBudget'));
const PageBudgetReview = lazy(() => import('../pages/finance/budgeting/PageBudgetReview'));
const PageAdditionalBudgetApproval = lazy(() => import('../pages/finance/budgeting/PageAdditionalBudgetApproval'));
const PageBudgetVersions = lazy(() => import('../pages/finance/budgeting/PageBudgetVersions'));
const PageJournal = lazy(() => import('../pages/finance/PageJournal'));

// Accounts Payable
const PageAccountsPayable = lazy(() => import('../pages/finance/PageAccountsPayable'));
const PagePayments = lazy(() => import('../pages/finance/PagePayments'));
const InvoiceEntry = lazy(() => import('../pages/finance/ap/InvoiceEntry'));

const InvoiceApprovalAP = lazy(() => import('../pages/finance/PageInvoiceApproval'));
const APReports = lazy(() => import('../pages/finance/ap/APReports'));
const VendorManagement = lazy(() => import('../pages/finance/ap/VendorManagement'));
const VoucherManagement = lazy(() => import('../pages/finance/ap/VoucherManagement'));

// Accounts Receivable
const PageInvoicePosting = lazy(() => import('../pages/finance/PageInvoicePosting'));
const PagePaymentReceipt = lazy(() => import('../pages/finance/PagePaymentReceipt'));
const CollectionFollowup = lazy(() => import('../pages/finance/ar/CollectionFollowup'));
const ARReports = lazy(() => import('../pages/finance/ar/ARReports'));
const CustomerManagement = lazy(() => import('../pages/finance/ar/CustomerManagement'));

// Cash & Bank
const BankAccounts = lazy(() => import('../pages/finance/BankAccounts'));
const BankReconciliation = lazy(() => import('../pages/finance/BankReconciliation'));
const PettyCash = lazy(() => import('../pages/finance/PettyCash'));
const PageTransactions = lazy(() => import('../pages/finance/PageTransactions'));

// Cost Controlling (CO)
const CostCenters = lazy(() => import('../pages/finance/costcontrolling/CostCenters'));
const ProfitCenters = lazy(() => import('../pages/finance/costcontrolling/ProfitCenters'));
const InternalOrders = lazy(() => import('../pages/finance/costcontrolling/InternalOrders'));
const Coreports = lazy(() => import('../pages/finance/costcontrolling/Coreports'));

// Consolidation
const ConsolidationManagement = lazy(() => import('../pages/finance/consolidation/ConsolidationManagement'));
const Entities = lazy(() => import('../pages/finance/consolidation/Entities'));
const ConsolidationGroups = lazy(() => import('../pages/finance/consolidation/ConsolidationGroups'));
const EliminationEntries = lazy(() => import('../pages/finance/consolidation/EliminationEntries'));
const ConsolidationReports = lazy(() => import('../pages/finance/consolidation/ConsolidationReports'));

// Compliance
const ComplianceManagement = lazy(() => import('../pages/finance/compliance/ComplianceManagement'));
const InternalControls = lazy(() => import('../pages/finance/compliance/InternalControls'));
const ComplianceRequirements = lazy(() => import('../pages/finance/compliance/ComplianceRequirements'));
const ComplianceReports = lazy(() => import('../pages/finance/compliance/ComplianceReports'));

// Vendor Portal
const VendorPortal = lazy(() => import('../pages/finance/portal/VendorPortal'));
const Vendors = lazy(() => import('../pages/finance/portal/Vendors'));
const InvoiceSubmission = lazy(() => import('../pages/finance/portal/InvoiceSubmission'));
const PaymentTracking = lazy(() => import('../pages/finance/portal/PaymentTracking'));
const Notifications = lazy(() => import('../pages/finance/portal/Notifications'));

// IFRS Reports
const IFRSReports = lazy(() => import('../pages/finance/ifrs/IFRSReports'));
const IFRS9 = lazy(() => import('../pages/finance/ifrs/IFRS9'));
const IFRS15 = lazy(() => import('../pages/finance/ifrs/IFRS15'));
const IFRS16 = lazy(() => import('../pages/finance/ifrs/IFRS16'));
const IFRS7 = lazy(() => import('../pages/finance/ifrs/IFRS7'));
const IFRS8 = lazy(() => import('../pages/finance/ifrs/IFRS8'));
const IFRSDashboard = lazy(() => import('../pages/finance/ifrs/IFRSDashboard'));

// Audit
const AuditLogs = lazy(() => import('../pages/finance/audit/AuditLogs'));

// Payroll
const PagePayroll = lazy(() => import('../pages/finance/PagePayroll'));
const PayrollSettings = lazy(() => import('../pages/finance/payroll/PayrollSettings'));
const PayrollCalendar = lazy(() => import('../pages/finance/payroll/PayrollCalendar'));
const PayslipHistory = lazy(() => import('../pages/finance/payroll/PayslipHistory'));
const PayrollReports = lazy(() => import('../pages/finance/payroll/PayrollReports'));
const EmployeeSalaries = lazy(() => import('../pages/finance/payroll/EmployeeSalaries'));
const PayrollDashboard = lazy(() => import('../pages/finance/payroll/PayrollDashboard'));
const RunPayroll = lazy(() => import('../pages/finance/payroll/RunPayroll'));
const PayrollHistory = lazy(() => import('../pages/finance/payroll/PayrollHistory'));
const SalaryStructure = lazy(() => import('../pages/finance/payroll/SalaryStructure'));
const TaxConfigurations = lazy(() => import('../pages/finance/payroll/TaxConfigurations'));

// Fixed Assets
const PageAssets = lazy(() => import('../pages/finance/PageAssets'));
const AssetRegisterPage = lazy(() => import('../pages/finance/assetRegisterPage/AssetRegisterPage'));
const AssetCapitalizationPage = lazy(() => import('../pages/finance/assetCapitalizationPage/AssetCapitalizationPage'));
const AssetDetailPage = lazy(() => import('../pages/finance/assetDetailPage/AssetDetailPage'));
const DepreciationManagementPage = lazy(() => import('../pages/finance/depreciationManagementPage/DepreciationManagementPage'));
const AssetDisposal = lazy(() => import('../pages/finance/assetDisposalPage/AssetDisposal'));

// Tax
const VATManagement = lazy(() => import('../pages/finance/tax/VATManagement'));
const WithholdingTax = lazy(() => import('../pages/finance/tax/WithholdingTax'));
const TaxReports = lazy(() => import('../pages/finance/tax/TaxReports'));

// Reports
const PageReports = lazy(() => import('../pages/finance/PageReports'));
const BalanceSheet = lazy(() => import('../pages/finance/reports/BalanceSheet'));
const IncomeStatement = lazy(() => import('../pages/finance/reports/IncomeStatement'));
const CashFlow = lazy(() => import('../pages/finance/reports/CashFlow'));
const TrialBalance = lazy(() => import('../pages/finance/reports/TrialBalance'));
const GeneralLedger = lazy(() => import('../pages/finance/reports/GeneralLedger'));

// Accounts
const FinancePageAccounts = lazy(() => import('../pages/finance/Account/PageAccounts'));
const FinancePageAccountDetail = lazy(() => import('../pages/finance/Account/PageAccountDetail'));

// Settings
const PageAccounts = lazy(() => import('../pages/settings/FinanceSettings/Account/PageAccounts'));
const PageAccountDetail = lazy(() => import('../pages/settings/FinanceSettings/Account/PageAccountDetail'));
const PageAccountCategory = lazy(() => import('../pages/settings/FinanceSettings/Account/PageAccountCategory'));
const PageFinanceSettings = lazy(() => import('../pages/settings/FinanceSettings/PageFinanceSettings'));
const PageCostCenter = lazy(() => import('../pages/settings/FinanceSettings/CostCenter/PageCostCenter'));
const PageBudgetCode = lazy(() => import('../pages/settings/FinanceSettings/BudgetCode/PageBudgetCode'));
const PageBudgetCategory = lazy(() => import('../pages/settings/FinanceSettings/BudgetCategory/PageBudgetCategory'));
const PagePaymentApprovalChain = lazy(() => import('../pages/settings/FinanceSettings/PagePaymentApprovalChain'));

// Period Closing
const PagePeriodClosing = lazy(() => import('../pages/finance/PagePeriodClosing'));

// ============================================
// ✅ FINANCE ROUTES
// ============================================
export const financeRoutes: AppRoute[] = [
    // ============================================
    // DASHBOARD
    // ============================================
    {
        path: 'finance',
        href: '/finance',
        title: 'Finance Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(FinanceDashboard),
        nav: true,
        index: true,
    },

    // ============================================
    // GENERAL LEDGER
    // ============================================
    {
        path: 'finance/gl',
        href: '/finance/gl',
        title: 'General Ledger',
        icon: Wallet,
        element: withSuspense(GlPage),
        nav: true,
    },
    {
        path: 'finance/gl/chart-of-accounts',
        href: '/finance/gl/chart-of-accounts',
        title: 'Chart of Accounts',
        icon: Building2,
        element: withSuspense(ChartOfAccountsPage),
        nav: false,
    },
    {
        path: 'finance/gl/journal-entries',
        href: '/finance/gl/journal-entries',
        title: 'Journal Entries',
        icon: FileText,
        element: withSuspense(JournalEntriesPage),
        nav: false,
    },
    {
        path: 'finance/gl/audit-trail',
        href: '/finance/gl/audit-trail',
        title: 'Audit Trail',
        icon: BarChart3,
        element: withSuspense(AuditTrailPage),
        nav: false,
    },
    {
        path: 'finance/budget-management',
        href: '/finance/budget-management',
        title: 'Budget Management',
        icon: Coins,
        element: withSuspense(PageBudget),
        nav: true,
        permission: 'fnm.gl.budget',
    },
    {
        path: 'finance/period-closing',
        href: '/finance/period-closing',
        title: 'Period Closing',
        icon: Lock,
        element: withSuspense(PagePeriodClosing),
        nav: true,
    },
    {
        path: 'finance/voucher-management',
        href: '/finance/voucher-management',
        title: 'Voucher Management',
        icon: VoucherIcon,
        element: withSuspense(VoucherManagement),
        nav: true,
    },

    // ============================================
    // ACCOUNTS PAYABLE
    // ============================================
    {
        path: 'finance/accounts-payable',
        href: '/finance/accounts-payable',
        title: 'Accounts Payable',
        icon: Receipt,
        element: withSuspense(PageAccountsPayable),
        nav: true,
    },
    {
        path: 'finance/vendor-management',
        href: '/finance/vendor-management',
        title: 'Vendor Management',
        icon: Truck,
        element: withSuspense(VendorManagement),
        nav: true,
    },
    {
        path: 'finance/ap/invoices',
        href: '/finance/ap/invoices',
        title: 'Invoice Entry',
        icon: FileText,
        element: withSuspense(InvoiceEntry), // ✅ Change to InvoiceEntry
        nav: false,
    },
    {
        path: 'finance/ap/payments',
        href: '/finance/ap/payments',
        title: 'Payment Processing',
        icon: DollarSign,
        element: withSuspense(PagePayments),
        nav: false,
    },
    {
        path: 'finance/invoice-approval-ap',
        href: '/finance/invoice-approval-ap',
        title: 'Invoice Approval',
        icon: CheckCircle,
        element: withSuspense(InvoiceApprovalAP),
        nav: true,
    },
    {
        path: 'finance/ap-reports',
        href: '/finance/ap-reports',
        title: 'AP Reports',
        icon: BarChart3,
        element: withSuspense(APReports),
        nav: true,
    },

    // ============================================
    // ACCOUNTS RECEIVABLE
    // ============================================
    {
        path: 'finance/accounts',
        href: '/finance/accounts',
        title: 'Accounts Receivable',
        icon: Building2,
        element: withSuspense(FinancePageAccounts),
        nav: true,
    },
    {
        path: 'finance/customer-management',
        href: '/finance/customer-management',
        title: 'Customer Management',
        icon: Users,
        element: withSuspense(CustomerManagement),
        nav: true,
    },
    {
        path: 'finance/ar/invoices',
        href: '/finance/ar/invoices',
        title: 'Invoice Posting',
        icon: FileCheck,
        element: withSuspense(PageInvoicePosting),
        nav: false,
    },
    {
        path: 'finance/ar/receipts',
        href: '/finance/ar/receipts',
        title: 'Payment Receipt',
        icon: CreditCard,
        element: withSuspense(PagePaymentReceipt),
        nav: false,
    },
    {
        path: 'finance/collection-followup',
        href: '/finance/collection-followup',
        title: 'Collection Follow-up',
        icon: Phone,
        element: withSuspense(CollectionFollowup),
        nav: true,
        permission: 'fnm.ar.collection',
    },
    {
        path: 'finance/ar-reports',
        href: '/finance/ar-reports',
        title: 'AR Reports',
        icon: BarChart3,
        element: withSuspense(ARReports),
        nav: true,
        permission: 'fnm.ar.reports',
    },

    // ============================================
    // CASH & BANK
    // ============================================
    {
        path: 'finance/bank-accounts',
        href: '/finance/bank-accounts',
        title: 'Bank Accounts',
        icon: Building2,
        element: withSuspense(BankAccounts),
        nav: true,
    },
    {
        path: 'finance/transactions',
        href: '/finance/transactions',
        title: 'Transactions',
        icon: Repeat,
        element: withSuspense(PageTransactions),
        nav: true,
    },
    {
        path: 'finance/bank-reconciliation',
        href: '/finance/bank-reconciliation',
        title: 'Bank Reconciliation',
        icon: RefreshCw,
        element: withSuspense(BankReconciliation),
        nav: true,
    },
    {
        path: 'finance/petty-cash',
        href: '/finance/petty-cash',
        title: 'Petty Cash',
        icon: DollarSign,
        element: withSuspense(PettyCash),
        nav: true,
    },

    // ============================================
    // COST CONTROLLING (CO)
    // ============================================
    {
        path: 'finance/cost-centers',
        href: '/finance/cost-centers',
        title: 'Cost Centers',
        icon: Layers,
        element: withSuspense(CostCenters),
        nav: true,
    },
    {
        path: 'finance/profit-centers',
        href: '/finance/profit-centers',
        title: 'Profit Centers',
        icon: Target,
        element: withSuspense(ProfitCenters),
        nav: true,
    },
    {
        path: 'finance/internal-orders',
        href: '/finance/internal-orders',
        title: 'Internal Orders',
        icon: GitBranch,
        element: withSuspense(InternalOrders),
        nav: true,
    },
    {
        path: 'finance/co-reports',
        href: '/finance/co-reports',
        title: 'CO Reports',
        icon: BarChart3,
        element: withSuspense(Coreports),
        nav: true,
    },

    // ============================================
    // CONSOLIDATION
    // ============================================
    {
        path: 'finance/consolidation',
        href: '/finance/consolidation',
        title: 'Consolidation Management',
        icon: GitMerge,
        element: withSuspense(ConsolidationManagement),
        nav: true,
    },
    {
        path: 'finance/consolidation/entities',
        href: '/finance/consolidation/entities',
        title: 'Entities',
        icon: Building2,
        element: withSuspense(Entities),
        nav: false,
    },
    {
        path: 'finance/consolidation/groups',
        href: '/finance/consolidation/groups',
        title: 'Consolidation Groups',
        icon: Layers,
        element: withSuspense(ConsolidationGroups),
        nav: false,
    },
    {
        path: 'finance/consolidation/eliminations',
        href: '/finance/consolidation/eliminations',
        title: 'Elimination Entries',
        icon: Unlink,
        element: withSuspense(EliminationEntries),
        nav: false,
    },
    {
        path: 'finance/consolidation/reports',
        href: '/finance/consolidation/reports',
        title: 'Consolidation Reports',
        icon: FileText,
        element: withSuspense(ConsolidationReports),
        nav: false,
    },

    // ============================================
    // COMPLIANCE
    // ============================================
    {
        path: 'finance/compliance',
        href: '/finance/compliance',
        title: 'Compliance Management',
        icon: Shield,
        element: withSuspense(ComplianceManagement),
        nav: true,
    },
    {
        path: 'finance/compliance/controls',
        href: '/finance/compliance/controls',
        title: 'Internal Controls',
        icon: ListChecks,
        element: withSuspense(InternalControls),
        nav: false,
    },
    {
        path: 'finance/compliance/requirements',
        href: '/finance/compliance/requirements',
        title: 'Compliance Requirements',
        icon: ClipboardCheck,
        element: withSuspense(ComplianceRequirements),
        nav: false,
    },
    {
        path: 'finance/compliance/reports',
        href: '/finance/compliance/reports',
        title: 'Compliance Reports',
        icon: FileText,
        element: withSuspense(ComplianceReports),
        nav: false,
    },

    // ============================================
    // AUDIT
    // ============================================
    {
        path: 'finance/audit-logs',
        href: '/finance/audit-logs',
        title: 'Audit Logs',
        icon: Activity,
        element: withSuspense(AuditLogs),
        nav: true,
    },

    // ============================================
    // VENDOR PORTAL
    // ============================================
    {
        path: 'finance/vendor-portal',
        href: '/finance/vendor-portal',
        title: 'Vendor Portal',
        icon: Globe,
        element: withSuspense(VendorPortal),
        nav: true,
    },
    {
        path: 'finance/portal/vendors',
        href: '/finance/portal/vendors',
        title: 'Vendors',
        icon: Users,
        element: withSuspense(Vendors),
        nav: false,
    },
    {
        path: 'finance/portal/invoices',
        href: '/finance/portal/invoices',
        title: 'Invoice Submission',
        icon: Upload,
        element: withSuspense(InvoiceSubmission),
        nav: false,
    },
    {
        path: 'finance/portal/payments',
        href: '/finance/portal/payments',
        title: 'Payment Tracking',
        icon: CreditCard,
        element: withSuspense(PaymentTracking),
        nav: false,
    },
    {
        path: 'finance/portal/notifications',
        href: '/finance/portal/notifications',
        title: 'Notifications',
        icon: Bell,
        element: withSuspense(Notifications),
        nav: false,
    },

    // ============================================
    // IFRS REPORTS
    // ============================================
    {
        path: 'finance/ifrs',
        href: '/finance/ifrs',
        title: 'IFRS Reports',
        icon: BookOpen,
        element: withSuspense(IFRSReports),
        nav: true,
    },
    {
        path: 'finance/ifrs/ifrs9',
        href: '/finance/ifrs/ifrs9',
        title: 'IFRS 9 - Financial Instruments',
        icon: FileText,
        element: withSuspense(IFRS9),
        nav: false,
    },
    {
        path: 'finance/ifrs/ifrs15',
        href: '/finance/ifrs/ifrs15',
        title: 'IFRS 15 - Revenue Recognition',
        icon: FileText,
        element: withSuspense(IFRS15),
        nav: false,
    },
    {
        path: 'finance/ifrs/ifrs16',
        href: '/finance/ifrs/ifrs16',
        title: 'IFRS 16 - Leases',
        icon: FileText,
        element: withSuspense(IFRS16),
        nav: false,
    },
    {
        path: 'finance/ifrs/ifrs7',
        href: '/finance/ifrs/ifrs7',
        title: 'IFRS 7 - Disclosures',
        icon: FileText,
        element: withSuspense(IFRS7),
        nav: false,
    },
    {
        path: 'finance/ifrs/ifrs8',
        href: '/finance/ifrs/ifrs8',
        title: 'IFRS 8 - Operating Segments',
        icon: FileText,
        element: withSuspense(IFRS8),
        nav: false,
    },
    {
        path: 'finance/ifrs/dashboard',
        href: '/finance/ifrs/dashboard',
        title: 'IFRS Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(IFRSDashboard),
        nav: false,
    },

    // ============================================
    // PAYROLL
    // ============================================
    {
        path: 'finance/payroll',
        href: '/finance/payroll',
        title: 'Payroll Dashboard',
        icon: DollarSign,
        element: withSuspense(PagePayroll),
        nav: true,
    },
    {
        path: 'finance/payroll/dashboard',
        href: '/finance/payroll/dashboard',
        title: 'Payroll Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(PayrollDashboard),
        nav: false,
    },
    {
        path: 'finance/payroll/run',
        href: '/finance/payroll/run',
        title: 'Run Payroll',
        icon: Calculator,
        element: withSuspense(RunPayroll),
        nav: false,
    },
    {
        path: 'finance/payroll/history',
        href: '/finance/payroll/history',
        title: 'Payroll History',
        icon: History,
        element: withSuspense(PayrollHistory),
        nav: false,
    },
    {
        path: 'finance/payroll/calendar',
        href: '/finance/payroll/calendar',
        title: 'Payroll Calendar',
        icon: Calendar,
        element: withSuspense(PayrollCalendar),
        nav: false,
    },
    {
        path: 'finance/payroll/payslips',
        href: '/finance/payroll/payslips',
        title: 'Payslip History',
        icon: FileText,
        element: withSuspense(PayslipHistory),
        nav: false,
    },
    {
        path: 'finance/payroll/salaries',
        href: '/finance/payroll/salaries',
        title: 'Employee Salaries',
        icon: Users,
        element: withSuspense(EmployeeSalaries),
        nav: false,
    },
    {
        path: 'finance/payroll/salary-structure',
        href: '/finance/payroll/salary-structure',
        title: 'Salary Structure',
        icon: Database,
        element: withSuspense(SalaryStructure),
        nav: false,
    },
    {
        path: 'finance/payroll/tax-config',
        href: '/finance/payroll/tax-config',
        title: 'Tax Configurations',
        icon: Shield,
        element: withSuspense(TaxConfigurations),
        nav: false,
    },
    {
        path: 'finance/payroll/reports',
        href: '/finance/payroll/reports',
        title: 'Payroll Reports',
        icon: BarChart3,
        element: withSuspense(PayrollReports),
        nav: false,
    },
    {
        path: 'finance/payroll/settings',
        href: '/finance/payroll/settings',
        title: 'Payroll Settings',
        icon: Settings,
        element: withSuspense(PayrollSettings),
        nav: false,
    },

    // ============================================
    // FIXED ASSETS
    // ============================================
    {
        path: 'finance/assets',
        href: '/finance/assets',
        title: 'Fixed Assets',
        icon: Briefcase,
        element: withSuspense(PageAssets),
        nav: true,
    },
    {
        path: 'finance/assets/register',
        href: '/finance/assets/register',
        title: 'Asset Register',
        icon: ListChecks,
        element: withSuspense(AssetRegisterPage),
        nav: false,
    },
    {
        path: 'finance/asset-capitalization',
        href: '/finance/asset-capitalization',
        title: 'Asset Capitalization',
        icon: Plus,
        element: withSuspense(AssetCapitalizationPage),
        nav: false,
    },
    {
        path: 'finance/assets/depreciation',
        href: '/finance/assets/depreciation',
        title: 'Depreciation',
        icon: TrendingDown,
        element: withSuspense(DepreciationManagementPage),
        nav: false,
    },
    {
        path: 'finance/depreciation',
        href: '/finance/depreciation',
        title: 'Depreciation Management',
        icon: TrendingDown,
        element: withSuspense(DepreciationManagementPage),
        nav: true,
    },
    {
        path: 'finance/asset-disposal',
        href: '/finance/asset-disposal',
        title: 'Asset Disposal',
        icon: Trash2,
        element: withSuspense(AssetDisposal),
        nav: true,
    },
    {
        path: 'finance/assets/:assetId',
        href: '/finance/assets/:assetId',
        title: 'Asset Detail',
        icon: Eye,
        element: withSuspense(AssetDetailPage),
        nav: false,
    },

    // ============================================
    // TAX MANAGEMENT
    // ============================================
    {
        path: 'finance/vat-management',
        href: '/finance/vat-management',
        title: 'VAT Management',
        icon: Percent,
        element: withSuspense(VATManagement),
        nav: true,
    },
    {
        path: 'finance/withholding-tax',
        href: '/finance/withholding-tax',
        title: 'Withholding Tax',
        icon: Shield,
        element: withSuspense(WithholdingTax),
        nav: true,
    },
    {
        path: 'finance/tax-reports',
        href: '/finance/tax-reports',
        title: 'Tax Reports',
        icon: BarChart3,
        element: withSuspense(TaxReports),
        nav: true,
    },

    // ============================================
    // FINANCIAL REPORTS
    // ============================================
    {
        path: 'finance/reports',
        href: '/finance/reports',
        title: 'Financial Reports',
        icon: LineChart,
        element: withSuspense(PageReports),
        nav: true,
    },
    {
        path: 'finance/reports/balance-sheet',
        href: '/finance/reports/balance-sheet',
        title: 'Balance Sheet',
        icon: Scale,
        element: withSuspense(BalanceSheet),
        nav: false,
    },
    {
        path: 'finance/reports/income-statement',
        href: '/finance/reports/income-statement',
        title: 'Income Statement',
        icon: TrendingUp,
        element: withSuspense(IncomeStatement),
        nav: false,
    },
    {
        path: 'finance/reports/cash-flow',
        href: '/finance/reports/cash-flow',
        title: 'Cash Flow',
        icon: DollarSign,
        element: withSuspense(CashFlow),
        nav: false,
    },
    {
        path: 'finance/reports/trial-balance',
        href: '/finance/reports/trial-balance',
        title: 'Trial Balance',
        icon: BookOpen,
        element: withSuspense(TrialBalance),
        nav: false,
    },
    {
        path: 'finance/reports/general-ledger',
        href: '/finance/reports/general-ledger',
        title: 'General Ledger',
        icon: BookOpen,
        element: withSuspense(GeneralLedger),
        nav: false,
    },

    // ============================================
    // ACCOUNTS
    // ============================================
    {
        path: 'finance/accounts/:accountId',
        href: '/finance/accounts/:accountId',
        title: 'Account Detail',
        icon: Building2,
        element: withSuspense(FinancePageAccountDetail),
        nav: false,
    },

    // ============================================
    // BUDGET ROUTES
    // ============================================
    {
        path: 'finance/budget-list',
        href: '/finance/budget-list',
        title: 'Budget List',
        icon: Coins,
        element: withSuspense(BudgetList),
        nav: false,
    },
    {
        path: 'finance/budget-create',
        href: '/finance/budget-create',
        title: 'Create Budget',
        icon: Coins,
        element: withSuspense(BudgetCreate),
        nav: false,
    },
    {
        path: 'finance/budget-plan',
        href: '/finance/budget-plan',
        title: 'Budget Plan',
        icon: Coins,
        element: withSuspense(PageBudgetPlan),
        nav: false,
    },
    {
        path: 'finance/budget-plan/:budgetPlanId/expenses',
        href: '/finance/budget-plan/:budgetPlanId/expenses',
        title: 'Budget Expenses',
        icon: Coins,
        element: withSuspense(PageBudgetExpenses),
        nav: false,
    },
    {
        path: 'finance/budget-approval',
        href: '/finance/budget-approval',
        title: 'Budget Approval',
        icon: Coins,
        element: withSuspense(PageBudgetApproval),
        nav: false,
    },
    {
        path: 'finance/budget-approval/:budgetPlanId/expenses',
        href: '/finance/budget-approval/:budgetPlanId/expenses',
        title: 'Expense Approval',
        icon: Coins,
        element: withSuspense(PageExpenseApproval),
        nav: false,
    },
    {
        path: 'finance/additional-budget',
        href: '/finance/additional-budget',
        title: 'Additional Budget',
        icon: Coins,
        element: withSuspense(PageAdditionalBudget),
        nav: false,
    },
    {
        path: 'finance/budget-review',
        href: '/finance/budget-review',
        title: 'Budget Review',
        icon: Coins,
        element: withSuspense(PageBudgetReview),
        nav: false,
    },
    {
        path: 'finance/additional-budget-approval',
        href: '/finance/additional-budget-approval',
        title: 'Additional Budget Approval',
        icon: Coins,
        element: withSuspense(PageAdditionalBudgetApproval),
        nav: false,
    },
    {
        path: 'finance/budget/:budgetId/versions',
        href: '/finance/budget/:budgetId/versions',
        title: 'Budget Versions',
        icon: Coins,
        element: withSuspense(PageBudgetVersions),
        nav: false,
    },
    {
        path: 'finance/journals',
        href: '/finance/journals',
        title: 'Journals',
        icon: FileText,
        element: withSuspense(PageJournal),
        nav: false,
    },

    // ============================================
    // SETTINGS
    // ============================================
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
        icon: Building2,
        element: withSuspense(PageAccounts),
        nav: false,
    },
    {
        path: 'settings/finance/accounts/:accountId',
        href: '/settings/finance/accounts/:accountId',
        title: 'Account Detail',
        icon: Building2,
        element: withSuspense(PageAccountDetail),
        nav: false,
    },
    {
        path: 'settings/finance/account-category',
        href: '/settings/finance/account-category',
        title: 'Account Categories',
        icon: Building2,
        element: withSuspense(PageAccountCategory),
        nav: false,
    },
    {
        path: 'settings/finance/cost-center',
        href: '/settings/finance/cost-center',
        title: 'Cost Centers',
        icon: Coins,
        element: withSuspense(PageCostCenter),
        nav: false,
    },
    {
        path: 'settings/finance/budget-code',
        href: '/settings/finance/budget-code',
        title: 'Budget Codes',
        icon: Coins,
        element: withSuspense(PageBudgetCode),
        nav: false,
    },
    {
        path: 'settings/finance/budget-category',
        href: '/settings/finance/budget-category',
        title: 'Budget Categories',
        icon: Coins,
        element: withSuspense(PageBudgetCategory),
        nav: false,
    },
    {
        path: 'settings/finance/payment-approval-chain',
        href: '/settings/finance/payment-approval-chain',
        title: 'Payment Approval Chain',
        icon: CreditCard,
        element: withSuspense(PagePaymentApprovalChain),
        nav: false,
    },
];

// ============================================
// ✅ SIDEBAR NAVIGATION
// ============================================
export const financeSidebarRoutes: SidebarNavSection[] = [
    {
        id: 'finance-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'Finance Dashboard', href: '/finance', activeMatch: 'exact' },
        ],
    },
    {
        id: 'finance-banking',
        title: 'Banking',
        icon: Building2,
        items: [
            { title: 'Bank Accounts', href: '/finance/bank-accounts', activeMatch: 'prefix' },
            { title: 'Transactions', href: '/finance/transactions', activeMatch: 'prefix' },
            { title: 'Bank Reconciliation', href: '/finance/bank-reconciliation', activeMatch: 'prefix' },
            { title: 'Petty Cash', href: '/finance/petty-cash', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-gl',
        title: 'General Ledger',
        icon: Wallet,
        items: [
            { title: 'General Ledger', href: '/finance/gl', activeMatch: 'prefix' },
            { title: 'Chart of Accounts', href: '/finance/gl/chart-of-accounts', activeMatch: 'prefix' },
            { title: 'Journal Entries', href: '/finance/gl/journal-entries', activeMatch: 'prefix' },
            { title: 'Budget Management', href: '/finance/budget-management', activeMatch: 'prefix' },
            { title: 'Voucher Management', href: '/finance/voucher-management', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-accounts',
        title: 'Accounts',
        icon: Building2,
        items: [
            { title: 'Accounts Receivable', href: '/finance/accounts', activeMatch: 'prefix' },
            { title: 'Accounts Payable', href: '/finance/accounts-payable', activeMatch: 'prefix' },
            { title: 'Customer Management', href: '/finance/customer-management', activeMatch: 'prefix' },
            { title: 'Vendor Management', href: '/finance/vendor-management', activeMatch: 'prefix' },
            { title: 'Collection Follow-up', href: '/finance/collection-followup', activeMatch: 'prefix' },
            { title: 'AR Reports', href: '/finance/ar-reports', activeMatch: 'prefix' },
            { title: 'AP Reports', href: '/finance/ap-reports', activeMatch: 'prefix' },
            { title: 'Invoice Approval', href: '/finance/invoice-approval-ap', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-cost-controlling',
        title: 'Cost Controlling',
        icon: Target,
        items: [
            { title: 'Cost Centers', href: '/finance/cost-centers', activeMatch: 'prefix' },
            { title: 'Profit Centers', href: '/finance/profit-centers', activeMatch: 'prefix' },
            { title: 'Internal Orders', href: '/finance/internal-orders', activeMatch: 'prefix' },
            { title: 'CO Reports', href: '/finance/co-reports', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-consolidation',
        title: 'Consolidation',
        icon: GitMerge,
        items: [
            { title: 'Consolidation Management', href: '/finance/consolidation', activeMatch: 'prefix' },
            { title: 'Entities', href: '/finance/consolidation/entities', activeMatch: 'prefix' },
            { title: 'Consolidation Groups', href: '/finance/consolidation/groups', activeMatch: 'prefix' },
            { title: 'Elimination Entries', href: '/finance/consolidation/eliminations', activeMatch: 'prefix' },
            { title: 'Consolidation Reports', href: '/finance/consolidation/reports', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-compliance',
        title: 'Compliance',
        icon: Shield,
        items: [
            { title: 'Compliance Management', href: '/finance/compliance', activeMatch: 'prefix' },
            { title: 'Internal Controls', href: '/finance/compliance/controls', activeMatch: 'prefix' },
            { title: 'Compliance Requirements', href: '/finance/compliance/requirements', activeMatch: 'prefix' },
            { title: 'Compliance Reports', href: '/finance/compliance/reports', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-audit',
        title: 'Audit',
        icon: Activity,
        items: [
            { title: 'Audit Logs', href: '/finance/audit-logs', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-vendor-portal',
        title: 'Vendor Portal',
        icon: Globe,
        items: [
            { title: 'Vendor Portal', href: '/finance/vendor-portal', activeMatch: 'prefix' },
            { title: 'Vendors', href: '/finance/portal/vendors', activeMatch: 'prefix' },
            { title: 'Invoice Submission', href: '/finance/portal/invoices', activeMatch: 'prefix' },
            { title: 'Payment Tracking', href: '/finance/portal/payments', activeMatch: 'prefix' },
            { title: 'Notifications', href: '/finance/portal/notifications', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-ifrs',
        title: 'IFRS Reports',
        icon: BookOpen,
        items: [
            { title: 'IFRS Reports', href: '/finance/ifrs', activeMatch: 'prefix' },
            { title: 'IFRS 9', href: '/finance/ifrs/ifrs9', activeMatch: 'prefix' },
            { title: 'IFRS 15', href: '/finance/ifrs/ifrs15', activeMatch: 'prefix' },
            { title: 'IFRS 16', href: '/finance/ifrs/ifrs16', activeMatch: 'prefix' },
            { title: 'IFRS 7', href: '/finance/ifrs/ifrs7', activeMatch: 'prefix' },
            { title: 'IFRS 8', href: '/finance/ifrs/ifrs8', activeMatch: 'prefix' },
            { title: 'IFRS Dashboard', href: '/finance/ifrs/dashboard', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-budget',
        title: 'Budgeting',
        icon: Coins,
        items: [
            { title: 'Budget List', href: '/finance/budget-list', activeMatch: 'prefix' },
            { title: 'Budget Plan', href: '/finance/budget-plan', activeMatch: 'prefix' },
            { title: 'Budget Approval', href: '/finance/budget-approval', activeMatch: 'prefix' },
            { title: 'Additional Budget', href: '/finance/additional-budget', activeMatch: 'prefix' },
            { title: 'Budget Review', href: '/finance/budget-review', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-payroll',
        title: 'Payroll',
        icon: DollarSign,
        items: [
            { title: 'Payroll Dashboard', href: '/finance/payroll', activeMatch: 'prefix' },
            { title: 'Run Payroll', href: '/finance/payroll/run', activeMatch: 'prefix' },
            { title: 'Payroll History', href: '/finance/payroll/history', activeMatch: 'prefix' },
            { title: 'Payroll Calendar', href: '/finance/payroll/calendar', activeMatch: 'prefix' },
            { title: 'Payslip History', href: '/finance/payroll/payslips', activeMatch: 'prefix' },
            { title: 'Employee Salaries', href: '/finance/payroll/salaries', activeMatch: 'prefix' },
            { title: 'Salary Structure', href: '/finance/payroll/salary-structure', activeMatch: 'prefix' },
            { title: 'Tax Configurations', href: '/finance/payroll/tax-config', activeMatch: 'prefix' },
            { title: 'Payroll Reports', href: '/finance/payroll/reports', activeMatch: 'prefix' },
            { title: 'Payroll Settings', href: '/finance/payroll/settings', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-assets',
        title: 'Assets',
        icon: Briefcase,
        items: [
            { title: 'Fixed Assets', href: '/finance/assets', activeMatch: 'prefix' },
            { title: 'Asset Register', href: '/finance/assets/register', activeMatch: 'prefix' },
            { title: 'Asset Capitalization', href: '/finance/asset-capitalization', activeMatch: 'prefix' },
            { title: 'Depreciation', href: '/finance/depreciation', activeMatch: 'prefix' },
            { title: 'Asset Disposal', href: '/finance/asset-disposal', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-tax',
        title: 'Tax',
        icon: Percent,
        items: [
            { title: 'VAT Management', href: '/finance/vat-management', activeMatch: 'prefix' },
            { title: 'Withholding Tax', href: '/finance/withholding-tax', activeMatch: 'prefix' },
            { title: 'Tax Reports', href: '/finance/tax-reports', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-reports',
        title: 'Reports',
        icon: LineChart,
        items: [
            { title: 'Financial Reports', href: '/finance/reports', activeMatch: 'prefix' },
            { title: 'Balance Sheet', href: '/finance/reports/balance-sheet', activeMatch: 'prefix' },
            { title: 'Income Statement', href: '/finance/reports/income-statement', activeMatch: 'prefix' },
            { title: 'Cash Flow', href: '/finance/reports/cash-flow', activeMatch: 'prefix' },
            { title: 'Trial Balance', href: '/finance/reports/trial-balance', activeMatch: 'prefix' },
            { title: 'General Ledger', href: '/finance/reports/general-ledger', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'finance-settings',
        title: 'Settings',
        icon: Settings,
        items: [
            { title: 'Finance Settings', href: '/settings/finance', activeMatch: 'prefix' },
            { title: 'Accounts Settings', href: '/settings/finance/accounts', activeMatch: 'prefix' },
            { title: 'Cost Centers', href: '/settings/finance/cost-center', activeMatch: 'prefix' },
            { title: 'Budget Codes', href: '/settings/finance/budget-code', activeMatch: 'prefix' },
            { title: 'Budget Categories', href: '/settings/finance/budget-category', activeMatch: 'prefix' },
            { title: 'Payment Approval Chain', href: '/settings/finance/payment-approval-chain', activeMatch: 'prefix' },
        ],
    },
];

// ============================================
// ✅ ROUTE TITLE HELPER
// ============================================
const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/finance', 'Finance Dashboard'],
    ['/finance/bank-accounts', 'Bank Accounts'],
    ['/finance/transactions', 'Transactions'],
    ['/finance/bank-reconciliation', 'Bank Reconciliation'],
    ['/finance/petty-cash', 'Petty Cash'],
    ['/finance/gl', 'General Ledger'],
    ['/finance/accounts', 'Accounts'],
    ['/finance/budget', 'Budget'],
    ['/finance/payroll', 'Payroll'],
    ['/finance/assets', 'Assets'],
    ['/finance/reports', 'Reports'],
    ['/settings/finance', 'Finance Settings'],
    ['/finance/ap-reports', 'Accounts Payable'],
    ['/finance/budget-management', 'Budget Management'],
    ['/finance/customer-management', 'Accounts Receivable'],
    ['/finance/ar-reports', 'Accounts Receivable'],
    ['/finance/collection-followup', 'Accounts Receivable'],
    ['/finance/cost-centers', 'Cost Centers'],
    ['/finance/profit-centers', 'Profit Centers'],
    ['/finance/internal-orders', 'Internal Orders'],
    ['/finance/co-reports', 'CO Reports'],
    ['/finance/consolidation', 'Consolidation'],
    ['/finance/compliance', 'Compliance'],
    ['/finance/audit-logs', 'Audit Logs'],
    ['/finance/vendor-portal', 'Vendor Portal'],
    ['/finance/ifrs', 'IFRS Reports'],
    ['/finance/period-closing', 'Period Closing'],
    ['/finance/voucher-management', 'Voucher Management'],
];

export const getFinanceRouteTitle = (path: string): string => {
    const exact = financeRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'Finance Management';
};