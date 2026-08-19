// data/usermgmt/permissionsMock.ts

export interface MenuNode {
  id: string;
  name: string;
  icon: string;
  isParent?: boolean;
  children?: MenuNode[];
}

export interface ModuleMenuTree {
  perModuleId: string;
  perModule: string;
  menus: MenuNode[];
}

export const MOCK_MODULE_MENU_TREE: ModuleMenuTree[] = [
  // ============ HR Management Module ============
  {
    perModuleId: 'mod-hr',
    perModule: 'HR Management',
    menus: [
      {
        id: 'menu-hr-emp',
        name: 'Employee Management',
        icon: 'Users',
        isParent: true,
        children: [
          { id: 'menu-hr-emp-list', name: 'Employee List', icon: 'List' },
          { id: 'menu-hr-emp-add', name: 'Add Employee', icon: 'UserPlus' },
          { id: 'menu-hr-emp-detail', name: 'Employee Detail', icon: 'UserCircle' },
          { id: 'menu-hr-emp-term', name: 'Termination', icon: 'UserMinus' },
        ],
      },
      {
        id: 'menu-hr-leave',
        name: 'Leave Management',
        icon: 'CalendarOff',
        isParent: true,
        children: [
          { id: 'menu-hr-leave-req', name: 'Leave Requests', icon: 'ClipboardList' },
          { id: 'menu-hr-leave-bal', name: 'Leave Balance', icon: 'BarChart2' },
          { id: 'menu-hr-leave-appr', name: 'Leave Approval', icon: 'CheckSquare' },
        ],
      },
      { id: 'menu-hr-attend', name: 'Attendance', icon: 'Clock' },
      { id: 'menu-hr-payroll', name: 'Payroll', icon: 'DollarSign' },
      {
        id: 'menu-hr-recruit',
        name: 'Recruitment',
        icon: 'Briefcase',
        isParent: true,
        children: [
          { id: 'menu-hr-rec-jobs', name: 'Job Postings', icon: 'FileText' },
          { id: 'menu-hr-rec-apps', name: 'Applicants', icon: 'Users' },
          { id: 'menu-hr-rec-eval', name: 'Evaluations', icon: 'Star' },
          { id: 'menu-hr-rec-board', name: 'Onboarding', icon: 'CheckCircle' },
        ],
      },
      { id: 'menu-hr-training', name: 'Training', icon: 'BookOpen' },
    ],
  },

  // ============ Procurement Module ============
  {
    perModuleId: 'mod-procurement',
    perModule: 'Procurement',
    menus: [
      {
        id: 'menu-proc-req',
        name: 'Requisitions',
        icon: 'FileText',
        isParent: true,
        children: [
          { id: 'menu-proc-req-list', name: 'Requisition List', icon: 'List' },
          { id: 'menu-proc-req-create', name: 'Create Requisition', icon: 'Plus' },
          { id: 'menu-proc-req-approve', name: 'Approve Requisition', icon: 'CheckSquare' },
        ],
      },
      {
        id: 'menu-proc-po',
        name: 'Purchase Orders',
        icon: 'ShoppingCart',
        isParent: true,
        children: [
          { id: 'menu-proc-po-list', name: 'Purchase Order List', icon: 'List' },
          { id: 'menu-proc-po-create', name: 'Create Purchase Order', icon: 'Plus' },
          { id: 'menu-proc-po-approve', name: 'Approve Purchase Order', icon: 'CheckCircle' },
        ],
      },
      {
        id: 'menu-proc-vendor',
        name: 'Vendor Management',
        icon: 'Building',
        isParent: true,
        children: [
          { id: 'menu-proc-vendor-list', name: 'Vendor List', icon: 'List' },
          { id: 'menu-proc-vendor-add', name: 'Add Vendor', icon: 'UserPlus' },
        ],
      },
      {
        id: 'menu-proc-goods',
        name: 'Goods Receipt',
        icon: 'Package',
        isParent: true,
        children: [
          { id: 'menu-proc-goods-list', name: 'Goods Receipt List', icon: 'List' },
          { id: 'menu-proc-goods-create', name: 'Create Receipt', icon: 'Plus' },
        ],
      },
    ],
  },

  // ============ Finance Module ============
  {
    perModuleId: 'mod-finance',
    perModule: 'Finance',
    menus: [
      {
        id: 'menu-fin-gl',
        name: 'General Ledger',
        icon: 'BookOpen',
        isParent: true,
        children: [
          { id: 'menu-fin-gl-journal', name: 'Journal Entries', icon: 'FileText' },
          { id: 'menu-fin-gl-coa', name: 'Chart of Accounts', icon: 'List' },
          { id: 'menu-fin-gl-trial', name: 'Trial Balance', icon: 'BarChart2' },
        ],
      },
      { id: 'menu-fin-ap', name: 'Accounts Payable', icon: 'ArrowDownCircle' },
      { id: 'menu-fin-ar', name: 'Accounts Receivable', icon: 'ArrowUpCircle' },
      {
        id: 'menu-fin-budget',
        name: 'Budget',
        icon: 'PieChart',
        isParent: true,
        children: [
          { id: 'menu-fin-bud-plan', name: 'Budget Plan', icon: 'ClipboardList' },
          { id: 'menu-fin-bud-appr', name: 'Budget Approval', icon: 'CheckSquare' },
          { id: 'menu-fin-bud-report', name: 'Budget Reports', icon: 'BarChart2' },
        ],
      },
      { id: 'menu-fin-asset', name: 'Asset Management', icon: 'Package' },
    ],
  },

  // ============ CRM Module ============
  {
    perModuleId: 'mod-crm',
    perModule: 'CRM',
    menus: [
      {
        id: 'menu-crm-leads',
        name: 'Lead Management',
        icon: 'Target',
        isParent: true,
        children: [
          { id: 'menu-crm-lead-gen', name: 'Lead Generation', icon: 'Zap' },
          { id: 'menu-crm-lead-assign', name: 'Assigned Leads', icon: 'UserCheck' },
          { id: 'menu-crm-lead-group', name: 'Lead Grouping', icon: 'Layers' },
        ],
      },
      { id: 'menu-crm-contacts', name: 'Contacts', icon: 'Contact' },
      { id: 'menu-crm-accounts', name: 'Accounts', icon: 'Building' },
      { id: 'menu-crm-pipeline', name: 'Sales Pipeline', icon: 'TrendingUp' },
      { id: 'menu-crm-activity', name: 'Activities', icon: 'Activity' },
    ],
  },

  // ============ Inventory Module ============
  {
    perModuleId: 'mod-inventory',
    perModule: 'Inventory',
    menus: [
      { id: 'menu-inv-items', name: 'Items', icon: 'Package' },
      { id: 'menu-inv-stock', name: 'Stock Management', icon: 'Archive' },
      { id: 'menu-inv-transfer', name: 'Stock Transfer', icon: 'ArrowLeftRight' },
      { id: 'menu-inv-adjust', name: 'Adjustments', icon: 'SlidersHorizontal' },
      { id: 'menu-inv-warehouse', name: 'Warehouses', icon: 'Building2' },
    ],
  },

  // ============ File Management Module ============
  {
    perModuleId: 'mod-file',
    perModule: 'File Management',
    menus: [
      {
        id: 'menu-file-company',
        name: 'Company Files',
        icon: 'FolderLock',
        isParent: true,
        children: [
          { id: 'menu-file-policies', name: 'Policies', icon: 'FileText' },
          { id: 'menu-file-reports', name: 'Annual Reports', icon: 'BarChart2' },
          { id: 'menu-file-legal', name: 'Legal', icon: 'Scale' },
        ],
      },
      { id: 'menu-file-personal', name: 'Personal Files', icon: 'FolderOpen' },
      { id: 'menu-file-shared', name: 'Shared Files', icon: 'Share2' },
    ],
  },

  // ============ Core Module ============
  {
    perModuleId: 'mod-core',
    perModule: 'Core',
    menus: [
      {
        id: 'menu-core-users',
        name: 'User Management',
        icon: 'Shield',
        isParent: true,
        children: [
          { id: 'menu-core-usr-accounts', name: 'Accounts', icon: 'User' },
          { id: 'menu-core-usr-roles', name: 'Roles', icon: 'Lock' },
        ],
      },
      { id: 'menu-core-company', name: 'Company', icon: 'Building2' },
      { id: 'menu-core-branch', name: 'Branches', icon: 'GitBranch' },
      { id: 'menu-core-dept', name: 'Departments', icon: 'Layers' },
      { id: 'menu-core-fiscal', name: 'Fiscal Year', icon: 'Calendar' },
    ],
  },

  // ============ Project Management Module ============
  {
    perModuleId: 'mod-project',
    perModule: 'Project Management',
    menus: [
      {
        id: 'menu-prj-projects',
        name: 'Projects',
        icon: 'Briefcase',
        isParent: true,
        children: [
          { id: 'menu-prj-projects-list', name: 'All Projects', icon: 'List' },
          { id: 'menu-prj-projects-add', name: 'New Project', icon: 'Plus' },
          { id: 'menu-prj-projects-my', name: 'My Projects', icon: 'User' },
        ],
      },
      {
        id: 'menu-prj-tasks',
        name: 'Tasks',
        icon: 'ClipboardList',
        isParent: true,
        children: [
          { id: 'menu-prj-tasks-my', name: 'My Tasks', icon: 'User' },
          { id: 'menu-prj-tasks-all', name: 'All Tasks', icon: 'List' },
          { id: 'menu-prj-tasks-board', name: 'Task Board', icon: 'LayoutDashboard' },
        ],
      },
      {
        id: 'menu-prj-milestones',
        name: 'Milestones',
        icon: 'Flag',
        isParent: true,
        children: [
          { id: 'menu-prj-milestones-upcoming', name: 'Upcoming Milestones', icon: 'Calendar' },
          { id: 'menu-prj-milestones-completed', name: 'Completed Milestones', icon: 'CheckCircle' },
        ],
      },
      {
        id: 'menu-prj-team',
        name: 'Team',
        icon: 'Users',
        isParent: true,
        children: [
          { id: 'menu-prj-team-members', name: 'Team Members', icon: 'Users' },
          { id: 'menu-prj-team-assign', name: 'Assign Members', icon: 'UserPlus' },
        ],
      },
      {
        id: 'menu-prj-reports',
        name: 'Reports',
        icon: 'BarChart2',
        isParent: true,
        children: [
          { id: 'menu-prj-reports-progress', name: 'Progress Report', icon: 'TrendingUp' },
          { id: 'menu-prj-reports-resource', name: 'Resource Report', icon: 'PieChart' },
        ],
      },
    ],
  },

  // ============ Plan & Development Module ============
  {
    perModuleId: 'mod-plan',
    perModule: 'Plan & Development',
    menus: [
      {
        id: 'menu-plan-strategic',
        name: 'Strategic Plans',
        icon: 'Target',
        isParent: true,
        children: [
          { id: 'menu-plan-strategic-list', name: 'Plan List', icon: 'List' },
          { id: 'menu-plan-strategic-add', name: 'New Plan', icon: 'Plus' },
          { id: 'menu-plan-strategic-view', name: 'Plan Details', icon: 'Eye' },
        ],
      },
      {
        id: 'menu-plan-initiatives',
        name: 'Initiatives',
        icon: 'Flag',
        isParent: true,
        children: [
          { id: 'menu-plan-initiatives-active', name: 'Active Initiatives', icon: 'Play' },
          { id: 'menu-plan-initiatives-review', name: 'Under Review', icon: 'Eye' },
          { id: 'menu-plan-initiatives-completed', name: 'Completed', icon: 'CheckCircle' },
        ],
      },
      {
        id: 'menu-plan-kpis',
        name: 'KPIs',
        icon: 'BarChart2',
        isParent: true,
        children: [
          { id: 'menu-plan-kpis-dashboard', name: 'KPI Dashboard', icon: 'LayoutDashboard' },
          { id: 'menu-plan-kpis-settings', name: 'KPI Settings', icon: 'Settings' },
        ],
      },
      {
        id: 'menu-plan-calendar',
        name: 'Planning Calendar',
        icon: 'Calendar',
        isParent: true,
        children: [
          { id: 'menu-plan-calendar-view', name: 'Calendar View', icon: 'Calendar' },
          { id: 'menu-plan-calendar-events', name: 'Events', icon: 'Clock' },
        ],
      },
      {
        id: 'menu-plan-reports',
        name: 'Reports',
        icon: 'BarChart2',
        isParent: true,
        children: [
          { id: 'menu-plan-reports-progress', name: 'Progress Reports', icon: 'TrendingUp' },
          { id: 'menu-plan-reports-summary', name: 'Summary Reports', icon: 'FileText' },
        ],
      },
    ],
  },
];

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

