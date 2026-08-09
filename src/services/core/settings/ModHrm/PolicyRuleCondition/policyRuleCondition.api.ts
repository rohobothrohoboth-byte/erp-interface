import { api } from "../../../../api";
import type {
  PolicyRuleCondListDto,
  PolicyRuleCondAddDto,
  PolicyRuleCondModDto,
  UUID,
} from "../../../../../types/core/Settings/PolicyRuleCondtion";

class PolicyRuleConditionApi {
  // FIXED: Use correct path from LeavePolicyController
  // Endpoints are under: /Policy/Rule/Condition
  private baseUrl = "/hrm/leave/v1/Policy/Rule/Condition";

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      return Object.values(error.response.data.errors).flat().join(", ");
    }
    if (error.message) return error.message;
    return "An unexpected error occurred";
  }

  // Get by ID
  async getById(id: UUID): Promise<PolicyRuleCondListDto | null> {
    try {
      // GET /Policy/Rule/Condition/{id}
      const res = await api.get(`${this.baseUrl}/${id}`);
      return res.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Get All by Rule ID
  async getAllByRuleId(ruleId: UUID): Promise<PolicyRuleCondListDto[]> {
    try {
      // GET /Policy/Rule/Condition/All/{ruleId}
      const res = await api.get(`${this.baseUrl}/All/${ruleId}`);
      return res.data?.data || [];
    } catch (error) {
      console.error("Error fetching rule conditions:", error);
      return [];
    }
  }


// policyRuleCondition.api.ts - Fix the create method
  async create(data: PolicyRuleCondAddDto): Promise<PolicyRuleCondListDto> {
    try {
      // Send the data as-is (with PascalCase properties)
      console.log("Sending to backend:", data);
      const res = await api.post(`${this.baseUrl}/Add`, data);
      return res.data?.data;
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(this.extractErrorMessage(error));
    }
  }
  // Update
  async update(data: PolicyRuleCondModDto): Promise<PolicyRuleCondListDto> {
    try {
      // PUT /Policy/Rule/Condition/Update/{id}
      const res = await api.put(`${this.baseUrl}/Update/${data.id}`, data);
      return res.data?.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Delete
  async delete(id: UUID): Promise<void> {
    try {
      // DELETE /Policy/Rule/Condition/Delete/{id}
      await api.delete(`${this.baseUrl}/Delete/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const policyRuleConditionApi = new PolicyRuleConditionApi();

export const policyRuleConditionFetcher = {
  getById: (id: UUID) => policyRuleConditionApi.getById(id),
  getAllByRuleId: (ruleId: UUID) => policyRuleConditionApi.getAllByRuleId(ruleId),
  create: (data: PolicyRuleCondAddDto) => policyRuleConditionApi.create(data),
  update: (data: PolicyRuleCondModDto) => policyRuleConditionApi.update(data),
  delete: (id: UUID) => policyRuleConditionApi.delete(id),
};