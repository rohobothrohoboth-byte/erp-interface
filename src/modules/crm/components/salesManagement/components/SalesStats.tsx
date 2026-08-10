// src/components/crm/salesManagement/components/SalesStats.tsx

import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';

export interface SalesStatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

interface SalesStatsProps {
  stats: SalesStatItem[];
  className?: string;
}

export const SalesStats: React.FC<SalesStatsProps> = ({ stats, className = '' }) => {
  return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {stats.map((stat, index) => (
            <Card
                key={index}
                className={`bg-gradient-to-r ${stat.gradient} border-${stat.color}-200`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm text-${stat.color}-700 font-medium`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold text-${stat.color}-900`}>
                      {stat.value}
                    </p>
                    {stat.change && (
                        <p className={`text-xs ${
                            stat.change.trend === 'up' ? 'text-green-600' :
                                stat.change.trend === 'down' ? 'text-red-600' :
                                    'text-gray-500'
                        }`}>
                          {stat.change.trend === 'up' ? '↑' :
                              stat.change.trend === 'down' ? '↓' : '→'}
                          {stat.change.value}% from last period
                        </p>
                    )}
                  </div>
                  <div className={`p-3 bg-${stat.color}-200 rounded-lg`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>
  );
};