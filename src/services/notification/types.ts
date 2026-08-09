// services/notification/types.ts
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    read: boolean;
    createdAt: string;
    metadata?: {
        module?: string;
        actionUrl?: string;
        actionId?: string;
        sender?: string;
        recipient?: string;
    };
}