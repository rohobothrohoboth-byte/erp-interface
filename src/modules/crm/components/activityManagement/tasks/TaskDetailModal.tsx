import { motion } from 'framer-motion';
import { User, Calendar, Clock, Tag, Phone, Mail, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
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

interface TaskDetailModalProps {
  task: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  if (!task) return null;

  const IconComponent = typeIcons[task.type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={statusColors[task.status]}>{task.status}</Badge>
                  <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  <Badge variant="outline">{task.type}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>

            {/* Task Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Assigned To</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{task.assignedTo}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Due Date</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{new Date(task.scheduledDate).toLocaleString()}</span>
                  </div>
                </div>

                {task.completedDate && (
                  <div>
                    <Label className="text-xs text-gray-500">Completed</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">{new Date(task.completedDate).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Created</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{new Date(task.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Last Updated</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{new Date(task.updatedAt).toLocaleString()}</span>
                  </div>
                </div>

                {task.reminder && task.reminderTime && (
                  <div>
                    <Label className="text-xs text-gray-500">Reminder</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">{new Date(task.reminderTime).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related To */}
            {task.relatedTo && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Related To</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{task.relatedTo.type}</Badge>
                    <span className="text-sm font-medium text-gray-900">{task.relatedTo.name}</span>
                  </div>
                  {task.relatedTo.id && (
                    <div className="text-xs text-gray-500 mt-1">ID: {task.relatedTo.id}</div>
                  )}
                </div>
              </div>
            )}

            {/* Overdue Warning */}
            {(() => {
              const now = new Date();
              const dueDate = new Date(task.scheduledDate);
              const isOverdue = dueDate < now && task.status !== 'Completed';
              
              if (isOverdue) {
                return (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">This task is overdue</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
