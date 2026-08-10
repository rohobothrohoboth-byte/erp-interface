import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, DollarSign, Users, Target } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import type { Campaign } from '@/modules/crm/types/crm';

interface CampaignFormProps {
  campaign?: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: Partial<Campaign>) => void;
  mode: 'add' | 'edit';
}

export default function CampaignForm({ campaign, isOpen, onClose, onSubmit, mode }: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Email' as Campaign['type'],
    status: 'Draft' as Campaign['status'],
    startDate: '',
    endDate: '',
    budget: '',
    targetAudience: '',
    description: '',
    segments: [] as string[],
    newSegment: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (campaign && mode === 'edit') {
      setFormData({
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budget: campaign.budget.toString(),
        targetAudience: campaign.targetAudience,
        description: campaign.description,
        segments: campaign.segmentIds || [],
        newSegment: ''
      });
    } else {
      // Reset form for add mode
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setFormData({
        name: '',
        type: 'Email',
        status: 'Draft',
        startDate: today,
        endDate: nextWeek.toISOString().split('T')[0],
        budget: '',
        targetAudience: '',
        description: '',
        segments: [],
        newSegment: ''
      });
    }
    setErrors({});
  }, [campaign, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    if (!formData.targetAudience.trim()) {
      newErrors.targetAudience = 'Target audience is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    const campaignData: Partial<Campaign> = {
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: parseFloat(formData.budget),
      targetAudience: formData.targetAudience.trim(),
      description: formData.description.trim(),
      segmentIds: formData.segments
    };

    onSubmit(campaignData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSegment = () => {
    if (formData.newSegment.trim() && !formData.segments.includes(formData.newSegment.trim())) {
      setFormData(prev => ({
        ...prev,
        segments: [...prev.segments, prev.newSegment.trim()],
        newSegment: ''
      }));
    }
  };

  const removeSegment = (segmentToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      segments: prev.segments.filter(segment => segment !== segmentToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.newSegment.trim()) {
      e.preventDefault();
      addSegment();
    }
  };

  const campaignTypes = [
    { value: 'Email', label: '📧 Email Campaign', description: 'Send targeted email campaigns' },
    { value: 'SMS', label: '📱 SMS Campaign', description: 'Send text message campaigns' },
    { value: 'Social Media', label: '📱 Social Media', description: 'Social media advertising' },
    { value: 'Webinar', label: '🎥 Webinar', description: 'Educational webinar events' },
    { value: 'Event', label: '🎪 Event', description: 'Physical or virtual events' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span>{mode === 'add' ? 'Create New Campaign' : 'Edit Campaign'}</span>
            {mode === 'edit' && campaign && (
              <Badge variant="outline">#{campaign.id}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Campaign Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter campaign name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="type">Campaign Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
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

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your campaign objectives and strategy"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Campaign Schedule & Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Schedule & Budget</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date *</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="endDate" className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>End Date *</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>}
              </div>

              <div>
                <Label htmlFor="budget" className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Budget *</span>
                </Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="0.00"
                  className={errors.budget ? 'border-red-500' : ''}
                />
                {errors.budget && <p className="text-sm text-red-600 mt-1">{errors.budget}</p>}
              </div>

              <div>
                <Label htmlFor="targetAudience" className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Target Audience *</span>
                </Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="e.g., Enterprise customers, SMB prospects"
                  className={errors.targetAudience ? 'border-red-500' : ''}
                />
                {errors.targetAudience && <p className="text-sm text-red-600 mt-1">{errors.targetAudience}</p>}
              </div>
            </div>
          </div>

          {/* Audience Segments */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Audience Segments</h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={formData.newSegment}
                  onChange={(e) => setFormData(prev => ({ ...prev, newSegment: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Add audience segment (e.g., enterprise, prospects)"
                  className="flex-1"
                />
                <Button type="button" onClick={addSegment} variant="outline">
                  Add Segment
                </Button>
              </div>
              
              {formData.segments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.segments.map((segment, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{segment}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-600" 
                        onClick={() => removeSegment(segment)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {mode === 'add' ? 'Create Campaign' : 'Update Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}