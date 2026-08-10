import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Clock, Calendar, BarChart3, User, Timer } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Progress } from '@/shared/components/ui/progress';
import type { Activity } from '@/modules/crm/types/crm';

interface TimeEntry {
  id: string;
  activityId: string;
  activityTitle: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description: string;
  user: string;
  date: string;
  isRunning: boolean;
}

interface TimeTrackingProps {
  activities: Activity[];
}

// Mock time entries
const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    activityId: '1',
    activityTitle: 'Follow-up call with TechCorp',
    startTime: '2024-01-18T14:00:00Z',
    endTime: '2024-01-18T14:30:00Z',
    duration: 30,
    description: 'Discussed proposal details and answered technical questions',
    user: 'Sarah Johnson',
    date: '2024-01-18',
    isRunning: false
  },
  {
    id: '2',
    activityId: '2',
    activityTitle: 'Product Demo for RetailPlus',
    startTime: '2024-01-19T10:00:00Z',
    endTime: '2024-01-19T11:15:00Z',
    duration: 75,
    description: 'Demonstrated inventory management features',
    user: 'Mike Wilson',
    date: '2024-01-19',
    isRunning: false
  },
  {
    id: '3',
    activityId: '3',
    activityTitle: 'Email campaign setup',
    startTime: '2024-01-19T09:00:00Z',
    duration: 45,
    description: 'Setting up Q1 product launch email campaign',
    user: 'Emily Davis',
    date: '2024-01-19',
    isRunning: true
  }
];

export default function TimeTracking({ activities }: TimeTrackingProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [activeTimer, setActiveTimer] = useState<string | null>('3');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedUser, setSelectedUser] = useState('all');

  // Start timer for an activity
  const startTimer = (activityId: string, activityTitle: string) => {
    // Stop any running timer first
    if (activeTimer) {
      stopTimer(activeTimer);
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      activityId,
      activityTitle,
      startTime: new Date().toISOString(),
      duration: 0,
      description: '',
      user: 'Current User',
      date: new Date().toISOString().split('T')[0],
      isRunning: true
    };

    setTimeEntries(prev => [...prev, newEntry]);
    setActiveTimer(newEntry.id);
  };

  // Stop timer
  const stopTimer = (entryId: string) => {
    setTimeEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.isRunning) {
        const endTime = new Date().toISOString();
        const duration = Math.floor((new Date(endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60));
        
        return {
          ...entry,
          endTime,
          duration,
          isRunning: false
        };
      }
      return entry;
    }));
    
    if (activeTimer === entryId) {
      setActiveTimer(null);
    }
  };

  // Get current timer duration
  const getCurrentDuration = (entry: TimeEntry) => {
    if (!entry.isRunning) return entry.duration;
    
    const now = new Date().getTime();
    const start = new Date(entry.startTime).getTime();
    return Math.floor((now - start) / (1000 * 60));
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate stats
  const totalTimeToday = timeEntries
    .filter(entry => entry.date === new Date().toISOString().split('T')[0])
    .reduce((sum, entry) => sum + getCurrentDuration(entry), 0);

  const totalTimeWeek = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    })
    .reduce((sum, entry) => sum + getCurrentDuration(entry), 0);

  const averageTimePerActivity = timeEntries.length > 0 
    ? timeEntries.reduce((sum, entry) => sum + getCurrentDuration(entry), 0) / timeEntries.length
    : 0;

  // Get unique users
  const uniqueUsers = Array.from(new Set(timeEntries.map(entry => entry.user)));

  // Filter entries
  const filteredEntries = timeEntries.filter(entry => {
    const matchesUser = selectedUser === 'all' || entry.user === selectedUser;
    
    const matchesPeriod = (() => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          return entryDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return entryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return entryDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesUser && matchesPeriod;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Active Timer */}
      {activeTimer && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-900">
              <Timer className="w-5 h-5" />
              <span>Active Timer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const activeEntry = timeEntries.find(entry => entry.id === activeTimer);
              if (!activeEntry) return null;

              return (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-orange-900">{activeEntry.activityTitle}</h4>
                    <p className="text-sm text-orange-700">Started at {new Date(activeEntry.startTime).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-900">
                        {formatDuration(getCurrentDuration(activeEntry))}
                      </div>
                      <div className="text-sm text-orange-700">Running</div>
                    </div>
                    <Button
                      onClick={() => stopTimer(activeTimer)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Quick Start Timers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-orange-600" />
            <span>Quick Start Timer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.slice(0, 6).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.type}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => startTimer(activity.id, activity.title)}
                  disabled={!!activeTimer}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span>Time Entries</span>
            </CardTitle>
            <div className="flex space-x-3">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries found</h3>
              <p className="text-gray-500">Start tracking time on your activities to see entries here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                  .map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{entry.activityTitle}</div>
                          {entry.description && (
                            <div className="text-sm text-gray-600 line-clamp-1">{entry.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{entry.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(entry.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {entry.endTime ? (
                            new Date(entry.endTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })
                          ) : (
                            <span className="text-orange-600">Running...</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatDuration(getCurrentDuration(entry))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.isRunning ? (
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-orange-100 text-orange-800">
                              <Timer className="w-3 h-3 mr-1" />
                              Running
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => stopTimer(entry.id)}
                            >
                              <Square className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            Completed
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}