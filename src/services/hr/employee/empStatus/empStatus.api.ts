// services/hr/employee/empStatus/empStatus.api.ts - Updated with activateEmp

import type { UUID } from '../../../../types/finance/generalLedger';
import { api } from '../../../api';
import type { EmpRevDto } from "../../../../types/hr/employee/empAddDto";

class EmpStatusApi {
    private baseUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL}/EmpStatus`;

    private extractErrorMessage(error: any): string {
        if (error.response?.data?.message) return error.response.data.message;
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            return (Object.values(errors).flat() as string[]).join(', ');
        }
        return error.message || 'An unexpected error occurred';
    }

    async reviewEmp(employeeId: UUID, data: EmpRevDto): Promise<string> {
        try {
            const response = await api.put(
                `${this.baseUrl}/ReviewEmp/${employeeId}`,
                data,
            );
            return response.data.message;
        } catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    async terminateEmp(employeeId: UUID): Promise<void> {
        try {
            await api.put(`${this.baseUrl}/TermEmp/${employeeId}`);
        } catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    async standByEmp(employeeId: UUID): Promise<void> {
        try {
            await api.put(`${this.baseUrl}/StByEmp/${employeeId}`);
        } catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    async suspendEmp(employeeId: UUID): Promise<void> {
        try {
            await api.put(`${this.baseUrl}/SuspEmp/${employeeId}`);
        } catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    async retireEmp(employeeId: UUID): Promise<void> {
        try {
            await api.put(`${this.baseUrl}/RetiEmp/${employeeId}`);
        } catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    // ✅ Add activate employee method
    async activateEmp(employeeId: UUID): Promise<void> {
        try {
            await api.put(`${this.baseUrl}/ActivateEmp/${employeeId}`);
        } catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }
}

export const empStateApi = new EmpStatusApi();