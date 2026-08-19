import { motion } from 'framer-motion';
import { X, User, Calendar, Clock, Tag, Phone, Mail, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import type { Activity } from '@/modules/crm/types/crm';

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Completed': 'bg-orange-100 text-orange-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800'
};

const typeIcons = {
  'Call': Phone,
  'Email': Mail,
  'Meeting': MessageSquare,
  'Task': CheckCircle,
  'Note': FileText
};

interface ActivityDetailModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
  if (!activity) return null;

  const IconComponent = typeIcons[activity.type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{activity.title}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={statusColors[activity.status]}>{activity.status}</Badge>
                  <Badge className={priorityColors[activity.priority]}>{activity.priority}</Badge>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Content - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Column 1: Activity Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Activity Information</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Type</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <IconComponent className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">{activity.type}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Assigned To</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{activity.assignedTo}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Scheduled Date & Time</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{new Date(activity.scheduledDate).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Created</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Last Updated</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{new Date(activity.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {activity.completedDate && (
                    <div>
                      <Label className="text-xs text-gray-500">Completed</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">{new Date(activity.completedDate).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reminder */}
              {activity.reminder && (
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Reminder</Label>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-900">
                        {activity.reminderTime 
                          ? new Date(activity.reminderTime).toLocaleString()
                          : 'Reminder set'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Description & Related Info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.description}</p>
                </div>
              </div>

              {/* Related To */}
              {activity.relatedTo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Related To</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{activity.relatedTo.type}</Badge>
                      <span className="text-sm font-medium text-gray-900">{activity.relatedTo.name}</span>
                    </div>
                    {activity.relatedTo.id && (
                      <div className="text-xs text-gray-500 mt-1">ID: {activity.relatedTo.id}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Status Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{new Date(activity.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="text-gray-900">{new Date(activity.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  {activity.completedDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600">Completed:</span>
                      <span className="text-gray-900">{new Date(activity.completedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
