import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/button';
import { showToast } from '../../../../layout/layout';
import JobRequisitionSearchFilter from './JobRequisitionSearchFilter';
import JobRequisitionTable from './JobRequisitionTable';
import AddJobRequisitionModal from './AddJobRequisitionModal';
import EditJobRequisitionModal from './EditJobRequisitionModal';
import DeleteJobRequisitionModal from './DeleteJobRequisitionModal';
import JobRequisitionReviewModal from './JobRequisitionReviewModal';
import AddJobPostingModal from '../jobPosting/AddJobPostingModal';
import {
  useJobRequisitions,
  useCreateJobRequisition,
  useUpdateJobRequisition,
  useDeleteJobRequisition,
} from '../../../../services/hr/recruitment/jobRequisition/jobRequisition.queries';
import { useCreateJobPosting } from '../../../../services/hr/recruitment/jobPosting/jobPosting.queries';
import type { JobReqListDto, JobReqAddDto, JobReqModDto, UUID } from '../../../../types/hr/recruit/jobRequisition';

interface JobRequisitionSectionProps {
  workforcePlanId: UUID;
  workforcePlanCode?: string;
}

const JobRequisitionSection: React.FC<JobRequisitionSectionProps> = ({ workforcePlanId, workforcePlanCode }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobReqListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<JobReqListDto | null>(null);
  const [reviewingItem, setReviewingItem] = useState<JobReqListDto | null>(null);
  const [postingItem, setPostingItem] = useState<JobReqListDto | null>(null);

 const {
   data: allItems = [],
   isLoading,
   error,
 } = useJobRequisitions(workforcePlanId, {
   search: searchTerm,
   status: statusFilter,
 });

  // Filter to only this workforce plan's requisitions
  const items = allItems.filter((i) => i.workforcePlanId === workforcePlanId);

  const createMutation = useCreateJobRequisition({
    onSuccess: () => { showToast.success('Job requisition added successfully'); setIsAddOpen(false); },
    onError: (e) => showToast.error(e.message || 'Failed to add job requisition'),
  });

  const updateMutation = useUpdateJobRequisition({
    onSuccess: () => { showToast.success('Job requisition updated successfully'); setEditingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to update job requisition'),
  });

  const createPostingMutation = useCreateJobPosting({
    onSuccess: () => { showToast.success('Job posting created successfully'); setPostingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to create job posting'),
  });

  const deleteMutation = useDeleteJobRequisition({
    onSuccess: () => { showToast.success('Job requisition deleted successfully'); setDeletingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to delete job requisition'),
  });

 const filtered = allItems.filter((i) => {
   const matchSearch =
     i.reqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     i.reqReason.toLowerCase().includes(searchTerm.toLowerCase());
   const matchStatus = !statusFilter || i.statusStr === statusFilter;
   return matchSearch && matchStatus;
 });

  const handleAdd = (data: JobReqAddDto) =>
    createMutation.mutate({ ...data, workforcePlanId });

  const handleEdit = (data: JobReqModDto) => updateMutation.mutate(data);

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id);
  };

  if (error) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading job requisitions: {error.message}</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Job Requisitions
              </span>
            </h1>
            {workforcePlanCode && (
              <p className="text-sm text-gray-500">Workforce Plan: {workforcePlanCode}</p>
            )}
          </div>
        </div>
      </div>

      <JobRequisitionSearchFilter
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        onAddClick={() => setIsAddOpen(true)}
        onViewPostings={() => navigate(`/hr/recruitment/workforce-plan/${workforcePlanId}/postings`)}
      />
      <JobRequisitionTable
        items={filtered} isLoading={isLoading}
        onEdit={setEditingItem} onDelete={setDeletingItem}
        onReview={setReviewingItem} onPost={setPostingItem}
      />
      <AddJobRequisitionModal
        isOpen={isAddOpen} isLoading={createMutation.isPending}
        workforcePlanId={workforcePlanId}
        onClose={() => setIsAddOpen(false)} onSubmit={handleAdd}
      />
      <EditJobRequisitionModal
        isOpen={!!editingItem} item={editingItem} isLoading={updateMutation.isPending}
        onClose={() => setEditingItem(null)} onSubmit={handleEdit}
      />
      <DeleteJobRequisitionModal
        isOpen={!!deletingItem} reqNumber={deletingItem?.reqNumber ?? ''} isLoading={deleteMutation.isPending}
        onClose={() => setDeletingItem(null)} onConfirm={handleDelete}
      />
      <JobRequisitionReviewModal
        isOpen={!!reviewingItem} item={reviewingItem}
        onClose={() => setReviewingItem(null)}
      />
      <AddJobPostingModal
        isOpen={!!postingItem}
        reqId={postingItem?.id ?? ''}
        isLoading={createPostingMutation.isPending}
        onClose={() => setPostingItem(null)}
        onSubmit={(data) => createPostingMutation.mutate(data)}
      />
    </motion.section>
  );
};

export default JobRequisitionSection;
