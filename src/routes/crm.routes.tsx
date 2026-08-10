// src/routes/crm.routes.tsx

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    LayoutDashboard,
    Users,
    Mail,
    Phone,
    Calendar,
    BarChart3,
    MessageSquare,
    Settings,
    CheckCircle,
    UserPlus,
    Building2,
    FileText,
    TrendingUp,DollarSign,
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

// ============================================================
// CRM PAGES
// ============================================================

// Dashboard
const CRMDashboard = lazy(() => import('@/modules/crm/pages/ModuleDashboard'));

// ============================================================
// LEAD MANAGEMENT PAGES
// ============================================================
const LeadManagementPage = lazy(() => import('@/modules/crm/pages/leadManagement/LeadManagementPage'));
const AddLeadPage = lazy(() => import('@/modules/crm/pages/leadManagement/AddLeadPage'));
const EditLeadPage = lazy(() => import('@/modules/crm/pages/leadManagement/EditLeadPage'));
const LeadDetailPage = lazy(() => import('@/modules/crm/pages/leadManagement/LeadDetailPage'));
const LeadGenerationPage = lazy(() => import('@/modules/crm/pages/leadManagement/LeadGenerationPage'));
const LeadRoutingPage = lazy(() => import('@/modules/crm/pages/leadManagement/LeadRoutingPage'));
const LeadGroupingPage = lazy(() => import('@/modules/crm/pages/leadManagement/LeadGroupingPage'));
const LeadConversion = lazy(() => import('@/modules/crm/pages/leadManagement/LeadConversion'));
const LeadBulkAction = lazy(() => import('@/modules/crm/pages/leadManagement/LeadBulkAction'));
const ImportLeadPage = lazy(() => import('@/modules/crm/pages/leadManagement/ImportLeadPage'));
const AssignedLeadsPage = lazy(() => import('@/modules/crm/pages/leadManagement/AssignedLeadsPage'));
const LeadQualificationPage = lazy(() => import('@/modules/crm/pages/leadManagement/LeadQualificationPage'));
const CompaniesPage = lazy(() => import('@/modules/crm/pages/contactManagement/CompaniesPage'));
const InteractionsPage = lazy(() => import('@/modules/crm/pages/contactManagement/InteractionsPage'));

// ============================================================
// CONTACT MANAGEMENT
// ============================================================
const ContactManagementPage = lazy(() => import('@/modules/crm/pages/contactManagement/ContactManagementPage'));
const AddContactPage = lazy(() => import('@/modules/crm/pages/contactManagement/AddContactPage'));
const EditContactPage = lazy(() => import('@/modules/crm/pages/contactManagement/EditContactPage'));
const ContactDetailPage = lazy(() => import('@/modules/crm/pages/contactManagement/ContactDetailPage'));
const AssignedContactsPage = lazy(() => import('@/modules/crm/pages/contactManagement/AssignedContactsPage'));
const ContactGroupingPage = lazy(() => import('@/modules/crm/pages/contactManagement/ContactGroupingPage'));

// ============================================================
// SALES MANAGEMENT
// ============================================================
const SalesManagement = lazy(() => import('@/modules/crm/pages/salesManagement/SalesManagement'));
const OpportunitiesPage = lazy(() => import('@/modules/crm/pages/salesManagement/OpportunitiesPage'));
const OpportunityCreatePage = lazy(() => import('@/modules/crm/pages/salesManagement/OpportunityCreatePage'));
const OpportunityDetailPage = lazy(() => import('@/modules/crm/pages/salesManagement/OpportunityDetailPage'));
const QuotationsPage = lazy(() => import('@/modules/crm/pages/salesManagement/QuotationsPage'));
const QuotationCreatePage = lazy(() => import('@/modules/crm/pages/salesManagement/QuotationCreatePage'));
const QuotationDetailPage = lazy(() => import('@/modules/crm/pages/salesManagement/QuotationDetailPage'));
const OrdersPage = lazy(() => import('@/modules/crm/pages/salesManagement/OrdersPage'));
const OrderCreatePage = lazy(() => import('@/modules/crm/pages/salesManagement/OrderCreatePage'));
const OrderDetailPage = lazy(() => import('@/modules/crm/pages/salesManagement/OrderDetailPage'));
const ContractsPage = lazy(() => import('@/modules/crm/pages/salesManagement/ContractsPage'));
const ContractCreatePage = lazy(() => import('@/modules/crm/pages/salesManagement/ContractCreatePage'));
const ContractDetailPage = lazy(() => import('@/modules/crm/pages/salesManagement/ContractDetailPage'));
const SalesForecastPage = lazy(() => import('@/modules/crm/pages/salesManagement/SalesForecastPage'));

