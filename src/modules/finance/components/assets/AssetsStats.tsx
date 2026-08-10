import React from 'react';
import { Building, TrendingUp, TrendingDown, Wrench, Calculator, DollarSign, AlertCircle, BarChart3 } from 'lucide-react';

export const AssetsStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Assets',
      value: '245',
      change: '+12%',
      trend: 'up',
      icon: <Building className="w-6 h-6 text-indigo-600" />,
      color: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200'
    },
    {
      title: 'Total Value',
      value: '$4.8M',
      change: '+8.5%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      color: 'from-emerald-50 to-emerald-100',
      border: 'border-emerald-200'
    },
    {
      title: 'Under Maintenance',
      value: '18',
      change: '+2',
      trend: 'up',
      icon: <Wrench className="w-6 h-6 text-amber-600" />,
      color: 'from-amber-50 to-amber-100',
      border: 'border-amber-200'
    },
    {
      title: 'Avg. Depreciation',
      value: '24.5%',
      change: '-1.2%',
      trend: 'down',
      icon: <Calculator className="w-6 h-6 text-purple-600" />,
      color: 'from-purple-50 to-purple-100',
      border: 'border-purple-200'
    },
    {
      title: 'Active Assets',
      value: '212',
      change: '+15',
      trend: 'up',
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      color: 'from-green-50 to-green-100',
      border: 'border-green-200'
    },
    {
      title: 'Pending Disposal',
      value: '7',
      change: '+1',
      trend: 'up',
      icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
      color: 'from-rose-50 to-rose-100',
      border: 'border-rose-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl border ${stat.border} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className={`flex items-center text-xs ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};