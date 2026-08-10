import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions 
} from '@tanstack/react-query';
import { periodFetcher } from '@/modules/core/services/period/period.api';
import { periodKeys } from '@/modules/core/services/period/period.keys';
import type { 
  PeriodListDto, 
  AddPeriodDto, 
  EditPeriodDto, 
  UUID 
} from '@/modules/core/types/period';
import type { PeriodFilters } from '@/modules/core/services/period/period.api';

// Query Hooks

export const usePeriods = (
  filters?: PeriodFilters,
  options?: Omit<UseQueryOptions<PeriodListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PeriodListDto[], Error>({
    queryKey: periodKeys.list(filters),
    queryFn: () => periodFetcher.getAllPeriods(),
    ...options,
  });
};

export const usePeriod = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<PeriodListDto, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PeriodListDto, Error>({
    queryKey: periodKeys.detail(id!),
    queryFn: () => periodFetcher.getPeriodById(id!),
    enabled: !!id,
    ...options,
  });
};

export const useActivePeriods = (
  filters?: Omit<PeriodFilters, 'activeOnly'>,
  options?: Omit<UseQueryOptions<PeriodListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return usePeriods(
    { ...filters, activeOnly: true },
    options
  );
};

// Simple hook for active periods only
export const useActivePeriodsOnly = () => {
  const { data: periods, ...rest } = usePeriods();
  
  const activePeriods = periods?.filter(period => period.isActive === "0") || [];
  
  return {
    data: activePeriods,
    ...rest,
  };
};

// Mutation Hooks

export const useCreatePeriod = (
  options?: Omit<UseMutationOptions<PeriodListDto, Error, AddPeriodDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<PeriodListDto, Error, AddPeriodDto>({
    mutationFn: periodFetcher.createPeriod,
    onSuccess: (newPeriod) => {
      // Invalidate and refetch periods list
      queryClient.invalidateQueries({ queryKey: periodKeys.lists() });
      
      // Invalidate active periods
      queryClient.invalidateQueries({ queryKey: periodKeys.activePeriods() });
      
      console.info('Period created successfully:', newPeriod.id);
    },
    ...options,
  });
};

export const useUpdatePeriod = (
  options?: Omit<UseMutationOptions<PeriodListDto, Error, EditPeriodDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<PeriodListDto, Error, EditPeriodDto>({
    mutationFn: periodFetcher.updatePeriod,
    onSuccess: (updatedPeriod) => {
      // Invalidate specific period detail
      queryClient.invalidateQueries({ 
        queryKey: periodKeys.detail(updatedPeriod.id) 
      });
      
      // Invalidate periods list
      queryClient.invalidateQueries({ queryKey: periodKeys.lists() });
      
      // Invalidate active periods
      queryClient.invalidateQueries({ queryKey: periodKeys.activePeriods() });
      
      console.info('Period updated successfully:', updatedPeriod.id);
    },
    ...options,
  });
};

export const useDeletePeriod = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, UUID>({
    mutationFn: periodFetcher.deletePeriod,
    onSuccess: (_, id) => {
      // Remove the specific period from cache
      queryClient.removeQueries({ queryKey: periodKeys.detail(id) });
      
      // Invalidate periods list
      queryClient.invalidateQueries({ queryKey: periodKeys.lists() });
      
      // Invalidate active periods
      queryClient.invalidateQueries({ queryKey: periodKeys.activePeriods() });
      
      console.info('Period deleted successfully:', id);
    },
    ...options,
  });
};

// Optimistic update hook for better UX
export const useOptimisticUpdatePeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PeriodListDto, Error, EditPeriodDto, {
    previousPeriods: PeriodListDto[] | undefined;
  }>({
    mutationFn: periodFetcher.updatePeriod,
    
    // When mutate is called:
    onMutate: async (updatedPeriod) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: periodKeys.lists() });
      
      // Snapshot the previous value
      const previousPeriods = queryClient.getQueryData<PeriodListDto[]>(
        periodKeys.lists()
      );
      
      // Optimistically update to the new value
      if (previousPeriods) {
        queryClient.setQueryData<PeriodListDto[]>(
          periodKeys.lists(),
          old => old?.map(period => {
            if (period.id === updatedPeriod.id) {
              // Create a properly typed merged object
              const merged: PeriodListDto = {
                ...period,
                name: updatedPeriod.name,
                dateStart: updatedPeriod.dateStart,
                dateEnd: updatedPeriod.dateEnd,
                isActive: updatedPeriod.isActive,
                quarter: updatedPeriod.quarter,
                fiscalYearId: updatedPeriod.fiscalYearId,
                // Keep existing server-generated properties
                rowVersion: period.rowVersion,
              };
              return merged;
            }
            return period;
          })
        );
      }
      
      return { previousPeriods };
    },
    
    // If the mutation fails, roll back
    onError: (err, updatedPeriod, context) => {
      if (context?.previousPeriods) {
        queryClient.setQueryData(periodKeys.lists(), context.previousPeriods);
      }
    },
    
    // Always refetch after error or success
    onSettled: (updatedPeriod) => {
      queryClient.invalidateQueries({ queryKey: periodKeys.lists() });
      
      if (updatedPeriod?.id) {
        queryClient.invalidateQueries({ 
          queryKey: periodKeys.detail(updatedPeriod.id) 
        });
      }
    },
  });
};

// Utility hook for period options (useful for dropdowns)
export const usePeriodOptions = (fiscalYearId?: UUID) => {
  const { data: periods, isLoading, error } = usePeriods();
  
  const options = periods
    ?.filter(period => !fiscalYearId || period.fiscalYearId === fiscalYearId)
    ?.map(period => ({
      value: period.id,
      label: period.name,
      quarter: period.quarter,
      dateStart: period.dateStart,
      dateEnd: period.dateEnd,
      isActive: period.isActive,
      fiscalYearId: period.fiscalYearId,
    })) || [];
  
  return {
    options,
    isLoading,
    error,
  };
};

// Hook for date validation and formatting
export const usePeriodValidation = () => {
  const validateDates = (dateStart: string, dateEnd: string): string | null => {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    
    if (end <= start) {
      return 'End date must be after start date';
    }
    
    return null;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return {
    validateDates,
    formatDateForDisplay,
  };
};