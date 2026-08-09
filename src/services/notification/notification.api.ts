// src/services/notification/notification.api.ts
import { api } from '../api';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    isRead: boolean;
    read: boolean;
    createdAt: string;
    readAt?: string;
    metadata?: {
        module?: string;
        actionUrl?: string;
        actionId?: string;
        sender?: string;
        recipient?: string;
        [key: string]: any;
    };
    moduleName?: string;
    referenceId?: string;
}

export interface PaginatedNotificationResponse {
    items: Notification[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    unreadCount: number;
}

export interface NotificationStats {
    total: number;
    unread: number;
    byType: {
        success: number;
        warning: number;
        error: number;
        info: number;
    };
    byPriority: {
        urgent: number;
        high: number;
        medium: number;
        low: number;
    };
    lastWeek: number;
    thisWeek: number;
}

export interface CreateNotificationDto {
    userId: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info' | 'task' | 'task_assigned' | 'task_completed' | 'leave_request' | 'leave_approved' | 'leave_rejected';
    priority?: 'urgent' | 'high' | 'medium' | 'low';
    metadata?: any;
    actionUrl?: string;
    moduleName?: string;
    referenceId?: string;
}

// Get paginated notifications
export async function getPaginatedNotifications(
    employeeId: string,
    pageNumber: number = 1,
    pageSize: number = 20
): Promise<PaginatedNotificationResponse> {
    try {
        const response = await api.get(`/notifications/paginated`, {
            params: {
                UserId: employeeId,
                pageNumber,
                pageSize,
                sortBy: 'CreatedAt',
                sortOrder: 'desc'
            }
        });

        if (response.data?.success && response.data?.data) {
            const data = response.data.data;
            return {
                items: data.items?.map((item: any) => ({
                    ...item,
                    read: item.isRead,
                    metadata: item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) : undefined
                })) || [],
                pageNumber: data.pageNumber || pageNumber,
                pageSize: data.pageSize || pageSize,
                totalCount: data.totalCount || 0,
                totalPages: data.totalPages || 0,
                hasPreviousPage: data.hasPreviousPage || false,
                hasNextPage: data.hasNextPage || false,
                unreadCount: data.unreadCount || 0
            };
        }

        return {
            items: [],
            pageNumber: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
            unreadCount: 0
        };
    } catch (error) {
        console.error('Error fetching paginated notifications:', error);
        return {
            items: [],
            pageNumber: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
            unreadCount: 0
        };
    }
}

// Get unread count
export async function getUnreadCount(employeeId: string): Promise<number> {
    try {
        const response = await api.get(`/notifications/unread/count/${employeeId}`);
        return response.data?.data || 0;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

// Get notification stats
export async function getNotificationStats(employeeId: string): Promise<NotificationStats | null> {
    try {
        const response = await api.get(`/notifications/stats/${employeeId}`);
        return response.data?.data || null;
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        return null;
    }
}

// Mark as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    try {
        await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
        console.error('Error marking as read:', error);
    }
}

