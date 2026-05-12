import { api } from '../../api';
import type { EmpAddRes, Step1Dto, Step2Dto, UUID } from '../../../types/hr/employee/empAddDto';
import type { EmployeeListDto } from '../../../types/hr/employee';

const ADD_BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/AddEmp`;
const EMP_BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/Employee`;
const MOD_BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/EmpMod`;

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

const get = async <T>(url: string): Promise<T> => {
  try {
    const res = await api.get(url);
    return res.data.data as T;
  } catch (e) {
    throw new Error(extractError(e));
  }
};

export const empApi = {
  // ── Queries ───────────────────────────────────────────────────────────────

  getAllEmployees: (): Promise<EmployeeListDto[]> =>
    get(`${EMP_BASE}/AllEmployee`),

  getEmployeeById: (id: string): Promise<any> =>
    get(`${EMP_BASE}/${id}`),

  // Edit-mode prefill
  getModBasic: (id: string): Promise<any> => get(`${MOD_BASE}/EmpModBasic/${id}`),
  getModBio:   (id: string): Promise<any> => get(`${MOD_BASE}/EmpModBio/${id}`),
  getModGuar:  (id: string): Promise<any> => get(`${MOD_BASE}/EmpModGuar/${id}`),

  // Review / print
  getPrint: (id: UUID): Promise<any> => get(`${ADD_BASE}/EmpAddPrint/${id}`),

  // ── Mutations ─────────────────────────────────────────────────────────────

  addStep1: async (step1: Step1Dto): Promise<EmpAddRes> => {
    try {
      const form = new FormData();
      form.append('FirstName',        step1.firstName);
      form.append('FirstNameAm',      step1.firstNameAm);
      form.append('MiddleName',       step1.middleName);
      form.append('MiddleNameAm',     step1.middleNameAm);
      form.append('LastName',         step1.lastName);
      form.append('LastNameAm',       step1.lastNameAm);
      form.append('Nationality',      step1.nationality);
      form.append('Gender',           step1.gender);
      form.append('EmploymentDate',   toUtcIso(step1.employmentDate));
      form.append('JobGradeId',       step1.jobGradeId);
      form.append('PositionId',       step1.positionId);
      form.append('DepartmentId',     step1.departmentId);
      form.append('JgStepId',         step1.jgStepId);
      form.append('EmploymentType',   step1.employmentType);
      form.append('EmploymentNature', step1.employmentNature);
      form.append('WorkArrangement',  step1.workArrangement);
      form.append('BirthDate',        toUtcIso(step1.birthDate));
      form.append('MaritalStatus',    step1.maritalStatus);
      form.append('AddressType',      step1.addressType);
      form.append('Country',          step1.country);
      form.append('Region',           step1.region);
      form.append('Subcity',          step1.subcity  ?? '');
      form.append('Zone',             step1.zone     ?? '');
      form.append('Woreda',           step1.woreda   ?? '');
      form.append('Kebele',           step1.kebele   ?? '');
      form.append('HouseNo',          step1.houseNo  ?? '');
      form.append('Telephone',        step1.telephone);
      form.append('PoBox',            step1.poBox    ?? '');
      form.append('Fax',              step1.fax      ?? '');
      form.append('Email',            step1.email    ?? '');
      form.append('Website',          step1.website  ?? '');
      if (step1.File) form.append('File', step1.File);

      const res = await api.post(`${ADD_BASE}/Step1`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data as EmpAddRes;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // Step2 is shared for both biographical and guarantor submissions
  addStep2: async (step2: Step2Dto): Promise<EmpAddRes> => {
    try {
      const form = new FormData();
      form.append('EmployeeId', step2.employeeId);
      form.append('FirstName',  step2.firstName);
      form.append('MiddleName', step2.middleName);
      form.append('LastName',   step2.lastName);
      form.append('Nationality',step2.nationality);
      form.append('Gender',     step2.gender);
      form.append('Relation',   step2.relation);
      form.append('AddressType',step2.addressType);
      form.append('Country',    step2.country);
      form.append('Region',     step2.region);
      form.append('Subcity',    step2.subcity  ?? '');
      form.append('Zone',       step2.zone     ?? '');
      form.append('Woreda',     step2.woreda   ?? '');
      form.append('Kebele',     step2.kebele   ?? '');
      form.append('HouseNo',    step2.houseNo  ?? '');
      form.append('Telephone',  step2.telephone);
      form.append('PoBox',      step2.poBox    ?? '');
      form.append('Fax',        step2.fax      ?? '');
      form.append('Email',      step2.email    ?? '');
      form.append('Website',    step2.website  ?? '');
      if (step2.File) form.append('File', step2.File);

      const res = await api.post(`${ADD_BASE}/Step2`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data as EmpAddRes;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // Guarantor reuses Step2 endpoint
  addStep4: (step2: Step2Dto): Promise<EmpAddRes> => empApi.addStep2(step2),

  deleteEmployee: async (id: UUID): Promise<void> => {
    try {
      await api.delete(`${EMP_BASE}/DelEmployee/${id}`);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};
