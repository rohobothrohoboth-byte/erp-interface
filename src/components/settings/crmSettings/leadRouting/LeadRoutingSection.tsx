import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { showToast } from "../../../../layout/layout";
import LeadRoutingHeader from "./LeadRoutingHeader";
import LeadRoutingSearchFilter from "./LeadRoutingSearchFilter";
import LeadRoutingTable from "./LeadRoutingTable";
import AddRoutingRuleModal from "./AddRoutingRuleModal";
import EditRoutingRuleModal from "./EditRoutingRuleModal";
import DeleteRoutingRuleModal from "./DeleteRoutingRuleModal";
import RoutingConditionModal from "./RoutingConditionModal";

export interface RoutingRule {
  id: string;
  name: string;
  description: string;
  conditions: RoutingCondition[];
  assignTo: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface RoutingCondition {
  field: string;
  operator: string;
  value: string;
}

const LeadRoutingSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RoutingRule | null>(null);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<RoutingRule | null>(null);

  // Load routing rules from localStorage
  const loadRoutingRules = (): RoutingRule[] => {
    const stored = localStorage.getItem('routingRules');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing routing rules:', error);
      }
    }
    return [];
  };

  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(loadRoutingRules());

  const saveRoutingRules = (rules: RoutingRule[]) => {
    localStorage.setItem('routingRules', JSON.stringify(rules));
    setRoutingRules(rules);
  };

  const handleAddSubmit = (ruleData: Omit<RoutingRule, 'id' | 'conditions' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newRule: RoutingRule = {
      ...ruleData,
      id: Date.now().toString(),
      conditions: [],
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveRoutingRules([...routingRules, newRule]);
    showToast.success("Routing rule added successfully");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (ruleData: Omit<RoutingRule, 'id' | 'conditions' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingRule) {
      const updatedRules = routingRules.map(rule =>
        rule.id === editingRule.id
          ? { ...rule, ...ruleData, updatedAt: new Date().toISOString(), updatedBy: 'Current User' }
          : rule
      );
      saveRoutingRules(updatedRules);
      showToast.success("Routing rule updated successfully");
      setEditingRule(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingRule) {
      const updatedRules = routingRules.filter(r => r.id !== deletingRule.id);
      saveRoutingRules(updatedRules);
      showToast.success("Routing rule deleted successfully");
      setDeletingRule(null);
    }
  };

  const handleToggleActive = (rule: RoutingRule) => {
    const updatedRules = routingRules.map(r =>
      r.id === rule.id ? { ...r, isActive: !r.isActive } : r
    );
    saveRoutingRules(updatedRules);
    showToast.success(`Routing rule ${!rule.isActive ? 'activated' : 'deactivated'}`);
  };

  const handleConditionClick = (rule: RoutingRule) => {
    setSelectedRule(rule);
    setIsConditionModalOpen(true);
  };

  // Filter and sort rules
  const filteredRules = routingRules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRules = filteredRules.sort((a, b) => a.priority - b.priority);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <LeadRoutingHeader />

      <LeadRoutingSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <LeadRoutingTable
        rules={sortedRules}
        onEdit={setEditingRule}
        onDelete={setDeletingRule}
        onToggleActive={handleToggleActive}
        onManageConditions={handleConditionClick}
      />

      {sortedRules.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg border"
        >
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Routing Rules Found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No routing rules match your search."
              : "Get started by creating your first routing rule."}
          </p>
        </motion.div>
      )}

      <AddRoutingRuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditRoutingRuleModal
        isOpen={!!editingRule}
        onClose={() => setEditingRule(null)}
        onSubmit={handleEditSubmit}
        rule={editingRule}
      />

      <DeleteRoutingRuleModal
        isOpen={!!deletingRule}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleDeleteConfirm}
        ruleName={deletingRule?.name || ''}
      />

      {selectedRule && (
        <RoutingConditionModal
          isOpen={isConditionModalOpen}
          onClose={() => {
            setIsConditionModalOpen(false);
            setSelectedRule(null);
          }}
          ruleId={selectedRule.id}
          ruleName={selectedRule.name}
        />
      )}
    </motion.section>
  );
};

export default LeadRoutingSection;
