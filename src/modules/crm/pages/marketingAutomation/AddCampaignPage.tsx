// src/pages/crm/marketingAutomation/AddCampaignPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
import { Card, CardContent } from '@/shared/components/ui/card';
import { showToast } from '@/shared/layout/layout';
import { createCampaign } from '@/modules/crm/services/crm.api';
import type { CreateCampaignDto, Campaign } from '@/modules/crm/types/crm.types';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const toUTCISOString = (localDateTime: string): string | undefined => {
    if (!localDateTime) return undefined;
    const date = new Date(localDateTime);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
};

// Campaign type options (matches backend enum)
const campaignTypeOptions = [
    { value: '1', label: 'Email' },
    { value: '2', label: 'Social Media' },
    { value: '3', label: 'Advertisement' },
    { value: '4', label: 'Event' },
    { value: '5', label: 'Direct Mail' },
    { value: '6', label: 'Telemarketing' },
    { value: '7', label: 'Content Marketing' },
    { value: '8', label: 'Other' },
];

// Campaign status options (matches backend enum)
const campaignStatusOptions = [
    { value: '1', label: 'Draft' },
    { value: '2', label: 'Active' },
    { value: '3', label: 'Paused' },
    { value: '4', label: 'Completed' },
    { value: '5', label: 'Cancelled' },
    { value: '6', label: 'Archived' },
    { value: '7', label: 'Scheduled' },
];

const AddCampaignPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateCampaignDto>>({
        name: '',
        description: '',
        type: 1, // Default: Email
        status: 1, // Default: Draft
        targetAudience: '',
        channel: '',
        budget: 0,
        startDate: '',
        endDate: '',
        targetCount: 0,
        objective: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            showToast.error('Campaign name is required');
            return;
        }

        try {
            setLoading(true);

            const payload: CreateCampaignDto = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                type: formData.type || 1,
                status: formData.status || 1,
                targetAudience: formData.targetAudience?.trim() || '',
                channel: formData.channel?.trim() || '',
                budget: formData.budget || 0,
                targetCount: formData.targetCount || 0,
                objective: formData.objective || '',
                startDate: toUTCISOString(formData.startDate || ''),
                endDate: toUTCISOString(formData.endDate || ''),
            };

            await createCampaign(payload);
            showToast.success('Campaign created successfully');
            navigate('/crm/campaigns');
        } catch (error: any) {
            console.error('Create campaign error:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/crm/campaigns')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
                    <p className="text-sm text-gray-500">Fill in the details to create a new marketing campaign</p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        {/* Type & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={String(formData.type || 1)}
                                    onValueChange={(value) => setFormData({ ...formData, type: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {campaignTypeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={String(formData.status || 1)}
                                    onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {campaignStatusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Channel & Target Audience */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="channel">Channel</Label>
                                <Input
                                    id="channel"
                                    value={formData.channel}
                                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                    placeholder="e.g., Email, Social Media"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="targetAudience">Target Audience</Label>
                                <Input
                                    id="targetAudience"
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    placeholder="e.g., Young professionals"
                                />
                            </div>
                        </div>

                        {/* Objective & Target Count */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="objective">Objective</Label>
                                <Input
                                    id="objective"
                                    value={formData.objective}
                                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                    placeholder="e.g., Lead generation"
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

                        {/* Budget */}
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

                        {/* Start & End Dates */}
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

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/crm/campaigns')}
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
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default AddCampaignPage;