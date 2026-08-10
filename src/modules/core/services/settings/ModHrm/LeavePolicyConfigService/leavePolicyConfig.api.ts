import { api } from "@/shared/services/api";
import type {
  LeavePolicyConfigListDto,
  LeavePolicyConfigAddDto,
  LeavePolicyConfigModDto,
  UUID,
} from "@/modules/core/types/Settings/leavePolicyConfig";
import type { StatChangeDto } from "@/modules/core/types/Settings/statChangeDto";

class LeavePolicyConfigApi {
  private baseUrl = "/hrm/leave/v1/Policy";

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (typeof errors === 'object') {
        return Object.values(errors).flat().join(", ");
      }
      return errors;
    }
    if (error.message) return error.message;
    return "An unexpected error occurred";
  }

  async getActiveById(id: UUID): Promise<LeavePolicyConfigListDto | null> {
    try {
      const response = await api.get(`${this.baseUrl}/Config/Active/${id}`);
      return response.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error fetching active config:", error);
      return null;
    }
  }

  async getAllById(id: UUID): Promise<LeavePolicyConfigListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/Config/All/${id}`);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching configs:", error);
      return [];
    }
  }

  async getById(id: UUID): Promise<LeavePolicyConfigListDto | null> {
    try {
      const response = await api.get(`${this.baseUrl}/Config/${id}`);
      return response.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async create(data: LeavePolicyConfigAddDto): Promise<LeavePolicyConfigListDto> {
    try {
      console.log("=== API CREATE CONFIGURATION ===");
      console.log("URL:", `${this.baseUrl}/Config/Add`);
      console.log("Request Data:", JSON.stringify(data, null, 2));

      const response = await api.post(`${this.baseUrl}/Config/Add`, data);

      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);

      return response.data?.data;
    } catch (error: any) {
      console.error("=== API ERROR ===");
      console.error("Status:", error.response?.status);
      console.error("Error Data:", error.response?.data);
      console.error("Error Message:", error.response?.data?.message);
      console.error("Error Errors:", error.response?.data?.errors);

      throw new Error(this.extractErrorMessage(error));
    }
  }

  async update(data: LeavePolicyConfigModDto): Promise<LeavePolicyConfigListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/Config/Update/${data.id}`, data);
      return response.data?.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async changeStatus(data: StatChangeDto): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/Config/Status`, data);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async delete(id: UUID): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Config/Delete/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const leavePolicyConfigApi = new LeavePolicyConfigApi();

export const leavePolicyConfigFetcher = {
  getById: (id: UUID) => leavePolicyConfigApi.getById(id),
  getActiveById: (id: UUID) => leavePolicyConfigApi.getActiveById(id),
  getAllById: (id: UUID) => leavePolicyConfigApi.getAllById(id),
  create: (data: LeavePolicyConfigAddDto) => leavePolicyConfigApi.create(data),
  update: (data: LeavePolicyConfigModDto) => leavePolicyConfigApi.update(data),
  changeStatus: (data: StatChangeDto) => leavePolicyConfigApi.changeStatus(data),
  delete: (id: UUID) => leavePolicyConfigApi.delete(id),
};