// src/components/hr/recruit/onboardingTask/OnboardingTaskSection.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import OnboardingTaskHeader from '@/modules/settings/components/hrSettings/Recruitment/onboardingTask/OnboardingTaskHeader';
import OnboardingTaskSearchFilter from '@/modules/settings/components/hrSettings/Recruitment/onboardingTask/OnboardingTaskSearchFilter';
import OnboardingTaskTable from '@/modules/settings/components/hrSettings/Recruitment/onboardingTask/OnboardingTaskTable';
import AddOnboardingTaskModal from '@/modules/settings/components/hrSettings/Recruitment/onboardingTask/AddOnboardingTaskModal';
import EditOnboardingTaskModal from '@/modules/settings/components/hrSettings/Recruitment/onboardingTask/EditOnboardingTaskModal';
import DeleteOnboardingTaskModal from '@/modules/settings/components/hrSettings/Recruitment/onboardingTask/DeleteOnboardingTaskModal';
import {
  useOnboardingTasks,
  useCreateOnboardingTask,
  useUpdateOnboardingTask,
  useDeleteOnboardingTask
} from '@/modules/hr/services/recruitment/onboardingTask/onboardingTask.queries';
import type {
  OnboardingTaskListDto,
  OnboardingTaskAddDto,
  OnboardingTaskModDto
} from '@/modules/hr/types/recruit/onboardingTask';
import { showToast } from '@/shared/layout/layout';

const OnboardingTaskSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OnboardingTaskListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<OnboardingTaskListDto | null>(null);

  // Fetch real data
  const { data: items = [], isLoading, error, refetch } = useOnboardingTasks();

  // Mutations
  const createMutation = useCreateOnboardingTask({
    onSuccess: () => {
      showToast.success('Task added successfully');
      setIsAddOpen(false);
      refetch();
    },
    onError: (error) => showToast.error(error.message)
  });

  const updateMutation = useUpdateOnboardingTask({
    onSuccess: () => {
      showToast.success('Task updated successfully');
      setEditingItem(null);
      refetch();
    },
    onError: (error) => showToast.error(error.message)
  });

  const deleteMutation = useDeleteOnboardingTask({
    onSuccess: () => {
      showToast.success('Task deleted successfully');
      setDeletingItem(null);
      refetch();
    },
    onError: (error) => showToast.error(error.message)
  });

  // Filter items
  const filteredItems = items.filter(item =>
      item.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleAdd = (data: OnboardingTaskAddDto) => {
    createMutation.mutate(data);
  };

  const handleEdit = (data: OnboardingTaskModDto) => {
    console.log('✏️ Editing task with data:', data); // Debug log
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id);
  };

  if (error) {
    return (
        <div className="p-6 text-center">
          <p className="text-red-600">Error: {error.message}</p>
          <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
    );
  }

  return (
      <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 space-y-6 min-h-screen p-6"
      >
        <OnboardingTaskHeader />

        <OnboardingTaskSearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={() => setIsAddOpen(true)}
        />

        <OnboardingTaskTable
            items={filteredItems}
            onEdit={setEditingItem}
            onDelete={setDeletingItem}
            isLoading={isLoading}
        />

        <AddOnboardingTaskModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSubmit={handleAdd}
            isLoading={createMutation.isPending}
            existingTasks={items}
        />

        <EditOnboardingTaskModal
            isOpen={!!editingItem}
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSubmit={handleEdit}
            isLoading={updateMutation.isPending}
        />

        <DeleteOnboardingTaskModal
            isOpen={!!deletingItem}
            taskName={deletingItem?.taskName ?? ''}
            onClose={() => setDeletingItem(null)}
            onConfirm={handleDelete}
            isLoading={deleteMutation.isPending}
        />
      </motion.section>
  );
};

export default OnboardingTaskSection;