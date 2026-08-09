// src/services/hr/leave/leaveNotificationIntegration.ts
import { createNotification, type CreateNotificationDto } from '../../notification/notification.api';
import { leaveApi } from './leave.api';
import { empApi } from '../employee/emp.api';
import { usermgmtApi } from '../../core/usermgmt/usermgmt.api';

export class LeaveNotificationIntegration {
    private static instance: LeaveNotificationIntegration;

    private constructor() {}

    static getInstance(): LeaveNotificationIntegration {
        if (!LeaveNotificationIntegration.instance) {
            LeaveNotificationIntegration.instance = new LeaveNotificationIntegration();
        }
        return LeaveNotificationIntegration.instance;
    }

    // ============= HELPER METHODS =============

    private isValidGuid(id: string | null | undefined): boolean {
        if (!id) return false;
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return guidRegex.test(id) && id !== '00000000-0000-0000-0000-000000000000';
    }
// src/services/hr/leave/leaveNotificationIntegration.ts

    private async getAppUserId(employeeId: string): Promise<string | null> {
        try {
            if (!this.isValidGuid(employeeId)) {
                console.error('❌ Invalid employeeId for getAppUserId:', employeeId);
                return null;
            }

            console.log('🔍 Getting AppUserId for employee:', employeeId);
            const accountData = await usermgmtApi.getAccountData(employeeId as any);

            if (accountData?.userId && this.isValidGuid(accountData.userId)) {
                console.log('✅ Found AppUserId:', accountData.userId);
                return accountData.userId;
            }

            console.warn('⚠️ No AppUserId found for employee:', employeeId);
            return null;
        } catch (error) {
            console.error('❌ Error getting AppUserId:', error);
            return null;
        }
    }


    private async getNotificationUserId(employeeId: string): Promise<string> {
        const appUserId = await this.getAppUserId(employeeId);
        if (appUserId) {
            return appUserId;
        }
        console.warn('⚠️ Using employeeId as fallback for notification userId:', employeeId);
        return employeeId;
    }

    // ============= GET MANAGERS FOR EMPLOYEE =============
    async getManagersForEmployee(employeeId: string): Promise<string[]> {
        if (!this.isValidGuid(employeeId)) {
            console.error('❌ Invalid employeeId in getManagersForEmployee:', employeeId);
            return [];
        }

        console.log('🔍 Fetching managers for employee:', employeeId);

        try {
            const employee = await empApi.getEmployeeById(employeeId);
            console.log('📋 Employee data:', employee);

            // Try different possible manager fields
            const managerId = (employee as any)?.managerId
                || (employee as any)?.manager
                || (employee as any)?.reportsTo
                || (employee as any)?.supervisorId;

            if (managerId && this.isValidGuid(managerId)) {
                console.log('✅ Found manager employeeId:', managerId);
                return [managerId];
            }

            console.warn('⚠️ No manager found for employee:', employeeId);
            return [];
        } catch (error) {
            console.error('❌ Error fetching managers:', error);
            return [];
        }
    }

    async getAdminUsers(): Promise<string[]> {
        try {
            // Fetch admin users from your system
            // This should return AppUser IDs
            // You can implement this by fetching users with admin role
            return [];
        } catch (error) {
            console.error('Error fetching admins:', error);
            return [];
        }
    }

