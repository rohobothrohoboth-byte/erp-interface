import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Mail, Users, TrendingUp, Play, Pause, BarChart3, Eye } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Progress } from '../../ui/progress';
import { mockCampaigns } from '../../../data/crmMockData';
import type { Campaign } from '../../../types/crm';

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

export default function MarketingAutomation() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    type: 'Email',
    status: 'Draft',
    startDate: '',
    endDate: '',
    budget: 0,
    targetAudience: '',
    description: '',
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0
    }
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.targetAudience.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.metrics.sent, 0);
  const totalConverted = campaigns.reduce((sum, c) => sum + c.metrics.converted, 0);
  const overallConversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0;

  const handleAddCampaign = () => {
    const campaign: Campaign = {
      ...newCampaign,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    } as Campaign;
    
    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      name: '',
      type: 'Email',
      status: 'Draft',
      startDate: '',
      endDate: '',
      budget: 0,
      targetAudience: '',
      description: '',
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    });
    setIsAddDialogOpen(false);
  };

  const handleStatusChange = (campaignId: string, newStatus: Campaign['status']) => {
    const updatedCampaigns = campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: newStatus }
        : campaign
    );
    setCampaigns(updatedCampaigns);
  };

  const calculateConversionRate = (campaign: Campaign) => {
    return campaign.metrics.sent > 0 
      ? ((campaign.metrics.converted / campaign.metrics.sent) * 100).toFixed(2)
      : '0.00';
  };

  const calculateOpenRate = (campaign: Campaign) => {
    return campaign.metrics.delivered > 0 
      ? ((campaign.metrics.opened / campaign.metrics.delivered) * 100).toFixed(2)
      : '0.00';
  };

  const calculateClickRate = (campaign: Campaign) => {
    return campaign.metrics.opened > 0 
      ? ((campaign.metrics.clicked / campaign.metrics.opened) * 100).toFixed(2)
      : '0.00';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <h1 className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent text-2xl font-bold">
          Marketing Automation
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="type">Campaign Type</Label>
                <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({...newCampaign, type: value as Campaign['type']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({...newCampaign, budget: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newCampaign.startDate}
                  onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newCampaign.endDate}
                  onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={newCampaign.targetAudience}
                  onChange={(e) => setNewCampaign({...newCampaign, targetAudience: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCampaign} className="bg-orange-600 hover:bg-orange-700">
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-blue-600">{totalSent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{overallConversionRate.toFixed(2)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Webinar">Webinar</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.targetAudience}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColors[campaign.type]}>
                      {campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={campaign.status}
                      onValueChange={(value) => handleStatusChange(campaign.id, value as Campaign['status'])}
                    >
                      <SelectTrigger className="w-32">
                        <Badge className={statusColors[campaign.status]}>
                          {campaign.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Sent: {campaign.metrics.sent}</span>
                        <span>Conv: {calculateConversionRate(campaign)}%</span>
                      </div>
                      <Progress 
                        value={parseFloat(calculateConversionRate(campaign))} 
                        className="w-24 h-2" 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${campaign.budget.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(campaign.endDate).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {campaign.status === 'Active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(campaign.id, 'Paused')}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(campaign.id, 'Active')}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Campaign Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Campaign Name</Label>
                  <p className="text-lg font-semibold">{selectedCampaign.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <Badge className={typeColors[selectedCampaign.type]}>
                    {selectedCampaign.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={statusColors[selectedCampaign.status]}>
                    {selectedCampaign.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Budget</Label>
                  <p>${selectedCampaign.budget.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Target Audience</Label>
                  <p>{selectedCampaign.targetAudience}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created By</Label>
                  <p>{selectedCampaign.createdBy}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="mt-1">{selectedCampaign.description}</p>
              </div>

              <div>
                <Label className="text-lg font-semibold">Performance Metrics</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedCampaign.metrics.sent}</p>
                    <p className="text-sm text-gray-500">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedCampaign.metrics.delivered}</p>
                    <p className="text-sm text-gray-500">Delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedCampaign.metrics.opened}</p>
                    <p className="text-sm text-gray-500">Opened</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedCampaign.metrics.clicked}</p>
                    <p className="text-sm text-gray-500">Clicked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedCampaign.metrics.converted}</p>
                    <p className="text-sm text-gray-500">Converted</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Conversion Rates</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-xl font-bold">{calculateOpenRate(selectedCampaign)}%</p>
                    <p className="text-sm text-gray-500">Open Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{calculateClickRate(selectedCampaign)}%</p>
                    <p className="text-sm text-gray-500">Click Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{calculateConversionRate(selectedCampaign)}%</p>
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}