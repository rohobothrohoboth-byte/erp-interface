// src/components/crm/campaigns/AddEmailCampaignModal.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Mail,
  Send,
  Users,
  Calendar,
  Clock,
  Tag,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { showToast } from '../../../layout/layout';
import { createCampaign } from '../../../services/crm/crm.api';
import type { CreateCampaignDto } from '../../../types/crm/crm.types';

interface AddEmailCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface EmailCampaignFormData {
  name: string;
  description: string;
  subject: string;
  content: string;
  type: string;
  status: string;
  targetAudience: string;
  targetCount: number;
  scheduledDate: string;
  budget: number;
  expectedRevenue: number;
  tags: string[];
}

const defaultFormData: EmailCampaignFormData = {
  name: '',
  description: '',
  subject: '',
  content: '',
  type: 'Email',
  status: 'Draft',
  targetAudience: 'All Customers',
  targetCount: 1000,
  scheduledDate: '',
  budget: 0,
  expectedRevenue: 0,
  tags: [],
};

const audienceOptions = [
  'All Customers',
  'New Customers',
  'Active Customers',
  'Inactive Customers',
  'VIP Customers',
  'Specific Segment',
];

const tagOptions = [
  'Newsletter',
  'Promotional',
  'Product Launch',
  'Event',
  'Webinar',
  'Survey',
  'Welcome',
  'Re-engagement',
];

export const AddEmailCampaignModal: React.FC<AddEmailCampaignModalProps> = ({
                                                                              open,
                                                                              onOpenChange,
                                                                              onSuccess,
                                                                            }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState<EmailCampaignFormData>(defaultFormData);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setFormData(defaultFormData);
      setSelectedTags([]);
      setActiveTab('content');
    }
  }, [open]);

  const handleChange = (field: keyof EmailCampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
        prev.includes(tag)
            ? prev.filter(t => t !== tag)
            : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.content.trim()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const campaignData: CreateCampaignDto = {
        name: formData.name,
        description: formData.description,
        type: 'Email',
        status: formData.status,
        targetAudience: formData.targetAudience,
        targetCount: formData.targetCount,
        budget: formData.budget || undefined,
        expectedRevenue: formData.expectedRevenue || undefined,
        contentJson: JSON.stringify({
          subject: formData.subject,
          content: formData.content,
          tags: selectedTags,
        }),
        metricsJson: JSON.stringify({
          scheduledDate: formData.scheduledDate,
        }),
      };

      await createCampaign(campaignData);
      showToast.success('Email campaign created successfully!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating email campaign:', error);
      showToast.error(error?.response?.data?.message || 'Failed to create email campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600">
              <Mail className="h-5 w-5" />
              Create Email Campaign
            </DialogTitle>
            <DialogDescription>
              Create a new email marketing campaign
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="audience" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Audience
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Campaign Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Summer Newsletter 2024"
                    className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Subject Line <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="Enter email subject line..."
                    className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Email Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Write your email content here..."
                    rows={8}
                    className="resize-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => (
                      <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer px-3 py-1"
                          onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Target Audience</Label>
                <Select
                    value={formData.targetAudience}
                    onValueChange={(value) => handleChange('targetAudience', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Target Count</Label>
                <Input
                    type="number"
                    value={formData.targetCount}
                    onChange={(e) => handleChange('targetCount', parseInt(e.target.value) || 0)}
                    className="h-10"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Audience Sizing</p>
                    <p className="text-sm text-blue-600">
                      This campaign will be sent to approximately <strong>{formData.targetCount.toLocaleString()}</strong> recipients.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Scheduled Date</Label>
                  <Input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => handleChange('scheduledDate', e.target.value)}
                      className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Budget</Label>
                  <Input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
                      className="h-10"
                      placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Expected Revenue</Label>
                  <Input
                      type="number"
                      value={formData.expectedRevenue}
                      onChange={(e) => handleChange('expectedRevenue', parseFloat(e.target.value) || 0)}
                      className="h-10"
                      placeholder="0"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Scheduling</p>
                    <p className="text-sm text-yellow-600">
                      {formData.scheduledDate
                          ? `Campaign will be sent on ${new Date(formData.scheduledDate).toLocaleString()}`
                          : 'No schedule set. Campaign will be sent immediately when activated.'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
              ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Campaign
                  </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default AddEmailCampaignModal;