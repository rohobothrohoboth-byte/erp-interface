// src/services/crm/lead.service.ts

import { crmApi } from '@/modules/crm/services/crm.api';
import type {
    LeadDto,
    CreateLeadDto,
    UpdateLeadDto,
    LeadFilterDto,
    LeadStatsDto,
    LeadBulkActionDto,
    ApiResponse
} from '@/modules/crm/types/crm.types';

// Lead Service - Wrapper for all lead-related API calls
export const leadService = {
    // Get all leads with filters
    getLeads: async (params?: LeadFilterDto) => {
        const response = await crmApi.get<ApiResponse<LeadDto[]>>('/Lead/AllLeads', { params });
        return response.data;
    },

    // Get lead by ID
    getLeadById: async (id: string) => {
        const response = await crmApi.get<ApiResponse<LeadDto>>(`/Lead/GetLead/${id}`);
        return response.data;
    },

    // Create lead
    createLead: async (data: CreateLeadDto) => {
        const response = await crmApi.post<ApiResponse<LeadDto>>('/Lead/AddLead', data);
        return response.data;
    },

    // Update lead
    updateLead: async (id: string, data: UpdateLeadDto) => {
        const response = await crmApi.put<ApiResponse<LeadDto>>(`/Lead/ModLead/${id}`, data);
        return response.data;
    },

    // Delete lead (soft delete)
    deleteLead: async (id: string) => {
        const response = await crmApi.delete<ApiResponse<void>>(`/Lead/DelLead/${id}`);
        return response.data;
    },

    // Convert lead to customer
    convertLead: async (id: string) => {
        const response = await crmApi.post<ApiResponse<LeadDto>>(`/Lead/ConvertLead/${id}`, {});
        return response.data;
    },

    // Assign lead to user
    assignLead: async (id: string, userId: string) => {
        const response = await crmApi.post<ApiResponse<LeadDto>>(`/Lead/AssignLead/${id}`, userId, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    },

    // Bulk action on leads
    bulkAction: async (data: LeadBulkActionDto) => {
        const response = await crmApi.post<ApiResponse<boolean>>('/Lead/BulkAction', data);
        return response.data;
    },

    // Bulk assign leads
    bulkAssign: async (leadIds: string[], userId: string) => {
        const response = await crmApi.post<ApiResponse<boolean>>('/Lead/BulkAssign', { leadIds, userId });
        return response.data;
    },

    // Get lead statistics
    getStats: async () => {
        const response = await crmApi.get<ApiResponse<LeadStatsDto>>('/Lead/Stats');
        return response.data;
    },

    // Get leads by status
    getLeadsByStatus: async (status: string) => {
        const response = await crmApi.get<ApiResponse<LeadDto[]>>(`/Lead/ByStatus/${status}`);
        return response.data;
    },

    // Get leads by assigned user
    getLeadsByAssignedUser: async (userId: string) => {
        const response = await crmApi.get<ApiResponse<LeadDto[]>>(`/Lead/ByAssignedUser/${userId}`);
        return response.data;
    },

    // Get leads for routing
    getLeadsForRouting: async () => {
        const response = await crmApi.get<ApiResponse<LeadDto[]>>('/Lead/ForRouting');
        return response.data;
    },

    // Get lead count
    getLeadCount: async (status?: string) => {
        const response = await crmApi.get<ApiResponse<number>>('/Lead/Count', {
            params: status ? { status } : undefined,
        });
        return response.data;
    },

    // Export leads
    exportLeads: async (params?: LeadFilterDto) => {
        const response = await crmApi.get('/Lead/Export', {
            params,
            responseType: 'blob' as const,
        });
        return response.data;
    },

    // Import leads
    importLeads: async (data: FormData) => {
        const response = await crmApi.post<ApiResponse<LeadDto[]>>('/Lead/Import', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Preview import
    previewImport: async (data: FormData) => {
        const response = await crmApi.post<ApiResponse<any>>('/Lead/PreviewImport', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Get lead groups
    getLeadGroups: async () => {
        const response = await crmApi.get<ApiResponse<any[]>>('/Lead/Groups');
        return response.data;
    },

    // Create lead group
    createLeadGroup: async (data: any) => {
        const response = await crmApi.post<ApiResponse<any>>('/Lead/Group', data);
        return response.data;
    },

    // Update lead group
    updateLeadGroup: async (id: string, data: any) => {
        const response = await crmApi.put<ApiResponse<any>>(`/Lead/Group/${id}`, data);
        return response.data;
    },

    // Delete lead group
    deleteLeadGroup: async (id: string) => {
        const response = await crmApi.delete<ApiResponse<void>>(`/Lead/Group/${id}`);
        return response.data;
    },

    // Get leads by group
    getLeadsByGroup: async (groupId: string) => {
        const response = await crmApi.get<ApiResponse<LeadDto[]>>(`/Lead/Group/${groupId}/Leads`);
        return response.data;
    },

    // Get routing rules
    getRoutingRules: async () => {
        const response = await crmApi.get<ApiResponse<any[]>>('/Lead/RoutingRules');
        return response.data;
    },

    // Create routing rule
    createRoutingRule: async (data: any) => {
        const response = await crmApi.post<ApiResponse<any>>('/Lead/RoutingRule', data);
        return response.data;
    },

    // Update routing rule
    updateRoutingRule: async (id: string, data: any) => {
        const response = await crmApi.put<ApiResponse<any>>(`/Lead/RoutingRule/${id}`, data);
        return response.data;
    },

    // Delete routing rule
    deleteRoutingRule: async (id: string) => {
        const response = await crmApi.delete<ApiResponse<void>>(`/Lead/RoutingRule/${id}`);
        return response.data;
    },

    // Route a lead
    routeLead: async (leadId: string) => {
        const response = await crmApi.post<ApiResponse<LeadDto>>(`/Lead/${leadId}/Route`);
        return response.data;
    },

    // Get routing stats
    getRoutingStats: async () => {
        const response = await crmApi.get<ApiResponse<any>>('/Lead/RoutingStats');
        return response.data;
    },

    // Get assigned leads stats
    getAssignedStats: async (userId: string) => {
        const response = await crmApi.get<ApiResponse<any>>(`/Lead/AssignedStats/${userId}`);
        return response.data;
    },
};

export default leadService;