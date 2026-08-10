import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Users, Calendar, Award, FileText, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import type { Opportunity } from '@/modules/crm/types/crm';

interface SalesDashboardProps {
  opportunities: Opportunity[];
  quotations: any[];
  orders: any[];
}

export default function SalesDashboard({ opportunities, quotations, orders }: SalesDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate key metrics
  const totalRevenue = opportunities
    .filter(opp => opp.stage === 'Closed Won')
    .reduce((sum, opp) => sum + opp.amount, 0);

  const totalPipeline = opportunities
    .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage))
    .reduce((sum, opp) => sum + opp.amount, 0);

  const weightedPipeline = opportunities
    .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage))
    .reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);

  const closedOpportunities = opportunities.filter(opp => 
    ['Closed Won', 'Closed Lost'].includes(opp.stage)
  );
  const winRate = closedOpportunities.length > 0
    ? (opportunities.filter(opp => opp.stage === 'Closed Won').length / closedOpportunities.length) * 100
    : 0;

  // Recent activities
  const recentOpportunities = opportunities
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const upcomingCloses = opportunities
    .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage))
    .sort((a, b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime())
    .slice(0, 5);

  // Stage distribution
  const stageDistribution = opportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageColors = {
    'Qualification': 'bg-blue-500',
    'Needs Analysis': 'bg-yellow-500',
    'Proposal': 'bg-orange-500',
    'Negotiation': 'bg-purple-500',
    'Closed Won': 'bg-green-500',
    'Closed Lost': 'bg-red-500'
  };

  return (
    <div className="space-y-6">
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
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {opportunities.filter(opp => opp.stage === 'Closed Won').length} deals closed
                  </p>
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
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPipeline)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Weighted: {formatCurrency(weightedPipeline)}
                  </p>
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
                  <p className="text-2xl font-bold text-purple-600">{winRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {closedOpportunities.length} opportunities closed
                  </p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {opportunities.filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage)).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {quotations.length} quotations, {orders.length} orders
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pipeline Overview and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Pipeline by Stage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stageDistribution).map(([stage, count]) => {
                  const percentage = (count / opportunities.length) * 100;
                  return (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${stageColors[stage as keyof typeof stageColors]}`}
                          />
                          <span className="text-sm font-medium">{stage}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{count}</Badge>
                          <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOpportunities.map((opportunity, index) => (
                  <div key={opportunity.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${stageColors[opportunity.stage as keyof typeof stageColors]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {opportunity.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {opportunity.stage} • {formatCurrency(opportunity.amount)}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(opportunity.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Closes and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Closes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Upcoming Closes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingCloses.length > 0 ? (
                  upcomingCloses.map((opportunity) => {
                    const isOverdue = new Date(opportunity.expectedCloseDate) < new Date();
                    return (
                      <div key={opportunity.id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {opportunity.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {opportunity.assignedTo} • {formatCurrency(opportunity.amount)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={isOverdue ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            {formatDate(opportunity.expectedCloseDate)}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {opportunity.probability}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No upcoming closes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-600">{quotations.length}</div>
                  <div className="text-xs text-blue-600">Active Quotations</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">{orders.length}</div>
                  <div className="text-xs text-green-600">Active Orders</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-600">
                    {opportunities.filter(opp => opp.stage === 'Negotiation').length}
                  </div>
                  <div className="text-xs text-purple-600">In Negotiation</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-orange-600">
                    {opportunities.filter(opp => {
                      const closeDate = new Date(opp.expectedCloseDate);
                      const today = new Date();
                      const diffTime = closeDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 7 && diffDays >= 0 && !['Closed Won', 'Closed Lost'].includes(opp.stage);
                    }).length}
                  </div>
                  <div className="text-xs text-orange-600">Closing This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}