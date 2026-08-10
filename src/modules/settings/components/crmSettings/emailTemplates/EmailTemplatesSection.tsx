import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/shared/layout/layout";
import EmailTemplatesHeader from "@/modules/settings/components/crmSettings/emailTemplates/EmailTemplatesHeader";
import EmailTemplatesSearchFilter from "@/modules/settings/components/crmSettings/emailTemplates/EmailTemplatesSearchFilter";
import EmailTemplatesTable from "@/modules/settings/components/crmSettings/emailTemplates/EmailTemplatesTable";
import AddEmailTemplateModal from "@/modules/settings/components/crmSettings/emailTemplates/AddEmailTemplateModal";
import EditEmailTemplateModal from "@/modules/settings/components/crmSettings/emailTemplates/EditEmailTemplateModal";
import DeleteEmailTemplateModal from "@/modules/settings/components/crmSettings/emailTemplates/DeleteEmailTemplateModal";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const EmailTemplatesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<EmailTemplate | null>(null);

  const loadTemplates = (): EmailTemplate[] => {
    const stored = localStorage.getItem('emailTemplates');
    return stored ? JSON.parse(stored) : [];
  };

  const [templates, setTemplates] = useState<EmailTemplate[]>(loadTemplates());

  const saveTemplates = (updatedTemplates: EmailTemplate[]) => {
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleAddSubmit = (templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newTemplate: EmailTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveTemplates([...templates, newTemplate]);
    showToast.success("Template added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
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

  const handleToggleActive = (template: EmailTemplate) => {
    const updatedTemplates = templates.map(t =>
      t.id === template.id ? { ...t, is_active: !t.is_active } : t
    );
    saveTemplates(updatedTemplates);
    showToast.success(`Template ${!template.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <EmailTemplatesHeader />

      <EmailTemplatesSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <EmailTemplatesTable
        templates={filteredTemplates}
        onEdit={setEditingTemplate}
        onDelete={setDeletingTemplate}
        onToggleActive={handleToggleActive}
      />

      <AddEmailTemplateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditEmailTemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onSubmit={handleEditSubmit}
        template={editingTemplate}
      />

      <DeleteEmailTemplateModal
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDeleteConfirm}
        templateName={deletingTemplate?.name || ''}
      />
    </motion.section>
  );
};

export default EmailTemplatesSection;
