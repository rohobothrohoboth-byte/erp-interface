import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, Mail, Calendar, MessageSquare, FileText, User } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Label } from '../../../ui/label';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description: string;
  date: string;
  user: string;
  status?: 'completed' | 'pending' | 'cancelled';
}

interface LeadActivitiesProps {
  leadId: string;
}

export default function LeadActivities({ leadId }: LeadActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'call',
      title: 'Initial Contact Call',
      description: 'Discussed project requirements and timeline. Lead is interested in our solution.',
      date: '2024-01-15T10:30:00Z',
      user: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: '2',
      type: 'email',
      title: 'Follow-up Email Sent',
      description: 'Sent product brochure and pricing information as requested.',
      date: '2024-01-16T14:15:00Z',
      user: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Product Demo Scheduled',
      description: 'Scheduled product demonstration for next week.',
      date: '2024-01-22T15:00:00Z',
      user: 'Sarah Johnson',
      status: 'pending'
    }
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'note' as Activity['type'],
    title: '',
    description: ''
  });

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      call: <Phone className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      meeting: <Calendar className="w-4 h-4" />,
      note: <MessageSquare className="w-4 h-4" />,
      task: <FileText className="w-4 h-4" />
    };
    return icons[type];
  };

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      call: 'bg-green-100 text-green-800',
      email: 'bg-blue-100 text-blue-800',
      meeting: 'bg-purple-100 text-purple-800',
      note: 'bg-yellow-100 text-yellow-800',
      task: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getStatusColor = (status?: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return status ? colors[status as keyof typeof colors] : '';
  };

  const handleAddActivity = () => {
    if (newActivity.title && newActivity.description) {
      const activity: Activity = {
        id: Date.now().toString(),
        ...newActivity,
        date: new Date().toISOString(),
        user: 'Current User',
        status: newActivity.type === 'note' ? 'completed' : 'pending'
      };
      setActivities([activity, ...activities]);
      setNewActivity({ type: 'note', title: '', description: '' });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activities</h3>
        <Button onClick={() => setIsAddOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardContent>
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{activity.title}</h4>
                    <div className="flex items-center space-x-2">
                      {activity.status && (
                        <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{activity.user}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Activity Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
              <Plus className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-semibold">Add Activity</h2>
            </div>

            <div className="px-6">
              <div className="py-4 space-y-3">
                <div>
                  <Label htmlFor="activityType" className="pb-1">Activity Type</Label>
                  <Select
                    value={newActivity.type}
                    onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value as Activity['type'] }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activityTitle" className="pb-1">Title</Label>
                  <input
                    id="activityTitle"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Activity title"
                  />
                </div>
                <div>
                  <Label htmlFor="activityDescription" className="pb-1">Description</Label>
                  <Textarea
                    id="activityDescription"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Activity description"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-2">
              <div className="flex justify-center items-center gap-1.5">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddActivity} className="bg-orange-600 hover:bg-orange-700">
                  Add Activity
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
