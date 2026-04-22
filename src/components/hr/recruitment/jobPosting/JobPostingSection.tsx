import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/button';
import { showToast } from '../../../../layout/layout';
import JobPostingSearchFilter from './JobPostingSearchFilter';
import JobPostingTable from './JobPostingTable';
import EditJobPostingModal from './EditJobPostingModal';
import DeleteJobPostingModal from './DeleteJobPostingModal';
import PublishJobPostingModal from './PublishJobPostingModal';
import JpEvalFlowModal from './JpEvalFlowModal';
import {
  useJobPostings,
  useUpdateJobPosting,
  useDeleteJobPosting,
  usePublishJobPosting,
  usePublishAllJobPosting,
  useCloseJobPosting,
} from '../../../../services/hr/recruitment/jobPosting/jobPosting.queries';
import { useJobRequisition } from '../../../../services/hr/recruitment/jobRequisition/jobRequisition.queries';
import type { JobPostingListDto, JobPostingModDto } from '../../../../types/hr/recruit/jobPosting';

interface JobPostingSectionProps {
  reqId: string;
  reqNumber?: string;
}

const JobPostingSection: React.FC<JobPostingSectionProps> = ({ reqId, reqNumber }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editingItem, setEditingItem] = useState<JobPostingListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<JobPostingListDto | null>(null);
  const [publishingItem, setPublishingItem] = useState<JobPostingListDto | null>(null);
  const [publishAllOpen, setPublishAllOpen] = useState(false);
  const [evalFlowItem, setEvalFlowItem] = useState<JobPostingListDto | null>(null);

  const { data: allItems = [], isLoading, error } = useJobPostings();
  // Fetch the requisition to get its reqNumber for filtering
  const { data: requisition } = useJobRequisition(reqId || undefined);

  // Filter postings that belong to this requisition by matching reqNumber
  const items = requisition?.reqNumber
    ? allItems.filter(i => i.reqNumber === requisition.reqNumber)
    : allItems;

  const filtered = items.filter((i) => {
    const matchSearch = i.postNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.reqNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || i.statusStr === statusFilter;
    const matchType = !typeFilter || i.postTypeStr === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const updateMutation = useUpdateJobPosting({
    onSuccess: () => { showToast.success('Job posting updated successfully'); setEditingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to update job posting'),
  });

  const deleteMutation = useDeleteJobPosting({
    onSuccess: () => { showToast.success('Job posting deleted successfully'); setDeletingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to delete job posting'),
  });

  const publishMutation = usePublishJobPosting({
    onSuccess: () => { showToast.success('Job posting published successfully'); setPublishingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to publish job posting'),
  });

  const publishAllMutation = usePublishAllJobPosting({
    onSuccess: () => { showToast.success('All job postings published successfully'); setPublishAllOpen(false); },
    onError: (e) => showToast.error(e.message || 'Failed to publish all job postings'),
  });

  const closeMutation = useCloseJobPosting({
    onSuccess: () => showToast.success('Job posting closed successfully'),
    onError: (e) => showToast.error(e.message || 'Failed to close job posting'),
  });

  const handleEdit = (data: JobPostingModDto) => updateMutation.mutate(data);
  const handleDelete = () => { if (!deletingItem) return; deleteMutation.mutate(deletingItem.id); };
  const handlePublish = (item: JobPostingListDto) => setPublishingItem(item);
  const handlePublishSubmit = (id: string, comment: string | null) => {
    publishMutation.mutate({ id, comment });
  };
  // Publish all — id is the workforcePlanId (from the requisition)
  const handlePublishAllSubmit = (_id: string, comment: string | null) => {
    publishAllMutation.mutate({ id: reqId, comment });
  };
  const handleClose = (item: JobPostingListDto) => closeMutation.mutate(item.id);

  if (error) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading job postings: {error.message}</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Job Postings
              </span>
            </h1>
            {reqNumber && <p className="text-sm text-gray-500">Requisition: {reqNumber}</p>}
            {!reqNumber && requisition?.reqNumber && <p className="text-sm text-gray-500">Requisition: {requisition.reqNumber}</p>}
          </div>
        </div>
      </div>

      <JobPostingSearchFilter
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        onPublishAll={() => setPublishAllOpen(true)}
        isPublishAllLoading={publishAllMutation.isPending}
      />
      <JobPostingTable
        items={filtered} isLoading={isLoading}
        onEdit={setEditingItem} onDelete={setDeletingItem}
        onPublish={handlePublish} onClose={handleClose}
        onEvalFlow={setEvalFlowItem}
      />
      <EditJobPostingModal isOpen={!!editingItem} item={editingItem}
        onClose={() => setEditingItem(null)} onSubmit={handleEdit} />
      <DeleteJobPostingModal isOpen={!!deletingItem} postNumber={deletingItem?.postNumber ?? ''}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeletingItem(null)} onConfirm={handleDelete} />
      <PublishJobPostingModal
        isOpen={!!publishingItem} item={publishingItem}
        isLoading={publishMutation.isPending}
        onClose={() => setPublishingItem(null)}
        onSubmit={handlePublishSubmit}
      />
      {/* Publish All — passes workforcePlanId (reqId) to PublishAllJobPosting */}
      <PublishJobPostingModal
        isOpen={publishAllOpen}
        item={publishAllOpen ? { id: reqId, postNumber: 'All Postings', reqNumber: requisition?.reqNumber ?? '', statusStr: '', postTypeStr: '', reqAppQuan: '' } as any : null}
        isLoading={publishAllMutation.isPending}
        onClose={() => setPublishAllOpen(false)}
        onSubmit={handlePublishAllSubmit}
      />
      <JpEvalFlowModal
        isOpen={!!evalFlowItem}
        posting={evalFlowItem}
        onClose={() => setEvalFlowItem(null)}
      />
    </motion.section>
  );
};

export default JobPostingSection;