    // ============= LEAVE REQUEST NOTIFICATIONS =============
    async notifyLeaveRequestSubmitted(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        days: number,
        startDate: string,
        endDate: string,
        managers: string[]
    ) {
        console.log('📧 notifyLeaveRequestSubmitted called with employeeId:', employeeId);

        if (!this.isValidGuid(employeeId)) {
            console.error('❌ Invalid employeeId:', employeeId);
            return;
        }

        // Get the AppUser ID (this is what the notification table expects)
        const appUserId = await this.getAppUserId(employeeId);
        console.log('📧 AppUser ID:', appUserId);

        if (!appUserId) {
            console.error('❌ Could not get AppUserId for employee:', employeeId);
            return;
        }

        // Notify employee using AppUser ID
        try {
            const result = await createNotification({
                userId: appUserId,  // Use AppUser ID, not Employee ID!
                title: '📝 Leave Request Submitted',
                message: `Your ${leaveType} leave request for ${days} days (${startDate} - ${endDate}) has been submitted and is pending approval.`,
                type: 'info',
                priority: 'medium',
                moduleName: 'Leave Request',
                metadata: {
                    employeeName,
                    leaveType,
                    days,
                    startDate,
                    endDate,
                    status: 'PENDING'
                }
            });
            console.log('✅ Employee notification created with AppUserId:', appUserId);
        } catch (error) {
            console.error('❌ Failed to create employee notification:', error);
        }

        // Notify managers
        if (managers && managers.length > 0) {
            for (const managerId of managers) {
                if (!this.isValidGuid(managerId)) {
                    console.warn('⚠️ Invalid manager ID:', managerId);
                    continue;
                }

                try {
                    const managerUserId = await this.getNotificationUserId(managerId);
                    if (!managerUserId) {
                        console.warn('⚠️ Could not get notification userId for manager:', managerId);
                        continue;
                    }

                    const result = await createNotification({
                        userId: managerUserId,
                        title: '📋 Pending Leave Approval',
                        message: `${employeeName} has requested ${leaveType} leave for ${days} days (${startDate} - ${endDate}). Please review.`,
                        type: 'warning',
                        priority: 'high',
                        moduleName: 'Leave Request',
                        metadata: {
                            employeeId,
                            employeeName,
                            leaveType,
                            days,
                            startDate,
                            endDate,
                            status: 'PENDING_APPROVAL'
                        }
                    });
                    console.log(`✅ Manager ${managerId} notification created:`, result);
                } catch (error) {
                    console.error(`❌ Failed to create notification for manager ${managerId}:`, error);
                }
            }
        } else {
            console.warn('⚠️ No managers to notify');
        }
    }

    async notifyLeaveRequestApproved(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        days: number,
        approverName: string,
        approverRole: string,
        nextStep?: number,
        totalSteps?: number
    ) {
        if (!this.isValidGuid(employeeId)) {
            console.error('❌ Invalid employeeId:', employeeId);
            return;
        }

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) {
            console.error('❌ Could not get notification userId for employee:', employeeId);
            return;
        }

        let message = `Your ${leaveType} leave request for ${days} days has been approved by ${approverName} (${approverRole}).`;
        if (nextStep && totalSteps && nextStep <= totalSteps) {
            message += ` It has moved to step ${nextStep} of ${totalSteps}.`;
        } else if (nextStep && totalSteps && nextStep > totalSteps) {
            message += ` The request is now fully approved.`;
        }

