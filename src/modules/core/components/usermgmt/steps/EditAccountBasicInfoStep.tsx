// src/components/core/usermgmt/steps/EditAccountBasicInfoStep.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, ChevronRight, X, LayoutGrid, Check, Shield, Lock, KeyRound,
  HelpCircle, AlertTriangle, Copy, CheckCircle, Sparkles,
  Building2, Mail, User, Zap, Star, Activity, Settings, Users,
  DollarSign, Package, Heart, ShoppingCart, Target, Briefcase,
  Folder, BarChart, Trash2, Save, ArrowLeft, Grid, Search,
  Plus, Minus, ArrowRight, Info
} from 'lucide-react';
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authListApi } from '@/modules/list/services/auth/authList.api';
import type { RoleListItem, NameListItem } from '@/modules/list/types/NameList/nameList';
import toast from 'react-hot-toast';
import { DeleteAccountModal } from '@/modules/core/components/usermgmt/steps/DeleteAccountModal';
import type { UUID } from '@/modules/hr/types/employee';

// Module icon mapping
const MODULE_ICON_MAP: Record<string, any> = {
  'mod.core': Settings,
  'mod.hrm': Users,
  'mod.fnm': DollarSign,
  'mod.inv': Package,
  'mod.crm': Heart,
  'mod.pro': ShoppingCart,
  'mod.pld': Target,
  'mod.prm': Briefcase,
  'mod.flm': Folder,
  'mod.rpt': BarChart,
  'default': Grid
};

function getModuleCategory(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('hr') || lowerName.includes('human')) return 'HR';
  if (lowerName.includes('finance')) return 'Finance';
  if (lowerName.includes('core')) return 'Core';
  if (lowerName.includes('crm')) return 'CRM';
  if (lowerName.includes('inventory')) return 'Inventory';
  if (lowerName.includes('procurement')) return 'Procurement';
  if (lowerName.includes('file')) return 'Files';
  if (lowerName.includes('report')) return 'Reports';
  if (lowerName.includes('plan')) return 'Planning';
  if (lowerName.includes('project')) return 'Projects';
  return 'Other';
}

function getModuleColor(name: string): string {
  const category = getModuleCategory(name);
  const colors: Record<string, string> = {
    'HR': 'emerald',
    'Finance': 'blue',
    'Core': 'slate',
    'CRM': 'purple',
    'Inventory': 'orange',
    'Procurement': 'amber',
    'Files': 'teal',
    'Reports': 'cyan',
    'Planning': 'indigo',
    'Projects': 'rose',
  };
  return colors[category] || 'emerald';
}

interface EditAccountBasicInfoStepProps {
  initialData: {
    modules: string[];
    roleId?: string;
    password?: string;
  };
  onSubmit: (data: { modules: string[]; roleId?: string; changes?: any }) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  employee?: {
    id: string;
    name: string;
    employeeCode: string;
    email: string;
    department?: string;
  };
  onBackToAccounts: () => void;
  onAccountDeleted?: (result: any) => void;
  isEditMode?: boolean;
  // New prop: original modules to compare changes against
  originalModules?: string[];
  isAccountActive?: boolean;   // ✅ For account status
}

