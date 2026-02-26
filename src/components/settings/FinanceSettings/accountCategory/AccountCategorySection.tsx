import React, { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { showToast } from "../../../../layout/layout";
import AccountCategoryHeader from "./AccountCategoryHeader";
import AccountCategorySearchFilter from "./AccountCategorySearchFilter";
import AccountCategoryTable from "./AccountCategoryTable";
import AddAccountCategoryModal from "./AddAccountCategoryModal";
import EditAccountCategoryModal from "./EditAccountCategoryModal";
import DeleteAccountCategoryModal from "./DeleteAccountCategoryModal";

export interface AccountCategory {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const AccountCategorySection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AccountCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<AccountCategory | null>(null);

  const loadCategories = (): AccountCategory[] => {
    const stored = localStorage.getItem('accountCategories');
    return stored ? JSON.parse(stored) : [];
  };

  const [categories, setCategories] = useState<AccountCategory[]>(loadCategories());

  const saveCategories = (updatedCategories: AccountCategory[]) => {
    localStorage.setItem('accountCategories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
  };

  const handleAddSubmit = (categoryData: Omit<AccountCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newCategory: AccountCategory = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveCategories([...categories, newCategory]);
    showToast.success("Account category added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (categoryData: Omit<AccountCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingCategory) {
      const updatedCategories = categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, ...categoryData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : c
      );
      saveCategories(updatedCategories);
      showToast.success("Account category updated successfully");
      setEditingCategory(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      const updatedCategories = categories.filter(c => c.id !== deletingCategory.id);
      saveCategories(updatedCategories);
      showToast.success("Account category deleted successfully");
      setDeletingCategory(null);
    }
  };

  const handleToggleActive = (category: AccountCategory) => {
    const updatedCategories = categories.map(c =>
      c.id === category.id ? { ...c, is_active: !c.is_active } : c
    );
    saveCategories(updatedCategories);
    showToast.success(`Account category ${!category.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <AccountCategoryHeader />

      <AccountCategorySearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AccountCategoryTable
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
            No Account Categories Found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No account categories match your search."
              : "Get started by creating your first account category."}
          </p>
        </motion.div>
      )}

      <AddAccountCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditAccountCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleEditSubmit}
        category={editingCategory}
      />

      <DeleteAccountCategoryModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        categoryName={deletingCategory?.name || ''}
      />
    </motion.section>
  );
};

export default AccountCategorySection;
