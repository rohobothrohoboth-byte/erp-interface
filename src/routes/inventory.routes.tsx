// src/routes/inventory.routes.tsx

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import {
    LayoutDashboard,
    Package,
    Warehouse,
    BarChart3,
    Boxes,
    ArrowRightLeft,
    SlidersHorizontal,
    RefreshCcw,
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

// Inventory Pages
const InventoryDashboard = lazy(() => import('@/modules/inventory/pages/ModuleDashboard'));

export const inventoryRoutes: AppRoute[] = [
    // Dashboard
    {
        path: 'inventory',
        href: '/inventory',
        title: 'Inventory Dashboard',
        icon: LayoutDashboard,
        element: withSuspense(InventoryDashboard),
        nav: true,
        index: true,
    },
    // Products
    {
        path: 'inventory/products',
        href: '/inventory/products',
        title: 'Products',
        icon: Package,
        element: withSuspense(() => import('@/modules/inventory/pages/products/ProductList')),
        nav: true,
    },
    {
        path: 'inventory/categories',
        href: '/inventory/categories',
        title: 'Categories',
        icon: Boxes,
        element: withSuspense(() => import('@/modules/inventory/pages/categories/CategoriesPage')),
        nav: false,
    },
    {
        path: 'inventory/units',
        href: '/inventory/units',
        title: 'Units of Measure',
        icon: Package,
        element: withSuspense(() => import('@/modules/inventory/pages/units/UnitsPage')),
        nav: false,
    },
    {
        path: 'inventory/barcodes',
        href: '/inventory/barcodes',
        title: 'Barcode Management',
        icon: Package,
        element: withSuspense(() => import('@/modules/inventory/pages/barcodes/BarcodePage')),
        nav: false,
    },
    // Stock Management
    {
        path: 'inventory/stock-in',
        href: '/inventory/stock-in',
        title: 'Stock In',
        icon: Package,
        element: withSuspense(() => import('@/modules/inventory/pages/stock/StockInPage')),
        nav: true,
    },
    {
        path: 'inventory/stock-out',
        href: '/inventory/stock-out',
        title: 'Stock Out',
        icon: Package,
        element: withSuspense(() => import('@/modules/inventory/pages/stock/StockOutPage')),
        nav: false,
    },
    {
        path: 'inventory/stock-transfer',
        href: '/inventory/stock-transfer',
        title: 'Stock Transfer',
        icon: ArrowRightLeft,
        element: withSuspense(() => import('@/modules/inventory/pages/stock/StockTransferPage')),
        nav: false,
    },
    {
        path: 'inventory/stock-adjustment',
        href: '/inventory/stock-adjustment',
        title: 'Stock Adjustment',
        icon: SlidersHorizontal,
        element: withSuspense(() => import('@/modules/inventory/pages/stock/StockAdjustmentPage')),
        nav: false,
    },
    {
        path: 'inventory/stock-count',
        href: '/inventory/stock-count',
        title: 'Stock Count',
        icon: RefreshCcw,
        element: withSuspense(() => import('@/modules/inventory/pages/stock/StockCountPage')),
        nav: false,
    },
    // Warehouse
    {
        path: 'inventory/warehouses',
        href: '/inventory/warehouses',
        title: 'Warehouses',
        icon: Warehouse,
        element: withSuspense(() => import('@/modules/inventory/pages/warehouse/WarehousePage')),
        nav: true,
    },
    {
        path: 'inventory/warehouse-zones',
        href: '/inventory/warehouse-zones',
        title: 'Zones & Bins',
        icon: Warehouse,
        element: withSuspense(() => import('@/modules/inventory/pages/warehouse/WarehouseZonesPage')),
        nav: false,
    },
    {
        path: 'inventory/warehouse-layout',
        href: '/inventory/warehouse-layout',
        title: 'Warehouse Layout',
        icon: Warehouse,
        element: withSuspense(() => import('@/modules/inventory/pages/warehouse/WarehouseLayoutPage')),
        nav: false,
    },
    // Reports
    {
        path: 'inventory/valuation-methods',
        href: '/inventory/valuation-methods',
        title: 'Valuation Methods',
        icon: BarChart3,
        element: withSuspense(() => import('@/modules/inventory/pages/reports/ValuationMethodsPage')),
        nav: false,
    },
    {
        path: 'inventory/valuation-report',
        href: '/inventory/valuation-report',
        title: 'Valuation Report',
        icon: BarChart3,
        element: withSuspense(() => import('@/modules/inventory/pages/reports/ValuationReportPage')),
        nav: false,
    },
    {
        path: 'inventory/reorder-levels',
        href: '/inventory/reorder-levels',
        title: 'Reorder Levels',
        icon: BarChart3,
        element: withSuspense(() => import('@/modules/inventory/pages/reports/ReorderLevelsPage')),
        nav: false,
    },
    {
        path: 'inventory/reorder-requests',
        href: '/inventory/reorder-requests',
        title: 'Reorder Requests',
        icon: BarChart3,
        element: withSuspense(() => import('@/modules/inventory/pages/reports/ReorderRequestsPage')),
        nav: false,
    },
    {
        path: 'inventory/stock-reports',
        href: '/inventory/stock-reports',
        title: 'Stock Reports',
        icon: BarChart3,
        element: withSuspense(() => import('@/modules/inventory/pages/reports/StockReportsPage')),
        nav: false,
    },
    {
        path: 'inventory/movement-reports',
        href: '/inventory/movement-reports',
        title: 'Movement Reports',
        icon: BarChart3,
        element: withSuspense(() => import('@/modules/inventory/pages/reports/MovementReportsPage')),
        nav: false,
    },
    {
        path: 'inventory/forecast',
        href: '/inventory/forecast',
        title: 'Demand Forecast',
        icon: BarChart3,
        element: withSuspense(() => import('@/modules/inventory/pages/reports/DemandForecastPage')),
        nav: false,
    },
];

export const inventorySidebarRoutes: SidebarNavSection[] = [
    {
        id: 'inv-dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'Inventory Dashboard', href: '/inventory', activeMatch: 'exact' },
        ],
    },
    {
        id: 'inv-products',
        title: 'Products',
        icon: Package,
        items: [
            { title: 'Products', href: '/inventory/products', activeMatch: 'prefix' },
            { title: 'Categories', href: '/inventory/categories', activeMatch: 'prefix' },
            { title: 'Units', href: '/inventory/units', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'inv-stock',
        title: 'Stock Management',
        icon: Package,
        items: [
            { title: 'Stock In', href: '/inventory/stock-in', activeMatch: 'prefix' },
            { title: 'Stock Out', href: '/inventory/stock-out', activeMatch: 'prefix' },
            { title: 'Stock Transfer', href: '/inventory/stock-transfer', activeMatch: 'prefix' },
            { title: 'Stock Adjustment', href: '/inventory/stock-adjustment', activeMatch: 'prefix' },
            { title: 'Stock Count', href: '/inventory/stock-count', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'inv-warehouse',
        title: 'Warehouse',
        icon: Warehouse,
        items: [
            { title: 'Warehouses', href: '/inventory/warehouses', activeMatch: 'prefix' },
            { title: 'Zones & Bins', href: '/inventory/warehouse-zones', activeMatch: 'prefix' },
        ],
    },
    {
        id: 'inv-reports',
        title: 'Reports',
        icon: BarChart3,
        items: [
            { title: 'Stock Reports', href: '/inventory/stock-reports', activeMatch: 'prefix' },
            { title: 'Valuation Report', href: '/inventory/valuation-report', activeMatch: 'prefix' },
            { title: 'Reorder Levels', href: '/inventory/reorder-levels', activeMatch: 'prefix' },
        ],
    },
];

const ROUTE_TITLE_BY_PREFIX: [string, string][] = [
    ['/inventory/products', 'Products'],
    ['/inventory/stock', 'Stock'],
    ['/inventory/warehouse', 'Warehouse'],
    ['/inventory/valuation', 'Valuation'],
    ['/inventory/report', 'Report'],
];

export const getInventoryRouteTitle = (path: string): string => {
    const exact = inventoryRoutes.find((route) => route.href === path);
    if (exact) return exact.title;

    for (const [prefix, title] of ROUTE_TITLE_BY_PREFIX) {
        if (path.startsWith(prefix)) return title;
    }

    return 'Inventory Management';
};