// hooks/hr/useOnLeaveEmployees.ts
import { useState, useEffect, useCallback } from 'react';
import { leaveRequestService, type LeaveRequestDto } from '@/modules/hr/services/leave/leaveRequest.service';
import type { OnLeaveEmployee } from '@/modules/hr/components/dashboard/OnLeaveEmployee';

export const useOnLeaveEmployees = () => {
    const [employees, setEmployees] = useState<OnLeaveEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapToOnLeaveEmployee = (request: LeaveRequestDto): OnLeaveEmployee => {
        // Map leave type string to the expected union type
        const leaveTypeMap: Record<string, OnLeaveEmployee['leaveType']> = {
            'Annual': 'Annual',
            'Sick': 'Sick',
            'Maternity': 'Maternity',
            'Unpaid': 'Unpaid',
            'Paternity': 'Paternity',
            'Bereavement': 'Bereavement'
        };

        return {
            id: request.employeeId,
            empFullName: request.employeeName,
            empFullNameAm: request.employeeNameAm || '',
            gender: request.gender,
            department: request.department,
            position: request.position,
            branch: request.branch,
            leaveType: leaveTypeMap[request.leaveType] || 'Annual',
            startDate: request.startDate,
            endDate: request.endDate,
            days: request.daysRequested
        };
    };

    const fetchOnLeaveEmployees = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const onLeaveRequests = await leaveRequestService.getOnLeaveEmployees();
            const mappedEmployees = onLeaveRequests.map(mapToOnLeaveEmployee);
            setEmployees(mappedEmployees);
        } catch (err: any) {
            console.error('Failed to fetch on-leave employees:', err);
            setError(err?.message || 'Failed to load on-leave employees');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOnLeaveEmployees();
    }, [fetchOnLeaveEmployees]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchOnLeaveEmployees();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchOnLeaveEmployees]);

    return {
        employees,
        loading,
        error,
        refetch: fetchOnLeaveEmployees
    };
};