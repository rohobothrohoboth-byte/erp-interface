import type { UUID } from 'crypto';

export type { UUID };

export interface RegStep1 {
  employeeId: UUID;
  userName: string;           // ✅ Required
  email: string;              // ✅ Required
  password: string;           // ✅ Required
  confirmPassword: string;    // ✅ Required
  roleId: string;             // ✅ Required
  perModules: UUID[];         // ✅ Required
  // Optional fields that might be needed
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface RegStep2 {
  userId: string;
  perMenus: UUID[];
}

export interface RegStep3 {
  userId: string;
  perAccess: UUID[];
}

export interface RegRes {
  userId: string;
  message?: string;  // Add optional message property
  success?: boolean;
}
