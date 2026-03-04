import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../layout/layout';
import AdditionalBudgetHeader from './AdditionalBudgetHeader';
import AdditionalBudgetSearchFilter from './AdditionalBudgetSearchFilter';
import AdditionalBudgetTable from './AdditionalBudgetTable';
import AddAdditionalBudgetModal from './AddAdditionalBudgetModal';
import EditAdditionalBudgetModal from './EditAdditionalBudgetModal';
import DeleteAdditionalBudgetModal from './DeleteAdditionalBudgetModal';

interface AdditionalBudgetRequest {
  id: string;
  budgetPlanId: string;
  budgetPlanName: string;
  expenseId: string;
  expenseDescription: string;
  amount: number;
  justification: string;
  status: 'Pending Review' | 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}



export default function AdditionalBudgetSection() {
  const [requests, setRequests] = useState<AdditionalBudgetRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<AdditionalBudgetRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<AdditionalBudgetRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const stored = localStorage.getItem('additionalBudgetRequests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRequests(parsed);
      } catch (e) {
        console.error('Error parsing additional budget requests:', e);
      }
    }
  };

  const saveRequests = (updatedRequests: AdditionalBudgetRequest[]) => {
    localStorage.setItem('additionalBudgetRequests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
  };

  const handleAdd = (data: Omit<AdditionalBudgetRequest, 'id' | 'status' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newRequest: AdditionalBudgetRequest = {
      ...data,
      id: Date.now().toString(),
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveRequests([...requests, newRequest]);
    showToast.success('Additional budget request created and sent for review');
    setIsAddModalOpen(false);
  };

  const handleEdit = (data: Omit<AdditionalBudgetRequest, 'id' | 'status' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingRequest) {
      const updatedRequests = requests.map(r =>
        r.id === editingRequest.id
          ? { 
              ...r, 
              ...data, 
              status: 'Pending Review' as const, // Reset to Pending Review when edited
              rejectionReason: undefined, // Clear rejection reason
              updatedAt: new Date().toISOString(), 
              updatedBy: 'Current User' 
            }
          : r
      );
      saveRequests(updatedRequests);
      showToast.success('Additional budget request updated and sent for review');
      setEditingRequest(null);
    }
  };

  const handleDelete = () => {
    if (deletingRequest) {
      saveRequests(requests.filter(r => r.id !== deletingRequest.id));
      showToast.success('Additional budget request deleted successfully');
      setDeletingRequest(null);
    }
  };

  const filteredRequests = requests.filter(r =>
    (r.budgetPlanName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.expenseDescription?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    r.justification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AdditionalBudgetHeader />

      <AdditionalBudgetSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AdditionalBudgetTable
        requests={filteredRequests}
        onEdit={setEditingRequest}
        onDelete={setDeletingRequest}
      />

      <AddAdditionalBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
      />

      <EditAdditionalBudgetModal
        isOpen={!!editingRequest}
        onClose={() => setEditingRequest(null)}
        onSubmit={handleEdit}
        request={editingRequest}
      />

      <DeleteAdditionalBudgetModal
        isOpen={!!deletingRequest}
        onClose={() => setDeletingRequest(null)}
        onConfirm={handleDelete}
        requestName={deletingRequest?.budgetPlanName || ''}
      />
    </motion.div>
  );
}
