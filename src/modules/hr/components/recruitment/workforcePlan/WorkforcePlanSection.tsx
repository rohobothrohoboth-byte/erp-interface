import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import WorkforcePlanHeader from '@/modules/hr/components/recruitment/workforcePlan/WorkforcePlanHeader';
import WorkforcePlanSearchFilter from '@/modules/hr/components/recruitment/workforcePlan/WorkforcePlanSearchFilter';
import WorkforcePlanTable from '@/modules/hr/components/recruitment/workforcePlan/WorkforcePlanTable';
import AddWorkforcePlanModal from '@/modules/hr/components/recruitment/workforcePlan/AddWorkforcePlanModal';
import EditWorkforcePlanModal from '@/modules/hr/components/recruitment/workforcePlan/EditWorkforcePlanModal';
import DeleteWorkforcePlanModal from '@/modules/hr/components/recruitment/workforcePlan/DeleteWorkforcePlanModal';
import WorkforcePlanReviewModal from '@/modules/hr/components/recruitment/workforcePlan/WorkforcePlanReviewModal';
import {
  useWorkforcePlans,
  useCreateWorkforcePlan,
  useUpdateWorkforcePlan,
  useDeleteWorkforcePlan,
} from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import type { WorkforcePlanListDto, WorkforcePlanAddDto, WorkforcePlanModDto } from '@/modules/hr/types/recruit/workforcePlan';

const WorkforcePlanSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkforcePlanListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<WorkforcePlanListDto | null>(null);
  const [reviewingItem, setReviewingItem] = useState<WorkforcePlanListDto | null>(null);

  const { data: items = [], isLoading, error } = useWorkforcePlans();

  const createMutation = useCreateWorkforcePlan({
    onSuccess: () => { showToast.success('Workforce plan added successfully'); setIsAddOpen(false); },
    onError: (e) => showToast.error(e.message || 'Failed to add workforce plan'),
  });

  const updateMutation = useUpdateWorkforcePlan({
    onSuccess: () => { showToast.success('Workforce plan updated successfully'); setEditingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to update workforce plan'),
  });

  const deleteMutation = useDeleteWorkforcePlan({
    onSuccess: () => { showToast.success('Workforce plan deleted successfully'); setDeletingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to delete workforce plan'),
  });

  const filtered = items.filter((i) => {
    const matchSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.planCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = (data: WorkforcePlanAddDto) => createMutation.mutate(data);

  const handleEdit = (data: WorkforcePlanModDto) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id);
  };

  if (error) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading workforce plans: {error.message}</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      <WorkforcePlanHeader />
      <WorkforcePlanSearchFilter
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        onAddClick={() => setIsAddOpen(true)}
      />
      <WorkforcePlanTable
        items={filtered} isLoading={isLoading}
        onEdit={setEditingItem} onDelete={setDeletingItem} onReview={setReviewingItem}
      />
      <AddWorkforcePlanModal
        isOpen={isAddOpen} isLoading={createMutation.isPending}
        onClose={() => setIsAddOpen(false)} onSubmit={handleAdd}
      />
      <EditWorkforcePlanModal
        isOpen={!!editingItem} item={editingItem} isLoading={updateMutation.isPending}
        onClose={() => setEditingItem(null)} onSubmit={handleEdit}
      />
      <DeleteWorkforcePlanModal
        isOpen={!!deletingItem} title={deletingItem?.title ?? ''} isLoading={deleteMutation.isPending}
        onClose={() => setDeletingItem(null)} onConfirm={handleDelete}
      />
      <WorkforcePlanReviewModal
        isOpen={!!reviewingItem} item={reviewingItem}
        onClose={() => setReviewingItem(null)}
      />
    </motion.section>
  );
};

export default WorkforcePlanSection;
