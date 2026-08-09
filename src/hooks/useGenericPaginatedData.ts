// hooks/useGenericPaginatedData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

export interface PaginationParams {
    pageNumber: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchTerm?: string;
    filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    unreadCount?: number;
}

interface UseGenericPaginatedDataOptions<T> {
    endpoint: string;
    initialPageSize?: number;
    cacheTime?: number; // in minutes
    enabled?: boolean;
    transformResponse?: (data: any) => PaginatedResult<T>;
}

export function useGenericPaginatedData<T>(
    options: UseGenericPaginatedDataOptions<T>
) {
    const {
        endpoint,
        initialPageSize = 10,
        cacheTime = 5,
        enabled = true,
        transformResponse
    } = options;

    const [data, setData] = useState<PaginatedResult<T> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<PaginationParams>({
        pageNumber: 1,
        pageSize: initialPageSize,
        sortBy: 'DateAdd',
        sortOrder: 'desc',
        searchTerm: '',
        filters: {}
    });

    // Cache
    const cacheRef = useRef<Map<string, { data: PaginatedResult<T>; timestamp: number }>>(new Map());
    const isPageChangeRef = useRef(false);
    const debounceTimerRef = useRef<NodeJS.Timeout>();

    // Generate cache key
    const getCacheKey = useCallback(() => {
        return `${endpoint}:${JSON.stringify(params)}`;
    }, [endpoint, params]);

    // Fetch data
    const fetchData = useCallback(async (skipCache = false) => {
        if (!enabled) return;

        const cacheKey = getCacheKey();

        // Check cache
        if (!skipCache && cacheRef.current.has(cacheKey)) {
            const cached = cacheRef.current.get(cacheKey)!;
            const ageMinutes = (Date.now() - cached.timestamp) / 1000 / 60;
            if (ageMinutes < cacheTime) {
                setData(cached.data);
                if (isPageChangeRef.current) {
                    isPageChangeRef.current = false;
                }
                return;
            }
        }

        if (!isPageChangeRef.current) {
            setLoading(true);
        }
        setError(null);

        try {
            // Build query string
            const queryParams = new URLSearchParams();
            queryParams.append('pageNumber', params.pageNumber.toString());
            queryParams.append('pageSize', params.pageSize.toString());
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
            if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);

            // Add custom filters
            if (params.filters) {
                Object.entries(params.filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value.toString());
                });
            }

            const url = `${endpoint}?${queryParams.toString()}`;
            const response = await api.get(url);

            let result = response.data.data as PaginatedResult<T>;
            if (transformResponse) {
                result = transformResponse(response.data.data);
            }

            // Ensure totalPages is calculated
            if (result.totalPages === undefined && result.totalCount) {
                result.totalPages = Math.ceil(result.totalCount / params.pageSize);
            }

            // Cache result
            cacheRef.current.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            console.error('Error fetching paginated data:', err);
        } finally {
            setLoading(false);
            isPageChangeRef.current = false;
        }
    }, [endpoint, params, enabled, cacheTime, getCacheKey, transformResponse]);

    // Auto fetch with debounce for search
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchData();
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [fetchData, params.searchTerm]);

    // Fetch when other params change
    useEffect(() => {
        fetchData();
    }, [fetchData, params.pageNumber, params.pageSize, params.sortBy, params.sortOrder, params.filters]);

    // Pagination controls
    const goToPage = useCallback((page: number) => {
        if (data && page >= 1 && page <= data.totalPages) {
            isPageChangeRef.current = true;
            setParams(prev => ({ ...prev, pageNumber: page }));
        }
    }, [data]);

    const nextPage = useCallback(() => {
        if (data?.hasNextPage) {
            isPageChangeRef.current = true;
            setParams(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }));
        }
    }, [data]);

    const previousPage = useCallback(() => {
        if (data?.hasPreviousPage) {
            isPageChangeRef.current = true;
            setParams(prev => ({ ...prev, pageNumber: prev.pageNumber - 1 }));
        }
    }, [data]);

    const setPageSize = useCallback((size: number) => {
        setParams(prev => ({ ...prev, pageSize: size, pageNumber: 1 }));
    }, []);

    const setSort = useCallback((sortBy: string, sortOrder?: 'asc' | 'desc') => {
        setParams(prev => ({
            ...prev,
            sortBy,
            sortOrder: sortOrder || (prev.sortOrder === 'asc' ? 'desc' : 'asc'),
            pageNumber: 1
        }));
    }, []);

    const setSearchTerm = useCallback((searchTerm: string) => {
        setParams(prev => ({ ...prev, searchTerm, pageNumber: 1 }));
    }, []);

    const setFilters = useCallback((filters: Record<string, any>) => {
        setParams(prev => ({ ...prev, filters, pageNumber: 1 }));
    }, []);

    const clearFilters = useCallback(() => {
        setParams({
            pageNumber: 1,
            pageSize: initialPageSize,
            sortBy: 'DateAdd',
            sortOrder: 'desc',
            searchTerm: '',
            filters: {}
        });
    }, [initialPageSize]);

    const refetch = useCallback(() => {
        const cacheKey = getCacheKey();
        cacheRef.current.delete(cacheKey);
        fetchData(true);
    }, [getCacheKey, fetchData]);

    return {
        data,
        loading,
        error,
        params,
        currentPage: params.pageNumber,
        pageSize: params.pageSize,
        totalPages: data?.totalPages || 0,
        totalItems: data?.totalCount || 0,
        hasNextPage: data?.hasNextPage || false,
        hasPreviousPage: data?.hasPreviousPage || false,
        goToPage,
        nextPage,
        previousPage,
        setPageSize,
        setSort,
        setSearchTerm,
        setFilters,
        clearFilters,
        refetch
    };
}