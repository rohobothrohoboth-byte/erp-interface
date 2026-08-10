import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Edit, MoreHorizontal, Mail, Users, Eye, MousePointer, Target, Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Progress } from '@/shared/components/ui/progress';
import type { Campaign } from '@/modules/crm/types/crm';

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-800',
  'Active': 'bg-green-100 text-green-800',
  'Paused': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-blue-100 text-blue-800'
};

const typeColors = {
  'Email': 'bg-blue-100 text-blue-800',
  'SMS': 'bg-green-100 text-green-800',
  'Social Media': 'bg-purple-100 text-purple-800',
  'Webinar': 'bg-orange-100 text-orange-800',
  'Event': 'bg-pink-100 text-pink-800'
};

interface CampaignListProps {
  campaigns: Campaign[];
  onStatusChange: (campaignId: string, newStatus: Campaign['status']) => void;
  onEdit: (campaign: Campaign) => void;
}

export default function CampaignList({ campaigns, onStatusChange, onEdit }: CampaignListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (campaigns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
        <p className="text-gray-500">Create your first marketing campaign to get started.</p>
      </motion.div>
    );
  }

  const getConversionRate = (campaign: Campaign) => {
    return campaign.metrics.sent > 0 
      ? ((campaign.metrics.converted / campaign.metrics.sent) * 100).toFixed(1)
      : '0.0';
  };

  const getOpenRate = (campaign: Campaign) => {
    return campaign.metrics.delivered > 0 
      ? ((campaign.metrics.opened / campaign.metrics.delivered) * 100).toFixed(1)
      : '0.0';
  };

  const getClickRate = (campaign: Campaign) => {
    return campaign.metrics.opened > 0 
      ? ((campaign.metrics.clicked / campaign.metrics.opened) * 100).toFixed(1)
      : '0.0';
  };

  const isActive = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);
    return start <= now && end >= now && campaign.status === 'Active';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Campaigns ({campaigns.length})
        </h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{campaign.name}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={typeColors[campaign.type]}>
                          {campaign.type}
                        </Badge>
                        <Badge className={statusColors[campaign.status]}>
                          {campaign.status}
                        </Badge>
                        {isActive(campaign) && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Live</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(campaign)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Campaign
                        </DropdownMenuItem>
                        {campaign.status === 'Active' ? (
                          <DropdownMenuItem onClick={() => onStatusChange(campaign.id, 'Paused')}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause Campaign
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onStatusChange(campaign.id, 'Active')}>
                            <Play className="w-4 h-4 mr-2" />
                            Start Campaign
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Campaign Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                    
                    {/* Date Range */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {campaign.metrics.sent.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {getConversionRate(campaign)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Conversion</div>
                      </div>
                    </div>

                    {/* Performance Bars */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Open Rate</span>
                          <span className="font-medium">{getOpenRate(campaign)}%</span>
                        </div>
                        <Progress value={parseFloat(getOpenRate(campaign))} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Click Rate</span>
                          <span className="font-medium">{getClickRate(campaign)}%</span>
                        </div>
                        <Progress value={parseFloat(getClickRate(campaign))} className="h-1" />
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Budget</span>
                        <span className="font-medium text-gray-900">
                          ${campaign.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Status Control */}
                    <Select
                      value={campaign.status}
                      onValueChange={(value) => onStatusChange(campaign.id, value as Campaign['status'])}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{campaign.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Badge className={typeColors[campaign.type]}>
                            {campaign.type}
                          </Badge>
                          <Badge className={statusColors[campaign.status]}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 text-gray-400" />
                              <span>{campaign.metrics.sent.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3 text-gray-400" />
                              <span>{getOpenRate(campaign)}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MousePointer className="w-3 h-3 text-gray-400" />
                              <span>{getClickRate(campaign)}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="w-3 h-3 text-gray-400" />
                              <span>{getConversionRate(campaign)}%</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          ${campaign.budget.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(campaign)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {campaign.status === 'Active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onStatusChange(campaign.id, 'Paused')}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onStatusChange(campaign.id, 'Active')}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}