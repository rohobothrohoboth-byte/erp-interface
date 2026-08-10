export const applicantKeys = {
  all: ['applicants'] as const,
  lists: () => [...applicantKeys.all, 'list'] as const,
  byPost: (postId: string) => [...applicantKeys.all, 'post', postId] as const,
  detail: (id: string) => [...applicantKeys.all, 'detail', id] as const,
};
