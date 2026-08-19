import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions 
} from '@tanstack/react-query';
import { fiscalYearFetcher } from '@/modules/core/services/fiscalyear/fisc.api';
import { fiscKeys } from '@/modules/core/services/fiscalyear/fisc.keys';
import type { FiscYearListDto, AddFiscYearDto, EditFiscYearDto, UUID } from '@/modules/core/types/fisc';
import type { FiscalYearFilters } from '@/modules/core/services/fiscalyear/fisc.api';

// Query Hooks

export const useFiscalYears = (
  filters?: FiscalYearFilters,
  options?: Omit<UseQueryOptions<FiscYearListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FiscYearListDto[], Error>({
    queryKey: fiscKeys.list(filters),
    queryFn: () => fiscalYearFetcher.getAllFiscalYears(),
    ...options,
  });
};

export const useFiscalYear = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<FiscYearListDto, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FiscYearListDto, Error>({
    queryKey: fiscKeys.detail(id!),
    queryFn: () => fiscalYearFetcher.getFiscalYearById(id!),
    enabled: !!id,
    ...options,
  });
};

export const useActiveFiscalYear = (
  options?: Omit<UseQueryOptions<FiscYearListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  const { data: fiscalYears, ...rest } = useFiscalYears(undefined, options);
  
  const activeYear = fiscalYears?.find(year => year.isActive === '0') || null;
  
  return {
    data: activeYear,
    ...rest,
  };
};

// Alternative: Proper typed version of useActiveFiscalYear
export const useActiveFiscalYearQuery = (
  options?: Omit<UseQueryOptions<FiscYearListDto | null, Error, FiscYearListDto | null>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FiscYearListDto | null, Error>({
    queryKey: fiscKeys.activeYear(),
    queryFn: async () => {
      const fiscalYears = await fiscalYearFetcher.getAllFiscalYears();
      return fiscalYears.find(year => year.isActive === '0') || null;
    },
    ...options,
  });
};

// Simple hook version without options
export const useActiveFiscalYearSimple = () => {
  const { data: fiscalYears, ...rest } = useFiscalYears();
  
  const activeYear = fiscalYears?.find(year => year.isActive === '0') || null;
  
  return {
    activeYear,
    ...rest,
  };
};

// Mutation Hooks

export const useCreateFiscalYear = (
  options?: Omit<UseMutationOptions<FiscYearListDto, Error, AddFiscYearDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<FiscYearListDto, Error, AddFiscYearDto>({
    mutationFn: fiscalYearFetcher.createFiscalYear,
    onSuccess: (newFiscalYear) => {
      // Invalidate and refetch fiscal years list
      queryClient.invalidateQueries({ queryKey: fiscKeys.lists() });
      
      // If the new fiscal year is active, also invalidate active year query
      if (newFiscalYear.isActive === '0') {
        queryClient.invalidateQueries({ queryKey: fiscKeys.activeYear() });
      }
      
      console.info('Fiscal year created successfully:', newFiscalYear.id);
    },
    ...options,
  });
};

export const useUpdateFiscalYear = (
  options?: Omit<UseMutationOptions<FiscYearListDto, Error, EditFiscYearDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<FiscYearListDto, Error, EditFiscYearDto>({
    mutationFn: fiscalYearFetcher.updateFiscalYear,
    onSuccess: (updatedFiscalYear) => {
      // Invalidate specific fiscal year detail
      queryClient.invalidateQueries({ 
        queryKey: fiscKeys.detail(updatedFiscalYear.id) 
      });
      
      // Invalidate fiscal years list
      queryClient.invalidateQueries({ queryKey: fiscKeys.lists() });
      
      // Invalidate active year query
      queryClient.invalidateQueries({ queryKey: fiscKeys.activeYear() });
      
      console.info('Fiscal year updated successfully:', updatedFiscalYear.id);
    },
    ...options,
  });
};

export const useDeleteFiscalYear = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, UUID>({
    mutationFn: fiscalYearFetcher.deleteFiscalYear,
    onSuccess: (_, id) => {
      // Remove the specific fiscal year from cache
      queryClient.removeQueries({ queryKey: fiscKeys.detail(id) });
      
      // Invalidate fiscal years list
      queryClient.invalidateQueries({ queryKey: fiscKeys.lists() });
      
      // Invalidate active year query
      queryClient.invalidateQueries({ queryKey: fiscKeys.activeYear() });
      
      console.info('Fiscal year deleted successfully:', id);
    },
    ...options,
  });
};

// Optimistic update hook for better UX
export const useOptimisticUpdateFiscalYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation<FiscYearListDto, Error, EditFiscYearDto, {
    previousYears: FiscYearListDto[] | undefined;
  }>({
    mutationFn: fiscalYearFetcher.updateFiscalYear,
    
    // When mutate is called:
    onMutate: async (updatedFiscalYear) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: fiscKeys.lists() });
      await queryClient.cancelQueries({ queryKey: fiscKeys.activeYear() });
      
      // Snapshot the previous value
      const previousYears = queryClient.getQueryData<FiscYearListDto[]>(
        fiscKeys.lists()
      );
      
      // Optimistically update to the new value
      if (previousYears) {
        queryClient.setQueryData<FiscYearListDto[]>(
          fiscKeys.lists(),
          old => old?.map(year => {
            if (year.id === updatedFiscalYear.id) {
              // Create a properly typed merged object
              const merged: FiscYearListDto = {
                ...year,
                name: updatedFiscalYear.name,
                isActive: updatedFiscalYear.isActive,
                dateStart: updatedFiscalYear.dateStart,
                dateEnd: updatedFiscalYear.dateEnd,
                // Keep existing server-generated properties
                rowVersion: year.rowVersion,
              };
              return merged;
            }
            return year;
          })
        );
      }
      
      return { previousYears };
    },
    
    // If the mutation fails, roll back
    onError: (err, updatedFiscalYear, context) => {
      if (context?.previousYears) {
        queryClient.setQueryData(fiscKeys.lists(), context.previousYears);
      }
    },
    
    // Always refetch after error or success
    onSettled: (updatedFiscalYear) => {
      queryClient.invalidateQueries({ queryKey: fiscKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fiscKeys.activeYear() });
      
      if (updatedFiscalYear?.id) {
        queryClient.invalidateQueries({ 
          queryKey: fiscKeys.detail(updatedFiscalYear.id) 
        });
      }
    },
  });
};

// Utility hook for fiscal year options (useful for dropdowns)
export const useFiscalYearOptions = () => {
  const { data: fiscalYears, isLoading, error } = useFiscalYears();
  
  const options = fiscalYears?.map(year => ({
    value: year.id,
    label: year.name,
    isActive: year.isActive,
    dateStart: year.dateStart,
    dateEnd: year.dateEnd,
  })) || [];
  
  return {
    options,
    isLoading,
    error,
  };
};