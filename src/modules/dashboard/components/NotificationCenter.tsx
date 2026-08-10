// components/Notification/NotificationCenter.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CheckCircle, XCircle, AlertCircle, Info,
    Clock, Trash2, Eye, Loader2, ChevronDown,
    EyeOff, CheckCheck, Settings, Volume2, VolumeX,
    Monitor, BellRing, User, Users, Calendar, DollarSign, GitBranch
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useNotification } from '@/shared/contexts/NotificationContext';
import toast from 'react-hot-toast';
import { useThemeStore } from '@/shared/stores/theme.store';

import {
    getPaginatedNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadCount
} from '@/modules/notification/services/notification.api';

import type { Notification } from '@/modules/notification/services/notification.api';

interface NotificationCenterProps {
    onNotificationClick?: (notification: Notification) => void;
    showSettings?: boolean;
    showModuleFilter?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
                                                                   onNotificationClick,
                                                                   showSettings = true,
                                                                   showModuleFilter = true
                                                               }) => {
    const { employeeId } = useAuthStore();
    const {
        unreadCount: contextUnreadCount,
        soundEnabled,
        toggleSound,
        desktopEnabled,
        toggleDesktop,
        requestDesktopPermission
    } = useNotification();
    const { isDarkMode } = useThemeStore();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [localUnreadCount, setLocalUnreadCount] = useState(0);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);
    const pageSize = 20;

    // Refs for click outside detection
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get unique module names from notifications
    const availableModules = useMemo(() => {
        const modules = new Set<string>();
        notifications.forEach(n => {
            if (n.moduleName) {
                modules.add(n.moduleName);
            }
        });
        return ['all', ...Array.from(modules)];
    }, [notifications]);

    const loadNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        if (!employeeId) return;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await getPaginatedNotifications(employeeId, pageNum, pageSize);

            if (append) {
                setNotifications(prev => [...prev, ...response.items]);
            } else {
                setNotifications(response.items);
            }

            setTotalCount(response.totalCount);
            setLocalUnreadCount(response.unreadCount);
            setHasMore(response.hasNextPage);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [employeeId, pageSize]);

    const loadUnreadCount = useCallback(async () => {
        if (!employeeId) return;
        try {
            const count = await getUnreadCount(employeeId);
            setLocalUnreadCount(count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }, [employeeId]);

    useEffect(() => {
        if (isOpen) {
            loadNotifications(1, false);
            loadUnreadCount();
        }
    }, [isOpen, loadNotifications, loadUnreadCount]);

    useEffect(() => {
        if (employeeId) {
            loadUnreadCount();
        }
    }, [employeeId, loadUnreadCount]);

    // Handle click outside - FIXED using same pattern as ProfilePage
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if click is on the bell button - don't close
            if (buttonRef.current && buttonRef.current.contains(target)) {
                return;
            }

            // Check if click is inside the dropdown - don't close
            if (dropdownRef.current && dropdownRef.current.contains(target)) {
                return;
            }

            // Click is outside - close it
            setIsOpen(false);
        };

        // Handle escape key
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        // Use capture phase to catch events before they bubble
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('keydown', handleEscapeKey, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('keydown', handleEscapeKey, true);
        };
    }, [isOpen]);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setLocalUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Marked as read');
        } catch (error) {
            console.error('Error marking as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!employeeId) return;
        try {
            await markAllNotificationsAsRead(employeeId);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setLocalUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            const deletedNotif = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (deletedNotif && !deletedNotif.isRead) {
                setLocalUnreadCount(prev => Math.max(0, prev - 1));
            }
            setTotalCount(prev => prev - 1);
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleClearAll = async () => {
        if (!employeeId) return;
        if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            try {
                await clearAllNotifications(employeeId);
                setNotifications([]);
                setLocalUnreadCount(0);
                setTotalCount(0);
                toast.success('All notifications cleared');
            } catch (error) {
                console.error('Error clearing notifications:', error);
                toast.error('Failed to clear notifications');
            }
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            loadNotifications(page + 1, true);
        }
    };

    const handleViewNotification = (notification: Notification) => {
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
        if (notification.metadata?.actionUrl) {
            window.location.href = notification.metadata.actionUrl;
        }
        setIsOpen(false);
    };

    const getIcon = (type: string, priority?: string, moduleName?: string) => {
        if (priority === 'urgent') return <AlertCircle className="w-5 h-5 text-red-500" />;

        if (moduleName) {
            const moduleLower = moduleName.toLowerCase();
            if (moduleLower.includes('leave request') || moduleLower.includes('leave approval')) {
                return <Calendar className="w-5 h-5 text-blue-500" />;
            }
            if (moduleLower.includes('encashment')) {
                return <DollarSign className="w-5 h-5 text-emerald-500" />;
            }
            if (moduleLower.includes('year-end') || moduleLower.includes('carryover')) {
                return <GitBranch className="w-5 h-5 text-purple-500" />;
            }
            if (moduleLower.includes('employee')) {
                return <User className="w-5 h-5 text-cyan-500" />;
            }
        }

        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getPriorityBadge = (priority?: string) => {
        switch (priority) {
            case 'urgent':
                return <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Urgent</span>;
            case 'high':
                return <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">High</span>;
            case 'medium':
                return <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">Medium</span>;
            default:
                return null;
        }
    };

    const filteredNotifications = useMemo(() => {
        let filtered = notifications;

        if (filter === 'unread') {
            filtered = filtered.filter(n => !n.isRead);
        }

        if (moduleFilter !== 'all' && moduleFilter) {
            filtered = filtered.filter(n => n.moduleName === moduleFilter);
        }

        return filtered;
    }, [notifications, filter, moduleFilter]);

    const displayUnreadCount = contextUnreadCount || localUnreadCount;

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {displayUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-[500px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border z-[9999] overflow-hidden ${
                            isDarkMode
                                ? 'bg-slate-900 border-slate-700'
                                : 'bg-white border-slate-200'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`px-4 py-3 border-b ${
                            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-gradient-to-r from-slate-50 to-white'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                        Notifications
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {displayUnreadCount} unread · {totalCount} total
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {showSettings && (
                                        <button
                                            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                isDarkMode
                                                    ? 'hover:bg-slate-800 text-slate-400'
                                                    : 'hover:bg-slate-100 text-slate-500'
                                            }`}
                                            title="Settings"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className={`flex rounded-lg p-0.5 ${
                                        isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
                                    }`}>
                                        <button
                                            onClick={() => setFilter('all')}
                                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                                filter === 'all'
                                                    ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white shadow-sm text-slate-800')
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setFilter('unread')}
                                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                                filter === 'unread'
                                                    ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white shadow-sm text-slate-800')
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            Unread
                                        </button>
                                    </div>
                                    {displayUnreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                isDarkMode
                                                    ? 'hover:bg-slate-800 text-slate-400'
                                                    : 'hover:bg-slate-100 text-slate-500'
                                            }`}
                                            title="Mark all as read"
                                        >
                                            <CheckCheck className="w-4 h-4" />
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearAll}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                isDarkMode
                                                    ? 'hover:bg-red-900/30 text-red-400'
                                                    : 'hover:bg-red-100 text-red-500'
                                            }`}
                                            title="Clear all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <AnimatePresence>
                            {showSettingsPanel && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={`border-b ${
                                        isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                                    } overflow-hidden`}
                                >
                                    <div className="p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                                <span className="text-sm">Sound Alerts</span>
                                            </div>
                                            <button
                                                onClick={toggleSound}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Monitor className="w-4 h-4" />
                                                <span className="text-sm">Desktop Notifications</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {Notification.permission !== 'granted' && (
                                                    <button
                                                        onClick={requestDesktopPermission}
                                                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                                    >
                                                        Enable
                                                    </button>
                                                )}
                                                <button
                                                    onClick={toggleDesktop}
                                                    disabled={Notification.permission !== 'granted'}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        !desktopEnabled ? 'bg-slate-300 dark:bg-slate-600' : 'bg-emerald-500'
                                                    } ${Notification.permission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        desktopEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Module Filter */}
                        {showModuleFilter && availableModules.length > 1 && (
                            <div className={`px-4 py-2 border-b ${
                                isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'
                            }`}>
                                <div className="flex items-center gap-2 overflow-x-auto">
                                    <Users className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    {availableModules.map((module) => (
                                        <button
                                            key={module}
                                            onClick={() => setModuleFilter(module)}
                                            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                                                moduleFilter === module
                                                    ? (isDarkMode
                                                        ? 'bg-emerald-900/50 text-emerald-300'
                                                        : 'bg-emerald-100 text-emerald-700')
                                                    : (isDarkMode
                                                        ? 'text-slate-400 hover:bg-slate-800'
                                                        : 'text-slate-500 hover:bg-slate-100')
                                            }`}
                                        >
                                            {module === 'all' ? 'All Modules' : module}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notification List */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <BellRing className={`w-12 h-12 mx-auto mb-3 ${
                                        isDarkMode ? 'text-slate-700' : 'text-slate-300'
                                    }`} />
                                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                                    </p>
                                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {filter === 'unread' ? 'Great! You\'re all caught up' : 'New notifications will appear here'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {filteredNotifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: Math.min(index * 0.03, 0.5) }}
                                            className={`relative group border-b ${
                                                isDarkMode ? 'border-slate-800' : 'border-slate-100'
                                            } last:border-0 ${
                                                !notification.isRead
                                                    ? (isDarkMode ? 'bg-emerald-950/20' : 'bg-gradient-to-r from-emerald-50/30 to-transparent')
                                                    : ''
                                            }`}
                                        >
                                            <div className="px-4 py-3">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleViewNotification(notification)}
                                                        className="flex-shrink-0 mt-0.5 hover:opacity-80 transition-opacity"
                                                    >
                                                        {getIcon(notification.type, notification.priority, notification.moduleName)}
                                                    </button>

                                                    <div
                                                        onClick={() => handleViewNotification(notification)}
                                                        className="flex-1 min-w-0 cursor-pointer"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm font-medium ${
                                                                !notification.isRead
                                                                    ? (isDarkMode ? 'text-slate-200' : 'text-slate-900')
                                                                    : (isDarkMode ? 'text-slate-400' : 'text-slate-600')
                                                            }`}>
                                                                {notification.title}
                                                            </p>
                                                        </div>
                                                        <p className={`text-xs mt-1 line-clamp-2 ${
                                                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                                        }`}>
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            {getPriorityBadge(notification.priority)}
                                                            <span className={`text-xs flex items-center gap-1 ${
                                                                isDarkMode ? 'text-slate-500' : 'text-slate-400'
                                                            }`}>
                                                                <Clock className="w-3 h-3" />
                                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                            </span>
                                                            {notification.moduleName && (
                                                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                                    isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                                }`}>
                                                                    {notification.moduleName}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {notification.metadata?.status && (
                                                            <span className={`text-xs mt-1 inline-block px-1.5 py-0.5 rounded ${
                                                                notification.metadata.status === 'APPROVED' || notification.metadata.status === 'COMPLETED'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : notification.metadata.status === 'REJECTED'
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                        : notification.metadata.status === 'PENDING' || notification.metadata.status === 'PENDING_APPROVAL'
                                                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}>
                                                                {notification.metadata.status}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                className={`p-1.5 rounded-lg transition-colors ${
                                                                    isDarkMode
                                                                        ? 'hover:bg-emerald-900/30 text-emerald-400'
                                                                        : 'hover:bg-emerald-100 text-emerald-600'
                                                                }`}
                                                                title="Mark as read"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {notification.isRead && (
                                                            <button
                                                                className={`p-1.5 rounded-lg opacity-50 cursor-not-allowed ${
                                                                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                                                                }`}
                                                                title="Already read"
                                                                disabled
                                                            >
                                                                <EyeOff className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(notification.id, e)}
                                                            className={`p-1.5 rounded-lg transition-colors ${
                                                                isDarkMode
                                                                    ? 'hover:bg-red-900/30 text-red-400'
                                                                    : 'hover:bg-red-100 text-red-500'
                                                            }`}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {hasMore && notifications.length > 0 && (
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className={`w-full py-3 text-center text-sm transition-colors ${
                                                isDarkMode
                                                    ? 'text-emerald-400 hover:bg-slate-800'
                                                    : 'text-emerald-600 hover:bg-slate-50'
                                            } disabled:opacity-50`}
                                        >
                                            {loadingMore ? (
                                                <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                                            ) : (
                                                <>Load more <ChevronDown className="w-3 h-3 inline ml-1" /></>
                                            )}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className={`px-4 py-2 border-t ${
                                isDarkMode
                                    ? 'border-slate-800 bg-slate-900/50'
                                    : 'border-slate-200 bg-slate-50'
                            }`}>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>
                                        Showing {filteredNotifications.length} of {totalCount} notifications
                                    </span>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className={`transition-colors ${
                                            isDarkMode
                                                ? 'text-slate-400 hover:text-slate-300'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;