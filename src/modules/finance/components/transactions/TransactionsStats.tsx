import React from 'react';
import { TrendingUp, TrendingDown, CreditCard, DollarSign, Repeat, Building } from 'lucide-react';

export const TransactionsStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Income',
      value: '$850K',
      change: '+15.2%',
      trend: 'up',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      color: 'bg-gradient-to-br from-emerald-50 to-white',
      border: 'border border-emerald-200'
    },
    {
      title: 'Total Expenses',
      value: '$420K',
      change: '+8.7%',
      trend: 'up',
      icon: <TrendingDown className="w-5 h-5 text-rose-600" />,
      color: 'bg-gradient-to-br from-rose-50 to-white',
      border: 'border border-rose-200'
    },
    {
      title: 'Net Cash Flow',
      value: '$430K',
      change: '+22.5%',
      trend: 'up',
      icon: <DollarSign className="w-5 h-5 text-indigo-600" />,
      color: 'bg-gradient-to-br from-indigo-50 to-white',
      border: 'border border-indigo-200'
    },
    {
      title: 'Transactions Today',
      value: '45',
      change: '+5',
      trend: 'up',
      icon: <CreditCard className="w-5 h-5 text-cyan-600" />,
      color: 'bg-gradient-to-br from-cyan-50 to-white',
      border: 'border border-cyan-200'
    },
    {
      title: 'Pending Reconciling',
      value: '12',
      change: '-3',
      trend: 'down',
      icon: <Repeat className="w-5 h-5 text-amber-600" />,
      color: 'bg-gradient-to-br from-amber-50 to-white',
      border: 'border border-amber-200'
    },
    {
      title: 'Accounts Active',
      value: '8',
      change: '+1',
      trend: 'up',
      icon: <Building className="w-5 h-5 text-purple-600" />,
      color: 'bg-gradient-to-br from-purple-50 to-white',
      border: 'border border-purple-200'
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
                <div className={`text-xs ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
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