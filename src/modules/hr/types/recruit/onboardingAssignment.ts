// src/types/hr/recruit/onboardingAssignment.ts

export interface OnboardingAssignmentListDto {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    employeePhone?: string;
    position: string;
    department: string;
    taskId: string;
    taskName: string;
    taskDescription: string;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Verified' | 'Overdue';
    scheduledDate: string;
    completedDate: string | null;
    assignedBy: string;
    assignedDate: string;
    priority: 'High' | 'Medium' | 'Low';
    notes?: string;
    rowVersion: string;
    createdAt: string;
    updatedAt: string;
}

export interface OnboardingAssignmentAddDto {
    employeeId: string;
    taskId: string;
    scheduledDate: string;
    priority?: 'High' | 'Medium' | 'Low';
    notes?: string;
}

export interface OnboardingAssignmentModDto {
    id: string;
    scheduledDate?: string;
    status?: 'Pending' | 'InProgress' | 'Completed' | 'Verified' | 'Overdue';
    priority?: 'High' | 'Medium' | 'Low';
    notes?: string;
    rowVersion: string;
}