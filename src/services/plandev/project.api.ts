// src/services/plandev/index.ts
import axios from "axios";
import type {
    Project,
    ProjectSummary,
    CreateProjectDto,
    UpdateProjectDto,
    Task,
    CreateTaskDto,
    UpdateTaskDto,
    Milestone,
    CreateMilestoneDto,
    UpdateMilestoneDto,
    Budget,
    CreateBudgetDto,
    UpdateBudgetDto,
    ResourceDto,
    CreateResourceDto,
    UpdateResourceDto,
    TimelineDto,
    TimelineMilestoneDto,
    TimelineTaskDto,
    TimelinePhaseDto,
    DashboardOverview,
    ProjectStats,
    RecentActivity
} from '../../types/plandev/types';

const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';
const PLANDEV_PATH = '/plandev/v1.0';

export const plandevApi = axios.create({
    baseURL: `${API_BASE}${PLANDEV_PATH}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
plandevApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for logging
plandevApi.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.config?.url, error.message);
        return Promise.reject(error);
    }
);

// ============================================================
// PROJECT API
// ============================================================

// Get all projects
export const getProjects = async (params?: {
    status?: string;
    priority?: string;
    managerId?: string;
    department?: string;
    search?: string;
}): Promise<Project[]> => {
    try {
        const response = await plandevApi.get(`/Project`, { params });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching projects:', error);
        throw error;
    }
};

// Get project by ID
export const getProjectById = async (id: string): Promise<Project> => {
    try {
        const response = await plandevApi.get(`/Project/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching project ${id}:`, error);
        throw error;
    }
};

// Get project by code
export const getProjectByCode = async (code: string): Promise<Project> => {
    try {
        const response = await plandevApi.get(`/Project/by-code/${code}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching project by code ${code}:`, error);
        throw error;
    }
};

// Search projects
export const searchProjects = async (params?: {
    searchTerm?: string;
    status?: string;
}): Promise<Project[]> => {
    try {
        const response = await plandevApi.get(`/Project/search`, { params });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error searching projects:', error);
        throw error;
    }
};

// Create project

// In project.api.ts - update the createProject function
export const createProject = async (data: CreateProjectDto): Promise<Project> => {
    try {
        console.log('📡 createProject called with data:', JSON.stringify(data, null, 2));
        const response = await plandevApi.post(`/Project`, data);
        console.log('📡 createProject response:', response);
        return response?.data;
    } catch (error: any) {
        console.error('❌ createProject error:', error);
        console.error('❌ Response data:', error?.response?.data);
        console.error('❌ Response status:', error?.response?.status);
        throw error;
    }
};
// Update project
export const updateProject = async (data: UpdateProjectDto): Promise<Project> => {
    try {
        const response = await plandevApi.put(`/Project`, data);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating project ${data.id}:`, error);
        throw error;
    }
};

// Update project progress
export const updateProjectProgress = async (id: string, progress: number): Promise<Project> => {
    try {
        const response = await plandevApi.patch(`/Project/progress`, { id, progress });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating project progress ${id}:`, error);
        throw error;
    }
};

// Update project status
export const updateProjectStatus = async (id: string, status: string): Promise<Project> => {
    try {
        const response = await plandevApi.patch(`/Project/${id}/status`, { status });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating project status ${id}:`, error);
        throw error;
    }
};

// Complete project
export const completeProject = async (id: string): Promise<Project> => {
    try {
        const response = await plandevApi.patch(`/Project/${id}/complete`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error completing project ${id}:`, error);
        throw error;
    }
};

// Delete project
export const deleteProject = async (id: string): Promise<void> => {
    try {
        await plandevApi.delete(`/Project/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting project ${id}:`, error);
        throw error;
    }
};

// Get project summary
export const getProjectSummary = async (id: string): Promise<ProjectSummary> => {
    try {
        const response = await plandevApi.get(`/Project/${id}/summary`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching project summary ${id}:`, error);
        throw error;
    }
};

