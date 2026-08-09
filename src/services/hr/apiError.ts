export const extractApiError = (error: any): string => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string' && data.message) return data.message;
  if (typeof data?.title === 'string' && data.title && typeof data?.detail === 'string') {
    return data.detail || data.title;
  }
  if (data?.errors) {
    return (Object.values(data.errors) as string[][]).flat().join(', ');
  }
  if (error?.response?.status === 404) {
    return 'API not found (check gateway route and that the service is running)';
  }
  if (error?.response?.status === 502 || error?.response?.status === 503) {
    return 'Upstream service unavailable (Performance/Training/Reports may be down)';
  }
  return error?.message || 'An unexpected error occurred';
};

/** Profile/Leave/Recruit wrap payloads in { data: T } */
export const unwrapData = <T>(res: { data: any }): T =>
  (res.data?.data !== undefined ? res.data.data : res.data) as T;
