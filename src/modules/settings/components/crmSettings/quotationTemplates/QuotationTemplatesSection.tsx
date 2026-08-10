import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/shared/layout/layout";
import QuotationTemplatesHeader from "@/modules/settings/components/crmSettings/quotationTemplates/QuotationTemplatesHeader";
import QuotationTemplatesSearchFilter from "@/modules/settings/components/crmSettings/quotationTemplates/QuotationTemplatesSearchFilter";
import QuotationTemplatesTable from "@/modules/settings/components/crmSettings/quotationTemplates/QuotationTemplatesTable";
import AddQuotationTemplateModal from "@/modules/settings/components/crmSettings/quotationTemplates/AddQuotationTemplateModal";
import EditQuotationTemplateModal from "@/modules/settings/components/crmSettings/quotationTemplates/EditQuotationTemplateModal";
import DeleteQuotationTemplateModal from "@/modules/settings/components/crmSettings/quotationTemplates/DeleteQuotationTemplateModal";

export interface QuotationTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  termsAndConditions: string;
  validityDays: number;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const QuotationTemplatesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuotationTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<QuotationTemplate | null>(null);

  const loadTemplates = (): QuotationTemplate[] => {
    const stored = localStorage.getItem('quotationTemplates');
    return stored ? JSON.parse(stored) : [];
  };

  const [templates, setTemplates] = useState<QuotationTemplate[]>(loadTemplates());

  const saveTemplates = (updatedTemplates: QuotationTemplate[]) => {
    localStorage.setItem('quotationTemplates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleAddSubmit = (templateData: Omit<QuotationTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newTemplate: QuotationTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveTemplates([...templates, newTemplate]);
    showToast.success("Template added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (templateData: Omit<QuotationTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingTemplate) {
      const updatedTemplates = templates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, ...templateData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : t
      );
      saveTemplates(updatedTemplates);
      showToast.success("Template updated successfully");
      setEditingTemplate(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingTemplate) {
      const updatedTemplates = templates.filter(t => t.id !== deletingTemplate.id);
      saveTemplates(updatedTemplates);
      showToast.success("Template deleted successfully");
      setDeletingTemplate(null);
    }
  };

  const handleToggleActive = (template: QuotationTemplate) => {
    const updatedTemplates = templates.map(t =>
      t.id === template.id ? { ...t, is_active: !t.is_active } : t
    );
    saveTemplates(updatedTemplates);
    showToast.success(`Template ${!template.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <QuotationTemplatesHeader />

      <QuotationTemplatesSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <QuotationTemplatesTable
        templates={filteredTemplates}
        onEdit={setEditingTemplate}
        onDelete={setDeletingTemplate}
        onToggleActive={handleToggleActive}
      />

      <AddQuotationTemplateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditQuotationTemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onSubmit={handleEditSubmit}
        template={editingTemplate}
      />

      <DeleteQuotationTemplateModal
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDeleteConfirm}
        templateName={deletingTemplate?.name || ''}
      />
    </motion.section>
  );
};

export default QuotationTemplatesSection;
