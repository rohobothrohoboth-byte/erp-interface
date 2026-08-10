// utils/dateUtils.ts

/**
 * Formats a date string to a readable format
 * Handles PostgreSQL timestamp with timezone format: "2026-07-28 10:00:00+10"
 *
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string like "July 28, 2026" or "N/A"
 */
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';

    try {
        let dateObj: Date;

        if (typeof date === 'string') {
            // Handle PostgreSQL timestamp format: "2026-07-28 10:00:00+10"
            // Replace space with T to make it ISO compatible
            const normalizedDate = date.replace(' ', 'T');
            dateObj = new Date(normalizedDate);

            // If that fails, try extracting just the date part
            if (isNaN(dateObj.getTime())) {
                const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
                if (match) {
                    dateObj = new Date(match[1] + 'T00:00:00');
                } else {
                    return 'N/A';
                }
            }
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            return 'N/A';
        }

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }

        // Format as "July 28, 2026"
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'N/A';
    }
};

/**
 * Formats a date string to a short format (for tables)
 * Handles PostgreSQL timestamp with timezone format: "2026-07-28 10:00:00+10"
 *
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string like "Jul 28, 2026" or "N/A"
 */
export const formatDateShort = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';

    try {
        let dateObj: Date;

        if (typeof date === 'string') {
            // Handle PostgreSQL timestamp format: "2026-07-28 10:00:00+10"
            const normalizedDate = date.replace(' ', 'T');
            dateObj = new Date(normalizedDate);

            if (isNaN(dateObj.getTime())) {
                const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
                if (match) {
                    dateObj = new Date(match[1] + 'T00:00:00');
                } else {
                    return 'N/A';
                }
            }
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            return 'N/A';
        }

        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }

        // Format as "Jul 28, 2026"
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Formats a date string to include time
 *
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date-time string like "July 28, 2026 at 10:00 AM" or "N/A"
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';

    try {
        let dateObj: Date;

        if (typeof date === 'string') {
            const normalizedDate = date.replace(' ', 'T');
            dateObj = new Date(normalizedDate);

            if (isNaN(dateObj.getTime())) {
                return 'N/A';
            }
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            return 'N/A';
        }

        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }

        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (error) {
        return 'N/A';
    }
};