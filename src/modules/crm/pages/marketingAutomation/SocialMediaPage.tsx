// src/pages/crm/marketingAutomation/SocialMediaPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Share2,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Copy,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Loader2,
    FileText,
    Instagram,
    Twitter,
    Facebook,
    Linkedin,
    Youtube,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { showToast } from '@/shared/layout/layout';

// Import modals
import AddSocialPostModal from '@/modules/crm/components/marketingAutomation/AddSocialPostModal';
import ViewSocialPostModal from '@/modules/crm/components/marketingAutomation/ViewSocialPostModal';
import EditSocialPostModal from '@/modules/crm/components/marketingAutomation/EditSocialPostModal';

// Import API functions from crm.api
import {
    getSocialPosts,
    deleteSocialPost,
    duplicateSocialPost,
} from '@/modules/crm/services/crm.api';

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

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};

const getPlatformIcon = (platform: string) => {
    const icons: Record<string, React.ReactNode> = {
        'Facebook': <Facebook className="h-4 w-4 text-blue-600" />,
        'Twitter': <Twitter className="h-4 w-4 text-blue-400" />,
        'Instagram': <Instagram className="h-4 w-4 text-pink-600" />,
        'LinkedIn': <Linkedin className="h-4 w-4 text-blue-700" />,
        'YouTube': <Youtube className="h-4 w-4 text-red-600" />,
    };
    return icons[platform] || <Share2 className="h-4 w-4 text-gray-400" />;
};

const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
        'Facebook': 'bg-blue-100 text-blue-700 border-blue-200',
        'Twitter': 'bg-blue-50 text-blue-500 border-blue-100',
        'Instagram': 'bg-pink-100 text-pink-700 border-pink-200',
        'LinkedIn': 'bg-blue-100 text-blue-700 border-blue-200',
        'YouTube': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[platform] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
        'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
        'Scheduled': 'bg-purple-100 text-purple-700 border-purple-200',
        'Published': 'bg-green-100 text-green-700 border-green-200',
        'Failed': 'bg-red-100 text-red-700 border-red-200',
        'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Draft': return <FileText className="h-3 w-3" />;
        case 'Scheduled': return <Calendar className="h-3 w-3" />;
        case 'Published': return <CheckCircle className="h-3 w-3" />;
        case 'Failed': return <XCircle className="h-3 w-3" />;
        case 'Pending': return <Clock className="h-3 w-3" />;
        default: return <MessageSquare className="h-3 w-3" />;
    }
};

