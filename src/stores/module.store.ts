import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModuleState {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      activeModule: 'Core',
      setActiveModule: (module) => set({ activeModule: module }),
    }),
    {
      name: 'activeModule', // same localStorage key as before
    }
  )
);
