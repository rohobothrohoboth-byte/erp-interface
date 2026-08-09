// src/hooks/useUserScope.ts

import { useState, useEffect, useCallback } from 'react';
import { userScopeService } from '../services/core/user/userScope.service';
import type { UUID } from '../../types/core/branch';

interface UserScope {
    userId: string;
    employeeId: string;
    departmentId: UUID;
    departmentName: string;
    departmentNameAm: string;
    branchId: UUID;
    branchName: string;
    branchNameAm: string;
    companyId: UUID;
    companyName: string;
    companyNameAm: string;
    role: string;
    canSeeAllBranches: boolean;
    canSeeAllDepartments: boolean;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useUserScope(): UserScope {
    const [scope, setScope] = useState<UserScope>({
        userId: '',
        employeeId: '',
        departmentId: '' as UUID,
        departmentName: '',
        departmentNameAm: '',
        branchId: '' as UUID,
        branchName: '',
        branchNameAm: '',
        companyId: '' as UUID,
        companyName: '',
        companyNameAm: '',
        role: '',
        canSeeAllBranches: false,
        canSeeAllDepartments: false,
        isLoading: true,
        error: null,
        refetch: async () => {},
    });

    const fetchScope = useCallback(async () => {
        try {
            setScope(prev => ({ ...prev, isLoading: true, error: null }));
            const data = await userScopeService.getUserScope();
            setScope(prev => ({
                ...prev,
                ...data,
                isLoading: false,
                error: null,
            }));
            console.log('📊 User scope updated:', data);
        } catch (error) {
            console.error('❌ Failed to fetch user scope:', error);
            setScope(prev => ({
                ...prev,
                isLoading: false,
                error: error as Error,
            }));
        }
    }, []);

    useEffect(() => {
        fetchScope();
    }, [fetchScope]);

    return {
        ...scope,
        refetch: fetchScope,
    };
}