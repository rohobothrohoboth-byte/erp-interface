// services/task/task.api.ts

import { api } from '@/shared/services/api';
import { getAccessToken } from '@/modules/auth/utils/auth.utils';
import { getAllAppUsers } from '@/modules/auth/services/account/account.api';
import { empDetailApi } from '@/modules/hr/services/employee/empDetail/empDetail.api';

// ✅ Use the correct gateway path (without /v1)
const TASK_BASE = '/tasks';

export interface EmployeeInfo {
    id: string;
    employeeId: string;
    name: string;
    fullName: string;
    department: string;
    branch: string;
    company: string;
    position: string;
    email: string;
    photo?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string;
    createdAt: string;
    completedAt?: string;
    assignedTo: string;
    assignedBy: string;
    category: string;
    module: string;
}

export interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    completionRate: number;
}

export interface PaginatedResult<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface TaskFilters {
    pageNumber: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    priority?: string;
    searchTerm?: string;
    userId?: string;
}

export const getTasks = async (employeeId: string, filters?: {
    status?: string;
    priority?: string;
    dueDate?: string;
}): Promise<Task[]> => {
    if (!employeeId) {
        console.error('employeeId is required');
        return [];
    }
    try {
        const response = await api.get(`${TASK_BASE}/user/${employeeId}`, { params: filters });

        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
};

export const getTaskStats = async (employeeId: string): Promise<TaskStats> => {
    if (!employeeId) {
        console.error('employeeId is required');
        return {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            overdue: 0,
            completionRate: 0
        };
    }
    try {
        const response = await api.get(`${TASK_BASE}/stats/${employeeId}`);

        return response.data?.data || {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            overdue: 0,
            completionRate: 0
        };
    } catch (error) {
        console.error('Error fetching task stats:', error);
        return {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            overdue: 0,
            completionRate: 0
        };
    }
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
    try {
        const response = await api.post(TASK_BASE, task);
        return response.data?.data;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
};

export const updateTask = async (taskId: string, task: Partial<Task>, employeeId: string): Promise<Task> => {
    try {
        // First, get the current task using employeeId
        const currentTasks = await getTasks(employeeId);
        const currentTask = currentTasks.find(t => t.id === taskId);

        if (!currentTask) {
            throw new Error('Task not found');
        }

        // Merge current task with updates - send COMPLETE task object
        const completeTask = {
            id: taskId,
            title: task.title !== undefined ? task.title : currentTask.title,
            description: task.description !== undefined ? task.description : currentTask.description,
            status: task.status !== undefined ? task.status : currentTask.status,
            priority: task.priority !== undefined ? task.priority : currentTask.priority,
            dueDate: task.dueDate !== undefined ? task.dueDate : currentTask.dueDate,
            category: task.category !== undefined ? task.category : currentTask.category,
            module: task.module !== undefined ? task.module : currentTask.module,
            assignedTo: currentTask.assignedTo,
            assignedBy: currentTask.assignedBy,
            createdAt: currentTask.createdAt,
            completedAt: currentTask.completedAt,
        };

        const response = await api.put(`${TASK_BASE}/${taskId}`, completeTask);
        return response.data?.data;
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

export const deleteTask = async (taskId: string): Promise<void> => {
    try {
        await api.delete(`${TASK_BASE}/${taskId}`);
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

export const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<void> => {
    try {
        await api.patch(`${TASK_BASE}/${taskId}/status`, { status });
    } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
    }
};

export const getEmployeesForAssignment = async (currentEmployeeId: string): Promise<EmployeeInfo[]> => {
    try {
        const users = await getAllAppUsers();

        if (!users || users.length === 0) {
            return [];
        }

        // Get current employee info once
        let currentDept = '';
        try {
            const currentInfo = await empDetailApi.getInfo(currentEmployeeId);
            currentDept = currentInfo?.departmentName || currentInfo?.department || '';
        } catch (err) {
            // Ignore
        }

        // Get details for each user
        const employees = await Promise.all(
            users
                .filter(user => user.employeeId && user.employeeId !== currentEmployeeId)
                .map(async (user) => {
                    let name = `Employee ${user.employeeId.substring(0, 8)}`;
                    let department = '';

                    try {
                        const info = await empDetailApi.getInfo(user.employeeId);
                        if (info) {
                            name = info.fullName || info.firstName + ' ' + info.lastName || name;
                            department = info.departmentName || info.department || '';
                        }
                    } catch (err) {
                        // Ignore
                    }

                    return {
                        id: user.id,
                        employeeId: user.employeeId,
                        name: name,
                        email: '',
                        department: department,
                    };
                })
        );

        // If we have a current department, filter by it
        let filteredEmployees = employees;
        if (currentDept) {
            filteredEmployees = employees.filter(emp => emp.department === currentDept);
        }

        // If no employees in same department, show all (or return empty)
        if (filteredEmployees.length === 0) {
            filteredEmployees = employees;
        }

        return filteredEmployees;
    } catch (error) {
        console.error('Error loading employees:', error);
        return [];
    }
};

export const getPaginatedTasks = async (filters: TaskFilters): Promise<PaginatedResult<Task>> => {
    try {
        const response = await api.get(`${TASK_BASE}/paginated`, { params: filters });
        return response.data?.data;
    } catch (error) {
        console.error('Error fetching paginated tasks:', error);
        return {
            items: [],
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
        };
    }
};