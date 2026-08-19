import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/shared/layout/layout";
import LeadScoringHeader from "@/modules/settings/components/crmSettings/leadScoring/LeadScoringHeader";
import LeadScoringSearchFilter from "@/modules/settings/components/crmSettings/leadScoring/LeadScoringSearchFilter";
import LeadScoringTable from "@/modules/settings/components/crmSettings/leadScoring/LeadScoringTable";
import AddScoringCriteriaModal from "@/modules/settings/components/crmSettings/leadScoring/AddScoringCriteriaModal";
import EditScoringCriteriaModal from "@/modules/settings/components/crmSettings/leadScoring/EditScoringCriteriaModal";
import DeleteScoringCriteriaModal from "@/modules/settings/components/crmSettings/leadScoring/DeleteScoringCriteriaModal";

export interface LeadScoringCriteria {
  id: string;
  name: string;
  maxPoints: number;
  percentage: number;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const LeadScoringSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<LeadScoringCriteria | null>(null);
  const [deletingCriteria, setDeletingCriteria] = useState<LeadScoringCriteria | null>(null);

  const loadCriteria = (): LeadScoringCriteria[] => {
    const stored = localStorage.getItem('leadScoringCriteria');
    if (stored) {
      return JSON.parse(stored);
    }
    return [
      { id: '1', name: 'Interest Level', maxPoints: 20, percentage: 25, is_active: true, createdAt: new Date().toISOString(), createdBy: 'System' },
      { id: '2', name: 'Budget', maxPoints: 15, percentage: 18.75, is_active: true, createdAt: new Date().toISOString(), createdBy: 'System' },
      { id: '3', name: 'Authority', maxPoints: 15, percentage: 18.75, is_active: true, createdAt: new Date().toISOString(), createdBy: 'System' },
      { id: '4', name: 'Timeline', maxPoints: 15, percentage: 18.75, is_active: true, createdAt: new Date().toISOString(), createdBy: 'System' },
      { id: '5', name: 'Product Fit', maxPoints: 15, percentage: 18.75, is_active: true, createdAt: new Date().toISOString(), createdBy: 'System' }
    ];
  };

  const [criteria, setCriteria] = useState<LeadScoringCriteria[]>(loadCriteria());

  const saveCriteria = (updatedCriteria: LeadScoringCriteria[]) => {
    localStorage.setItem('leadScoringCriteria', JSON.stringify(updatedCriteria));
    setCriteria(updatedCriteria);
  };

  const handleAddSubmit = (criteriaData: Omit<LeadScoringCriteria, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newCriteria: LeadScoringCriteria = {
      ...criteriaData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveCriteria([...criteria, newCriteria]);
    showToast.success("Criteria added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (criteriaData: Omit<LeadScoringCriteria, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingCriteria) {
      const updatedCriteria = criteria.map(c =>
        c.id === editingCriteria.id
          ? { ...c, ...criteriaData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : c
      );
      saveCriteria(updatedCriteria);
      showToast.success("Criteria updated successfully");
      setEditingCriteria(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingCriteria) {
      const updatedCriteria = criteria.filter(c => c.id !== deletingCriteria.id);
      saveCriteria(updatedCriteria);
      showToast.success("Criteria deleted successfully");
      setDeletingCriteria(null);
    }
  };

  const handleToggleActive = (criteriaItem: LeadScoringCriteria) => {
    const updatedCriteria = criteria.map(c =>
      c.id === criteriaItem.id ? { ...c, is_active: !c.is_active } : c
    );
    saveCriteria(updatedCriteria);
    showToast.success(`Criteria ${!criteriaItem.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredCriteria = criteria.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPercentage = criteria.reduce((sum, c) => sum + c.percentage, 0);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <LeadScoringHeader />

      <LeadScoringSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
        totalPercentage={totalPercentage}
      />

      <LeadScoringTable
        criteria={filteredCriteria}
        onEdit={setEditingCriteria}
        onDelete={setDeletingCriteria}
        onToggleActive={handleToggleActive}
      />

      <AddScoringCriteriaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        currentTotalPercentage={totalPercentage}
      />

      <EditScoringCriteriaModal
        isOpen={!!editingCriteria}
        onClose={() => setEditingCriteria(null)}
        onSubmit={handleEditSubmit}
        criteria={editingCriteria}
        currentTotalPercentage={totalPercentage}
      />

      <DeleteScoringCriteriaModal
        isOpen={!!deletingCriteria}
        onClose={() => setDeletingCriteria(null)}
        onConfirm={handleDeleteConfirm}
        criteriaName={deletingCriteria?.name || ''}
      />
    </motion.section>
  );
};

export default LeadScoringSection;
