// src/routes/procurement.routes.tsx

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    LayoutDashboard,
    ShoppingCart,
    Truck,
    FileText,
    Users,
    BarChart3,
    Settings,
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

// Procurement Pages
const ProcurementDashboard = lazy(() => import('@/modules/procurement/pages/ModuleDashboard'));

// Requisitions
const RequisitionList = lazy(() => import('@/modules/procurement/pages/requisitions/RequisitionList'));
const CreateRequisition = lazy(() => import('@/modules/procurement/pages/requisitions/CreateRequisition'));
const RequisitionApproval = lazy(() => import('@/modules/procurement/pages/requisitions/RequisitionApproval'));

// Vendors
const VendorList = lazy(() => import('@/modules/procurement/pages/vendors/VendorList'));
const VendorEvaluation = lazy(() => import('@/modules/procurement/pages/vendors/VendorEvaluation'));
const VendorContracts = lazy(() => import('@/modules/procurement/pages/vendors/VendorContracts'));

// Purchase Orders
const PurchaseOrderList = lazy(() => import('@/modules/procurement/pages/po/PurchaseOrderList'));
const CreatePurchaseOrder = lazy(() => import('@/modules/procurement/pages/po/CreatePurchaseOrder'));
const EditPurchaseOrder = lazy(() => import('@/modules/procurement/pages/po/EditPurchaseOrder')); // ✅ ADD THIS
const ReceivePurchaseOrder = lazy(() => import('@/modules/procurement/pages/po/ReceivePurchaseOrder')); // ✅ ADD THIS
const POApproval = lazy(() => import('@/modules/procurement/pages/po/POApproval'));
const POTracking = lazy(() => import('@/modules/procurement/pages/po/POTracking'));

// Receiving
const GRNList = lazy(() => import('@/modules/procurement/pages/receiving/GRNList'));
const CreateGRN = lazy(() => import('@/modules/procurement/pages/receiving/CreateGRN'));


// Invoices
const InvoiceList = lazy(() => import('@/modules/procurement/pages/invoices/InvoiceList'));
const InvoiceVerification = lazy(() => import('@/modules/procurement/pages/invoices/InvoiceVerification'));
const PaymentProcessing = lazy(() => import('@/modules/procurement/pages/invoices/PaymentProcessing'));

// Analytics
const SpendAnalysis = lazy(() => import('@/modules/procurement/pages/analytics/SpendAnalysis'));
const VendorPerformance = lazy(() => import('@/modules/procurement/pages/analytics/VendorPerformance'));
const ProcurementReports = lazy(() => import('@/modules/procurement/pages/reports/ProcurementReports'));

const GRNDetail = lazy(() => import('@/modules/procurement/pages/receiving/GRNDetail'));
const QualityInspection = lazy(() => import('@/modules/procurement/pages/receiving/QualityInspection'));
const PerformInspection = lazy(() => import('@/modules/procurement/pages/receiving/PerformInspection'));

const InvoiceDetail = lazy(() => import('@/modules/procurement/pages/invoices/InvoiceDetail'));
const CreateInvoice = lazy(() => import('@/modules/procurement/pages/invoices/CreateInvoice'));
const EditInvoice = lazy(() => import('@/modules/procurement/pages/invoices/EditInvoice'));
const MakePayment = lazy(() => import('@/modules/procurement/pages/invoices/MakePayment'));


const VendorDetail = lazy(() => import('@/modules/procurement/pages/vendors/VendorDetail'));
const CreateVendor = lazy(() => import('@/modules/procurement/pages/vendors/CreateVendor'));
const EditVendor = lazy(() => import('@/modules/procurement/pages/vendors/EditVendor'));


const EvaluationDetail = lazy(() => import('@/modules/procurement/pages/vendors/EvaluationDetail'));
const CreateEvaluation = lazy(() => import('@/modules/procurement/pages/vendors/CreateEvaluation'));



const ReportDetail = lazy(() => import('@/modules/procurement/pages/reports/ReportDetail'));
const GenerateReport = lazy(() => import('@/modules/procurement/pages/reports/GenerateReport'));

