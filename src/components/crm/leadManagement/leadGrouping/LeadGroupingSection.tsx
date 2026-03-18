import { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../layout/layout';
import LeadGroupingHeader from './LeadGroupingHeader';
import LeadGroupingSearchFilter from './LeadGroupingSearchFilter';
import LeadGroupingTable from './LeadGroupingTable';
import AddLeadGroupModal from './AddLeadGroupModal';
import LeadGroupConditionModal from './LeadGroupConditionModal';
import DeleteLeadGroupModal from './DeleteLeadGroupModal';

export interface LeadGroup {
  id: string;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
  leadCount: number;
  createdAt: string;
  updatedAt: string;
}

const mockLeadGroups: LeadGroup[] = [
  {
    id: '1',
    name: 'High Value Prospects',
    code: 'HVP',
    status: 'Active',
    leadCount: 45,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Website Leads',
    code: 'WEB',
    status: 'Active',
    leadCount: 120,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    name: 'Enterprise Leads',
    code: 'ENT',
    status: 'Active',
    leadCount: 28,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z'
  }
];

export default function LeadGroupingSection() {
  const [leadGroups, setLeadGroups] = useState<LeadGroup[]>(mockLeadGroups);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<LeadGroup | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<LeadGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<LeadGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleAddGroup = (groupData: Omit<LeadGroup, 'id' | 'leadCount' | 'createdAt' | 'updatedAt'>) => {
    const newGroup: LeadGroup = {
      ...groupData,
      id: Date.now().toString(),
      leadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLeadGroups([...leadGroups, newGroup]);
    showToast.success('Lead group created successfully');
  };

  const handleEditGroup = (groupData: Omit<LeadGroup, 'id' | 'leadCount' | 'createdAt' | 'updatedAt'>) => {
    if (editingGroup) {
      const updatedGroups = leadGroups.map(group =>
        group.id === editingGroup.id
          ? { ...group, ...groupData, updatedAt: new Date().toISOString() }
          : group
      );
      setLeadGroups(updatedGroups);
      showToast.success('Lead group updated successfully');
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = leadGroups.find(g => g.id === groupId);
    if (group) {
      setDeletingGroup(group);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteGroup = () => {
    if (deletingGroup) {
      setLeadGroups(leadGroups.filter(group => group.id !== deletingGroup.id));
      showToast.success('Lead group deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingGroup(null);
    }
  };

  const handleConditionClick = (group: LeadGroup) => {
    setSelectedGroup(group);
    setIsConditionModalOpen(true);
  };

  const handleEdit = (group: LeadGroup) => {
    setEditingGroup(group);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingGroup(null);
  };

  const handleCloseConditionModal = () => {
    setIsConditionModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <LeadGroupingHeader />
      <LeadGroupingSearchFilter
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <LeadGroupingTable
        leadGroups={(() => {
          const filtered = leadGroups.filter(g => !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase()));
          return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        })()}
        currentPage={currentPage}
        totalPages={Math.ceil(leadGroups.filter(g => !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase())).length / pageSize) || 1}
        totalItems={leadGroups.filter(g => !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase())).length}
        onPageChange={(page) => setCurrentPage(page)}
        onEdit={handleEdit}
        onDelete={handleDeleteGroup}
        onConditionClick={handleConditionClick}
      />

      <AddLeadGroupModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingGroup ? handleEditGroup : handleAddGroup}
        editingGroup={editingGroup}
      />

      {selectedGroup && (
        <LeadGroupConditionModal
          isOpen={isConditionModalOpen}
          onClose={handleCloseConditionModal}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
        />
      )}

      <DeleteLeadGroupModal
        groupName={deletingGroup?.name || null}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingGroup(null);
        }}
        onConfirm={confirmDeleteGroup}
      />
    </motion.div>
  );
}
