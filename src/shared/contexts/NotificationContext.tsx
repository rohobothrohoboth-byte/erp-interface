// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
    getUnreadCount,
    getNotificationStats,
    setupNotificationStream,
    startPollingNotifications,
    type Notification,
    type NotificationStats
} from '@/modules/notification/services/notification.api';
import { useAuthStore } from '@/shared/stores/auth.store';
import toast from 'react-hot-toast';

interface NotificationContextType {
    unreadCount: number;
    stats: NotificationStats | null;
    latestNotification: Notification | null;
    showNotifications: boolean;
    setShowNotifications: (show: boolean) => void;
    refreshUnreadCount: () => Promise<void>;
    playSound: () => void;
    soundEnabled: boolean;
    toggleSound: () => void;
    desktopEnabled: boolean;
    toggleDesktop: () => void;
    requestDesktopPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { employeeId } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(() => {
        return localStorage.getItem('notification_sound_enabled') !== 'false';
    });
    const [desktopEnabled, setDesktopEnabled] = useState(() => {
        return localStorage.getItem('notification_desktop_enabled') === 'true';
    });

    const eventSourceRef = useRef<EventSource | null>(null);
    const stopPollingRef = useRef<(() => void) | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioInitializedRef = useRef(false);

    // Initialize Web Audio context once
    const initAudioContext = useCallback(() => {
        if (audioInitializedRef.current && audioContextRef.current) {
            return audioContextRef.current;
        }

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
                audioInitializedRef.current = true;
                return audioContextRef.current;
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
        return null;
    }, []);