        try {
            const result = await createNotification({
                userId: notificationUserId,
                title: '✅ Leave Request Approved',
                message,
                type: 'success',
                priority: 'high',
                moduleName: 'Leave Request',
                metadata: {
                    leaveType,
                    days,
                    approvedBy: approverName,
                    approvedByRole: approverRole,
                    nextStep,
                    totalSteps,
                    status: 'APPROVED'
                }
            });
            console.log('✅ Notification created:', result);
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
        }
    }

    async notifyLeaveRequestRejected(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        days: number,
        reason: string,
        rejectedBy: string
    ) {
        if (!this.isValidGuid(employeeId)) {
            console.error('❌ Invalid employeeId:', employeeId);
            return;
        }

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) {
            console.error('❌ Could not get notification userId for employee:', employeeId);
            return;
        }

        try {
            const result = await createNotification({
                userId: notificationUserId,
                title: '❌ Leave Request Rejected',
                message: `Your ${leaveType} leave request for ${days} days has been rejected by ${rejectedBy}. Reason: ${reason}`,
                type: 'error',
                priority: 'high',
                moduleName: 'Leave Request',
                metadata: {
                    leaveType,
                    days,
                    reason,
                    rejectedBy,
                    status: 'REJECTED'
                }
            });
            console.log('✅ Notification created:', result);
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
        }
    }

    async notifyLeaveRequestEscalated(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        days: number,
        currentStep: number,
        totalSteps: number,
        nextApproverRole: string,
        nextApproverId?: string
    ) {
        if (!this.isValidGuid(employeeId)) {
            console.error('❌ Invalid employeeId:', employeeId);
            return;
        }

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) {
            console.error('❌ Could not get notification userId for employee:', employeeId);
            return;
        }

        // Notify employee
        try {
            await createNotification({
                userId: notificationUserId,
                title: '🔄 Leave Request Escalated',
                message: `Your ${leaveType} leave request has been escalated to ${nextApproverRole} (Step ${currentStep} of ${totalSteps}).`,
                type: 'info',
                priority: 'medium',
                moduleName: 'Leave Request',
                metadata: {
                    leaveType,
                    days,
                    currentStep,
                    totalSteps,
                    nextApproverRole,
                    status: 'ESCALATED'
                }
            });
        } catch (error) {
            console.error('❌ Failed to create escalation notification:', error);
        }

        // Notify next approver
        if (nextApproverId && this.isValidGuid(nextApproverId)) {
            const approverUserId = await this.getNotificationUserId(nextApproverId);
            if (approverUserId) {
                try {
                    await createNotification({
                        userId: approverUserId,
                        title: '📋 New Leave Request for Approval',
                        message: `${employeeName}'s ${leaveType} leave request requires your approval (Step ${currentStep} of ${totalSteps}).`,
                        type: 'warning',
                        priority: 'high',
                        moduleName: 'Leave Request',
                        metadata: {
                            employeeId,
                            employeeName,
                            leaveType,
                            days,
                            currentStep,
                            totalSteps,
                            status: 'PENDING_APPROVAL'
                        }
                    });
                } catch (error) {
                    console.error('❌ Failed to create approver notification:', error);
                }
            }
        }
    }

    // ============= BULK NOTIFICATIONS =============

    async notifyBulkLeaveApproved(
        employeeIds: string[],
        leaveType: string,
        approverName: string
    ) {
        for (const employeeId of employeeIds) {
            if (!this.isValidGuid(employeeId)) continue;

            const notificationUserId = await this.getNotificationUserId(employeeId);
            if (!notificationUserId) continue;

            try {
                await createNotification({
                    userId: notificationUserId,
                    title: '✅ Leave Request Approved',
                    message: `Your ${leaveType} leave request has been approved by ${approverName}.`,
                    type: 'success',
                    priority: 'medium',
                    moduleName: 'Leave Request',
                    metadata: {
                        leaveType,
                        approvedBy: approverName,
                        status: 'BULK_APPROVED'
                    }
                });
            } catch (error) {
                console.error('❌ Failed to create bulk notification:', error);
            }
        }
    }

    // ============= LEAVE BALANCE NOTIFICATIONS =============

    async notifyLeaveBalanceLow(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        remainingDays: number,
        threshold: number = 5
    ) {
        if (!this.isValidGuid(employeeId)) return;

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) return;

        try {
            await createNotification({
                userId: notificationUserId,
                title: '⚠️ Leave Balance Low',
                message: `Your ${leaveType} leave balance is ${remainingDays} days, which is below the threshold of ${threshold} days.`,
                type: 'warning',
                priority: 'medium',
                moduleName: 'Leave Balance',
                metadata: {
                    leaveType,
                    remainingDays,
                    threshold,
                    status: 'BALANCE_LOW'
                }
            });
        } catch (error) {
            console.error('❌ Failed to create balance notification:', error);
        }
    }

    // ============= CARRYOVER NOTIFICATIONS =============

    async notifyCarryoverApplied(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        days: number,
        fromYear: string,
        toYear: string
    ) {
        if (!this.isValidGuid(employeeId)) return;

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) return;

        try {
            await createNotification({
                userId: notificationUserId,
                title: '🔄 Leave Carryover Applied',
                message: `${days} days of ${leaveType} leave have been carried over from ${fromYear} to ${toYear}.`,
                type: 'success',
                priority: 'medium',
                moduleName: 'Leave Carryover',
                metadata: {
                    leaveType,
                    days,
                    fromYear,
                    toYear,
                    status: 'CARRIED_OVER'
                }
            });
        } catch (error) {
            console.error('❌ Failed to create carryover notification:', error);
        }
    }

    // ============= ENCASHMENT NOTIFICATIONS =============

    async notifyEncashmentRequestSubmitted(
        employeeId: string,
        employeeName: string,
        days: number,
        amount: number,
        managers: string[]
    ) {
        if (!this.isValidGuid(employeeId)) return;

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) return;

        // Notify employee
        try {
            await createNotification({
                userId: notificationUserId,
                title: '📝 Encashment Request Submitted',
                message: `Your encashment request for ${days} days ($${amount.toFixed(2)}) has been submitted and is pending approval.`,
                type: 'info',
                priority: 'medium',
                moduleName: 'Leave Encashment',
                metadata: {
                    days,
                    amount,
                    status: 'PENDING'
                }
            });
        } catch (error) {
            console.error('❌ Failed to create employee notification:', error);
        }

        // Notify managers
        if (managers && managers.length > 0) {
            for (const managerId of managers) {
                if (!this.isValidGuid(managerId)) continue;

                const managerUserId = await this.getNotificationUserId(managerId);
                if (!managerUserId) continue;

                try {
                    await createNotification({
                        userId: managerUserId,
                        title: '📋 Pending Encashment Approval',
                        message: `${employeeName} has requested encashment for ${days} days ($${amount.toFixed(2)}). Please review.`,
                        type: 'warning',
                        priority: 'high',
                        moduleName: 'Leave Encashment',
                        metadata: {
                            employeeId,
                            employeeName,
                            days,
                            amount,
                            status: 'PENDING_APPROVAL'
                        }
                    });
                } catch (error) {
                    console.error('❌ Failed to create manager notification:', error);
                }
            }
        }
    }

    async notifyEncashmentApproved(
        employeeId: string,
        employeeName: string,
        days: number,
        amount: number,
        approverName: string,
        approverRole: string
    ) {
        if (!this.isValidGuid(employeeId)) return;

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) return;

        try {
            await createNotification({
                userId: notificationUserId,
                title: '✅ Encashment Request Approved',
                message: `Your encashment request for ${days} days ($${amount.toFixed(2)}) has been approved by ${approverName} (${approverRole}).`,
                type: 'success',
                priority: 'high',
                moduleName: 'Leave Encashment',
                metadata: {
                    days,
                    amount,
                    approvedBy: approverName,
                    approvedByRole: approverRole,
                    status: 'APPROVED'
                }
            });
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
        }
    }

    async notifyEncashmentRejected(
        employeeId: string,
        employeeName: string,
        days: number,
        reason: string,
        rejectedBy: string
    ) {
        if (!this.isValidGuid(employeeId)) return;

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) return;

        try {
            await createNotification({
                userId: notificationUserId,
                title: '❌ Encashment Request Rejected',
                message: `Your encashment request for ${days} days has been rejected by ${rejectedBy}. Reason: ${reason}`,
                type: 'error',
                priority: 'high',
                moduleName: 'Leave Encashment',
                metadata: {
                    days,
                    reason,
                    rejectedBy,
                    status: 'REJECTED'
                }
            });
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
        }
    }

    async notifyEncashmentProcessed(
        employeeId: string,
        employeeName: string,
        days: number,
        netAmount: number,
        fiscalYear: string
    ) {
        if (!this.isValidGuid(employeeId)) return;

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) return;

        try {
            await createNotification({
                userId: notificationUserId,
                title: '💰 Encashment Processed',
                message: `Your encashment for ${days} days ($${netAmount.toFixed(2)} net) for fiscal year ${fiscalYear} has been processed.`,
                type: 'success',
                priority: 'high',
                moduleName: 'Leave Encashment',
                metadata: {
                    days,
                    netAmount,
                    fiscalYear,
                    status: 'PROCESSED'
                }
            });
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
        }
    }

    // ============= YEAR-END PROCESSING NOTIFICATIONS =============

    async notifyYearEndStarted(
        processedBy: string,
        fiscalYear: string,
        adminIds: string[]
    ) {
        if (!adminIds || adminIds.length === 0) return;

        for (const adminId of adminIds) {
            if (!this.isValidGuid(adminId)) continue;

            const adminUserId = await this.getNotificationUserId(adminId);
            if (!adminUserId) continue;

            try {
                await createNotification({
                    userId: adminUserId,
                    title: '🔄 Year-End Processing Started',
                    message: `Year-end processing for fiscal year ${fiscalYear} has been started by ${processedBy}.`,
                    type: 'info',
                    priority: 'high',
                    moduleName: 'Year-End Processing',
                    metadata: {
                        fiscalYear,
                        processedBy,
                        status: 'PROCESSING_STARTED'
                    }
                });
            } catch (error) {
                console.error('❌ Failed to create notification:', error);
            }
        }
    }

    async notifyYearEndCompleted(
        fiscalYear: string,
        employeesProcessed: number,
        carryoverRecords: number,
        encashmentRecords: number,
        adminIds: string[]
    ) {
        if (!adminIds || adminIds.length === 0) return;

        for (const adminId of adminIds) {
            if (!this.isValidGuid(adminId)) continue;

            const adminUserId = await this.getNotificationUserId(adminId);
            if (!adminUserId) continue;

            try {
                await createNotification({
                    userId: adminUserId,
                    title: '✅ Year-End Processing Completed',
                    message: `Year-end processing for ${fiscalYear} completed. ${employeesProcessed} employees processed, ${carryoverRecords} carryover records, ${encashmentRecords} encashment records.`,
                    type: 'success',
                    priority: 'high',
                    moduleName: 'Year-End Processing',
                    metadata: {
                        fiscalYear,
                        employeesProcessed,
                        carryoverRecords,
                        encashmentRecords,
                        status: 'COMPLETED'
                    }
                });
            } catch (error) {
                console.error('❌ Failed to create notification:', error);
            }
        }
    }

    async notifyYearEndReverted(
        fiscalYear: string,
        revertedBy: string,
        adminIds: string[]
    ) {
        if (!adminIds || adminIds.length === 0) return;

        for (const adminId of adminIds) {
            if (!this.isValidGuid(adminId)) continue;

            const adminUserId = await this.getNotificationUserId(adminId);
            if (!adminUserId) continue;

            try {
                await createNotification({
                    userId: adminUserId,
                    title: '↩️ Year-End Processing Reverted',
                    message: `Year-end processing for fiscal year ${fiscalYear} has been reverted by ${revertedBy}.`,
                    type: 'warning',
                    priority: 'high',
                    moduleName: 'Year-End Processing',
                    metadata: {
                        fiscalYear,
                        revertedBy,
                        status: 'REVERTED'
                    }
                });
            } catch (error) {
                console.error('❌ Failed to create notification:', error);
            }
        }
    }

    // ============= REMINDER NOTIFICATIONS =============

    async notifyPendingApprovalsReminder(
        userIds: string[],
        role: string,
        pendingCount: number
    ) {
        if (!userIds || userIds.length === 0) return;

        for (const userId of userIds) {
            if (!this.isValidGuid(userId)) continue;

            try {
                await createNotification({
                    userId: userId, // userId is already AppUser ID
                    title: '⏰ Pending Approvals Reminder',
                    message: `You have ${pendingCount} pending leave requests waiting for your ${role} approval.`,
                    type: 'warning',
                    priority: 'medium',
                    moduleName: 'Leave Request',
                    metadata: {
                        pendingCount,
                        role,
                        status: 'REMINDER'
                    }
                });
            } catch (error) {
                console.error('❌ Failed to create reminder notification:', error);
            }
        }
    }

    async notifyUpcomingLeave(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        startDate: string,
        days: number
    ) {
        if (!this.isValidGuid(employeeId)) return;

        const notificationUserId = await this.getNotificationUserId(employeeId);
        if (!notificationUserId) return;

        try {
            await createNotification({
                userId: notificationUserId,
                title: '📅 Upcoming Leave Reminder',
                message: `Your ${leaveType} leave of ${days} days starts on ${startDate}. Please prepare for your absence.`,
                type: 'info',
                priority: 'low',
                moduleName: 'Leave Request',
                metadata: {
                    leaveType,
                    startDate,
                    days,
                    status: 'UPCOMING'
                }
            });
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
        }
    }

    // ============= BULK NOTIFICATIONS =============

    async notifyBulk(
        userIds: string[],
        title: string,
        message: string,
        type: 'success' | 'warning' | 'error' | 'info' = 'info',
        priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium',
        moduleName: string = 'Leave System',
        metadata?: any
    ) {
        if (!userIds || userIds.length === 0) return;

        for (const userId of userIds) {
            if (!this.isValidGuid(userId)) continue;

            try {
                await createNotification({
                    userId: userId, // userId is already AppUser ID
                    title,
                    message,
                    type,
                    priority,
                    moduleName,
                    metadata
                });
            } catch (error) {
                console.error('❌ Failed to create bulk notification:', error);
            }
        }
    }
}

export const leaveNotificationIntegration = LeaveNotificationIntegration.getInstance();