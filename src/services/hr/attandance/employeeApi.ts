// src/services/hr/attandance/employeeApi.ts

import { empApi } from '../../hr/employee/emp.api';

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
    email: string;
    phone: string;
    departmentId: string;
    departmentName: string;
    positionId: string;
    positionName: string;
    branchId: string;
    branchName: string;
    empState: string;
    gender: string;
}

// Cache for employee data
let employeeCache: Map<string, Employee> = new Map();
let allEmployees: Employee[] = [];

// Convert API response to Employee
const convertToEmployee = (dto: any): Employee => {
    return {
        id: dto.id || dto.employeeId || '',
        firstName: dto.firstName || dto.firstname || '',
        lastName: dto.lastName || dto.lastname || '',
        code: dto.code || dto.employeeCode || '',
        email: dto.email || '',
        phone: dto.phone || '',
        departmentId: dto.departmentId || '',
        departmentName: dto.department || dto.departmentName || '',
        positionId: dto.positionId || '',
        positionName: dto.position || dto.positionName || '',
        branchId: dto.branchId || '',
        branchName: dto.branch || dto.branchName || '',
        empState: dto.empState || dto.employmentStatus || '',
        gender: dto.gender || '',
    };
};

// ✅ Export fetchAllEmployees
export const fetchAllEmployees = async (): Promise<Employee[]> => {
    try {
        const response = await empApi.getAllEmployees();
        let employeesData = response;
        if (response && typeof response === 'object' && 'data' in response) {
            employeesData = (response as any).data;
        }
        if (!Array.isArray(employeesData)) {
            employeesData = [];
        }

        const employees = employeesData.map(convertToEmployee);
        allEmployees = employees;
        employees.forEach(emp => {
            employeeCache.set(emp.id, emp);
        });
        console.log(`✅ Cached ${employees.length} employees`);
        return employees;
    } catch (error) {
        console.error('❌ Failed to fetch employees:', error);
        return [];
    }
};

// ✅ Export fetchEmployee
export const fetchEmployee = async (employeeId: string): Promise<Employee | null> => {
    try {
        // Check cache first
        if (employeeCache.has(employeeId)) {
            return employeeCache.get(employeeId)!;
        }

        // If not in cache, fetch from API
        const response = await empApi.getEmployeeById(employeeId);
        if (response) {
            const employee = convertToEmployee(response);
            employeeCache.set(employeeId, employee);
            if (!allEmployees.find(e => e.id === employeeId)) {
                allEmployees.push(employee);
            }
            return employee;
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch employee ${employeeId}:`, error);
        return null;
    }
};

// ✅ Export getEmployeeName
export const getEmployeeName = (employeeId: string): string => {
    if (!employeeId) return 'Unknown Employee';

    const cached = employeeCache.get(employeeId);
    if (cached) {
        return `${cached.firstName} ${cached.lastName}`;
    }
    const emp = allEmployees.find(e => e.id === employeeId);
    if (emp) {
        return `${emp.firstName} ${emp.lastName}`;
    }
    return 'Unknown Employee';
};

// ✅ Export getEmployee
export const getEmployee = (employeeId: string): Employee | undefined => {
    if (employeeCache.has(employeeId)) {
        return employeeCache.get(employeeId);
    }
    return allEmployees.find(e => e.id === employeeId);
};

// ✅ Export getEmployeesByDepartment
export const getEmployeesByDepartment = (departmentName: string): Employee[] => {
    return allEmployees.filter(e => e.departmentName === departmentName);
};

// ✅ Export getDepartments
export const getDepartments = (): string[] => {
    const depts = new Set<string>();
    allEmployees.forEach(emp => {
        if (emp.departmentName) {
            depts.add(emp.departmentName);
        }
    });
    return ['All', ...Array.from(depts)];
};

// ✅ Export setEmployeeCache
export const setEmployeeCache = (employees: Employee[]) => {
    employees.forEach(emp => {
        employeeCache.set(emp.id, emp);
    });
    allEmployees = employees;
};

// ✅ Export getAllCachedEmployees
export const getAllCachedEmployees = (): Employee[] => {
    return allEmployees;
};

// ✅ Export clearCache
export const clearCache = () => {
    employeeCache.clear();
    allEmployees = [];
};

// ✅ Export the employeeApi object
export const employeeApi = {
    fetchAllEmployees,
    fetchEmployee,
    getEmployeeName,
    getEmployee,
    getEmployeesByDepartment,
    getDepartments,
    setEmployeeCache,
    getAllCachedEmployees,
    clearCache,
};