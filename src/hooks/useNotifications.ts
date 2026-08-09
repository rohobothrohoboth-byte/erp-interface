// src/hooks/useNotifications.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/auth.store';
import {
    type Notification,
    type CreateNotificationDto,
    getUnreadCount,
    createNotification,
    setupNotificationStream,
    startPollingNotifications,
    getPaginatedNotifications
} from '../services/notification/notification.api';
import toast from 'react-hot-toast';

// Web Audio context singleton - NO HTML5 Audio
let audioContext: AudioContext | null = null;
let audioInitialized = false;

const initAudioContext = (): AudioContext | null => {
    if (audioInitialized && audioContext) {
        return audioContext;
    }

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
            audioInitialized = true;
            return audioContext;
        }
    } catch (error) {
        console.warn('Web Audio API not supported:', error);
    }
    return null;
};

const playNotificationSound = (): void => {
    try {
        const context = initAudioContext();
        if (!context) return;

        if (context.state === 'suspended') {
            context.resume().catch(() => {});
        }

        const now = context.currentTime;

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

    } catch (error) {
        console.warn('Could not play notification sound:', error);
    }
};

export const useNotifications = () => {
    const { employeeId, user } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(() => {
        return localStorage.getItem('notification_sound_enabled') !== 'false';
    });
    const [desktopEnabled, setDesktopEnabled] = useState(() => {
        return localStorage.getItem('notification_desktop_enabled') === 'true';
    });
    const eventSourceRef = useRef<EventSource | null>(null);
    const stopPollingRef = useRef<(() => void) | null>(null);

    // Initialize audio on first user interaction
    useEffect(() => {
        const initAudio = () => {
            if (!audioInitialized) {
                initAudioContext();
            }
        };

        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });

        return () => {
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
    }, []);

    // Play sound - NO HTML5 Audio
    const playSound = useCallback(() => {
        if (soundEnabled) {
            playNotificationSound();
        }
    }, [soundEnabled]);

    // Show desktop notification
    const showDesktopNotification = useCallback((notification: Notification) => {
        if (desktopEnabled && Notification.permission === 'granted') {
            try {
                const desktopNotif = new Notification(notification.title, {
                    body: notification.message,
                    icon: '/logo-192.png',
                    tag: notification.id,
                    silent: true,
                });

                desktopNotif.onclick = () => {
                    window.focus();
                    if (notification.metadata?.actionUrl) {
                        window.location.href = notification.metadata.actionUrl;
                    }
                };

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

    // Request desktop permission
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

    // Toggle sound
    const toggleSound = useCallback(() => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue);
        localStorage.setItem('notification_sound_enabled', String(newValue));

        if (newValue) {
            initAudioContext();
        }

        toast.success(`Notification sound ${newValue ? 'enabled' : 'disabled'}`);
    }, [soundEnabled]);

    // Toggle desktop
    const toggleDesktop = useCallback(() => {
        const newValue = !desktopEnabled;
        setDesktopEnabled(newValue);
        localStorage.setItem('notification_desktop_enabled', String(newValue));
        toast.success(`Desktop notifications ${newValue ? 'enabled' : 'disabled'}`);
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

    // Handle new notification
    const handleNewNotification = useCallback((notification: Notification) => {
        setUnreadCount(prev => prev + 1);
        setRecentNotifications(prev => [notification, ...prev].slice(0, 5));
        playSound();
        showDesktopNotification(notification);

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
    }, [playSound, showDesktopNotification]);

    // Handle multiple notifications
    const handleNewNotifications = useCallback((notifications: Notification[]) => {
        notifications.forEach(notification => {
            handleNewNotification(notification);
        });
    }, [handleNewNotification]);

    // Send notification - FIXED to validate userId
    // src/hooks/useNotifications.ts - sendNotification function

    // src/hooks/useNotifications.ts - sendNotification function

    const sendNotification = useCallback(async (dto: CreateNotificationDto) => {
        try {
            if (!dto.userId || dto.userId === '00000000-0000-0000-0000-000000000000') {
                console.error('❌ Invalid userId in sendNotification:', dto.userId);
                return null;
            }

            console.log('📤 Sending notification for user:', dto.userId);
            console.log('📤 Notification data:', dto);

            const notification = await createNotification(dto);

            if (notification) {
                console.log('✅ Notification sent successfully');
                setRecentNotifications(prev => [notification, ...prev].slice(0, 5));
            }

            return notification;
        } catch (error) {
            console.error('❌ Failed to send notification:', error);
            return null;
        }
    }, []);

    // Setup real-time notifications (using polling only)
    useEffect(() => {
        if (!employeeId) return;

        refreshUnreadCount();

        console.log('Using polling for notifications');

        if (!stopPollingRef.current) {
            stopPollingRef.current = startPollingNotifications(
                employeeId,
                handleNewNotifications,
                30000
            );
        }

        return () => {
            if (stopPollingRef.current) {
                stopPollingRef.current();
                stopPollingRef.current = null;
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [employeeId, handleNewNotifications, refreshUnreadCount]);

    return {
        unreadCount,
        recentNotifications,
        soundEnabled,
        desktopEnabled,
        toggleSound,
        toggleDesktop,
        requestDesktopPermission,
        refreshUnreadCount,
        sendNotification,
        playSound,
    };
};