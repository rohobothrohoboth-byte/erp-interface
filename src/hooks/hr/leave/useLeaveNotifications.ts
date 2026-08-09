// src/hooks/hr/leave/useLeaveNotifications.ts
import { useCallback } from 'react';
import { leaveNotificationService } from '../../../services/hr/leave/leaveNotificationService';
import { useAuthStore } from '../../../stores/auth.store';

export const useLeaveNotifications = () => {
    const { employeeId, role } = useAuthStore();

    const notifyEncashmentRequest = useCallback(async (
        employeeName: string,
        days: number,
        amount: number,
        managers: string[]
    ) => {
        if (!employeeId || employeeId === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeId in notifyEncashmentRequest:', employeeId);
            return;
        }
        await leaveNotificationService.notifyEncashmentRequestSubmitted(
            employeeId,
            employeeName,
            days,
            amount,
            managers || []
        );
    }, [employeeId]);

    const notifyEncashmentApproved = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        days: number,
        amount: number,
        approverName: string,
        approverRole: string
    ) => {
        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeId in notifyEncashmentApproved:', employeeIdParam);
            return;
        }
        await leaveNotificationService.notifyEncashmentApproved(
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
            console.error('❌ Invalid employeeId in notifyEncashmentRejected:', employeeIdParam);
            return;
        }
        await leaveNotificationService.notifyEncashmentRejected(
            employeeIdParam,
            employeeName,
            days,
            reason,
            rejectedBy
        );
    }, []);

    const notifyYearEndStarted = useCallback(async (
        fiscalYear: string,
        adminIds: string[]
    ) => {
        const processedBy = employeeId || 'System';
        await leaveNotificationService.notifyYearEndStarted(
            processedBy,
            fiscalYear,
            adminIds || []
        );
    }, [employeeId]);

    const notifyYearEndCompleted = useCallback(async (
        fiscalYear: string,
        employeesProcessed: number,
        carryoverRecords: number,
        encashmentRecords: number,
        adminIds: string[]
    ) => {
        await leaveNotificationService.notifyYearEndCompleted(
            fiscalYear,
            employeesProcessed,
            carryoverRecords,
            encashmentRecords,
            adminIds || []
        );
    }, []);

    const notifyLeaveExpiring = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        leaveType: string,
        days: number,
        expiryDate: string
    ) => {
        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeId in notifyLeaveExpiring:', employeeIdParam);
            return;
        }
        await leaveNotificationService.notifyLeaveExpiring(
            employeeIdParam,
            employeeName,
            leaveType,
            days,
            expiryDate
        );
    }, []);

    const notifyCarryoverApplied = useCallback(async (
        employeeIdParam: string,
        employeeName: string,
        leaveType: string,
        days: number,
        fromYear: string,
        toYear: string
    ) => {
        if (!employeeIdParam || employeeIdParam === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid employeeId in notifyCarryoverApplied:', employeeIdParam);
            return;
        }
        await leaveNotificationService.notifyCarryoverApplied(
            employeeIdParam,
            employeeName,
            leaveType,
            days,
            fromYear,
            toYear
        );
    }, []);

    return {
        notifyEncashmentRequest,
        notifyEncashmentApproved,
        notifyEncashmentRejected,
        notifyYearEndStarted,
        notifyYearEndCompleted,
        notifyLeaveExpiring,
        notifyCarryoverApplied
    };
};