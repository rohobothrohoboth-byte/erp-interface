import { api } from '@/shared/services/api';
import type { NameListItem } from '@/modules/list/types/NameList/nameList';
import type { UUID } from '@/modules/list/types/list';
import type { NameListDto } from '@/modules/hr/types/NameListDto';
import type { BranchDeptList } from '@/modules/core/types/dept';

// FIXED: Use gateway paths with /v1/ for proper routing

// FIXED URLs (no /v1/):
const baseUrl = `core/hrmm/v1/Names`;       // Keep /v1/ for gateway catch-all
const moduleBaseUrl = `core/module/v1/Names`; // Keep /v1/ for gateway catch-all
export const hrmmNamesApi = {
  getAllAddressNames: async (): Promise<NameListItem[]> => {
    try {
      const response = await api.get(`${baseUrl}/AllAddressName`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
  getAddressNameById: async (id: UUID): Promise<NameListItem> => {
    try {
      const response = await api.get(`${baseUrl}/GetAddressName/${id}`);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      if (error.response?.status === 401) throw new Error('Permission denied');
      throw error;
    }
  },
  getAllBenefitSetNames: async (): Promise<NameListItem[]> => {
    try {
      const response = await api.get(`${baseUrl}/AllBenefitSetName`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
  getBenefitSetNameById: async (id: UUID): Promise<NameListItem> => {
    try {
      const response = await api.get(`${baseUrl}/GetBenefitSetName/${id}`);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      if (error.response?.status === 401) throw new Error('Permission denied');
      throw error;
    }
  },
  getAllEducationQualNames: async (): Promise<NameListItem[]> => {
    try {
      const response = await api.get(`${baseUrl}/AllEducationQualName`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
  getEducationQualNameById: async (id: UUID): Promise<NameListItem> => {
    try {
      const response = await api.get(`${baseUrl}/GetEducationQualName/${id}`);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      if (error.response?.status === 401) throw new Error('Permission denied');
      throw error;
    }
  },
  getAllJobGradeNames: async (): Promise<NameListItem[]> => {
    try {
      const response = await api.get(`${baseUrl}/AllJobGradeName`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
  getJobGradeNameById: async (id: UUID): Promise<NameListItem> => {
    try {
      const response = await api.get(`${baseUrl}/GetJobGradeName/${id}`);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      if (error.response?.status === 401) throw new Error('Permission denied');
      throw error;
    }
  },
  getAllPositionNames: async (): Promise<NameListItem[]> => {
    try {
      const response = await api.get(`${baseUrl}/AllPositionName`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
  getDepartmentPositions: async (departmentId: UUID): Promise<NameListDto[]> => {
    try {
      const response = await api.get(`${baseUrl}/DeptPosition/${departmentId}`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
  getBranchComp: async (): Promise<NameListDto[]> => {
    try {
      const response = await api.get(`${moduleBaseUrl}/BranchCompList`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
  getAllDepartmentNames: async (): Promise<NameListItem[]> => {
    try {
      const response = await api.get(`${moduleBaseUrl}/AllDeptName`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
  getDepartmentNameById: async (id: UUID): Promise<NameListItem> => {
    try {
      const response = await api.get(`${moduleBaseUrl}/GetDeptName/${id}`);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      if (error.response?.status === 401) throw new Error('Permission denied');
      throw error;
    }
  },
  getBranchDepartmentNames: async (branchId: UUID): Promise<BranchDeptList[]> => {
    try {
      const response = await api.get(`${moduleBaseUrl}/BranchDept/${branchId}`);
      return response.data?.data ?? response.data ?? [];
    } catch { return []; }
  },
};