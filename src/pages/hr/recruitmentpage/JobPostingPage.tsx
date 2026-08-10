// src/pages/hr/recruitment/JobPostingsPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Plus, Search, RefreshCw, Loader2,
  Eye, Edit, Trash2, CheckCircle, XCircle, Clock,
  Calendar, Users, MapPin, Building2, Send,
  MoreVertical, Filter, ChevronDown, Download
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { useJobPostings, useDeleteJobPosting } from '../../../services/hr/recruitment/jobPosting/jobPosting.queries';
import { usePublishJobPosting, useCloseJobPosting } from '../../../services/hr/recruitment/JobPublish/jobPublish.queries';
import { useAuthStore } from '../../../stores/auth.store';
import { format, differenceInDays, isBefore } from 'date-fns';
import toast from 'react-hot-toast';

const JobPostingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPosting, setSelectedPosting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const { data: postings, isLoading, refetch } = useJobPostings();
  const deleteMutation = useDeleteJobPosting({
    onSuccess: () => {
      toast.success('Job posting deleted successfully');
      setShowDeleteModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete job posting');
    }
  });
  const publishMutation = usePublishJobPosting({
    onSuccess: () => {
      toast.success('Job posting published successfully');
      setShowPublishModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to publish job posting');
    }
  });
  const closeMutation = useCloseJobPosting({
    onSuccess: () => {
      toast.success('Job posting closed successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to close job posting');
    }
  });

  const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

  const filteredPostings = postings?.filter(posting => {
    const matchesTab = activeTab === 'all' || posting.statusStr?.toLowerCase() === activeTab;
    const matchesSearch = posting.postNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        posting.reqNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: postings?.length || 0,
    published: postings?.filter(p => p.statusStr === 'Published').length || 0,
    draft: postings?.filter(p => p.statusStr === 'Draft').length || 0,
    closed: postings?.filter(p => p.statusStr === 'Closed').length || 0,
    expired: postings?.filter(p => p.statusStr === 'Expired').length || 0,
  };

  const getStatusBadge = (status: string, deadlineDate?: string) => {
    if (status === 'Closed') {
      return <Badge className="bg-gray-100 text-gray-700">Closed</Badge>;
    }
    if (status === 'Expired') {
      return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
    }
    if (status === 'Published' && deadlineDate) {
      const deadline = new Date(deadlineDate);
      const now = new Date();
      if (isBefore(deadline, now)) {
        return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
      }
      if (differenceInDays(deadline, now) <= 7) {
        return <Badge className="bg-yellow-100 text-yellow-700">Closing Soon</Badge>;
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

  const handleDelete = async () => {
    if (selectedPosting) {
      await deleteMutation.mutateAsync(selectedPosting);
    }
  };

  const handlePublish = async () => {
    if (selectedPosting) {
      await publishMutation.mutateAsync({ id: selectedPosting, comment: '' });
    }
  };

  const handleClose = async (id: string) => {
    if (window.confirm('Are you sure you want to close this job posting?')) {
      await closeMutation.mutateAsync(id);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all job postings and applications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
            {isHR && (
                <Button onClick={() => navigate('/recruitment/job-posting/new')} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Posting
                </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Postings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-yellow-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Draft</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-red-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Closed/Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.closed + stats.expired}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
                  <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
                  <TabsTrigger value="closed">Closed ({stats.closed})</TabsTrigger>
                  <TabsTrigger value="expired">Expired ({stats.expired})</TabsTrigger>
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

        <div className="space-y-4">
          {filteredPostings && filteredPostings.length > 0 ? (
              filteredPostings.map((posting, index) => (
                  <motion.div
                      key={posting.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-lg font-semibold text-gray-900">{posting.postNumber}</h3>
                                  {getStatusBadge(posting.statusStr, posting.deadlineDateStr)}
                                  <span className="text-xs text-gray-400 font-mono">Req: {posting.reqNumber}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{posting.reqAppQuan || 'No applications'}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Published: {posting.publishedDateStr ? formatDate(posting.publishedDateStr) : 'N/A'}
                            </span>
                                  <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Deadline: {posting.deadlineDateStr ? formatDate(posting.deadlineDateStr) : 'N/A'}
                            </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/recruitment/job-posting/${posting.id}`)}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                            {isHR && posting.statusStr === 'Draft' && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPosting(posting.id);
                                      setShowPublishModal(true);
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                  <Send className="w-3.5 h-3.5 mr-1" />
                                  Publish
                                </Button>
                            )}
                            {isHR && posting.statusStr === 'Published' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleClose(posting.id)}
                                    className="text-orange-600"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Close
                                </Button>
                            )}
                            {isHR && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/recruitment/job-posting/edit/${posting.id}`)}
                                    className="text-blue-600"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                            )}
                            {isHR && posting.statusStr !== 'Published' && posting.statusStr !== 'Closed' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPosting(posting.id);
                                      setShowDeleteModal(true);
                                    }}
                                    className="text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
              ))
          ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No job postings found</p>
                  <p className="text-sm text-gray-400">Create a new job posting to get started</p>
                </CardContent>
              </Card>
          )}
        </div>

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
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <Button onClick={handlePublish} disabled={publishMutation.isPending} className="bg-green-600 hover:bg-green-700">
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