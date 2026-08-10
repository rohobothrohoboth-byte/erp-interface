// src/hooks/hr/leave/useYearEndProcess.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { yearEndApi } from '@/modules/hr/services/leave/yearEndApi';
import type { ProcessResult } from '@/modules/hr/types/leave/leaveye';

export const useYearEndProcess = () => {
    const [processing, setProcessing] = useState(false);
    const [reverting, setReverting] = useState(false);
    const [processResult, setProcessResult] = useState<ProcessResult | null>(null);

    const fetchProcessResult = useCallback(async (fiscalYearId: string) => {
        try {
            // Check localStorage first since the API endpoint might not exist
            const stored = localStorage.getItem(`yearEndResult_${fiscalYearId}`);
            if (stored) {
                const parsedResult = JSON.parse(stored);
                // Only show if there's actual data
                if (parsedResult.employeesProcessed > 0 || parsedResult.carryoverRecordsCreated > 0) {
                    setProcessResult(parsedResult);
                    return parsedResult;
                } else {
                    localStorage.removeItem(`yearEndResult_${fiscalYearId}`);
                }
            }

            // Try to get from API if endpoint exists, otherwise return null
            try {
                const response = await yearEndApi.getProcessResult(fiscalYearId);
                if (response.data?.data) {
                    const result = response.data.data;
                    if (result.employeesProcessed > 0 || result.carryoverRecordsCreated > 0) {
                        setProcessResult(result);
                        localStorage.setItem(`yearEndResult_${fiscalYearId}`, JSON.stringify(result));
                        return result;
                    }
                }
            } catch (apiError) {
                // API endpoint doesn't exist, just use localStorage
                console.log('getProcessResult endpoint not available, using localStorage only');
            }

            setProcessResult(null);
            return null;
        } catch (error) {
            console.error('Error fetching process result:', error);
            setProcessResult(null);
            return null;
        }
    }, []);

    const processYearEnd = useCallback(async (fiscalYearId: string) => {
        setProcessing(true);
        try {
            const response = await yearEndApi.processYearEnd(fiscalYearId);
            const result = response.data?.data;
            setProcessResult(result);
            if (result?.success) {
                // Store result in localStorage
                if (result.employeesProcessed > 0 || result.carryoverRecordsCreated > 0) {
                    localStorage.setItem(`yearEndResult_${fiscalYearId}`, JSON.stringify(result));
                }
                toast.success(result.message);
                return true;
            } else {
                toast.error(result?.message || 'Processing failed');
                return false;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to process year-end');
            return false;
        } finally {
            setProcessing(false);
        }
    }, []);

    const revertYearEnd = useCallback(async (fiscalYear: number, fiscalYearId?: string) => {
        setReverting(true);
        try {
            const response = await yearEndApi.revertYearEnd(fiscalYear);
            if (response.data?.success) {
                toast.success('Year-end processing reverted successfully.');
                // Clear the process result state
                setProcessResult(null);
                // Clear localStorage for this fiscal year if ID is provided
                if (fiscalYearId) {
                    localStorage.removeItem(`yearEndResult_${fiscalYearId}`);
                } else {
                    // Clear all year-end results from localStorage
                    const keys = Object.keys(localStorage);
                    keys.forEach(key => {
                        if (key.startsWith('yearEndResult_')) {
                            localStorage.removeItem(key);
                        }
                    });
                }
                return true;
            } else {
                toast.error(response.data?.message || 'Revert failed');
                return false;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to revert year-end');
            return false;
        } finally {
            setReverting(false);
        }
    }, []);

    const resetProcessResult = useCallback(() => {
        setProcessResult(null);
    }, []);

    return {
        processing,
        reverting,
        processResult,
        fetchProcessResult,
        processYearEnd,
        revertYearEnd,
        resetProcessResult
    };
};