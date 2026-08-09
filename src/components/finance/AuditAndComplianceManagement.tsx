// components/finance/AuditAndComplianceManagement.tsx - FULLY FIXED

import React, { useMemo } from 'react';
import { formatDate } from '../../utils/finance/helpers';

interface AuditAndComplianceManagementProps {
  auditLogs?: any[];
  filters?: {
    period?: string;
    periodType?: string;
    fiscalYear?: string;
  };
  periodRange?: {
    periodStart?: string;
    periodEnd?: string;
  };
  isLoading?: boolean;
}

function AuditAndComplianceManagement({
                                        auditLogs = [],
                                        filters = {},
                                        periodRange = {},
                                        isLoading = false
                                      }: AuditAndComplianceManagementProps) {

  const data = useMemo(() => {
    // ✅ Filter by period
    const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
    const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

    // ✅ Safely get logs
    const logs = Array.isArray(auditLogs) ? auditLogs : [];

    // ✅ Filter logs by date
    const filteredLogs = logs.filter((log: any) => {
      const logDate = new Date(log.actionDate || log.ActionDate || log.dateAdd || log.DateAdd || log.createdAt || log.CreatedAt || '2000-01-01');
      return logDate >= startDate && logDate <= endDate;
    });

    // ✅ Group by action
    const byAction = filteredLogs.reduce((acc: any, log: any) => {
      const action = log.action || log.Action || log.eventType || log.EventType || 'Unknown';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {});

    // ✅ Group by user
    const byUser = filteredLogs.reduce((acc: any, log: any) => {
      const user = log.userName || log.UserName || log.user || log.User || log.createdBy || log.CreatedBy || 'Unknown';
      acc[user] = (acc[user] || 0) + 1;
      return acc;
    }, {});

    // ✅ Last 24h
    const now = new Date();
    const last24h = filteredLogs.filter((log: any) => {
      const logDate = new Date(log.actionDate || log.ActionDate || log.dateAdd || log.DateAdd || log.createdAt || log.CreatedAt || 0);
      return (now.getTime() - logDate.getTime()) < 24 * 60 * 60 * 1000;
    });

    // ✅ Top users
    const topUsers = Object.entries(byUser)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5);

    // ✅ Recent logs (most recent first)
    const recentLogs = [...filteredLogs]
        .sort((a, b) => {
          const dateA = new Date(a.actionDate || a.ActionDate || a.dateAdd || a.DateAdd || a.createdAt || a.CreatedAt || 0);
          const dateB = new Date(b.actionDate || b.ActionDate || b.dateAdd || b.DateAdd || b.createdAt || b.CreatedAt || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

    // ✅ Debug logging
    console.log('📊 AuditAndComplianceManagement - Filtered Data:', {
      period: filters?.period,
      totalLogs: logs.length,
      filteredLogs: filteredLogs.length,
      last24h: last24h.length,
      actionTypes: Object.keys(byAction).length,
    });

    return {
      total: filteredLogs.length,
      byAction,
      byUser,
      topUsers,
      last24hCount: last24h.length,
      recentLogs,
      actionTypesCount: Object.keys(byAction).length,
    };
  }, [auditLogs, periodRange, filters]);

  if (isLoading) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 hover:border-indigo-500 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Audit & Compliance</h3>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {data.last24hCount} new (24h)
        </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Events</span>
            <span className="text-xl font-bold text-indigo-600">{data.total}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Last 24h</p>
              <p className="text-sm font-bold text-blue-600">{data.last24hCount}</p>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Action Types</p>
              <p className="text-sm font-bold text-purple-600">{data.actionTypesCount}</p>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Top Actions</p>
            <div className="space-y-1">
              {Object.entries(data.byAction)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 3)
                  .map(([action, count]) => (
                      <div key={action} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize truncate max-w-[60%]">
                    {action.replace(/_/g, ' ')}
                  </span>
                        <span className="font-medium text-gray-800">{count as number}</span>
                      </div>
                  ))}
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Recent Activity</p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {data.recentLogs.map((log: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs border-b border-gray-50 py-1 last:border-0">
                <span className="text-gray-600 capitalize truncate max-w-[55%]">
                  {log.action || log.Action || log.eventType || log.EventType || 'Unknown'}
                </span>
                    <span className="text-gray-400 text-[10px]">
                  {formatDate(log.actionDate || log.ActionDate || log.dateAdd || log.DateAdd)}
                </span>
                  </div>
              ))}
            </div>
            {data.recentLogs.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No recent activity</p>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Compliance Status</span>
              <span className="text-green-600 font-medium">✅ All Critical</span>
            </div>
          </div>
        </div>
      </div>
  );
}

export default React.memo(AuditAndComplianceManagement);