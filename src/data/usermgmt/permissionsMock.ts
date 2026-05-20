import type { MenuPerApiListDto } from '../../types/auth/MenuPerApi';

// ── Extended menu type with parent/child and icon ─────────────────────────────
export interface MenuNode {
  id: string;
  name: string;
  icon: string;           // lucide icon name as string
  isParent?: boolean;
  children?: MenuNode[];  // only on parent menus
}

export interface ModuleMenuTree {
  perModuleId: string;
  perModule: string;
  menus: MenuNode[];
}

// ── Module → Menu tree (with parent/child) ────────────────────────────────────
export const MOCK_MODULE_MENU_TREE: ModuleMenuTree[] = [
  {
    perModuleId: 'mod-hr',
    perModule: 'Human Resources',
    menus: [
      {
        id: 'menu-hr-emp', name: 'Employee Management', icon: 'Users', isParent: true,
        children: [
          { id: 'menu-hr-emp-list',   name: 'Employee List',   icon: 'List' },
          { id: 'menu-hr-emp-add',    name: 'Add Employee',    icon: 'UserPlus' },
          { id: 'menu-hr-emp-detail', name: 'Employee Detail', icon: 'UserCircle' },
          { id: 'menu-hr-emp-term',   name: 'Termination',     icon: 'UserMinus' },
        ],
      },
      {
        id: 'menu-hr-leave', name: 'Leave Management', icon: 'CalendarOff', isParent: true,
        children: [
          { id: 'menu-hr-leave-req',  name: 'Leave Requests',  icon: 'ClipboardList' },
          { id: 'menu-hr-leave-bal',  name: 'Leave Balance',   icon: 'BarChart2' },
          { id: 'menu-hr-leave-appr', name: 'Leave Approval',  icon: 'CheckSquare' },
        ],
      },
      { id: 'menu-hr-attend',   name: 'Attendance',   icon: 'Clock' },
      { id: 'menu-hr-payroll',  name: 'Payroll',      icon: 'DollarSign' },
      {
        id: 'menu-hr-recruit', name: 'Recruitment', icon: 'Briefcase', isParent: true,
        children: [
          { id: 'menu-hr-rec-jobs',  name: 'Job Postings',  icon: 'FileText' },
          { id: 'menu-hr-rec-apps',  name: 'Applicants',    icon: 'Users' },
          { id: 'menu-hr-rec-eval',  name: 'Evaluations',   icon: 'Star' },
          { id: 'menu-hr-rec-board', name: 'Onboarding',    icon: 'CheckCircle' },
        ],
      },
      { id: 'menu-hr-training', name: 'Training',     icon: 'BookOpen' },
    ],
  },
  {
    perModuleId: 'mod-finance',
    perModule: 'Finance',
    menus: [
      {
        id: 'menu-fin-gl', name: 'General Ledger', icon: 'BookOpen', isParent: true,
        children: [
          { id: 'menu-fin-gl-journal', name: 'Journal Entries', icon: 'FileText' },
          { id: 'menu-fin-gl-coa',     name: 'Chart of Accounts', icon: 'List' },
          { id: 'menu-fin-gl-trial',   name: 'Trial Balance',   icon: 'BarChart2' },
        ],
      },
      { id: 'menu-fin-ap',     name: 'Accounts Payable',   icon: 'ArrowDownCircle' },
      { id: 'menu-fin-ar',     name: 'Accounts Receivable', icon: 'ArrowUpCircle' },
      {
        id: 'menu-fin-budget', name: 'Budget', icon: 'PieChart', isParent: true,
        children: [
          { id: 'menu-fin-bud-plan',   name: 'Budget Plan',     icon: 'ClipboardList' },
          { id: 'menu-fin-bud-appr',   name: 'Budget Approval', icon: 'CheckSquare' },
          { id: 'menu-fin-bud-report', name: 'Budget Reports',  icon: 'BarChart2' },
        ],
      },
      { id: 'menu-fin-asset',  name: 'Asset Management',   icon: 'Package' },
    ],
  },
  {
    perModuleId: 'mod-core',
    perModule: 'Core',
    menus: [
      {
        id: 'menu-core-users', name: 'User Management', icon: 'Shield', isParent: true,
        children: [
          { id: 'menu-core-usr-accounts', name: 'Accounts',    icon: 'User' },
          { id: 'menu-core-usr-roles',    name: 'Roles',       icon: 'Lock' },
        ],
      },
      { id: 'menu-core-company', name: 'Company',     icon: 'Building2' },
      { id: 'menu-core-branch',  name: 'Branches',    icon: 'GitBranch' },
      { id: 'menu-core-dept',    name: 'Departments', icon: 'Layers' },
      { id: 'menu-core-fiscal',  name: 'Fiscal Year', icon: 'Calendar' },
      { id: 'menu-core-holiday', name: 'Holidays',    icon: 'Sun' },
    ],
  },
  {
    perModuleId: 'mod-crm',
    perModule: 'CRM',
    menus: [
      {
        id: 'menu-crm-leads', name: 'Lead Management', icon: 'Target', isParent: true,
        children: [
          { id: 'menu-crm-lead-gen',    name: 'Lead Generation', icon: 'Zap' },
          { id: 'menu-crm-lead-assign', name: 'Assigned Leads',  icon: 'UserCheck' },
          { id: 'menu-crm-lead-group',  name: 'Lead Grouping',   icon: 'Layers' },
        ],
      },
      { id: 'menu-crm-contacts',  name: 'Contacts',       icon: 'Contact' },
      { id: 'menu-crm-accounts',  name: 'Accounts',       icon: 'Building' },
      { id: 'menu-crm-pipeline',  name: 'Sales Pipeline', icon: 'TrendingUp' },
      { id: 'menu-crm-activity',  name: 'Activities',     icon: 'Activity' },
    ],
  },
  {
    perModuleId: 'mod-inventory',
    perModule: 'Inventory',
    menus: [
      { id: 'menu-inv-items',    name: 'Items',           icon: 'Package' },
      { id: 'menu-inv-stock',    name: 'Stock Management', icon: 'Archive' },
      { id: 'menu-inv-transfer', name: 'Stock Transfer',  icon: 'ArrowLeftRight' },
      { id: 'menu-inv-adjust',   name: 'Adjustments',     icon: 'SlidersHorizontal' },
    ],
  },
  {
    perModuleId: 'mod-file',
    perModule: 'File Management',
    menus: [
      {
        id: 'menu-file-company', name: 'Company Files', icon: 'FolderLock', isParent: true,
        children: [
          { id: 'menu-file-policies',  name: 'Policies',      icon: 'FileText' },
          { id: 'menu-file-reports',   name: 'Annual Reports', icon: 'BarChart2' },
          { id: 'menu-file-legal',     name: 'Legal',         icon: 'Scale' },
        ],
      },
      { id: 'menu-file-personal', name: 'Personal Files', icon: 'FolderOpen' },
      { id: 'menu-file-shared',   name: 'Shared Files',   icon: 'Share2' },
    ],
  },
];

