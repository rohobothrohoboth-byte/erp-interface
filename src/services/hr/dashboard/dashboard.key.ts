export const empListRepoKeys = {
  all: ['emp-list-repo'] as const,

  empDbRepo: () => [...empListRepoKeys.all, 'emp-db-repo'] as const,

  pendEmpList: () => [...empListRepoKeys.all, 'pend-emp-list'] as const,
};