import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/shared/layout/layout";
import { useCRMSettings } from "@/modules/crm/hooks/useCRMSettings";
import TicketStatusHeader from "@/modules/settings/components/crmSettings/ticketStatus/TicketStatusHeader";
import TicketStatusSearchFilter from "@/modules/settings/components/crmSettings/ticketStatus/TicketStatusSearchFilter";
import TicketStatusTable from "@/modules/settings/components/crmSettings/ticketStatus/TicketStatusTable";
import AddTicketStatusModal from "@/modules/settings/components/crmSettings/ticketStatus/AddTicketStatusModal";
import EditTicketStatusModal from "@/modules/settings/components/crmSettings/ticketStatus/EditTicketStatusModal";
import DeleteTicketStatusModal from "@/modules/settings/components/crmSettings/ticketStatus/DeleteTicketStatusModal";

export interface TicketStatus {
  id: string;
  name: string;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const TicketStatusSection: React.FC = () => {
  const { settings, saveSettings } = useCRMSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<TicketStatus | null>(null);
  const [deletingStatus, setDeletingStatus] = useState<TicketStatus | null>(null);

  const ticketStatuses: TicketStatus[] = settings.ticketStatus || [];

  const saveTicketStatuses = async (updatedStatuses: TicketStatus[]) => {
    await saveSettings({ ticketStatus: updatedStatuses });
  };

  const handleAddSubmit = async (statusData: Omit<TicketStatus, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newStatus: TicketStatus = {
      ...statusData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    await saveTicketStatuses([...ticketStatuses, newStatus]);
    showToast.success("Ticket status added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (statusData: Omit<TicketStatus, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingStatus) {
      const updatedStatuses = ticketStatuses.map(s =>
        s.id === editingStatus.id
          ? { ...s, ...statusData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : s
      );
      await saveTicketStatuses(updatedStatuses);
      showToast.success("Ticket status updated successfully");
      setEditingStatus(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingStatus) {
      const updatedStatuses = ticketStatuses.filter(s => s.id !== deletingStatus.id);
      await saveTicketStatuses(updatedStatuses);
      showToast.success("Ticket status deleted successfully");
      setDeletingStatus(null);
    }
  };

  const handleToggleActive = async (status: TicketStatus) => {
    const updatedStatuses = ticketStatuses.map(s =>
      s.id === status.id ? { ...s, is_active: !s.is_active } : s
    );
    await saveTicketStatuses(updatedStatuses);
    showToast.success(`Ticket status ${!status.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredStatuses = ticketStatuses.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <TicketStatusHeader />

      <TicketStatusSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <TicketStatusTable
        statuses={filteredStatuses}
        onEdit={setEditingStatus}
        onDelete={setDeletingStatus}
        onToggleActive={handleToggleActive}
      />

      <AddTicketStatusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditTicketStatusModal
        isOpen={!!editingStatus}
        onClose={() => setEditingStatus(null)}
        onSubmit={handleEditSubmit}
        status={editingStatus}
      />

      <DeleteTicketStatusModal
        isOpen={!!deletingStatus}
        onClose={() => setDeletingStatus(null)}
        onConfirm={handleDeleteConfirm}
        statusName={deletingStatus?.name || ''}
      />
    </motion.section>
  );
};

export default TicketStatusSection;
