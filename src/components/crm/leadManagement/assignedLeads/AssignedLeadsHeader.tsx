// src/components/crm/leadManagement/assignedLeads/AssignedLeadsHeader.tsx
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';
import { Badge } from '../../../ui/badge';

interface AssignedLeadsHeaderProps {
  totalCount?: number;
  qualifiedCount?: number;
  convertedCount?: number;
}

export default function AssignedLeadsHeader({
                                              totalCount = 0,
                                              qualifiedCount = 0,
                                              convertedCount = 0
                                            }: AssignedLeadsHeaderProps) {
  return (
      <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <h1 className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent text-2xl font-bold">
            Assigned Leads
          </h1>
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            {totalCount} Total
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalCount} Active</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-green-500" />
            <span>{qualifiedCount} Qualified</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span>{convertedCount} Converted</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>
  );
}