// Get project stats
export const getProjectStats = async (id: string): Promise<ProjectStats> => {
    try {
        const response = await plandevApi.get(`/Project/${id}/stats`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching project stats ${id}:`, error);
        throw error;
    }
};

// Get project timeline


// Get status summary
export const getStatusSummary = async (): Promise<any> => {
    try {
        const response = await plandevApi.get(`/Project/status-summary`);
        return response?.data;
    } catch (error) {
        console.error('❌ Error fetching status summary:', error);
        throw error;
    }
};

// Get my projects
export const getMyProjects = async (): Promise<Project[]> => {
    try {
        const response = await plandevApi.get(`/Project/my`);
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching my projects:', error);
        throw error;
    }
};

// ============================================================
// TASK API
// ============================================================

// Get tasks by project
export const getTasksByProject = async (projectId: string, params?: {
    status?: string;
    assignedToUserId?: string;
}): Promise<Task[]> => {
    try {
        const response = await plandevApi.get(`/Task/by-project/${projectId}`, { params });
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching tasks for project ${projectId}:`, error);
        throw error;
    }
};

// Get task by ID
export const getTaskById = async (id: string): Promise<Task> => {
    try {
        const response = await plandevApi.get(`/Task/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching task ${id}:`, error);
        throw error;
    }
};

// Get subtasks
export const getSubtasks = async (parentTaskId: string): Promise<Task[]> => {
    try {
        const response = await plandevApi.get(`/Task/subtasks/${parentTaskId}`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching subtasks for task ${parentTaskId}:`, error);
        throw error;
    }
};

// Search tasks
export const searchTasks = async (params?: {
    searchTerm?: string;
    projectId?: string;
    status?: string;
    assignedToUserId?: string;
}): Promise<Task[]> => {
    try {
        const response = await plandevApi.get(`/Task/search`, { params });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error searching tasks:', error);
        throw error;
    }
};

// Get overdue tasks
export const getOverdueTasks = async (projectId?: string): Promise<Task[]> => {
    try {
        const response = await plandevApi.get(`/Task/overdue`, { params: { projectId } });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching overdue tasks:', error);
        throw error;
    }
};

// Get tasks assigned to user
export const getTasksAssignedToUser = async (userId: string, projectId?: string): Promise<Task[]> => {
    try {
        const response = await plandevApi.get(`/Task/assigned-to/${userId}`, { params: { projectId } });
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching tasks assigned to user ${userId}:`, error);
        throw error;
    }
};

// Get tasks by milestone
export const getTasksByMilestone = async (milestoneId: string): Promise<Task[]> => {
    try {
        const response = await plandevApi.get(`/Task/by-milestone/${milestoneId}`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching tasks for milestone ${milestoneId}:`, error);
        throw error;
    }
};

// Get task history
export const getTaskHistory = async (id: string): Promise<any[]> => {
    try {
        const response = await plandevApi.get(`/Task/${id}/history`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching task history ${id}:`, error);
        throw error;
    }
};

// Get task status summary
export const getTaskStatusSummary = async (projectId: string): Promise<any> => {
    try {
        const response = await plandevApi.get(`/Task/status-summary/${projectId}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching task status summary for project ${projectId}:`, error);
        throw error;
    }
};

// Create task
export const createTask = async (data: CreateTaskDto): Promise<Task> => {
    try {
        const response = await plandevApi.post(`/Task`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error creating task:', error);
        throw error;
    }
};

// Bulk create tasks
export const bulkCreateTasks = async (data: CreateTaskDto[]): Promise<Task[]> => {
    try {
        const response = await plandevApi.post(`/Task/bulk`, data);
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error bulk creating tasks:', error);
        throw error;
    }
};

// Update task
export const updateTask = async (data: UpdateTaskDto): Promise<Task> => {
    try {
        const response = await plandevApi.put(`/Task`, data);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating task ${data.id}:`, error);
        throw error;
    }
};

// Update task progress
export const updateTaskProgress = async (id: string, progress: number): Promise<Task> => {
    try {
        const response = await plandevApi.patch(`/Task/${id}/progress`, { progress });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating task progress ${id}:`, error);
        throw error;
    }
};

