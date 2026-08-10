import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, DollarSign, BarChart3, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';

interface ForecastingDashboardProps {
  opportunities: any[];
}

export default function ForecastingDashboard({ opportunities }: ForecastingDashboardProps) {
  const [forecastPeriod, setForecastPeriod] = useState('quarter');
  const [forecastType, setForecastType] = useState('revenue');

  // Calculate forecast metrics
  const calculateForecast = () => {
    const now = new Date();
    const endDate = new Date();
    
    switch (forecastPeriod) {
      case 'month':
        endDate.setMonth(now.getMonth() + 1);
        break;
      case 'quarter':
        endDate.setMonth(now.getMonth() + 3);
        break;
      case 'year':
        endDate.setFullYear(now.getFullYear() + 1);
        break;
    }

    const relevantOpportunities = opportunities.filter(opp => {
      const closeDate = new Date(opp.expectedCloseDate);
      return closeDate >= now && closeDate <= endDate && !['Closed Lost'].includes(opp.stage);
    });

    const totalPipeline = relevantOpportunities.reduce((sum, opp) => sum + opp.amount, 0);
    const weightedPipeline = relevantOpportunities.reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);
    const bestCase = relevantOpportunities.reduce((sum, opp) => sum + opp.amount, 0);
    const worstCase = relevantOpportunities
      .filter(opp => opp.probability >= 75)
      .reduce((sum, opp) => sum + opp.amount, 0);

    return {
      totalPipeline,
      weightedPipeline,
      bestCase,
      worstCase,
      opportunityCount: relevantOpportunities.length,
      opportunities: relevantOpportunities
    };
  };

  const forecast = calculateForecast();

  // Group opportunities by stage
  const opportunitiesByStage = opportunities.reduce((acc, opp) => {
    if (!acc[opp.stage]) acc[opp.stage] = [];
    acc[opp.stage].push(opp);
    return acc;
  }, {} as Record<string, any[]>);

  // Group opportunities by assignee
  const opportunitiesByAssignee = opportunities.reduce((acc, opp) => {
    if (!acc[opp.assignedTo]) acc[opp.assignedTo] = [];
    acc[opp.assignedTo].push(opp);
    return acc;
  }, {} as Record<string, any[]>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Forecasting</h1>
          <p className="text-gray-600">Predict future sales based on pipeline data and trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={forecastType} onValueChange={setForecastType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="deals">Deal Count</SelectItem>
              <SelectItem value="probability">Probability</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Weighted Forecast</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(forecast.weightedPipeline)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Best Case</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(forecast.bestCase)}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Worst Case</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(forecast.worstCase)}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Opportunities</p>
                <p className="text-lg font-bold text-gray-900">{forecast.opportunityCount}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Pipeline by Stage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(opportunitiesByStage).map(([stage, opps]) => {
              const stageValue = opps.reduce((sum, opp) => sum + opp.amount, 0);
              const stagePercentage = (stageValue / forecast.totalPipeline) * 100;
              
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stage}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrency(stageValue)}</div>
                      <div className="text-xs text-gray-500">{opps.length} deals</div>
                    </div>
                  </div>
                  <Progress value={stagePercentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sales Rep Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Sales Rep Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(opportunitiesByAssignee)
              .sort(([,a], [,b]) => {
                const aValue = a.reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);
                const bValue = b.reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);
                return bValue - aValue;
              })
              .slice(0, 5)
              .map(([assignee, opps]) => {
                const repValue = opps.reduce((sum, opp) => sum + opp.amount, 0);
                const weightedValue = opps.reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);
                const repPercentage = (weightedValue / forecast.weightedPipeline) * 100;
                
                return (
                  <div key={assignee} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{assignee}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrency(weightedValue)}</div>
                        <div className="text-xs text-gray-500">{opps.length} deals</div>
                      </div>
                    </div>
                    <Progress value={repPercentage} className="h-2" />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* Forecast Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Accuracy & Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
              <div className="text-sm text-gray-600">Forecast Accuracy</div>
              <div className="text-xs text-gray-500 mt-1">Last 3 months</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">+12%</div>
              <div className="text-sm text-gray-600">Pipeline Growth</div>
              <div className="text-xs text-gray-500 mt-1">vs. last period</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">72%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
              <div className="text-xs text-gray-500 mt-1">Closed opportunities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunities Closing This {forecastPeriod === 'month' ? 'Month' : forecastPeriod === 'quarter' ? 'Quarter' : 'Year'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecast.opportunities
              .sort((a, b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime())
              .slice(0, 5)
              .map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{opp.name}</div>
                    <div className="text-sm text-gray-500">{opp.assignedTo} • {opp.stage}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(opp.amount)}</div>
                    <div className="text-sm text-gray-500">{opp.probability}% probability</div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline" className="text-xs">
                      {new Date(opp.expectedCloseDate).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}