// ── Query key factory for employee service ────────────────────────────────
export const empKeys = {
  all:      ['employee'] as const,

  // Lists
  list:     () => [...empKeys.all, 'list']                    as const,

  // Edit-mode prefill (EmpMod endpoints)
  modBasic: (id: string) => [...empKeys.all, 'modBasic', id] as const,
  modBio:   (id: string) => [...empKeys.all, 'modBio',   id] as const,
  modGuar:  (id: string) => [...empKeys.all, 'modGuar',  id] as const,

  // Review / print
  print:    (id: string) => [...empKeys.all, 'print',    id] as const,
} as const;