// Update task status
export const updateTaskStatus = async (id: string, status: string): Promise<Task> => {
    try {
        const response = await plandevApi.patch(`/Task/${id}/status`, { status });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating task status ${id}:`, error);
        throw error;
    }
};

// Bulk update task status
export const bulkUpdateTaskStatus = async (ids: string[], status: string): Promise<Task[]> => {
    try {
        const response = await plandevApi.patch(`/Task/bulk-status`, { ids, status });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error bulk updating task status:', error);
        throw error;
    }
};

// Complete task
export const completeTask = async (id: string): Promise<Task> => {
    try {
        const response = await plandevApi.patch(`/Task/${id}/complete`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error completing task ${id}:`, error);
        throw error;
    }
};

// Assign task
export const assignTask = async (id: string, userId: string, userName?: string): Promise<Task> => {
    try {
        const response = await plandevApi.post(`/Task/${id}/assign`, { userId, userName });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error assigning task ${id}:`, error);
        throw error;
    }
};

// Delete task
export const deleteTask = async (id: string): Promise<void> => {
    try {
        await plandevApi.delete(`/Task/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting task ${id}:`, error);
        throw error;
    }
};

// ============================================================
// MILESTONE API
// ============================================================

// Get milestones by project
export const getMilestonesByProject = async (projectId: string, status?: string): Promise<Milestone[]> => {
    try {
        const response = await plandevApi.get(`/Milestone/by-project/${projectId}`, { params: { status } });
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching milestones for project ${projectId}:`, error);
        throw error;
    }
};

// Get milestone by ID
export const getMilestoneById = async (id: string): Promise<Milestone> => {
    try {
        const response = await plandevApi.get(`/Milestone/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching milestone ${id}:`, error);
        throw error;
    }
};

// Get upcoming milestones
export const getUpcomingMilestones = async (days?: number, projectId?: string): Promise<Milestone[]> => {
    try {
        const response = await plandevApi.get(`/Milestone/upcoming`, { params: { days, projectId } });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching upcoming milestones:', error);
        throw error;
    }
};

// Get critical milestones
export const getCriticalMilestones = async (projectId: string): Promise<Milestone[]> => {
    try {
        const response = await plandevApi.get(`/Milestone/critical/${projectId}`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching critical milestones for project ${projectId}:`, error);
        throw error;
    }
};

// Get milestone status summary
export const getMilestoneStatusSummary = async (projectId: string): Promise<any> => {
    try {
        const response = await plandevApi.get(`/Milestone/status-summary/${projectId}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching milestone status summary for project ${projectId}:`, error);
        throw error;
    }
};

// Create milestone
export const createMilestone = async (data: CreateMilestoneDto): Promise<Milestone> => {
    try {
        const response = await plandevApi.post(`/Milestone`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error creating milestone:', error);
        throw error;
    }
};

// Update milestone
export const updateMilestone = async (data: UpdateMilestoneDto): Promise<Milestone> => {
    try {
        const response = await plandevApi.put(`/Milestone`, data);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating milestone ${data.id}:`, error);
        throw error;
    }
};

// Achieve milestone
export const achieveMilestone = async (id: string): Promise<Milestone> => {
    try {
        const response = await plandevApi.post(`/Milestone/${id}/achieve`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error achieving milestone ${id}:`, error);
        throw error;
    }
};

// Update milestone status
export const updateMilestoneStatus = async (id: string, status: string): Promise<Milestone> => {
    try {
        const response = await plandevApi.patch(`/Milestone/${id}/status`, { status });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating milestone status ${id}:`, error);
        throw error;
    }
};

// Delete milestone
export const deleteMilestone = async (id: string): Promise<void> => {
    try {
        await plandevApi.delete(`/Milestone/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting milestone ${id}:`, error);
        throw error;
    }
};

// ============================================================
// BUDGET API
// ============================================================

