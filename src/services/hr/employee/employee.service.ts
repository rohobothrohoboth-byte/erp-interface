// services/hr/employee/employee.service.ts
import { api } from '../../api';

export interface Employee {
    id: string;
    name: string;
    code?: string;
    employeeCode?: string;
    email?: string;
    department?: string;
    position?: string;
}

class EmployeeService {
    private baseUrl = '/api/hrm/profile/v1/Employee';

    async getAllEmployees(): Promise<Employee[]> {
        try {
            // Adjust this endpoint based on your actual employee API
            const response = await api.get(`${this.baseUrl}/All`);
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching employees:', error);
            // Return mock data for testing if endpoint doesn't exist
            return [
                { id: '1', name: 'John Doe', code: 'EMP001' },
                { id: '2', name: 'Jane Smith', code: 'EMP002' },
                { id: '3', name: 'Bob Johnson', code: 'EMP003' },
            ];
        }
    }

    async getEmployeeById(id: string): Promise<Employee | null> {
        try {
            const response = await api.get(`${this.baseUrl}/Get/${id}`);
            return response.data?.data || null;
        } catch (error) {
            console.error('Error fetching employee:', error);
            return null;
        }
    }

    async searchEmployees(searchTerm: string): Promise<Employee[]> {
        try {
            const response = await api.get(`${this.baseUrl}/Search`, { params: { term: searchTerm } });
            return response.data?.data || [];
        } catch (error) {
            console.error('Error searching employees:', error);
            return [];
        }
    }
}

export const employeeService = new EmployeeService();