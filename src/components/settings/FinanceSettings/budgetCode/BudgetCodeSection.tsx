import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code } from "lucide-react";
import { showToast } from "../../../../layout/layout";
import BudgetCodeHeader from "./BudgetCodeHeader";
import BudgetCodeSearchFilter from "./BudgetCodeSearchFilter";
import BudgetCodeTable from "./BudgetCodeTable";
import AddBudgetCodeModal from "./AddBudgetCodeModal";
import EditBudgetCodeModal from "./EditBudgetCodeModal";
import DeleteBudgetCodeModal from "./DeleteBudgetCodeModal";

export interface BudgetCode {
  id: string;
  budgetCode: string;
  description: string;
  fiscalYear: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const BudgetCodeSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudgetCode, setEditingBudgetCode] = useState<BudgetCode | null>(null);
  const [deletingBudgetCode, setDeletingBudgetCode] = useState<BudgetCode | null>(null);

  const loadBudgetCodes = (): BudgetCode[] => {
    const stored = localStorage.getItem('budgetCodes');
    return stored ? JSON.parse(stored) : [];
  };

  const [budgetCodes, setBudgetCodes] = useState<BudgetCode[]>(loadBudgetCodes());

  const saveBudgetCodes = (updatedBudgetCodes: BudgetCode[]) => {
    localStorage.setItem('budgetCodes', JSON.stringify(updatedBudgetCodes));
    setBudgetCodes(updatedBudgetCodes);
  };

  const handleAddSubmit = (budgetCodeData: Omit<BudgetCode, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newBudgetCode: BudgetCode = {
      ...budgetCodeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveBudgetCodes([...budgetCodes, newBudgetCode]);
    showToast.success("Budget code added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (budgetCodeData: Omit<BudgetCode, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingBudgetCode) {
      const updatedBudgetCodes = budgetCodes.map(bc =>
        bc.id === editingBudgetCode.id
          ? { ...bc, ...budgetCodeData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : bc
      );
      saveBudgetCodes(updatedBudgetCodes);
      showToast.success("Budget code updated successfully");
      setEditingBudgetCode(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingBudgetCode) {
      const updatedBudgetCodes = budgetCodes.filter(bc => bc.id !== deletingBudgetCode.id);
      saveBudgetCodes(updatedBudgetCodes);
      showToast.success("Budget code deleted successfully");
      setDeletingBudgetCode(null);
    }
  };

  const handleToggleStatus = (budgetCode: BudgetCode) => {
    const newStatus = budgetCode.status === 'Active' ? 'Inactive' : 'Active';
    const updatedBudgetCodes = budgetCodes.map(bc =>
      bc.id === budgetCode.id ? { ...bc, status: newStatus } : bc
    );
    saveBudgetCodes(updatedBudgetCodes);
    showToast.success(`Budget code ${newStatus.toLowerCase()}`);
  };

  const filteredBudgetCodes = budgetCodes.filter(bc =>
    bc.budgetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bc.fiscalYear.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <BudgetCodeHeader />

      <BudgetCodeSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <BudgetCodeTable
        budgetCodes={filteredBudgetCodes}
        onEdit={setEditingBudgetCode}
        onDelete={setDeletingBudgetCode}
        onToggleStatus={handleToggleStatus}
      />
      <AddBudgetCodeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditBudgetCodeModal
        isOpen={!!editingBudgetCode}
        onClose={() => setEditingBudgetCode(null)}
        onSubmit={handleEditSubmit}
        budgetCode={editingBudgetCode}
      />

      <DeleteBudgetCodeModal
        isOpen={!!deletingBudgetCode}
        onClose={() => setDeletingBudgetCode(null)}
        onConfirm={handleDeleteConfirm}
        budgetCodeName={deletingBudgetCode?.budgetCode || ''}
      />
    </motion.section>
  );
};

export default BudgetCodeSection;
