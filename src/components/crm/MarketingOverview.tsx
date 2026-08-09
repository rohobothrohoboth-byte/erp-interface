// src/components/crm/MarketingOverview.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Mail,
  Share2,
  TrendingUp,
  Users,
  Target,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useCrmData } from '../../hooks/useCrmData';

export default function MarketingOverview() {
  const { campaigns, loading } = useCrmData();

  if (loading) {
    return (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
    );
  }

  const activeCampaigns = campaigns?.filter(c => c.status === 'Active').length || 0;
  const completedCampaigns = campaigns?.filter(c => c.status === 'Completed').length || 0;

  return (
      <Card className="border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b border-purple-100 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Marketing Overview
            </CardTitle>
            <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
              {campaigns?.length || 0} Campaigns
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800">
              <p className="text-xs text-purple-700 dark:text-purple-300">Active</p>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{activeCampaigns}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300">Completed</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">{completedCampaigns}</p>
            </div>
          </div>

          {/* Campaign List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Campaigns</p>
            {campaigns?.slice(0, 3).map((campaign, index) => (
                <motion.div
                    key={campaign.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {campaign.type === 'Email' ? (
                        <Mail className="h-4 w-4 text-purple-500" />
                    ) : campaign.type === 'SocialMedia' ? (
                        <Share2 className="h-4 w-4 text-blue-500" />
                    ) : (
                        <Megaphone className="h-4 w-4 text-orange-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {campaign.name || 'Unnamed Campaign'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {campaign.type || 'General'}
                      </p>
                    </div>
                  </div>
                  <Badge
                      variant="outline"
                      className={`text-xs ${
                          campaign.status === 'Active' ? 'border-green-500 text-green-600' :
                              campaign.status === 'Completed' ? 'border-blue-500 text-blue-600' :
                                  'border-gray-500 text-gray-600'
                      }`}
                  >
                    {campaign.status || 'Draft'}
                  </Badge>
                </motion.div>
            ))}
            {(!campaigns || campaigns.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No campaigns yet</p>
            )}
          </div>
        </CardContent>
      </Card>
  );
}