// services/profile/Education/education.api.ts

import { api } from "@/shared/services/api";
import type {
  EmpEduListDto,
  EmpEduAddDto,
  EmpEduModDto,
} from "@/modules/profile/types/EmpEdu.types";
import type { EmpRevDto } from "@/modules/hr/types/employee/empAddDto";

const BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/EmpEdu`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][])
        .flat()
        .join(", ");
  return error.message || "An unexpected error occurred";
};

export const educationApi = {
  getAll: async (): Promise<EmpEduListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllEmpEdu`);
      return res.data.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getById: async (id: string): Promise<EmpEduListDto> => {
    try {
      const res = await api.get(`${BASE}/GetEmpEdu/${id}`);
      return res.data.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  create: async (data: EmpEduAddDto): Promise<string> => {
    try {
      const res = await api.post(`${BASE}/AddEmpEdu`, data);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  update: async (data: EmpEduModDto): Promise<string> => {
    try {
      const res = await api.put(`${BASE}/ModEmpEdu/${data.id}`, data);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // ✅ Add update status method
  updateStatus: async (id: string, status: string, rowVersion?: string): Promise<string> => {
    try {
      // Get the current record to get all fields
      const current = await educationApi.getById(id);

      // Use provided rowVersion or get from current
      const currentRowVersion = rowVersion || current.rowVersion || '';

      // ✅ Format dates properly - handle null/undefined/empty
      const formatDateForApi = (date: any): string => {
        if (!date) {
          // Return a default date if null/undefined
          return new Date().toISOString();
        }

        try {
          // If it's already a string
          if (typeof date === 'string') {
            // Check if it's a valid date string
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
              return parsed.toISOString();
            }

            // Try to parse different date formats
            // Handle "MMM DD, YYYY" format (e.g., "Jan 29, 2008")
            const monthMap: Record<string, number> = {
              'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
              'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
            };

            // Try to extract date from formatted string
            const match = date.match(/([a-zA-Z]{3})\s+(\d{1,2}),\s+(\d{4})/);
            if (match) {
              const month = monthMap[match[1].toLowerCase()];
              const day = parseInt(match[2]);
              const year = parseInt(match[3]);
              if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                return new Date(year, month, day).toISOString();
              }
            }

            // Try YYYY-MM-DD format
            const dateMatch = date.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
              return new Date(
                  parseInt(dateMatch[1]),
                  parseInt(dateMatch[2]) - 1,
                  parseInt(dateMatch[3])
              ).toISOString();
            }
          }

          // If it's a Date object
          if (date instanceof Date) {
            return date.toISOString();
          }

          // Fallback to current date
          return new Date().toISOString();
        } catch (error) {
          console.error('Date formatting error:', error);
          return new Date().toISOString();
        }
      };

      // Build update data with proper date formats
      const updateData: EmpEduModDto = {
        id: id,
        eduLevel: current.eduLevel || '',
        institution: current.institution || '',
        fieldOfStudy: current.fieldOfStudy || '',
        startDate: formatDateForApi(current.startDate),
        endDate: formatDateForApi(current.endDate), // ✅ Always send a valid date
        gpa: current.gpa || null,
        status: status, // "1" for Approved, "2" for Rejected
        rowVersion: currentRowVersion,
      };

      const res = await api.put(`${BASE}/ModEmpEdu/${id}`, updateData);
      return res.data.message;
    } catch (e) {
      console.error('Update education error:', e);
      throw new Error(extractError(e));
    }
  },

  delete: async (id: string): Promise<string> => {
    try {
      const res = await api.delete(`${BASE}/DelEmpEdu/${id}`);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  review: async (data: EmpRevDto): Promise<string> => {
    try {
      const res = await api.put(`${BASE}/ReviewEdu/${data.id}`, data);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  reviewAll: async (data: EmpRevDto): Promise<string> => {
    try {
      const res = await api.put(`${BASE}/ReviewEduAll/${data.id}`, data);
      return res.data.message;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};