export const EditAccountBasicInfoStep: React.FC<EditAccountBasicInfoStepProps> = ({
                                                                                    initialData,
                                                                                    onSubmit,
                                                                                    onBack,
                                                                                    isLoading,
                                                                                    employee,
                                                                                    onBackToAccounts,
                                                                                    onAccountDeleted,
                                                                                    isEditMode = true,
                                                                                    originalModules = [],
                                                                                    isAccountActive = true,
                                                                                  }) => {
  const [modules, setModules] = useState<NameListItem[]>([]);
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>(initialData.modules);
  const [selectedRole, setSelectedRole] = useState<string>(initialData.roleId || '');
  const [isFetching, setIsFetching] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showChangesSummary, setShowChangesSummary] = useState(false);

  // Track original modules for change detection
  const originalModuleIds = useMemo(() => originalModules || initialData.modules || [], [originalModules, initialData.modules]);

  // Calculate changes - which modules were added or removed
  const changes = useMemo(() => {
    const current = new Set(selectedModules);
    const original = new Set(originalModuleIds);

    const added = selectedModules.filter(id => !original.has(id));
    const removed = originalModuleIds.filter(id => !current.has(id));
    const unchanged = selectedModules.filter(id => original.has(id));

    return { added, removed, unchanged };
  }, [selectedModules, originalModuleIds]);

  const hasChanges = changes.added.length > 0 || changes.removed.length > 0;

  // Fetch modules and roles
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const [modulesData, rolesData] = await Promise.all([
          authListApi.getAllModuleNames(),
          authListApi.getAllRoles()
        ]);

        // Add metadata to modules
        const modulesWithMeta = modulesData.map((module, index) => ({
          ...module,
          order: (module as any).order || index,
          category: getModuleCategory(module.name),
          color: getModuleColor(module.name),
          icon: MODULE_ICON_MAP[(module as any).key || module.name.toLowerCase()] || MODULE_ICON_MAP.default
        }));

        modulesWithMeta.sort((a, b) => ((a as any).order || 0) - ((b as any).order || 0));
        setModules(modulesWithMeta);
        setRoles(rolesData);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load modules and roles");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, []);

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
        prev.includes(moduleId)
            ? prev.filter(id => id !== moduleId)
            : [...prev, moduleId]
    );
  };

  const toggleAllModules = () => {
    if (selectedModules.length === modules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(modules.map(m => m.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedModules.length === 0) {
      toast.error("Please select at least one module");
      return;
    }

    // Show confirmation if there are changes
    if (hasChanges && isEditMode) {
      const addedNames = changes.added.map(id => modules.find(m => m.id === id)?.name || id);
      const removedNames = changes.removed.map(id => modules.find(m => m.id === id)?.name || id);

      let message = 'You are about to make the following changes:\n\n';
      if (addedNames.length > 0) {
        message += `➕ Added: ${addedNames.join(', ')}\n`;
      }
      if (removedNames.length > 0) {
        message += `➖ Removed: ${removedNames.join(', ')}\n`;
      }
      message += '\nProceed?';

      if (!confirm(message)) {
        return;
      }
    }

    await onSubmit({
      modules: selectedModules,
      roleId: selectedRole,
      changes: {
        added: changes.added.map(id => modules.find(m => m.id === id)?.name || id),
        removed: changes.removed.map(id => modules.find(m => m.id === id)?.name || id),
      }
    });

    if (hasChanges) {
      toast.success(
          `✅ ${changes.added.length} module(s) added, ${changes.removed.length} module(s) removed`
      );
    }
  };

  // Filter and group modules
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (module as any).category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const modulesByCategory = filteredModules.reduce((acc, module) => {
    const category = (module as any).category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  const categories = ['all', ...new Set(modules.map(m => (m as any).category || 'Other'))];

  // Role-based recommendations
  const currentRole = roles.find(r => r.id === selectedRole);
  const recommendedModules = useMemo(() => {
    if (!currentRole) return [];
    const roleRecommendations: Record<string, string[]> = {
      'Admin': modules.filter(m => true).map(m => m.id),
      'HR Manager': modules.filter(m => getModuleCategory(m.name) === 'HR' || getModuleCategory(m.name) === 'Core').map(m => m.id),
      'Finance Manager': modules.filter(m => getModuleCategory(m.name) === 'Finance' || getModuleCategory(m.name) === 'Core').map(m => m.id),
    };
    return roleRecommendations[currentRole.role] || [];
  }, [currentRole, modules]);

  const applyRecommendations = () => {
    const newModules = [...new Set([...selectedModules, ...recommendedModules])];
    setSelectedModules(newModules);
    toast.success(`Added ${recommendedModules.length} recommended modules`);
  };

  // Check if a module is newly added (for visual indicators)
  const isNewlyAdded = (moduleId: string) => changes.added.includes(moduleId);
  const isRemoved = (moduleId: string) => changes.removed.includes(moduleId);

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-7xl mx-auto"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {isEditMode ? 'Edit Account Modules' : 'Account Information'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure module access for this user account
                  </p>
                </div>
              </div>

              {/* Changes Counter */}
              {isEditMode && hasChanges && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {changes.added.length > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">+{changes.added.length}</span>
                  )}
                      {changes.added.length > 0 && changes.removed.length > 0 && ' | '}
                      {changes.removed.length > 0 && (
                          <span className="text-red-600 dark:text-red-400">-{changes.removed.length}</span>
                      )}
                      <span className="ml-1">changes</span>
                </span>
                  </div>
              )}

              {/* Delete Button (Edit mode only) */}
              {isEditMode && (
                  <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isFetching}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 font-medium hover:shadow-md transition-all"
                  >
                    <Trash2 size={16} />
                    Delete Account
                  </button>
              )}
            </div>

            {/* Employee Info */}
            {employee && (
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {employee.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{employee.name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {employee.employeeCode}
                    </span>
                        <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {employee.email}
                    </span>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {isEditMode ? 'Editing' : 'New Account'}
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Changes Summary Banner */}
          {isEditMode && hasChanges && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-6 mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {changes.added.length > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">+{changes.added.length} added</span>
                  )}
                      {changes.added.length > 0 && changes.removed.length > 0 && ' | '}
                      {changes.removed.length > 0 && (
                          <span className="text-red-600 dark:text-red-400">-{changes.removed.length} removed</span>
                      )}
                </span>
                  </div>
                  <button
                      type="button"
                      onClick={() => setShowChangesSummary(!showChangesSummary)}
                      className="text-xs text-amber-600 hover:text-amber-700"
                  >
                    {showChangesSummary ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Changes Details */}
                <AnimatePresence>
                  {showChangesSummary && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-1 overflow-hidden"
                      >
                        {changes.added.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-xs font-medium text-emerald-600">Added:</span>
                              {changes.added.map(id => {
                                const mod = modules.find(m => m.id === id);
                                return mod ? (
                                    <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> {mod.name}
                          </span>
                                ) : null;
                              })}
                            </div>
                        )}
                        {changes.removed.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-xs font-medium text-red-600">Removed:</span>
                              {changes.removed.map(id => {
                                const mod = modules.find(m => m.id === id);
                                return mod ? (
                                    <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                            <Minus className="w-3 h-3" /> {mod.name}
                          </span>
                                ) : null;
                              })}
                            </div>
                        )}
                      </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Role Selection (Optional - can be hidden in edit mode) */}
            {!isEditMode && roles.length > 0 && (
                <div className="mb-6">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700"
                  >
                    <option value="">Select a role...</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.role}</option>
                    ))}
                  </select>
                </div>
            )}

            {/* Module Selection Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Module Access
                </h3>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {selectedModules.length} / {modules.length} selected
              </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <input
                      type="text"
                      placeholder="Search modules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700"
                >
                  {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                  ))}
                </select>

                {/* Actions */}
                <button
                    onClick={toggleAllModules}
                    className="text-sm text-emerald-600 hover:text-emerald-700 px-2 py-1"
                >
                  {selectedModules.length === modules.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Recommendations (if role selected) */}
            {currentRole && recommendedModules.length > 0 && (
                <div className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Recommended for {currentRole.role}
                  </span>
                    </div>
                    <button
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      {showRecommendations ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {showRecommendations && (
                      <>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {recommendedModules.map(moduleId => {
                            const module = modules.find(m => m.id === moduleId);
                            if (!module) return null;
                            const isSelected = selectedModules.includes(module.id);
                            return (
                                <span
                                    key={module.id}
                                    className={`text-xs px-2 py-1 rounded-lg ${
                                        isSelected
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-white dark:bg-slate-800 text-emerald-700 border border-emerald-200'
                                    }`}
                                >
                          {isSelected ? <Check className="w-3 h-3 inline mr-1" /> : <Star className="w-3 h-3 inline mr-1" />}
                                  {module.name}
                        </span>
                            );
                          })}
                        </div>
                        <button
                            onClick={applyRecommendations}
                            className="text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
                        >
                          Apply Recommended Modules
                        </button>
                      </>
                  )}
                </div>
            )}

            {/* Modules Grid */}
            {isFetching ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse" />
                  ))}
                </div>
            ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                          <Grid className="w-4 h-4" />
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {categoryModules.map((module) => {
                            const isSelected = selectedModules.includes(module.id);
                            const isNew = isNewlyAdded(module.id);
                            const isRemovedModule = isRemoved(module.id);
                            const color = (module as any).color || 'emerald';
                            const IconComponent = (module as any).icon || Grid;

                            // Determine border and background based on change status
                            let borderClass = 'border-slate-200 dark:border-slate-700';
                            let bgClass = 'bg-white dark:bg-slate-800/50';
                            let indicator = null;

                            if (isNew && isSelected) {
                              borderClass = 'border-emerald-500 dark:border-emerald-400 border-2';
                              bgClass = 'bg-emerald-50 dark:bg-emerald-950/30';
                              indicator = (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                  </div>
                              );
                            } else if (isRemovedModule && !isSelected) {
                              borderClass = 'border-red-400 dark:border-red-500 border-2 opacity-60';
                              bgClass = 'bg-red-50 dark:bg-red-950/20';
                              indicator = (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                                    <Minus className="w-3.5 h-3.5 text-white" />
                                  </div>
                              );
                            } else if (isSelected) {
                              borderClass = `border-${color}-500 dark:border-${color}-400 shadow-md`;
                              bgClass = `bg-${color}-50 dark:bg-${color}-950/30`;
                              indicator = (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                              );
                            }

                            return (
                                <motion.button
                                    key={module.id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleModule(module.id)}
                                    className={`group relative p-4 rounded-xl border-2 text-left transition-all ${borderClass} ${bgClass}`}
                                >
                                  {indicator}

                                  <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/50 flex items-center justify-center mb-3 transition-colors group-hover:bg-${color}-200`}>
                                    <IconComponent className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                                  </div>

                                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {module.name}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {category}
                                  </p>

                                  {/* Change label */}
                                  {isNew && isSelected && (
                                      <p className="text-xs text-emerald-600 font-medium mt-1">✨ Newly Added</p>
                                  )}
                                  {isRemovedModule && !isSelected && (
                                      <p className="text-xs text-red-600 font-medium mt-1">🗑️ Removed</p>
                                  )}
                                </motion.button>
                            );
                          })}
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {/* Selected Modules Summary */}
            {selectedModules.length > 0 && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Selected Modules
                  {hasChanges && (
                      <span className="text-xs text-slate-400 ml-2">
                      ({changes.added.length} added, {changes.removed.length} removed)
                    </span>
                  )}
                </span>
                    <span className="text-xs text-slate-500">{selectedModules.length} modules selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedModules.slice(0, 12).map(moduleId => {
                      const module = modules.find(m => m.id === moduleId);
                      if (!module) return null;
                      const color = (module as any).color || 'emerald';
                      const isNew = isNewlyAdded(moduleId);
                      const isRemovedModule = isRemoved(moduleId);

                      return (
                          <span
                              key={moduleId}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                                  isNew
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300'
                                      : isRemovedModule
                                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-300'
                                          : `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/50 dark:text-${color}-300`
                              }`}
                          >
                      {module.name}
                            {isNew && <Plus className="w-3 h-3 ml-0.5" />}
                            {isRemovedModule && <Minus className="w-3 h-3 ml-0.5" />}
                    </span>
                      );
                    })}
                    {selectedModules.length > 12 && (
                        <span className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-700 text-slate-600">
                    +{selectedModules.length - 12} more
                  </span>
                    )}
                  </div>
                </div>
            )}

            {/* Error State */}
            {selectedModules.length === 0 && !isFetching && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Please select at least one module to continue
                    </p>
                  </div>
                </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-between items-center">
              <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isLoading || isFetching}
                  className="gap-2 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel
              </Button>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''} selected
                  </p>
                  {selectedModules.length > 0 && (
                      <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1 justify-end">
                        <CheckCircle className="w-3 h-3" /> Ready to proceed
                      </p>
                  )}
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || isFetching || selectedModules.length === 0}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6"
                >
                  {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                  ) : (
                      <>
                        {isEditMode ? 'Update Modules' : 'Next Step'}
                        <ChevronRight className="w-4 h-4" />
                      </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        <DeleteAccountModal
            isOpen={showDeleteConfirm}
            userId={employee?.id as UUID | undefined}
            userName={employee?.name}
            userEmail={employee?.email}
            onClose={() => {
              setShowDeleteConfirm(false);
              onAccountDeleted?.({ success: true, userId: employee?.id });
            }}
        />
      </motion.div>
  );
};