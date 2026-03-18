import type {
  Step1Dto,
  EmpAddRes,
  BasicInfoDto,
  UUID,
} from "../../types/hr/employee/empAddDto";
import type { EmployeeListDto } from "../../types/hr/employee";
import { api } from "../api";

class UsermgmtService {
  private baseUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL || "/auth/v1"}/AdminEmp`;

  // Helper method to extract error messages
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      // Handle validation errors (object with field names as keys)
      const errors = error.response.data.errors;
      const errorMessages = Object.values(errors).flat();
      return errorMessages.join(", ");
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  }

  // GET: /api/auth/v1/AdminEmp/AllEmployee
  async getAllEmployees(): Promise<EmployeeListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllEmployee`);
      console.info("Fetched all employees successfully");
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Failed to fetch employees:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/auth/v1/AdminEmp/Step1
  async addEmployeeStep1(step1: Step1Dto): Promise<EmpAddRes> {
    try {
      const response = await api.post(`${this.baseUrl}/Step1`, step1, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.info(
        "Employee step 1 completed successfully:",
        response.data.data.id,
      );
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Failed to create employee step 1:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /api/auth/v1/AdminEmp/Step2/{id}
  async getEmployeeStep2Data(employeeId: UUID): Promise<BasicInfoDto> {
    try {
      const response = await api.get(`${this.baseUrl}/Step2/${employeeId}`);
      console.info("Fetched employee step 2 data successfully:", employeeId);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Failed to fetch employee step 2 data:", errorMessage);
      throw new Error(errorMessage);
    }
  }
  // GET: Fetch account data for editing (placeholder - replace with actual endpoint)
  async getAccountData(employeeId: UUID): Promise<any> {
    try {
      console.info("Fetching account data for employee:", employeeId);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock account data - replace with actual API call
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
      // TODO: Replace with actual API endpoint for deleting account
      // For now, simulate the delete operation
      console.info("Deleting account for user:", userId);

      // Simulate API call delay
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
