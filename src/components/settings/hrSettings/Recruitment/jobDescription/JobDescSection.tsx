import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import JobDescHeader from './JobDescHeader';
import JobDescSearchFilter from './JobDescSearchFilter';
import JobDescTable from './JobDescTable';
import AddJobDescModal from './AddJobDescModal';
import EditJobDescModal from './EditJobDescModal';
import DeleteJobDescModal from './DeleteJobDescModal';
import type { JobDescriptionListDto, JobDescriptionAddDto } from '../../../../../types/hr/jobDescription';

const mockData: JobDescriptionListDto[] = [
  {
    id: crypto.randomUUID(),
    title: 'Senior Software Engineer',
    department: 'Engineering',
    responsibilities: 'Lead development of core platform features.',
    requirements: '5+ years experience in React and Node.js.',
    isActive: true,
    isDeleted: false,
    rowVersion: '',
    createdAt: new Date().toISOString(),
    createdAtAm: '',
    modifiedAt: new Date().toISOString(),
    modifiedAtAm: '',
  },
  {
    id: crypto.randomUUID(),
    title: 'HR Business Partner',
    department: 'Human Resources',
    responsibilities: 'Partner with business units on HR strategy.',
    requirements: '3+ years in HR with CIPD qualification.',
    isActive: true,
    isDeleted: false,
    rowVersion: '',
    createdAt: new Date().toISOString(),
    createdAtAm: '',
    modifiedAt: new Date().toISOString(),
    modifiedAtAm: '',
  },
];

const JobDescSection: React.FC = () => {
  const [items, setItems] = useState<JobDescriptionListDto[]>(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobDescriptionListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<JobDescriptionListDto | null>(null);

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: JobDescriptionAddDto) => {
    const newItem: JobDescriptionListDto = {
      ...data,
      id: crypto.randomUUID(),
      isDeleted: false,
      rowVersion: '',
      createdAt: new Date().toISOString(),
      createdAtAm: '',
      modifiedAt: new Date().toISOString(),
      modifiedAtAm: '',
    };
    setItems(prev => [...prev, newItem]);
    showToast.success('Job description added successfully');
    setIsAddOpen(false);
  };

  const handleEdit = (data: JobDescriptionAddDto) => {
    if (!editingItem) return;
    setItems(prev => prev.map(i =>
      i.id === editingItem.id ? { ...i, ...data, modifiedAt: new Date().toISOString() } : i
    ));
    showToast.success('Job description updated successfully');
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    showToast.success('Job description deleted successfully');
    setDeletingItem(null);
  };

  const handleToggleActive = (item: JobDescriptionListDto) => {
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, isActive: !i.isActive } : i
    ));
    showToast.success(`Job description ${item.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <JobDescHeader />
      <JobDescSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddOpen(true)}
      />
      <JobDescTable
        items={filtered}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
        onToggleActive={handleToggleActive}
      />

      <AddJobDescModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
      <EditJobDescModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
      />
      <DeleteJobDescModal
        isOpen={!!deletingItem}
        title={deletingItem?.title ?? ''}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </motion.section>
  );
};

export default JobDescSection;
