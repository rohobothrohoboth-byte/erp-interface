// src/hooks/useDataScope.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { userScopeService, type UserScopeDto } from '../services/core/user/userScope.service';
import type { UUID } from '../../types/core/branch';

interface DataScope {
    // User info
    employeeId: string | null;
    employeeCode: string | null;
    employeeName: string | null;

    // Department info
    departmentId: UUID | null;
    departmentName: string | null;
    departmentNameAm: string | null;

    // Branch info
    branchId: UUID | null;
    branchName: string | null;
    branchNameAm: string | null;

    // Company info
    companyId: UUID | null;
    companyName: string | null;
    companyNameAm: string | null;

    // Position info
    positionId: UUID | null;
    positionName: string | null;

    // Permissions
    role: string | null;
    isAdmin: boolean;
    canSeeAllBranches: boolean;
    canSeeAllDepartments: boolean;
    canSeeOwnBranchOnly: boolean;

    // Loading state
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;

    // Raw scope data
    rawScope: UserScopeDto | null;

    // Filter helpers
    filterByBranch: <T extends { branchId?: string }>(data: T[]) => T[];
    filterByDepartment: <T extends { departmentId?: string }>(data: T[]) => T[];
    filterByCompany: <T extends { companyId?: string }>(data: T[]) => T[];
}

export function useDataScope(): DataScope {
    const { employeeId, role: authRole, isAuthenticated } = useAuthStore();
    const [scope, setScope] = useState<UserScopeDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [fetchAttempted, setFetchAttempted] = useState(false);

    const adminRoles = ['admin', 'super_admin', 'ceo', 'vice.ceo', 'vice_ceo', 'auditor'];
    const isAdmin = adminRoles.includes(authRole?.toLowerCase() || '');

    const fetchScope = useCallback(async () => {
        // Don't fetch if not authenticated
        if (!isAuthenticated) {
            console.log('⏳ User not authenticated, skipping scope fetch');
            setIsLoading(false);
            return;
        }

        // Don't fetch if no employeeId
        if (!employeeId) {
            console.log('⏳ No employeeId available yet, waiting...');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setFetchAttempted(true);

            console.log('🔍 Fetching user scope for employee:', employeeId);
            const data = await userScopeService.getUserScope(employeeId);
            setScope(data);
            console.log('📊 DataScope updated:', data);
        } catch (err) {
            console.error('❌ Failed to fetch data scope:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [employeeId, isAuthenticated]);

    // Fetch when employeeId becomes available
    useEffect(() => {
        if (employeeId && isAuthenticated) {
            console.log('🔄 EmployeeId available, fetching scope...');
            fetchScope();
        } else {
            // Reset state when employeeId is not available
            setScope(null);
            setError(null);
            if (!isLoading) {
                setIsLoading(false);
            }
        }
    }, [employeeId, isAuthenticated, fetchScope]);

    // Filter functions
    const filterByBranch = useCallback(<T extends { branchId?: string }>(data: T[]): T[] => {
        if (isAdmin || !scope?.branch?.id) return data;
        return data.filter(item => item.branchId === scope.branch.id);
    }, [isAdmin, scope?.branch?.id]);

    const filterByDepartment = useCallback(<T extends { departmentId?: string }>(data: T[]): T[] => {
        if (isAdmin || !scope?.department?.id) return data;
        return data.filter(item => item.departmentId === scope.department.id);
    }, [isAdmin, scope?.department?.id]);

    const filterByCompany = useCallback(<T extends { companyId?: string }>(data: T[]): T[] => {
        if (isAdmin || !scope?.branch?.companyId) return data;
        return data.filter(item => item.companyId === scope.branch.companyId);
    }, [isAdmin, scope?.branch?.companyId]);

    return {
        // User info
        employeeId: scope?.employee?.employeeId?.toString() || null,
        employeeCode: scope?.employee?.employeeCode || null,
        employeeName: scope?.employee
            ? `${scope.employee.firstName} ${scope.employee.lastName}`.trim()
            : null,

        // Department info
        departmentId: scope?.department?.id || null,
        departmentName: scope?.department?.name || null,
        departmentNameAm: scope?.department?.nameAm || null,

        // Branch info
        branchId: scope?.branch?.id || null,
        branchName: scope?.branch?.name || null,
        branchNameAm: scope?.branch?.nameAm || null,

        // Company info
        companyId: scope?.branch?.companyId || null,
        companyName: scope?.branch?.companyName || null,
        companyNameAm: scope?.branch?.companyNameAm || null,

        // Position info
        positionId: scope?.position?.id || null,
        positionName: scope?.position?.name || null,

        // Permissions
        role: authRole || null,
        isAdmin,
        canSeeAllBranches: isAdmin,
        canSeeAllDepartments: isAdmin,
        canSeeOwnBranchOnly: !isAdmin && !!scope?.branch?.id,

        // Loading state
        isLoading: isLoading || (!fetchAttempted && isAuthenticated && !!employeeId),
        error,
        refetch: fetchScope,

        // Raw data
        rawScope: scope,

        // Filters
        filterByBranch,
        filterByDepartment,
        filterByCompany,
    };
}