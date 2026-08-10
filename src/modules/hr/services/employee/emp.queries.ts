// src/services/hr/employee/emp.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empApi } from '@/modules/hr/services/employee/emp.api';
import { empKeys } from '@/modules/hr/services/employee/emp.keys';
import type { Step1Dto, Step2Dto, EmpAddRes, UUID } from '@/modules/hr/types/employee/empAddDto';
import type { EmployeeListDto } from '@/modules/hr/types/employee';

const STALE = 5 * 60 * 1000; // 5 minutes

// ── Queries ───────────────────────────────────────────────────────────────

export const useEmployeeList = () =>
    useQuery<EmployeeListDto[], Error>({
        queryKey: empKeys.list(),
        queryFn:  empApi.getAllEmployees,
        staleTime: STALE,
    });

// ✅ Add this new hook for employees (alias for useEmployeeList)
export const useEmployees = useEmployeeList;

// Or if you want a separate implementation:
// export const useEmployees = () => {
//   return useQuery<EmployeeListDto[], Error>({
//     queryKey: empKeys.list(),
//     queryFn: empApi.getAllEmployees,
//     staleTime: STALE,
//   });
// };

export const useEmpModBasic = (id: string) =>
    useQuery<any, Error>({
        queryKey: empKeys.modBasic(id),
        queryFn:  () => empApi.getModBasic(id),
        staleTime: STALE,
        enabled:  !!id,
    });

export const useEmpModBio = (id: string) =>
    useQuery<any, Error>({
        queryKey: empKeys.modBio(id),
        queryFn:  () => empApi.getModBio(id),
        staleTime: STALE,
        enabled:  !!id,
    });

export const useEmpModGuar = (id: string) =>
    useQuery<any, Error>({
        queryKey: empKeys.modGuar(id),
        queryFn:  () => empApi.getModGuar(id),
        staleTime: STALE,
        enabled:  !!id,
    });

export const useEmpPrint = (id: string) =>
    useQuery<any, Error>({
        queryKey: empKeys.print(id),
        queryFn:  () => empApi.getPrint(id as UUID),
        staleTime: STALE,
        enabled:  !!id,
    });

// ── Mutations ─────────────────────────────────────────────────────────────

export const useAddEmpStep1 = () => {
    const qc = useQueryClient();
    return useMutation<EmpAddRes, Error, Step1Dto>({
        mutationFn: empApi.addStep1,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: empKeys.list() });
        },
    });
};

export const useAddEmpStep2 = (employeeId: string) => {
    const qc = useQueryClient();
    return useMutation<EmpAddRes, Error, Step2Dto>({
        mutationFn: empApi.addStep2,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: empKeys.modBio(employeeId) });
        },
    });
};

export const useAddEmpStep4 = (employeeId: string) => {
    const qc = useQueryClient();
    return useMutation<EmpAddRes, Error, Step2Dto>({
        mutationFn: empApi.addStep4,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: empKeys.modGuar(employeeId) });
        },
    });
};

export const useDeleteEmployee = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, UUID>({
        mutationFn: empApi.deleteEmployee,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: empKeys.list() });
        },
    });
};