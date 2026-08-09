// src/components/crm/campaigns/AddSMSCampaignModal.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  MessageSquare,
  Send,
  Users,
  Calendar,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  Smartphone,
  CheckCircle,
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
import { Progress } from '../../ui/progress';
import { showToast } from '../../../layout/layout';
import { createCampaign } from '../../../services/crm/crm.api';
import type { CreateCampaignDto } from '../../../types/crm/crm.types';

interface AddSMSCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface SMSCampaignFormData {
  name: string;
  description: string;
  message: string;
  type: string;
  status: string;
  targetAudience: string;
  targetCount: number;
  scheduledDate: string;
  senderId: string;
  budget: number;
  expectedRevenue: number;
}

const defaultFormData: SMSCampaignFormData = {
  name: '',
  description: '',
  message: '',
  type: 'SMS',
  status: 'Draft',
  targetAudience: 'All Customers',
  targetCount: 500,
  scheduledDate: '',
  senderId: 'YourBrand',
  budget: 0,
  expectedRevenue: 0,
};

const audienceOptions = [
  'All Customers',
  'New Customers',
  'Active Customers',
  'VIP Customers',
  'Specific Segment',
];

const senderIdOptions = [
  'YourBrand',
  'CompanyName',
  'Alert',
  'Notification',
  'Support',
  'Promo',
];

const MAX_SMS_LENGTH = 160;

export const AddSMSCampaignModal: React.FC<AddSMSCampaignModalProps> = ({
                                                                          open,
                                                                          onOpenChange,
                                                                          onSuccess,
                                                                        }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState<SMSCampaignFormData>(defaultFormData);
  const [charCount, setCharCount] = useState(0);
  const [messageSegments, setMessageSegments] = useState(1);

  useEffect(() => {
    if (!open) {
      setFormData(defaultFormData);
      setCharCount(0);
      setMessageSegments(1);
      setActiveTab('content');
    }
  }, [open]);

  useEffect(() => {
    const length = formData.message.length;
    setCharCount(length);
    setMessageSegments(Math.ceil(length / MAX_SMS_LENGTH));
  }, [formData.message]);

  const handleChange = (field: keyof SMSCampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.message.trim()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const campaignData: CreateCampaignDto = {
        name: formData.name,
        description: formData.description,
        type: 'SMS',
        status: formData.status,
        targetAudience: formData.targetAudience,
        targetCount: formData.targetCount,
        budget: formData.budget || undefined,
        expectedRevenue: formData.expectedRevenue || undefined,
        channel: formData.senderId,
        contentJson: JSON.stringify({
          message: formData.message,
          segments: messageSegments,
        }),
        metricsJson: JSON.stringify({
          scheduledDate: formData.scheduledDate,
          senderId: formData.senderId,
        }),
      };

      await createCampaign(campaignData);
      showToast.success('SMS campaign created successfully!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating SMS campaign:', error);
      showToast.error(error?.response?.data?.message || 'Failed to create SMS campaign');
    } finally {
      setLoading(false);
    }
  };

  const getMessageStatusColor = () => {
    if (charCount === 0) return 'text-gray-400';
    if (charCount <= MAX_SMS_LENGTH) return 'text-green-600';
    if (charCount <= MAX_SMS_LENGTH * 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <MessageSquare className="h-5 w-5" />
              Create SMS Campaign
            </DialogTitle>
            <DialogDescription>
              Create a new SMS marketing campaign
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
                    placeholder="e.g., Flash Sale Alert"
                    className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  SMS Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Write your SMS message here..."
                    rows={4}
                    className="resize-none font-mono text-base"
                />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                                    <span className="text-gray-500">
                                        Characters: <span className={getMessageStatusColor()}>{charCount}</span>
                                    </span>
                    <span className="text-gray-500">
                                        Segments: <span className="font-medium">{messageSegments}</span>
                                    </span>
                  </div>
                  <span className={`font-medium ${getMessageStatusColor()}`}>
                                    {charCount === 0 ? 'Ready' : charCount <= MAX_SMS_LENGTH ? '✓ Good' : '⚠️ Multiple segments'}
                                </span>
                </div>
                <Progress
                    value={Math.min((charCount / MAX_SMS_LENGTH) * 100, 100)}
                    className="h-1"
                />
                <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Smartphone className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Preview: {formData.message || 'Your message will appear here...'}
                  </p>
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
                    <p className="text-sm text-blue-700 font-medium">SMS Best Practices</p>
                    <ul className="text-sm text-blue-600 mt-1 space-y-1 list-disc list-inside">
                      <li>Keep messages under 160 characters for single segment</li>
                      <li>Include a clear call to action</li>
                      <li>Personalize when possible</li>
                      <li>Send during business hours for better engagement</li>
                    </ul>
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
                  <Label className="text-sm font-medium">Sender ID</Label>
                  <Select
                      value={formData.senderId}
                      onValueChange={(value) => handleChange('senderId', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select sender ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {senderIdOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                className="bg-green-600 hover:bg-green-700"
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

export default AddSMSCampaignModal;