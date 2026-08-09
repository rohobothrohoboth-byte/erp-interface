// services/hr/leave/yearEndProcessing.ts

interface YearEndLeaveResult {
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    remainingDays: number;
    carriedOverDays: number;
    lostDays: number;
    encashedDays: number;
    encashmentAmount?: number;
    newBalance: number;
    effectiveFrom: Date;
    effectiveTo: Date | null;
}

class YearEndLeaveProcessor {

    async processYearEndLeave(employeeId: string, year: number): Promise<YearEndLeaveResult> {
        // 1. Get employee's current leave balance
        const currentBalance = await this.getEmployeeLeaveBalance(employeeId);

        // 2. Get leave policy configuration
        const policy = await this.getLeavePolicy(employeeId);

        // 3. Calculate year-end processing
        const result = await this.calculateYearEndRollover(
            currentBalance,
            policy,
            year
        );

        // 4. Apply the changes
        await this.applyYearEndChanges(employeeId, result);

        // 5. Send notifications
        await this.sendYearEndNotifications(employeeId, result);

        return result;
    }

    private async calculateYearEndRollover(
        balance: { remaining: number; used: number },
        policy: LeavePolicyConfig,
        year: number
    ): Promise<YearEndLeaveResult> {

        const remainingDays = balance.remaining;
        let carriedOverDays = 0;
        let lostDays = 0;
        let encashedDays = 0;
        let encashmentAmount: number | undefined;

        // Check if carryover is allowed
        if (policy.allowCarryover) {
            // Apply max carryover limit
            carriedOverDays = Math.min(remainingDays, policy.maxCarryoverDays || remainingDays);
            lostDays = remainingDays - carriedOverDays;
        } else {
            // No carryover - all days are lost
            lostDays = remainingDays;
            carriedOverDays = 0;
        }

        // Check for encashment option
        if (policy.allowEncashment && policy.maxEncashableDays) {
            encashedDays = Math.min(remainingDays, policy.maxEncashableDays);
            const dailySalary = await this.getEmployeeDailySalary(employeeId);
            encashmentAmount = encashedDays * dailySalary;

            // Adjust carried over days if encashment is taken first
            carriedOverDays = Math.max(0, carriedOverDays - encashedDays);
        }

        // Calculate new balance for next year
        const newYearEntitlement = policy.annualEntitlement;
        const newBalance = newYearEntitlement + carriedOverDays;

        // Set expiry for carried over days
        const effectiveTo = carriedOverDays > 0 && policy.carryoverExpiryMonths
            ? this.addMonths(new Date(year + 1, 0, 1), policy.carryoverExpiryMonths)
            : null;

        return {
            employeeId,
            employeeName: '',
            leaveTypeId: policy.leaveTypeId,
            leaveTypeName: '',
            remainingDays,
            carriedOverDays,
            lostDays,
            encashedDays,
            encashmentAmount,
            newBalance,
            effectiveFrom: new Date(year + 1, 0, 1),
            effectiveTo
        };
    }

    private addMonths(date: Date, months: number): Date {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    private async applyYearEndChanges(
        employeeId: string,
        result: YearEndLeaveResult
    ): Promise<void> {
        // Create a new leave policy assignment for the new year
        await leaveApi.createEmployeeLeavePolicy({
            employeeId,
            leaveTypeId: result.leaveTypeId,
            assignedEntitlement: result.newBalance,
            effectiveFrom: result.effectiveFrom,
            effectiveTo: result.effectiveTo,
            carriedOverFromPreviousYear: result.carriedOverDays,
            previousYearLost: result.lostDays,
            previousYearEncashed: result.encashedDays,
            encashmentAmount: result.encashmentAmount
        });

        // Close out the previous year's policy
        await leaveApi.closeEmployeeLeavePolicy(employeeId, result.effectiveFrom);
    }

    private async sendYearEndNotifications(
        employeeId: string,
        result: YearEndLeaveResult
    ): Promise<void> {
        const notifications = [];

        if (result.carriedOverDays > 0) {
            notifications.push({
                userId: employeeId,
                title: 'Leave Carryover Processed',
                message: `${result.carriedOverDays} days have been carried over to the new year. These will expire on ${result.effectiveTo?.toLocaleDateString()}`,
                type: 'info'
            });
        }

        if (result.lostDays > 0) {
            notifications.push({
                userId: employeeId,
                title: 'Leave Days Expired',
                message: `${result.lostDays} unused leave days have expired as carryover was not allowed or exceeded the limit.`,
                type: 'warning'
            });
        }

        if (result.encashmentAmount && result.encashmentAmount > 0) {
            notifications.push({
                userId: employeeId,
                title: 'Leave Encashment Processed',
                message: `${result.encashedDays} days have been encashed. Amount: ${result.encashmentAmount.toLocaleString()}`,
                type: 'success'
            });
        }

        notifications.push({
            userId: employeeId,
            title: 'New Year Leave Balance',
            message: `Your new leave balance for the year is ${result.newBalance} days (${result.carriedOverDays} carried over + ${result.newBalance - result.carriedOverDays} new entitlement).`,
            type: 'info'
        });

        // Send all notifications
        for (const notification of notifications) {
            await sendNotification(notification);
        }
    }
}