// src/utils/finance/helpers.ts - FIXED

/**
 * Format a number as currency
 * @param amount - The amount to format (can be number, string, or null)
 * @param currency - The currency symbol (default: '$')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: any, currency: string = '$'): string => {
    // ✅ Handle null, undefined, or invalid values
    if (amount === undefined || amount === null || amount === '') {
        return `${currency}0.00`;
    }

    // ✅ Convert to number if it's a string
    let numAmount = typeof amount === 'number' ? amount : parseFloat(amount);

    // ✅ Check if it's a valid number
    if (isNaN(numAmount) || !isFinite(numAmount)) {
        return `${currency}0.00`;
    }

    // ✅ Format the number
    return `${currency}${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (value: any): string => {
    let numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue) || !isFinite(numValue)) {
        return '0.0%';
    }
    return `${(numValue * 100).toFixed(1)}%`;
};

/**
 * Format a date to a readable string
 */
export const formatDate = (date: string | Date): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format a date with time
 */
export const formatDateTime = (date: string | Date): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Calculate the number of days between two dates
 */
export const daysBetween = (start: Date, end: Date): number => {
    if (!start || !end) return 0;
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (dueDate: string | Date): boolean => {
    if (!dueDate) return false;
    const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    if (isNaN(d.getTime())) return false;
    return d < new Date();
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Get status color for badges
 */
export const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-gray-100 text-gray-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-blue-100 text-blue-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Draft': 'bg-gray-100 text-gray-600',
        'Paid': 'bg-green-100 text-green-800',
        'Unpaid': 'bg-red-100 text-red-800',
        'Overdue': 'bg-red-100 text-red-800',
        'Cancelled': 'bg-red-100 text-red-800',
        'Completed': 'bg-green-100 text-green-800',
        'Partial': 'bg-yellow-100 text-yellow-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
};