// src/modules/project/types/resource.types.ts
import { ResourceType, ResourceAllocationStatus } from './project.enums';

export interface ProjectResource {
    id: string;
    projectId: string;
    projectName: string;
    resourceId: string;
    resourceName: string;
    type: ResourceType;
    quantity: number;
    costPerUnit: number;
    totalCost: number;
    startDate: string;
    endDate: string | null;
    status: ResourceAllocationStatus;
    notes: string;
    unitOfMeasure: string | null;
    skills: string;
    department: string;
    createdAt: string;
    createdBy: string;
    isActive: boolean;
}

export interface AllocateResourceDto {
    projectId: string;
    resourceId: string;
    resourceName?: string;
    type: ResourceType;
    quantity?: number;
    costPerUnit?: number;
    startDate: string;
    endDate?: string | null;
    notes?: string;
    unitOfMeasure?: string;
    skills?: string;
    department?: string;
    createdBy?: string;
}

export interface UpdateResourceAllocationDto {
    quantity?: number;
    costPerUnit?: number;
    startDate?: string;
    endDate?: string | null;
    status?: ResourceAllocationStatus;
    notes?: string;
    updatedBy?: string;
}

export interface ReleaseResourceDto {
    releasedBy?: string;
    notes?: string;
}

export interface ResourceFilterDto {
    projectId?: string;
    resourceId?: string;
    type?: ResourceType;
    status?: ResourceAllocationStatus;
    startDateFrom?: string;
    startDateTo?: string;
    page: number;
    pageSize: number;
}

export interface ResourceAvailabilityDto {
    resourceId: string;
    resourceName: string;
    resourceType: string;
    skills: string;
    department: string;
    isAvailable: boolean;
    costPerHour: number;
    availableHours: number;
    unitOfMeasure: string | null;
}