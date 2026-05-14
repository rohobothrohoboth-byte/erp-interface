import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { usermgmtFetcher } from './usermgmt.api';
import { usermgmtKeys } from './usermgmt.keys';
import type { Step1Dto, EmpAddRes, EmpAddPrintDto, UUID } from '../../../types/hr/employee/empAddDto';
import type { AdminEmpListDto, EmployeeListDto } from '../../../types/hr/employee';

export const useEmployees = (
  options?: Omit<UseQueryOptions<EmployeeListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<EmployeeListDto[], Error>({
    queryKey: usermgmtKeys.employees(),
    queryFn: usermgmtFetcher.getAllEmployees,
    ...options,
  });

  export const useAdminEmployees = (
  options?: Omit<UseQueryOptions<AdminEmpListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<AdminEmpListDto[], Error>({
    queryKey: usermgmtKeys.employees(),
    queryFn: usermgmtFetcher.getAllEmployeesAdmin,
    ...options,
  });

export const useEmployeeStep2Data = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<EmpAddPrintDto, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<EmpAddPrintDto, Error>({
    queryKey: usermgmtKeys.employeeStep2(id!),
    queryFn: () => usermgmtFetcher.getEmployeeStep2Data(id!),
    enabled: !!id,
    ...options,
  });

export const useAccountData = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<any, Error>({
    queryKey: usermgmtKeys.accountData(id!),
    queryFn: () => usermgmtFetcher.getAccountData(id!),
    enabled: !!id,
    ...options,
  });

export const useAddEmployeeStep1 = (
  options?: Omit<UseMutationOptions<EmpAddRes, Error, Step1Dto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<EmpAddRes, Error, Step1Dto>({
    mutationFn: usermgmtFetcher.addEmployeeStep1,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usermgmtKeys.employees() }),
    ...options,
  });
};

export const useDeleteAccount = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UUID>({
    mutationFn: usermgmtFetcher.deleteAccount,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: usermgmtKeys.accountData(id) });
      queryClient.invalidateQueries({ queryKey: usermgmtKeys.employees() });
    },
    ...options,
  });
};
