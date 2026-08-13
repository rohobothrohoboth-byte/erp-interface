// src/pages/hr/recruitmentpage/jobPosting/JobPostingsPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Megaphone,
    Plus,
    Search,
    RefreshCw,
    Loader2,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Calendar,
    Users,
    Send,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { useJobPostings, useDeleteJobPosting } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.queries';
import { usePublishJobPosting, useCloseJobPosting } from '@/modules/hr/services/recruitment/JobPublish/jobPublish.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import JobPostingTable from '@/modules/hr/components/recruitment/jobPosting/JobPostingTable';

const JobPostingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedPosting, setSelectedPosting] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);

    const { data: postings = [], isLoading, refetch } = useJobPostings();
    const deleteMutation = useDeleteJobPosting({
        onSuccess: () => {
            toast.success('Job posting deleted successfully');
            setShowDeleteModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to delete job posting'),
    });
    const publishMutation = usePublishJobPosting({
        onSuccess: () => {
            toast.success('Job posting published successfully');
            setShowPublishModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to publish job posting'),
    });
    const closeMutation = useCloseJobPosting({
        onSuccess: () => {
            toast.success('Job posting closed successfully');
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to close job posting'),
    });

    const isHR = ['admin','super_admin','superadmin','hr','hr manager','hrmanager','hr admin','ceo','manager','mgr'].includes((role || '').toLowerCase());

    // ✅ Filter postings based on search and tab
    const filteredPostings = postings?.filter(posting => {
        const matchesTab = activeTab === 'all' || posting.statusStr?.toLowerCase() === activeTab;
        const matchesSearch = posting.postNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            posting.reqNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            posting.position?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status: string, deadlineDate?: string) => {
        if (status === 'Closed') {
            return <Badge className="bg-gray-100 text-gray-700">Closed</Badge>;
        }
        if (status === 'Published' && deadlineDate) {
            const deadline = new Date(deadlineDate);
            const now = new Date();
            if (deadline < now) {
                return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
            }
            return <Badge className="bg-green-100 text-green-700">Published</Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
    };

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    // ✅ Handle view navigation
    const handleViewPosting = (postingId: string) => {
        navigate(`/hr/recruitment/posting/${postingId}`);
    };

    // ✅ Handle edit navigation
    const handleEditPosting = (postingId: string) => {
        navigate(`/hr/recruitment/posting/edit/${postingId}`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all job postings</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {isHR && (
                        <Button onClick={() => navigate('/hr/recruitment/posting/new')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            New Posting
                        </Button>
                    )}
                </div>
            </div>

            {/* Search & Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="draft">Draft</TabsTrigger>
                                <TabsTrigger value="published">Published</TabsTrigger>
                                <TabsTrigger value="closed">Closed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search postings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ✅ Use JobPostingTable */}
            <JobPostingTable
                items={filteredPostings || []}
                isLoading={isLoading}
                onEdit={(item) => handleEditPosting(item.id)}
                onDelete={(item) => {
                    setSelectedPosting(item.id);
                    setShowDeleteModal(true);
                }}
                onPublish={(item) => {
                    setSelectedPosting(item.id);
                    setShowPublishModal(true);
                }}
                onClose={(item) => closeMutation.mutate(item.id)}
                onEvalFlow={(item) => navigate(`/hr/recruitment/posting/${item.id}/eval-flow`)}
                onRowClick={(item) => handleViewPosting(item.id)}
            />

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to delete this job posting? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => selectedPosting && deleteMutation.mutate(selectedPosting)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Modal */}
            <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Publish Job Posting</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to publish this job posting? It will be visible to all applicants.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPublishModal(false)} disabled={publishMutation.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={() => selectedPosting && publishMutation.mutate({ id: selectedPosting, comment: '' })} disabled={publishMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                            {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Publish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default JobPostingsPage;