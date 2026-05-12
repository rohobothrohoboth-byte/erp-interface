import { api } from '../../api';
import type { RegStep1, RegStep2, RegStep3, RegRes } from '../../../types/auth/registration';

class RegisterApi {
  private baseUrl = `${import.meta.env.VITE_AUTH_MODULE_URL || 'auth/v1'}/Register`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

  async step1(registrationData: RegStep1): Promise<RegRes> {
    try {
      const response = await api.post(`${this.baseUrl}/Step1`, registrationData);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async step2(registrationData: RegStep2): Promise<RegRes> {
    try {
      const response = await api.post(`${this.baseUrl}/Step2`, registrationData);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async step3(registrationData: RegStep3): Promise<RegRes> {
    try {
      const response = await api.post(`${this.baseUrl}/Step3`, registrationData);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async completeRegistration(
    step1Data: RegStep1,
    step2Data: Omit<RegStep2, 'userId'>,
    step3Data: Omit<RegStep3, 'userId'>
  ): Promise<RegRes> {
    const step1Result = await this.step1(step1Data);
    await this.step2({ userId: step1Result.userId, ...step2Data });
    const step3Result = await this.step3({ userId: step1Result.userId, ...step3Data });
    return step3Result;
  }
}

export const registerApi = new RegisterApi();

export const registerFetcher = {
  step1: (data: RegStep1) => registerApi.step1(data),
  step2: (data: RegStep2) => registerApi.step2(data),
  step3: (data: RegStep3) => registerApi.step3(data),
  completeRegistration: (
    step1: RegStep1,
    step2: Omit<RegStep2, 'userId'>,
    step3: Omit<RegStep3, 'userId'>
  ) => registerApi.completeRegistration(step1, step2, step3),
};
