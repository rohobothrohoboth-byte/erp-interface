import { 
  useQuery, 
  useMutation, 
  useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions
} from '@tanstack/react-query';
import { companyFetcher } from '@/modules/core/services/company/company.api';
import { companyKeys } from '@/modules/core/services/company/company.keys';
import type { CompListDto, AddCompDto, EditCompDto, UUID } from '@/modules/core/types/comp';
import type { CompanyFilters } from '@/modules/core/services/company/company.api';

// Query Hooks

export const useCompanies = (
  filters?: CompanyFilters,
  options?: Omit<UseQueryOptions<CompListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CompListDto[], Error>({
    queryKey: companyKeys.list(filters),
    queryFn: () => companyFetcher.getAllCompanies(),
    ...options,
  });
};

export const useCompany = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<CompListDto, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CompListDto, Error>({
    queryKey: companyKeys.detail(id!),
    queryFn: () => companyFetcher.getCompanyById(id!),
    enabled: !!id,
    ...options,
  });
};

// Mutation Hooks

export const useCreateCompany = (
  options?: Omit<UseMutationOptions<CompListDto, Error, AddCompDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<CompListDto, Error, AddCompDto>({
    mutationFn: companyFetcher.createCompany,
    onSuccess: (newCompany) => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      
      // Also invalidate any branch queries that might show company names
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      
      console.info('Company created successfully:', newCompany.id);
    },
    ...options,
  });
};

export const useUpdateCompany = (
  options?: Omit<UseMutationOptions<CompListDto, Error, EditCompDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<CompListDto, Error, EditCompDto>({
    mutationFn: companyFetcher.updateCompany,
    onSuccess: (updatedCompany) => {
      // Invalidate specific company detail
      queryClient.invalidateQueries({ 
        queryKey: companyKeys.detail(updatedCompany.id as UUID) 
      });
      
      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      
      // Also invalidate any branch queries (since branch lists show company names)
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      
      console.info('Company updated successfully:', updatedCompany.id);
    },
    ...options,
  });
};

export const useDeleteCompany = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, UUID>({
    mutationFn: companyFetcher.deleteCompany,
    onSuccess: (_, id) => {
      // Remove the specific company from cache
      queryClient.removeQueries({ queryKey: companyKeys.detail(id) });
      
      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      
      // Also invalidate any branch queries (since companies might be referenced in branches)
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      
      console.info('Company deleted successfully:', id);
    },
    ...options,
  });
};

// Optimistic update hook for better UX
export const useOptimisticUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CompListDto, Error, EditCompDto, {
    previousCompanies: CompListDto[] | undefined;
  }>({
    mutationFn: companyFetcher.updateCompany,
    
    // When mutate is called:
    onMutate: async (updatedCompany) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: companyKeys.lists() });
      await queryClient.cancelQueries({ queryKey: companyKeys.detail(updatedCompany.id) });
      
      // Snapshot the previous value
      const previousCompanies = queryClient.getQueryData<CompListDto[]>(
        companyKeys.lists()
      );
      
      const previousCompanyDetail = queryClient.getQueryData<CompListDto>(
        companyKeys.detail(updatedCompany.id)
      );
      
      // Optimistically update the list
      if (previousCompanies) {
        queryClient.setQueryData<CompListDto[]>(
          companyKeys.lists(),
          old => old?.map(company => 
            company.id === updatedCompany.id 
              ? { ...company, ...updatedCompany } 
              : company
          )
        );
      }
      
      // Optimistically update the detail
      if (previousCompanyDetail) {
        queryClient.setQueryData<CompListDto>(
          companyKeys.detail(updatedCompany.id),
          { ...previousCompanyDetail, ...updatedCompany }
        );
      }
      
      return { previousCompanies };
    },
    
    // If the mutation fails, roll back
    onError: (err, updatedCompany, context) => {
      if (context?.previousCompanies) {
        queryClient.setQueryData(companyKeys.lists(), context.previousCompanies);
      }
    },
    
    // Always refetch after error or success
    onSettled: (updatedCompany) => {
      if (updatedCompany?.id) {
        queryClient.invalidateQueries({ 
          queryKey: companyKeys.detail(updatedCompany.id) 
        });
      }
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      
      // Also invalidate branch queries
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};

// Utility hook for company selection (useful for dropdowns)
export const useCompanyOptions = () => {
  const { data: companies, isLoading, error } = useCompanies();
  
  const options = companies?.map(company => ({
    value: company.id,
    label: company.name,
    amharicLabel: company.nameAm,
  })) || [];
  
  return {
    options,
    isLoading,
    error,
  };
};