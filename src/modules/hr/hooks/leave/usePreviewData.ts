// src/hooks/hr/leave/usePreviewData.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { yearEndApi } from '@/modules/hr/services/leave/yearEndApi';
import type { CarryoverPreview } from '@/modules/hr/types/leave/leaveye';
import { empApi } from '@/modules/hr/services/employee/emp.api';

let employeeNameCache: Map<string, string> = new Map();

const fetchEmployeeName = async (employeeId: string): Promise<string> => {
    if (employeeNameCache.has(employeeId)) {
        return employeeNameCache.get(employeeId)!;
    }
    try {
        const employee = await empApi.getEmployeeById(employeeId);
        const name = employee?.empFullName || employee?.empFullNameAm || employeeId.slice(0, 8);
        employeeNameCache.set(employeeId, name);
        return name;
    } catch {
        return employeeId.slice(0, 8);
    }
};

export const usePreviewData = () => {
    const [previewData, setPreviewData] = useState<CarryoverPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [encashmentTotals, setEncashmentTotals] = useState<Record<string, number>>({});
    const [isAlreadyProcessed, setIsAlreadyProcessed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEncashmentTotals = useCallback(async (employeeIds: string[], fiscalYear: number) => {
        console.log('Fetching totals for employees:', employeeIds);
        console.log('Fiscal year:', fiscalYear);

        const totals: Record<string, number> = {};
        for (const employeeId of employeeIds) {
            try {
                const response = await yearEndApi.getEncashmentTotal(employeeId, fiscalYear);
                const total = response.data?.data?.totalEncashed || 0;
                totals[employeeId] = total;
                console.log(`Total for ${employeeId}: ${total}`);
            } catch (error) {
                console.error(`Error fetching total for ${employeeId}:`, error);
                totals[employeeId] = 0;
            }
        }
        console.log('Final totals object:', totals);
        setEncashmentTotals(totals);
        return totals;
    }, []);

    const fetchPreview = useCallback(async (fiscalYearId: string) => {
        setLoading(true);
        setIsAlreadyProcessed(false);
        setError(null);

        try {
            const response = await yearEndApi.getPreview(fiscalYearId);
            const responseData = response.data?.data;

            // Check if the response indicates already processed
            if (responseData?.isAlreadyProcessed === true) {
                setIsAlreadyProcessed(true);
                setError('Year-end processing has already been completed for this fiscal year.');
                console.log('Year-end already processed for this fiscal year');
                setPreviewData([]);
                return [];
            }

            let details = responseData?.details || (Array.isArray(responseData) ? responseData : []);

            // If no details and response is successful but empty, that's fine
            if (!details || details.length === 0) {
                console.log('No preview data available');
                setPreviewData([]);
                return [];
            }

            const enrichedDetails = await Promise.all(
                details.map(async (item: CarryoverPreview) => ({
                    ...item,
                    employeeName: await fetchEmployeeName(item.employeeId)
                }))
            );

            // Deduplicate
            const uniqueMap = new Map();
            for (const item of enrichedDetails) {
                const key = `${item.employeeId}|${item.leaveTypeId}`;
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, { ...item });
                } else {
                    const existing = uniqueMap.get(key);
                    existing.remainingBalance += item.remainingBalance;
                    existing.carryoverAmount += item.carryoverAmount;
                    existing.lostAmount += item.lostAmount;
                }
            }
            const uniqueDetails = Array.from(uniqueMap.values());

            setPreviewData(uniqueDetails);

            // Fetch encashment totals for these employees
            if (uniqueDetails.length > 0) {
                // Extract fiscal year number from the response or use current year
                const fiscalYearName = responseData?.fiscalYearName || '';
                const fiscalYear = parseInt(fiscalYearName) || new Date().getFullYear();
                const employeeIds = uniqueDetails.map(d => d.employeeId);
                const totals = await fetchEncashmentTotals(employeeIds, fiscalYear);

                // Update the preview data with encashment totals
                const updatedDetails = uniqueDetails.map(item => ({
                    ...item,
                    totalEncashed: totals[item.employeeId] || 0
                }));
                setPreviewData(updatedDetails);
            }

            setError(null);
            return uniqueDetails;
        } catch (error: any) {
            console.error('Failed to fetch preview:', error);

            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load preview';
            setError(errorMessage);

            // Check for different error types
            if (error?.response?.status === 400) {
                if (errorMessage.includes('has not ended yet') || errorMessage.includes('hasn\'t ended yet')) {
                    toast.error('This fiscal year has not ended yet. Please select a completed fiscal year.');
                } else if (errorMessage.includes('already been processed')) {
                    setIsAlreadyProcessed(true);
                    toast.error('Year-end processing has already been completed for this fiscal year.');
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error(errorMessage);
            }

            setPreviewData([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [fetchEncashmentTotals]);

    return {
        previewData,
        loading,
        encashmentTotals,
        isAlreadyProcessed,
        error,
        fetchPreview,
        fetchEncashmentTotals
    };
};