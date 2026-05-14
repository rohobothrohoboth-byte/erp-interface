import type { UUID } from '../../../../types/finance/generalLedger';
import { api } from '../../../api';


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
}

export const empStateApi = new EmpStatusApi();

