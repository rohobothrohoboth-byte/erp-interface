// src/components/crm/campaigns/EditCampaignModal.tsx

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Loader2 } from 'lucide-react';
import { showToast } from '@/shared/layout/layout';
import { updateCampaign } from '@/modules/crm/services/crm.api';
import type { CampaignDto, UpdateCampaignDto } from '@/modules/crm/types/crm.types';

interface EditCampaignModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign: CampaignDto | null;
    onSuccess?: () => void;
}

const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
                                                                 open,
                                                                 onOpenChange,
                                                                 campaign,
                                                                 onSuccess,
                                                             }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<UpdateCampaignDto>>({});

    // Helper function to convert local datetime to UTC ISO string
    const toUTCISOString = (localDateTime: string): string | undefined => {
        if (!localDateTime) return undefined;
        const date = new Date(localDateTime);
        return date.toISOString();
    };

    // Helper function to convert UTC date to local datetime-local format
    const toLocalDateTimeLocal = (utcDateString?: string): string => {
        if (!utcDateString) return '';
        const date = new Date(utcDateString);
        // Convert UTC to local for display in input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name,
                description: campaign.description,
                type: campaign.type,
                status: campaign.status,
                targetAudience: campaign.targetAudience,
                channel: campaign.channel,
                budget: campaign.budget,
                startDate: toLocalDateTimeLocal(campaign.startDate),
                endDate: toLocalDateTimeLocal(campaign.endDate),
            });
        }
    }, [campaign]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!campaign) return;
        if (!formData.name?.trim()) {
            showToast.error('Campaign name is required');
            return;
        }

        try {
            setLoading(true);

            // Prepare data with UTC dates
            const payload: UpdateCampaignDto = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                type: formData.type || 'Email',
                status: formData.status || 'Draft',
                targetAudience: formData.targetAudience?.trim() || '',
                channel: formData.channel?.trim() || '',
                budget: formData.budget || 0,
                startDate: toUTCISOString(formData.startDate || ''),
                endDate: toUTCISOString(formData.endDate || ''),
            };

            await updateCampaign(campaign.id, payload);
            showToast.success('Campaign updated successfully');
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Update campaign error:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update campaign');
        } finally {
            setLoading(false);
        }
    };

    if (!campaign) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Campaign</DialogTitle>
                    <DialogDescription>
                        Update the campaign details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Campaign Name *</Label>
                        <Input
                            id="edit-name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter campaign name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter campaign description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Type *</Label>
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
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Paused">Paused</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-targetAudience">Target Audience</Label>
                            <Input
                                id="edit-targetAudience"
                                value={formData.targetAudience || ''}
                                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                placeholder="e.g., Young professionals"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-channel">Channel</Label>
                            <Input
                                id="edit-channel"
                                value={formData.channel || ''}
                                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                placeholder="e.g., Email, Social Media"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-budget">Budget ($)</Label>
                        <Input
                            id="edit-budget"
                            type="number"
                            value={formData.budget || ''}
                            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                            placeholder="Enter budget amount"
                            min={0}
                            step={0.01}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-startDate">Start Date</Label>
                            <Input
                                id="edit-startDate"
                                type="datetime-local"
                                value={formData.startDate || ''}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">Local time will be converted to UTC</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-endDate">End Date</Label>
                            <Input
                                id="edit-endDate"
                                type="datetime-local"
                                value={formData.endDate || ''}
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
                                    Updating...
                                </>
                            ) : (
                                'Update Campaign'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCampaignModal;