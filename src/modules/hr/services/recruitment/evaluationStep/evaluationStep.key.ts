export const evaluationStepKeys = {
  all: ['evaluationSteps'] as const,
  byFlow: (flowId: string) => [...evaluationStepKeys.all, 'flow', flowId] as const,
  lists: () => [...evaluationStepKeys.all, 'list'] as const,
  list: (flowId?: string) => [...evaluationStepKeys.lists(), { flowId }] as const,
  details: () => [...evaluationStepKeys.all, 'detail'] as const,
  detail: (id: string) => [...evaluationStepKeys.details(), id] as const,
} as const;