// Get budgets by project
export const getBudgetsByProject = async (projectId: string): Promise<Budget[]> => {
    try {
        const response = await plandevApi.get(`/Budget/by-project/${projectId}`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching budgets for project ${projectId}:`, error);
        throw error;
    }
};

// Get budget by ID
export const getBudgetById = async (id: string): Promise<Budget> => {
    try {
        const response = await plandevApi.get(`/Budget/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching budget ${id}:`, error);
        throw error;
    }
};

// Get budget summary
export const getBudgetSummary = async (projectId: string): Promise<any> => {
    try {
        const response = await plandevApi.get(`/Budget/project/${projectId}/summary`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching budget summary for project ${projectId}:`, error);
        throw error;
    }
};

// Create budget
export const createBudget = async (data: CreateBudgetDto): Promise<Budget> => {
    try {
        const response = await plandevApi.post(`/Budget`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error creating budget:', error);
        throw error;
    }
};

// Update budget
export const updateBudget = async (data: UpdateBudgetDto): Promise<Budget> => {
    try {
        const response = await plandevApi.put(`/Budget`, data);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating budget ${data.id}:`, error);
        throw error;
    }
};

// Update budget status
export const updateBudgetStatus = async (id: string, status: string): Promise<Budget> => {
    try {
        const response = await plandevApi.patch(`/Budget/${id}/status`, { status });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating budget status ${id}:`, error);
        throw error;
    }
};

// Delete budget
export const deleteBudget = async (id: string): Promise<void> => {
    try {
        await plandevApi.delete(`/Budget/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting budget ${id}:`, error);
        throw error;
    }
};

// ============================================================
// RESOURCE API
// ============================================================

// Get resources by project
export const getResourcesByProject = async (projectId: string): Promise<ResourceDto[]> => {
    try {
        const response = await plandevApi.get(`/Resource/by-project/${projectId}`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching resources for project ${projectId}:`, error);
        throw error;
    }
};

// Get resource by ID
export const getResourceById = async (id: string): Promise<ResourceDto> => {
    try {
        const response = await plandevApi.get(`/Resource/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching resource ${id}:`, error);
        throw error;
    }
};

// Get resource summary
export const getResourceSummary = async (projectId: string): Promise<any> => {
    try {
        const response = await plandevApi.get(`/Resource/project/${projectId}/summary`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching resource summary for project ${projectId}:`, error);
        throw error;
    }
};

// Get available resources
export const getAvailableResources = async (startDate?: string, endDate?: string): Promise<ResourceDto[]> => {
    try {
        const response = await plandevApi.get(`/Resource/available`, { params: { startDate, endDate } });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching available resources:', error);
        throw error;
    }
};

// Create resource
export const createResource = async (data: CreateResourceDto): Promise<ResourceDto> => {
    try {
        const response = await plandevApi.post(`/Resource`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error creating resource:', error);
        throw error;
    }
};

// Bulk assign resources
export const bulkAssignResources = async (data: { projectId: string; resources: CreateResourceDto[] }): Promise<ResourceDto[]> => {
    try {
        const response = await plandevApi.post(`/Resource/bulk-assign`, data);
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error bulk assigning resources:', error);
        throw error;
    }
};

// Update resource
export const updateResource = async (data: UpdateResourceDto): Promise<ResourceDto> => {
    try {
        const response = await plandevApi.put(`/Resource`, data);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating resource ${data.id}:`, error);
        throw error;
    }
};

// Release resource
export const releaseResource = async (id: string, endDate?: string): Promise<ResourceDto> => {
    try {
        const response = await plandevApi.patch(`/Resource/${id}/release`, { endDate });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error releasing resource ${id}:`, error);
        throw error;
    }
};

