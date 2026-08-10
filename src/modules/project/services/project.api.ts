import type { Project, ProjectTask } from '@/modules/project/types/project.types';

export const mockProjects: Project[] = [
  { id: 'pr1', code: 'PRJ-2401', name: 'HQ Fit-Out Phase 2', manager: 'Sara Bekele', client: 'BDA Internal', status: 'Active', progress: 62, budget: 850000, spent: 512000, startDate: '2026-03-01', endDate: '2026-11-30' },
  { id: 'pr2', code: 'PRJ-2407', name: 'ERP Rollout - Finance', manager: 'Daniel Tadesse', client: 'BDA Group', status: 'Active', progress: 44, budget: 420000, spent: 190000, startDate: '2026-05-15', endDate: '2026-12-15' },
  { id: 'pr3', code: 'PRJ-2412', name: 'Warehouse Automation', manager: 'Helen Girma', client: 'Logistics Co', status: 'Planning', progress: 18, budget: 610000, spent: 45000, startDate: '2026-08-01', endDate: '2027-02-28' },
  { id: 'pr4', code: 'PRJ-2355', name: 'Branch Network Upgrade', manager: 'Yonas Alemu', client: 'Retail Ops', status: 'Completed', progress: 100, budget: 275000, spent: 268000, startDate: '2025-09-01', endDate: '2026-04-30' },
];

export const mockTasks: ProjectTask[] = [
  { id: 't1', projectCode: 'PRJ-2401', title: 'Approve interior package', assignee: 'Sara Bekele', status: 'In Progress', priority: 'High', dueDate: '2026-08-15', estimateHours: 16 },
  { id: 't2', projectCode: 'PRJ-2407', title: 'Map chart of accounts', assignee: 'Daniel Tadesse', status: 'Done', priority: 'Critical', dueDate: '2026-08-05', estimateHours: 24 },
  { id: 't3', projectCode: 'PRJ-2407', title: 'UAT script for AP invoices', assignee: 'Marta Hailu', status: 'In Progress', priority: 'High', dueDate: '2026-08-20', estimateHours: 20 },
  { id: 't4', projectCode: 'PRJ-2412', title: 'Vendor shortlist for WMS', assignee: 'Helen Girma', status: 'Backlog', priority: 'Medium', dueDate: '2026-08-28', estimateHours: 12 },
  { id: 't5', projectCode: 'PRJ-2401', title: 'MEP coordination meeting', assignee: 'Abel Kebede', status: 'Blocked', priority: 'High', dueDate: '2026-08-12', estimateHours: 8 },
];

const delay = <T,>(data: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(data)), 200));

export const projectApi = {
  getProjects: () => delay(mockProjects),
  getTasks: () => delay(mockTasks),
};
