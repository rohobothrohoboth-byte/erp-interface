// src/services/hr/leave/leaveNotificationService.ts
import { createNotification, CreateNotificationDto } from '@/modules/notification/services/notification.api';
import { useAuthStore } from '@/shared/stores/auth.store';

// Helper to clean metadata - removes undefined values
const cleanMetadata = (metadata: any): any => {
    if (!metadata) return null;
    const cleaned: any = {};
    for (const key in metadata) {
        if (metadata[key] !== undefined && metadata[key] !== null) {
            cleaned[key] = metadata[key];
        }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
};

export class LeaveNotificationService {
    private static instance: LeaveNotificationService;

    private constructor() {}

    static getInstance(): LeaveNotificationService {
        if (!LeaveNotificationService.instance) {
            LeaveNotificationService.instance = new LeaveNotificationService();
        }
        return LeaveNotificationService.instance;
    }

    // ============= ENCASHMENT NOTIFICATIONS =============

    async notifyEncashmentRequestSubmitted(
        employeeId: string,
        employeeName: string,
        days: number,
        amount: number,
        managers: string[]
    ) {
        // Notify employee
        await createNotification({
            userId: employeeId,
            title: '📝 Encashment Request Submitted',
            message: `Your encashment request for ${days} days ($${amount.toFixed(2)}) has been submitted and is pending approval.`,
            type: 'info',
            priority: 'medium',
            moduleName: 'Leave Encashment',
            metadata: cleanMetadata({
                days,
                amount,
                status: 'PENDING',
                employeeName
            })
        });

        // Notify managers
        for (const managerId of managers) {
            await createNotification({
                userId: managerId,
                title: '📋 Pending Encashment Approval',
                message: `${employeeName} has requested encashment for ${days} days ($${amount.toFixed(2)}). Please review.`,
                type: 'warning',
                priority: 'high',
                moduleName: 'Leave Encashment',
                metadata: cleanMetadata({
                    employeeId,
                    employeeName,
                    days,
                    amount,
                    status: 'PENDING_APPROVAL'
                })
            });
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
        await createNotification({
            userId: employeeId,
            title: '✅ Encashment Request Approved',
            message: `Your encashment request for ${days} days ($${amount.toFixed(2)}) has been approved by ${approverName} (${approverRole}).`,
            type: 'success',
            priority: 'high',
            moduleName: 'Leave Encashment',
            metadata: cleanMetadata({
                days,
                amount,
                approvedBy: approverName,
                approvedByRole: approverRole,
                status: 'APPROVED'
            })
        });
    }

    async notifyEncashmentRejected(
        employeeId: string,
        employeeName: string,
        days: number,
        reason: string,
        rejectedBy: string
    ) {
        await createNotification({
            userId: employeeId,
            title: '❌ Encashment Request Rejected',
            message: `Your encashment request for ${days} days has been rejected by ${rejectedBy}. Reason: ${reason}`,
            type: 'error',
            priority: 'high',
            moduleName: 'Leave Encashment',
            metadata: cleanMetadata({
                days,
                reason,
                rejectedBy,
                status: 'REJECTED'
            })
        });
    }

    async notifyEncashmentProcessed(
        employeeId: string,
        employeeName: string,
        days: number,
        netAmount: number,
        fiscalYear: string
    ) {
        await createNotification({
            userId: employeeId,
            title: '💰 Encashment Processed',
            message: `Your encashment for ${days} days ($${netAmount.toFixed(2)} net) for fiscal year ${fiscalYear} has been processed.`,
            type: 'success',
            priority: 'high',
            moduleName: 'Leave Encashment',
            metadata: cleanMetadata({
                days,
                netAmount,
                fiscalYear,
                status: 'PROCESSED'
            })
        });
    }

    async notifyBulkEncashmentProcessed(
        employeeIds: string[],
        fiscalYear: string,
        totalEmployees: number,
        totalAmount: number
    ) {
        for (const employeeId of employeeIds) {
            await createNotification({
                userId: employeeId,
                title: '📊 Year-End Encashment Processed',
                message: `Your encashment for fiscal year ${fiscalYear} has been processed as part of the year-end closing.`,
                type: 'info',
                priority: 'medium',
                moduleName: 'Year-End Processing',
                metadata: cleanMetadata({
                    fiscalYear,
                    totalEmployees,
                    totalAmount,
                    status: 'BULK_PROCESSED'
                })
            });
        }
    }

    // ============= YEAR-END PROCESSING NOTIFICATIONS =============

    async notifyYearEndStarted(
        processedBy: string,
        fiscalYear: string,
        adminIds: string[]
    ) {
        for (const adminId of adminIds) {
            await createNotification({
                userId: adminId,
                title: '🔄 Year-End Processing Started',
                message: `Year-end processing for fiscal year ${fiscalYear} has been started by ${processedBy}.`,
                type: 'info',
                priority: 'high',
                moduleName: 'Year-End Processing',
                metadata: cleanMetadata({
                    fiscalYear,
                    processedBy,
                    status: 'PROCESSING_STARTED'
                })
            });
        }
    }

    async notifyYearEndCompleted(
        fiscalYear: string,
        employeesProcessed: number,
        carryoverRecords: number,
        encashmentRecords: number,
        adminIds: string[]
    ) {
        for (const adminId of adminIds) {
            await createNotification({
                userId: adminId,
                title: '✅ Year-End Processing Completed',
                message: `Year-end processing for ${fiscalYear} completed. ${employeesProcessed} employees processed, ${carryoverRecords} carryover records, ${encashmentRecords} encashment records.`,
                type: 'success',
                priority: 'high',
                moduleName: 'Year-End Processing',
                metadata: cleanMetadata({
                    fiscalYear,
                    employeesProcessed,
                    carryoverRecords,
                    encashmentRecords,
                    status: 'COMPLETED'
                })
            });
        }
    }

    async notifyYearEndReverted(
        fiscalYear: string,
        revertedBy: string,
        adminIds: string[]
    ) {
        for (const adminId of adminIds) {
            await createNotification({
                userId: adminId,
                title: '↩️ Year-End Processing Reverted',
                message: `Year-end processing for fiscal year ${fiscalYear} has been reverted by ${revertedBy}.`,
                type: 'warning',
                priority: 'high',
                moduleName: 'Year-End Processing',
                metadata: cleanMetadata({
                    fiscalYear,
                    revertedBy,
                    status: 'REVERTED'
                })
            });
        }
    }

    // ============= LEAVE ASSIGNMENT NOTIFICATIONS =============

    async notifyLeaveAssigned(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        days: number,
        effectiveFrom: string,
        effectiveTo?: string
    ) {
        const message = effectiveTo
            ? `You have been assigned ${days} days of ${leaveType} leave from ${effectiveFrom} to ${effectiveTo}.`
            : `You have been assigned ${days} days of ${leaveType} leave effective from ${effectiveFrom}.`;

        await createNotification({
            userId: employeeId,
            title: '📅 Leave Assigned',
            message,
            type: 'info',
            priority: 'medium',
            moduleName: 'Leave Assignment',
            metadata: cleanMetadata({
                leaveType,
                days,
                effectiveFrom,
                effectiveTo,
                status: 'ASSIGNED'
            })
        });
    }

    async notifyLeaveExpiring(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        days: number,
        expiryDate: string
    ) {
        await createNotification({
            userId: employeeId,
            title: '⚠️ Leave Expiring Soon',
            message: `Your ${days} days of ${leaveType} leave will expire on ${expiryDate}. Please use it before it expires.`,
            type: 'warning',
            priority: 'high',
            moduleName: 'Leave Assignment',
            metadata: cleanMetadata({
                leaveType,
                days,
                expiryDate,
                status: 'EXPIRING'
            })
        });
    }

    async notifyCarryoverApplied(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        days: number,
        fromYear: string,
        toYear: string
    ) {
        await createNotification({
            userId: employeeId,
            title: '🔄 Leave Carryover Applied',
            message: `${days} days of ${leaveType} leave have been carried over from ${fromYear} to ${toYear}.`,
            type: 'success',
            priority: 'medium',
            moduleName: 'Leave Carryover',
            metadata: cleanMetadata({
                leaveType,
                days,
                fromYear,
                toYear,
                status: 'CARRIED_OVER'
            })
        });
    }

    async notifyLeaveBalanceAlert(
        employeeId: string,
        employeeName: string,
        leaveType: string,
        remainingDays: number,
        threshold: number
    ) {
        await createNotification({
            userId: employeeId,
            title: '📊 Leave Balance Alert',
            message: `Your ${leaveType} leave balance is ${remainingDays} days, which is below the threshold of ${threshold} days.`,
            type: 'warning',
            priority: 'medium',
            moduleName: 'Leave Balance',
            metadata: cleanMetadata({
                leaveType,
                remainingDays,
                threshold,
                status: 'BALANCE_ALERT'
            })
        });
    }

    // ============= APPROVAL ESCALATION NOTIFICATIONS =============

    async notifyApprovalEscalation(
        managerId: string,
        employeeName: string,
        days: number,
        amount: number,
        currentLevel: string,
        requestId: string
    ) {
        await createNotification({
            userId: managerId,
            title: '📋 Approval Escalation Required',
            message: `The encashment request from ${employeeName} for ${days} days ($${amount.toFixed(2)}) requires your ${currentLevel} approval.`,
            type: 'warning',
            priority: 'high',
            moduleName: 'Leave Encashment',
            metadata: cleanMetadata({
                employeeName,
                days,
                amount,
                currentLevel,
                requestId,
                status: 'ESCALATED'
            })
        });
    }

    // ============= REMINDER NOTIFICATIONS =============

    async notifyPendingApprovalsReminder(
        managerId: string,
        pendingCount: number,
        role: string
    ) {
        await createNotification({
            userId: managerId,
            title: '⏰ Pending Approvals Reminder',
            message: `You have ${pendingCount} pending encashment requests waiting for your ${role} approval.`,
            type: 'warning',
            priority: 'medium',
            moduleName: 'Leave Encashment',
            metadata: cleanMetadata({
                pendingCount,
                role,
                status: 'REMINDER'
            })
        });
    }

    async notifyEncashmentWindowOpen(
        employeeIds: string[],
        windowStart: string,
        windowEnd: string
    ) {
        for (const employeeId of employeeIds) {
            await createNotification({
                userId: employeeId,
                title: '📢 Encashment Window Open',
                message: `The leave encashment window is now open! Submit your requests between ${windowStart} and ${windowEnd}.`,
                type: 'info',
                priority: 'high',
                moduleName: 'Leave Encashment',
                metadata: cleanMetadata({
                    windowStart,
                    windowEnd,
                    status: 'WINDOW_OPEN'
                })
            });
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
        for (const userId of userIds) {
            await createNotification({
                userId,
                title,
                message,
                type,
                priority,
                moduleName,
                metadata: cleanMetadata(metadata)
            });
        }
    }
}

export const leaveNotificationService = LeaveNotificationService.getInstance();