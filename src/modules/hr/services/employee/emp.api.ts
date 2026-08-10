// services/hr/employee/emp.api.ts

import { api } from '@/shared/services/api';
import type { EmpAddRes, Step1Dto, Step2Dto, UUID } from '@/modules/hr/types/employee/empAddDto';
import type { EmployeeListDto } from '@/modules/hr/types/employee';

const ADD_BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/AddEmp`;
const EMP_BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/Employee`;
const MOD_BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/EmpMod`;

// ==================== Pagination Types ====================

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface EmployeeFilters {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  department?: string;
  branch?: string;
  empState?: string;
  empNature?: string;
  gender?: string;
}

export interface EmployeeFilterOptions {
  departments: { id: string; name: string; nameAm?: string }[];
  positions?: { id: string; name: string }[];
  empStates: { value: string; label: string }[];
  empNatures: { value: string; label: string }[];
  genders: { value: string; label: string }[];
}

// ==================== Helper Functions ====================

const extractError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const e = error as any;
    if (e.response?.data?.message) return e.response.data.message;
    if (e.response?.data?.errors)
      return (Object.values(e.response.data.errors) as string[][]).flat().join(', ');
    if (e.message) return e.message;
  }
  return 'An unexpected error occurred';
};

// Helper function for GET requests
const get = async <T>(url: string): Promise<T> => {
  try {
    const res = await api.get(url);
    return res.data.data as T;
  } catch (e) {
    throw new Error(extractError(e));
  }
};

// ==================== API Functions ====================

// Get all employees (without pagination)
export const getAllEmployees = async (): Promise<EmployeeListDto[]> => {
  try {
    const response = await api.get(`${EMP_BASE}/AllEmployee`);
    return response.data?.data || [];
  } catch (error) {
    console.error('Failed to load all employees:', error);
    return [];
  }
};

// Get employee by ID
export const getEmployeeById = async (id: string): Promise<EmployeeListDto | null> => {
  try {
    const response = await api.get(`${EMP_BASE}/GetEmployee/${id}`);
    return response.data?.data || null;
  } catch (error) {
    console.error('Failed to load employee:', error);
    return null;
  }
};

// Get all employee IDs (for bulk selection)
export const getAllEmployeeIds = async (filters?: { departmentId?: string }): Promise<string[]> => {
  try {
    let url = `${EMP_BASE}/ids`;
    if (filters?.departmentId) {
      url += `?departmentId=${filters.departmentId}`;
    }
    const response = await api.get(url);
    return response.data?.data || [];
  } catch (error) {
    console.error('Failed to load employee IDs:', error);
    // Fallback: get all employees and map to IDs
    try {
      const allEmployees = await getAllEmployees();
      return allEmployees.map(emp => emp.id);
    } catch {
      return [];
    }
  }
};

// Get paginated employees
export const getPaginatedEmployees = async (filters: EmployeeFilters): Promise<PaginatedResult<EmployeeListDto>> => {
  try {
    const params = new URLSearchParams();
    params.append('pageNumber', filters.pageNumber.toString());
    params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.department) params.append('department', filters.department);
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.empState) params.append('empState', filters.empState);
    if (filters.empNature) params.append('empNature', filters.empNature);
    if (filters.gender) params.append('gender', filters.gender);

    const response = await api.get(`${EMP_BASE}/paginated?${params.toString()}`);
    const result = response.data?.data;

    return {
      items: result?.items || [],
      pageNumber: result?.pageNumber || filters.pageNumber,
      pageSize: result?.pageSize || filters.pageSize,
      totalCount: result?.totalCount || 0,
      totalPages: result?.totalPages || 0,
      hasPreviousPage: result?.hasPreviousPage || false,
      hasNextPage: result?.hasNextPage || false
    };
  } catch (error) {
    console.error('Failed to load paginated employees:', error);
    // Fallback to client-side pagination
    try {
      const allEmployees = await getAllEmployees();
      let filteredEmployees = [...allEmployees];

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp =>
            emp.empFullName?.toLowerCase().includes(searchLower) ||
            emp.code?.toLowerCase().includes(searchLower) ||
            emp.department?.toLowerCase().includes(searchLower) ||
            emp.position?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.empState) {
        filteredEmployees = filteredEmployees.filter(emp => emp.empState === filters.empState);
      }

      if (filters.gender) {
        filteredEmployees = filteredEmployees.filter(emp => emp.gender === filters.gender);
      }

      const start = (filters.pageNumber - 1) * filters.pageSize;
      const paginatedItems = filteredEmployees.slice(start, start + filters.pageSize);

      return {
        items: paginatedItems,
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
        totalCount: filteredEmployees.length,
        totalPages: Math.ceil(filteredEmployees.length / filters.pageSize),
        hasPreviousPage: filters.pageNumber > 1,
        hasNextPage: filters.pageNumber < Math.ceil(filteredEmployees.length / filters.pageSize)
      };
    } catch (fallbackError) {
      console.error('Fallback pagination also failed:', fallbackError);
      return {
        items: [],
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
      };
    }
  }
};

// ==================== Department Employee Count Methods ====================

export const getEmployeeCountByDepartment = async (departmentId: string): Promise<number> => {
  try {
    const response = await api.get(`${EMP_BASE}/paginated`, {
      params: {
        pageNumber: 1,
        pageSize: 1,
        department: departmentId
      }
    });
    return response.data?.data?.totalCount || 0;
  } catch (error) {
    console.error('Error fetching employee count by department:', error);
    return 0;
  }
};

export const getEmployeeCountsByDepartments = async (): Promise<{ departmentId: string; count: number }[]> => {
  try {
    const departmentResponse = await api.get('/core/module/v1/Department/AllDept');
    const departments = departmentResponse.data?.data || [];

    const counts = await Promise.all(
        departments.map(async (dept: any) => {
          const count = await getEmployeeCountByDepartment(dept.id);
          return { departmentId: dept.id, count };
        })
    );

    return counts;
  } catch (error) {
    console.error('Error fetching employee counts:', error);
    return [];
  }
};

// ==================== Employee Filter Options ====================

export const getEmployeeFilterOptions = async (): Promise<EmployeeFilterOptions> => {
  try {
    const response = await api.get(`${EMP_BASE}/filter-options`);
    return response.data?.data || {
      departments: [],
      positions: [],
      empStates: [],
      empNatures: [],
      genders: []
    };
  } catch (e) {
    console.warn('Filter options endpoint not available, using fallback');
    return {
      departments: [],
      positions: [],
      empStates: [],
      empNatures: [],
      genders: []
    };
  }
};

export const getEmployeeStats = async (): Promise<{
  total: number;
  active: number;
  onLeave: number;
  pending: number;
  terminated: number;
}> => {
  try {
    const response = await api.get(`${EMP_BASE}/stats`);
    return response.data?.data || {
      total: 0,
      active: 0,
      onLeave: 0,
      pending: 0,
      terminated: 0
    };
  } catch (e) {
    throw new Error(extractError(e));
  }
};

// ==================== CRUD Operations ====================

export const createEmployee = async (data: any): Promise<any> => {
  try {
    const response = await api.post(`${ADD_BASE}/Step1`, data);
    return response.data?.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const updateEmployee = async (id: string, data: any): Promise<any> => {
  try {
    const response = await api.put(`${EMP_BASE}/ModEmployee/${id}`, data);
    return response.data?.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const deleteEmployee = async (id: UUID): Promise<void> => {
  try {
    await api.delete(`${EMP_BASE}/DelEmployee/${id}`);
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const updateEmployeeStatus = async (id: string, status: string): Promise<void> => {
  try {
    await api.patch(`${EMP_BASE}/UpdateEmployeeStatus/${id}`, { EmpState: status });
  } catch (error) {
    throw new Error(extractError(error));
  }
};

// ==================== ADD STEP 1 - FIXED ENDPOINT ====================

export const addStep1 = async (step1Data: Step1Dto): Promise<EmpAddRes> => {
  try {
    console.log('📤 Adding employee step 1:', step1Data);

    // Create FormData for file upload
    const formData = new FormData();

    // Append all fields to FormData
    Object.entries(step1Data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // ✅ FIX: Use the correct endpoint - AddEmp/Step1
    const url = `${ADD_BASE}/Step1`;
    console.log('📡 Calling API:', url);

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Employee added successfully:', response.data);
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('❌ Error adding employee step 1:', error);

    // Handle validation errors
    if (error.response?.data?.errors) {
      const errorData = error.response.data.errors;
      const errorMessages: string[] = [];

      if (typeof errorData === 'object') {
        Object.entries(errorData).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg: string) => {
              errorMessages.push(`${field}: ${msg}`);
            });
          } else if (typeof messages === 'string') {
            errorMessages.push(`${field}: ${messages}`);
          }
        });
      }

      const error = new Error('Validation failed');
      (error as any).validationErrors = errorMessages;
      throw error;
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Failed to add employee. Please try again.');
  }
};

// ==================== ADD STEP 2 (Guarantor) - FIXED ENDPOINT ====================

export const addStep2 = async (step2Data: Step2Dto): Promise<EmpAddRes> => {
  try {
    console.log('📤 Adding guarantor:', step2Data);

    // Create FormData for file upload
    const formData = new FormData();

    Object.entries(step2Data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // ✅ FIX: Use the correct endpoint - AddEmp/Step2
    const url = `${ADD_BASE}/Step2`;
    console.log('📡 Calling API:', url);

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Guarantor added successfully:', response.data);
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('❌ Error adding guarantor:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to add guarantor. Please try again.');
  }
};

// ==================== Export ====================

export const empApi = {
  // Pagination
  getPaginatedEmployees,
  getAllEmployees,
  getEmployeeById,
  getEmployeeFilterOptions,
  getEmployeeStats,
  getAllEmployeeIds,

  // Department count methods
  getEmployeeCountByDepartment,
  getEmployeeCountsByDepartments,

  // CRUD
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,

  // Step methods
  addStep1,
  addStep2,
  addStep4: addStep2, // Alias for backward compatibility

  // Legacy methods
  getModBasic: (id: string): Promise<any> => get(`${MOD_BASE}/EmpModBasic/${id}`),
  getModBio: (id: string): Promise<any> => get(`${MOD_BASE}/EmpModBio/${id}`),
  getModGuar: (id: string): Promise<any> => get(`${MOD_BASE}/EmpModGuar/${id}`),
  getPrint: (id: UUID): Promise<any> => get(`${ADD_BASE}/EmpAddPrint/${id}`),
};

// Export types
export type { EmployeeListDto } from '@/modules/hr/types/employee';

export default empApi;