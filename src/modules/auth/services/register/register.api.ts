// services/auth/register/register.api.ts

import { api } from '@/shared/services/api';
import type { RegStep1, RegStep2, RegStep3, RegRes } from '@/modules/auth/types/registration';

class RegisterApi {
  private baseUrl = `${import.meta.env.VITE_AUTH_URL || 'auth/v1'}/Register`;

  private extractErrorMessage(error: any): string {
    console.error('=== API ERROR DETAILS ===');
    console.error('Error config:', error.config);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);

    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    if (error.response?.data?.title) return error.response.data.title;
    return error.message || 'An unexpected error occurred';
  }

  // ============ CREATE METHODS (for new accounts) ============

  async step1(registrationData: RegStep1): Promise<RegRes> {
    const url = `${this.baseUrl}/Step1`;
    console.log('=== STEP 1 API CALL ===');
    console.log('Full URL:', `${api.defaults.baseURL}${url}`);
    console.log('Request Data:', JSON.stringify(registrationData, null, 2));

    try {
      const response = await api.post(url, registrationData);
      console.log('Step 1 Response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Step 1 Failed:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async step2(registrationData: RegStep2): Promise<RegRes> {
    const url = `${this.baseUrl}/Step2`;
    console.log('=== STEP 2 API CALL ===');
    console.log('Full URL:', `${api.defaults.baseURL}${url}`);
    console.log('Request Data:', JSON.stringify(registrationData, null, 2));

    try {
      const response = await api.post(url, registrationData);
      console.log('Step 2 Response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Step 2 Failed:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async step3(registrationData: RegStep3): Promise<RegRes> {
    const url = `${this.baseUrl}/Step3`;
    console.log('=== STEP 3 API CALL ===');
    console.log('Full URL:', `${api.defaults.baseURL}${url}`);
    console.log('Request Data:', JSON.stringify(registrationData, null, 2));

    try {
      const response = await api.post(url, registrationData);
      console.log('Step 3 Response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Step 3 Failed:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // ============ UPDATE METHODS (for editing existing accounts) ============

  async updateModules(data: { userId: string; perModules: string[] }): Promise<any> {
    const url = `${this.baseUrl}/UpdateModules/${data.userId}`;
    console.log('=== UPDATE MODULES API CALL ===');
    console.log('Full URL:', `${api.defaults.baseURL}${url}`);
    console.log('Request Data:', JSON.stringify({ perModules: data.perModules }, null, 2));

    try {
      const response = await api.put(url, { perModules: data.perModules });
      console.log('Update Modules Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update Modules Failed:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateRole(data: { userId: string; roleId: string }): Promise<any> {
    const url = `${this.baseUrl}/UpdateRole/${data.userId}`;
    console.log('=== UPDATE ROLE API CALL ===');
    console.log('Full URL:', `${api.defaults.baseURL}${url}`);
    console.log('Request Data:', JSON.stringify({ roleId: data.roleId }, null, 2));

    try {
      const response = await api.put(url, { roleId: data.roleId });
      console.log('Update Role Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update Role Failed:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updatePassword(data: { userId: string; password: string }): Promise<any> {
    const url = `${this.baseUrl}/UpdatePassword/${data.userId}`;
    console.log('=== UPDATE PASSWORD API CALL ===');
    console.log('Full URL:', `${api.defaults.baseURL}${url}`);

    try {
      const response = await api.put(url, { password: data.password });
      console.log('Update Password Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update Password Failed:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateMenus(data: { userId: string; perMenus: string[] }): Promise<any> {
    const url = `${this.baseUrl}/UpdateMenus/${data.userId}`;
    console.log('=== UPDATE MENUS API CALL ===');
    console.log('Full URL:', `${api.defaults.baseURL}${url}`);
    console.log('Request Data:', JSON.stringify({ perMenus: data.perMenus }, null, 2));

    try {
      const response = await api.put(url, { perMenus: data.perMenus });
      console.log('Update Menus Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update Menus Failed:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateAccess(data: { userId: string; perAccess: string[] }): Promise<any> {
    const url = `${this.baseUrl}/UpdateAccess/${data.userId}`;
    console.log('=== UPDATE ACCESS API CALL ===');
    console.log('Full URL:', `${api.defaults.baseURL}${url}`);
    console.log('Request Data:', JSON.stringify({ perAccess: data.perAccess }, null, 2));

    try {
      const response = await api.put(url, { perAccess: data.perAccess });
      console.log('Update Access Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update Access Failed:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async completeRegistration(
      step1Data: RegStep1,
      step2Data: Omit<RegStep2, 'userId'>,
      step3Data: Omit<RegStep3, 'userId'>
  ): Promise<RegRes> {
    console.log('=== COMPLETE REGISTRATION ===');
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
  updateModules: (data: { userId: string; perModules: string[] }) => registerApi.updateModules(data),
  updateRole: (data: { userId: string; roleId: string }) => registerApi.updateRole(data),
  updatePassword: (data: { userId: string; password: string }) => registerApi.updatePassword(data),
  updateMenus: (data: { userId: string; perMenus: string[] }) => registerApi.updateMenus(data),
  updateAccess: (data: { userId: string; perAccess: string[] }) => registerApi.updateAccess(data),
  completeRegistration: (
      step1: RegStep1,
      step2: Omit<RegStep2, 'userId'>,
      step3: Omit<RegStep3, 'userId'>
  ) => registerApi.completeRegistration(step1, step2, step3),
};