// services/core/settings/ModCore/core-module.api.ts

import { api } from '@/shared/services/api';

export interface CreateModuleDto {
    key: string;
    desc: string;
    icon?: string;
    order?: number;
}

export interface UpdateModuleDto {
    id: string;
    key: string;
    desc: string;
    icon?: string;
    order?: number;
}

export interface ModuleDto {
    id: string;
    key: string;
    desc: string;
    icon?: string;
    order?: number;
    dateAdd?: string;
    isDeleted?: boolean;
}

export const coreModuleApi = {
    // CHANGED: /PerModule/AllPerModule → /Permission/AllPerModule
    getAllModules: async (): Promise<ModuleDto[]> => {
        const response = await api.get('/auth/v1/Permission/AllPerModule');
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    // CHANGED: /PerModule/GetPerModule/{id} → /Permission/GetPerModule/{id}
    getModuleById: async (id: string): Promise<ModuleDto> => {
        const response = await api.get(`/auth/v1/Permission/GetPerModule/${id}`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    // CHANGED: /PerModule/AddPerModule → /Permission/AddPerModule
    createModule: async (data: CreateModuleDto): Promise<ModuleDto> => {
        const response = await api.post('/auth/v1/Permission/AddPerModule', data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    // CHANGED: /PerModule/ModPerModule/{id} → /Permission/ModPerModule/{id}
    updateModule: async (id: string, data: Partial<CreateModuleDto>): Promise<ModuleDto> => {
        const updateData = { id, ...data };
        const response = await api.put(`/auth/v1/Permission/ModPerModule/${id}`, updateData);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    // CHANGED: /PerModule/DelPerModule/{id} → /Permission/DelPerModule/{id}
    deleteModule: async (id: string): Promise<void> => {
        await api.delete(`/auth/v1/Permission/DelPerModule/${id}`);
    },
};