const CreateContract = lazy(() => import('@/modules/procurement/pages/vendors/CreateContract'));
const ContractDetail = lazy(() => import('@/modules/procurement/pages/vendors/ContractDetail'));
export const procurementRoutes: AppRoute[] = [
    // Dashboard
    {
        path: 'procurement',
        href: '/procurement',
        title: 'Procurement Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(ProcurementDashboard),
        nav: true,
        index: true,
    },
    // Requisitions
    {

        path: '/procurement/receipt/:id',
        href: 'procurement/receiving/GRNDetail',
        title: 'GRNDetail',
        icon: FileText,
        element: withSuspense(GRNDetail),
        nav: true,
    },

    {

        path: '/procurement/reports/:id',
        href: 'procurement/receiving/ReportDetail',
        title: 'ReportDetail',
        icon: FileText,
        element: withSuspense(ReportDetail),
        nav: true,
    },
    {

        path: '/procurement/reports/generate',
        href: 'procurement/receiving/GenerateReport',
        title: 'GenerateReport',
        icon: FileText,
        element: withSuspense(GenerateReport),
        nav: true,
    },


    {

        path: '/procurement/vendors/contracts/create',
        href: 'procurement/vendors/CreateContract ',
        title: 'CreateContract ',
        icon: FileText,
        element: withSuspense(CreateContract ),
        nav: true,
    },

    {

        path: '/procurement/vendors/contracts/:id',
        href: 'procurement/vendors/ContractDetail  ',
        title: 'ContractDetail  ',
        icon: FileText,
        element: withSuspense(ContractDetail  ),
        nav: true,
    },

    {

        path: '/procurement/vendors/evaluation/:id',
        href: 'procurement/vendors/EvaluationDetail',
        title: 'EvaluationDetail ',
        icon: FileText,
        element: withSuspense(EvaluationDetail ),
        nav: true,
    },

    {

        path: '/procurement/vendors/evaluation/create',
        href: 'procurement/vendors/CreateEvaluation',
        title: 'CreateEvaluation  ',
        icon: FileText,
        element: withSuspense(CreateEvaluation  ),
        nav: true,
    },


    {

        path: '/procurement/vendors/:id',
        href: 'procurement/vendors/VendorDetail ',
        title: 'VendorDetail ',
        icon: FileText,
        element: withSuspense(VendorDetail ),
        nav: true,
    },

    {

        path: '/procurement/vendors/create',
        href: 'procurement/vendors/CreateVendor  ',
        title: 'CreateVendor  ',
        icon: FileText,
        element: withSuspense(CreateVendor  ),
        nav: true,
    },

    {

        path: '/procurement/vendors/:id/edit',
        href: 'procurement/vendors/EditVendor   ',
        title: 'EditVendor   ',
        icon: FileText,
        element: withSuspense(EditVendor   ),
        nav: true,
    },


    {

        path: '/procurement/payment/create',
        href: 'procurement/invoices/MakePayment',
        title: 'MakePayment',
        icon: FileText,
        element: withSuspense(MakePayment),
        nav: true,
    },

    {

        path: '/procurement/invoice/:id',
        href: 'procurement/invoice/InvoiceDetail',
        title: 'InvoiceDetail',
        icon: FileText,
        element: withSuspense(InvoiceDetail),
        nav: true,
    },

    {

        path: '/procurement/invoice/create',
        href: 'procurement/invoice/CreateInvoice',
        title: 'CreateInvoice',
        icon: FileText,
        element: withSuspense(CreateInvoice),
        nav: true,
    },

    {

        path: '/procurement/invoice/:id/edit',
        href: 'procurement/invoice/EditInvoice ',
        title: 'EditInvoice ',
        icon: FileText,
        element: withSuspense(EditInvoice ),
        nav: true,
    },








    {

        path: '/procurement/inspection',
        href: 'procurement/receiving/QualityInspection',
        title: 'QualityInspection',
        icon: FileText,
        element: withSuspense(QualityInspection),
        nav: true,
    },

    {

        path: '/procurement/inspection/:id/perform',
        href: 'procurement/receiving/PerformInspection',
        title: 'PerformInspection',
        icon: FileText,
        element: withSuspense(PerformInspection),
        nav: true,
    },
    {
        path: 'procurement/requisitions',
        href: '/procurement/requisitions',
        title: 'Requisitions',
        icon: FileText,
        element: withSuspense(RequisitionList),
        nav: true,
    },
    {
        path: 'procurement/requisitions/create',
        href: '/procurement/requisitions/create',
        title: 'Create Requisition',
        icon: FileText,
        element: withSuspense(CreateRequisition),
        nav: false,
    },
    {
        path: 'procurement/requisitions/approval',
        href: '/procurement/requisitions/approval',
        title: 'Requisition Approval',
        icon: FileText,
        element: withSuspense(RequisitionApproval),
        nav: false,
    },
    // Vendors
    {
        path: 'procurement/vendors',
        href: '/procurement/vendors',
        title: 'Vendors',
        icon: Users,
        element: withSuspense(VendorList),
        nav: true,
    },
    {
        path: 'procurement/vendor-evaluation',
        href: '/procurement/vendor-evaluation',
        title: 'Vendor Evaluation',
        icon: Users,
        element: withSuspense(VendorEvaluation),
        nav: false,
    },
    {
        path: 'procurement/vendor-contracts',
        href: '/procurement/vendor-contracts',
        title: 'Vendor Contracts',
        icon: Users,
        element: withSuspense(VendorContracts),
        nav: false,
    },
    // Purchase Orders
    {
        path: 'procurement/po',
        href: '/procurement/po',
        title: 'Purchase Orders',
        icon: ShoppingCart,
        element: withSuspense(PurchaseOrderList),
        nav: true,
    },
    {
        path: 'procurement/po/create',
        href: '/procurement/po/create',
        title: 'Create Purchase Order',
        icon: ShoppingCart,
        element: withSuspense(CreatePurchaseOrder),
        nav: false,
    },
    // ✅ ADD THIS - Edit Purchase Order
    {
        path: 'procurement/po/:id/edit',
        href: '/procurement/po/:id/edit',
        title: 'Edit Purchase Order',
        icon: ShoppingCart,
        element: withSuspense(EditPurchaseOrder),
        nav: false,
    },

    {
        path: 'procurement/requisitions/:id',
        href: '/procurement/requisitions/:id',
        title: 'Requisition Details',
        icon: FileText,
        element: withSuspense(lazy(() => import('@/modules/procurement/pages/requisitions/RequisitionDetail'))),
        nav: false,
    },
// Requisition Edit
    {
        path: 'procurement/requisitions/:id/edit',
        href: '/procurement/requisitions/:id/edit',
        title: 'Edit Requisition',
        icon: FileText,
        element: withSuspense(lazy(() => import('@/modules/procurement/pages/requisitions/EditRequisition'))),
        nav: false,
    },
    // ✅ ADD THIS - Receive Purchase Order
    {
        path: 'procurement/po/:id/receive',
        href: '/procurement/po/:id/receive',
        title: 'Receive Purchase Order',
        icon: Truck,
        element: withSuspense(ReceivePurchaseOrder),
        nav: false,
    },
    {
        path: 'procurement/po/approval',
        href: '/procurement/po/approval',
        title: 'PO Approval',
        icon: ShoppingCart,
        element: withSuspense(POApproval),
        nav: false,
    },
    {
        path: 'procurement/po/tracking',
        href: '/procurement/po/tracking',
        title: 'PO Tracking',
        icon: ShoppingCart,
        element: withSuspense(POTracking),
        nav: false,
    },
    // Receiving
    {
        path: 'procurement/receipt',
        href: '/procurement/receipt',
        title: 'Goods Receipt',
        icon: Truck,
        element: withSuspense(GRNList),
        nav: true,
    },
    {
        path: 'procurement/receipt/create',
        href: '/procurement/receipt/create',
        title: 'Create GRN',
        icon: Truck,
        element: withSuspense(CreateGRN),
        nav: false,
    },
    {
        path: 'procurement/inspection',
        href: '/procurement/inspection',
        title: 'Quality Inspection',
        icon: Truck,
        element: withSuspense(QualityInspection),
        nav: false,
    },
    // Invoices
    {
        path: 'procurement/invoice',
        href: '/procurement/invoice',
        title: 'Invoices',
        icon: FileText,
        element: withSuspense(InvoiceList),
        nav: true,
    },
    {
        path: 'procurement/invoice/verify',
        href: '/procurement/invoice/verify',
        title: 'Invoice Verification',
        icon: FileText,
        element: withSuspense(InvoiceVerification),
        nav: false,
    },
    {
        path: 'procurement/invoice/payment',
        href: '/procurement/invoice/payment',
        title: 'Payment Processing',
        icon: FileText,
        element: withSuspense(PaymentProcessing),
        nav: false,
    },
    // Analytics
    {
        path: 'procurement/analytics/spend',
        href: '/procurement/analytics/spend',
        title: 'Spend Analysis',
        icon: BarChart3,
        element: withSuspense(SpendAnalysis),
        nav: false,
    },
    {
        path: 'procurement/analytics/vendor',
        href: '/procurement/analytics/vendor',
        title: 'Vendor Performance',
        icon: BarChart3,
        element: withSuspense(VendorPerformance),
        nav: false,
    },
    {
        path: 'procurement/reports',
        href: '/procurement/reports',
        title: 'Procurement Reports',
        icon: BarChart3,
        element: withSuspense(ProcurementReports),
        nav: false,
    },
];

