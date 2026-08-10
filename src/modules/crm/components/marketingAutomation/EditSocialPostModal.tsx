// src/components/crm/marketingAutomation/EditSocialPostModal.tsx

import React, { useState, useEffect } from 'react';
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
    Save,
    Edit3,
} from 'lucide-react';
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
import { showToast } from '@/shared/layout/layout';
import { getSocialPostById, updateSocialPost } from '@/modules/crm/services/crm.api';

interface EditSocialPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    postId: string | null;
}

interface SocialPost {
    id: string;
    content: string;
    platform: string;
    status: string;
    imageUrl: string | null;
    videoUrl: string | null;
    linkUrl: string | null;
    location: string | null;
    hashtags: string | null;
    scheduledDate: string | null;
    publishedDate: string | null;
    engagementCount: number;
    reachCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
    postId: string | null;
    campaignId: string | null;
    createdAt: string;
    updatedAt: string | null;
}

const EditSocialPostModal: React.FC<EditSocialPostModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSuccess,
                                                                     postId,
                                                                 }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<any>({
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
    const [originalPost, setOriginalPost] = useState<SocialPost | null>(null);

    useEffect(() => {
        if (isOpen && postId) {
            fetchPost();
        } else {
            setOriginalPost(null);
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
        }
    }, [isOpen, postId]);

    const fetchPost = async () => {
        if (!postId) return;

        try {
            setFetching(true);
            const response = await getSocialPostById(postId);
            const data = response.data?.data || response.data;
            setOriginalPost(data);

            // Populate form with existing data
            setFormData({
                content: data.content || '',
                platform: data.platform || 'Facebook',
                status: data.status || 'Draft',
                scheduledDate: data.scheduledDate || '',
                imageUrl: data.imageUrl || '',
                videoUrl: data.videoUrl || '',
                linkUrl: data.linkUrl || '',
                location: data.location || '',
                hashtags: data.hashtags || '',
            });
        } catch (error: any) {
            console.error('Error fetching post:', error);
            showToast.error('Failed to load post details');
            onClose();
        } finally {
            setFetching(false);
        }
    };

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
        if (!formData.content?.trim()) {
            showToast.error('Post content is required');
            return;
        }

        if (!formData.platform) {
            showToast.error('Please select a platform');
            return;
        }

        // Check character limit based on platform
        const charLimit = getPlatformCharLimit(formData.platform);
        if (formData.content && formData.content.length > charLimit) {
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

            // Prepare payload
            const payload: any = {
                content: formData.content,
                platform: formData.platform,
                status: formData.status,
                scheduledDate: formData.scheduledDate || null,
                imageUrl: formData.imageUrl || null,
                videoUrl: formData.videoUrl || null,
                linkUrl: formData.linkUrl || null,
                location: formData.location || null,
                hashtags: formData.hashtags || null,
            };

            // Handle hashtags - convert comma-separated string to space-separated
            if (formData.hashtags) {
                payload.hashtags = formData.hashtags
                    .split(',')
                    .map((h: string) => h.trim())
                    .filter((h: string) => h.length > 0)
                    .join(' ');
            }

            await updateSocialPost(postId!, payload);
            showToast.success('Social post updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating social post:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update social post';
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
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

    const isPublished = originalPost?.status === 'Published';

    if (!isOpen) return null;

    const charLimit = getPlatformCharLimit(formData.platform || 'Facebook');
    const isOverLimit = (formData.content?.length || 0) > charLimit;
    const hasChanges = () => {
        if (!originalPost) return false;
        return (
            formData.content !== originalPost.content ||
            formData.platform !== originalPost.platform ||
            formData.status !== originalPost.status ||
            formData.scheduledDate !== (originalPost.scheduledDate || '') ||
            formData.imageUrl !== (originalPost.imageUrl || '') ||
            formData.videoUrl !== (originalPost.videoUrl || '') ||
            formData.linkUrl !== (originalPost.linkUrl || '') ||
            formData.location !== (originalPost.location || '') ||
            formData.hashtags !== (originalPost.hashtags || '')
        );
    };

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
                {fetching ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Edit3 className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Edit Social Post</h2>
                                    <p className="text-sm text-gray-500">
                                        Update your social media post
                                        {originalPost?.campaignId && (
                                            <span className="text-indigo-600"> for campaign</span>
                                        )}
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

                        {/* Status banner for published posts */}
                        {isPublished && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800 flex items-center gap-2">
                                    <span>⚠️</span>
                                    This post has been published. Editing will update the published post.
                                </p>
                            </div>
                        )}

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
                                    {getPlatformIcon(formData.platform || 'Facebook')}
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
                                    value={formData.content || ''}
                                    onChange={handleChange}
                                    placeholder={`Write your ${formData.platform} post content...`}
                                    className={`mt-1 min-h-[120px] ${isOverLimit ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    required
                                />
                                <div className="text-xs mt-1 flex justify-between">
                                    <span className={isOverLimit ? 'text-red-500' : 'text-gray-500'}>
                                        {formData.content?.length || 0} / {charLimit} characters
                                    </span>
                                    {isOverLimit && (
                                        <span className="text-red-500">⚠️ Exceeds character limit</span>
                                    )}
                                    {!isOverLimit && (formData.content?.length || 0) > charLimit * 0.8 && (
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
                                    value={formData.hashtags || ''}
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
                                        value={formData.imageUrl || ''}
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
                                        value={formData.videoUrl || ''}
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
                                        value={formData.linkUrl || ''}
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
                                        value={formData.location || ''}
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
                                            <SelectItem value="Published">Published</SelectItem>
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
                                        value={formData.scheduledDate || ''}
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

                            {/* Original post info */}
                            {originalPost && (
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
                                    <p>
                                        Created: {new Date(originalPost.createdAt).toLocaleString()}
                                        {originalPost.updatedAt && originalPost.updatedAt !== originalPost.createdAt && (
                                            <span className="ml-4">
                                                Last updated: {new Date(originalPost.updatedAt).toLocaleString()}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}

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
                                    disabled={loading || isOverLimit || !hasChanges()}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Update Post
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default EditSocialPostModal;