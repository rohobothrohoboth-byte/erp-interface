import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockActivities } from '@/modules/crm/data/crmMockData';
import NotificationCenter from '@/modules/crm/components/activityManagement/notifications/NotificationCenter';
import type { Activity } from '@/modules/crm/types/crm';

export default function NotificationsSection() {
  const [activities] = useState<Activity[]>(mockActivities);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications & Reminders</h1>
        <p className="text-gray-600">Manage activity reminders and notifications</p>
      </div>

      <NotificationCenter activities={activities} />
    </motion.div>
  );
}
