// src/components/finance/payroll/PayrollStats.tsx
import React from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Shield,
  Calculator,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart
} from 'lucide-react';

interface AttendanceStats {
  attendanceRate: number;
  averageOvertime: number;
  totalLateDays: number;
  totalAbsentDays: number;
  totalPresentDays: number;
}

interface PayrollStatsProps {
  attendanceStats?: AttendanceStats;
  totalEmployees?: number;
  monthlyPayroll?: number;
  nextPayDate?: string;
  averageSalary?: number;
  benefitsCost?: number;
  taxLiability?: number;
}

export const PayrollStats: React.FC<PayrollStatsProps> = ({
                                                            attendanceStats,
                                                            totalEmployees = 156,
                                                            monthlyPayroll = 385000,
                                                            nextPayDate = 'Feb 15',
                                                            averageSalary = 65000,
                                                            benefitsCost = 42000,
                                                            taxLiability = 78000
                                                          }) => {
  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      change: '+8%',
      trend: 'up',
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      color: 'bg-gradient-to-br from-indigo-50 to-white',
      border: 'border border-indigo-200'
    },
    {
      title: 'Monthly Payroll',
      value: `$${(monthlyPayroll / 1000).toFixed(0)}K`,
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      color: 'bg-gradient-to-br from-emerald-50 to-white',
      border: 'border border-emerald-200'
    },
    {
      title: 'Next Pay Date',
      value: nextPayDate,
      change: 'On Schedule',
      trend: 'stable',
      icon: <Calendar className="w-5 h-5 text-cyan-600" />,
      color: 'bg-gradient-to-br from-cyan-50 to-white',
      border: 'border border-cyan-200'
    },
    {
      title: 'Attendance Rate',
      value: attendanceStats ? `${attendanceStats.attendanceRate}%` : '92%',
      change: '+5.2%',
      trend: 'up',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      color: 'bg-gradient-to-br from-emerald-50 to-white',
      border: 'border border-emerald-200'
    },
    {
      title: 'Avg. Overtime',
      value: attendanceStats ? `${attendanceStats.averageOvertime}h` : '4.5h',
      change: '+3.8%',
      trend: 'up',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      color: 'bg-gradient-to-br from-amber-50 to-white',
      border: 'border border-amber-200'
    },
    {
      title: 'Today\'s Status',
      value: attendanceStats ?
          `${attendanceStats.totalPresentDays} Present / ${attendanceStats.totalAbsentDays} Absent` :
          'Active',
      change: attendanceStats ? `${attendanceStats.totalLateDays} Late` : 'All Good',
      trend: 'stable',
      icon: <BarChart className="w-5 h-5 text-indigo-600" />,
      color: 'bg-gradient-to-br from-indigo-50 to-white',
      border: 'border border-indigo-200'
    }
  ];

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
            <div
                key={index}
                className={`${stat.color} p-4 rounded-xl ${stat.border} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">{stat.title}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <div className={`text-xs ${stat.trend === 'up' ? 'text-emerald-600' : stat.trend === 'down' ? 'text-rose-600' : 'text-gray-600'}`}>
                      {stat.change}
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {stat.icon}
                </div>
              </div>
            </div>
        ))}
      </div>
  );
};