
// src/services/core/branch/branch.api.ts

import { api } from '../../api';
import type {
  Branch, BranchListDto, AddBranchDto, EditBranchDto, BranchCompListDto, UUID
} from '../../../types/core/branch';

class BranchApi {
  private baseUrl = `core/module/v1/Branch`;
  private braUrl = `core/module/v1/Names`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) return Object.values(error.response.data.errors).flat().join(', ');
    return error.message || 'An unexpected error occurred';
  }

  async getAllBranches(): Promise<BranchListDto[]> {
    try {
      const r = await api.get(`${this.baseUrl}/AllBranch`);
      console.log('All branches response:', r.data);
      return r.data?.data || [];
    }
    catch (e: any) {
      if (e.response?.status === 401) return [];
      console.error('Error fetching all branches:', this.extractErrorMessage(e));
      return [];
    }
  }

  async getBranchById(id: UUID): Promise<Branch> {
    const r = await api.get(`${this.baseUrl}/GetBranch/${id}`);
    return r.data.data;
  }

  async getCompanyBranches(companyId: UUID): Promise<BranchListDto[]> {
    try {
      const r = await api.get(`${this.baseUrl}/BranchComp/${companyId}`);
      return r.data?.data || [];
    }
    catch (e: any) {
      if (e.response?.status === 401) return [];
      console.error('Error fetching company branches:', this.extractErrorMessage(e));
      return [];
    }
  }

  // FIXED: Get branch list for dropdown - handles the response correctly
  async getBranchCompanyList(): Promise<BranchCompListDto[]> {
    try {
      console.log('Calling BranchCompList endpoint...');
      const r = await api.get(`${this.braUrl}/BranchCompList`);
      console.log('BranchCompList full response:', r);
      console.log('BranchCompList data:', r.data);

      // The response might be in different formats
      // Try multiple ways to extract the data
      let branches = [];

      if (r.data?.data) {
        // If it's wrapped in a data property
        branches = r.data.data;
      } else if (r.data?.result) {
        // If it's wrapped in a result property
        branches = r.data.result;
      } else if (Array.isArray(r.data)) {
        // If it's a direct array
        branches = r.data;
      } else {
        // If it's in a different structure
        branches = r.data || [];
      }

      console.log('Extracted branches:', branches);

      // Make sure we return an array
      if (!Array.isArray(branches)) {
        console.warn('Branches is not an array:', branches);
        return [];
      }

      // Map the data to the expected format
      return branches.map((branch: any) => ({
        id: branch.id || branch.branchId,
        name: branch.name || branch.branchName || 'Unknown',
        nameAm: branch.nameAm || branch.branchNameAm || branch.name || 'Unknown'
      }));
    }
    catch (e: any) {
      console.error('Error fetching branch list:', e);
      console.error('Error details:', this.extractErrorMessage(e));
      return [];
    }
  }

  async createBranch(branch: AddBranchDto): Promise<BranchListDto> {
    const r = await api.post(`${this.baseUrl}/AddBranch`, branch);
    return r.data.data;
  }

  async updateBranch(updateData: EditBranchDto): Promise<BranchListDto> {
    const r = await api.put(`${this.baseUrl}/ModBranch/${updateData.id}`, updateData);
    return r.data.data;
  }

  async deleteBranch(id: UUID): Promise<void> {
    await api.delete(`${this.baseUrl}/DelBranch/${id}`);
  }
}

export const branchApi = new BranchApi();
export const branchFetcher = {
  getAllBranches: () => branchApi.getAllBranches(),
  getBranchById: (id: UUID) => branchApi.getBranchById(id),
  getCompanyBranches: (companyId: UUID) => branchApi.getCompanyBranches(companyId),
  getBranchCompanyList: () => branchApi.getBranchCompanyList(),
  createBranch: (data: AddBranchDto) => branchApi.createBranch(data),
  updateBranch: (data: EditBranchDto) => branchApi.updateBranch(data),
  deleteBranch: (id: UUID) => branchApi.deleteBranch(id),
};