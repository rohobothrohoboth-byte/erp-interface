import { motion } from 'framer-motion';
import { Mail, Users, TrendingUp, Target, Eye, MousePointer, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { Campaign } from '@/modules/crm/types/crm';

interface CampaignStatsProps {
  campaigns: Campaign[];
}

export default function CampaignStats({ campaigns }: CampaignStatsProps) {
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  
  const totalMetrics = campaigns.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.metrics.sent,
    delivered: acc.delivered + campaign.metrics.delivered,
    opened: acc.opened + campaign.metrics.opened,
    clicked: acc.clicked + campaign.metrics.clicked,
    converted: acc.converted + campaign.metrics.converted
  }), { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 });

  const deliveryRate = totalMetrics.sent > 0 ? (totalMetrics.delivered / totalMetrics.sent) * 100 : 0;
  const openRate = totalMetrics.delivered > 0 ? (totalMetrics.opened / totalMetrics.delivered) * 100 : 0;
  const clickRate = totalMetrics.opened > 0 ? (totalMetrics.clicked / totalMetrics.opened) * 100 : 0;
  const conversionRate = totalMetrics.sent > 0 ? (totalMetrics.converted / totalMetrics.sent) * 100 : 0;

  const stats = [
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      change: '+12%',
      trend: 'up',
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Reach',
      value: totalMetrics.sent.toLocaleString(),
      change: '+25%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Conversions',
      value: totalMetrics.converted.toLocaleString(),
      change: '+18%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const performanceStats = [
    {
      title: 'Delivery Rate',
      value: `${deliveryRate.toFixed(1)}%`,
      subtitle: `${totalMetrics.delivered.toLocaleString()} delivered`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Open Rate',
      value: `${openRate.toFixed(1)}%`,
      subtitle: `${totalMetrics.opened.toLocaleString()} opened`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Click Rate',
      value: `${clickRate.toFixed(1)}%`,
      subtitle: `${totalMetrics.clicked.toLocaleString()} clicked`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      subtitle: `${totalMetrics.converted.toLocaleString()} converted`,
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
          const TrendIcon = stat.trend === 'up' ? TrendingUp : AlertTriangle;
          
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
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendIcon className={`w-4 h-4 mr-1 ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Campaign Performance Metrics</span>
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

      {/* Campaign Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Marketing Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Sent', value: totalMetrics.sent, icon: Mail, color: 'bg-gray-500' },
                { label: 'Delivered', value: totalMetrics.delivered, icon: CheckCircle, color: 'bg-green-500' },
                { label: 'Opened', value: totalMetrics.opened, icon: Eye, color: 'bg-blue-500' },
                { label: 'Clicked', value: totalMetrics.clicked, icon: MousePointer, color: 'bg-purple-500' },
                { label: 'Converted', value: totalMetrics.converted, icon: Target, color: 'bg-orange-500' }
              ].map((stage, index) => {
                const IconComponent = stage.icon;
                const percentage = totalMetrics.sent > 0 ? (stage.value / totalMetrics.sent) * 100 : 0;
                
                return (
                  <div key={stage.label} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 w-32">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{stage.label}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{stage.value.toLocaleString()}</span>
                        <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${stage.color}`}
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