import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "../../../../layout/layout";
import { useCRMSettings } from "../../../../hooks/useCRMSettings";
import IndustriesHeader from "./IndustriesHeader";
import IndustriesSearchFilter from "./IndustriesSearchFilter";
import IndustriesTable from "./IndustriesTable";
import AddIndustryModal from "./AddIndustryModal";
import EditIndustryModal from "./EditIndustryModal";
import DeleteIndustryModal from "./DeleteIndustryModal";

export interface Industry {
  id: string;
  name: string;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const IndustriesSection: React.FC = () => {
  const { settings, saveSettings } = useCRMSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [deletingIndustry, setDeletingIndustry] = useState<Industry | null>(null);

  const industries: Industry[] = settings.industries || [];

  const saveIndustries = async (updatedIndustries: Industry[]) => {
    await saveSettings({ industries: updatedIndustries });
  };

  const handleAddSubmit = async (industryData: Omit<Industry, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newIndustry: Industry = {
      ...industryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    await saveIndustries([...industries, newIndustry]);
    showToast.success("Industry added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (industryData: Omit<Industry, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingIndustry) {
      const updatedIndustries = industries.map(i =>
        i.id === editingIndustry.id
          ? { ...i, ...industryData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : i
      );
      await saveIndustries(updatedIndustries);
      showToast.success("Industry updated successfully");
      setEditingIndustry(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingIndustry) {
      const updatedIndustries = industries.filter(i => i.id !== deletingIndustry.id);
      await saveIndustries(updatedIndustries);
      showToast.success("Industry deleted successfully");
      setDeletingIndustry(null);
    }
  };

  const handleToggleActive = async (industry: Industry) => {
    const updatedIndustries = industries.map(i =>
      i.id === industry.id ? { ...i, is_active: !i.is_active } : i
    );
    await saveIndustries(updatedIndustries);
    showToast.success(`Industry ${!industry.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredIndustries = industries.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <IndustriesHeader />

      <IndustriesSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <IndustriesTable
        industries={filteredIndustries}
        onEdit={setEditingIndustry}
        onDelete={setDeletingIndustry}
        onToggleActive={handleToggleActive}
      />

      <AddIndustryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditIndustryModal
        isOpen={!!editingIndustry}
        onClose={() => setEditingIndustry(null)}
        onSubmit={handleEditSubmit}
        industry={editingIndustry}
      />

      <DeleteIndustryModal
        isOpen={!!deletingIndustry}
        onClose={() => setDeletingIndustry(null)}
        onConfirm={handleDeleteConfirm}
        industryName={deletingIndustry?.name || ''}
      />
    </motion.section>
  );
};

export default IndustriesSection;