const SocialMediaPage: React.FC = () => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [currentPage, filterPlatform, filterStatus, searchTerm]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
            };
            if (filterPlatform !== 'all') params.platform = filterPlatform;
            if (filterStatus !== 'all') params.status = filterStatus;
            if (searchTerm) params.search = searchTerm;

            const response = await getSocialPosts(params);
            // Handle both response formats
            const data = response.data?.data || response.data || [];
            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching social posts:', error);
            showToast.error('Failed to load social posts');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSuccess = () => {
        fetchPosts();
    };

    const handleEditSuccess = () => {
        fetchPosts();
        setIsEditModalOpen(false);
        setSelectedPostId(null);
    };

    const handleDelete = async () => {
        if (!selectedPost) return;
        try {
            setIsProcessing(true);
            await deleteSocialPost(selectedPost.id);
            showToast.success('Social post deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedPost(null);
            fetchPosts();
        } catch (error) {
            showToast.error('Failed to delete social post');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDuplicate = async () => {
        if (!selectedPost) return;
        try {
            setIsProcessing(true);
            await duplicateSocialPost(selectedPost.id);
            showToast.success('Social post duplicated successfully');
            setIsDuplicateModalOpen(false);
            setSelectedPost(null);
            fetchPosts();
        } catch (error) {
            showToast.error('Failed to duplicate social post');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleView = (post: SocialPost) => {
        setSelectedPostId(post.id);
        setIsViewModalOpen(true);
    };

    const handleEdit = (post: SocialPost) => {
        setSelectedPostId(post.id);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (post: SocialPost) => {
        setSelectedPost(post);
        setIsDeleteModalOpen(true);
    };

    const handleDuplicateClick = (post: SocialPost) => {
        setSelectedPost(post);
        setIsDuplicateModalOpen(true);
    };

    const filteredPosts = posts.filter(post => {
        const search = searchTerm.toLowerCase();
        return post.content?.toLowerCase().includes(search) ||
            post.platform?.toLowerCase().includes(search);
    });

    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'Published').length,
        scheduled: posts.filter(p => p.status === 'Scheduled').length,
        draft: posts.filter(p => p.status === 'Draft').length,
        pending: posts.filter(p => p.status === 'Pending').length,
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterPlatform('all');
        setFilterStatus('all');
        setCurrentPage(1);
        fetchPosts();
    };

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-32 mt-1" /></div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex-1"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32 mt-1" /></div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-16" /><Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Share2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
                        <p className="text-sm text-gray-500">Manage and schedule social media posts</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={fetchPosts}
                    >
                        <RefreshCw size={16} /> Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={16} />
                        New Post
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total', value: stats.total, icon: Share2, color: 'blue' },
                    { title: 'Published', value: stats.published, icon: CheckCircle, color: 'green' },
                    { title: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'purple' },
                    { title: 'Draft', value: stats.draft, icon: FileText, color: 'orange' },
                ].map((stat, index) => (
                    <Card key={index} className={`bg-gradient-to-r from-${stat.color}-50 to-${stat.color}-100 border-${stat.color}-200`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm text-${stat.color}-700 font-medium`}>{stat.title}</p>
                                    <p className={`text-2xl font-bold text-${stat.color}-900`}>{stat.value}</p>
                                </div>
                                <div className={`p-3 bg-${stat.color}-200 rounded-lg`}>
                                    <stat.icon className={`h-6 w-6 text-${stat.color}-700`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search social posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        {['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube'].map((platform) => (
                            <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {['Draft', 'Scheduled', 'Pending', 'Published', 'Failed', 'Cancelled'].map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedPosts.length === 0 ? (
                    <div className="text-center py-12">
                        <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No social posts found</h3>
                        <p className="text-gray-500">Create your first social media post.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Post
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Engagement</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reach</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 max-w-xs truncate">{post.content}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getPlatformColor(post.platform)}>
                                                <span className="flex items-center gap-1">
                                                    {getPlatformIcon(post.platform)} {post.platform}
                                                </span>
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={`${getStatusBadge(post.status)} flex items-center gap-1 w-fit`}>
                                            {getStatusIcon(post.status)} {post.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-indigo-600">
                                        {post.engagementCount || post.likeCount || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {post.reachCount || 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDate(post.scheduledDate)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleView(post)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                                </DropdownMenuItem>
                                                {/* Edit is now always visible for all posts */}
                                                <DropdownMenuItem onClick={() => handleEdit(post)}>
                                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicateClick(post)}>
                                                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteClick(post)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {paginatedPosts.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Social Post Modal */}
            <AddSocialPostModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            {/* View Social Post Modal */}
            <ViewSocialPostModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedPostId(null);
                }}
                postId={selectedPostId}
            />

            {/* Edit Social Post Modal */}
            <EditSocialPostModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPostId(null);
                }}
                onSuccess={handleEditSuccess}
                postId={selectedPostId}
            />

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" /> Delete Social Post
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this social post? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPost && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium max-w-xs truncate">{selectedPost.content}</p>
                                <p className="text-sm text-gray-500">{selectedPost.platform}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
                            {isProcessing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</>
                            ) : (
                                <><Trash2 className="h-4 w-4 mr-2" /> Delete Post</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Duplicate Modal */}
            <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600">
                            <Copy className="h-5 w-5" /> Duplicate Social Post
                        </DialogTitle>
                        <DialogDescription>
                            Create a copy of this social post with all its settings.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPost && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium max-w-xs truncate">{selectedPost.content}</p>
                                <p className="text-sm text-gray-500">{selectedPost.platform}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDuplicateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleDuplicate} disabled={isProcessing}>
                            {isProcessing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Duplicating...</>
                            ) : (
                                <><Copy className="h-4 w-4 mr-2" /> Duplicate Post</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default SocialMediaPage;