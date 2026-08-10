import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions 
} from '@tanstack/react-query';
import { holidayFetcher } from '@/modules/core/services/holiday/holiday.api';
import { holidayKeys } from '@/modules/core/services/holiday/holiday.keys';
import type { 
  HolidayListDto, 
  AddHolidayDto, 
  EditHolidayDto, 
  UUID 
} from '@/modules/core/types/holiday';
import type { HolidayFilters } from '@/modules/core/services/holiday/holiday.api';

// Query Hooks

export const useHolidays = (
  filters?: HolidayFilters,
  options?: Omit<UseQueryOptions<HolidayListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HolidayListDto[], Error>({
    queryKey: holidayKeys.list(filters),
    queryFn: () => holidayFetcher.getAllHolidays(),
    ...options,
  });
};

export const useHoliday = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<HolidayListDto, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HolidayListDto, Error>({
    queryKey: holidayKeys.detail(id!),
    queryFn: () => holidayFetcher.getHolidayById(id!),
    enabled: !!id,
    ...options,
  });
};

// Mutation Hooks

export const useCreateHoliday = (
  options?: Omit<UseMutationOptions<HolidayListDto, Error, AddHolidayDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<HolidayListDto, Error, AddHolidayDto>({
    mutationFn: holidayFetcher.createHoliday,
    onSuccess: (newHoliday) => {
      // Invalidate and refetch holidays list
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      
      console.info('Holiday created successfully:', newHoliday.id);
    },
    ...options,
  });
};

export const useUpdateHoliday = (
  options?: Omit<UseMutationOptions<HolidayListDto, Error, EditHolidayDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<HolidayListDto, Error, EditHolidayDto>({
    mutationFn: holidayFetcher.updateHoliday,
    onSuccess: (updatedHoliday) => {
      // Invalidate specific holiday detail
      queryClient.invalidateQueries({ 
        queryKey: holidayKeys.detail(updatedHoliday.id) 
      });
      
      // Invalidate holidays list
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      
      console.info('Holiday updated successfully:', updatedHoliday.id);
    },
    ...options,
  });
};

export const useDeleteHoliday = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, UUID>({
    mutationFn: holidayFetcher.deleteHoliday,
    onSuccess: (_, id) => {
      // Remove the specific holiday from cache
      queryClient.removeQueries({ queryKey: holidayKeys.detail(id) });
      
      // Invalidate holidays list
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      
      console.info('Holiday deleted successfully:', id);
    },
    ...options,
  });
};

// Optimistic update hook for better UX
export const useOptimisticUpdateHoliday = () => {
  const queryClient = useQueryClient();
  
  return useMutation<HolidayListDto, Error, EditHolidayDto, {
    previousHolidays: HolidayListDto[] | undefined;
  }>({
    mutationFn: holidayFetcher.updateHoliday,
    
    // When mutate is called:
    onMutate: async (updatedHoliday) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: holidayKeys.lists() });
      
      // Snapshot the previous value
      const previousHolidays = queryClient.getQueryData<HolidayListDto[]>(
        holidayKeys.lists()
      );
      
      // Optimistically update to the new value
      if (previousHolidays) {
        queryClient.setQueryData<HolidayListDto[]>(
          holidayKeys.lists(),
          old => old?.map(holiday => {
            if (holiday.id === updatedHoliday.id) {
              // Create a properly typed merged object
              const merged: HolidayListDto = {
                ...holiday,
                name: updatedHoliday.name,
                date: updatedHoliday.date,
                isPublic: updatedHoliday.isPublic,
                // Keep existing server-generated properties
                rowVersion: holiday.rowVersion,
              };
              return merged;
            }
            return holiday;
          })
        );
      }
      
      return { previousHolidays };
    },
    
    // If the mutation fails, roll back
    onError: (err, updatedHoliday, context) => {
      if (context?.previousHolidays) {
        queryClient.setQueryData(holidayKeys.lists(), context.previousHolidays);
      }
    },
    
    // Always refetch after error or success
    onSettled: (updatedHoliday) => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      
      if (updatedHoliday?.id) {
        queryClient.invalidateQueries({ 
          queryKey: holidayKeys.detail(updatedHoliday.id) 
        });
      }
    },
  });
};

// Utility hook for holiday options (useful for dropdowns)
export const useHolidayOptions = (fiscalYearId?: UUID) => {
  const { data: holidays, isLoading, error } = useHolidays();
  
  const options = holidays
    ?.filter(holiday => !fiscalYearId || holiday.fiscalYearId === fiscalYearId)
    ?.map(holiday => ({
      value: holiday.id,
      label: holiday.name,
      date: holiday.date,
      isPublic: holiday.isPublic,
      fiscalYearId: holiday.fiscalYearId,
    })) || [];
  
  return {
    options,
    isLoading,
    error,
  };
};