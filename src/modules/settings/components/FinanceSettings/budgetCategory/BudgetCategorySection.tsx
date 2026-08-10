import React, { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { showToast } from "@/shared/layout/layout";
import BudgetCategoryHeader from "@/modules/settings/components/FinanceSettings/budgetCategory/BudgetCategoryHeader";
import BudgetCategorySearchFilter from "@/modules/settings/components/FinanceSettings/budgetCategory/BudgetCategorySearchFilter";
import BudgetCategoryTable from "@/modules/settings/components/FinanceSettings/budgetCategory/BudgetCategoryTable";
import AddBudgetCategoryModal from "@/modules/settings/components/FinanceSettings/budgetCategory/AddBudgetCategoryModal";
import EditBudgetCategoryModal from "@/modules/settings/components/FinanceSettings/budgetCategory/EditBudgetCategoryModal";
import DeleteBudgetCategoryModal from "@/modules/settings/components/FinanceSettings/budgetCategory/DeleteBudgetCategoryModal";

export interface BudgetCategory {
  id: string;
  categoryNameEn: string;
  categoryNameAm: string;
  categoryCode: string;
  description: string;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const BudgetCategorySection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<BudgetCategory | null>(null);

  const loadCategories = (): BudgetCategory[] => {
    const stored = localStorage.getItem('budgetCategories');
    if (stored) {
      return JSON.parse(stored);
    }
    // Mock data
    const mockData: BudgetCategory[] = [
      {
        id: '1',
        categoryNameEn: 'Supplies & Materials',
        categoryNameAm: 'አላቂ ዕቃዎች',
        categoryCode: '2200',
        description: 'Stationery, fuel, uniforms, and cleaning supplies.',
        is_active: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System'
      },
      {
        id: '2',
        categoryNameEn: 'Utilities',
        categoryNameAm: 'መገልገያዎች',
        categoryCode: '2300',
        description: 'Electricity, water, telephone, and internet services.',
        is_active: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System'
      },
      {
        id: '3',
        categoryNameEn: 'Travel & Transportation',
        categoryNameAm: 'ጉዞ እና ትራንስፖርት',
        categoryCode: '2400',
        description: 'Travel expenses, vehicle maintenance, and fuel costs.',
        is_active: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System'
      }
    ];
    localStorage.setItem('budgetCategories', JSON.stringify(mockData));
    return mockData;
  };

  const [categories, setCategories] = useState<BudgetCategory[]>(loadCategories());

  const saveCategories = (updatedCategories: BudgetCategory[]) => {
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
  };

  const handleAddSubmit = (categoryData: Omit<BudgetCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newCategory: BudgetCategory = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveCategories([...categories, newCategory]);
    showToast.success("Budget category added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (categoryData: Omit<BudgetCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingCategory) {
      const updatedCategories = categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, ...categoryData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : c
      );
      saveCategories(updatedCategories);
      showToast.success("Budget category updated successfully");
      setEditingCategory(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      const updatedCategories = categories.filter(c => c.id !== deletingCategory.id);
      saveCategories(updatedCategories);
      showToast.success("Budget category deleted successfully");
      setDeletingCategory(null);
    }
  };

  const handleToggleActive = (category: BudgetCategory) => {
    const updatedCategories = categories.map(c =>
      c.id === category.id ? { ...c, is_active: !c.is_active } : c
    );
    saveCategories(updatedCategories);
    showToast.success(`Budget category ${!category.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredCategories = categories.filter(c =>
    c.categoryNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.categoryNameAm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <BudgetCategoryHeader />

      <BudgetCategorySearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <BudgetCategoryTable
        categories={filteredCategories}
        onEdit={setEditingCategory}
        onDelete={setDeletingCategory}
        onToggleActive={handleToggleActive}
      />

      {filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg border"
        >
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Budget Categories Found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No budget categories match your search."
              : "Get started by creating your first budget category."}
          </p>
        </motion.div>
      )}

      <AddBudgetCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditBudgetCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleEditSubmit}
        category={editingCategory}
      />

      <DeleteBudgetCategoryModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        categoryName={deletingCategory?.categoryNameEn || ''}
      />
    </motion.section>
  );
};

export default BudgetCategorySection;
