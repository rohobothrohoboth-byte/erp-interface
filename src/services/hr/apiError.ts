export const extractApiError = (error: any): string => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string' && data.message) return data.message;
  if (typeof data?.title === 'string' && data.title && typeof data?.detail === 'string') {
    return data.detail || data.title;
  }
  if (data?.errors) {
    return (Object.values(data.errors) as string[][]).flat().join(', ');
  }
  if (error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')) {
    return 'Request timed out. Reports service or an upstream HR API is slow/down — restart Reports (:7018) and Profile/Leave/Attendance/Payroll.';
  }
  if (error?.response?.status === 404) {
    return 'API not found (check gateway route and that the service is running)';
  }
  if (error?.response?.status === 502 || error?.response?.status === 503) {
    return 'Upstream service unavailable (Performance/Training/Reports may be down)';
  }
  return error?.message || 'An unexpected error occurred';
};

/**
 * Unwrap gateway/ApiResponse `{ success, data }` only.
 * Do NOT unwrap arbitrary objects that happen to have a `data` field
 * (e.g. HR Reports envelopes: { domain, upstreamSuccess, data }).
 */
export const unwrapData = <T>(res: { data: any }): T => {
  const body = res?.data;
  if (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    Object.prototype.hasOwnProperty.call(body, 'success') &&
    Object.prototype.hasOwnProperty.call(body, 'data')
  ) {
    return body.data as T;
  }
  return body as T;
};
