import type { EmpAddRes, Step1Dto, Step2Dto, UUID } from "../../../types/hr/employee/empAddDto";
import { api } from "../../api";

// Convert a date string (YYYY-MM-DD or ISO) to UTC ISO string for PostgreSQL
const toUtcIso = (date: string): string => {
  if (!date) return date;
  return new Date(date).toISOString();
};

class EmpService {
    private baseUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL || "/hrm/profile/v1"}/AddEmp`;

    // Helper method to extract error messages
    private extractErrorMessage(error: any): string {
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.response?.data?.errors) {
            // Handle validation errors (object with field names as keys)
            const errors = error.response.data.errors;
            const errorMessages = Object.values(errors).flat();
            return errorMessages.join(', ');
        }
        if (error.message) {
            return error.message;
        }
        return 'An unexpected error occurred';
    }

    // POST: api/hrm/profile/v1/Step1 (multipart/form-data)
    async empAddStep1(step1: Step1Dto): Promise<EmpAddRes> {
        try {
            const formData = new FormData();
            formData.append('FirstName', step1.firstName);
            formData.append('FirstNameAm', step1.firstNameAm);
            formData.append('MiddleName', step1.middleName);
            formData.append('MiddleNameAm', step1.middleNameAm);
            formData.append('LastName', step1.lastName);
            formData.append('LastNameAm', step1.lastNameAm);
            formData.append('Nationality', step1.nationality);
            formData.append('Gender', step1.gender);
            formData.append('EmploymentDate', toUtcIso(step1.employmentDate));
            formData.append('JobGradeId', step1.jobGradeId);
            formData.append('PositionId', step1.positionId);
            formData.append('DepartmentId', step1.departmentId);
            formData.append('JgStepId', step1.jgStepId);
            formData.append('EmploymentType', step1.employmentType);
            formData.append('EmploymentNature', step1.employmentNature);
            formData.append('WorkArrangement', step1.workArrangement);
            formData.append('BirthDate', toUtcIso(step1.birthDate));
            formData.append('MaritalStatus', step1.maritalStatus);
            formData.append('AddressType', step1.addressType);
            formData.append('Country', step1.country);
            formData.append('Region', step1.region);
            formData.append('Subcity', step1.subcity || '');
            formData.append('Zone', step1.zone || '');
            formData.append('Woreda', step1.woreda || '');
            formData.append('Kebele', step1.kebele || '');
            formData.append('HouseNo', step1.houseNo || '');
            formData.append('Telephone', step1.telephone);
            formData.append('PoBox', step1.poBox || '');
            formData.append('Fax', step1.fax || '');
            formData.append('Email', step1.email || '');
            formData.append('Website', step1.website || '');
            if (step1.File) formData.append('File', step1.File);

            const response = await api.post(`${this.baseUrl}/Step1`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.info('Employee step 1 completed successfully:', response.data.data.id);
            return response.data.data;
        } catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            console.error("Failed to create employee step 1:", errorMessage);
            throw new Error(errorMessage);
        }
    }

    // POST: api/hrm/profile/v1/Step2 (multipart — includes File)
    async empAddStep2(step2: Step2Dto): Promise<EmpAddRes> {
        try {
            const formData = new FormData();
            formData.append('EmployeeId', step2.employeeId);
            formData.append('FirstName', step2.firstName);
            formData.append('MiddleName', step2.middleName);
            formData.append('LastName', step2.lastName);
            formData.append('Nationality', step2.nationality);
            formData.append('Gender', step2.gender);
            formData.append('Relation', step2.relation);
            formData.append('AddressType', step2.addressType);
            formData.append('Country', step2.country);
            formData.append('Region', step2.region);
            formData.append('Subcity', step2.subcity || '');
            formData.append('Zone', step2.zone || '');
            formData.append('Woreda', step2.woreda || '');
            formData.append('Kebele', step2.kebele || '');
            formData.append('HouseNo', step2.houseNo || '');
            formData.append('Telephone', step2.telephone);
            formData.append('PoBox', step2.poBox || '');
            formData.append('Fax', step2.fax || '');
            formData.append('Email', step2.email || '');
            formData.append('Website', step2.website || '');
            if (step2.File) formData.append('File', step2.File);

            const response = await api.post(`${this.baseUrl}/Step2`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.info('Employee step 2 completed successfully:', response.data.data.id);
            return response.data.data;
        } catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            console.error("Failed to create employee step 2:", errorMessage);
            throw new Error(errorMessage);
        }
    }

    // Alias used by AddEmployeeStepForm for guarantor submission
    async empAddStep4(step2: Step2Dto): Promise<EmpAddRes> {
        return this.empAddStep2(step2);
    }

    // GET: api/hrm/profile/v1/AddEmp/EmpAddPrint/{id}
    async getStep5Data(employeeId: UUID): Promise<any> {
        try {
            const response = await api.get(`${this.baseUrl}/EmpAddPrint/${employeeId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            console.error("Failed to fetch employee review data:", errorMessage);
            throw new Error(errorMessage);
        }
    }
}

export const empService = new EmpService();