// Update resource allocation
export const updateResourceAllocation = async (id: string, allocation: number): Promise<ResourceDto> => {
    try {
        const response = await plandevApi.patch(`/Resource/${id}/update-allocation`, { allocation });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating resource allocation ${id}:`, error);
        throw error;
    }
};

// Delete resource
export const deleteResource = async (id: string): Promise<void> => {
    try {
        await plandevApi.delete(`/Resource/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting resource ${id}:`, error);
        throw error;
    }
};

// ============================================================
// TIMELINE API
// ============================================================

// Get project timeline
export const getProjectTimeline = async (projectId: string): Promise<TimelineDto> => {
    try {
        const response = await plandevApi.get(`/Timeline/project/${projectId}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching project timeline ${projectId}:`, error);
        throw error;
    }
};

// Get milestone timeline
export const getMilestoneTimeline = async (milestoneId: string): Promise<TimelineMilestoneDto> => {
    try {
        const response = await plandevApi.get(`/Timeline/milestone/${milestoneId}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching milestone timeline ${milestoneId}:`, error);
        throw error;
    }
};

// Get task timeline
export const getTaskTimeline = async (taskId: string): Promise<TimelineTaskDto> => {
    try {
        const response = await plandevApi.get(`/Timeline/task/${taskId}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching task timeline ${taskId}:`, error);
        throw error;
    }
};

// Get project phases
export const getProjectPhases = async (projectId: string): Promise<TimelinePhaseDto[]> => {
    try {
        const response = await plandevApi.get(`/Timeline/project/${projectId}/phases`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching project phases ${projectId}:`, error);
        throw error;
    }
};

// Get filtered timeline
export const getFilteredTimeline = async (projectId: string, params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
}): Promise<TimelineDto> => {
    try {
        const response = await plandevApi.get(`/Timeline/project/${projectId}/filtered`, { params });
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching filtered timeline ${projectId}:`, error);
        throw error;
    }
};

// Get timeline summary
export const getTimelineSummary = async (projectId: string): Promise<any> => {
    try {
        const response = await plandevApi.get(`/Timeline/summary/${projectId}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching timeline summary ${projectId}:`, error);
        throw error;
    }
};

// ============================================================
// DASHBOARD API
// ============================================================

// Get dashboard overview
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
    try {
        const response = await plandevApi.get(`/Dashboard/overview`);
        return response?.data;
    } catch (error) {
        console.error('❌ Error fetching dashboard overview:', error);
        throw error;
    }
};

// Get project statistics for dashboard
export const getDashboardProjectStats = async (): Promise<ProjectStats[]> => {
    try {
        const response = await plandevApi.get(`/Dashboard/project-stats`);
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching project stats:', error);
        throw error;
    }
};

// Get upcoming milestones for dashboard
export const getDashboardUpcomingMilestones = async (days?: number): Promise<any[]> => {
    try {
        const response = await plandevApi.get(`/Dashboard/upcoming-milestones`, { params: { days } });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching upcoming milestones:', error);
        throw error;
    }
};

// Get overdue tasks for dashboard
export const getDashboardOverdueTasks = async (): Promise<any[]> => {
    try {
        const response = await plandevApi.get(`/Dashboard/overdue-tasks`);
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching overdue tasks:', error);
        throw error;
    }
};

// Get budget summary for dashboard
export const getDashboardBudgetSummary = async (): Promise<any> => {
    try {
        const response = await plandevApi.get(`/Dashboard/budget-summary`);
        return response?.data;
    } catch (error) {
        console.error('❌ Error fetching budget summary:', error);
        throw error;
    }
};

// Get recent activities
export const getRecentActivities = async (limit?: number): Promise<RecentActivity[]> => {
    try {
        const response = await plandevApi.get(`/Dashboard/recent-activities`, { params: { limit } });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching recent activities:', error);
        throw error;
    }
};

// Get my projects for dashboard
export const getDashboardMyProjects = async (): Promise<Project[]> => {
    try {
        const response = await plandevApi.get(`/Dashboard/my-projects`);
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching my projects:', error);
        throw error;
    }
};

// Get team performance
export const getTeamPerformance = async (projectId?: string): Promise<any> => {
    try {
        const response = await plandevApi.get(`/Dashboard/team-performance`, { params: { projectId } });
        return response?.data;
    } catch (error) {
        console.error('❌ Error fetching team performance:', error);
        throw error;
    }
};