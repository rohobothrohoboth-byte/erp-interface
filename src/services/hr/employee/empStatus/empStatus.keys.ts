// ── Query key factory for employee service ────────────────────────────────
export const empStatusKeys = {
     all: ['emp-status'] as const,
  termEmp: (id: string) => [...empStatusKeys.all, 'termEmp', id] as const,
  stByEmp:   (id: string) => [...empStatusKeys.all, 'stByEmp',   id] as const,
  retireEmp:  (id: string) => [...empStatusKeys.all, 'retireEmp',  id] as const,
susEmp:  (id: string) => [...empStatusKeys.all, 'susEmp',  id] as const,

};