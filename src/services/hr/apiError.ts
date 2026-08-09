export const extractApiError = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors) {
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  }
  return error?.message || 'An unexpected error occurred';
};

/** Profile/Leave/Recruit wrap payloads in { data: T } */
export const unwrapData = <T>(res: { data: any }): T =>
  (res.data?.data !== undefined ? res.data.data : res.data) as T;
