// src/hooks/hr/leave/useFiscalYears.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { yearEndApi } from '../../../services/hr/leave/yearEndApi';
import type { FiscalYear } from '../../../types/hr/leave/leaveye';  // Type-only import

export const useFiscalYears = () => {
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<FiscalYear | null>(null);
    const [hasProcessedData, setHasProcessedData] = useState(false);

    const fetchFiscalYears = useCallback(async () => {
        try {
            const response = await yearEndApi.getFiscalYears();
            const years = response.data?.data || [];
            setFiscalYears(years);
            if (years.length > 0) {
                setSelectedYear(years[0]);
                await checkIfProcessed(years[0].id);
            }
        } catch (error) {
            toast.error('Failed to load fiscal years');
        }
    }, []);

    // In useFiscalYears.ts, ensure checkIfProcessed is working correctly

    const checkIfProcessed = useCallback(async (fiscalYearId: string) => {
        if (!fiscalYearId) return false;

        try {
            const response = await yearEndApi.canProcess(fiscalYearId);
            // canProcess returns false if already processed, true if can process
            const canProcess = response.data?.data;
            const isProcessed = !canProcess; // If cannot process, then it's already processed
            setHasProcessedData(isProcessed);
            return isProcessed;
        } catch (error) {
            console.error('Error checking if processed:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        fetchFiscalYears();
    }, [fetchFiscalYears]);

    return {
        fiscalYears,
        selectedYear,
        setSelectedYear,
        hasProcessedData,
        checkIfProcessed,
        refreshFiscalYears: fetchFiscalYears
    };
};