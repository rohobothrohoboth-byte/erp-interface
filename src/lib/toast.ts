// src/lib/toast.ts

// ✅ Helper to extract error message
const getErrorMessage = (error: any): string => {
    if (!error) return 'An unexpected error occurred';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
};

export const showToast = (message: string | any, type: 'success' | 'error' | 'info' = 'info') => {
    // ✅ Convert error object to string safely
    const finalMessage = typeof message === 'object'
        ? getErrorMessage(message)
        : message;

    // Create and show toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = finalMessage;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
};