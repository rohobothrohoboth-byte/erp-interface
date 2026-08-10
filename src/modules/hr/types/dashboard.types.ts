// ✅ HR Dashboard Types - Matches your API response
import type { UUID } from "@/modules/hr/types/employee";
export interface HrDashboardResponse {
    totalEmployees: number;
    activeEmployees: number;
    pendingEmployeesCount: number;
    suspendedEmployees: number;
    retiredEmployees: number;
    standByEmployees: number;
    terminatedEmployees: number;
    leaveEmployees: number;
    rejectedEmployees: number;
    pendingEmployeesList: PendingEmployee[];
    pendingEducationExperienceList: PendingEducationExperience[];
    totalDepartments: number;
    totalPositions: number;
    totalJobGrades: number;
    employeesByDepartment: Record<string, number>;
    employeesByPosition: Record<string, number>;
    employeesByStatus: Record<string, number>;
    generatedAt: string;
    cacheDurationSeconds: number;
}
export interface ActivityItem {
    employeeId: string;
    employeeName: string;
    employeeNameAm?: string;
    employeeCode: string;
    departmentName: string;
    positionName: string;
    status: string;
    activityDate: string;
    activityType: 'status_change' | 'hired' | 'promoted' | 'left' | 'on_leave';
}

export interface EventItem {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventType: 'Birthday' | 'Anniversary' | 'Meeting' | 'Holiday' | 'Training';
    description: string;
}
export interface EmpExpEduPendList {
    id: string;
    code: string;
    empFullName: string;
    empFullNameAm: string;
    gender: string;
    department: string;
    position: string;
    branch?: string;
    education?: string;
    experience?: string;
    status?: string;
}

// ✅ Also export EmpDbPendList if not already
export interface EmpDbPendList {
    id: string;
    code: string;
    empFullName: string;
    empFullNameAm: string;
    gender: string;
    department: string;
    position: string;
    branch?: string;
}

export interface EmpDbReport {
    EmpTot: number;
    EmpAct: number;
    EmpPen: number;
    EmpSus: number;
    EmpRet: number;
    EmpStd: number;
    EmpTer: number;
    EmpLeave: number;
    EmpRej: number;
}
export interface EmpDbPendList {
    id: UUID;
    empFullName: string;
    empFullNameAm: string;
    code: string;
    gender: string;
    branch: string;
    department: string;
    position: string;
    jobGrade: string;
}
export interface PendingEmployee {
    id: string;
    code: string;
    empFullName: string;
    empFullNameAm: string;
    gender: string;
    branch: string;
    department: string;
    departmentAm: string;
    position: string;
    jobGrade: string;
}

export interface PendingEducationExperience {
    id: string;
    code: string;
    empFullName: string;
    empFullNameAm: string;
    gender: string;
    branch: string;
    department: string;
    departmentAm: string;
    position: string;
    jobGrade: string;
}

// ✅ For backward compatibility with existing components
export interface StatsData {
    totalEmployees: number;
    activeEmployees: number;
    pendingEmployees: number;
    suspendedEmployees: number;
    retiredEmployees: number;
    standByEmployees: number;
    terminatedEmployees: number;
    leaveEmployees: number;
    rejectedEmployees: number;
}

export interface PendingActivityData {
    pendingEmployees: PendingEmployee[];
    pendingEducationExperience: PendingEducationExperience[];
}