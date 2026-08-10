import { create } from "zustand";

interface CompanyConfigState {
  empId: string;
  setEmpId: (id: string) => void;
  reset: () => void;
}

export const useCompanyConfigStore = create<CompanyConfigState>((set) => ({
  empId: "",
  setEmpId: (id) => set({ empId: id }),
  reset: () => set({ empId: "" }),
}));
