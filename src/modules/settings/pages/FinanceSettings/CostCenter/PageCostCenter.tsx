// src/pages/settings/finance/PageCostCenter.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, RefreshCw,
  Network, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Users, Building2
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
  getCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter
} from '@/modules/finance/services/finance.api';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  nameAm?: string;
  description?: string;
  isActive: boolean;
  departmentId?: string;
  departmentName?: string;
  budgetHolder?: string;
  dateAdd: string;
}

const PageCostCenter = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<CostCenter | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameAm: '',
    description: '',
    departmentId: '',
    budgetHolder: '',
    isActive: true,
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCostCenters();
  }, []);

  // ✅ REAL API CALL
  const fetchCostCenters = async () => {
    setLoading(true);
    try {
      const response = await getCostCenters();
      const data = response.data.data || response.data || [];
      setCostCenters(data);
    } catch (error) {
      console.error('Error fetching cost centers:', error);
      showToast.error('Failed to load cost centers');
    } finally {
      setLoading(false);
    }
  };

  // ✅ REAL API CALL
  const handleAdd = async () => {
    try {
      await createCostCenter(formData);
      showToast.success('Cost center created successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchCostCenters();
    } catch (error) {
      console.error('Error creating cost center:', error);
      showToast.error('Failed to create cost center');
    }
  };

// src/pages/settings/finance/PageCostCenter.tsx

// ✅ FIXED - Send complete DTO
  const handleEdit = async () => {
    if (!selectedCenter) return;
    try {
      const payload = {
        id: selectedCenter.id,
        code: formData.code,
        name: formData.name,
        nameAm: formData.nameAm || '',
        description: formData.description || '',
        isActive: formData.isActive,
        departmentId: formData.departmentId || null,
        budgetHolder: formData.budgetHolder || '',
        parentId: selectedCenter.parentId || null,
      };

      await updateCostCenter(payload);
      showToast.success('Cost center updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      fetchCostCenters();
    } catch (error) {
      console.error('Error updating cost center:', error);
      showToast.error('Failed to update cost center');
    }
  };

  // ✅ REAL API CALL
  const handleDelete = async () => {
    if (!selectedCenter) return;
    try {
      await deleteCostCenter(selectedCenter.id);
      showToast.success('Cost center deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchCostCenters();
    } catch (error) {
      console.error('Error deleting cost center:', error);
      showToast.error('Failed to delete cost center');
    }
  };



  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      nameAm: '',
      description: '',
      departmentId: '',
      budgetHolder: '',
      isActive: true,
    });
    setSelectedCenter(null);
  };

  const openEditModal = (center: CostCenter) => {
    setSelectedCenter(center);
    setFormData({
      code: center.code,
      name: center.name,
      nameAm: center.nameAm || '',
      description: center.description || '',
      departmentId: center.departmentId || '',
      budgetHolder: center.budgetHolder || '',
      isActive: center.isActive,
    });
    setIsEditModalOpen(true);
  };

  const filteredCenters = costCenters.filter(center =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCenters = filteredCenters.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
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
              <Network className="h-6 w-6 text-violet-600" />
              Cost Centers
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage cost center hierarchy and structure
            </p>
          </div>
          <div className="flex gap-2">
            <Button
                onClick={fetchCostCenters}
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
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700"
            >
              <Plus size={16} />
              New Cost Center
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Centers</p>
              <p className="text-2xl font-bold text-gray-900">{costCenters.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {costCenters.filter(c => c.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {costCenters.filter(c => !c.isActive).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search cost centers..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget Holder</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {paginatedCenters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No cost centers found
                    </td>
                  </tr>
              ) : (
                  paginatedCenters.map((center) => (
                      <tr key={center.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{center.code}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{center.name}</p>
                            {center.nameAm && (
                                <p className="text-xs text-gray-400">{center.nameAm}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {center.departmentName || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {center.budgetHolder || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={center.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {center.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => openEditModal(center)}
                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                title="Edit"
                            >
                              <Edit size={16} className="text-green-500" />
                            </button>
                            <button
                                onClick={() => {
                                  setSelectedCenter(center);
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCenters.length)} of {filteredCenters.length}
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
                {isAddModalOpen ? 'Add New Cost Center' : 'Edit Cost Center'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Code *</label>
                <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CC-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Cost center name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name (Amharic)</label>
                <Input
                    value={formData.nameAm}
                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                    placeholder="የወጪ ማእከል ስም"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Input
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    placeholder="Department ID"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Budget Holder</label>
                <Input
                    value={formData.budgetHolder}
                    onChange={(e) => setFormData({ ...formData, budgetHolder: e.target.value })}
                    placeholder="Person responsible"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Cost center description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-violet-600 rounded"
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
              <Button onClick={isAddModalOpen ? handleAdd : handleEdit} className="bg-violet-600 hover:bg-violet-700">
                {isAddModalOpen ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Cost Center</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedCenter?.name}"? This action cannot be undone.
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

export default PageCostCenter;