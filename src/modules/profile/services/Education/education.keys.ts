export const educationKeys = {
  all:    ['education'] as const,
  lists:  () => [...educationKeys.all, 'list'] as const,
  detail: (id: string) => [...educationKeys.all, 'detail', id] as const,
  review: (id: string) => [...educationKeys.all, 'review', id] as const,
  reviewAll: (id: string) => [...educationKeys.all, 'reviewAll', id] as const
};
