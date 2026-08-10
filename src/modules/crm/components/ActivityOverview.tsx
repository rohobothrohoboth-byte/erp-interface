// src/components/crm/ActivityOverview.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Clock,
  CheckCircle,
  MessageSquare,
  Phone,
  Mail,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useCrmData } from '@/modules/crm/hooks/useCrmData';

export default function ActivityOverview() {
  const { activities, loading } = useCrmData();

  if (loading) {
    return (
        <Card className="border-cyan-200 dark:border-cyan-800">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'call': return <Phone className="h-4 w-4 text-blue-500" />;
      case 'email': return <Mail className="h-4 w-4 text-purple-500" />;
      case 'meeting': return <Users className="h-4 w-4 text-green-500" />;
      case 'note': return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300';
      case 'inprogress':
      case 'in-progress': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const recentActivities = activities?.slice(0, 5) || [];

  return (
      <Card className="border-cyan-200 dark:border-cyan-800 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b border-cyan-100 dark:border-cyan-800 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Badge className="bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300">
              {activities?.length || 0} Activities
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activities</p>
            ) : (
                recentActivities.map((activity: any, index: number) => (
                    <motion.div
                        key={activity.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-gray-100 dark:border-gray-800"
                    >
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {activity.title || activity.subject || 'Untitled Activity'}
                          </p>
                          <Badge className={`text-xs ${getActivityColor(activity.status)}`}>
                            {activity.status || 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {activity.assignedToUserName || activity.assignedTo || 'Unassigned'} •
                          {activity.scheduledDate || activity.createdAt ? new Date(activity.scheduledDate || activity.createdAt).toLocaleDateString() : 'No date'}
                        </p>
                        {activity.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                              {activity.description}
                            </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>
                                        {activity.scheduledDate || activity.createdAt ? new Date(activity.scheduledDate || activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                    </span>
                      </div>
                    </motion.div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
  );
}