// src/routes/index.ts

import { hrRoutes, hrSidebarRoutes, getHrRouteTitle } from './hr.routes';
import { coreRoutes, coreSidebarRoutes, getCoreRouteTitle } from './core.routes';
import { coreAdminRoutes, coreAdminSidebarRoutes } from './core-admin.routes';
import { financeRoutes, financeSidebarRoutes, getFinanceRouteTitle } from './finance.routes';
import { crmRoutes, crmSidebarRoutes, getCrmRouteTitle } from './crm.routes';
import { inventoryRoutes, inventorySidebarRoutes, getInventoryRouteTitle } from './inventory.routes';
import { procurementRoutes, procurementSidebarRoutes, getProcurementRouteTitle } from './procurement.routes';
import { fileRoutes, fileSidebarRoutes, getFileRouteTitle } from './file.routes';
import { plandevRoutes, plandevSidebarRoutes, getPlandevRouteTitle } from './plandev.routes';
import { projectRoutes, projectSidebarRoutes, getProjectRouteTitle } from './project.routes';
import type { AppRoute, SidebarNavSection } from './types';

export type { AppRoute, SidebarNavSection };

export const allRoutes: AppRoute[] = [
    ...hrRoutes,
    ...coreRoutes,
    ...coreAdminRoutes,
    ...financeRoutes,
    ...crmRoutes,
    ...inventoryRoutes,
    ...procurementRoutes,
    ...fileRoutes,
    ...plandevRoutes,
    ...projectRoutes,
];

export const allSidebarRoutes: SidebarNavSection[] = [
    ...hrSidebarRoutes,
    ...coreSidebarRoutes,
    ...coreAdminSidebarRoutes,
    ...financeSidebarRoutes,
    ...crmSidebarRoutes,
    ...inventorySidebarRoutes,
    ...procurementSidebarRoutes,
    ...fileSidebarRoutes,
    ...plandevSidebarRoutes,
    ...projectSidebarRoutes,
];

export const getRouteTitle = (path: string): string => {
    const hrTitle = getHrRouteTitle(path);
    if (hrTitle !== 'HR Management') return hrTitle;

    const coreTitle = getCoreRouteTitle(path);
    if (coreTitle !== 'Core Management') return coreTitle;

    const adminRoute = coreAdminRoutes.find((route) => route.href === path);
    if (adminRoute) return adminRoute.title;

    const financeTitle = getFinanceRouteTitle(path);
    if (financeTitle !== 'Finance Management') return financeTitle;

    const crmTitle = getCrmRouteTitle(path);
    if (crmTitle !== 'CRM Management') return crmTitle;

    const inventoryTitle = getInventoryRouteTitle(path);
    if (inventoryTitle !== 'Inventory Management') return inventoryTitle;

    const procurementTitle = getProcurementRouteTitle(path);
    if (procurementTitle !== 'Procurement Management') return procurementTitle;

    const fileTitle = getFileRouteTitle(path);
    if (fileTitle !== 'File Management') return fileTitle;

    const plandevTitle = getPlandevRouteTitle(path);
    if (plandevTitle !== 'Plan & Development') return plandevTitle;

    const projectTitle = getProjectRouteTitle(path);
    if (projectTitle !== 'Project Management') return projectTitle;

    return 'Dashboard';
};

export { hrRoutes, hrSidebarRoutes, getHrRouteTitle };
export { coreRoutes, coreSidebarRoutes, getCoreRouteTitle };
export { coreAdminRoutes, coreAdminSidebarRoutes };
export { financeRoutes, financeSidebarRoutes, getFinanceRouteTitle };
export { crmRoutes, crmSidebarRoutes, getCrmRouteTitle };
export { inventoryRoutes, inventorySidebarRoutes, getInventoryRouteTitle };
export { procurementRoutes, procurementSidebarRoutes, getProcurementRouteTitle };
export { fileRoutes, fileSidebarRoutes, getFileRouteTitle };
export { plandevRoutes, plandevSidebarRoutes, getPlandevRouteTitle };
export { projectRoutes, projectSidebarRoutes, getProjectRouteTitle };