export const procurementSidebarRoutes: SidebarNavSection[] = [
    {
        id: 'proc-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'Procurement Dashboard', href: '/procurement', activeMatch: 'exact' },
        ],
    },
    {
        id: 'proc-requisitions',
        title: 'Requisitions',
        icon: FileText,
        items: [
            { title: 'Requisitions', href: '/procurement/requisitions', activeMatch: 'prefix' },
            { title: 'Create Requisition', href: '/procurement/requisitions/create', activeMatch: 'prefix' },
            { title: 'Requisition Approval', href: '/procurement/requisitions/approval', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'proc-vendors',
        title: 'Vendors',
        icon: Users,
        items: [
            { title: 'Vendors', href: '/procurement/vendors', activeMatch: 'prefix' },
            { title: 'Vendor Evaluation', href: '/procurement/vendor-evaluation', activeMatch: 'prefix' },
            { title: 'Vendor Contracts', href: '/procurement/vendor-contracts', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'proc-po',
        title: 'Purchase Orders',
        icon: ShoppingCart,
        items: [
            { title: 'Purchase Orders', href: '/procurement/po', activeMatch: 'prefix' },
            { title: 'Create Purchase Order', href: '/procurement/po/create', activeMatch: 'prefix' },
            { title: 'PO Approval', href: '/procurement/po/approval', activeMatch: 'prefix' },
            { title: 'PO Tracking', href: '/procurement/po/tracking', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'proc-receiving',
        title: 'Receiving',
        icon: Truck,
        items: [
            { title: 'Goods Receipt', href: '/procurement/receipt', activeMatch: 'prefix' },
            { title: 'Create GRN', href: '/procurement/receipt/create', activeMatch: 'prefix' },
            { title: 'Quality Inspection', href: '/procurement/inspection', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'proc-invoices',
        title: 'Invoices',
        icon: FileText,
        items: [
            { title: 'Invoices', href: '/procurement/invoice', activeMatch: 'prefix' },
            { title: 'Invoice Verification', href: '/procurement/invoice/verify', activeMatch: 'prefix' },
            { title: 'Payment Processing', href: '/procurement/invoice/payment', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'proc-analytics',
        title: 'Analytics',
        icon: BarChart3,
        items: [
            { title: 'Spend Analysis', href: '/procurement/analytics/spend', activeMatch: 'prefix' },
            { title: 'Vendor Performance', href: '/procurement/analytics/vendor', activeMatch: 'prefix' },
            { title: 'Procurement Reports', href: '/procurement/reports', activeMatch: 'prefix' },
        ],
    },
];

const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/procurement/requisitions', 'Requisitions'],
    ['/procurement/vendors', 'Vendors'],
    ['/procurement/po', 'Purchase Orders'],
    ['/procurement/receipt', 'Goods Receipt'],
    ['/procurement/invoice', 'Invoices'],
    ['/procurement/analytics', 'Analytics'],
    ['/procurement/reports', 'Reports'],
];

export const getProcurementRouteTitle = (path: string): string => {
    const exact = procurementRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'Procurement Management';
};