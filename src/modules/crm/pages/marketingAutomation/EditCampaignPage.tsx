// src/pages/crm/marketingAutomation/EditCampaignPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
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
import { getCampaignById, updateCampaign } from '@/modules/crm/services/crm.api';
import type { Campaign, CampaignType, CampaignStatus, UpdateCampaignDto } from '@/modules/crm/services/marketing.types';

const EditCampaignPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [formData, setFormData] = useState<UpdateCampaignDto>({});

    const toUTCISOString = (localDateTime: string): string | undefined => {
        if (!localDateTime) return undefined;
        const date = new Date(localDateTime);
        return date.toISOString();
    };

    const toLocalDateTimeLocal = (utcDateString?: string): string => {
        if (!utcDateString) return '';
        const date = new Date(utcDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        const fetchCampaign = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await getCampaignById(id);
                const data = response.data?.data || response.data;
                setCampaign(data);
                setFormData({
                    name: data.name,
                    description: data.description,
                    type: data.type,
                    status: data.status,
                    targetAudience: data.targetAudience,
                    channel: data.channel,
                    budget: data.budget,
                    startDate: toLocalDateTimeLocal(data.startDate),
                    endDate: toLocalDateTimeLocal(data.endDate),
                });
            } catch (error) {
                console.error('Error fetching campaign:', error);
                showToast.error('Failed to load campaign');
                navigate('/crm/campaigns');
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id || !formData.name?.trim()) {
            showToast.error('Campaign name is required');
            return;
        }

        try {
            setSaving(true);

            const payload: UpdateCampaignDto = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                type: formData.type as CampaignType || 'Email',
                status: formData.status as CampaignStatus || 'Draft',
                targetAudience: formData.targetAudience?.trim() || '',
                channel: formData.channel?.trim() || '',
                budget: formData.budget || 0,
                startDate: toUTCISOString(formData.startDate || ''),
                endDate: toUTCISOString(formData.endDate || ''),
            };

            await updateCampaign(id, payload);
            showToast.success('Campaign updated successfully');
            navigate('/crm/campaigns');
        } catch (error: any) {
            console.error('Update campaign error:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update campaign');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!campaign) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/crm/campaigns')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
                    <p className="text-sm text-gray-500">Update campaign details</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Campaign Name *</Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter campaign name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter campaign description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as CampaignType })}
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
                                    onValueChange={(value) => setFormData({ ...formData, status: value as CampaignStatus })}
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
                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="targetAudience">Target Audience</Label>
                                <Input
                                    id="targetAudience"
                                    value={formData.targetAudience || ''}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    placeholder="e.g., Young professionals"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="channel">Channel</Label>
                                <Input
                                    id="channel"
                                    value={formData.channel || ''}
                                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                    placeholder="e.g., Email, Social Media"
                                />
                            </div>
                        </div>

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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={formData.startDate || ''}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">Local time will be converted to UTC</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate || ''}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">Local time will be converted to UTC</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/crm/campaigns')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default EditCampaignPage;