// src/components/crm/marketingAutomation/ViewSocialPostModal.tsx

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
    User,
    Clock,
    Eye,
    ThumbsUp,
    MessageCircle,
    Repeat,
    ExternalLink,
    FileText,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { showToast } from '../../../layout/layout';
import { getSocialPostById } from '../../../services/crm/crm.api';

interface ViewSocialPostModalProps {
    isOpen: boolean;
    onClose: () => void;
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

const ViewSocialPostModal: React.FC<ViewSocialPostModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     postId,
                                                                 }) => {
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<SocialPost | null>(null);

    useEffect(() => {
        if (isOpen && postId) {
            fetchPost();
        } else {
            setPost(null);
        }
    }, [isOpen, postId]);

    const fetchPost = async () => {
        if (!postId) return;

        try {
            setLoading(true);
            const response = await getSocialPostById(postId);
            const data = response.data?.data || response.data;
            setPost(data);
        } catch (error: any) {
            console.error('Error fetching post:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load post details';
            showToast.error(errorMessage);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        const icons: Record<string, React.ReactNode> = {
            'Facebook': <Facebook className="h-6 w-6 text-blue-600" />,
            'Twitter': <Twitter className="h-6 w-6 text-blue-400" />,
            'Instagram': <Instagram className="h-6 w-6 text-pink-600" />,
            'LinkedIn': <Linkedin className="h-6 w-6 text-blue-700" />,
            'YouTube': <Youtube className="h-6 w-6 text-red-600" />,
        };
        return icons[platform] || <Share2 className="h-6 w-6 text-gray-400" />;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
            'Published': 'bg-green-100 text-green-800 border-green-200',
            'Failed': 'bg-red-100 text-red-800 border-red-200',
            'Cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const getHashtagsArray = (hashtags: string | null) => {
        if (!hashtags) return [];
        return hashtags.split(' ').filter(h => h.length > 0);
    };

    if (!isOpen) return null;

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
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : post ? (
                    <>
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b z-10 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Share2 className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
                                        <p className="text-sm text-gray-500">
                                            View social media post information
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
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Platform & Status */}
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        {getPlatformIcon(post.platform)}
                                        <span className="text-lg font-semibold text-gray-900">
                                            {post.platform}
                                        </span>
                                    </div>
                                    {post.campaignId && (
                                        <Badge variant="outline" className="ml-2">
                                            Campaign Post
                                        </Badge>
                                    )}
                                </div>
                                <Badge className={getStatusColor(post.status)}>
                                    {post.status}
                                </Badge>
                            </div>

                            {/* Content */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start gap-2 mb-2">
                                    <FileText className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700">Content</p>
                                        <div className="mt-1">
                                            <p className="text-gray-900 whitespace-pre-wrap break-words">
                                                {post.content}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {post.content.length} characters
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hashtags */}
                            {post.hashtags && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hash className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Hashtags</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {getHashtagsArray(post.hashtags).map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Media & Links */}
                            {(post.imageUrl || post.videoUrl || post.linkUrl) && (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-700">Media & Links</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {post.imageUrl && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <Image className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">Image</span>
                                                </div>
                                                <a
                                                    href={post.imageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-indigo-600 hover:underline truncate block mt-1"
                                                >
                                                    View Image
                                                    <ExternalLink className="h-3 w-3 inline ml-1" />
                                                </a>
                                            </div>
                                        )}
                                        {post.videoUrl && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <Video className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">Video</span>
                                                </div>
                                                <a
                                                    href={post.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-indigo-600 hover:underline truncate block mt-1"
                                                >
                                                    Watch Video
                                                    <ExternalLink className="h-3 w-3 inline ml-1" />
                                                </a>
                                            </div>
                                        )}
                                        {post.linkUrl && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <Link2 className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">Link</span>
                                                </div>
                                                <a
                                                    href={post.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-indigo-600 hover:underline truncate block mt-1"
                                                >
                                                    Visit Link
                                                    <ExternalLink className="h-3 w-3 inline ml-1" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {post.location && (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Location</span>
                                    </div>
                                    <p className="text-gray-900 mt-1">{post.location}</p>
                                </div>
                            )}

                            {/* Schedule Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Scheduled Date</span>
                                    </div>
                                    <p className="text-gray-900 mt-1">
                                        {formatDate(post.scheduledDate) || 'Not scheduled'}
                                    </p>
                                </div>
                                {post.publishedDate && (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium text-gray-700">Published Date</span>
                                        </div>
                                        <p className="text-gray-900 mt-1">
                                            {formatDate(post.publishedDate)}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Created At</span>
                                    </div>
                                    <p className="text-gray-900 mt-1">
                                        {formatDate(post.createdAt)}
                                    </p>
                                </div>
                                {post.updatedAt && (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Last Updated</span>
                                        </div>
                                        <p className="text-gray-900 mt-1">
                                            {formatDate(post.updatedAt)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Engagement Metrics */}
                            {(post.likeCount > 0 || post.commentCount > 0 || post.shareCount > 0 || post.reachCount > 0) && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-3">Engagement Metrics</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {post.likeCount > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                                    <ThumbsUp className="h-4 w-4" />
                                                    <span className="text-sm">Likes</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                                    {post.likeCount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {post.commentCount > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-sm">Comments</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                                    {post.commentCount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {post.shareCount > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                                    <Repeat className="h-4 w-4" />
                                                    <span className="text-sm">Shares</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                                    {post.shareCount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {post.reachCount > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="text-sm">Reach</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                                    {post.reachCount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Post ID & Metadata */}
                            <div className="border-t pt-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Post ID: {post.id}</span>
                                    </div>
                                    {post.postId && (
                                        <div className="flex items-center gap-2">
                                            <span>Platform Post ID: {post.postId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">Post not found</p>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ViewSocialPostModal;