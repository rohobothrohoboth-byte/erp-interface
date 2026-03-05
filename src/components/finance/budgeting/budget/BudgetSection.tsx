import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../../../layout/layout';
import BudgetHeader from './BudgetHeader';
import BudgetSearchFilter from './BudgetSearchFilter';
import BudgetTable from './BudgetTable';
import BudgetCardView from './BudgetCardView';
import AddBudgetModal from './AddBudgetModal';
import EditBudgetModal from './EditBudgetModal';
import DeleteBudgetModal from './DeleteBudgetModal';
import type { Budget } from './types';

const BudgetSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    const stored = localStorage.getItem('budgets');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBudgets(parsed);
      } catch (e) {
        console.error('Error loading budgets:', e);
      }
    }
  };

  const saveBudgets = (updatedBudgets: Budget[]) => {
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    setBudgets(updatedBudgets);
  };

  const handleAdd = (newBudget: Omit<Budget, 'id' | 'createdAt' | 'createdBy'>) => {
    const budget: Budget = {
      ...newBudget,
      id: `budget-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveBudgets([...budgets, budget]);
    showToast.success('Budget created successfully');
    setIsAddModalOpen(false);
  };

  const handleEdit = (updatedBudget: Budget) => {
    const updated = budgets.map(b =>
      b.id === updatedBudget.id
        ? {
            ...updatedBudget,
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          }
        : b
    );
    saveBudgets(updated);
    showToast.success('Budget updated successfully');
    setEditingBudget(null);
  };

  const handleDelete = () => {
    if (deletingBudget) {
      const updated = budgets.filter(b => b.id !== deletingBudget.id);
      saveBudgets(updated);
      showToast.success('Budget deleted successfully');
      setDeletingBudget(null);
    }
  };

  const handleViewVersions = (budget: Budget) => {
    navigate(`/finance/budget/${budget.id}/versions`);
  };

  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.fiscalYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.costCenter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBudgets.length / 10);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <BudgetHeader />

      <BudgetSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAdd={() => setIsAddModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'table' ? (
        <BudgetTable
          budgets={filteredBudgets}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredBudgets.length}
          onPageChange={setCurrentPage}
          onViewVersions={handleViewVersions}
          onEdit={setEditingBudget}
          onDelete={setDeletingBudget}
        />
      ) : (
        <BudgetCardView
          budgets={filteredBudgets}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredBudgets.length}
          onPageChange={setCurrentPage}
          onViewVersions={handleViewVersions}
          onEdit={setEditingBudget}
          onDelete={setDeletingBudget}
        />
      )}

      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />

      {editingBudget && (
        <EditBudgetModal
          isOpen={true}
          onClose={() => setEditingBudget(null)}
          onEdit={handleEdit}
          budget={editingBudget}
        />
      )}

      {deletingBudget && (
        <DeleteBudgetModal
          isOpen={true}
          onClose={() => setDeletingBudget(null)}
          onDelete={handleDelete}
          budgetName={deletingBudget.name}
        />
      )}
    </motion.section>
  );
};

export default BudgetSection;
