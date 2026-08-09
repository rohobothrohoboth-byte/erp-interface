// hooks/finance/useFinancialPeriods.ts

import { useState, useEffect, useCallback } from 'react';
import { getFinancialPeriods } from '../../services/finance/finance.api';
import { showToast } from '../../layout/layout';

export const useFinancialPeriods = () => {
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPeriods = useCallback(async (params?: { isClosed?: boolean; isActive?: boolean }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getFinancialPeriods(params || { isClosed: false, isActive: true });
            const data = response?.data?.data || response?.data || [];
            setPeriods(data);
            return data;
        } catch (error: any) {
            console.error('Error fetching financial periods:', error);
            const message = error?.response?.data?.message || 'Failed to load financial periods';
            setError(message);
            showToast.error(message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchPeriods({ isClosed: false, isActive: true });
    }, []);

    // Get active period
    const getActivePeriod = useCallback(() => {
        return periods.find(p => p.isActive || p.status === 'Open') || null;
    }, [periods]);

    // Get period by ID
    const getPeriodById = useCallback((id: string) => {
        return periods.find(p => p.id === id) || null;
    }, [periods]);

    return {
        periods,
        loading,
        error,
        fetchPeriods,
        getActivePeriod,
        getPeriodById,
    };
};