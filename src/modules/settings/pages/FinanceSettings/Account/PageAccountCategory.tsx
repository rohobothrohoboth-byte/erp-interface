// src/pages/settings/finance/PageAccountCategory.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, RefreshCw,
  FolderOpen, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Save, X
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
  getAccountCategories,
  createAccountCategory,
  updateAccountCategory,
  deleteAccountCategory,
  toggleAccountCategoryStatus,
  getAccountCategoryById
} from '@/modules/finance/services/finance.api';

interface AccountCategory {
  id: string;
  code: string;
  name: string;
  nameAm?: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  parentName?: string;
  type: string;
  dateAdd: string;
  dateMod?: string;
}

const PageAccountCategory = () => {
  const [categories, setCategories] = useState<AccountCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameAm: '',
    description: '',
    type: 'Asset',
    isActive: true,
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ FIXED: Correct API call with proper response handling
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getAccountCategories();
      console.log('📦 API Response:', response);

      // ✅ Handle different response formats
      let data = [];
      if (response.data?.data) {
        data = response.data.data;
      } else if (response.data?.items) {
        data = response.data.items;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else {
        data = response.data || [];
      }

      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Create with proper payload
  const handleAdd = async () => {
    // Validate required fields
    if (!formData.code.trim()) {
      showToast.error('Code is required');
      return;
    }
    if (!formData.name.trim()) {
      showToast.error('Name is required');
      return;
    }

    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        nameAm: formData.nameAm?.trim() || '',
        description: formData.description?.trim() || '',
        type: formData.type,
        isActive: formData.isActive,
        parentId: null,
      };

      console.log('📤 Creating category with payload:', payload);

      const response = await createAccountCategory(payload);
      console.log('✅ Create response:', response);

      showToast.success('Category created successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Error creating category:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Failed to create category';
      showToast.error(errorMessage);
    }
  };

  // ✅ FIXED: Edit with proper payload
  const handleEdit = async () => {
    if (!selectedCategory) return;

    // Validate required fields
    if (!formData.code.trim()) {
      showToast.error('Code is required');
      return;
    }
    if (!formData.name.trim()) {
      showToast.error('Name is required');
      return;
    }

    try {
      const payload = {
        id: selectedCategory.id,
        code: formData.code.trim(),
        name: formData.name.trim(),
        nameAm: formData.nameAm?.trim() || '',
        description: formData.description?.trim() || '',
        type: formData.type,
        isActive: formData.isActive,
        parentId: null,
      };

      console.log('📤 Updating category with payload:', payload);

      const response = await updateAccountCategory(payload);
      console.log('✅ Update response:', response);

      showToast.success('Category updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Error updating category:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Failed to update category';
      showToast.error(errorMessage);
    }
  };

  // ✅ FIXED: Delete with proper error handling
  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      console.log('🗑️ Deleting category:', selectedCategory.id);
      await deleteAccountCategory(selectedCategory.id);
      showToast.success('Category deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Failed to delete category';
      showToast.error(errorMessage);
    }
  };

  // ✅ FIXED: Toggle status
  const handleToggleStatus = async (category: AccountCategory) => {
    try {
      await toggleAccountCategoryStatus(category.id);
      showToast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      showToast.error('Failed to toggle status');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      nameAm: '',
      description: '',
      type: 'Asset',
      isActive: true,
    });
    setSelectedCategory(null);
  };

  const openEditModal = (category: AccountCategory) => {
    setSelectedCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      nameAm: category.nameAm || '',
      description: category.description || '',
      type: category.type,
      isActive: category.isActive,
    });
    setIsEditModalOpen(true);
  };

  const filteredCategories = categories.filter(cat =>
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Asset: 'bg-blue-100 text-blue-700',
      Liability: 'bg-red-100 text-red-700',
      Equity: 'bg-purple-100 text-purple-700',
      Revenue: 'bg-green-100 text-green-700',
      Expense: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              <FolderOpen className="h-6 w-6 text-purple-600" />
              Account Categories
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage account categories and classifications for Chart of Accounts
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
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus size={16} />
              New Category
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Types</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(categories.map(c => c.type)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search by code, name, or type..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No categories match your search' : 'No categories found'}
                    </td>
                  </tr>
              ) : (
                  paginatedCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-gray-600">{category.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{category.name}</p>
                            {category.nameAm && (
                                <p className="text-xs text-gray-400">{category.nameAm}</p>
                            )}
                            {category.description && (
                                <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{category.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getTypeColor(category.type)}>
                            {category.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => handleToggleStatus(category)}
                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                title={category.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {category.isActive ? (
                                  <XCircle size={16} className="text-blue-500" />
                              ) : (
                                  <CheckCircle size={16} className="text-green-500" />
                              )}
                            </button>
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
              <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCategories.length)} of {filteredCategories.length}
                </p>
                <div className="flex gap-2">
                  <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-purple-600" />
                Add New Category
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Code *</label>
                <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., ASSET-01"
                    className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Category name"
                    className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name (Amharic)</label>
                <Input
                    value={formData.nameAm}
                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                    placeholder="የምድብ ስም"
                    className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type *</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-1"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description (optional)"
                    className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
                <Save size={16} className="mr-2" />
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsEditModalOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-green-600" />
                Edit Category
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Code *</label>
                <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., ASSET-01"
                    className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Category name"
                    className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name (Amharic)</label>
                <Input
                    value={formData.nameAm}
                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                    placeholder="የምድብ ስም"
                    className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type *</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-1"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description (optional)"
                    className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleEdit} className="bg-green-600 hover:bg-green-700">
                <Save size={16} className="mr-2" />
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Delete Category
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "<span className="font-semibold text-gray-900">{selectedCategory?.name}</span>"?
                {selectedCategory?.code && ` (${selectedCategory.code})`}
                <br /><br />
                This action cannot be undone. If this category is used by any accounts, you won't be able to delete it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
  );
};

export default PageAccountCategory;