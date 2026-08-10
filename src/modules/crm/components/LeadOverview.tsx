// src/components/crm/LeadOverview.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useCrmData } from '@/modules/crm/hooks/useCrmData';

export default function LeadOverview() {
  const { stats, leads, loading } = useCrmData();

  if (loading) {
    return (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
    );
  }

  const recentLeads = leads?.slice(0, 5) || [];

  return (
      <Card className="border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b border-orange-100 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lead Overview
            </CardTitle>
            <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300">
              {stats?.totalLeads || 0} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">New</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{stats?.newLeads || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300">Qualified</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">{stats?.qualifiedLeads || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800">
              <p className="text-xs text-purple-700 dark:text-purple-300">Converted</p>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{stats?.convertedLeads || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-300">Lost</p>
              <p className="text-xl font-bold text-red-900 dark:text-red-100">{stats?.lostLeads || 0}</p>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Conversion Rate</span>
            </div>
            <span className="text-lg font-bold text-orange-900 dark:text-orange-100">
                        {stats?.conversionRate?.toFixed(1) || 0}%
                    </span>
          </div>

          {/* Recent Leads */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Leads</p>
            {recentLeads.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent leads</p>
            ) : (
                recentLeads.map((lead: any, index: number) => (
                    <motion.div
                        key={lead.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold">
                          {lead.fullName?.charAt(0) || lead.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {lead.fullName || lead.firstName || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lead.companyName || 'No company'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lead.status || 'New'}
                      </Badge>
                    </motion.div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
  );
}