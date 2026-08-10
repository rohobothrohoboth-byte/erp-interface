import { motion } from 'framer-motion';
import { Ticket, Clock, CheckCircle, AlertTriangle, Users, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { SupportTicket } from '@/modules/crm/types/crm';

interface TicketStatsProps {
  tickets: SupportTicket[];
}

export default function TicketStats({ tickets }: TicketStatsProps) {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => ['Open', 'In Progress', 'Pending'].includes(t.status)).length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const closedTickets = tickets.filter(t => t.status === 'Closed').length;
  
  // SLA Metrics
  const now = new Date();
  const overdueTickets = tickets.filter(t => {
    const deadline = new Date(t.slaDeadline);
    return deadline < now && !['Resolved', 'Closed'].includes(t.status);
  }).length;
  
  const atRiskTickets = tickets.filter(t => {
    const deadline = new Date(t.slaDeadline);
    const timeLeft = deadline.getTime() - now.getTime();
    const twoHours = 2 * 60 * 60 * 1000;
    return timeLeft < twoHours && timeLeft > 0 && !['Resolved', 'Closed'].includes(t.status);
  }).length;

  // Response and Resolution Times
  const resolvedWithTimes = tickets.filter(t => t.resolutionTime && t.responseTime);
  const avgResponseTime = resolvedWithTimes.length > 0 
    ? resolvedWithTimes.reduce((sum, t) => sum + (t.responseTime || 0), 0) / resolvedWithTimes.length
    : 0;
  const avgResolutionTime = resolvedWithTimes.length > 0 
    ? resolvedWithTimes.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / resolvedWithTimes.length
    : 0;

  // Customer Satisfaction
  const ticketsWithCSAT = tickets.filter(t => t.customerSatisfaction);
  const avgCSAT = ticketsWithCSAT.length > 0 
    ? ticketsWithCSAT.reduce((sum, t) => sum + (t.customerSatisfaction || 0), 0) / ticketsWithCSAT.length
    : 0;

  const stats = [
    {
      title: 'Total Tickets',
      value: totalTickets,
      change: '+15%',
      trend: 'up',
      icon: Ticket,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Open Tickets',
      value: openTickets,
      change: '-8%',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Resolved Today',
      value: resolvedTickets,
      change: '+22%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Overdue',
      value: overdueTickets,
      change: '-12%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const performanceStats = [
    {
      title: 'Avg Response Time',
      value: `${Math.round(avgResponseTime / 60)}h ${Math.round(avgResponseTime % 60)}m`,
      subtitle: 'First response',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Resolution Time',
      value: `${Math.round(avgResolutionTime / 60)}h ${Math.round(avgResolutionTime % 60)}m`,
      subtitle: 'Time to resolve',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Customer Satisfaction',
      value: `${avgCSAT.toFixed(1)}/5.0`,
      subtitle: `${ticketsWithCSAT.length} responses`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'SLA Compliance',
      value: `${totalTickets > 0 ? (((totalTickets - overdueTickets) / totalTickets) * 100).toFixed(1) : 0}%`,
      subtitle: 'On-time resolution',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingUp;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <div className="flex items-center mt-1">
                        <TrendIcon className={`w-4 h-4 mr-1 ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last week</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-red-600" />
              <span>Service Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceStats.map((stat, index) => (
                <div key={stat.title} className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">{stat.title}</div>
                    <div className="text-xs text-gray-600">{stat.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Priority Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Ticket Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { priority: 'Critical', count: tickets.filter(t => t.priority === 'Critical').length, color: 'bg-red-500' },
                { priority: 'High', count: tickets.filter(t => t.priority === 'High').length, color: 'bg-orange-500' },
                { priority: 'Medium', count: tickets.filter(t => t.priority === 'Medium').length, color: 'bg-yellow-500' },
                { priority: 'Low', count: tickets.filter(t => t.priority === 'Low').length, color: 'bg-green-500' }
              ].map((priority, index) => {
                const percentage = totalTickets > 0 ? (priority.count / totalTickets) * 100 : 0;
                
                return (
                  <div key={priority.priority} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 w-24">
                      <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
                      <span className="font-medium text-gray-900">{priority.priority}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{priority.count} tickets</span>
                        <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${priority.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}