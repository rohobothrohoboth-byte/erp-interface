import { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import ContactGroupingHeader from '@/modules/crm/components/contactManagement/contactGrouping/ContactGroupingHeader';
import ContactGroupingSearchFilter from '@/modules/crm/components/contactManagement/contactGrouping/ContactGroupingSearchFilter';
import ContactGroupingTable from '@/modules/crm/components/contactManagement/contactGrouping/ContactGroupingTable';
import AddContactGroupModal from '@/modules/crm/components/contactManagement/contactGrouping/AddContactGroupModal';
import ContactGroupConditionModal from '@/modules/crm/components/contactManagement/contactGrouping/ContactGroupConditionModal';
import DeleteContactGroupModal from '@/modules/crm/components/contactManagement/contactGrouping/DeleteContactGroupModal';

export interface ContactGroup {
  id: string;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

const mockContactGroups: ContactGroup[] = [
  {
    id: '1',
    name: 'VIP Customers',
    code: 'VIP',
    status: 'Active',
    contactCount: 32,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Enterprise Contacts',
    code: 'ENT',
    status: 'Active',
    contactCount: 85,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
];

export default function ContactGroupingSection() {
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>(mockContactGroups);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ContactGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleAddGroup = (groupData: Omit<ContactGroup, 'id' | 'contactCount' | 'createdAt' | 'updatedAt'>) => {
    const newGroup: ContactGroup = {
      ...groupData,
      id: Date.now().toString(),
      contactCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContactGroups([...contactGroups, newGroup]);
    showToast.success('Contact group created successfully');
  };

  const handleEditGroup = (groupData: Omit<ContactGroup, 'id' | 'contactCount' | 'createdAt' | 'updatedAt'>) => {
    if (editingGroup) {
      const updatedGroups = contactGroups.map(group =>
        group.id === editingGroup.id
          ? { ...group, ...groupData, updatedAt: new Date().toISOString() }
          : group
      );
      setContactGroups(updatedGroups);
      showToast.success('Contact group updated successfully');
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = contactGroups.find(g => g.id === groupId);
    if (group) {
      setDeletingGroup(group);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteGroup = () => {
    if (deletingGroup) {
      setContactGroups(contactGroups.filter(group => group.id !== deletingGroup.id));
      showToast.success('Contact group deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingGroup(null);
    }
  };

  const handleConditionClick = (group: ContactGroup) => {
    setSelectedGroup(group);
    setIsConditionModalOpen(true);
  };

  const handleEdit = (group: ContactGroup) => {
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
      <ContactGroupingHeader />
      <ContactGroupingSearchFilter
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <ContactGroupingTable
        contactGroups={(() => {
          const filtered = contactGroups.filter(g => !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase()));
          return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        })()}
        currentPage={currentPage}
        totalPages={Math.ceil(contactGroups.filter(g => !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase())).length / pageSize) || 1}
        totalItems={contactGroups.filter(g => !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase())).length}
        onPageChange={(page) => setCurrentPage(page)}
        onEdit={handleEdit}
        onDelete={handleDeleteGroup}
        onConditionClick={handleConditionClick}
      />

      <AddContactGroupModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingGroup ? handleEditGroup : handleAddGroup}
        editingGroup={editingGroup}
      />

      {selectedGroup && (
        <ContactGroupConditionModal
          isOpen={isConditionModalOpen}
          onClose={handleCloseConditionModal}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
        />
      )}

      <DeleteContactGroupModal
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
