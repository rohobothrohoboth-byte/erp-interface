import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { employeeApi } from '../services/hr/attandance/attendanceApi';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
    email: string;
    department: string;
    position: string;
}

interface EmployeeContextType {
    employees: Employee[];
    loading: boolean;
    currentEmployee: Employee | null;
    currentEmployeeId: string | null;
    getEmployeeName: (id: string) => string;
    getEmployee: (id: string) => Employee | undefined;
    refreshEmployees: () => Promise<void>;
    setCurrentEmployeeId: (id: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const useEmployees = () => {
    const context = useContext(EmployeeContext);
    if (!context) {
        throw new Error('useEmployees must be used within an EmployeeProvider');
    }
    return context;
};

interface EmployeeProviderProps {
    children: ReactNode;
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
    const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(
        localStorage.getItem('employeeId') || null
    );

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            // Try to get from cache first
            const cached = localStorage.getItem('employees');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.length > 0) {
                    setEmployees(parsed);
                    // Find current employee in cached data
                    if (currentEmployeeId) {
                        const emp = parsed.find((e: Employee) => e.id === currentEmployeeId);
                        setCurrentEmployee(emp || null);
                    }
                    setLoading(false);
                    return;
                }
            }

            // Fetch from API
            const response = await employeeApi.getAll();
            const data = response.data?.data || [];
            setEmployees(data);
            localStorage.setItem('employees', JSON.stringify(data));

            // Set current employee
            if (currentEmployeeId) {
                const emp = data.find((e: Employee) => e.id === currentEmployeeId);
                setCurrentEmployee(emp || null);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Update current employee when ID changes
    useEffect(() => {
        if (currentEmployeeId) {
            localStorage.setItem('employeeId', currentEmployeeId);
            const emp = employees.find(e => e.id === currentEmployeeId);
            setCurrentEmployee(emp || null);
        }
    }, [currentEmployeeId, employees]);

    const getEmployeeName = (id: string): string => {
        const employee = employees.find(e => e.id === id);
        if (employee) {
            return `${employee.firstName} ${employee.lastName}`;
        }
        return 'Unknown Employee';
    };

    const getEmployee = (id: string): Employee | undefined => {
        return employees.find(e => e.id === id);
    };

    const refreshEmployees = async () => {
        await fetchEmployees();
    };

    const setCurrentEmployeeIdHandler = (id: string) => {
        setCurrentEmployeeId(id);
    };

    return (
        <EmployeeContext.Provider value={{
            employees,
            loading,
            currentEmployee,
            currentEmployeeId,
            getEmployeeName,
            getEmployee,
            refreshEmployees,
            setCurrentEmployeeId: setCurrentEmployeeIdHandler,
        }}>
            {children}
        </EmployeeContext.Provider>
    );
};