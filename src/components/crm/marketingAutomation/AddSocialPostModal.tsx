// src/components/crm/marketing/components/AddSocialPostModal.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Share2,
    Calendar,
    Loader2,
    Image,
    Video,
    Link2,
    MapPin,
    Hash,
    Instagram,
    Twitter,
    Facebook,
    Linkedin,
    Youtube,
    Send,
    Save,
} from 'lucide-react';
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
import { showToast } from '../../../layout/layout';
import { createSocialPost } from '../../../services/crm/crm.api';
import type { CreateSocialPostDto } from '../../../types/crm/crm.types';

interface AddSocialPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    campaignId?: string; // Optional campaign ID
}

const AddSocialPostModal: React.FC<AddSocialPostModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSuccess,
                                                                   campaignId,
                                                               }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateSocialPostDto>({
        content: '',
        platform: 'Facebook',
        status: 'Draft',
        scheduledDate: '',
        imageUrl: '',
        videoUrl: '',
        linkUrl: '',
        location: '',
        hashtags: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.content.trim()) {
            showToast.error('Post content is required');
            return;
        }

        if (!formData.platform) {
            showToast.error('Please select a platform');
            return;
        }

        // Check character limit based on platform
        const charLimit = getPlatformCharLimit(formData.platform);
        if (formData.content.length > charLimit) {
            showToast.error(`${formData.platform} posts are limited to ${charLimit} characters`);
            return;
        }

        // If scheduled, validate date
        if (formData.status === 'Scheduled' && !formData.scheduledDate) {
            showToast.error('Please select a scheduled date');
            return;
        }

        try {
            setLoading(true);

            // Prepare payload for API
            const payload: CreateSocialPostDto = {
                ...formData,
                scheduledDate: formData.scheduledDate
                    ? new Date(formData.scheduledDate).toISOString()
                    : undefined,
                campaignId: campaignId, // Include campaign ID if provided
                status: formData.status,
            };

            // Handle hashtags - convert comma-separated string to string
            if (formData.hashtags) {
                payload.hashtags = formData.hashtags
                    .split(',')
                    .map(h => h.trim())
                    .filter(h => h.length > 0)
                    .join(' ');
            }

            await createSocialPost(payload);
            showToast.success('Social post created successfully');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error creating social post:', error);
            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.errors
                || 'Failed to create social post';
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            content: '',
            platform: 'Facebook',
            status: 'Draft',
            scheduledDate: '',
            imageUrl: '',
            videoUrl: '',
            linkUrl: '',
            location: '',
            hashtags: '',
        });
    };

    const getPlatformCharLimit = (platform: string): number => {
        const limits: Record<string, number> = {
            'Facebook': 2000,
            'Twitter': 280,
            'Instagram': 2200,
            'LinkedIn': 3000,
            'YouTube': 5000,
        };
        return limits[platform] || 2000;
    };

    const getPlatformIcon = (platform: string) => {
        const icons: Record<string, React.ReactNode> = {
            'Facebook': <Facebook className="h-5 w-5 text-blue-600" />,
            'Twitter': <Twitter className="h-5 w-5 text-blue-400" />,
            'Instagram': <Instagram className="h-5 w-5 text-pink-600" />,
            'LinkedIn': <Linkedin className="h-5 w-5 text-blue-700" />,
            'YouTube': <Youtube className="h-5 w-5 text-red-600" />,
        };
        return icons[platform] || <Share2 className="h-5 w-5 text-gray-400" />;
    };

    if (!isOpen) return null;

    const charLimit = getPlatformCharLimit(formData.platform);
    const isOverLimit = formData.content.length > charLimit;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Share2 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Create Social Post</h2>
                            <p className="text-sm text-gray-500">
                                Create and schedule a social media post
                                {campaignId && <span className="text-indigo-600"> for campaign</span>}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Platform Selection */}
                    <div>
                        <Label htmlFor="platform">Platform *</Label>
                        <Select
                            value={formData.platform}
                            onValueChange={(value) => handleSelectChange('platform', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Facebook">Facebook</SelectItem>
                                <SelectItem value="Twitter">Twitter</SelectItem>
                                <SelectItem value="Instagram">Instagram</SelectItem>
                                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                <SelectItem value="YouTube">YouTube</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            {getPlatformIcon(formData.platform)}
                            <span>Selected: {formData.platform}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-400">Max {charLimit} characters</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <Label htmlFor="content">Content *</Label>
                        <Textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder={`Write your ${formData.platform} post content...`}
                            className={`mt-1 min-h-[120px] ${isOverLimit ? 'border-red-500 focus:ring-red-500' : ''}`}
                            required
                        />
                        <div className="text-xs mt-1 flex justify-between">
                            <span className={isOverLimit ? 'text-red-500' : 'text-gray-500'}>
                                {formData.content.length} / {charLimit} characters
                            </span>
                            {isOverLimit && (
                                <span className="text-red-500">⚠️ Exceeds character limit</span>
                            )}
                            {!isOverLimit && formData.content.length > charLimit * 0.8 && (
                                <span className="text-yellow-500">⚠️ Approaching limit</span>
                            )}
                        </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                        <Label htmlFor="hashtags" className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            Hashtags
                        </Label>
                        <Input
                            id="hashtags"
                            name="hashtags"
                            value={formData.hashtags}
                            onChange={handleChange}
                            placeholder="e.g., marketing, socialmedia, campaign"
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate hashtags with commas. They will be converted to spaces.
                        </p>
                    </div>

                    {/* Media & Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="imageUrl" className="flex items-center gap-2">
                                <Image className="h-4 w-4 text-gray-500" />
                                Image URL
                            </Label>
                            <Input
                                id="imageUrl"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="videoUrl" className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-gray-500" />
                                Video URL
                            </Label>
                            <Input
                                id="videoUrl"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/video.mp4"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="linkUrl" className="flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-gray-500" />
                                Link URL
                            </Label>
                            <Input
                                id="linkUrl"
                                name="linkUrl"
                                value={formData.linkUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/article"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="location" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                Location
                            </Label>
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., New York, NY"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleSelectChange('status', value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="scheduledDate" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                Schedule Date
                            </Label>
                            <Input
                                id="scheduledDate"
                                name="scheduledDate"
                                type="datetime-local"
                                value={formData.scheduledDate}
                                onChange={handleChange}
                                className="mt-1"
                                disabled={formData.status !== 'Scheduled'}
                            />
                            {formData.status !== 'Scheduled' && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Set status to "Scheduled" to enable scheduling
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={loading || isOverLimit}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Create Post
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddSocialPostModal;