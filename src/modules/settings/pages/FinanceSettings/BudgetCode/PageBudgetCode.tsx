// src/pages/settings/finance/PageBudgetCode.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, RefreshCw,
  Code, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Calendar, DollarSign
} from 'lucide-react';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  getBudgetCodes,
  createBudgetCode,
  updateBudgetCode,
  deleteBudgetCode
} from '@/modules/finance/services/finance.api';

interface BudgetCode {
  id: string;
  code: string;
  name: string;
  nameAm?: string;
  description?: string;
  isActive: boolean;
  budgetType: string;
  fiscalYear: string;
  totalAmount?: number;
  dateAdd: string;
}

const PageBudgetCode = () => {
  const [budgetCodes, setBudgetCodes] = useState<BudgetCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<BudgetCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameAm: '',
    description: '',
    budgetType: 'Operating',
    fiscalYear: new Date().getFullYear().toString(),
    totalAmount: 0,
    isActive: true,
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBudgetCodes();
  }, []);

  // ✅ REAL API CALL
  const fetchBudgetCodes = async () => {
    setLoading(true);
    try {
      const response = await getBudgetCodes();
      const data = response.data.data || response.data || [];
      setBudgetCodes(data);
    } catch (error) {
      console.error('Error fetching budget codes:', error);
      showToast.error('Failed to load budget codes');
    } finally {
      setLoading(false);
    }
  };

  // ✅ REAL API CALL
  const handleAdd = async () => {
    try {
      await createBudgetCode(formData);
      showToast.success('Budget code created successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchBudgetCodes();
    } catch (error) {
      console.error('Error creating budget code:', error);
      showToast.error('Failed to create budget code');
    }
  };

  // src/pages/settings/finance/PageBudgetCode.tsx

// ✅ FIXED - Send complete DTO
  const handleEdit = async () => {
    if (!selectedCode) return;
    try {
      const payload = {
        id: selectedCode.id,
        code: formData.code,
        name: formData.name,
        nameAm: formData.nameAm || '',
        description: formData.description || '',
        budgetType: formData.budgetType,
        fiscalYear: formData.fiscalYear,
        totalAmount: formData.totalAmount || 0,
        isActive: formData.isActive,
      };

      await updateBudgetCode(payload);
      showToast.success('Budget code updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      fetchBudgetCodes();
    } catch (error) {
      console.error('Error updating budget code:', error);
      showToast.error('Failed to update budget code');
    }
  };

  // ✅ REAL API CALL
  const handleDelete = async () => {
    if (!selectedCode) return;
    try {
      await deleteBudgetCode(selectedCode.id);
      showToast.success('Budget code deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchBudgetCodes();
    } catch (error) {
      console.error('Error deleting budget code:', error);
      showToast.error('Failed to delete budget code');
    }
  };



  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      nameAm: '',
      description: '',
      budgetType: 'Operating',
      fiscalYear: new Date().getFullYear().toString(),
      totalAmount: 0,
      isActive: true,
    });
    setSelectedCode(null);
  };

  const openEditModal = (code: BudgetCode) => {
    setSelectedCode(code);
    setFormData({
      code: code.code,
      name: code.name,
      nameAm: code.nameAm || '',
      description: code.description || '',
      budgetType: code.budgetType,
      fiscalYear: code.fiscalYear,
      totalAmount: code.totalAmount || 0,
      isActive: code.isActive,
    });
    setIsEditModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredCodes = budgetCodes.filter(code =>
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCodes = filteredCodes.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Code className="h-6 w-6 text-blue-600" />
              Budget Codes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage budget codes for financial planning and tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button
                onClick={fetchBudgetCodes}
                variant="outline"
                className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} />
              New Budget Code
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Codes</p>
              <p className="text-2xl font-bold text-gray-900">{budgetCodes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {budgetCodes.filter(c => c.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Types</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(budgetCodes.map(c => c.budgetType)).size}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Fiscal Years</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Set(budgetCodes.map(c => c.fiscalYear)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search budget codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiscal Year</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {paginatedCodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No budget codes found
                    </td>
                  </tr>
              ) : (
                  paginatedCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{code.code}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{code.name}</p>
                            {code.nameAm && (
                                <p className="text-xs text-gray-400">{code.nameAm}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-blue-100 text-blue-700">
                            {code.budgetType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{code.fiscalYear}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(code.totalAmount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={code.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {code.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => openEditModal(code)}
                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                title="Edit"
                            >
                              <Edit size={16} className="text-green-500" />
                            </button>
                            <button
                                onClick={() => {
                                  setSelectedCode(code);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCodes.length)} of {filteredCodes.length}
                </p>
                <div className="flex gap-2">
                  <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
                  <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isAddModalOpen ? 'Add New Budget Code' : 'Edit Budget Code'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Code *</label>
                <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., BUD-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Budget code name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name (Amharic)</label>
                <Input
                    value={formData.nameAm}
                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                    placeholder="የበጀት ኮድ ስም"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Budget Type *</label>
                <select
                    value={formData.budgetType}
                    onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Operating">Operating</option>
                  <option value="Capital">Capital</option>
                  <option value="Project">Project</option>
                  <option value="Departmental">Departmental</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Fiscal Year *</label>
                <Input
                    value={formData.fiscalYear}
                    onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                    placeholder="e.g., 2024"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total Amount</label>
                <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Budget code description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={isAddModalOpen ? handleAdd : handleEdit} className="bg-blue-600 hover:bg-blue-700">
                {isAddModalOpen ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Budget Code</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedCode?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
  );
};

export default PageBudgetCode;