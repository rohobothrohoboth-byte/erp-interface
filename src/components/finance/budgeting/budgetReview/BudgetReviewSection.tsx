import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../layout/layout';
import BudgetReviewHeader from './BudgetReviewHeader';
import BudgetReviewSearchFilter from './BudgetReviewSearchFilter';
import BudgetReviewTable from './BudgetReviewTable';

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

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const stored = localStorage.getItem('additionalBudgetRequests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only show requests with "Pending Review" status
        const pendingReview = parsed.filter((r: AdditionalBudgetRequest) => r.status === 'Pending Review');
        setRequests(pendingReview);
      } catch (e) {
        console.error('Error parsing additional budget requests:', e);
      }
    }
  };

  const saveRequests = (updatedRequests: AdditionalBudgetRequest[]) => {
    localStorage.setItem('additionalBudgetRequests', JSON.stringify(updatedRequests));
    loadRequests(); // Reload to filter only "Pending Review"
  };

  const handleAccept = (request: AdditionalBudgetRequest) => {
    const stored = localStorage.getItem('additionalBudgetRequests');
    if (stored) {
      const allRequests = JSON.parse(stored);
      const updatedRequests = allRequests.map((r: AdditionalBudgetRequest) =>
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
    }
  };

  const handleCancel = (request: AdditionalBudgetRequest) => {
    const stored = localStorage.getItem('additionalBudgetRequests');
    if (stored) {
      const allRequests = JSON.parse(stored);
      const updatedRequests = allRequests.map((r: AdditionalBudgetRequest) =>
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
    }
  };

  const filteredRequests = requests.filter(r =>
    (r.budgetPlanName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.expenseName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.budgetCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    r.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        onAccept={handleAccept}
        onCancel={handleCancel}
      />
    </motion.div>
  );
}
