// src/services/core/usermgmt/usermgmt.api.ts

import { api } from '@/shared/services/api';
import type { Step1Dto, EmpAddRes, EmpAddPrintDto, UUID } from '@/modules/hr/types/employee/empAddDto';
import type { AdminEmpListDto, EmployeeListDto } from '@/modules/hr/types/employee';

const toUtcIso = (date: string): string => {
  if (!date) return date;
  return new Date(date).toISOString();
};

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserListDto {
  id: string;
  code: string;
  empFullName: string;
  empFullNameAm: string;
  gender: string;
  department: string;
  position: string;
  branch: string;
  empState: string;
  hasAccount: boolean;
  isAccountActive: boolean;
  userId?: string;
}

class UsermgmtApi {
  // Auth service URL (for admin operations)
  private authUrl = import.meta.env.VITE_AUTH_URL || '/api/auth/v1';

  // Profile service URL (for employee operations)
  private profileUrl = import.meta.env.VITE_HRMM_PROFILE_URL || '/api/hrm/profile/v1';

  // Base URLs for different services
  private get adminEmpUrl() { return `${this.authUrl}/AdminEmp`; }
  private get employeeUrl() { return `${this.profileUrl}/Employee`; }
  private get addEmpUrl() { return `${this.authUrl}/AdminEmp`; }

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

  // Get all employees - using Admin endpoint from Auth service
  async getAllEmployeesAdmin(): Promise<AdminEmpListDto[]> {
    try {
      // Endpoint: /api/auth/v1/AdminEmp/AllEmployee
      const response = await api.get(`${this.adminEmpUrl}/AllEmployee`);
      return response.data.data;
    } catch (error) {
      console.error('API Error details:', error);
      console.error('Request URL:', `${this.adminEmpUrl}/AllEmployee`);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Get all employees - using Employee endpoint from Profile service
  async getAllEmployees(): Promise<EmployeeListDto[]> {
    try {
      // Endpoint: /api/hrm/profile/v1/Employee/AllEmployee
      const response = await api.get(`${this.employeeUrl}/AllEmployee`);
      return response.data.data;
    } catch (error) {
      console.error('API Error details:', error);
      console.error('Request URL:', `${this.employeeUrl}/AllEmployee`);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Get paginated users
  async getPaginatedUsers(params: {
    pageNumber: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchTerm?: string;
    department?: string;
    branch?: string;
    empState?: string;
    gender?: string;
  }): Promise<PaginatedResult<UserListDto>> {
    try {
      // Endpoint: /api/hrm/profile/v1/Employee/paginated
      const response = await api.get(`${this.employeeUrl}/paginated`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async addEmployeeStep1(step1: Step1Dto): Promise<EmpAddRes> {
    try {
      const formData = new FormData();
      formData.append('FirstName', step1.firstName);
      formData.append('FirstNameAm', step1.firstNameAm);
      formData.append('MiddleName', step1.middleName);
      formData.append('MiddleNameAm', step1.middleNameAm);
      formData.append('LastName', step1.lastName);
      formData.append('LastNameAm', step1.lastNameAm);
      formData.append('Nationality', step1.nationality);
      formData.append('Gender', step1.gender);
      formData.append('EmploymentDate', toUtcIso(step1.employmentDate));
      formData.append('JobGradeId', step1.jobGradeId);
      formData.append('PositionId', step1.positionId);
      formData.append('DepartmentId', step1.departmentId);
      formData.append('JgStepId', step1.jgStepId);
      formData.append('EmploymentType', step1.employmentType);
      formData.append('EmploymentNature', step1.employmentNature);
      formData.append('WorkArrangement', step1.workArrangement);
      formData.append('BirthDate', toUtcIso(step1.birthDate));
      formData.append('MaritalStatus', step1.maritalStatus);
      formData.append('AddressType', step1.addressType);
      formData.append('Country', step1.country);
      formData.append('Region', step1.region);
      formData.append('Subcity', step1.subcity || '');
      formData.append('Zone', step1.zone || '');
      formData.append('Woreda', step1.woreda || '');
      formData.append('Kebele', step1.kebele || '');
      formData.append('HouseNo', step1.houseNo || '');
      formData.append('Telephone', step1.telephone);
      formData.append('PoBox', step1.poBox || '');
      formData.append('Fax', step1.fax || '');
      formData.append('Email', step1.email || '');
      formData.append('Website', step1.website || '');
      if (step1.File) formData.append('File', step1.File);

      const response = await api.post(`${this.addEmpUrl}/Step1`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getEmployeeStep2Data(employeeId: UUID): Promise<EmpAddPrintDto> {
    try {
      const response = await api.get(`${this.addEmpUrl}/EmpAddPrint/${employeeId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getAccountData(employeeId: UUID): Promise<any> {
    try {
      // Endpoint: /api/auth/v1/Permission/GetAppUserIdByEmployeeId/{employeeId}
      const appUserResponse = await api.get(`${this.authUrl}/Permission/GetAppUserIdByEmployeeId/${employeeId}`);
      const appUserId = appUserResponse.data?.data?.AppUserId;

      if (appUserId) {
        return {
          hasAccount: true,
          userId: appUserId,
          employeeId: employeeId,
          isActive: true,
          modules: [],
          permissions: [],
          apiPermissions: [],
          roleId: null
        };
      }

      return {
        hasAccount: false,
        isActive: false,
        userId: null,
        modules: [],
        permissions: [],
        apiPermissions: [],
        roleId: null
      };
    } catch (error) {
      console.error("Failed to fetch account data:", error);
      return {
        hasAccount: false,
        isActive: false,
        userId: null,
        modules: [],
        permissions: [],
        apiPermissions: [],
        roleId: null
      };
    }
  }

  async deleteAccount(userId: UUID): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const usermgmtApi = new UsermgmtApi();

export const usermgmtFetcher = {
  getAllEmployees: () => usermgmtApi.getAllEmployees(),
  getAllEmployeesAdmin: () => usermgmtApi.getAllEmployeesAdmin(),
  getPaginatedUsers: (params: any) => usermgmtApi.getPaginatedUsers(params),
  addEmployeeStep1: (data: Step1Dto) => usermgmtApi.addEmployeeStep1(data),
  getEmployeeStep2Data: (id: UUID) => usermgmtApi.getEmployeeStep2Data(id),
  getAccountData: (id: UUID) => usermgmtApi.getAccountData(id),
  deleteAccount: (id: UUID) => usermgmtApi.deleteAccount(id),
};