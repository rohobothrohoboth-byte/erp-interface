import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/button';
import { showToast } from '../../../../layout/layout';
import JobPostingSearchFilter from './JobPostingSearchFilter';
import JobPostingTable from './JobPostingTable';
import AddJobPostingModal from './AddJobPostingModal';
import EditJobPostingModal from './EditJobPostingModal';
import DeleteJobPostingModal from './DeleteJobPostingModal';
import type { JobPostingListDto, JobPostingAddDto, JobPostingModDto } from '../../../../types/hr/recruit/jobPosting';

interface JobPostingSectionProps {
  reqId: string;
  reqNumber?: string;
}

const JobPostingSection: React.FC<JobPostingSectionProps> = ({ reqId, reqNumber }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<JobPostingListDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobPostingListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<JobPostingListDto | null>(null);

  const filtered = items.filter((i) => {
    const matchSearch = i.postNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.reqNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    const matchType = !typeFilter || i.postType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleAdd = (data: JobPostingAddDto) => {
    const newItem: JobPostingListDto = {
      id: data.id,
      isDeleted: false, rowVersion: '',
      createdAt: new Date().toISOString(), createdAtAm: '',
      modifiedAt: new Date().toISOString(), modifiedAtAm: '',
      postNumber: `POST-${new Date().getFullYear()}-${String(items.length + 1).padStart(3, '0')}`,
      reqNumber: reqNumber ?? '',
      status: '0' as any, postType: data.postType,
      statusStr: 'Draft', postTypeStr: '',
      publishedDate: new Date().toISOString(),
      deadlineDate: data.deadlineDate,
      reqAppQuan: '0/0',
    };
    setItems(prev => [...prev, newItem]);
    showToast.success('Job posting added successfully');
    setIsAddOpen(false);
  };

  const handleEdit = (data: JobPostingModDto) => {
    setItems(prev => prev.map(i =>
      i.id === data.id ? { ...i, status: data.status, postType: data.postType, deadlineDate: data.deadlineDate } : i
    ));
    showToast.success('Job posting updated successfully');
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    showToast.success('Job posting deleted successfully');
    setDeletingItem(null);
  };

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      {/* Header */}
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
          </div>
        </div>
      </div>

      <JobPostingSearchFilter
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        onAddClick={() => setIsAddOpen(true)}
      />
      <JobPostingTable items={filtered} onEdit={setEditingItem} onDelete={setDeletingItem} />
      <AddJobPostingModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleAdd} />
      <EditJobPostingModal isOpen={!!editingItem} item={editingItem} onClose={() => setEditingItem(null)} onSubmit={handleEdit} />
      <DeleteJobPostingModal isOpen={!!deletingItem} postNumber={deletingItem?.postNumber ?? ''}
        onClose={() => setDeletingItem(null)} onConfirm={handleDelete} />
    </motion.section>
  );
};

export default JobPostingSection;
