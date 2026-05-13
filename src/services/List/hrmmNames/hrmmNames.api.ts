import { api } from '../../api';
import type { NameListItem } from '../../../types/NameList/nameList';
import type { UUID } from '../../../types/List/list';
import type { NameListDto } from '../../../types/hr/NameListDto';
import type { BranchDeptList } from '../../../types/core/dept';

const baseUrl = `${import.meta.env.VITE_CORE_HRMM_URL || '/core/hrmm/v1'}/Names`;
const moduleBaseUrl = `${import.meta.env.VITE_CORE_MODULE_URL || '/core/module/v1'}/Names`;

export const hrmmNamesApi = {
  getAllAddressNames: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${baseUrl}/AllAddressName`);
    return response.data.data ?? response.data;
  },
  getAddressNameById: async (id: UUID): Promise<NameListItem> => {
    const response = await api.get(`${baseUrl}/GetAddressName/${id}`);
    return response.data.data ?? response.data;
  },
  getAllBenefitSetNames: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${baseUrl}/AllBenefitSetName`);
    return response.data.data ?? response.data;
  },
  getBenefitSetNameById: async (id: UUID): Promise<NameListItem> => {
    const response = await api.get(`${baseUrl}/GetBenefitSetName/${id}`);
    return response.data.data ?? response.data;
  },
  getAllEducationQualNames: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${baseUrl}/AllEducationQualName`);
    return response.data.data ?? response.data;
  },
  getEducationQualNameById: async (id: UUID): Promise<NameListItem> => {
    const response = await api.get(`${baseUrl}/GetEducationQualName/${id}`);
    return response.data.data ?? response.data;
  },
  getAllJobGradeNames: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${baseUrl}/AllJobGradeName`);
    return response.data.data ?? response.data;
  },
  getJobGradeNameById: async (id: UUID): Promise<NameListItem> => {
    const response = await api.get(`${baseUrl}/GetJobGradeName/${id}`);
    return response.data.data ?? response.data;
  },
  getAllPositionNames: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${baseUrl}/AllPositionName`);
    return response.data.data ?? response.data;
  },
  getDepartmentPositions: async (departmentId: UUID): Promise<NameListDto[]> => {
    const response = await api.get(`${baseUrl}/DeptPosition/${departmentId}`);
    return response.data.data ?? response.data;
  },
  getBranchComp: async (): Promise<NameListDto[]> => {
    const response = await api.get(`${moduleBaseUrl}/BranchCompList`);
    return response.data.data ?? response.data;
  },
  getAllDepartmentNames: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${moduleBaseUrl}/AllDeptName`);
    return response.data.data ?? response.data;
  },
  getDepartmentNameById: async (id: UUID): Promise<NameListItem> => {
    const response = await api.get(`${moduleBaseUrl}/GetDeptName/${id}`);
    return response.data.data ?? response.data;
  },
  getBranchDepartmentNames: async (branchId: UUID): Promise<BranchDeptList[]> => {
    const response = await api.get(`${moduleBaseUrl}/BranchDept/${branchId}`);
    return response.data.data ?? response.data;
  },
};
