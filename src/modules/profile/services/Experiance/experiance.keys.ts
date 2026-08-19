export const experienceKeys = {
  all: ["experience"] as const,
  lists: () => [...experienceKeys.all, "list"] as const,
  detail: (id: string) => [...experienceKeys.all, "detail", id] as const,
  review: (id: string) => [...experienceKeys.all, "review", id] as const,
  reviewAll: (id: string) => [...experienceKeys.all, "reviewAll", id] as const,
};
