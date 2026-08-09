// src/components/crm/marketing/SocialMediaPostCard.tsx

import React from 'react';
import { SocialMediaPostViewModel, SocialMediaPostCardProps } from '../../../types/crm/social-media.types';
import { Calendar, Edit2, Trash2, Send, XCircle, Eye } from 'lucide-react';

export const SocialMediaPostCard: React.FC<SocialMediaPostCardProps> = ({
                                                                            post,
                                                                            onEdit,
                                                                            onDelete,
                                                                            onPublish,
                                                                            onCancel,
                                                                            onViewAnalytics,
                                                                        }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{post.platformIcon}</span>
                    <div>
                        <h3 className="font-semibold text-gray-900">{post.platformDisplay}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{post.timeAgo}</span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${post.statusBadge}`}>
                                {post.statusDisplay}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {post.canPublish && (
                        <button
                            onClick={() => onPublish?.(post.id)}
                            className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"
                            title="Publish"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    )}
                    {post.canCancel && (
                        <button
                            onClick={() => onCancel?.(post.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                            title="Cancel"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                    )}
                    {post.isEditable && (
                        <button
                            onClick={() => onEdit?.(post.id)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
                            title="Edit"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onViewAnalytics?.(post.id)}
                        className="p-1.5 hover:bg-purple-50 rounded-lg text-purple-600"
                        title="Analytics"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    {post.isDeletable && (
                        <button
                            onClick={() => onDelete?.(post.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{post.content}</p>

            {/* Hashtags */}
            {post.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-sm text-blue-600">{tag}</span>
                    ))}
                </div>
            )}

            {/* Media Preview */}
            {post.imageUrl && (
                <div className="mt-3">
                    <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="rounded-lg max-h-48 w-full object-cover"
                    />
                </div>
            )}

            {/* Location */}
            {post.location && (
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                    <span>📍</span>
                    {post.location}
                </div>
            )}

            {/* Schedule Info */}
            {post.scheduledDate && (
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Scheduled: {post.scheduledDateDisplay}
                </div>
            )}

            {/* Engagement Metrics */}
            {(post.likeCount > 0 || post.shareCount > 0 || post.commentCount > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
                    {post.likeCount > 0 && (
                        <span>❤️ {post.likeDisplay}</span>
                    )}
                    {post.shareCount > 0 && (
                        <span>🔄 {post.shareDisplay}</span>
                    )}
                    {post.commentCount > 0 && (
                        <span>💬 {post.commentDisplay}</span>
                    )}
                    {post.engagementCount > 0 && (
                        <span className="text-gray-400">Engagement: {post.engagementDisplay}</span>
                    )}
                </div>
            )}

            {/* Character Count */}
            <div className="mt-2 text-xs text-gray-400">
                {post.characterCount} / {post.characterLimit} characters
                {post.isOverLimit && ' ⚠️ Over limit'}
            </div>
        </div>
    );
};