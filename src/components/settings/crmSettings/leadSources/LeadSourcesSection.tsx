import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "../../../../layout/layout";
import { useCRMSettings } from "../../../../hooks/useCRMSettings";
import LeadSourcesHeader from "./LeadSourcesHeader";
import LeadSourcesSearchFilter from "./LeadSourcesSearchFilter";
import LeadSourcesTable from "./LeadSourcesTable";
import AddLeadSourceModal from "./AddLeadSourceModal";
import EditLeadSourceModal from "./EditLeadSourceModal";
import DeleteLeadSourceModal from "./DeleteLeadSourceModal";

export interface LeadSource {
  id: string;
  name: string;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const LeadSourcesSection: React.FC = () => {
  const { settings, saveSettings } = useCRMSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [deletingSource, setDeletingSource] = useState<LeadSource | null>(null);

  const leadSources: LeadSource[] = settings.leadSources || [];

  const saveLeadSources = async (updatedSources: LeadSource[]) => {
    await saveSettings({ leadSources: updatedSources });
  };

  const handleAddSubmit = async (sourceData: Omit<LeadSource, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newSource: LeadSource = {
      ...sourceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    await saveLeadSources([...leadSources, newSource]);
    showToast.success("Lead source added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (sourceData: Omit<LeadSource, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingSource) {
      const updatedSources = leadSources.map(s =>
        s.id === editingSource.id
          ? { ...s, ...sourceData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : s
      );
      await saveLeadSources(updatedSources);
      showToast.success("Lead source updated successfully");
      setEditingSource(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingSource) {
      const updatedSources = leadSources.filter(s => s.id !== deletingSource.id);
      await saveLeadSources(updatedSources);
      showToast.success("Lead source deleted successfully");
      setDeletingSource(null);
    }
  };

  const handleToggleActive = async (source: LeadSource) => {
    const updatedSources = leadSources.map(s =>
      s.id === source.id ? { ...s, is_active: !s.is_active } : s
    );
    await saveLeadSources(updatedSources);
    showToast.success(`Lead source ${!source.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredSources = leadSources.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <LeadSourcesHeader />

      <LeadSourcesSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <LeadSourcesTable
        sources={filteredSources}
        onEdit={setEditingSource}
        onDelete={setDeletingSource}
        onToggleActive={handleToggleActive}
      />

      <AddLeadSourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditLeadSourceModal
        isOpen={!!editingSource}
        onClose={() => setEditingSource(null)}
        onSubmit={handleEditSubmit}
        source={editingSource}
      />

      <DeleteLeadSourceModal
        isOpen={!!deletingSource}
        onClose={() => setDeletingSource(null)}
        onConfirm={handleDeleteConfirm}
        sourceName={deletingSource?.name || ''}
      />
    </motion.section>
  );
};

export default LeadSourcesSection;
