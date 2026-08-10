import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import BudgetReviewHeader from '@/modules/finance/components/budgeting/budgetReview/BudgetReviewHeader';
import BudgetReviewSearchFilter from '@/modules/finance/components/budgeting/budgetReview/BudgetReviewSearchFilter';
import BudgetReviewTable from '@/modules/finance/components/budgeting/budgetReview/BudgetReviewTable';

interface AdditionalBudgetRequest {
  id: string;
  budgetId?: string;
  budgetName?: string;
  budgetPlanId: string;
  budgetPlanName: string;
  expenseId: string;
  expenseName: string;
  budgetCode: string;
  budgetCategory: string;
  account: string;
  amount: number;
  justification: string;
  status: 'Pending Review' | 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export default function BudgetReviewSection() {
  const [requests, setRequests] = useState<AdditionalBudgetRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const stored = localStorage.getItem('additionalBudgetRequests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Show all requests, not just "Pending Review"
        setRequests(parsed);
      } catch (e) {
        console.error('Error parsing additional budget requests:', e);
      }
    }
  };

  const saveRequests = (updatedRequests: AdditionalBudgetRequest[]) => {
    localStorage.setItem('additionalBudgetRequests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests); // Update state directly instead of reloading
  };

  const handleAccept = (request: AdditionalBudgetRequest) => {
    const updatedRequests = requests.map((r: AdditionalBudgetRequest) =>
      r.id === request.id
        ? {
            ...r,
            status: 'Pending' as const,
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          }
        : r
    );
    saveRequests(updatedRequests);
    showToast.success('Request accepted and sent for approval');
  };

  const handleCancel = (request: AdditionalBudgetRequest) => {
    const updatedRequests = requests.map((r: AdditionalBudgetRequest) =>
      r.id === request.id
        ? {
            ...r,
            status: 'Cancelled' as const,
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          }
        : r
    );
    saveRequests(updatedRequests);
    showToast.success('Request cancelled');
  };

  const filteredRequests = requests.filter(r =>
    (r.budgetPlanName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.expenseName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.budgetCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    r.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <BudgetReviewHeader />

      <BudgetReviewSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <BudgetReviewTable
        requests={filteredRequests}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRequests.length}
        onPageChange={setCurrentPage}
        onAccept={handleAccept}
        onCancel={handleCancel}
      />
    </motion.div>
  );
}
