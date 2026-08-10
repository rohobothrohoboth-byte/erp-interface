import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface PipelineHeaderProps {
  onAddOpportunity: () => void;
  metrics: {
    totalPipelineValue: number;
    closedWonValue: number;
    averageDealSize: number;
    winRate: number;
    totalOpportunities: number;
    thisMonthClosed: number;
  };
}

export default function PipelineHeader({ onAddOpportunity, metrics }: PipelineHeaderProps) {
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
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600">Track and manage your sales opportunities through the pipeline</p>
        </div>
        <Button onClick={onAddOpportunity} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Pipeline Value</p>
                <p className="text-lg font-bold text-gray-900">${metrics.totalPipelineValue.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Closed Won</p>
                <p className="text-lg font-bold text-green-600">${metrics.closedWonValue.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-lg font-bold text-gray-900">${metrics.averageDealSize.toLocaleString()}</p>
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
                <p className="text-xs font-medium text-gray-600">Win Rate</p>
                <p className="text-lg font-bold text-purple-600">{metrics.winRate.toFixed(1)}%</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Opportunities</p>
                <p className="text-lg font-bold text-gray-900">{metrics.totalOpportunities}</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">This Month</p>
                <p className="text-lg font-bold text-gray-900">{metrics.thisMonthClosed}</p>
              </div>
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}