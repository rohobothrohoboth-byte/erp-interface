// src/modules/project/types/notification.types.ts
import { NotificationType, NotificationPriority } from './project.enums';

export interface ProjectNotification {
    id: string;
    userId: string;
    userName: string;
    type: NotificationType;
    title: string;
    message: string;
    projectId: string | null;
    projectName: string;
    entityId: string | null;
    entityType: string;
    priority: NotificationPriority;
    isRead: boolean;
    readAt: string | null;
    isDelivered: boolean;
    deliveredAt: string | null;
    deliveryChannel: string | null;
    actionUrl: string | null;
    expiresAt: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateNotificationDto {
    userId: string;
    userName: string;
    type: NotificationType;
    title: string;
    message: string;
    projectId?: string | null;
    entityId?: string | null;
    entityType?: string;
    priority?: NotificationPriority;
    actionUrl?: string | null;
    createdBy?: string;
}

export interface NotificationFilterDto {
    isRead?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    page: number;
    pageSize: number;
}