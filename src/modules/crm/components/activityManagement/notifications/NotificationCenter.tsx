import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, Calendar, AlertTriangle, CheckCircle, X, Settings, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { showToast } from '@/shared/layout/layout';
import type { Activity } from '@/modules/crm/types/crm';

interface Notification {
  id: string;
  type: 'reminder' | 'overdue' | 'upcoming' | 'completed' | 'assigned';
  title: string;
  message: string;
  activityId: string;
  activityTitle: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSettings {
  reminders: boolean;
  overdueAlerts: boolean;
  upcomingTasks: boolean;
  completionNotifications: boolean;
  assignmentNotifications: boolean;
  emailNotifications: boolean;
  reminderTime: number; // minutes before
}

interface NotificationCenterProps {
  activities: Activity[];
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'overdue',
    title: 'Overdue Task',
    message: 'Follow-up call with TechCorp is overdue by 2 hours',
    activityId: '1',
    activityTitle: 'Follow-up call with TechCorp',
    timestamp: '2024-01-19T16:30:00Z',
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'upcoming',
    title: 'Upcoming Meeting',
    message: 'Product Demo for RetailPlus starts in 30 minutes',
    activityId: '2',
    activityTitle: 'Product Demo for RetailPlus',
    timestamp: '2024-01-20T09:30:00Z',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Task Reminder',
    message: 'Don\'t forget to prepare presentation materials',
    activityId: '3',
    activityTitle: 'Prepare Q1 presentation',
    timestamp: '2024-01-19T14:00:00Z',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '4',
    type: 'completed',
    title: 'Task Completed',
    message: 'Email campaign setup has been marked as completed',
    activityId: '4',
    activityTitle: 'Email campaign setup',
    timestamp: '2024-01-19T11:45:00Z',
    isRead: true,
    priority: 'low'
  },
  {
    id: '5',
    type: 'assigned',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: Client onboarding call',
    activityId: '5',
    activityTitle: 'Client onboarding call',
    timestamp: '2024-01-19T10:15:00Z',
    isRead: false,
    priority: 'medium'
  }
];

export default function NotificationCenter({ activities }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'overdue' | 'upcoming'>('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    reminders: true,
    overdueAlerts: true,
    upcomingTasks: true,
    completionNotifications: true,
    assignmentNotifications: true,
    emailNotifications: false,
    reminderTime: 15
  });
  const [showSettings, setShowSettings] = useState(false);

  // Generate notifications from activities
  const generateNotifications = () => {
    const now = new Date();
    const newNotifications: Notification[] = [];

    activities.forEach(activity => {
      const scheduledDate = new Date(activity.scheduledDate);
      const timeDiff = scheduledDate.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      // Overdue notifications
      if (minutesDiff < 0 && activity.status !== 'Completed' && settings.overdueAlerts) {
        const existingOverdue = notifications.find(n => 
          n.activityId === activity.id && n.type === 'overdue'
        );
        
        if (!existingOverdue) {
          newNotifications.push({
            id: `overdue-${activity.id}`,
            type: 'overdue',
            title: 'Overdue Task',
            message: `${activity.title} is overdue by ${Math.abs(Math.floor(minutesDiff / 60))} hours`,
            activityId: activity.id,
            activityTitle: activity.title,
            timestamp: now.toISOString(),
            isRead: false,
            priority: 'high'
          });
        }
      }

      // Upcoming notifications
      if (minutesDiff > 0 && minutesDiff <= settings.reminderTime && settings.upcomingTasks) {
        const existingUpcoming = notifications.find(n => 
          n.activityId === activity.id && n.type === 'upcoming'
        );
        
        if (!existingUpcoming) {
          newNotifications.push({
            id: `upcoming-${activity.id}`,
            type: 'upcoming',
            title: 'Upcoming Task',
            message: `${activity.title} starts in ${minutesDiff} minutes`,
            activityId: activity.id,
            activityTitle: activity.title,
            timestamp: now.toISOString(),
            isRead: false,
            priority: 'medium'
          });
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'overdue':
        return notification.type === 'overdue';
      case 'upcoming':
        return notification.type === 'upcoming';
      default:
        return true;
    }
  });

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    showToast.success('All notifications marked as read');
  };

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    showToast.success('Notification deleted');
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    showToast.success('All notifications cleared');
  };

  // Update settings
  const updateSetting = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showToast.success('Notification settings updated');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue': return AlertTriangle;
      case 'upcoming': return Clock;
      case 'reminder': return Bell;
      case 'completed': return CheckCircle;
      case 'assigned': return Calendar;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (type === 'overdue') return 'border-l-red-500 bg-red-50';
    if (priority === 'high') return 'border-l-orange-500 bg-orange-50';
    if (priority === 'medium') return 'border-l-orange-500 bg-orange-50';
    return 'border-l-gray-500 bg-gray-50';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const overdueCount = notifications.filter(n => n.type === 'overdue').length;
  const upcomingCount = notifications.filter(n => n.type === 'upcoming').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Notification Controls */}
      <Card>
        <CardContent className="px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={generateNotifications} variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={markAllAsRead} variant="outline" disabled={unreadCount === 0}>
                Mark All Read
              </Button>
              <Button onClick={clearAllNotifications} variant="outline" disabled={notifications.length === 0}>
                Clear All
              </Button>
              <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-orange-600" />
              <span>Notification Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminders">Task Reminders</Label>
                  <Switch
                    id="reminders"
                    checked={settings.reminders}
                    onCheckedChange={(checked) => updateSetting('reminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="overdue">Overdue Alerts</Label>
                  <Switch
                    id="overdue"
                    checked={settings.overdueAlerts}
                    onCheckedChange={(checked) => updateSetting('overdueAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="upcoming">Upcoming Tasks</Label>
                  <Switch
                    id="upcoming"
                    checked={settings.upcomingTasks}
                    onCheckedChange={(checked) => updateSetting('upcomingTasks', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="completion">Completion Notifications</Label>
                  <Switch
                    id="completion"
                    checked={settings.completionNotifications}
                    onCheckedChange={(checked) => updateSetting('completionNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="assignment">Assignment Notifications</Label>
                  <Switch
                    id="assignment"
                    checked={settings.assignmentNotifications}
                    onCheckedChange={(checked) => updateSetting('assignmentNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email Notifications</Label>
                  <Switch
                    id="email"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center space-x-4">
                <Label htmlFor="reminderTime">Reminder Time (minutes before):</Label>
                <Select 
                  value={settings.reminderTime.toString()} 
                  onValueChange={(value) => updateSetting('reminderTime', parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800">{unreadCount} unread</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! No notifications to show.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((notification) => {
                  const NotificationIcon = getNotificationIcon(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 rounded-lg transition-colors ${
                        getNotificationColor(notification.type, notification.priority)
                      } ${!notification.isRead ? 'shadow-sm' : 'opacity-75'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            notification.type === 'overdue' ? 'bg-red-100' :
                            notification.priority === 'high' ? 'bg-orange-100' :
                            notification.priority === 'medium' ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            <NotificationIcon className={`w-4 h-4 ${
                              notification.type === 'overdue' ? 'text-red-600' :
                              notification.priority === 'high' ? 'text-orange-600' :
                              notification.priority === 'medium' ? 'text-orange-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                              )}
                              <Badge variant="outline" className="text-xs capitalize">
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{new Date(notification.timestamp).toLocaleString()}</span>
                              <span>•</span>
                              <span>{notification.activityTitle}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}