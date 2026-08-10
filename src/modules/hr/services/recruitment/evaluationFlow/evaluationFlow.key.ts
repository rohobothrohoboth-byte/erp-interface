export const evaluationFlowKeys = {
  all: ['evaluationFlows'] as const,
  lists: () => [...evaluationFlowKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) =>
    [...evaluationFlowKeys.lists(), { filters }] as const,
  details: () => [...evaluationFlowKeys.all, 'detail'] as const,
  detail: (id: string) => [...evaluationFlowKeys.details(), id] as const,
} as const;
