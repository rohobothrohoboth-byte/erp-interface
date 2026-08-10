// src/pages/finance/budgeting/PageBudgetApproval.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Eye, Clock, Filter, Search,
  ChevronLeft, ChevronRight, RefreshCw, MoreVertical
} from 'lucide-react';
import { getBudgets, toggleBudgetStatus } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';

interface Budget {
  id: string;
  name: string;
  description?: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  branchName?: string;
  departmentName?: string;
  dateAdd: string;
}

const PageBudgetApproval: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await getBudgets({ status: 'Draft' });
      const data = res.data.data || res.data || [];
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showToast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBudget) return;
    try {
      await toggleBudgetStatus(selectedBudget.id);
      showToast.success(`Budget ${selectedBudget.name} approved`);
      setIsApproveModalOpen(false);
      await fetchBudgets();
    } catch (error) {
      console.error('Error approving budget:', error);
      showToast.error('Failed to approve budget');
    }
  };

  const handleReject = async () => {
    if (!selectedBudget) return;
    try {
      await toggleBudgetStatus(selectedBudget.id);
      showToast.success(`Budget ${selectedBudget.name} rejected`);
      setIsRejectModalOpen(false);
      await fetchBudgets();
    } catch (error) {
      console.error('Error rejecting budget:', error);
      showToast.error('Failed to reject budget');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Draft: 'bg-yellow-100 text-yellow-700',
      Active: 'bg-green-100 text-green-700',
      Approved: 'bg-blue-100 text-blue-700',
      Rejected: 'bg-red-100 text-red-700',
      Inactive: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBudgets = filteredBudgets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Approval</h1>
            <p className="text-sm text-gray-500">Review and approve budget requests</p>
          </div>
          <Button
              onClick={fetchBudgets}
              variant="outline"
              className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">
              {budgets.filter(b => b.status === 'Draft').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {budgets.filter(b => b.status === 'Approved' || b.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {budgets.filter(b => b.status === 'Rejected').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(budgets.reduce((sum, b) => sum + b.totalAmount, 0))}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search budgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Draft">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budgets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {paginatedBudgets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No budgets found
                    </td>
                  </tr>
              ) : (
                  paginatedBudgets.map((budget) => (
                      <tr key={budget.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{budget.name}</p>
                            {budget.description && (
                                <p className="text-xs text-gray-500 truncate max-w-xs">{budget.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                          {formatCurrency(budget.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(budget.status)}>
                            {budget.status === 'Draft' ? 'Pending' : budget.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => {
                                  setSelectedBudget(budget);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View"
                            >
                              <Eye size={16} className="text-blue-500" />
                            </button>
                            {budget.status === 'Draft' && (
                                <>
                                  <button
                                      onClick={() => {
                                        setSelectedBudget(budget);
                                        setIsApproveModalOpen(true);
                                      }}
                                      className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                      title="Approve"
                                  >
                                    <CheckCircle size={16} className="text-green-500" />
                                  </button>
                                  <button
                                      onClick={() => {
                                        setSelectedBudget(budget);
                                        setIsRejectModalOpen(true);
                                      }}
                                      className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                      title="Reject"
                                  >
                                    <XCircle size={16} className="text-red-500" />
                                  </button>
                                </>
                            )}
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBudgets.length)} of {filteredBudgets.length} budgets
            </p>
            <div className="flex items-center gap-2">
              <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages || 1}
            </span>
              <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Approve Modal */}
        <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Approve Budget
              </DialogTitle>
              <DialogDescription>
                This will approve the budget for use.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to approve <strong>{selectedBudget?.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">Amount: {formatCurrency(selectedBudget?.totalAmount || 0)}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Reject Budget
              </DialogTitle>
              <DialogDescription>
                This will reject the budget request.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to reject <strong>{selectedBudget?.name}</strong>?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Budget Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                Budget Details
              </DialogTitle>
              <DialogDescription>
                View budget information.
              </DialogDescription>
            </DialogHeader>
            {selectedBudget && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedBudget.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={getStatusColor(selectedBudget.status)}>
                        {selectedBudget.status === 'Draft' ? 'Pending' : selectedBudget.status}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Description</p>
                      <p>{selectedBudget.description || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-xl font-bold text-indigo-600">{formatCurrency(selectedBudget.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Period</p>
                      <p>{formatDate(selectedBudget.startDate)} - {formatDate(selectedBudget.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Branch</p>
                      <p>{selectedBudget.branchName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p>{selectedBudget.departmentName || '-'}</p>
                    </div>
                  </div>
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
  );
};

export default PageBudgetApproval;