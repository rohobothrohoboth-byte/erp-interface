import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, Mail, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { Activity } from '@/modules/crm/types/crm';

const typeIcons = {
  'Call': Phone,
  'Email': Mail,
  'Meeting': MessageSquare,
  'Task': CheckCircle,
  'Note': FileText
};

interface ActivityCalendarViewProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
}

export default function ActivityCalendarView({ activities, onEdit }: ActivityCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      date: prevMonth.getDate() - i,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i)
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({
      date: day,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      fullDate: date
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: day,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(currentYear, currentMonth + 1, day)
    });
  }

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.scheduledDate);
      return activityDate.toDateString() === date.toDateString();
    });
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getActivityColor = (activity: Activity) => {
    const now = new Date();
    const scheduledDate = new Date(activity.scheduledDate);
    const isOverdue = scheduledDate < now && activity.status !== 'Completed';
    
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200';
    
    switch (activity.status) {
      case 'Completed': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayActivities = getActivitiesForDate(day.fullDate);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border rounded-lg ${
                      day.isCurrentMonth 
                        ? 'bg-white border-gray-200' 
                        : 'bg-gray-50 border-gray-100'
                    } ${
                      day.isToday 
                        ? 'ring-2 ring-orange-500 ring-opacity-50' 
                        : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      day.isCurrentMonth 
                        ? day.isToday 
                          ? 'text-orange-600' 
                          : 'text-gray-900'
                        : 'text-gray-400'
                    }`}>
                      {day.date}
                    </div>
                    
                    <div className="space-y-1">
                      {dayActivities.slice(0, 3).map((activity) => {
                        const ActivityIcon = typeIcons[activity.type];
                        const time = new Date(activity.scheduledDate).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                        
                        return (
                          <div
                            key={activity.id}
                            className={`p-1 rounded text-xs border cursor-pointer hover:shadow-sm transition-shadow ${getActivityColor(activity)}`}
                            onClick={() => onEdit(activity)}
                          >
                            <div className="flex items-center space-x-1">
                              <ActivityIcon className="w-3 h-3" />
                              <span className="font-medium">{time}</span>
                            </div>
                            <div className="truncate font-medium">{activity.title}</div>
                          </div>
                        );
                      })}
                      
                      {dayActivities.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{dayActivities.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span>Today's Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const todayActivities = getActivitiesForDate(today);
            
            if (todayActivities.length === 0) {
              return (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No activities scheduled for today</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {todayActivities
                  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .map((activity) => {
                    const ActivityIcon = typeIcons[activity.type];
                    const time = new Date(activity.scheduledDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => onEdit(activity)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.status === 'Completed' ? 'bg-orange-100' :
                            activity.status === 'In Progress' ? 'bg-orange-100' :
                            activity.status === 'Cancelled' ? 'bg-gray-100' :
                            'bg-orange-100'
                          }`}>
                            <ActivityIcon className={`w-5 h-5 ${
                              activity.status === 'Completed' ? 'text-orange-600' :
                              activity.status === 'In Progress' ? 'text-orange-600' :
                              activity.status === 'Cancelled' ? 'text-gray-600' :
                              'text-orange-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{activity.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{activity.assignedTo}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </motion.div>
  );
}