export const MOCK_MENU_APIS = [
  // Existing APIs...
  {
    perMenuId: 'menu-hr-emp-list',
    perMenu: 'Employee List',
    perApiList: [
      { id: 'api-hr-emp-view', name: 'View Employee List' },
      { id: 'api-hr-emp-export', name: 'Export Employees' },
    ],
  },
  {
    perMenuId: 'menu-hr-emp-add',
    perMenu: 'Add Employee',
    perApiList: [
      { id: 'api-hr-emp-create', name: 'Create Employee' },
      { id: 'api-hr-emp-edit', name: 'Edit Employee' },
    ],
  },
  // Project Management APIs
  {
    perMenuId: 'menu-prj-projects-list',
    perMenu: 'All Projects',
    perApiList: [
      { id: 'api-prj-projects-view', name: 'View Projects' },
      { id: 'api-prj-projects-create', name: 'Create Project' },
      { id: 'api-prj-projects-edit', name: 'Edit Project' },
    ],
  },
  {
    perMenuId: 'menu-prj-tasks-my',
    perMenu: 'My Tasks',
    perApiList: [
      { id: 'api-prj-tasks-view', name: 'View Tasks' },
      { id: 'api-prj-tasks-update', name: 'Update Task' },
      { id: 'api-prj-tasks-complete', name: 'Complete Task' },
    ],
  },
  // Plan & Development APIs
  {
    perMenuId: 'menu-plan-strategic-list',
    perMenu: 'Plan List',
    perApiList: [
      { id: 'api-plan-view', name: 'View Plans' },
      { id: 'api-plan-create', name: 'Create Plan' },
      { id: 'api-plan-edit', name: 'Edit Plan' },
    ],
  },
  {
    perMenuId: 'menu-plan-initiatives-active',
    perMenu: 'Active Initiatives',
    perApiList: [
      { id: 'api-plan-init-view', name: 'View Initiatives' },
      { id: 'api-plan-init-create', name: 'Create Initiative' },
      { id: 'api-plan-init-update', name: 'Update Initiative' },
    ],
  },
];

export const MOCK_MODULE_MENUS = MOCK_MODULE_MENU_TREE.map(mod => ({
  perModuleId: mod.perModuleId,
  perModule: mod.perModule,
  perMenuList: mod.menus.flatMap(m =>
      m.isParent && m.children ? m.children.map(c => ({ id: c.id, name: c.name })) : [{ id: m.id, name: m.name }]
  ),
}));