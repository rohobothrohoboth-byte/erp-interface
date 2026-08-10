import type { UUID } from "@/modules/hr/types/recruit/evaluationType";

export const evaluationTypeKeys = {
  all: ["evaluationTypes"] as const,
  lists: () => [...evaluationTypeKeys.all, "list"] as const,
  list: (filters?: { search?: string }) => 
    [...evaluationTypeKeys.lists(), { filters }] as const,
  details: () => [...evaluationTypeKeys.all, "detail"] as const,
  detail: (id: UUID) => [...evaluationTypeKeys.details(), id] as const,
} as const;
