import { api } from '../api';
import type { NameListItem } from '../../types/NameList/nameList';
import type { UUID } from '../../types/List/list';
import type { NameListDto } from '../../types/hr/NameListDto';

class NameListService {
  private baseUrl = `${import.meta.env.VITE_CORE_HRMM_URL || '/core/hrmm/v1'}/Names`;
  private moduleBaseUrl = `${import.meta.env.VITE_CORE_MODULE_URL || '/core/module/v1'}/Names`;

  async getAllAddressNames(): Promise<NameListItem[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllAddressName`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching address names:', error);
      throw error;
    }
  }

  async getAddressNameById(id: UUID): Promise<NameListItem> {
    try {
      const response = await api.get(`${this.baseUrl}/GetAddressName/${id}`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching address name:', error);
      throw error;
    }
  }

  async getAllBenefitSetNames(): Promise<NameListItem[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllBenefitSetName`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching benefit set names:', error);
      throw error;
    }
  }

  async getBenefitSetNameById(id: UUID): Promise<NameListItem> {
    try {
      const response = await api.get(`${this.baseUrl}/GetBenefitSetName/${id}`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching benefit set name:', error);
      throw error;
    }
  }

  async getAllEducationQualNames(): Promise<NameListItem[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllEducationQualName`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching education qualification names:', error);
      throw error;
    }
  }

  async getEducationQualNameById(id: UUID): Promise<NameListItem> {
    try {
      const response = await api.get(`${this.baseUrl}/GetEducationQualName/${id}`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching education qualification name:', error);
      throw error;
    }
  }

  async getAllJobGradeNames(): Promise<NameListItem[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllJobGradeName`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching job grade names:', error);
      throw error;
    }
  }

  async getJobGradeNameById(id: UUID): Promise<NameListItem> {
    try {
      const response = await api.get(`${this.baseUrl}/GetJobGradeName/${id}`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching job grade name:', error);
      throw error;
    }
  }

  async getAllPositionNames(): Promise<NameListItem[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllPositionName`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching position names:', error);
      throw error;
    }
  }

  async getDepartmentPositions(departmentId: UUID): Promise<NameListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/DeptPosition/${departmentId}`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching department positions:', error);
      throw error;
    }
  }

  async getBranchComp(): Promise<NameListDto[]> {
    try {
      const response = await api.get(`${this.moduleBaseUrl}/BranchCompList`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching branch comp list:', error);
      throw error;
    }
  }

  async getAllDepartmentNames(): Promise<NameListItem[]> {
    try {
      const response = await api.get(`${this.moduleBaseUrl}/AllDeptName`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching department names:', error);
      throw error;
    }
  }

  async getDepartmentNameById(id: UUID): Promise<NameListItem> {
    try {
      const response = await api.get(`${this.moduleBaseUrl}/GetDeptName/${id}`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching department name:', error);
      throw error;
    }
  }
}

export const nameListService = new NameListService();