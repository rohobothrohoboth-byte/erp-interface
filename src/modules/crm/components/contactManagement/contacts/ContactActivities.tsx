import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, Mail, Calendar, MessageSquare, FileText, Clock, User, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import ActivityForm from '@/modules/crm/components/contactManagement/contacts/ActivityForm';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  description: string;
  date: string;
  duration?: number;
  outcome?: string;
  createdBy: string;
  status: 'completed' | 'scheduled' | 'cancelled';
}

interface ContactActivitiesProps {
  contactId: string;
}

export default function ContactActivities({ contactId }: ContactActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'call',
      subject: 'Initial Discovery Call',
      description: 'Discussed current challenges and potential solutions. Very interested in our enterprise package.',
      date: '2024-01-18T14:30:00Z',
      duration: 45,
      outcome: 'Positive - Schedule follow-up demo',
      createdBy: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: '2',
      type: 'email',
      subject: 'Follow-up with pricing information',
      description: 'Sent detailed pricing breakdown and case studies as requested during the call.',
      date: '2024-01-19T09:15:00Z',
      createdBy: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: '3',
      type: 'meeting',
      subject: 'Product Demo Session',
      description: 'Scheduled product demonstration for next week.',
      date: '2024-01-25T15:00:00Z',
      duration: 60,
      createdBy: 'Sarah Johnson',
      status: 'scheduled'
    },
    {
      id: '4',
      type: 'task',
      subject: 'Prepare custom proposal',
      description: 'Create tailored proposal based on their specific requirements discussed in the call.',
      date: '2024-01-22T10:00:00Z',
      createdBy: 'Sarah Johnson',
      status: 'scheduled'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'task': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-orange-100 text-orange-800';
      case 'email': return 'bg-orange-100 text-orange-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'note': return 'bg-yellow-100 text-yellow-800';
      case 'task': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-orange-100 text-orange-800';
      case 'scheduled': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddActivity = (activityData: Partial<Activity>) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      createdBy: 'Current User',
      status: activityData.status || 'completed'
    } as Activity;
    
    setActivities([newActivity, ...activities]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
          <p className="text-sm text-gray-600">Track all interactions and communications</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="call">Calls</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activities Timeline */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <Card className="border-orange-200">
            <CardContent className="pt-4">
              <div className="text-center py-6">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start by adding your first activity with this contact.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-orange-200 hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-start space-x-3">
                    {/* Activity Icon */}
                    <div className={`p-1.5 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-medium text-gray-900 truncate">
                          {activity.subject}
                        </h4>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>

                      {activity.outcome && (
                        <div className="mb-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-xs font-medium text-orange-800 mb-1">Outcome:</div>
                          <div className="text-xs text-orange-700">{activity.outcome}</div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{activity.createdBy}</span>
                          </div>
                          {activity.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{activity.duration} min</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(activity.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Activity Form */}
      <ActivityForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddActivity}
        contactId={contactId}
      />
    </div>
  );
}