import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UUID } from 'crypto';

interface EmpAddState {
  // HR add flow
  hrEmployeeId: UUID | null;
  hrCurrentStep: number;

  // Admin (core) add flow
  adminEmployeeId: UUID | null;
  adminCurrentStep: number;

  // HR actions
  setHrEmployeeId: (id: UUID) => void;
  setHrStep: (step: number) => void;
  resetHr: () => void;

  // Admin actions
  setAdminEmployeeId: (id: UUID) => void;
  setAdminStep: (step: number) => void;
  resetAdmin: () => void;
}

export const useEmpAddStore = create<EmpAddState>()(
  persist(
    (set) => ({
      hrEmployeeId: null,
      hrCurrentStep: 1,
      adminEmployeeId: null,
      adminCurrentStep: 1,

      setHrEmployeeId: (id) => set({ hrEmployeeId: id }),
      setHrStep: (step) => set({ hrCurrentStep: step }),
      resetHr: () => set({ hrEmployeeId: null, hrCurrentStep: 1 }),

      setAdminEmployeeId: (id) => set({ adminEmployeeId: id }),
      setAdminStep: (step) => set({ adminCurrentStep: step }),
      resetAdmin: () => set({ adminEmployeeId: null, adminCurrentStep: 1 }),
    }),
    {
      name: 'emp-add-store',
    }
  )
);