// Flat list of all selectable (leaf) menu IDs — used for counting
export function getAllLeafMenuIds(tree: ModuleMenuTree[]): string[] {
  const ids: string[] = [];
  for (const mod of tree) {
    for (const menu of mod.menus) {
      if (menu.isParent && menu.children) {
        menu.children.forEach(c => ids.push(c.id));
      } else {
        ids.push(menu.id);
      }
    }
  }
  return ids;
}

// ── Access permissions grouped by menu (leaf menus only) ─────────────────────
export const MOCK_MENU_APIS: MenuPerApiListDto[] = [
  {
    perMenuId: 'menu-hr-emp-list',
    perMenu: 'Employee List',
    perApiList: [
      { id: 'api-hr-emp-view',   name: 'View Employee List' },
      { id: 'api-hr-emp-export', name: 'Export Employees' },
      { id: 'api-hr-emp-search', name: 'Search Employees' },
    ],
  },
  {
    perMenuId: 'menu-hr-emp-add',
    perMenu: 'Add Employee',
    perApiList: [
      { id: 'api-hr-emp-create', name: 'Create Employee' },
      { id: 'api-hr-emp-edit',   name: 'Edit Employee' },
      { id: 'api-hr-emp-delete', name: 'Delete Employee' },
    ],
  },
  {
    perMenuId: 'menu-hr-leave-req',
    perMenu: 'Leave Requests',
    perApiList: [
      { id: 'api-hr-leave-view',   name: 'View Leave Requests' },
      { id: 'api-hr-leave-create', name: 'Create Leave Request' },
      { id: 'api-hr-leave-cancel', name: 'Cancel Leave Request' },
    ],
  },
  {
    perMenuId: 'menu-hr-leave-appr',
    perMenu: 'Leave Approval',
    perApiList: [
      { id: 'api-hr-leave-approve', name: 'Approve Leave' },
      { id: 'api-hr-leave-reject',  name: 'Reject Leave' },
    ],
  },
  {
    perMenuId: 'menu-hr-attend',
    perMenu: 'Attendance',
    perApiList: [
      { id: 'api-hr-att-view',   name: 'View Attendance' },
      { id: 'api-hr-att-edit',   name: 'Edit Attendance' },
      { id: 'api-hr-att-report', name: 'Attendance Report' },
    ],
  },
  {
    perMenuId: 'menu-hr-payroll',
    perMenu: 'Payroll',
    perApiList: [
      { id: 'api-hr-pay-view',    name: 'View Payroll' },
      { id: 'api-hr-pay-run',     name: 'Run Payroll' },
      { id: 'api-hr-pay-approve', name: 'Approve Payroll' },
      { id: 'api-hr-pay-export',  name: 'Export Payroll' },
    ],
  },
  {
    perMenuId: 'menu-hr-rec-jobs',
    perMenu: 'Job Postings',
    perApiList: [
      { id: 'api-hr-rec-view',   name: 'View Job Postings' },
      { id: 'api-hr-rec-create', name: 'Create Job Posting' },
      { id: 'api-hr-rec-edit',   name: 'Edit Job Posting' },
      { id: 'api-hr-rec-delete', name: 'Delete Job Posting' },
    ],
  },
  {
    perMenuId: 'menu-fin-gl-journal',
    perMenu: 'Journal Entries',
    perApiList: [
      { id: 'api-fin-gl-view',    name: 'View Journal Entries' },
      { id: 'api-fin-gl-create',  name: 'Create Journal Entry' },
      { id: 'api-fin-gl-post',    name: 'Post Journal Entry' },
      { id: 'api-fin-gl-reverse', name: 'Reverse Entry' },
    ],
  },
  {
    perMenuId: 'menu-fin-bud-plan',
    perMenu: 'Budget Plan',
    perApiList: [
      { id: 'api-fin-bud-view',   name: 'View Budget' },
      { id: 'api-fin-bud-create', name: 'Create Budget' },
      { id: 'api-fin-bud-edit',   name: 'Edit Budget' },
    ],
  },
  {
    perMenuId: 'menu-fin-bud-appr',
    perMenu: 'Budget Approval',
    perApiList: [
      { id: 'api-fin-bud-approve', name: 'Approve Budget' },
      { id: 'api-fin-bud-reject',  name: 'Reject Budget' },
    ],
  },
  {
    perMenuId: 'menu-core-usr-accounts',
    perMenu: 'Accounts',
    perApiList: [
      { id: 'api-core-usr-view',   name: 'View Users' },
      { id: 'api-core-usr-create', name: 'Create Account' },
      { id: 'api-core-usr-edit',   name: 'Edit Account' },
      { id: 'api-core-usr-delete', name: 'Delete Account' },
    ],
  },
  {
    perMenuId: 'menu-core-company',
    perMenu: 'Company',
    perApiList: [
      { id: 'api-core-comp-view', name: 'View Company' },
      { id: 'api-core-comp-edit', name: 'Edit Company' },
    ],
  },
  {
    perMenuId: 'menu-crm-lead-gen',
    perMenu: 'Lead Generation',
    perApiList: [
      { id: 'api-crm-lead-view',   name: 'View Leads' },
      { id: 'api-crm-lead-create', name: 'Create Lead' },
      { id: 'api-crm-lead-edit',   name: 'Edit Lead' },
      { id: 'api-crm-lead-delete', name: 'Delete Lead' },
      { id: 'api-crm-lead-assign', name: 'Assign Lead' },
    ],
  },
  {
    perMenuId: 'menu-crm-contacts',
    perMenu: 'Contacts',
    perApiList: [
      { id: 'api-crm-con-view',   name: 'View Contacts' },
      { id: 'api-crm-con-create', name: 'Create Contact' },
      { id: 'api-crm-con-edit',   name: 'Edit Contact' },
      { id: 'api-crm-con-delete', name: 'Delete Contact' },
    ],
  },
  {
    perMenuId: 'menu-file-policies',
    perMenu: 'Policies',
    perApiList: [
      { id: 'api-file-pol-view',     name: 'View Policies' },
      { id: 'api-file-pol-download', name: 'Download Policy' },
      { id: 'api-file-pol-print',    name: 'Print Policy' },
    ],
  },
  {
    perMenuId: 'menu-file-personal',
    perMenu: 'Personal Files',
    perApiList: [
      { id: 'api-file-per-view',   name: 'View Personal Files' },
      { id: 'api-file-per-upload', name: 'Upload File' },
      { id: 'api-file-per-delete', name: 'Delete File' },
    ],
  },
];

// Also export a flat ModPerMenuListDto-compatible list for the access step grouping
export const MOCK_MODULE_MENUS = MOCK_MODULE_MENU_TREE.map(mod => ({
  perModuleId: mod.perModuleId,
  perModule:   mod.perModule,
  perMenuList: mod.menus.flatMap(m =>
    m.isParent && m.children ? m.children.map(c => ({ id: c.id, name: c.name })) : [{ id: m.id, name: m.name }]
  ),
}));
