import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "../../../../layout/layout";
import { useCRMSettings } from "../../../../hooks/useCRMSettings";
import SMSTemplatesHeader from "./SMSTemplatesHeader";
import SMSTemplatesSearchFilter from "./SMSTemplatesSearchFilter";
import SMSTemplatesTable from "./SMSTemplatesTable";
import AddSMSTemplateModal from "./AddSMSTemplateModal";
import EditSMSTemplateModal from "./EditSMSTemplateModal";
import DeleteSMSTemplateModal from "./DeleteSMSTemplateModal";

export interface SMSTemplate {
  id: string;
  name: string;
  text: string;
  is_active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

const SMSTemplatesSection: React.FC = () => {
  const { settings, saveSettings } = useCRMSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<SMSTemplate | null>(null);

  const smsTemplates: SMSTemplate[] = settings.smsTemplates || [];

  const saveSMSTemplates = async (updatedTemplates: SMSTemplate[]) => {
    await saveSettings({ smsTemplates: updatedTemplates });
  };

  const handleAddSubmit = async (templateData: Omit<SMSTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newTemplate: SMSTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    await saveSMSTemplates([...smsTemplates, newTemplate]);
    showToast.success("SMS template added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (templateData: Omit<SMSTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingTemplate) {
      const updatedTemplates = smsTemplates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, ...templateData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : t
      );
      await saveSMSTemplates(updatedTemplates);
      showToast.success("SMS template updated successfully");
      setEditingTemplate(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingTemplate) {
      const updatedTemplates = smsTemplates.filter(t => t.id !== deletingTemplate.id);
      await saveSMSTemplates(updatedTemplates);
      showToast.success("SMS template deleted successfully");
      setDeletingTemplate(null);
    }
  };

  const handleToggleActive = async (template: SMSTemplate) => {
    const updatedTemplates = smsTemplates.map(t =>
      t.id === template.id ? { ...t, is_active: !t.is_active } : t
    );
    await saveSMSTemplates(updatedTemplates);
    showToast.success(`SMS template ${!template.is_active ? 'activated' : 'deactivated'}`);
  };

  const filteredTemplates = smsTemplates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <SMSTemplatesHeader />

      <SMSTemplatesSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <SMSTemplatesTable
        templates={filteredTemplates}
        onEdit={setEditingTemplate}
        onDelete={setDeletingTemplate}
        onToggleActive={handleToggleActive}
      />

      <AddSMSTemplateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditSMSTemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onSubmit={handleEditSubmit}
        template={editingTemplate}
      />

      <DeleteSMSTemplateModal
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDeleteConfirm}
        templateName={deletingTemplate?.name || ''}
      />
    </motion.section>
  );
};

export default SMSTemplatesSection;
