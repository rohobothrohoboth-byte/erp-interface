import React, { useState, useEffect } from 'react';
import { Bell, Mail, Calendar, Users, Briefcase } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { notificationApi } from '../services/notification/notification.api';

const NotificationSettings: React.FC = () => {
    const { employeeId } = useAuthStore();
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        taskAssignments: true,
        leaveUpdates: true,
        hrUpdates: true,
        systemUpdates: false
    });

    const toggleSetting = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-emerald-500" />
                <h1 className="text-xl font-bold text-slate-800">Notification Settings</h1>
            </div>

            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h3 className="font-medium mb-3">Delivery Methods</h3>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>Email Notifications</span>
                            </div>
                            <button
                                onClick={() => toggleSetting('emailNotifications')}
                                className={`w-10 h-5 rounded-full transition-colors ${preferences.emailNotifications ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${preferences.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-slate-400" />
                                <span>Push Notifications</span>
                            </div>
                            <button
                                onClick={() => toggleSetting('pushNotifications')}
                                className={`w-10 h-5 rounded-full transition-colors ${preferences.pushNotifications ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${preferences.pushNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h3 className="font-medium mb-3">Events to Notify</h3>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-slate-400" />
                                <span>Task Assignments</span>
                            </div>
                            <button
                                onClick={() => toggleSetting('taskAssignments')}
                                className={`w-10 h-5 rounded-full transition-colors ${preferences.taskAssignments ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5" />
                            </button>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>Leave Requests</span>
                            </div>
                            <button
                                onClick={() => toggleSetting('leaveUpdates')}
                                className={`w-10 h-5 rounded-full transition-colors ${preferences.leaveUpdates ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5" />
                            </button>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>HR Updates</span>
                            </div>
                            <button
                                onClick={() => toggleSetting('hrUpdates')}
                                className={`w-10 h-5 rounded-full transition-colors ${preferences.hrUpdates ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5" />
                            </button>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;