// ============================================================
// MARKETING - STATIC ROUTES FIRST
// ============================================================
const MarketingAutomation = lazy(() => import('@/modules/crm/pages/marketingAutomation/MarketingAutomation'));
const CampaignsPage = lazy(() => import('@/modules/crm/pages/marketingAutomation/CampaignsPage'));
const EmailCampaignsPage = lazy(() => import('@/modules/crm/pages/marketingAutomation/EmailCampaignsPage'));
const SMSCampaignsPage = lazy(() => import('@/modules/crm/pages/marketingAutomation/SMSCampaignsPage'));
const SocialMediaPage = lazy(() => import('@/modules/crm/pages/marketingAutomation/SocialMediaPage'));
const AddCampaignPage = lazy(() => import('@/modules/crm/pages/marketingAutomation/AddCampaignPage'));
const EditCampaignPage = lazy(() => import('@/modules/crm/pages/marketingAutomation/EditCampaignPage'));
const CampaignDetailPage = lazy(() => import('@/modules/crm/pages/marketingAutomation/CampaignDetailPage'));
const CampaignAnalyticsPage = lazy(() => import('@/modules/crm/pages/marketingAutomation/CampaignAnalyticsPage'));

// ============================================================
// CUSTOMER SUPPORT
// ============================================================
const CustomerSupport = lazy(() => import('@/modules/crm/pages/customerService/CustomerService'));
const TicketsPage = lazy(() => import('@/modules/crm/pages/customerService/TicketsPage'));

// ============================================================
// ACTIVITIES
// ============================================================
const ActivityManagement = lazy(() => import('@/modules/crm/pages/activityManagement/ActivityManagement'));
const CalendarPage = lazy(() => import('@/modules/crm/pages/activityManagement/CalendarPage'));

// ============================================================
// ANALYTICS
// ============================================================
const AnalyticsReporting = lazy(() => import('@/modules/crm/pages/analytics/AnalyticsReporting'));

// ============================================================
// SETTINGS
// ============================================================
const PageCrmSettings = lazy(() => import('@/modules/settings/pages/crmSettings/PageCrmSettings'));
const PageLeadSources = lazy(() => import('@/modules/settings/pages/crmSettings/pageLeadSources'));
const PageLeadStatuses = lazy(() => import('@/modules/settings/pages/crmSettings/pageLeadStatuses'));
const PageIndustries = lazy(() => import('@/modules/settings/pages/crmSettings/pageIndustries'));
const PageRoutingRules = lazy(() => import('@/modules/settings/pages/crmSettings/pageRoutingRules'));
const PageLeadScoring = lazy(() => import('@/modules/settings/pages/crmSettings/pageLeadScoring'));
const PageEmailTemplates = lazy(() => import('@/modules/settings/pages/crmSettings/pageEmailTemplates'));


const PropertiesPage = lazy(() => import('@/modules/crm/pages/realEstate/PropertiesPage'));
const TransactionsPage = lazy(() => import('@/modules/crm/pages/realEstate/TransactionsPage'));
const CommissionsPage = lazy(() => import('@/modules/crm/pages/realEstate/CommissionsPage'));
// ============================================================
// CRM ROUTES
// ============================================================

