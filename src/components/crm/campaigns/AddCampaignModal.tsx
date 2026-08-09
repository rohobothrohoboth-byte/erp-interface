// src/components/crm/campaigns/AddCampaignModal.tsx

import React, { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { showToast } from '../../../layout/layout';
import { createCampaign } from '../../../services/crm/crm.api';
import type { CreateCampaignDto } from '../../../types/crm/crm.types';
import type { CampaignStatus, CampaignType } from '../../../types/crm/marketing.types';

interface AddCampaignModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const AddCampaignModal: React.FC<AddCampaignModalProps> = ({
                                                               open,
                                                               onOpenChange,
                                                               onSuccess,
                                                           }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateCampaignDto>>({
        name: '',
        description: '',
        type: 'Email',
        status: 'Draft',
        targetAudience: '',
        channel: '',
        budget: 0,
        startDate: '',
        endDate: '',
        targetCount: 0,
    });

    // Helper function to convert local datetime to UTC ISO string
    const toUTCISOString = (localDateTime: string): string | undefined => {
        if (!localDateTime) return undefined;
        const date = new Date(localDateTime);
        return date.toISOString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            showToast.error('Campaign name is required');
            return;
        }

        try {
            setLoading(true);

            // Prepare data with UTC dates
            const payload: CreateCampaignDto = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                type: formData.type as CampaignType || 'Email',
                status: formData.status as CampaignStatus || 'Draft',
                targetAudience: formData.targetAudience?.trim() || '',
                channel: formData.channel?.trim() || '',
                budget: formData.budget || 0,
                targetCount: formData.targetCount || 0,
                startDate: toUTCISOString(formData.startDate || ''),
                endDate: toUTCISOString(formData.endDate || ''),
            };

            await createCampaign(payload);
            showToast.success('Campaign created successfully');
            onOpenChange(false);
            onSuccess?.();

            // Reset form
            setFormData({
                name: '',
                description: '',
                type: 'Email',
                status: 'Draft',
                targetAudience: '',
                channel: '',
                budget: 0,
                targetCount: 0,
                startDate: '',
                endDate: '',
            });
        } catch (error: any) {
            console.error('Create campaign error:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new marketing campaign.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Campaign Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Campaign Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter campaign name"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter campaign description"
                            rows={3}
                        />
                    </div>

                    {/* Type and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="SMS">SMS</SelectItem>
                                    <SelectItem value="SocialMedia">Social Media</SelectItem>
                                    <SelectItem value="Event">Event</SelectItem>
                                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                                    <SelectItem value="Webinar">Webinar</SelectItem>
                                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    {/* Don't allow Active, Paused, Completed, Cancelled for new campaigns */}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">New campaigns start as Draft or Scheduled</p>
                        </div>
                    </div>

                    {/* Target Audience and Channel */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="targetAudience">Target Audience</Label>
                            <Input
                                id="targetAudience"
                                value={formData.targetAudience}
                                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                placeholder="e.g., Young professionals"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="channel">Channel</Label>
                            <Input
                                id="channel"
                                value={formData.channel}
                                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                placeholder="e.g., Email, Social Media"
                            />
                        </div>
                    </div>

                    {/* Budget and Target Count */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget">Budget ($)</Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budget || ''}
                                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                                placeholder="Enter budget amount"
                                min={0}
                                step={0.01}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetCount">Target Count</Label>
                            <Input
                                id="targetCount"
                                type="number"
                                value={formData.targetCount || ''}
                                onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 0 })}
                                placeholder="Number of targets"
                                min={0}
                            />
                        </div>
                    </div>

                    {/* Start and End Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">Local time will be converted to UTC</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">Local time will be converted to UTC</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Campaign'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddCampaignModal;