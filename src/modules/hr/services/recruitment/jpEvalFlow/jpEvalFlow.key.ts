// src/services/hr/recruitment/jpEvalFlow/jpEvalFlow.key.ts

export const jpEvalFlowKeys = {
  all: ['jpEvalFlow'] as const,
  byPost: (postId: string) => [...jpEvalFlowKeys.all, 'post', postId] as const,
  detail: (id: string) => [...jpEvalFlowKeys.all, 'detail', id] as const,
  lists: () => [...jpEvalFlowKeys.all, 'list'] as const,
} as const;