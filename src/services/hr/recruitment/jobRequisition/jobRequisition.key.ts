export const jobRequisitionKeys = {
  all: ["jobRequisitions"] as const,
  lists: () => [...jobRequisitionKeys.all, "list"] as const,
  list: (id?: string, filters?: { search?: string; status?: string }) =>
    [...jobRequisitionKeys.lists(), { id,filters }] as const,
  details: () => [...jobRequisitionKeys.all, "detail"] as const,
  detail: (id: string) => [...jobRequisitionKeys.details(), id] as const,
} as const;
