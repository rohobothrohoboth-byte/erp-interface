import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions 
} from '@tanstack/react-query';
import { departmentFetcher } from '@/modules/core/services/department/dept.api';
import { deptKeys } from '@/modules/core/services/department/dept.keys';
import type { 
  DeptListDto, 
  AddDeptDto, 
  EditDeptDto, 
  UUID, 
  BranchDeptList 
} from '@/modules/core/types/dept';
import type { DepartmentFilters } from '@/modules/core/services/department/dept.api';

// Query Hooks

export const useDepartments = (
  filters?: DepartmentFilters,
  options?: Omit<UseQueryOptions<DeptListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DeptListDto[], Error>({
    queryKey: deptKeys.list(filters),
    queryFn: () => departmentFetcher.getAllDepartments(),
    ...options,
  });
};

export const useDepartment = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<DeptListDto, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DeptListDto, Error>({
    queryKey: deptKeys.detail(id!),
    queryFn: () => departmentFetcher.getDepartmentById(id!),
    enabled: !!id,
    ...options,
  });
};

export const useBranchDepartmentNames = (
  branchId: UUID | undefined,
  options?: Omit<UseQueryOptions<BranchDeptList[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<BranchDeptList[], Error>({
    queryKey: deptKeys.branchDepartments(branchId!),
    queryFn: () => departmentFetcher.getBranchDepartmentNames(branchId!),
    enabled: !!branchId,
    ...options,
  });
};

// Mutation Hooks

export const useCreateDepartment = (
  options?: Omit<UseMutationOptions<DeptListDto, Error, AddDeptDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<DeptListDto, Error, AddDeptDto>({
    mutationFn: departmentFetcher.createDepartment,
    onSuccess: (newDepartment) => {
      // Invalidate and refetch departments list
      queryClient.invalidateQueries({ queryKey: deptKeys.lists() });
      
      // If new department has a branchId, also invalidate branch-specific queries
      if (newDepartment.branchId) {
        queryClient.invalidateQueries({ 
          queryKey: deptKeys.branchDepartments(newDepartment.branchId) 
        });
      }
      
      console.info('Department created successfully:', newDepartment.id);
    },
    ...options,
  });
};

export const useUpdateDepartment = (
  options?: Omit<UseMutationOptions<DeptListDto, Error, EditDeptDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<DeptListDto, Error, EditDeptDto>({
    mutationFn: departmentFetcher.updateDepartment,
    onSuccess: (updatedDepartment) => {
      // Invalidate specific department detail
      queryClient.invalidateQueries({ 
        queryKey: deptKeys.detail(updatedDepartment.id) 
      });
      
      // Invalidate departments list
      queryClient.invalidateQueries({ queryKey: deptKeys.lists() });
      
      // If department has a branchId, also invalidate branch-specific queries
      if (updatedDepartment.branchId) {
        queryClient.invalidateQueries({ 
          queryKey: deptKeys.branchDepartments(updatedDepartment.branchId) 
        });
      }
      
      console.info('Department updated successfully:', updatedDepartment.id);
    },
    ...options,
  });
};

export const useDeleteDepartment = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, UUID>({
    mutationFn: departmentFetcher.deleteDepartment,
    onSuccess: (_, id) => {
      // Remove the specific department from cache
      queryClient.removeQueries({ queryKey: deptKeys.detail(id) });
      
      // Invalidate departments list
      queryClient.invalidateQueries({ queryKey: deptKeys.lists() });
      
      // Invalidate all department queries to be safe
      queryClient.invalidateQueries({ queryKey: deptKeys.all });
      
      console.info('Department deleted successfully:', id);
    },
    ...options,
  });
};

// Optimistic update hook for better UX - Fixed version
export const useOptimisticUpdateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeptListDto, Error, EditDeptDto, {
    previousDepartments: DeptListDto[] | undefined;
    branchId?: UUID;
  }>({
    mutationFn: departmentFetcher.updateDepartment,
    
    // When mutate is called:
    onMutate: async (updatedDepartment) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: deptKeys.lists() });
      
      // Snapshot the previous value
      const previousDepartments = queryClient.getQueryData<DeptListDto[]>(
        deptKeys.lists()
      );
      
      // Optimistically update to the new value
      if (previousDepartments) {
        queryClient.setQueryData<DeptListDto[]>(
          deptKeys.lists(),
          old => old?.map(department => {
            if (department.id === updatedDepartment.id) {
              // Create a properly typed merged object
              // Note: We need to handle the deptStat type conversion
              // EditDeptDto has deptStat as string, DeptListDto has it as '0' | '1'
              const deptStat = (updatedDepartment.deptStat === '0' || updatedDepartment.deptStat === '1') 
                ? updatedDepartment.deptStat as '0' | '1'
                : department.deptStat;
              
              const merged: DeptListDto = {
                ...department,
                name: updatedDepartment.name,
                nameAm: updatedDepartment.nameAm,
                deptStat: deptStat,
                branchId: updatedDepartment.branchId,
                // Note: We cannot update rowVersion optimistically as it's server-generated
                // Keep the existing rowVersion for now
                rowVersion: department.rowVersion,
              };
              return merged;
            }
            return department;
          })
        );
      }
      
      return { previousDepartments, branchId: updatedDepartment.branchId };
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, updatedDepartment, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(deptKeys.lists(), context.previousDepartments);
      }
      
      if (context?.branchId) {
        queryClient.invalidateQueries({ 
          queryKey: deptKeys.branchDepartments(context.branchId) 
        });
      }
    },
    
    // Always refetch after error or success
    onSettled: (updatedDepartment, error) => {
      if (error) {
        // Only invalidate on error, success already handled by onSuccess
        queryClient.invalidateQueries({ queryKey: deptKeys.lists() });
      }
      
      if (updatedDepartment?.branchId) {
        queryClient.invalidateQueries({ 
          queryKey: deptKeys.branchDepartments(updatedDepartment.branchId) 
        });
      }
      
      if (updatedDepartment?.id) {
        queryClient.invalidateQueries({ 
          queryKey: deptKeys.detail(updatedDepartment.id) 
        });
      }
    },
  });
};

// Utility hook for department options (useful for dropdowns)
export const useDepartmentOptions = (branchId?: UUID) => {
  const { data: departments, isLoading, error } = useDepartments();
  
  const options = departments
    ?.filter(dept => !branchId || dept.branchId === branchId)
    ?.map(department => ({
      value: department.id,
      label: department.name,
      amharicLabel: department.nameAm,
      branchId: department.branchId,
    })) || [];
  
  return {
    options,
    isLoading,
    error,
  };
};

// Hook specifically for converting department status
export const useDepartmentStatus = () => {
  const getStatusText = (status: '0' | '1' | string): string => {
    if (status === '0') return 'Active';
    if (status === '1') return 'Inactive';
    return status;
  };

  const getStatusColor = (status: '0' | '1' | string): string => {
    if (status === '0') return 'bg-green-100 text-green-800 border border-green-200';
    if (status === '1') return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  return {
    getStatusText,
    getStatusColor,
  };
};