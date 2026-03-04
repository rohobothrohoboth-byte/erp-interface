import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../../../layout/layout';
import BudgetPlanHeader from './BudgetPlanHeader';
import BudgetPlanSearchFilter from './BudgetPlanSearchFilter';
import BudgetPlanTable from './BudgetPlanTable';
import AddBudgetPlanModal from './AddBudgetPlanModal';
import EditBudgetPlanModal from './EditBudgetPlanModal';
import DeleteBudgetPlanModal from './DeleteBudgetPlanModal';

export interface BudgetPlan {
  id: string;
  fiscalYear: string;
  costCenter: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Returned';
  submittedDate: string;
  totalRequested: number;
  expenseCount: number;
  createdAt: string;
  updatedAt: string;
}

const BudgetPlanSection = () => {
  const navigate = useNavigate();
  
  // Initialize state with empty array first
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BudgetPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<BudgetPlan | null>(null);

  // Load budget plans with mock data on mount
  useEffect(() => {
    const stored = localStorage.getItem('budgetPlans');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBudgetPlans(parsed);
          return;
        }
      } catch (e) {
        console.error('Error parsing budgetPlans:', e);
      }
    }
    
    // Create mock budget plan if none exists
    const mockPlan: BudgetPlan = {
      id: 'bp-001',
      fiscalYear: 'fy 2026',
      costCenter: 'IT Department',
      status: 'Submitted',
      submittedDate: new Date().toISOString(),
      totalRequested: 75000,
      expenseCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const mockPlans = [mockPlan];
    localStorage.setItem('budgetPlans', JSON.stringify(mockPlans));
    setBudgetPlans(mockPlans);
  }, []);

  const saveBudgetPlans = (plans: BudgetPlan[]) => {
    localStorage.setItem('budgetPlans', JSON.stringify(plans));
    setBudgetPlans(plans);
  };

  const handleAddPlan = (planData: Omit<BudgetPlan, 'id' | 'submittedDate' | 'totalRequested' | 'expenseCount' | 'createdAt' | 'updatedAt'>) => {
    const newPlan: BudgetPlan = {
      ...planData,
      id: Date.now().toString(),
      submittedDate: new Date().toISOString(),
      totalRequested: 0,
      expenseCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveBudgetPlans([...budgetPlans, newPlan]);
    showToast.success('Budget plan created successfully');
    setIsAddModalOpen(false);
  };

  const handleEditPlan = (planData: Omit<BudgetPlan, 'id' | 'submittedDate' | 'totalRequested' | 'expenseCount' | 'createdAt' | 'updatedAt'>) => {
    if (editingPlan) {
      const updatedPlans = budgetPlans.map(plan =>
        plan.id === editingPlan.id
          ? { ...plan, ...planData, updatedAt: new Date().toISOString() }
          : plan
      );
      saveBudgetPlans(updatedPlans);
      showToast.success('Budget plan updated successfully');
      setEditingPlan(null);
    }
  };

  const handleDeletePlan = () => {
    if (deletingPlan) {
      saveBudgetPlans(budgetPlans.filter(plan => plan.id !== deletingPlan.id));
      showToast.success('Budget plan deleted successfully');
      setDeletingPlan(null);
    }
  };

  const handleManageExpenses = (plan: BudgetPlan) => {
    navigate(`/finance/budget-plan/${plan.id}/expenses`);
  };

  const handleUpdateTotalRequested = (planId: string, total: number, count: number) => {
    const updatedPlans = budgetPlans.map(p =>
      p.id === planId
        ? { ...p, totalRequested: total, expenseCount: count }
        : p
    );
    saveBudgetPlans(updatedPlans);
  };

  const filteredPlans = budgetPlans.filter(plan =>
    plan.fiscalYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.costCenter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <BudgetPlanHeader />

      <BudgetPlanSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <BudgetPlanTable
        budgetPlans={filteredPlans}
        onEdit={setEditingPlan}
        onDelete={setDeletingPlan}
        onManageExpenses={handleManageExpenses}
      />

      <AddBudgetPlanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPlan}
      />

      <EditBudgetPlanModal
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        onSubmit={handleEditPlan}
        budgetPlan={editingPlan}
      />

      <DeleteBudgetPlanModal
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleDeletePlan}
        planName={deletingPlan?.budgetCode || ''}
      />
    </motion.div>
  );
};

export default BudgetPlanSection;
