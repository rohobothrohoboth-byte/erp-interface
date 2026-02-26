import { useState } from 'react';
import { motion } from 'framer-motion';
import BudgetHeader from './BudgetHeader';
import BudgetSearchFilter from './BudgetSearchFilter';
import BudgetTable from './BudgetTable';
import AddBudgetModal from './AddBudgetModal';
import EditBudgetModal from './EditBudgetModal';
import DeleteBudgetModal from './DeleteBudgetModal';
import type { Budget } from './types';

const BudgetSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const totalPages = Math.ceil(budgets.length / 10);

  const handleAddBudget = (data: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget: Budget = {
      ...data,
      id: `budget-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBudgets([...budgets, newBudget]);
    setIsAddModalOpen(false);
  };

  const handleEditBudget = (data: Omit<Budget, 'id' | 'createdAt'>) => {
    if (!selectedBudget) return;

    setBudgets(
      budgets.map((budget) =>
        budget.id === selectedBudget.id
          ? { ...budget, ...data }
          : budget
      )
    );
    setIsEditModalOpen(false);
    setSelectedBudget(null);
  };

  const handleDeleteBudget = () => {
    if (!selectedBudget) return;

    setBudgets(budgets.filter((budget) => budget.id !== selectedBudget.id));
    setIsDeleteModalOpen(false);
    setSelectedBudget(null);
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditModalOpen(true);
  };

  const handleDelete = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteModalOpen(true);
  };

  const handleView = (budget: Budget) => {
    // Implement view logic if needed
    console.log('View budget:', budget);
  };

  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.budgetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <BudgetTable
        budgets={filteredBudgets}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredBudgets.length}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBudget}
      />

      <EditBudgetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBudget(null);
        }}
        onSubmit={handleEditBudget}
        budget={selectedBudget}
      />

      <DeleteBudgetModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBudget(null);
        }}
        onConfirm={handleDeleteBudget}
        budgetTitle={selectedBudget?.title || ''}
      />
    </motion.section>
  );
};

export default BudgetSection;
