// hooks/usePaginatedEmployees.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { empApi } from '@/modules/hr/services/employee/emp.api';
import type { EmployeeFilters, PaginatedResult, EmployeeListDto } from '@/modules/hr/services/employee/emp.api';
import { useAuthStore } from '@/shared/stores/auth.store';

interface UsePaginatedEmployeesOptions {
    initialPageSize?: number;
    cacheTime?: number; // in minutes
    enabled?: boolean;
}

export function usePaginatedEmployees(options: UsePaginatedEmployeesOptions = {}) {
    const { employeeId } = useAuthStore();
    const { initialPageSize = 10, cacheTime = 5, enabled = true } = options;

    const [data, setData] = useState<PaginatedResult<EmployeeListDto> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<EmployeeFilters>({
        pageNumber: 1,
        pageSize: initialPageSize,
        sortBy: 'DateAdd',
        sortOrder: 'desc',
        searchTerm: '',
        department: '',
        branch: '',
        empState: '',
        empNature: '',
        gender: ''
    });

    // Track if we're switching pages (for smoother UI)
    const isPageChangeRef = useRef(false);

    // Cache reference
    const cacheRef = useRef<Map<string, { data: PaginatedResult<EmployeeListDto>; timestamp: number }>>(new Map());

    // Generate cache key
    const getCacheKey = useCallback(() => {
        const { pageNumber, pageSize, sortBy, sortOrder, searchTerm, department, branch, empState, empNature, gender } = filters;
        return `employees:${pageNumber}:${pageSize}:${sortBy}:${sortOrder}:${searchTerm}:${department}:${branch}:${empState}:${empNature}:${gender}:${employeeId}`;
    }, [filters, employeeId]);

    // Fetch data
    const fetchData = useCallback(async (skipCache = false) => {
        if (!enabled) return;

        const cacheKey = getCacheKey();


        // Check cache first - IMMEDIATELY use cached data if available
        if (!skipCache && cacheRef.current.has(cacheKey)) {
            const cached = cacheRef.current.get(cacheKey)!;
            const ageMinutes = (Date.now() - cached.timestamp) / 1000 / 60;


            if (ageMinutes < cacheTime) {
                // For page changes, update immediately without showing loading
                if (isPageChangeRef.current) {
                    setData(cached.data);
                    isPageChangeRef.current = false;
                    return;
                }
                setData(cached.data);
                return;
            }
        }

        // Only show loading for non-page-change operations or when cache is stale
        if (!isPageChangeRef.current) {
            setLoading(true);
        }
        setError(null);

        try {
            const result = await empApi.getPaginatedEmployees(filters);


            // Update cache
            cacheRef.current.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees';
            console.error('❌ Error fetching data:', errorMessage);
            setError(errorMessage);
            // Don't clear existing data on error, keep showing old data
        } finally {
            setLoading(false);
            isPageChangeRef.current = false;
        }
    }, [filters, enabled, getCacheKey, cacheTime]);

    // Auto fetch when filters change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Pagination controls with smooth transitions
    const goToPage = useCallback((page: number) => {
        if (data && page >= 1 && page <= data.totalPages) {
            isPageChangeRef.current = true;
            setFilters(prev => ({ ...prev, pageNumber: page }));
        }
    }, [data]);

    const nextPage = useCallback(() => {
        if (data?.hasNextPage) {
            isPageChangeRef.current = true;
            setFilters(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }));
        }
    }, [data]);

    const previousPage = useCallback(() => {
        if (data?.hasPreviousPage) {
            isPageChangeRef.current = true;
            setFilters(prev => ({ ...prev, pageNumber: prev.pageNumber - 1 }));
        }
    }, [data]);

    const setPageSize = useCallback((size: number) => {
        setFilters(prev => ({ ...prev, pageSize: size, pageNumber: 1 }));
    }, []);

    const setSort = useCallback((sortBy: string, sortOrder?: 'asc' | 'desc') => {
        setFilters(prev => ({
            ...prev,
            sortBy,
            sortOrder: sortOrder || (prev.sortOrder === 'asc' ? 'desc' : 'asc'),
            pageNumber: 1
        }));
    }, []);

    const updateFilters = useCallback((newFilters: Partial<EmployeeFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, pageNumber: 1 }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            pageNumber: 1,
            pageSize: initialPageSize,
            sortBy: 'DateAdd',
            sortOrder: 'desc',
            searchTerm: '',
            department: '',
            branch: '',
            empState: '',
            empNature: '',
            gender: ''
        });
    }, [initialPageSize]);

    const refetch = useCallback(() => {
        // Clear cache for current key
        const cacheKey = getCacheKey();
        cacheRef.current.delete(cacheKey);
        fetchData(true);
    }, [getCacheKey, fetchData]);

    // Prefetch next page for smoother navigation
    useEffect(() => {
        if (data?.hasNextPage && data.pageNumber === filters.pageNumber) {
            const nextPageFilters = { ...filters, pageNumber: filters.pageNumber + 1 };
            const nextCacheKey = `employees:${nextPageFilters.pageNumber}:${nextPageFilters.pageSize}:${nextPageFilters.sortBy}:${nextPageFilters.sortOrder}:${nextPageFilters.searchTerm}:${nextPageFilters.department}:${nextPageFilters.branch}:${nextPageFilters.empState}:${nextPageFilters.empNature}:${nextPageFilters.gender}:${employeeId}`;

            // Prefetch next page if not in cache
            if (!cacheRef.current.has(nextCacheKey)) {
                setTimeout(() => {
                    empApi.getPaginatedEmployees(nextPageFilters).then(result => {
                        cacheRef.current.set(nextCacheKey, {
                            data: result,
                            timestamp: Date.now()
                        });
                    }).catch(() => {
                        // Silently fail prefetch
                    });
                }, 500);
            }
        }
    }, [data, filters, employeeId]);

    return {
        data,
        loading,
        error,
        filters,
        currentPage: filters.pageNumber,
        pageSize: filters.pageSize,
        totalPages: data?.totalPages || 0,
        totalItems: data?.totalCount || 0,
        hasNextPage: data?.hasNextPage || false,
        hasPreviousPage: data?.hasPreviousPage || false,
        goToPage,
        nextPage,
        previousPage,
        setPageSize,
        setSort,
        updateFilters,
        clearFilters,
        refetch
    };
}