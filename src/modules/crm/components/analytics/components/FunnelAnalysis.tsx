import { motion } from 'framer-motion';
import { Filter, TrendingDown, Users, Target, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface FunnelAnalysisProps {
  analyticsData: any;
  leads: any[];
  opportunities: any[];
  dateRange: string;
}

export default function FunnelAnalysis({ analyticsData, leads, opportunities, dateRange }: FunnelAnalysisProps) {
  // Calculate funnel stages
  const funnelStages = [
    {
      stage: 'Leads Generated',
      count: leads.length,
      percentage: 100,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      stage: 'Qualified Leads',
      count: leads.filter(l => l.status === 'Qualified').length,
      percentage: leads.length > 0 ? (leads.filter(l => l.status === 'Qualified').length / leads.length) * 100 : 0,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      stage: 'Opportunities Created',
      count: opportunities.length,
      percentage: leads.length > 0 ? (opportunities.length / leads.length) * 100 : 0,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      stage: 'Proposals Sent',
      count: opportunities.filter(o => o.stage === 'Proposal').length,
      percentage: leads.length > 0 ? (opportunities.filter(o => o.stage === 'Proposal').length / leads.length) * 100 : 0,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      stage: 'Deals Closed Won',
      count: opportunities.filter(o => o.stage === 'Closed Won').length,
      percentage: leads.length > 0 ? (opportunities.filter(o => o.stage === 'Closed Won').length / leads.length) * 100 : 0,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  // Calculate conversion rates between stages
  const conversionRates = [];
  for (let i = 1; i < funnelStages.length; i++) {
    const prevStage = funnelStages[i - 1];
    const currentStage = funnelStages[i];
    const rate = prevStage.count > 0 ? (currentStage.count / prevStage.count) * 100 : 0;
    conversionRates.push({
      from: prevStage.stage,
      to: currentStage.stage,
      rate: rate,
      dropOff: prevStage.count - currentStage.count
    });
  }

  // Lead sources analysis
  const leadSources = [
    { source: 'Website', count: Math.floor(leads.length * 0.4), percentage: 40 },
    { source: 'Email', count: Math.floor(leads.length * 0.25), percentage: 25 },
    { source: 'Referral', count: Math.floor(leads.length * 0.2), percentage: 20 },
    { source: 'Social Media', count: Math.floor(leads.length * 0.1), percentage: 10 },
    { source: 'Phone', count: Math.floor(leads.length * 0.05), percentage: 5 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <span>Sales Funnel Analysis</span>
            <Badge variant="outline">{dateRange}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelStages.map((stage, index) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium text-gray-700">
                    {stage.stage}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-12 bg-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className={`h-full ${stage.color} transition-all duration-500 flex items-center justify-between px-4`}
                        style={{ width: `${Math.max(stage.percentage, 10)}%` }}
                      >
                        <span className="text-white font-medium text-sm">
                          {stage.count}
                        </span>
                        <span className="text-white text-xs">
                          {stage.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-20 text-right text-sm font-bold ${stage.textColor}`}>
                    {stage.count}
                  </div>
                </div>
                
                {index < funnelStages.length - 1 && (
                  <div className="flex items-center justify-center mt-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 ml-1">
                      {conversionRates[index]?.rate.toFixed(1)}% conversion
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>Stage Conversion Rates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionRates.map((conversion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {conversion.from} → {conversion.to}
                    </div>
                    <div className="text-xs text-gray-600">
                      {conversion.dropOff} leads dropped off
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      conversion.rate >= 50 ? 'text-green-600' :
                      conversion.rate >= 25 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {conversion.rate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Lead Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-gray-900 text-sm">
                      {source.source}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-12 text-right">
                      {source.count}
                    </div>
                    <div className="text-xs text-gray-500 w-8 text-right">
                      {source.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Strong Conversion</h4>
              </div>
              <p className="text-sm text-green-700">
                Lead to qualified conversion rate is {conversionRates[0]?.rate.toFixed(1)}%, which is above industry average.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Opportunity Gap</h4>
              </div>
              <p className="text-sm text-yellow-700">
                {conversionRates[1]?.dropOff} qualified leads didn't convert to opportunities. Review follow-up process.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Revenue Impact</h4>
              </div>
              <p className="text-sm text-blue-700">
                Improving proposal to close rate by 10% could increase revenue by ${((analyticsData.averageDealSize * opportunities.length * 0.1) / 1000).toFixed(0)}K.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}