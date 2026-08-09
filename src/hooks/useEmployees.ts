import { useState, useEffect } from 'react';
import type { AdminEmpListDto } from '../types/hr/employee';

const mapEmployeeData = (employee: any): AdminEmpListDto => {
    return {
        id: employee.id,
        code: employee.code || employee.employeeCode,
        empFullName: employee.empFullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'No Name',
        empFullNameAm: employee.empFullNameAm || '',
        gender: employee.gender || 'N/A',
        empState: employee.empState || 'Not specified',
        branch: employee.branchName || employee.branch || '—',
        department: employee.departmentName || employee.department || '—',
        position: employee.positionName || employee.position || '—',
        jobGrade: employee.jobGradeName || employee.jobGrade || '—',
        empType: employee.empType || '',
        empNature: employee.empNature || '',
        workArr: employee.workArr || '',
        photo: employee.photo || '',
        hasAccount: employee.hasAccount || employee.appUserId !== null,
        isAccountActive: employee.isAccountActive || employee.isActive,
        isDeleted: employee.isDeleted || false,
        dateAdd: employee.dateAdd || new Date(),
        dateMod: employee.dateMod || null,
        rowVersion: employee.rowVersion || ''
    };
};

export const useEmployees = () => {
    const [employees, setEmployees] = useState<AdminEmpListDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/auth/v1/AdminEmp/AllEmployee', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.success && result.data) {
                    const mappedEmployees = result.data.map(mapEmployeeData);
                    setEmployees(mappedEmployees);
                } else {
                    throw new Error(result.message || 'Failed to fetch employees');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setEmployees([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    return { employees, loading, error };
};