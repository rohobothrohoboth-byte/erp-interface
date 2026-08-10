// src/hooks/hr/leave/useEncashment.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { yearEndApi } from '@/modules/hr/services/leave/yearEndApi';
import type { EncashmentRecord, EncashmentConfig, EncashmentRequest } from '@/modules/hr/types/leave/leaveye';
import { empApi } from '@/modules/hr/services/employee/emp.api';

let employeeNameCache: Map<string, string> = new Map();

const fetchEmployeeName = async (employeeId: string): Promise<string> => {
    if (employeeNameCache.has(employeeId)) return employeeNameCache.get(employeeId)!;
    try {
        const employee = await empApi.getEmployeeById(employeeId);
        const name = employee?.empFullName || employee?.empFullNameAm || employeeId.slice(0, 8);
        employeeNameCache.set(employeeId, name);
        return name;
    } catch {
        return employeeId.slice(0, 8);
    }
};

export const useEncashment = () => {
    const [encashmentHistory, setEncashmentHistory] = useState<EncashmentRecord[]>([]);
    const [loadingEncashment, setLoadingEncashment] = useState(false);
    const [encashmentConfig, setEncashmentConfig] = useState<Record<string, EncashmentConfig>>({});
    const [processingEncashment, setProcessingEncashment] = useState(false);

    const fetchEncashmentConfig = useCallback(async () => {
        try {
            const response = await yearEndApi.getEncashmentConfig();
            const configs = response.data?.data || {};
            setEncashmentConfig(configs);
        } catch (error) {
            console.error('Error fetching encashment config:', error);
        }
    }, []);

    const fetchEncashmentHistory = useCallback(async (employeeId?: string) => {
        if (!employeeId) {
            console.warn('No employeeId provided for fetchEncashmentHistory');
            return [];
        }

        setLoadingEncashment(true);
        try {
            const response = await yearEndApi.getEncashmentHistory(employeeId);
            let records = response.data?.data || [];

            // Ensure records is an array
            if (!Array.isArray(records)) {
                console.warn('Encashment history is not an array:', records);
                records = [];
            }

            console.log(`Fetched ${records.length} encashment records for employee ${employeeId}`);

            // Sort by date (newest first)
            records = records.sort((a: EncashmentRecord, b: EncashmentRecord) => {
                const dateA = a.requestDate || a.createdAt;
                const dateB = b.requestDate || b.createdAt;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

            // Enrich with employee names if needed
            const enrichedRecords = await Promise.all(
                records.map(async (record: EncashmentRecord) => ({
                    ...record,
                    employeeName: record.employeeName || await fetchEmployeeName(record.employeeId)
                }))
            );

            setEncashmentHistory(enrichedRecords);
            return enrichedRecords;
        } catch (error: any) {
            console.error('Error fetching encashment history:', error);
            toast.error(error?.response?.data?.message || 'Failed to fetch encashment history');
            setEncashmentHistory([]);
            return [];
        } finally {
            setLoadingEncashment(false);
        }
    }, []);

    // Alias for fetchEncashmentHistory
    const fetchEncashmentHistoryByEmployee = useCallback(async (employeeId: string) => {
        return fetchEncashmentHistory(employeeId);
    }, [fetchEncashmentHistory]);

    const processEncashment = useCallback(async (data: EncashmentRequest) => {
        setProcessingEncashment(true);
        try {
            const response = await yearEndApi.processEncashment(data);
            const result = response.data?.data;

            if (response.data?.success || result?.success) {
                toast.success(`Successfully encashed ${data.encashmentDays} days`);
                // Refresh history after successful encashment
                await fetchEncashmentHistory(data.employeeId);
                return true;
            } else {
                const errorMsg = response.data?.message || result?.message || 'Encashment failed';
                toast.error(errorMsg);
                return false;
            }
        } catch (error: any) {
            console.error('Process encashment error:', error);
            toast.error(error?.response?.data?.message || 'Failed to process encashment');
            return false;
        } finally {
            setProcessingEncashment(false);
        }
    }, [fetchEncashmentHistory]);

    // src/hooks/hr/leave/useEncashment.ts - Update fetchAllEncashments

    const fetchAllEncashments = useCallback(async (fiscalYearId?: string) => {
        setLoadingEncashment(true);
        try {
            // For now, since the backend doesn't have an "All" endpoint,
            // we'll need to fetch all employees' data.
            // This is a temporary solution until backend provides an admin endpoint.

            // First, get all employees (you'll need an endpoint for this)
            // Or you can fetch from the preview data which has all employees
            const previewResponse = await yearEndApi.getPreview(fiscalYearId || '');
            const previewData = previewResponse.data?.data || [];

            // Get unique employee IDs from preview data
            const employeeIds = [...new Set(previewData.map((item: any) => item.employeeId))];

            console.log(`Fetching encashment for ${employeeIds.length} employees`);

            // Fetch encashment history for each employee
            const allRecords: EncashmentRecord[] = [];

            for (const employeeId of employeeIds) {
                try {
                    const response = await yearEndApi.getEncashmentHistory(employeeId);
                    let records = response.data?.data || [];

                    if (Array.isArray(records)) {
                        // Add employee info to each record
                        const enrichedRecords = records.map((record: any) => ({
                            ...record,
                            employeeId: employeeId,
                            employeeName: record.employeeName || previewData.find((p: any) => p.employeeId === employeeId)?.employeeName
                        }));
                        allRecords.push(...enrichedRecords);
                    }
                } catch (err) {
                    console.error(`Failed to fetch for employee ${employeeId}:`, err);
                }
            }

            console.log(`Total records fetched: ${allRecords.length}`);
            setEncashmentHistory(allRecords);
            return allRecords;
        } catch (error) {
            console.error('Error fetching all encashments:', error);
            setEncashmentHistory([]);
            return [];
        } finally {
            setLoadingEncashment(false);
        }
    }, []);

    return {
        encashmentHistory,
        loadingEncashment,
        encashmentConfig,
        processingEncashment,
        fetchEncashmentConfig,
        fetchEncashmentHistory,
        fetchEncashmentHistoryByEmployee,
        fetchAllEncashments,
        processEncashment
    };
};