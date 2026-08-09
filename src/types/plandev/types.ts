// src/services/plandev/types.ts

export interface Project {
    id: string;
    code: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    budget: number;
    actualCost: number;
    progress: number;
    projectType?: string;
    department?: string;
    managerId?: string;
    managerName?: string;
    sponsorId?: string;
    sponsorName?: string;
    completionDate?: string;
    taskCount: number;
    completedTasks: number;
    milestoneCount: number;
    achievedMilestones: number;
    tasks?: Task[];
    milestones?: Milestone[];
    budgets?: Budget[];
}

export interface ProjectSummary {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    planningProjects: number;
    cancelledProjects: number;
    totalBudget: number;
    totalActualCost: number;
    averageProgress: number;
}

export interface Task {
    id: string;
    projectId: string;
    taskNumber?: string;
    title: string;
    description?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Blocked' | 'Cancelled';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    startDate: string;
    endDate?: string;
    completedDate?: string;
    estimatedHours: number;
    actualHours: number;
    progress: number;
    parentTaskId?: string;
    order?: number;
    taskType?: string;
    subtasks?: Task[];
}

export interface Milestone {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    targetDate: string;
    achievedDate?: string;
    status: 'Pending' | 'Achieved' | 'Missed' | 'Cancelled';
    order: number;
    completionPercentage: number;
    milestoneType?: string;
    deliverable?: string;
    isCritical: boolean;
}

export interface Budget {
    id: string;
    projectId: string;
    category: string;
    description?: string;
    plannedAmount: number;
    actualAmount: number;
    variance: number;
    plannedQuantity: number;
    actualQuantity: number;
    unit?: string;
    status: 'Draft' | 'Approved' | 'InProgress' | 'Completed';
    budgetType?: string;
}

export interface BudgetSummary {
    totalPlanned: number;
    totalActual: number;
    totalVariance: number;
    utilizationPercentage: number;
    budgets: Budget[];
}

export interface TimelineDto {
    projectId: string;
    startDate: string;
    endDate: string;
    milestones: TimelineMilestoneDto[];
    tasks: TimelineTaskDto[];
    phases: TimelinePhaseDto[];
}

export interface TimelineMilestoneDto {
    id: string;
    name: string;
    targetDate: string;
    status: string;
    dependencies: string[];
}

export interface TimelineTaskDto {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
    progress: number;
    dependencies: string[];
}

export interface TimelinePhaseDto {
    id: string;
    name: string;
    order: number;
    startDate: string;
    endDate: string;
    status: string;
}

export interface ResourceDto {
    id: string;
    projectId: string;
    resourceUserId: string;
    resourceUserName?: string;
    role: string;
    startDate: string;
    endDate?: string;
    allocation: number;
    resourceType?: string;
    hourlyRate?: number;
    status: string;
}

export interface DashboardOverview {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    upcomingMilestones: number;
    totalBudget: number;
    usedBudget: number;
    recentActivities: RecentActivity[];
}

export interface RecentActivity {
    id: string;
    type: 'ProjectCreated' | 'TaskUpdated' | 'MilestoneAchieved' | 'BudgetUpdated';
    message: string;
    timestamp: string;
    userId?: string;
    userName?: string;
}

export interface ProjectStats {
    projectId: string;
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    totalMilestones: number;
    achievedMilestones: number;
    totalBudget: number;
    usedBudget: number;
    progress: number;
}

// DTOs
export interface CreateProjectDto {
    code: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    priority?: string;
    budget?: number;
    projectType?: string;
    department?: string;
    managerId?: string;
    sponsorId?: string;
}

export interface UpdateProjectDto {
    id: string;
    name?: string;
    description?: string;
    endDate?: string;
    status?: string;
    priority?: string;
    budget?: number;
    projectType?: string;
    department?: string;
    managerId?: string;
    sponsorId?: string;
}

export interface CreateTaskDto {
    projectId: string;
    title: string;
    description?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    priority: string;
    startDate: string;
    endDate?: string;
    estimatedHours: number;
    parentTaskId?: string;
    taskType?: string;
}

export interface UpdateTaskDto {
    id: string;
    title?: string;
    description?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    estimatedHours?: number;
    status?: string;
}

export interface CreateMilestoneDto {
    projectId: string;
    name: string;
    description?: string;
    targetDate: string;
    milestoneType?: string;
    deliverable?: string;
    isCritical: boolean;
}

export interface UpdateMilestoneDto {
    id: string;
    name?: string;
    description?: string;
    targetDate?: string;
    status?: string;
    milestoneType?: string;
    deliverable?: string;
    isCritical?: boolean;
}

export interface CreateBudgetDto {
    projectId: string;
    category: string;
    description?: string;
    plannedAmount: number;
    plannedQuantity: number;
    unit?: string;
    budgetType?: string;
}

export interface UpdateBudgetDto {
    id: string;
    category?: string;
    description?: string;
    plannedAmount?: number;
    actualAmount?: number;
    plannedQuantity?: number;
    actualQuantity?: number;
    unit?: string;
    status?: string;
}

export interface CreateResourceDto {
    projectId: string;
    resourceUserId: string;
    resourceUserName?: string;
    role: string;
    startDate: string;
    endDate?: string;
    allocation: number;
    resourceType?: string;
    hourlyRate?: number;
}

export interface UpdateResourceDto {
    id: string;
    role?: string;
    endDate?: string;
    allocation?: number;
    status?: string;
    hourlyRate?: number;
}