// services/profile/Experiance/experiance.api.ts

import { api } from "@/shared/services/api";
import type {
  EmpExpListDto,
  EmpExpAddDto,
  EmpExpModDto,
} from "@/modules/profile/types/EmpExp.types";
import type { EmpRevDto } from "@/modules/hr/types/employee/empAddDto";

const BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/EmpExp`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][])
        .flat()
        .join(", ");
  return error.message || "An unexpected error occurred";
};

export const experienceApi = {
  getAll: async (): Promise<EmpExpListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllEmpExp`);
      return res.data.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getById: async (id: string): Promise<EmpExpListDto> => {
    try {
      const res = await api.get(`${BASE}/GetEmpExp/${id}`);
      return res.data.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  create: async (data: EmpExpAddDto): Promise<string> => {
    try {
      const res = await api.post(`${BASE}/AddEmpExp`, data);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  update: async (data: EmpExpModDto): Promise<string> => {
    try {
      const res = await api.put(`${BASE}/ModEmpExp/${data.id}`, data);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // ✅ Add update status method
  updateStatus: async (id: string, status: string, rowVersion?: string): Promise<string> => {
    try {
      // Get the current record to get all fields
      const current = await experienceApi.getById(id);

      // Use provided rowVersion or get from current
      const currentRowVersion = rowVersion || current.rowVersion || '';

      // ✅ Format dates properly - handle null/undefined/empty
      const formatDateForApi = (date: any): string => {
        if (!date) {
          return new Date().toISOString();
        }

        try {
          if (typeof date === 'string') {
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
              return parsed.toISOString();
            }

            // Handle "MMM DD, YYYY" format
            const monthMap: Record<string, number> = {
              'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
              'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
            };

            const match = date.match(/([a-zA-Z]{3})\s+(\d{1,2}),\s+(\d{4})/);
            if (match) {
              const month = monthMap[match[1].toLowerCase()];
              const day = parseInt(match[2]);
              const year = parseInt(match[3]);
              if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                return new Date(year, month, day).toISOString();
              }
            }

            const dateMatch = date.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
              return new Date(
                  parseInt(dateMatch[1]),
                  parseInt(dateMatch[2]) - 1,
                  parseInt(dateMatch[3])
              ).toISOString();
            }
          }

          if (date instanceof Date) {
            return date.toISOString();
          }

          return new Date().toISOString();
        } catch (error) {
          console.error('Date formatting error:', error);
          return new Date().toISOString();
        }
      };

      // Build update data with proper date formats
      const updateData: EmpExpModDto = {
        id: id,
        company: current.company || '',
        posTitle: current.posTitle || '',
        location: current.location || '',
        respo: current.respo || '',
        startDate: formatDateForApi(current.startDate),
        endDate: formatDateForApi(current.endDate), // ✅ Always send a valid date
        status: status, // "1" for Approved, "2" for Rejected
        rowVersion: currentRowVersion,
      };

      const res = await api.put(`${BASE}/ModEmpExp/${id}`, updateData);
      return res.data.message;
    } catch (e) {
      console.error('Update experience error:', e);
      throw new Error(extractError(e));
    }
  },

  delete: async (id: string): Promise<string> => {
    try {
      const res = await api.delete(`${BASE}/DelEmpExp/${id}`);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  review: async (data: EmpRevDto): Promise<string> => {
    try {
      const res = await api.put(`${BASE}/ReviewExp/${data.id}`, data);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  reviewAll: async (data: EmpRevDto): Promise<string> => {
    try {
      const res = await api.put(`${BASE}/ReviewExpAll/${data.id}`, data);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};