    // Play notification sound using Web Audio API (no external file needed)
    const playSound = useCallback(() => {
        if (!soundEnabled) return;

        try {
            const context = initAudioContext();
            if (!context) return;

            // Resume context if suspended (needed for autoplay policies)
            if (context.state === 'suspended') {
                context.resume().catch(() => {});
            }

            // Create two beeps - a pleasant notification sound
            const now = context.currentTime;

            // First beep - 800Hz
            const osc1 = context.createOscillator();
            const gain1 = context.createGain();
            osc1.connect(gain1);
            gain1.connect(context.destination);
            osc1.frequency.setValueAtTime(800, now);
            osc1.type = 'sine';
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc1.start(now);
            osc1.stop(now + 0.12);

            // Second beep - 1000Hz, slightly delayed
            const osc2 = context.createOscillator();
            const gain2 = context.createGain();
            osc2.connect(gain2);
            gain2.connect(context.destination);
            osc2.frequency.setValueAtTime(1000, now + 0.15);
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.25, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.27);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.27);

            // Clean up old context if it's been idle
            setTimeout(() => {
                if (audioContextRef.current && audioContextRef.current.state === 'running') {
                    // Don't close, keep it for next use
                }
            }, 1000);

        } catch (error) {
            console.warn('Could not play notification sound:', error);
            // Silent fail - don't break the notification flow
        }
    }, [soundEnabled, initAudioContext]);

    // Toggle sound
    const toggleSound = useCallback(() => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue);
        localStorage.setItem('notification_sound_enabled', String(newValue));

        // If enabling sound, initialize audio context
        if (newValue) {
            initAudioContext();
        }

        toast.success(`Notification sound ${newValue ? 'enabled' : 'disabled'}`);
    }, [soundEnabled, initAudioContext]);

    // Toggle desktop notifications
    const toggleDesktop = useCallback(() => {
        const newValue = !desktopEnabled;
        setDesktopEnabled(newValue);
        localStorage.setItem('notification_desktop_enabled', String(newValue));
        toast.success(`Desktop notifications ${newValue ? 'enabled' : 'disabled'}`);
    }, [desktopEnabled]);

    // Request desktop notification permission
    const requestDesktopPermission = useCallback(async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setDesktopEnabled(true);
                localStorage.setItem('notification_desktop_enabled', 'true');
                toast.success('Desktop notifications enabled');
            } else {
                toast.error('Desktop notifications denied');
            }
        } else {
            toast.error('Desktop notifications not supported');
        }
    }, []);

    // Show desktop notification
    const showDesktopNotification = useCallback((notification: Notification) => {
        if (desktopEnabled && Notification.permission === 'granted') {
            try {
                const desktopNotif = new Notification(notification.title, {
                    body: notification.message,
                    icon: '/logo-192.png',
                    tag: notification.id,
                    silent: true, // Always silent, we handle sound separately
                });

                desktopNotif.onclick = () => {
                    window.focus();
                    if (notification.metadata?.actionUrl) {
                        window.location.href = notification.metadata.actionUrl;
                    }
                };

                // Auto-close after 10 seconds
                setTimeout(() => {
                    if (desktopNotif && !desktopNotif.closed) {
                        desktopNotif.close();
                    }
                }, 10000);
            } catch (error) {
                console.warn('Could not show desktop notification:', error);
            }
        }
    }, [desktopEnabled]);

    // Refresh unread count
    const refreshUnreadCount = useCallback(async () => {
        if (!employeeId) return;
        try {
            const count = await getUnreadCount(employeeId);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to refresh unread count:', error);
        }
    }, [employeeId]);

    // Refresh stats
    const refreshStats = useCallback(async () => {
        if (!employeeId) return;
        try {
            const newStats = await getNotificationStats(employeeId);
            setStats(newStats);
        } catch (error) {
            console.error('Failed to refresh stats:', error);
        }
    }, [employeeId]);

    // Handle new notification
    const handleNewNotification = useCallback((notification: Notification) => {
        setUnreadCount(prev => prev + 1);
        setLatestNotification(notification);
        playSound();
        showDesktopNotification(notification);

        // Show toast for important notifications
        if (notification.priority === 'urgent' || notification.type === 'warning') {
            toast.error(notification.message, {
                duration: 5000,
                icon: '⚠️',
                style: {
                    background: '#dc2626',
                    color: '#fff',
                    borderRadius: '12px',
                },
            });
        } else if (notification.type === 'success') {
            toast.success(notification.message, {
                duration: 3000,
                style: {
                    background: '#059669',
                    color: '#fff',
                    borderRadius: '12px',
                },
            });
        } else if (notification.type === 'error') {
            toast.error(notification.message, {
                duration: 4000,
                style: {
                    background: '#dc2626',
                    color: '#fff',
                    borderRadius: '12px',
                },
            });
        } else {
            toast(notification.message, {
                duration: 4000,
                icon: '🔔',
                style: {
                    background: '#3b82f6',
                    color: '#fff',
                    borderRadius: '12px',
                },
            });
        }

        refreshStats();
    }, [playSound, showDesktopNotification, refreshStats]);

    // Handle multiple notifications
    const handleNewNotifications = useCallback((notifications: Notification[]) => {
        notifications.forEach(notification => {
            handleNewNotification(notification);
        });
    }, [handleNewNotification]);

    // Setup real-time notifications (polling)
    useEffect(() => {
        if (!employeeId) return;

        refreshUnreadCount();
        refreshStats();

        // Initialize audio context on first render (user gesture will resume it)
        initAudioContext();



        // Start polling
        if (!stopPollingRef.current) {
            stopPollingRef.current = startPollingNotifications(
                employeeId,
                handleNewNotifications,
                30000 // Poll every 30 seconds
            );
        }

        return () => {
            if (stopPollingRef.current) {
                stopPollingRef.current();
                stopPollingRef.current = null;
            }
        };
    }, [employeeId, handleNewNotifications, refreshUnreadCount, refreshStats, initAudioContext]);

    const value = {
        unreadCount,
        stats,
        latestNotification,
        showNotifications,
        setShowNotifications,
        refreshUnreadCount,
        playSound,
        soundEnabled,
        toggleSound,
        desktopEnabled,
        toggleDesktop,
        requestDesktopPermission,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};