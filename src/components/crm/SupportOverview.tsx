// src/components/crm/SupportOverview.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Headphones,
  Ticket,
  CheckCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useCrmData } from '../../hooks/useCrmData';

export default function SupportOverview() {
  const { tasks, loading } = useCrmData();

  if (loading) {
    return (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
    );
  }

  const openTasks = tasks?.filter(t => t.status === 'Pending' || t.status === 'InProgress').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'Completed').length || 0;
  const highPriorityTasks = tasks?.filter(t => t.priority === 'High' || t.priority === 'Urgent').length || 0;

  return (
      <Card className="border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b border-red-100 dark:border-red-800 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-900 dark:text-red-100 flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Support Overview
            </CardTitle>
            <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
              {tasks?.length || 0} Tasks
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-800 text-center">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Open</p>
              <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{openTasks}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800 text-center">
              <p className="text-xs text-green-700 dark:text-green-300">Completed</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">{completedTasks}</p>
            </div>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800 text-center">
              <p className="text-xs text-red-700 dark:text-red-300">High Priority</p>
              <p className="text-lg font-bold text-red-900 dark:text-red-100">{highPriorityTasks}</p>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Tasks</p>
            {tasks?.slice(0, 3).map((task, index) => (
                <motion.div
                    key={task.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {task.status === 'Completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : task.status === 'Overdue' ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {task.title || 'Unnamed Task'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {task.assignedToUserName || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <Badge
                      variant="outline"
                      className={`text-xs ${
                          task.priority === 'Urgent' ? 'border-red-500 text-red-600' :
                              task.priority === 'High' ? 'border-orange-500 text-orange-600' :
                                  'border-blue-500 text-blue-600'
                      }`}
                  >
                    {task.priority || 'Medium'}
                  </Badge>
                </motion.div>
            ))}
            {(!tasks || tasks.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet</p>
            )}
          </div>
        </CardContent>
      </Card>
  );
}