export const crmRoutes: AppRoute[] = [
    // ============================================================
    // DASHBOARD
    // ============================================================
    {
        path: 'crm',
        href: '/crm',
        title: 'CRM Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(CRMDashboard),
        nav: true,
        index: true,
    },
    {
        path: 'crm/companies',
        href: '/crm/companies',
        title: 'Companies',
        icon: Building2,
        element: withSuspense(CompaniesPage),
        nav: false,
    },
    {
        path: 'crm/interactions',
        href: '/crm/interactions',
        title: 'Interactions',
        icon: MessageSquare,
        element: withSuspense(InteractionsPage),
        nav: false,
    },
    {
        path: 'crm/companies/:id',
        href: '/crm/companies/:id',
        title: 'Company Details',
        icon: Building2,
        element: withSuspense(CompaniesPage),
        nav: false,
    },
    {
        path: 'crm/interactions/:id',
        href: '/crm/interactions/:id',
        title: 'Interaction Details',
        icon: MessageSquare,
        element: withSuspense(InteractionsPage),
        nav: false,
    },

    // ============================================================
    // LEAD MANAGEMENT
    // ============================================================
    {
        path: 'crm/leads',
        href: '/crm/leads',
        title: 'Lead Management',
        icon: Users,
        element: withSuspense(LeadManagementPage),
        nav: true,
    },
    {
        path: 'crm/leads/add',
        href: '/crm/leads/add',
        title: 'Add Lead',
        icon: Users,
        element: withSuspense(AddLeadPage),
        nav: false,
    },
    {
        path: 'crm/leads/assigned',
        href: '/crm/leads/assigned',
        title: 'Assigned Leads',
        icon: Users,
        element: withSuspense(AssignedLeadsPage),
        nav: true,
    },
    {
        path: 'crm/leads/bulk-action',
        href: '/crm/leads/bulk-action',
        title: 'Bulk Actions',
        icon: Users,
        element: withSuspense(LeadBulkAction),
        nav: false,
    },
    {
        path: 'crm/leads/conversion',
        href: '/crm/leads/conversion',
        title: 'Lead Conversion',
        icon: UserPlus,
        element: withSuspense(LeadConversion),
        nav: true,
    },
    {
        path: 'crm/leads/generation',
        href: '/crm/leads/generation',
        title: 'Lead Generation',
        icon: Users,
        element: withSuspense(LeadGenerationPage),
        nav: true,
    },
    {
        path: 'crm/leads/grouping',
        href: '/crm/leads/grouping',
        title: 'Lead Grouping',
        icon: Users,
        element: withSuspense(LeadGroupingPage),
        nav: false,
    },
    {
        path: 'crm/leads/import',
        href: '/crm/leads/import',
        title: 'Import Leads',
        icon: Users,
        element: withSuspense(ImportLeadPage),
        nav: false,
    },
    {
        path: 'crm/leads/qualification',
        href: '/crm/leads/qualification',
        title: 'Lead Qualification',
        icon: CheckCircle,
        element: withSuspense(LeadQualificationPage),
        nav: true,
    },
    {
        path: 'crm/leads/routing',
        href: '/crm/leads/routing',
        title: 'Lead Routing',
        icon: Users,
        element: withSuspense(LeadRoutingPage),
        nav: false,
    },
    {
        path: 'crm/leads/edit/:id',
        href: '/crm/leads/edit/:id',
        title: 'Edit Lead',
        icon: Users,
        element: withSuspense(EditLeadPage),
        nav: false,
    },
    {
        path: 'crm/leads/:id/convert',
        href: '/crm/leads/:id/convert',
        title: 'Convert Lead',
        icon: Users,
        element: withSuspense(LeadConversion),
        nav: false,
    },
    {
        path: 'crm/leads/:id',
        href: '/crm/leads/:id',
        title: 'Lead Detail',
        icon: Users,
        element: withSuspense(LeadDetailPage),
        nav: false,
    },

    // ============================================================
    // CONTACT MANAGEMENT
    // ============================================================
    {
        path: 'crm/contacts',
        href: '/crm/contacts',
        title: 'Contact Management',
        icon: Mail,
        element: withSuspense(ContactManagementPage),
        nav: true,
    },
    {
        path: 'crm/contacts/add',
        href: '/crm/contacts/add',
        title: 'Add Contact',
        icon: UserPlus,
        element: withSuspense(AddContactPage),
        nav: false,
    },
    {
        path: 'crm/contacts/assigned',
        href: '/crm/contacts/assigned',
        title: 'Assigned Contacts',
        icon: Mail,
        element: withSuspense(AssignedContactsPage),
        nav: false,
    },
    {
        path: 'crm/contacts/grouping',
        href: '/crm/contacts/grouping',
        title: 'Contact Grouping',
        icon: Users,
        element: withSuspense(ContactGroupingPage),
        nav: false,
    },
    {
        path: 'crm/contacts/edit/:id',
        href: '/crm/contacts/edit/:id',
        title: 'Edit Contact',
        icon: Mail,
        element: withSuspense(EditContactPage),
        nav: false,
    },
    {
        path: 'crm/contacts/:id',
        href: '/crm/contacts/:id',
        title: 'Contact Detail',
        icon: Mail,
        element: withSuspense(ContactDetailPage),
        nav: false,
    },

    // ============================================================
    // SALES MANAGEMENT
    // ============================================================
    {
        path: 'crm/sales',
        href: '/crm/sales',
        title: 'Sales Management',
        icon: BarChart3,
        element: withSuspense(SalesManagement),
        nav: true,
    },
    {
        path: 'crm/sales/opportunities',
        href: '/crm/sales/opportunities',
        title: 'Opportunities',
        icon: BarChart3,
        element: withSuspense(OpportunitiesPage),
        nav: false,
    },
    {
        path: 'crm/sales/opportunities/add',
        href: '/crm/sales/opportunities/add',
        title: 'Add Opportunity',
        icon: BarChart3,
        element: withSuspense(OpportunityCreatePage),
        nav: false,
    },
    {
        path: 'crm/sales/opportunities/:id',
        href: '/crm/sales/opportunities/:id',
        title: 'Opportunity Details',
        icon: BarChart3,
        element: withSuspense(OpportunityDetailPage),
        nav: false,
    },
    {
        path: 'crm/sales/quotes',
        href: '/crm/sales/quotes',
        title: 'Quotes',
        icon: FileText,
        element: withSuspense(QuotationsPage),
        nav: false,
    },
    {
        path: 'crm/sales/quotes/add',
        href: '/crm/sales/quotes/add',
        title: 'Create Quote',
        icon: FileText,
        element: withSuspense(QuotationCreatePage),
        nav: false,
    },
    {
        path: 'crm/sales/orders',
        href: '/crm/sales/orders',
        title: 'Orders',
        icon: BarChart3,
        element: withSuspense(OrdersPage),
        nav: false,
    },
    {
        path: 'crm/sales/orders/add',
        href: '/crm/sales/orders/add',
        title: 'Create Order',
        icon: BarChart3,
        element: withSuspense(OrderCreatePage),
        nav: false,
    },
    {
        path: 'crm/sales/contracts',
        href: '/crm/sales/contracts',
        title: 'Contracts',
        icon: FileText,
        element: withSuspense(ContractsPage),
        nav: false,
    },
    {
        path: 'crm/sales/contracts/add',
        href: '/crm/sales/contracts/add',
        title: 'Create Contract',
        icon: FileText,
        element: withSuspense(ContractCreatePage),
        nav: false,
    },
    {
        path: 'crm/realestate/properties',
        href: '/crm/realestate/properties',
        title: 'Properties',
        icon: Building2,
        element: withSuspense(PropertiesPage),
        nav: false,
    },
    {
        path: 'crm/realestate/transactions',
        href: '/crm/realestate/transactions',
        title: 'Transactions',
        icon: FileText,
        element: withSuspense(TransactionsPage),
        nav: false,
    },
    {
        path: 'crm/realestate/commissions',
        href: '/crm/realestate/commissions',
        title: 'Commissions',
        icon: DollarSign,
        element: withSuspense(CommissionsPage),
        nav: false,
    },
    {
        path: 'crm/sales/forecast',
        href: '/crm/sales/forecast',
        title: 'Sales Forecast',
        icon: TrendingUp,
        element: withSuspense(SalesForecastPage),
        nav: false,
    },
    {
        path: 'crm/sales/quotes/edit/:id',
        href: '/crm/sales/quotes/edit/:id',
        title: 'Edit Quote',
        icon: FileText,
        element: withSuspense(QuotationDetailPage),
        nav: false,
    },
    {
        path: 'crm/sales/orders/edit/:id',
        href: '/crm/sales/orders/edit/:id',
        title: 'Edit Order',
        icon: BarChart3,
        element: withSuspense(OrderDetailPage),
        nav: false,
    },
    {
        path: 'crm/sales/contracts/edit/:id',
        href: '/crm/sales/contracts/edit/:id',
        title: 'Edit Contract',
        icon: FileText,
        element: withSuspense(ContractDetailPage),
        nav: false,
    },
    {
        path: 'crm/sales/quotes/:id',
        href: '/crm/sales/quotes/:id',
        title: 'Quote Details',
        icon: FileText,
        element: withSuspense(QuotationDetailPage),
        nav: false,
    },
    {
        path: 'crm/sales/orders/:id',
        href: '/crm/sales/orders/:id',
        title: 'Order Details',
        icon: BarChart3,
        element: withSuspense(OrderDetailPage),
        nav: false,
    },
    {
        path: 'crm/sales/contracts/:id',
        href: '/crm/sales/contracts/:id',
        title: 'Contract Details',
        icon: FileText,
        element: withSuspense(ContractDetailPage),
        nav: false,
    },

    // ============================================================
    // MARKETING
    // ============================================================
    {
        path: 'crm/marketing',
        href: '/crm/marketing',
        title: 'Marketing Automation',
        icon: MessageSquare,
        element: withSuspense(MarketingAutomation),
        nav: true,
    },
    // ✅ STATIC ROUTES - All exact paths first
    {
        path: 'crm/campaigns',
        href: '/crm/campaigns',
        title: 'All Campaigns',
        icon: MessageSquare,
        element: withSuspense(CampaignsPage),
        nav: false,
    },
    {
        path: 'crm/campaigns/add',
        href: '/crm/campaigns/add',
        title: 'Add Campaign',
        icon: MessageSquare,
        element: withSuspense(AddCampaignPage),
        nav: false,
    },
    // ✅ EMAIL CAMPAIGN ROUTES
    {
        path: '/crm/email-marketing',
        href: '/crm/email-marketing',
        title: 'Email Campaigns',
        icon: Mail,
        element: withSuspense(EmailCampaignsPage),
        nav: false,
    },
    {
        path: 'crm/campaigns/email/add',
        href: '/crm/campaigns/email/add',
        title: 'Add Email Campaign',
        icon: Mail,
        element: withSuspense(AddCampaignPage),
        nav: false,
    },
    {
        path: 'crm/campaigns/email/:id',
        href: '/crm/campaigns/email/:id',
        title: 'Email Campaign Details',
        icon: Mail,
        element: withSuspense(CampaignDetailPage),
        nav: false,
    },
    // ✅ SMS CAMPAIGN ROUTES
    {
        path: 'crm/campaigns/sms',
        href: '/crm/campaigns/sms',
        title: 'SMS Campaigns',
        icon: MessageSquare,
        element: withSuspense(SMSCampaignsPage),
        nav: false,
    },
    {
        path: 'crm/campaigns/sms/add',
        href: '/crm/campaigns/sms/add',
        title: 'Add SMS Campaign',
        icon: MessageSquare,
        element: withSuspense(AddCampaignPage),
        nav: false,
    },
    {
        path: 'crm/campaigns/sms/:id',
        href: '/crm/campaigns/sms/:id',
        title: 'SMS Campaign Details',
        icon: MessageSquare,
        element: withSuspense(CampaignDetailPage),
        nav: false,
    },
    // ✅ SOCIAL MEDIA ROUTES
    {
        path: '/crm/social-media',
        href: '/crm/social-media',
        title: 'Social Media',
        icon: MessageSquare,
        element: withSuspense(SocialMediaPage),
        nav: false,
    },
    {
        path: 'crm/social/add',
        href: '/crm/social/add',
        title: 'Add Social Post',
        icon: MessageSquare,
        element: withSuspense(AddCampaignPage),
        nav: false,
    },
    {
        path: 'crm/social/:id',
        href: '/crm/social/:id',
        title: 'Social Post Details',
        icon: MessageSquare,
        element: withSuspense(CampaignDetailPage),
        nav: false,
    },
    // ✅ EDIT ROUTES - Static edit paths
    {
        path: 'crm/campaigns/edit/:id',
        href: '/crm/campaigns/edit/:id',
        title: 'Edit Campaign',
        icon: MessageSquare,
        element: withSuspense(EditCampaignPage),
        nav: false,
    },
    // ✅ DYNAMIC ROUTES - All parameterized routes LAST
    {
        path: 'crm/campaigns/:id',
        href: '/crm/campaigns/:id',
        title: 'Campaign Details',
        icon: MessageSquare,
        element: withSuspense(CampaignDetailPage),
        nav: false,
    },
    {
        path: 'crm/campaigns/:id/analytics',
        href: '/crm/campaigns/:id/analytics',
        title: 'Campaign Analytics',
        icon: BarChart3,
        element: withSuspense(CampaignAnalyticsPage),
        nav: false,
    },

    // ============================================================
    // CUSTOMER SUPPORT
    // ============================================================
    {
        path: 'crm/support',
        href: '/crm/support',
        title: 'Customer Support',
        icon: Phone,
        element: withSuspense(CustomerSupport),
        nav: true,
    },
    {
        path: 'crm/support/tickets',
        href: '/crm/support/tickets',
        title: 'Tickets',
        icon: Phone,
        element: withSuspense(TicketsPage),
        nav: false,
    },

    // ============================================================
    // ACTIVITIES
    // ============================================================
    {
        path: 'crm/activities',
        href: '/crm/activities',
        title: 'Activity Management',
        icon: Calendar,
        element: withSuspense(ActivityManagement),
        nav: true,
    },
    {
        path: 'crm/activities/calendar',
        href: '/crm/activities/calendar',
        title: 'Calendar',
        icon: Calendar,
        element: withSuspense(CalendarPage),
        nav: false,
    },

    // ============================================================
    // ANALYTICS
    // ============================================================
    {
        path: 'crm/analytics',
        href: '/crm/analytics',
        title: 'Analytics & Reporting',
        icon: BarChart3,
        element: withSuspense(AnalyticsReporting),
        nav: true,
    },

    // ============================================================
    // SETTINGS
    // ============================================================
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
        path: 'settings/crm/email-templates',
        href: '/settings/crm/email-templates',
        title: 'Email Templates',
        icon: Settings,
        element: withSuspense(PageEmailTemplates),
        nav: false,
    },
];

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

