import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar, Target, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { SupportTicket } from '@/modules/crm/types/crm';

interface SLATrackingProps {
  tickets: SupportTicket[];
}

export default function SLATracking({ tickets }: SLATrackingProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const now = new Date();

  // Calculate SLA metrics
  const getSLAMetrics = () => {
    const activeTickets = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status));
    const resolvedTickets = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status));

    const overdue = activeTickets.filter(t => {
      const deadline = new Date(t.slaDeadline);
      return deadline < now;
    });

    const atRisk = activeTickets.filter(t => {
      const deadline = new Date(t.slaDeadline);
      const timeLeft = deadline.getTime() - now.getTime();
      const twoHours = 2 * 60 * 60 * 1000;
      return timeLeft < twoHours && timeLeft > 0;
    });

    const onTrack = activeTickets.filter(t => {
      const deadline = new Date(t.slaDeadline);
      const timeLeft = deadline.getTime() - now.getTime();
      const twoHours = 2 * 60 * 60 * 1000;
      return timeLeft >= twoHours;
    });

    // Calculate compliance rate
    const totalResolved = resolvedTickets.length;
    const resolvedOnTime = resolvedTickets.filter(t => {
      if (!t.resolvedAt) return false;
      const resolvedTime = new Date(t.resolvedAt);
      const deadline = new Date(t.slaDeadline);
      return resolvedTime <= deadline;
    }).length;

    const complianceRate = totalResolved > 0 ? (resolvedOnTime / totalResolved) * 100 : 0;

    // Average response and resolution times
    const ticketsWithTimes = tickets.filter(t => t.responseTime && t.resolutionTime);
    const avgResponseTime = ticketsWithTimes.length > 0 
      ? ticketsWithTimes.reduce((sum, t) => sum + (t.responseTime || 0), 0) / ticketsWithTimes.length
      : 0;
    const avgResolutionTime = ticketsWithTimes.length > 0 
      ? ticketsWithTimes.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / ticketsWithTimes.length
      : 0;

    return {
      overdue: overdue.length,
      atRisk: atRisk.length,
      onTrack: onTrack.length,
      complianceRate,
      avgResponseTime,
      avgResolutionTime,
      totalActive: activeTickets.length,
      totalResolved: totalResolved
    };
  };

  const metrics = getSLAMetrics();

  // Get SLA status for a ticket
  const getSLAStatus = (ticket: SupportTicket) => {
    if (['Resolved', 'Closed'].includes(ticket.status)) {
      if (ticket.resolvedAt) {
        const resolvedTime = new Date(ticket.resolvedAt);
        const deadline = new Date(ticket.slaDeadline);
        return resolvedTime <= deadline ? 'met' : 'breached';
      }
      return 'met';
    }

    const deadline = new Date(ticket.slaDeadline);
    const timeLeft = deadline.getTime() - now.getTime();
    const twoHours = 2 * 60 * 60 * 1000;

    if (timeLeft < 0) return 'overdue';
    if (timeLeft < twoHours) return 'at-risk';
    return 'on-track';
  };

  // Format time remaining
  const formatTimeRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const timeLeft = deadlineDate.getTime() - now.getTime();
    
    if (timeLeft < 0) {
      const overdue = Math.abs(timeLeft);
      const hours = Math.floor(overdue / (1000 * 60 * 60));
      const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m overdue`;
    } else {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m left`;
    }
  };

  // Get progress percentage for SLA
  const getSLAProgress = (ticket: SupportTicket) => {
    const created = new Date(ticket.createdAt);
    const deadline = new Date(ticket.slaDeadline);
    const totalTime = deadline.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    
    if (['Resolved', 'Closed'].includes(ticket.status)) return 100;
    
    const progress = Math.min((elapsed / totalTime) * 100, 100);
    return Math.max(progress, 0);
  };

  const statusColors = {
    'met': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    'breached': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
    'overdue': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
    'at-risk': { bg: 'bg-orange-100', text: 'text-orange-800', icon: Clock },
    'on-track': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
  };

  const teams = ['all', 'Tech Support Team', 'Product Team', 'Customer Success', 'Engineering Team'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">SLA Performance Tracking</h2>
          <p className="text-gray-600">Monitor service level agreement compliance and performance</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team === 'all' ? 'All Teams' : team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SLA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.complianceRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-sm font-medium text-green-600">+2.3%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Tickets</p>
                <p className="text-2xl font-bold text-red-600">{metrics.overdue}</p>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                  <span className="text-sm text-gray-500">Immediate attention needed</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.atRisk}</p>
                <div className="flex items-center mt-1">
                  <Clock className="w-4 h-4 mr-1 text-orange-500" />
                  <span className="text-sm text-gray-500">&lt; 2 hours remaining</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-green-600">{metrics.onTrack}</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-sm text-gray-500">Meeting SLA targets</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <span>Response & Resolution Times</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Response Time</span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.floor(metrics.avgResponseTime / 60)}h {Math.floor(metrics.avgResponseTime % 60)}m
                  </span>
                </div>
                <Progress value={Math.min((metrics.avgResponseTime / 240) * 100, 100)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Target: 4h</span>
                  <span>{metrics.avgResponseTime <= 240 ? 'On Target' : 'Above Target'}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Resolution Time</span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.floor(metrics.avgResolutionTime / 60)}h {Math.floor(metrics.avgResolutionTime % 60)}m
                  </span>
                </div>
                <Progress value={Math.min((metrics.avgResolutionTime / 1440) * 100, 100)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Target: 24h</span>
                  <span>{metrics.avgResolutionTime <= 1440 ? 'On Target' : 'Above Target'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-red-600" />
              <span>Team Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teams.slice(1).map((team) => {
                const teamTickets = tickets.filter(t => t.assignedTo === team);
                const teamResolved = teamTickets.filter(t => ['Resolved', 'Closed'].includes(t.status));
                const teamOnTime = teamResolved.filter(t => {
                  if (!t.resolvedAt) return false;
                  const resolvedTime = new Date(t.resolvedAt);
                  const deadline = new Date(t.slaDeadline);
                  return resolvedTime <= deadline;
                });
                
                const teamCompliance = teamResolved.length > 0 
                  ? (teamOnTime.length / teamResolved.length) * 100 
                  : 0;

                return (
                  <div key={team} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{team}</span>
                        <span className="text-sm font-bold text-gray-900">{teamCompliance.toFixed(1)}%</span>
                      </div>
                      <Progress value={teamCompliance} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Tickets SLA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <span>Active Tickets SLA Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>SLA Status</TableHead>
                <TableHead>Time Remaining</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets
                .filter(t => !['Resolved', 'Closed'].includes(t.status))
                .sort((a, b) => {
                  const aStatus = getSLAStatus(a);
                  const bStatus = getSLAStatus(b);
                  const statusOrder: Record<string, number> = { 
                    'overdue': 0, 
                    'at-risk': 1, 
                    'on-track': 2, 
                    'met': 3, 
                    'breached': 4 
                  };
                  return (statusOrder[aStatus] || 5) - (statusOrder[bStatus] || 5);
                })
                .slice(0, 10)
                .map((ticket) => {
                  const slaStatus = getSLAStatus(ticket);
                  const statusConfig = statusColors[slaStatus];
                  const StatusIcon = statusConfig.icon;
                  const progress = getSLAProgress(ticket);

                  return (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">#{ticket.id}</div>
                          <div className="text-sm text-gray-600 line-clamp-1">{ticket.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{ticket.customerInfo.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{ticket.assignedTo}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {slaStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${
                          slaStatus === 'overdue' ? 'text-red-600 font-medium' :
                          slaStatus === 'at-risk' ? 'text-orange-600 font-medium' :
                          'text-gray-600'
                        }`}>
                          {formatTimeRemaining(ticket.slaDeadline)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20">
                          <Progress 
                            value={progress} 
                            className={`h-2 ${
                              slaStatus === 'overdue' ? '[&>div]:bg-red-500' :
                              slaStatus === 'at-risk' ? '[&>div]:bg-orange-500' :
                              '[&>div]:bg-green-500'
                            }`}
                          />
                          <div className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}%</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}