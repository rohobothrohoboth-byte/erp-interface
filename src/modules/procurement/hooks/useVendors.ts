// hooks/procurement/useVendors.ts

import { useState, useEffect, useCallback } from 'react';
import { getVendors } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';

export const useVendors = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getVendors({ isActive: true });
            const data = response?.data?.data || response?.data || [];
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            showToast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVendors();
    }, []);

    return { vendors, loading, fetchVendors };
};