// src/components/crm/marketing/components/DeleteSocialPostModal.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    AlertTriangle,
    Loader2,
    Trash2,
    Share2,
    Instagram,
    Twitter,
    Facebook,
    Linkedin,
    Youtube,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { showToast } from '@/shared/layout/layout';
import { deleteSocialPost } from '@/modules/crm/services/crm.api';
import type { SocialPost } from '@/modules/crm/types/crm.types';

interface DeleteSocialPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    post: SocialPost | null;
}

const DeleteSocialPostModal: React.FC<DeleteSocialPostModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         onSuccess,
                                                                         post,
                                                                     }) => {
    const [loading, setLoading] = useState(false);

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

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
            'Draft': 'bg-gray-100 text-gray-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Scheduled': 'bg-blue-100 text-blue-800',
            'Published': 'bg-green-100 text-green-800',
            'Failed': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const handleDelete = async () => {
        if (!post) return;

        try {
            setLoading(true);
            await deleteSocialPost(post.id);
            showToast.success('Social post deleted successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error deleting social post:', error);
            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.errors
                || 'Failed to delete social post';
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !post) return null;

    const isPublished = post.status === 'Published';
    const isScheduled = post.status === 'Scheduled';

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
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Social Post</h3>
                    <p className="text-gray-500 mb-4">
                        Are you sure you want to delete this social media post? This action cannot be undone.
                    </p>

                    {/* Post Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            {getPlatformIcon(post.platform)}
                            <span className="font-medium text-gray-900">{post.platform}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(post.status)}`}>
                                {post.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                            {post.content}
                        </p>
                        {post.hashtags && (
                            <p className="text-xs text-gray-500 mt-1">
                                {post.hashtags.split(' ').map(tag => `#${tag}`).join(' ')}
                            </p>
                        )}
                    </div>

                    {/* Warnings */}
                    {isPublished && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
                            <p className="text-sm text-yellow-800">
                                ⚠️ This post has already been published. Deleting it will remove it from the platform.
                            </p>
                        </div>
                    )}

                    {isScheduled && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-left">
                            <p className="text-sm text-blue-800">
                                📅 This post is scheduled for {new Date(post.scheduledDate!).toLocaleString()}.
                                Deleting it will cancel the scheduled publication.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="min-w-[100px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 min-w-[100px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DeleteSocialPostModal;