// src/components/crm/AnalyticsOverview.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useCrmData } from '../../hooks/useCrmData';

export default function AnalyticsOverview() {
  const { stats, dashboardData, loading } = useCrmData();

  if (loading) {
    return (
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="grid grid-cols-4 gap-4">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
    );
  }

  const totalLeads = stats?.totalLeads || 0;
  const convertedLeads = stats?.convertedLeads || 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  const metrics = [
    {
      label: 'Lead Conversion',
      value: stats?.conversionRate?.toFixed(1) || conversionRate.toFixed(1) || 0,
      suffix: '%',
      change: 2.5,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Active Opportunities',
      value: dashboardData?.activeOpportunities || 0,
      suffix: '',
      change: dashboardData?.activeOpportunities > 10 ? 5.3 : -1.2,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Total Revenue',
      value: dashboardData?.totalRevenue ? (dashboardData.totalRevenue / 1000).toFixed(1) : 0,
      suffix: 'K',
      change: dashboardData?.revenueGrowth || 0,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      label: 'Win Rate',
      value: dashboardData?.winRate?.toFixed(1) || 0,
      suffix: '%',
      change: dashboardData?.winRate > 30 ? 8.7 : -2.1,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
      <Card className="border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Overview
            </CardTitle>
            <Badge className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
              Real-time
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {metrics.map((metric, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-xl font-bold ${metric.color}`}>
                      {metric.value}{metric.suffix}
                    </p>
                    {metric.change !== undefined && metric.change !== 0 && (
                        <span className={`text-xs ${metric.change > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                                        {metric.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(metric.change)}%
                                    </span>
                    )}
                  </div>
                </motion.div>
            ))}
          </div>

          {/* Source Breakdown */}
          {stats?.leadsBySource && Object.keys(stats.leadsBySource).length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lead Sources</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(stats.leadsBySource).slice(0, 4).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-xs text-gray-600 dark:text-gray-400">{source || 'Unknown'}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count as number}</span>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Priority Distribution */}
          {stats?.leadsByPriority && Object.keys(stats.leadsByPriority).length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority Distribution</p>
                <div className="space-y-2">
                  {Object.entries(stats.leadsByPriority).map(([priority, count]) => {
                    const total = Object.values(stats.leadsByPriority).reduce((a, b) => (a as number) + (b as number), 0) as number;
                    const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                    const color = priority === 'Urgent' ? 'bg-red-500' :
                        priority === 'High' ? 'bg-orange-500' :
                            priority === 'Medium' ? 'bg-yellow-500' :
                                'bg-blue-500';
                    return (
                        <div key={priority} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{priority || 'Unknown'}</span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">{count as number}</span>
                          </div>
                          <Progress value={percentage} className={`h-1.5 ${color}`} />
                        </div>
                    );
                  })}
                </div>
              </div>
          )}
        </CardContent>
      </Card>
  );
}