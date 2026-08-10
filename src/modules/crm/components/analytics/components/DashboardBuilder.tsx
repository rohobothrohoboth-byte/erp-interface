import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';

interface DashboardBuilderProps {
  analyticsData: any;
  dateRange: string;
}

export default function DashboardBuilder({ analyticsData, dateRange }: DashboardBuilderProps) {
  const conversionRate = analyticsData.totalLeads > 0 
    ? (analyticsData.convertedLeads / analyticsData.totalLeads) * 100 
    : 0;

  const opportunityWinRate = analyticsData.totalOpportunities > 0
    ? (analyticsData.wonOpportunities / analyticsData.totalOpportunities) * 100
    : 0;

  const activityCompletionRate = analyticsData.totalActivities > 0
    ? (analyticsData.completedActivities / analyticsData.totalActivities) * 100
    : 0;

  const ticketResolutionRate = analyticsData.totalTickets > 0
    ? (analyticsData.resolvedTickets / analyticsData.totalTickets) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Sales Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Lead Conversion Rate</span>
                  <span className="text-sm font-bold text-gray-900">{conversionRate.toFixed(1)}%</span>
                </div>
                <Progress value={conversionRate} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {analyticsData.convertedLeads} of {analyticsData.totalLeads} leads converted
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Opportunity Win Rate</span>
                  <span className="text-sm font-bold text-gray-900">{opportunityWinRate.toFixed(1)}%</span>
                </div>
                <Progress value={opportunityWinRate} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {analyticsData.wonOpportunities} of {analyticsData.totalOpportunities} opportunities won
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Deal Size</span>
                  <span className="text-sm font-bold text-gray-900">${analyticsData.averageDealSize.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Sales cycle: {analyticsData.salesCycleLength} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Activity & Support Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Activity Completion Rate</span>
                  <span className="text-sm font-bold text-gray-900">{activityCompletionRate.toFixed(1)}%</span>
                </div>
                <Progress value={activityCompletionRate} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {analyticsData.completedActivities} of {analyticsData.totalActivities} activities completed
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Ticket Resolution Rate</span>
                  <span className="text-sm font-bold text-gray-900">{ticketResolutionRate.toFixed(1)}%</span>
                </div>
                <Progress value={ticketResolutionRate} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {analyticsData.resolvedTickets} of {analyticsData.totalTickets} tickets resolved
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Avg Resolution Time</span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.floor(analyticsData.avgResolutionTime / 60)}h {Math.floor(analyticsData.avgResolutionTime % 60)}m
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Target: 24 hours
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span>Revenue Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${(analyticsData.pipelineValue / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-green-700 font-medium">Pipeline Value</div>
              <div className="text-xs text-green-600 mt-1">Total opportunities</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                ${(analyticsData.customerLifetimeValue / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-blue-700 font-medium">Customer LTV</div>
              <div className="text-xs text-blue-600 mt-1">Average lifetime value</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                ${(analyticsData.customerAcquisitionCost / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-orange-700 font-medium">Customer CAC</div>
              <div className="text-xs text-orange-600 mt-1">Acquisition cost</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {(analyticsData.customerLifetimeValue / analyticsData.customerAcquisitionCost).toFixed(1)}:1
              </div>
              <div className="text-sm text-purple-700 font-medium">LTV:CAC Ratio</div>
              <div className="text-xs text-purple-600 mt-1">Efficiency metric</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Team Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analyticsData.activityMetrics.callsMade}
              </div>
              <div className="text-sm font-medium text-gray-700">Calls Made</div>
              <div className="text-xs text-gray-500">This period</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analyticsData.activityMetrics.emailsSent}
              </div>
              <div className="text-sm font-medium text-gray-700">Emails Sent</div>
              <div className="text-xs text-gray-500">This period</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analyticsData.activityMetrics.meetingsHeld}
              </div>
              <div className="text-sm font-medium text-gray-700">Meetings Held</div>
              <div className="text-xs text-gray-500">This period</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {analyticsData.activityMetrics.tasksCompleted}
              </div>
              <div className="text-sm font-medium text-gray-700">Tasks Completed</div>
              <div className="text-xs text-gray-500">This period</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Recent Trends ({dateRange})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Lead Generation</div>
                <div className="text-sm text-gray-600">New leads acquired</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">+{analyticsData.newLeads}</div>
                <div className="text-xs text-green-600">↑ 15% vs last period</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Opportunity Creation</div>
                <div className="text-sm text-gray-600">New opportunities</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">+{analyticsData.openOpportunities}</div>
                <div className="text-xs text-blue-600">↑ 8% vs last period</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Support Tickets</div>
                <div className="text-sm text-gray-600">New tickets created</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">+{analyticsData.totalTickets}</div>
                <div className="text-xs text-red-600">↓ 5% vs last period</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}