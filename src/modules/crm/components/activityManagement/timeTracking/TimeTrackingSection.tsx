import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockActivities } from '@/modules/crm/data/crmMockData';
import TimeTracking from '@/modules/crm/components/activityManagement/timeTracking/TimeTracking';
import type { Activity } from '@/modules/crm/types/crm';

export default function TimeTrackingSection() {
  const [activities] = useState<Activity[]>(mockActivities);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-600">Track time spent on activities and analyze productivity</p>
      </div>

      <TimeTracking activities={activities} />
    </motion.div>
  );
}
