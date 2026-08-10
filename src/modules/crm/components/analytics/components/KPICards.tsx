import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, DollarSign, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface KPICardsProps {
  analyticsData: any;
  dateRange: string;
}

export default function KPICards({ analyticsData, dateRange }: KPICardsProps) {
  const kpis = [
    {
      id: 'revenue',
      title: 'Monthly Recurring Revenue',
      value: `$${(analyticsData.pipelineValue * 0.15 / 1000).toFixed(0)}K`,
      change: '+12.5%',
      trend: 'up',
      target: '$150K',
      progress: 85,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'conversion',
      title: 'Lead Conversion Rate',
      value: `${analyticsData.leadConversionRate}%`,
      change: '+3.2%',
      trend: 'up',
      target: '30%',
      progress: 82,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'customer-acquisition',
      title: 'Customer Acquisition Cost',
      value: `$${(analyticsData.customerAcquisitionCost / 1000).toFixed(1)}K`,
      change: '-8.1%',
      trend: 'down',
      target: '$2K',
      progress: 75,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'activity-rate',
      title: 'Activity Completion Rate',
      value: `${((analyticsData.activityMetrics.tasksCompleted / (analyticsData.activityMetrics.tasksCompleted + 20)) * 100).toFixed(1)}%`,
      change: '+5.7%',
      trend: 'up',
      target: '90%',
      progress: 78,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'pipeline-velocity',
      title: 'Sales Pipeline Velocity',
      value: `${analyticsData.salesCycleLength} days`,
      change: '-4.2%',
      trend: 'down',
      target: '40 days',
      progress: 88,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      id: 'customer-satisfaction',
      title: 'Customer Satisfaction',
      value: '4.2/5.0',
      change: '+0.3',
      trend: 'up',
      target: '4.5/5.0',
      progress: 84,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span>Key Performance Indicators</span>
            <Badge variant="outline">{dateRange}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map((kpi, index) => {
              const IconComponent = kpi.icon;
              const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
              
              return (
                <motion.div
                  key={kpi.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 ${
                        kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{kpi.change}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 text-sm">{kpi.title}</h3>
                    <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Target: {kpi.target}</span>
                        <span>{kpi.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            kpi.progress >= 80 ? 'bg-green-500' :
                            kpi.progress >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${kpi.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* KPI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Strong Performance</h4>
                <p className="text-sm text-green-700">
                  Lead conversion rate is up 3.2% this period. Continue current lead nurturing strategies.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Needs Attention</h4>
                <p className="text-sm text-yellow-700">
                  Customer satisfaction is below target. Consider implementing additional support training.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Opportunity</h4>
                <p className="text-sm text-blue-700">
                  Sales cycle has decreased by 4.2%. Analyze successful deals to replicate best practices.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}