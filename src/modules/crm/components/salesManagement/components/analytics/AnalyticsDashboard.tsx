import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Target, Users, Calendar, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import type { Opportunity } from '@/modules/crm/types/crm';

interface AnalyticsDashboardProps {
  opportunities: Opportunity[];
}

export default function AnalyticsDashboard({ opportunities }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('3months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Calculate analytics metrics
  const calculateMetrics = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case '1month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setMonth(now.getMonth() - 3);
    }

    const filteredOpportunities = opportunities.filter(opp => 
      new Date(opp.createdAt) >= filterDate
    );

    const totalRevenue = filteredOpportunities
      .filter(opp => opp.stage === 'Closed Won')
      .reduce((sum, opp) => sum + opp.amount, 0);

    const totalPipeline = filteredOpportunities
      .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage))
      .reduce((sum, opp) => sum + opp.amount, 0);

    const weightedPipeline = filteredOpportunities
      .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage))
      .reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);

    const closedOpportunities = filteredOpportunities.filter(opp => 
      ['Closed Won', 'Closed Lost'].includes(opp.stage)
    );

    const winRate = closedOpportunities.length > 0
      ? (filteredOpportunities.filter(opp => opp.stage === 'Closed Won').length / closedOpportunities.length) * 100
      : 0;

    const averageDealSize = filteredOpportunities.length > 0
      ? filteredOpportunities.reduce((sum, opp) => sum + opp.amount, 0) / filteredOpportunities.length
      : 0;

    const averageSalesCycle = calculateAverageSalesCycle(filteredOpportunities);

    // Stage distribution
    const stageDistribution = filteredOpportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Source performance
    const sourcePerformance = filteredOpportunities.reduce((acc, opp) => {
      if (!acc[opp.source]) {
        acc[opp.source] = { count: 0, revenue: 0, winRate: 0 };
      }
      acc[opp.source].count += 1;
      if (opp.stage === 'Closed Won') {
        acc[opp.source].revenue += opp.amount;
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number; winRate: number }>);

    // Calculate win rates for sources
    Object.keys(sourcePerformance).forEach(source => {
      const sourceOpps = filteredOpportunities.filter(opp => opp.source === source);
      const sourceClosedOpps = sourceOpps.filter(opp => ['Closed Won', 'Closed Lost'].includes(opp.stage));
      const sourceWonOpps = sourceOpps.filter(opp => opp.stage === 'Closed Won');
      sourcePerformance[source].winRate = sourceClosedOpps.length > 0 
        ? (sourceWonOpps.length / sourceClosedOpps.length) * 100 
        : 0;
    });

    // Sales rep performance
    const repPerformance = filteredOpportunities.reduce((acc, opp) => {
      if (!acc[opp.assignedTo]) {
        acc[opp.assignedTo] = { count: 0, revenue: 0, pipeline: 0, winRate: 0 };
      }
      acc[opp.assignedTo].count += 1;
      if (opp.stage === 'Closed Won') {
        acc[opp.assignedTo].revenue += opp.amount;
      } else if (!['Closed Won', 'Closed Lost'].includes(opp.stage)) {
        acc[opp.assignedTo].pipeline += opp.amount;
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number; pipeline: number; winRate: number }>);

    // Calculate win rates for reps
    Object.keys(repPerformance).forEach(rep => {
      const repOpps = filteredOpportunities.filter(opp => opp.assignedTo === rep);
      const repClosedOpps = repOpps.filter(opp => ['Closed Won', 'Closed Lost'].includes(opp.stage));
      const repWonOpps = repOpps.filter(opp => opp.stage === 'Closed Won');
      repPerformance[rep].winRate = repClosedOpps.length > 0 
        ? (repWonOpps.length / repClosedOpps.length) * 100 
        : 0;
    });

    return {
      totalRevenue,
      totalPipeline,
      weightedPipeline,
      winRate,
      averageDealSize,
      averageSalesCycle,
      totalOpportunities: filteredOpportunities.length,
      stageDistribution,
      sourcePerformance,
      repPerformance
    };
  };

  const calculateAverageSalesCycle = (opportunities: Opportunity[]) => {
    const closedWonOpps = opportunities.filter(opp => opp.stage === 'Closed Won');
    if (closedWonOpps.length === 0) return 0;

    const totalDays = closedWonOpps.reduce((sum, opp) => {
      const created = new Date(opp.createdAt);
      const closed = new Date(opp.expectedCloseDate);
      const days = Math.max(1, Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
      return sum + days;
    }, 0);

    return Math.round(totalDays / closedWonOpps.length);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = calculateMetrics();

  const stageColors = {
    'Qualification': '#3B82F6',
    'Needs Analysis': '#F59E0B',
    'Proposal': '#F97316',
    'Negotiation': '#8B5CF6',
    'Closed Won': '#10B981',
    'Closed Lost': '#EF4444'
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600">Comprehensive sales performance insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Closed Won</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalPipeline)}</p>
                  <p className="text-xs text-gray-500 mt-1">Weighted: {formatCurrency(metrics.weightedPipeline)}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.winRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">Avg Deal: {formatCurrency(metrics.averageDealSize)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sales Cycle</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.averageSalesCycle} days</p>
                  <p className="text-xs text-gray-500 mt-1">{metrics.totalOpportunities} opportunities</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Pipeline by Stage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.stageDistribution).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stageColors[stage as keyof typeof stageColors] }}
                      />
                      <span className="text-sm font-medium">{stage}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{count}</Badge>
                      <span className="text-sm text-gray-500">
                        {((count / metrics.totalOpportunities) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Source Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Source Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.sourcePerformance)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map(([source, data]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{source}</div>
                      <div className="text-xs text-gray-500">
                        {data.count} opportunities • {data.winRate.toFixed(1)}% win rate
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(data.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sales Rep Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Sales Rep Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-600">Sales Rep</th>
                    <th className="text-right py-2 font-medium text-gray-600">Opportunities</th>
                    <th className="text-right py-2 font-medium text-gray-600">Revenue</th>
                    <th className="text-right py-2 font-medium text-gray-600">Pipeline</th>
                    <th className="text-right py-2 font-medium text-gray-600">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.repPerformance)
                    .sort(([,a], [,b]) => b.revenue - a.revenue)
                    .map(([rep, data]) => (
                    <tr key={rep} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {rep.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium">{rep}</span>
                        </div>
                      </td>
                      <td className="text-right py-3">{data.count}</td>
                      <td className="text-right py-3 font-medium text-green-600">
                        {formatCurrency(data.revenue)}
                      </td>
                      <td className="text-right py-3 font-medium text-blue-600">
                        {formatCurrency(data.pipeline)}
                      </td>
                      <td className="text-right py-3">
                        <Badge 
                          variant={data.winRate >= 50 ? "default" : "secondary"}
                          className={data.winRate >= 50 ? "bg-green-100 text-green-800" : ""}
                        >
                          {data.winRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}