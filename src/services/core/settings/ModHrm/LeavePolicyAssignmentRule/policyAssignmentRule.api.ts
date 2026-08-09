import { api } from "../../../../api";
import type {
  PolicyAssignmentRuleListDto,
  PolicyAssignmentRuleAddDto,
  PolicyAssignmentRuleModDto,
  UUID,
} from "../../../../../types/core/Settings/policyAssignmentRule";
import type { StatChangeDto } from "../../../../../types/core/Settings/statChangeDto";

class PolicyAssignmentRuleApi {
  // From LeavePolicyController - endpoints under /Policy/Rule
  private baseUrl = "/hrm/leave/v1/Policy/Rule";

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      return Object.values(error.response.data.errors).flat().join(", ");
    }
    if (error.message) return error.message;
    return "An unexpected error occurred";
  }

  async getById(id: UUID): Promise<PolicyAssignmentRuleListDto | null> {
    try {
      const res = await api.get(`${this.baseUrl}/${id}`);
      return res.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getActiveById(id: UUID): Promise<PolicyAssignmentRuleListDto[]> {
    try {
      // GET /Policy/Rule/Active/{policyId}
      const res = await api.get(`${this.baseUrl}/Active/${id}`);
      return res.data?.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      console.error("Error fetching active assignment rules:", error);
      return [];
    }
  }

  async getAllByPolicyId(policyId: UUID): Promise<PolicyAssignmentRuleListDto[]> {
    try {
      // GET /Policy/Rule/All/{policyId}
      const res = await api.get(`${this.baseUrl}/All/${policyId}`);
      return res.data?.data || [];
    } catch (error) {
      console.error("Error fetching assignment rules:", error);
      return [];
    }
  }

  async create(data: PolicyAssignmentRuleAddDto): Promise<PolicyAssignmentRuleListDto> {
    try {
      // POST /Policy/Rule/Add
      const res = await api.post(`${this.baseUrl}/Add`, data);
      return res.data?.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async update(data: PolicyAssignmentRuleModDto): Promise<PolicyAssignmentRuleListDto> {
    try {
      // PUT /Policy/Rule/Update/{id}
      const res = await api.put(`${this.baseUrl}/Update/${data.id}`, data);
      return res.data?.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async changeStatus(data: StatChangeDto): Promise<void> {
    try {
      // PATCH /Policy/Rule/Status
      await api.patch(`${this.baseUrl}/Status`, data);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async delete(id: UUID): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Delete/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const policyAssignmentRuleApi = new PolicyAssignmentRuleApi();

export const policyAssignmentRuleFetcher = {
  getById: (id: UUID) => policyAssignmentRuleApi.getById(id),
  getActiveById: (id: UUID) => policyAssignmentRuleApi.getActiveById(id),
  getAllByPolicyId: (policyId: UUID) => policyAssignmentRuleApi.getAllByPolicyId(policyId),
  create: (data: PolicyAssignmentRuleAddDto) => policyAssignmentRuleApi.create(data),
  update: (data: PolicyAssignmentRuleModDto) => policyAssignmentRuleApi.update(data),
  changeStatus: (data: StatChangeDto) => policyAssignmentRuleApi.changeStatus(data),
  delete: (id: UUID) => policyAssignmentRuleApi.delete(id),
};