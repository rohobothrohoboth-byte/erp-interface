// src/hooks/hr/leave/useLeaveNotificationIntegration.ts
import { useCallback } from 'react';
import { leaveNotificationIntegration } from '@/modules/hr/services/leave/leaveNotificationIntegration';
import { useAuthStore } from '@/shared/stores/auth.store';

export const useLeaveNotificationIntegration = () => {
    const { employeeId, role } = useAuthStore();

    const notifyLeaveRequestSubmitted = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        leaveType: string,
        days: number,
        startDate: string,
        endDate: string,
        managers: string[]
    ) => {
        console.log('📧 notifyLeaveRequestSubmitted called for:', employeeIdParam);

        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeIdParam:', employeeIdParam);
            return;
        }

        await leaveNotificationIntegration.notifyLeaveRequestSubmitted(
            employeeIdParam,
            employeeName,
            leaveType,
            days,
            startDate,
            endDate,
            managers || []
        );
    }, []);

    const notifyLeaveRequestApproved = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        leaveType: string,
        days: number,
        approverName: string,
        approverRole: string,
        nextStep?: number,
        totalSteps?: number
    ) => {
        console.log('📧 notifyLeaveRequestApproved called for:', employeeIdParam);
        console.log('📧 Approver:', approverName, 'Role:', approverRole);

        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeIdParam:', employeeIdParam);
            return;
        }

        await leaveNotificationIntegration.notifyLeaveRequestApproved(
            employeeIdParam,
            employeeName,
            leaveType,
            days,
            approverName,
            approverRole,
            nextStep,
            totalSteps
        );
    }, []);

    const notifyLeaveRequestRejected = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        leaveType: string,
        days: number,
        reason: string,
        rejectedBy: string
    ) => {
        console.log('📧 notifyLeaveRequestRejected called for:', employeeIdParam);

        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeIdParam:', employeeIdParam);
            return;
        }

        await leaveNotificationIntegration.notifyLeaveRequestRejected(
            employeeIdParam,
            employeeName,
            leaveType,
            days,
            reason,
            rejectedBy
        );
    }, []);

    const notifyEncashmentRequestSubmitted = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        days: number,
        amount: number,
        managers: string[]
    ) => {
        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeIdParam:', employeeIdParam);
            return;
        }
        await leaveNotificationIntegration.notifyEncashmentRequestSubmitted(
            employeeIdParam,
            employeeName,
            days,
            amount,
            managers || []
        );
    }, []);

    const notifyEncashmentApproved = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        days: number,
        amount: number,
        approverName: string,
        approverRole: string
    ) => {
        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeIdParam:', employeeIdParam);
            return;
        }
        await leaveNotificationIntegration.notifyEncashmentApproved(
            employeeIdParam,
            employeeName,
            days,
            amount,
            approverName,
            approverRole
        );
    }, []);

    const notifyEncashmentRejected = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        days: number,
        reason: string,
        rejectedBy: string
    ) => {
        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeIdParam:', employeeIdParam);
            return;
        }
        await leaveNotificationIntegration.notifyEncashmentRejected(
            employeeIdParam,
            employeeName,
            days,
            reason,
            rejectedBy
        );
    }, []);

    const notifyYearEndCompleted = useCallback(async (
        fiscalYear: string,
        employeesProcessed: number,
        carryoverRecords: number,
        encashmentRecords: number,
        adminIds: string[]
    ) => {
        await leaveNotificationIntegration.notifyYearEndCompleted(
            fiscalYear,
            employeesProcessed,
            carryoverRecords,
            encashmentRecords,
            adminIds || []
        );
    }, []);

    const getManagersForEmployee = useCallback(async (employeeIdParam: string) => {
        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeIdParam:', employeeIdParam);
            return [];
        }
        try {
            return await leaveNotificationIntegration.getManagersForEmployee(employeeIdParam);
        } catch (error) {
            console.error('❌ Failed to get managers:', error);
            return [];
        }
    }, []);

    const getAdminUsers = useCallback(async () => {
        try {
            return await leaveNotificationIntegration.getAdminUsers();
        } catch (error) {
            console.error('❌ Failed to get admin users:', error);
            return [];
        }
    }, []);

    return {
        notifyLeaveRequestSubmitted,
        notifyLeaveRequestApproved,
        notifyLeaveRequestRejected,
        notifyEncashmentRequestSubmitted,
        notifyEncashmentApproved,
        notifyEncashmentRejected,
        notifyYearEndCompleted,
        getManagersForEmployee,
        getAdminUsers
    };
};