import { api } from '../../api';
import type { Step1Dto, EmpAddRes, EmpAddPrintDto, UUID } from '../../../types/hr/employee/empAddDto';
import type { EmployeeListDto } from '../../../types/hr/employee';

const toUtcIso = (date: string): string => {
  if (!date) return date;
  return new Date(date).toISOString();
};

class UsermgmtApi {
  private baseUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/AdminEmp`;
  private baseUrlE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/Employee`;
  private addEmpUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/AddEmp`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

  async getAllEmployees(): Promise<EmployeeListDto[]> {
    try {
      const response = await api.get(`${this.baseUrlE}/AllEmployee`);
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

      const response = await api.post(`${this.baseUrl}/Step1`, formData, {
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
      const mockAccountData = {
        userId: employeeId,
        modules: ['module-1', 'module-2'],
        permissions: ['perm-1', 'perm-2'],
        apiPermissions: ['api-1', 'api-2'],
      };
      return mockAccountData;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
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
  addEmployeeStep1: (data: Step1Dto) => usermgmtApi.addEmployeeStep1(data),
  getEmployeeStep2Data: (id: UUID) => usermgmtApi.getEmployeeStep2Data(id),
  getAccountData: (id: UUID) => usermgmtApi.getAccountData(id),
  deleteAccount: (id: UUID) => usermgmtApi.deleteAccount(id),
};
