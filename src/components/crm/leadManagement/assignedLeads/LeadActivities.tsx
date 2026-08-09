// src/components/crm/leadManagement/assignedLeads/LeadActivities.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Phone, Mail, Calendar, MessageSquare, FileText,
  User, Clock, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { showToast } from '../../../../layout/layout';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../../../../services/crm/crm.api';
import type { ActivityDto, CreateActivityDto } from '../../../../types/crm/crm.types';

interface LeadActivitiesProps {
  leadId: string;
  onActivityAdded?: () => void;
}

const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Task', 'Note'];
const ACTIVITY_STATUS = ['Scheduled', 'InProgress', 'Completed', 'Cancelled', 'Postponed'];

const ACTIVITY_ICONS: Record<string, any> = {
  'Call': Phone,
  'Email': Mail,
  'Meeting': Calendar,
  'Task': FileText,
  'Note': MessageSquare,
};

const ACTIVITY_COLORS: Record<string, string> = {
  'Call': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Email': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Meeting': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Task': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Note': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
};

const STATUS_COLORS: Record<string, string> = {
  'Scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'InProgress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Postponed': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
};

export default function LeadActivities({ leadId, onActivityAdded }: LeadActivitiesProps) {
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newActivity, setNewActivity] = useState<CreateActivityDto>({
    title: '',
    description: '',
    type: 'Note',
    status: 'Scheduled',
    leadId: leadId,
    startDateTime: new Date().toISOString(),
    endDateTime: new Date(Date.now() + 3600000).toISOString(),
    isAllDay: false,
  });

  useEffect(() => {
    fetchActivities();
  }, [leadId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await getActivities({ leadId });
      if (response.data.success) {
        setActivities(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      showToast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.title || !newActivity.description) {
      showToast.warning('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createActivity(newActivity);
      if (response.data.success) {
        showToast.success('Activity added successfully');
        setIsAddOpen(false);
        setNewActivity({
          title: '',
          description: '',
          type: 'Note',
          status: 'Scheduled',
          leadId: leadId,
          startDateTime: new Date().toISOString(),
          endDateTime: new Date(Date.now() + 3600000).toISOString(),
          isAllDay: false,
        });
        await fetchActivities();
        if (onActivityAdded) onActivityAdded();
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      showToast.error('Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (activityId: string, newStatus: string) => {
    try {
      const response = await updateActivity(activityId, { status: newStatus });
      if (response.data.success) {
        showToast.success('Activity status updated');
        await fetchActivities();
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      showToast.error('Failed to update activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const response = await deleteActivity(activityId);
      if (response.data.success) {
        showToast.success('Activity deleted');
        await fetchActivities();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      showToast.error('Failed to delete activity');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    const Icon = ACTIVITY_ICONS[type] || FileText;
    return Icon;
  };

  const getActivityColor = (type: string) => {
    return ACTIVITY_COLORS[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        </div>
    );
  }

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activities</h3>
          <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activities yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Add your first activity to track interactions with this lead.</p>
                </CardContent>
              </Card>
          ) : (
              activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {activity.title}
                                </h4>
                                <Badge className={getActivityColor(activity.type)}>
                                  {activity.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(activity.status)}>
                                  {activity.status || 'Scheduled'}
                                </Badge>
                                <span className="text-sm text-gray-500">
                            {formatDate(activity.startDateTime)}
                          </span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{activity.assignedToUserName || 'Unassigned'}</span>
                              </div>
                              {activity.endDateTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Until {formatDate(activity.endDateTime)}</span>
                                  </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Select
                                value={activity.status || 'Scheduled'}
                                onValueChange={(value) => handleUpdateStatus(activity.id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTIVITY_STATUS.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteActivity(activity.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                );
              })
          )}
        </div>

        {/* Add Activity Modal */}
        {isAddOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <Plus className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Activity</h2>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Activity Type</Label>
                      <Select
                          value={newActivity.type}
                          onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                          value={newActivity.status}
                          onValueChange={(value) => setNewActivity(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_STATUS.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Title <span className="text-red-500">*</span></Label>
                    <Input
                        value={newActivity.title}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Activity title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description <span className="text-red-500">*</span></Label>
                    <Textarea
                        value={newActivity.description}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Activity description"
                        rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date/Time</Label>
                      <Input
                          type="datetime-local"
                          value={newActivity.startDateTime?.slice(0, 16)}
                          onChange={(e) => setNewActivity(prev => ({
                            ...prev,
                            startDateTime: new Date(e.target.value).toISOString()
                          }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date/Time</Label>
                      <Input
                          type="datetime-local"
                          value={newActivity.endDateTime?.slice(0, 16)}
                          onChange={(e) => setNewActivity(prev => ({
                            ...prev,
                            endDateTime: new Date(e.target.value).toISOString()
                          }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isAllDay"
                        checked={newActivity.isAllDay}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, isAllDay: e.target.checked }))}
                        className="rounded"
                    />
                    <Label htmlFor="isAllDay" className="text-sm">All day event</Label>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                  <div className="flex justify-center items-center gap-3">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                        onClick={handleAddActivity}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={isSubmitting || !newActivity.title || !newActivity.description}
                    >
                      {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                      ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                          </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
        )}
      </div>
  );
}