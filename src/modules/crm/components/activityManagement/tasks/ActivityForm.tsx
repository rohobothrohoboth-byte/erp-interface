import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, Building, Phone, Mail, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import type { Activity } from '@/modules/crm/types/crm';

interface ActivityFormProps {
  activity?: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activityData: Partial<Activity>) => void;
  mode: 'add' | 'edit';
}

export default function ActivityForm({ activity, isOpen, onClose, onSubmit, mode }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    type: 'Task' as Activity['type'],
    title: '',
    description: '',
    status: 'Pending' as Activity['status'],
    priority: 'Medium' as Activity['priority'],
    assignedTo: '',
    scheduledDate: '',
    scheduledTime: '',
    relatedToType: 'Lead' as 'Lead' | 'Contact' | 'Opportunity' | 'Account',
    relatedToId: '',
    relatedToName: '',
    reminder: false,
    reminderTime: '15'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activity && mode === 'edit') {
      const scheduledDate = new Date(activity.scheduledDate);
      setFormData({
        type: activity.type,
        title: activity.title,
        description: activity.description,
        status: activity.status,
        priority: activity.priority,
        assignedTo: activity.assignedTo,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        scheduledTime: scheduledDate.toTimeString().slice(0, 5),
        relatedToType: activity.relatedTo?.type || 'Lead',
        relatedToId: activity.relatedTo?.id || '',
        relatedToName: activity.relatedTo?.name || '',
        reminder: activity.reminder,
        reminderTime: activity.reminderTime ? 
          Math.floor((new Date(activity.scheduledDate).getTime() - new Date(activity.reminderTime).getTime()) / (1000 * 60)).toString() : 
          '15'
      });
    } else {
      // Reset form for add mode
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      setFormData({
        type: 'Task',
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        assignedTo: '',
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: '09:00',
        relatedToType: 'Lead',
        relatedToId: '',
        relatedToName: '',
        reminder: false,
        reminderTime: '15'
      });
    }
    setErrors({});
  }, [activity, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign this activity to someone';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Scheduled time is required';
    }

    // Validate that scheduled date is not in the past (unless editing completed activity)
    if (formData.scheduledDate && formData.scheduledTime) {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      const now = new Date();
      
      if (scheduledDateTime < now && mode === 'add') {
        newErrors.scheduledDate = 'Scheduled date and time cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    
    // Calculate reminder time if enabled
    let reminderTime: string | undefined;
    if (formData.reminder) {
      const reminderMinutes = parseInt(formData.reminderTime);
      const reminderDateTime = new Date(scheduledDateTime.getTime() - (reminderMinutes * 60 * 1000));
      reminderTime = reminderDateTime.toISOString();
    }

    const activityData: Partial<Activity> = {
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      scheduledDate: scheduledDateTime.toISOString(),
      reminder: formData.reminder,
      reminderTime: reminderTime,
      relatedTo: formData.relatedToName ? {
        type: formData.relatedToType,
        id: formData.relatedToId || Date.now().toString(),
        name: formData.relatedToName.trim()
      } : undefined
    };

    onSubmit(activityData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'Call': return Phone;
      case 'Email': return Mail;
      case 'Meeting': return MessageSquare;
      case 'Task': return FileText;
      case 'Note': return FileText;
      default: return Calendar;
    }
  };

  const assignees = [
    'Sarah Johnson',
    'Mike Wilson',
    'Emily Davis',
    'John Smith',
    'Lisa Chen',
    'David Brown'
  ];

  // Mock related entities for demonstration
  const relatedEntities = {
    Lead: [
      { id: '1', name: 'John Smith - TechCorp Solutions' },
      { id: '2', name: 'Emily Davis - RetailPlus Inc' },
      { id: '3', name: 'Robert Chen - Global Manufacturing' }
    ],
    Contact: [
      { id: '1', name: 'Alice Johnson - Innovation Labs' },
      { id: '2', name: 'David Brown - TechStart Solutions' },
      { id: '3', name: 'Maria Garcia - Global Manufacturing' }
    ],
    Opportunity: [
      { id: '1', name: 'Enterprise ERP Implementation' },
      { id: '2', name: 'CRM System Upgrade' }
    ],
    Account: [
      { id: '1', name: 'TechCorp Solutions' },
      { id: '2', name: 'RetailPlus Inc' },
      { id: '3', name: 'Global Manufacturing' }
    ]
  };

  const ActivityIcon = getActivityIcon(formData.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ActivityIcon className="w-5 h-5 text-orange-600" />
            <span>{mode === 'add' ? 'Create New Activity' : 'Edit Activity'}</span>
            {mode === 'edit' && activity && (
              <Badge variant="outline">#{activity.id}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type and Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Activity Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Activity Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">📞 Call</SelectItem>
                    <SelectItem value="Email">📧 Email</SelectItem>
                    <SelectItem value="Meeting">🤝 Meeting</SelectItem>
                    <SelectItem value="Task">✅ Task</SelectItem>
                    <SelectItem value="Note">📝 Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the activity"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the activity"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Scheduling</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate" className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled Date *</span>
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  className={errors.scheduledDate ? 'border-red-500' : ''}
                />
                {errors.scheduledDate && <p className="text-sm text-red-600 mt-1">{errors.scheduledDate}</p>}
              </div>

              <div>
                <Label htmlFor="scheduledTime" className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Scheduled Time *</span>
                </Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  className={errors.scheduledTime ? 'border-red-500' : ''}
                />
                {errors.scheduledTime && <p className="text-sm text-red-600 mt-1">{errors.scheduledTime}</p>}
              </div>

              <div>
                <Label htmlFor="assignedTo" className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Assigned To *</span>
                </Label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger className={errors.assignedTo ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedTo && <p className="text-sm text-red-600 mt-1">{errors.assignedTo}</p>}
              </div>

              {mode === 'edit' && (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Related Entity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Related To</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="relatedToType">Entity Type</Label>
                <Select value={formData.relatedToType} onValueChange={(value: any) => handleInputChange('relatedToType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Contact">Contact</SelectItem>
                    <SelectItem value="Opportunity">Opportunity</SelectItem>
                    <SelectItem value="Account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="relatedToName">Related Entity</Label>
                <Select value={formData.relatedToName} onValueChange={(value) => {
                  const entity = relatedEntities[formData.relatedToType].find(e => e.name === value);
                  handleInputChange('relatedToName', value);
                  if (entity) {
                    handleInputChange('relatedToId', entity.id);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {relatedEntities[formData.relatedToType].map((entity) => (
                      <SelectItem key={entity.id} value={entity.name}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Reminder Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reminder">Enable Reminder</Label>
                  <p className="text-sm text-gray-600">Get notified before the activity starts</p>
                </div>
                <Switch
                  id="reminder"
                  checked={formData.reminder}
                  onCheckedChange={(checked) => handleInputChange('reminder', checked)}
                />
              </div>

              {formData.reminder && (
                <div>
                  <Label htmlFor="reminderTime">Remind me</Label>
                  <Select value={formData.reminderTime} onValueChange={(value) => handleInputChange('reminderTime', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                      <SelectItem value="1440">1 day before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              {mode === 'add' ? 'Create Activity' : 'Update Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}