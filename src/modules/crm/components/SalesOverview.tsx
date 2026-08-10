// src/components/crm/SalesOverview.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { useCrmData } from '@/modules/crm/hooks/useCrmData';

export default function SalesOverview() {
  const { opportunities, pipelineData, loading } = useCrmData();

  if (loading) {
    return (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
    );
  }

  const totalValue = opportunities?.reduce((sum, opp) => sum + (opp.amount || 0), 0) || 0;
  const wonDeals = opportunities?.filter(o => o.stage === 'ClosedWon').length || 0;
  const pipelineValue = pipelineData?.reduce((sum: number, stage: any) => sum + (stage.value || 0), 0) || 0;

  return (
      <Card className="border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b border-green-100 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Sales Overview
            </CardTitle>
            <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
              {opportunities?.length || 0} Deals
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300">Pipeline Value</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                ${(pipelineValue / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Won Deals</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{wonDeals}</p>
            </div>
          </div>

          {/* Pipeline Progress */}
          {pipelineData && pipelineData.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pipeline Stages</p>
                {pipelineData.slice(0, 4).map((stage: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{stage.stage}</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                    ${(stage.value / 1000).toFixed(1)}K
                  </span>
                      </div>
                      <Progress
                          value={(stage.value / pipelineValue) * 100}
                          className="h-1.5"
                      />
                    </div>
                ))}
              </div>
          )}

          {/* Recent Deals */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Deals</p>
            {opportunities?.slice(0, 3).map((deal, index) => (
                <motion.div
                    key={deal.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {deal.name || 'Unnamed Deal'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {deal.customerName || 'No customer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      ${(deal.amount || 0).toLocaleString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {deal.stage || 'Discovery'}
                    </Badge>
                  </div>
                </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
  );
}