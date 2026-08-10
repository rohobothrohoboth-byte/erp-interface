// src/i18n/types.ts


export type LanguageCode = 'en' | 'am' | 'om' | 'ti' | 'so' | 'ar';



export interface Translation {
    // Common
    appName: string;
    signIn: string;
    signOut: string;
    dashboard: string;
    settings: string;
    profile: string;
    help: string;
    support: string;

    // Login Page
    welcomeBack: string;
    enterCredentials: string;
    employeeCode: string;
    password: string;
    forgotPassword: string;
    signingIn: string;
    invalidCredentials: string;
    demoHint: string;
    contactSupport: string;
    privacyPolicy: string;
    termsOfService: string;
    needHelp: string;

    // Navigation
    modules: string;
    myTasks: string;
    notifications: string;
    calendar: string;
    listView: string;

    // Task Management
    taskCalendar: string;
    addTask: string;
    editTask: string;
    deleteTask: string;
    reassignTask: string;
    markAsComplete: string;
    markAsPending: string;
    taskTitle: string;
    taskDescription: string;
    priority: string;
    dueDate: string;
    category: string;
    module: string;
    assignedTo: string;
    createdBy: string;
    noTasks: string;
    allTasksDone: string;
    hasPendingTasks: string;
    urgentTasks: string;
    clickToManage: string;
    canAssignTasks: string;

    // Priorities
    low: string;
    medium: string;
    high: string;
    urgent: string;

    // Statuses
    pending: string;
    inProgress: string;
    completed: string;
    cancelled: string;
    overdue: string;

    // Buttons
    save: string;
    cancel: string;
    close: string;
    confirm: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    clear: string;

    // Messages
    taskCreated: string;
    taskUpdated: string;
    taskDeleted: string;
    taskReassigned: string;
    taskCompleted: string;
    taskPending: string;
    confirmDelete: string;
    confirmReassign: string;
    fillRequiredFields: string;
    selectDate: string;
    selectEmployee: string;

    // Weekdays
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;

    // Months
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;

    modulesTitle: string;
    welcome: string;
    welcomeBack: string;
    availableModules: string;
    roleBasedAccess: string;
    noModulesAssigned: string;
    contactAdmin: string;
    loadingModules: string;
    accessModule: string;
    moduleAccessHint: string;
    coreSystem: string;
    hrManagement: string;
    finance: string;
    inventory: string;
    crm: string;
    procurement: string;
    planAndDevelopment: string;
    projectManagement: string;
    fileManagement: string;
    reportsAndAnalytics: string;

    // Dashboard/Modules Page
    enterpriseResourcePlanning: string;
    helpAndSupport: string;
    documentation: string;
    faq: string;

    adminPanel: string;
    logout: string;
    version: string;
    allRightsReserved: string;

    calendarView: string;

    clickToAccess: string;
    available: string;

    role: string;
    employee: string;
    noModulesAvailable: string;

    enterpriseSolution: string;
    version: string;
    expandSidebar: string;
    noMenus: string;
    notifications: string;
    noNewNotifications: string;
    user: string;
    companies: string;
    department: string;
    fiscalYear: string;
    userManagement: string;

    accessDenied: string;
    noDashboardPermission: string;
    contactAdminForAccess: string;
    loadingDashboard: string;
    failedToLoadDashboard: string;
    unableToLoadDashboardData: string;
    tryAgain: string;
    hrDashboard: string;
    hrDashboardDescription: string;
    refresh: string;
    export: string;
    limitedStatsAccess: string;
    pendingActivities: string;
    requiresAttention: string;
    onLeaveEmployees: string;
    currentlyAbsent: string;
    limitedDashboardView: string;
    limitedDashboardDescription: string;
    live: string;
    secure: string;
    realTime: string;

    totalEmployees: string;
    allActiveEmployees: string;
    currentlyWorking: string;
    awaitingApproval: string;
    currentlyOnLeave: string;
    temporarilySuspended: string;
    contractTerminated: string;
    retiredEmployees: string;
    onStandby: string;
    applicationsRejected: string;
    workforceOverview: string;
    activeRate: string;
    liveData: string;
    updatedToday: string;
    clickCardsForDetails: string;
    allDepartments: string;

// OnLeaveEmployee translations
    failedToLoadLeaveEmployees: string;
    noPermissionToView: string;
    contactAdministrator: string;
    retry: string;
    noEmployeesOnLeave: string;
    allEmployeesActive: string;
    totalDays: string;
    days: string;
    na: string;
    viewAllEmployeesOnLeave: string;
    employeesOnLeave: string;
    annual: string;
    sick: string;
    maternity: string;
    paternity: string;
    bereavement: string;
    unpaid: string;
    annualLeaveDesc: string;
    sickLeaveDesc: string;
    maternityLeaveDesc: string;
    paternityLeaveDesc: string;
    bereavementLeaveDesc: string;
    unpaidLeaveDesc: string;
}

// Also export as default for compatibility
export default Translation;