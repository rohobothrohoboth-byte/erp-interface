// services/hr/employee/empStatus/empStatus.keys.ts

export const empStatusKeys = {
    // Base key
    all: ['emp-status'] as const,

    // Specific status keys
    termEmp: (id: string) => [...empStatusKeys.all, 'termEmp', id] as const,
    stByEmp: (id: string) => [...empStatusKeys.all, 'stByEmp', id] as const,
    retireEmp: (id: string) => [...empStatusKeys.all, 'retireEmp', id] as const,
    susEmp: (id: string) => [...empStatusKeys.all, 'susEmp', id] as const,

    // ✅ Add review employee key
    reviewEmp: (id: string) => [...empStatusKeys.all, 'reviewEmp', id] as const,

    // ✅ Add activate employee key
    activateEmp: (id: string) => [...empStatusKeys.all, 'activateEmp', id] as const,
};