// Mark all as read
export async function markAllNotificationsAsRead(employeeId: string): Promise<void> {
    try {
        await api.patch(`/notifications/user/${employeeId}/read-all`);
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

// Delete notification
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
}

// Clear all notifications
export async function clearAllNotifications(employeeId: string): Promise<void> {
    try {
        await api.delete(`/notifications/user/${employeeId}/clear`);
    } catch (error) {
        console.error('Error clearing notifications:', error);
    }
}

// Create notification - FIXED: Use PascalCase at root level (matches task notification)
export async function createNotification(dto: CreateNotificationDto): Promise<Notification | null> {
    try {
        // Validate required fields
        if (!dto.userId || dto.userId === '00000000-0000-0000-0000-000000000000') {
            console.error('❌ Invalid userId in notification:', dto.userId);
            return null;
        }

        console.log('📧 Creating notification for user:', dto.userId);
        console.log('📧 Notification data:', dto);

        // Build the request body with PascalCase properties at root level
        // This matches the format that works for task notifications
        const requestBody = {
            UserId: dto.userId,  // PascalCase - backend expects this
            Title: dto.title,
            Message: dto.message,
            Type: dto.type || 'info',
            Priority: dto.priority || 'medium',
            ModuleName: dto.moduleName || 'Leave System',
            ReferenceId: dto.referenceId || null,
            Metadata: dto.metadata ? JSON.stringify(dto.metadata) : null
        };

        console.log('📤 Sending notification request:', JSON.stringify(requestBody, null, 2));

        const response = await api.post('/notifications', requestBody);
        console.log('✅ Notification created:', response.data);
        return response.data?.data;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        return null;
    }
}
// src/services/notification/notification.api.ts
// src/services/notification/notification.api.ts

/**
 * Send notification to ALL active employees
 */
export async function sendToAllEmployees(
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info',
    priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium',
    moduleName: string = 'Leave System',
    metadata?: any
): Promise<boolean> {
    try {
        const requestBody = {
            title,
            message,
            type,
            priority,
            moduleName,
            metadata: metadata ? JSON.stringify(metadata) : null
        };

        console.log('📧 Sending notification to ALL employees:', requestBody);

        const response = await api.post('/notifications/all-employees', requestBody);
        return response.data?.success || false;
    } catch (error) {
        console.error('Error sending notification to all employees:', error);
        return false;
    }
}

/**
 * Send notification to a specific department
 */
export async function sendToDepartment(
    departmentId: string,
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info',
    priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium',
    moduleName: string = 'Leave System',
    metadata?: any
): Promise<boolean> {
    try {
        const requestBody = {
            title,
            message,
            type,
            priority,
            moduleName,
            metadata: metadata ? JSON.stringify(metadata) : null
        };

        const response = await api.post(`/notifications/department/${departmentId}`, requestBody);
        return response.data?.success || false;
    } catch (error) {
        console.error(`Error sending notification to department ${departmentId}:`, error);
        return false;
    }
}

/**
 * Send notification by employment type
 */
export async function sendByEmploymentType(
    employmentType: string,
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info',
    priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium',
    moduleName: string = 'Leave System',
    metadata?: any
): Promise<boolean> {
    try {
        const requestBody = {
            employmentType,
            notification: {
                title,
                message,
                type,
                priority,
                moduleName,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        };

        const response = await api.post('/notifications/by-employment-type', requestBody);
        return response.data?.success || false;
    } catch (error) {
        console.error(`Error sending notification to employment type ${employmentType}:`, error);
        return false;
    }
}
export async function createBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info',
    priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium',
    moduleName: string = 'Leave System',
    metadata?: any
): Promise<boolean> {
    try {
        const requestBody = {
            userIds: userIds,
            notification: {
                title,
                message,
                type,
                priority,
                moduleName,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        };

        const response = await api.post('/notifications/bulk', requestBody);
        return response.data?.success || false;
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        return false;
    }
}
// Setup SSE for real-time notifications
export function setupNotificationStream(
    employeeId: string,
    onNotification: (notification: Notification) => void,
    onError?: (error: Event) => void
): EventSource | null {
    if (typeof EventSource === 'undefined') {
        console.warn('EventSource not supported');
        return null;
    }

    try {
        const eventSource = new EventSource(`/notifications/stream/${employeeId}`);

        eventSource.onopen = () => {
            console.log('SSE connection established');
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const notifications = Array.isArray(data) ? data : [data];
                notifications.forEach((notification: Notification) => {
                    onNotification(notification);
                });
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            eventSource.close();
            if (onError) onError(error);
        };

        return eventSource;
    } catch (error) {
        console.error('Failed to create SSE connection:', error);
        return null;
    }
}

// Polling fallback
let pollingInterval: NodeJS.Timeout | null = null;

export function startPollingNotifications(
    employeeId: string,
    onNotifications: (notifications: Notification[]) => void,
    intervalMs: number = 30000
): () => void {
    // Clear any existing interval
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }

    let lastCheckTime = new Date().toISOString();

    const poll = async () => {
        try {
            const response = await getPaginatedNotifications(employeeId, 1, 10);
            if (response.items && response.items.length > 0) {
                const newNotifications = response.items.filter(
                    n => new Date(n.createdAt) > new Date(lastCheckTime)
                );
                if (newNotifications.length > 0) {
                    console.log(`Polling found ${newNotifications.length} new notifications`);
                    onNotifications(newNotifications);
                }
                lastCheckTime = new Date().toISOString();
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    };

    pollingInterval = setInterval(poll, intervalMs);

    return () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    };
}