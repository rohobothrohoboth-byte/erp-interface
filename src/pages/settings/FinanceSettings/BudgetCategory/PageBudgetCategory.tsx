// src/pages/settings/finance/PageBudgetCategory.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, RefreshCw,
  Layers, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Tag
} from 'lucide-react';
import { showToast } from '../../../../layout/layout';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import {
  getBudgetCategories,
  createBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory
} from '../../../../services/finance/finance.api';

interface BudgetCategory {
  id: string;
  code: string;
  name: string;
  nameAm?: string;
  description?: string;
  isActive: boolean;
  color?: string;
  icon?: string;
  dateAdd: string;
}

const PageBudgetCategory = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameAm: '',
    description: '',
    color: '#6366f1',
    isActive: true,
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ REAL API CALL
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getBudgetCategories();
      const data = response.data.data || response.data || [];
      setCategories(data);
    } catch (error) {
      console.error('Error fetching budget categories:', error);
      showToast.error('Failed to load budget categories');
    } finally {
      setLoading(false);
    }
  };

  // ✅ REAL API CALL
  const handleAdd = async () => {
    try {
      await createBudgetCategory(formData);
      showToast.success('Budget category created successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error creating budget category:', error);
      showToast.error('Failed to create budget category');
    }
  };

  // src/pages/settings/finance/PageBudgetCategory.tsx

// ✅ FIXED - Send complete DTO
  const handleEdit = async () => {
    if (!selectedCategory) return;
    try {
      const payload = {
        id: selectedCategory.id,
        code: formData.code,
        name: formData.name,
        nameAm: formData.nameAm || '',
        description: formData.description || '',
        color: formData.color || '#6366f1',
        icon: selectedCategory.icon || '',
        isActive: formData.isActive,
      };

      await updateBudgetCategory(payload);
      showToast.success('Budget category updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error updating budget category:', error);
      showToast.error('Failed to update budget category');
    }
  };

  // ✅ REAL API CALL
  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteBudgetCategory(selectedCategory.id);
      showToast.success('Budget category deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting budget category:', error);
      showToast.error('Failed to delete budget category');
    }
  };


  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      nameAm: '',
      description: '',
      color: '#6366f1',
      isActive: true,
    });
    setSelectedCategory(null);
  };

  const openEditModal = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      nameAm: category.nameAm || '',
      description: category.description || '',
      color: category.color || '#6366f1',
      isActive: category.isActive,
    });
    setIsEditModalOpen(true);
  };

  const filteredCategories = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Layers className="h-6 w-6 text-teal-600" />
              Budget Categories
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure budget categories for expense classification and tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button
                onClick={fetchCategories}
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
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              <Plus size={16} />
              New Category
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {categories.filter(c => c.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {categories.filter(c => !c.isActive).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search categories..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
              ) : (
                  paginatedCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{category.code}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{category.name}</p>
                            {category.nameAm && (
                                <p className="text-xs text-gray-400">{category.nameAm}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full border border-gray-300"
                                style={{ backgroundColor: category.color || '#6366f1' }}
                            />
                            <span className="text-xs text-gray-500">{category.color || '#6366f1'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => openEditModal(category)}
                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                title="Edit"
                            >
                              <Edit size={16} className="text-green-500" />
                            </button>
                            <button
                                onClick={() => {
                                  setSelectedCategory(category);
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCategories.length)} of {filteredCategories.length}
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
                {isAddModalOpen ? 'Add New Budget Category' : 'Edit Budget Category'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Code *</label>
                <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., BUDCAT-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Category name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name (Amharic)</label>
                <Input
                    value={formData.nameAm}
                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                    placeholder="የምድብ ስም"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-3">
                  <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#6366f1"
                      className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-teal-600 rounded"
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
              <Button onClick={isAddModalOpen ? handleAdd : handleEdit} className="bg-teal-600 hover:bg-teal-700">
                {isAddModalOpen ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
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

export default PageBudgetCategory;