// stores/module.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Module key mapping - all possible inputs normalized to standard keys
 */
const MODULE_MAP: Record<string, string> = {
    // Core
    'core': 'mod.core', 'mod.core': 'mod.core',
    // HR
    'hr': 'mod.hrm', 'hrm': 'mod.hrm', 'mod.hrm': 'mod.hrm', 'mod.hr': 'mod.hrm',
    // Inventory
    'inventory': 'mod.inv', 'inv': 'mod.inv', 'mod.inv': 'mod.inv',
    // CRM
    'crm': 'mod.crm', 'mod.crm': 'mod.crm',
    // Finance
    'finance': 'mod.fnm', 'fnm': 'mod.fnm', 'mod.fnm': 'mod.fnm',
    // Procurement
    'procurement': 'mod.pro', 'pro': 'mod.pro', 'mod.pro': 'mod.pro',
    // File Management
    'file': 'mod.flm', 'flm': 'mod.flm', 'mod.flm': 'mod.flm',
    // Plan & Development
    'plandev': 'mod.pld', 'pld': 'mod.pld', 'mod.pld': 'mod.pld',
    // Project Management
    'projectmanagement': 'mod.prm', 'prm': 'mod.prm', 'mod.prm': 'mod.prm',
    'project': 'mod.prm',
};

function normalizeKey(input: string): string {
    if (!input) return 'mod.core';
    const lower = input.toLowerCase().trim();
    return MODULE_MAP[lower] || input;
}

interface ModuleState {
    activeModule: string;
    setActiveModule: (module: string) => void;
}

export const useModuleStore = create<ModuleState>()(
    persist(
        (set) => ({
            activeModule: 'mod.core',
            setActiveModule: (module: string) => {
                const normalized = normalizeKey(module);

                set({ activeModule: normalized });
            },
        }),
        {
            name: 'activeModule',
        }
    )
);