import type { UUID } from "crypto";
import { api } from "@/shared/services/api";
import type { PwdChgDto } from "@/modules/hr/types/employee";

class UserService{
private   BASE = `${import.meta.env.VITE_AUTH_URL}/User`;

private extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const e = error as any;
    if (e.response?.data?.message) return e.response.data.message;
    if (e.response?.data?.errors)
      return (Object.values(e.response.data.errors) as string[][]).flat().join(', ');
    if (e.message) return e.message;
  }
  return 'An unexpected error occurred';
};
 
async changePassword(data: PwdChgDto): Promise<void> {
    try {
      const response = await api.put(`${this.BASE}/ChangePwd/`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteAccount (id: UUID): Promise<void> {
    try {
      await api.delete(`${this.BASE}/DelUserAcct/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const userService = new UserService();
