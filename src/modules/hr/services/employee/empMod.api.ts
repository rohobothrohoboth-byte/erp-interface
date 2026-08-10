import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/services/api';
import type { EmpModBasicDto, EmpModBioDto, EmpModGuarDto, ModFileDto } from '@/modules/hr/types/employee/empModDto';
import type { UUID } from 'crypto';

const BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/EmpMod`;

const toUtcIso = (date: string): string => (date ? new Date(date).toISOString() : date);

const extractError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const e = error as any;
    if (e.response?.data?.message) return e.response.data.message;
    if (e.response?.data?.errors)
      return (Object.values(e.response.data.errors) as string[][]).flat().join(', ');
    if (e.message) return e.message;
  }
  return 'An unexpected error occurred';
};

// ── Raw API calls ──────────────────────────────────────────────────────────

export const empModApi = {
  /** PUT /EmpMod/EmpBasicMod/{id} */
  updateBasic: async (id: UUID, dto: EmpModBasicDto): Promise<void> => {
    try {
      const form = new FormData();
      form.append('Id',               dto.id);
      form.append('RowVersion',       dto.rowVersion);
      form.append('BranchId',         dto.branchId);
      form.append('JobGradeId',       dto.jobGradeId);
      form.append('JgStepId',         dto.jgStepId);
      form.append('PositionId',       dto.positionId);
      form.append('DepartmentId',     dto.departmentId);
      form.append('FirstName',        dto.firstName);
      form.append('FirstNameAm',      dto.firstNameAm);
      form.append('MiddleName',       dto.middleName);
      form.append('MiddleNameAm',     dto.middleNameAm);
      form.append('LastName',         dto.lastName);
      form.append('LastNameAm',       dto.lastNameAm);
      form.append('Gender',           dto.gender);
      form.append('Nationality',      dto.nationality);
      form.append('EmploymentDate',   toUtcIso(dto.employmentDate));
      form.append('EmploymentType',   dto.employmentType);
      form.append('EmploymentNature', dto.employmentNature);
      form.append('WorkArrangement',  dto.workArrangement);
      if (dto.file) form.append('File', dto.file);

      await api.put(`${BASE}/EmpBasicMod/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  /** PUT /EmpMod/EmpBioMod/{id} */
  updateBio: async (id: UUID, dto: EmpModBioDto): Promise<void> => {
    try {
      await api.put(`${BASE}/EmpBioMod/${id}`, {
        ...dto,
        rowVersion: dto.rowVersion,
        birthDate: toUtcIso(dto.birthDate),
      });
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  /** PUT /EmpMod/EmpGuarMod/{id} */
  updateGuar: async (id: UUID, dto: EmpModGuarDto): Promise<void> => {
    try {
      const form = new FormData();
      form.append('Id',          dto.id);
      form.append('RowVersion',  dto.rowVersion);
      form.append('EmployeeId',  dto.employeeId);
      form.append('HasData',     String(dto.hasData));
      form.append('FirstName',   dto.firstName);
      form.append('MiddleName',  dto.middleName);
      form.append('LastName',    dto.lastName);
      form.append('Gender',      dto.gender);
      form.append('Nationality', dto.nationality);
      form.append('Relation',    dto.relation);
      form.append('AddressType', dto.addressType);
      form.append('Country',     dto.country    ?? '');
      form.append('Region',      dto.region);
      form.append('Subcity',     dto.subcity    ?? '');
      form.append('Zone',        dto.zone       ?? '');
      form.append('Woreda',      dto.woreda     ?? '');
      form.append('Kebele',      dto.kebele     ?? '');
      form.append('HouseNo',     dto.houseNo    ?? '');
      form.append('Telephone',   dto.telephone);
      form.append('PoBox',       dto.poBox      ?? '');
      form.append('Fax',         dto.fax        ?? '');
      form.append('Email',       dto.email      ?? '');
      form.append('Website',     dto.website    ?? '');
      if (dto.file) form.append('File', dto.file);

      await api.put(`${BASE}/EmpGuarMod/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  /** PUT /EmpMod/EmpStamp/{id} */
  updateStamp: async (dto: ModFileDto): Promise<void> => {
    try {
      const form = new FormData();
      form.append('Id',         dto.id);
      form.append('EmployeeId', dto.employeeId);
      form.append('File',       dto.file);
      await api.put(`${BASE}/EmpStamp/${dto.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  /** PUT /EmpMod/EmpSign/{id} */
  updateSign: async (dto: ModFileDto): Promise<void> => {
    try {
      const form = new FormData();
      form.append('Id',         dto.id);
      form.append('EmployeeId', dto.employeeId);
      form.append('File',       dto.file);
      await api.put(`${BASE}/EmpSign/${dto.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};

// ── React Query mutation hooks ─────────────────────────────────────────────

export const useUpdateEmpBasic = (employeeId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: EmpModBasicDto) => empModApi.updateBasic(employeeId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empMod', 'basic', employeeId] }),
  });
};

export const useUpdateEmpBio = (employeeId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: EmpModBioDto) => empModApi.updateBio(employeeId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empMod', 'bio', employeeId] }),
  });
};

export const useUpdateEmpGuar = (employeeId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: EmpModGuarDto) => empModApi.updateGuar(employeeId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empMod', 'guar', employeeId] }),
  });
};

export const useUpdateEmpStamp = () =>
  useMutation({ mutationFn: (dto: ModFileDto) => empModApi.updateStamp(dto) });

export const useUpdateEmpSign = () =>
  useMutation({ mutationFn: (dto: ModFileDto) => empModApi.updateSign(dto) });
