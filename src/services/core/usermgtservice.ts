import type {
  Step1Dto,
  EmpAddRes,
  EmpAddPrintDto,
  UUID,
} from "../../types/hr/employee/empAddDto";
import type { EmployeeListDto } from "../../types/hr/employee";
import { api } from "../api";

// Convert a date string (YYYY-MM-DD or ISO) to UTC ISO string for PostgreSQL
const toUtcIso = (date: string): string => {
  if (!date) return date;
  return new Date(date).toISOString();
};

class UsermgmtService {
  private baseUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL || "/hrm/profile/v1"}/AdminEmp`;
    private baseUrlE= `${import.meta.env.VITE_HRMM_PROFILE_URL || "/hrm/profile/v1"}/Employee`;
  private addEmpUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL || "/hrm/profile/v1"}/AddEmp`;

  // Helper method to extract error messages
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const errorMessages = Object.values(errors).flat();
      return errorMessages.join(", ");
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  }

  // GET: /api/hrm/profile/v1/AdminEmp/AllEmployee
  async getAllEmployees(): Promise<EmployeeListDto[]> {
    try {
      const response = await api.get(`${this.baseUrlE}/AllEmployee`);
      console.info("Fetched all employees successfully");
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Failed to fetch employees:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/hrm/profile/v1/AdminEmp/Step1 (multipart/form-data)
  async addEmployeeStep1(step1: Step1Dto): Promise<EmpAddRes> {
    try {
      const formData = new FormData();
      formData.append("FirstName", step1.firstName);
      formData.append("FirstNameAm", step1.firstNameAm);
      formData.append("MiddleName", step1.middleName);
      formData.append("MiddleNameAm", step1.middleNameAm);
      formData.append("LastName", step1.lastName);
      formData.append("LastNameAm", step1.lastNameAm);
      formData.append("Nationality", step1.nationality);
      formData.append("Gender", step1.gender);
      formData.append("EmploymentDate", toUtcIso(step1.employmentDate));
      formData.append("JobGradeId", step1.jobGradeId);
      formData.append("PositionId", step1.positionId);
      formData.append("DepartmentId", step1.departmentId);
      formData.append("JgStepId", step1.jgStepId);
      formData.append("EmploymentType", step1.employmentType);
      formData.append("EmploymentNature", step1.employmentNature);
      formData.append("WorkArrangement", step1.workArrangement);
      formData.append("BirthDate", toUtcIso(step1.birthDate));
      formData.append("MaritalStatus", step1.maritalStatus);
      formData.append("AddressType", step1.addressType);
      formData.append("Country", step1.country);
      formData.append("Region", step1.region);
      formData.append("Subcity", step1.subcity || "");
      formData.append("Zone", step1.zone || "");
      formData.append("Woreda", step1.woreda || "");
      formData.append("Kebele", step1.kebele || "");
      formData.append("HouseNo", step1.houseNo || "");
      formData.append("Telephone", step1.telephone);
      formData.append("PoBox", step1.poBox || "");
      formData.append("Fax", step1.fax || "");
      formData.append("Email", step1.email || "");
      formData.append("Website", step1.website || "");
      if (step1.File) formData.append("File", step1.File);

      const response = await api.post(`${this.baseUrl}/Step1`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.info("Employee step 1 completed successfully:", response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Failed to create employee step 1:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /api/hrm/profile/v1/AddEmp/EmpAddPrint/{id}
  async getEmployeeStep2Data(employeeId: UUID): Promise<EmpAddPrintDto> {
    try {
      const response = await api.get(`${this.addEmpUrl}/EmpAddPrint/${employeeId}`);
      console.info("Fetched employee print data successfully:", employeeId);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Failed to fetch employee print data:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getAccountData(employeeId: UUID): Promise<any> {
    try {
      const mockAccountData = {
        userId: employeeId,
        modules: ["module-1", "module-2"],
        permissions: ["perm-1", "perm-2"],
        apiPermissions: ["api-1", "api-2"],
      };
      return mockAccountData;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Failed to fetch account data:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  async deleteAccount(userId: UUID): Promise<void> {
    try {
      console.info("Deleting account for user:", userId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.info("Account deleted successfully:", userId);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Failed to delete account:", errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const usermgmtService = new UsermgmtService();
