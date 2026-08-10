import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { Activity } from '@/modules/crm/types/crm';

interface ActivityMetricsProps {
  activities: Activity[];
}

export default function ActivityMetrics({ activities }: ActivityMetricsProps) {
  const totalActivities = activities.length;
  const pendingActivities = activities.filter(a => a.status === 'Pending').length;
  const completedActivities = activities.filter(a => a.status === 'Completed').length;
  const overdueActivities = activities.filter(a => 
    a.status !== 'Completed' && new Date(a.scheduledDate) < new Date()
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingActivities}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-orange-600">{completedActivities}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueActivities}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
