// src/services/core/user/userScope.service.ts

import { api } from '../../api';
import type { UUID } from '../../../types/core/branch';

// Get the profile URL from environment - it should be /hrm/profile/v1
const PROFILE_URL = import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1';

export interface UserScopeDto {
    employee: {
        employeeId: UUID;
        employeeCode: string;
        firstName: string;
        lastName: string;
        firstNameAm: string;
        lastNameAm: string;
        departmentId: UUID | null;
        positionId: UUID | null;
        jobGradeId: UUID | null;
        empState: string;
        empType: string;
        empNature: string;
        gender: string;
        maritalStatus: string;
        birthDate: string | null;
        employmentDate: string | null;
        workArrangement: string;
        dateAdd: string | null;
    };
    department: {
        id: UUID;
        name: string;
        nameAm: string;
        branchId: UUID | null;
        branchName: string;
        branchNameAm: string;
    } | null;
    branch: {
        id: UUID;
        name: string;
        nameAm: string;
        companyId: UUID | null;
        companyName: string;
        companyNameAm: string;
    } | null;
    position: {
        id: UUID;
        name: string;
        nameAm: string;
    } | null;
    jobGrade: {
        id: UUID;
        name: string;
        nameAm: string;
    } | null;
}

class UserScopeService {
    private cachedScope: UserScopeDto | null = null;
    private cacheTimestamp: number = 0;
    private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async getUserScope(employeeId: string): Promise<UserScopeDto> {
        const now = Date.now();
        if (this.cachedScope && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
            console.log('📦 Using cached user scope');
            return this.cachedScope;
        }

        try {
            console.log('🔍 Fetching user scope for employee:', employeeId);

            // Use PROFILE_URL directly - NO /api prefix
            const url = `${PROFILE_URL}/Employee/user-scope/${employeeId}`;
            console.log('📡 Calling API:', api.defaults.baseURL + url);

            const response = await api.get(url);
            const scope = response.data?.data;

            if (!scope) {
                throw new Error('User scope not found');
            }

            console.log('✅ User scope loaded:', scope);
            this.cachedScope = scope;
            this.cacheTimestamp = now;
            return scope;
        } catch (error) {
            console.error('❌ Error fetching user scope:', error);
            throw error;
        }
    }

    async getUserBranchId(employeeId: string): Promise<UUID | null> {
        try {
            const url = `${PROFILE_URL}/Employee/user-branch/${employeeId}`;
            const response = await api.get(url);
            return response.data?.data?.branchId || null;
        } catch {
            return null;
        }
    }

    async getUserDepartmentId(employeeId: string): Promise<UUID | null> {
        try {
            const url = `${PROFILE_URL}/Employee/user-department/${employeeId}`;
            const response = await api.get(url);
            return response.data?.data?.departmentId || null;
        } catch {
            return null;
        }
    }

    clearCache(): void {
        this.cachedScope = null;
        this.cacheTimestamp = 0;
    }
}

export const userScopeService = new UserScopeService();
export default userScopeService;