export const crmSidebarRoutes: SidebarNavSection[] = [
    {
        id: 'crm-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'CRM Dashboard', href: '/crm', activeMatch: 'exact' },
        ],
    },
    {
        id: 'crm-leads',
        title: 'Lead Management',
        icon: Users,
        items: [
            { title: 'All Leads', href: '/crm/leads', activeMatch: 'prefix' },
            { title: 'Lead Qualification', href: '/crm/leads/qualification', activeMatch: 'prefix' },
            { title: 'Lead Conversion', href: '/crm/leads/conversion', activeMatch: 'prefix' },
            { title: 'Lead Generation', href: '/crm/leads/generation', activeMatch: 'prefix' },
            { title: 'Assigned Leads', href: '/crm/leads/assigned', activeMatch: 'prefix' },
            { title: 'Lead Routing', href: '/crm/leads/routing', activeMatch: 'prefix' },
            { title: 'Bulk Actions', href: '/crm/leads/bulk-action', activeMatch: 'prefix' },
            { title: 'Import Leads', href: '/crm/leads/import', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'crm-contacts',
        title: 'Contact Management',
        icon: Mail,
        items: [
            { title: 'All Contacts', href: '/crm/contacts', activeMatch: 'prefix' },
            { title: 'Assigned Contacts', href: '/crm/contacts/assigned', activeMatch: 'prefix' },
            { title: 'Contact Grouping', href: '/crm/contacts/grouping', activeMatch: 'prefix' },
            { title: 'Companies', href: '/crm/companies', activeMatch: 'prefix' },
            { title: 'Interactions', href: '/crm/interactions', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'crm-sales',
        title: 'Sales',
        icon: BarChart3,
        items: [
            { title: 'Sales Dashboard', href: '/crm/sales', activeMatch: 'exact' },
            { title: 'Opportunities', href: '/crm/sales/opportunities', activeMatch: 'prefix' },
            { title: 'Quotes', href: '/crm/sales/quotes', activeMatch: 'prefix' },
            { title: 'Orders', href: '/crm/sales/orders', activeMatch: 'prefix' },
            { title: 'Contracts', href: '/crm/sales/contracts', activeMatch: 'prefix' },
            { title: 'Properties', href: '/crm/realestate/properties', activeMatch: 'prefix' },
            { title: 'Transactions', href: '/crm/realestate/transactions', activeMatch: 'prefix' },
            { title: 'Commissions', href: '/crm/realestate/commissions', activeMatch: 'prefix' },
            { title: 'Sales Forecast', href: '/crm/sales/forecast', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'crm-marketing',
        title: 'Marketing',
        icon: MessageSquare,
        items: [
            { title: 'Marketing Dashboard', href: '/crm/marketing', activeMatch: 'prefix' },
            { title: 'All Campaigns', href: '/crm/campaigns', activeMatch: 'prefix' },
            { title: 'Email Campaigns', href: '/crm/email-marketing', activeMatch: 'prefix' },
            { title: 'SMS Campaigns', href: '/crm/campaigns/sms', activeMatch: 'prefix' },
            { title: 'Social Media', href: '/crm/social-media', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'crm-support',
        title: 'Support',
        icon: Phone,
        items: [
            { title: 'Support Dashboard', href: '/crm/support', activeMatch: 'prefix' },
            { title: 'Tickets', href: '/crm/support/tickets', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'crm-activities',
        title: 'Activities',
        icon: Calendar,
        items: [
            { title: 'Activities', href: '/crm/activities', activeMatch: 'prefix' },
            { title: 'Calendar', href: '/crm/activities/calendar', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'crm-analytics',
        title: 'Analytics',
        icon: BarChart3,
        items: [
            { title: 'Analytics & Reports', href: '/crm/analytics', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'crm-settings',
        title: 'Settings',
        icon: Settings,
        items: [
            { title: 'CRM Settings', href: '/settings/crm', activeMatch: 'prefix' },
            { title: 'Lead Sources', href: '/settings/crm/lead-sources', activeMatch: 'prefix' },
            { title: 'Lead Statuses', href: '/settings/crm/lead-statuses', activeMatch: 'prefix' },
            { title: 'Routing Rules', href: '/settings/crm/routing-rules', activeMatch: 'prefix' },
            { title: 'Lead Scoring', href: '/settings/crm/lead-scoring', activeMatch: 'prefix' },
            { title: 'Email Templates', href: '/settings/crm/email-templates', activeMatch: 'prefix' },
        ],
    },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/crm/leads', 'Lead Management'],
    ['/crm/contacts', 'Contact Management'],
    ['/crm/sales', 'Sales'],
    ['/crm/marketing', 'Marketing'],
    ['/crm/campaigns', 'Campaigns'],
    ['/crm/support', 'Support'],
    ['/crm/activities', 'Activities'],
    ['/crm/analytics', 'Analytics'],
    ['/settings/crm', 'CRM Settings'],
];

export const getCrmRouteTitle = (path: string): string => {
    const exact = crmRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'CRM Management';
};