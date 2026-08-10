import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  Shield,
  Lock,
  Key,
  Sparkles,
  AlertCircle,
  FileText,
  Server,
  Database,
  Users
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import toast from 'react-hot-toast';

interface ApiPermissionsStepProps {
  initialData: {
    apiPermissions: string[];
  };
  onSubmit: (data: any) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  apiPermissions: Array<{
    id: string;
    name: string;
    mainPermissionId: string;
    action: string;
    resource: string;
    description?: string;
  }>;
  selectedPermissions: string[];
  mainPermissionsList?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export const ApiPermissionsStep: React.FC<ApiPermissionsStepProps> = ({
                                                                        initialData,
                                                                        onSubmit,
                                                                        onBack,
                                                                        isLoading,
                                                                        apiPermissions,
                                                                        selectedPermissions,
                                                                        mainPermissionsList = [],
                                                                      }) => {
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(initialData);
  const [expandedMainPermissions, setExpandedMainPermissions] = useState<Record<string, boolean>>({});
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    apiPermissions.forEach(apiPermission => {
      if (!initialExpanded[apiPermission.mainPermissionId]) {
        initialExpanded[apiPermission.mainPermissionId] = false;
      }
    });
    setExpandedMainPermissions(initialExpanded);
  }, [apiPermissions]);

  const getMainPermissionName = useCallback((permissionId: string) => {
    if (mainPermissionsList && mainPermissionsList.length > 0) {
      const mainPerm = mainPermissionsList.find(p => p.id === permissionId);
      return mainPerm?.name || permissionId.replace('perm_', '').replace(/_/g, ' ');
    }
    return permissionId.replace('perm_', '').replace(/_/g, ' ');
  }, [mainPermissionsList]);

  const getPermissionIcon = (permissionName: string) => {
    const name = permissionName.toLowerCase();
    if (name.includes('user')) return <Users className="w-4 h-4" />;
    if (name.includes('role')) return <Shield className="w-4 h-4" />;
    if (name.includes('module')) return <Database className="w-4 h-4" />;
    if (name.includes('api')) return <Server className="w-4 h-4" />;
    return <Key className="w-4 h-4" />;
  };

  const groupedApiPermissions = useMemo(() => {
    const grouped: Record<string, typeof apiPermissions> = {};
    apiPermissions.forEach(apiPermission => {
      if (!grouped[apiPermission.mainPermissionId]) {
        grouped[apiPermission.mainPermissionId] = [];
      }
      grouped[apiPermission.mainPermissionId].push(apiPermission);
    });
    return grouped;
  }, [apiPermissions]);

  const filteredApiPermissions = useMemo(() => {
    const filtered: Record<string, typeof apiPermissions> = {};
    Object.entries(groupedApiPermissions).forEach(([mainPermId, groupPermissions]) => {
      const filteredGroupPermissions = groupPermissions.filter(apiPermission =>
          apiPermission.name.toLowerCase().includes(search.toLowerCase()) ||
          apiPermission.action.toLowerCase().includes(search.toLowerCase()) ||
          apiPermission.resource.toLowerCase().includes(search.toLowerCase()) ||
          (apiPermission.description && apiPermission.description.toLowerCase().includes(search.toLowerCase()))
      );
      if (filteredGroupPermissions.length > 0) {
        filtered[mainPermId] = filteredGroupPermissions;
      }
    });
    return filtered;
  }, [groupedApiPermissions, search]);

  const handleApiPermissionChange = useCallback((apiPermissionId: string) => {
    setFormData(prev => {
      if (prev.apiPermissions.includes(apiPermissionId)) {
        return {
          ...prev,
          apiPermissions: prev.apiPermissions.filter(id => id !== apiPermissionId)
        };
      } else {
        return {
          ...prev,
          apiPermissions: [...prev.apiPermissions, apiPermissionId]
        };
      }
    });
  }, []);

  const handleSelectAllInGroup = useCallback((mainPermId: string, groupPermissions: typeof apiPermissions) => {
    const groupPermissionIds = groupPermissions.map(p => p.id);
    const allSelected = groupPermissionIds.every(id => formData.apiPermissions.includes(id));
    setFormData(prev => {
      if (allSelected) {
        return {
          ...prev,
          apiPermissions: prev.apiPermissions.filter(id => !groupPermissionIds.includes(id))
        };
      } else {
        const newApiPermissions = [...prev.apiPermissions];
        groupPermissionIds.forEach(id => {
          if (!newApiPermissions.includes(id)) {
            newApiPermissions.push(id);
          }
        });
        return { apiPermissions: newApiPermissions };
      }
    });
  }, [formData.apiPermissions]);

  const handleSelectAll = useCallback(() => {
    const allIds = apiPermissions.map(p => p.id);
    setFormData({ apiPermissions: allIds });
  }, [apiPermissions]);

  const handleClearAll = useCallback(() => {
    setFormData({ apiPermissions: [] });
  }, []);

  const toggleMainPermissionExpansion = useCallback((mainPermId: string) => {
    setExpandedMainPermissions(prev => ({
      ...prev,
      [mainPermId]: !prev[mainPermId]
    }));
  }, []);

  const expandAllMainPermissions = useCallback(() => {
    const newExpanded: Record<string, boolean> = {};
    Object.keys(groupedApiPermissions).forEach(mainPermId => {
      newExpanded[mainPermId] = true;
    });
    setExpandedMainPermissions(newExpanded);
  }, [groupedApiPermissions]);

  const collapseAllMainPermissions = useCallback(() => {
    const newExpanded: Record<string, boolean> = {};
    Object.keys(groupedApiPermissions).forEach(mainPermId => {
      newExpanded[mainPermId] = false;
    });
    setExpandedMainPermissions(newExpanded);
  }, [groupedApiPermissions]);

  // IMPORTANT: This only saves selections and goes to review - NO API CALL!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('=== API PERMISSIONS STEP - GOING TO REVIEW ===');
    console.log('Selected API permissions count:', formData.apiPermissions.length);

    if (formData.apiPermissions.length === 0) {
      const confirmContinue = window.confirm('No API permissions selected. Are you sure you want to continue to review?');
      if (!confirmContinue) return;
    }

    // Just save the selections and go to review step
    await onSubmit(formData);
  };

  const getGroupSelectionStats = useCallback((groupPermissions: typeof apiPermissions) => {
    const selectedCount = groupPermissions.filter(p => formData.apiPermissions.includes(p.id)).length;
    const totalCount = groupPermissions.length;
    return { selectedCount, totalCount };
  }, [formData.apiPermissions]);

  const totalPermissions = selectedPermissions.length + formData.apiPermissions.length;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.3 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.3 }
    }
  };

  const headerVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  const buttonVariants = {
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  };

  const groupVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.15 : 0.2 }
    }
  };

  return (
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full"
      >
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 transition-colors duration-200">
          {/* Header Section */}
          <motion.div variants={headerVariants} className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Access Permissions
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure detailed API permissions for the user
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                <span className="font-bold">{selectedPermissions.length}</span> main permissions selected
              </span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            {/* Search and Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                <Input
                    type="text"
                    placeholder="Search detailed permissions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full rounded-xl dark:bg-slate-900 dark:border-slate-700"
                    disabled={isLoading}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={expandAllMainPermissions}
                    disabled={isLoading || apiPermissions.length === 0}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Expand All
                </motion.button>
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={collapseAllMainPermissions}
                    disabled={isLoading || apiPermissions.length === 0}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Collapse All
                </motion.button>
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={handleSelectAll}
                    disabled={isLoading || apiPermissions.length === 0}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Select All
                </motion.button>
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={handleClearAll}
                    disabled={isLoading || formData.apiPermissions.length === 0}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                >
                  Clear All
                </motion.button>
              </div>
            </div>

            {/* Permissions List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {Object.keys(filteredApiPermissions).length > 0 ? (
                  <AnimatePresence mode="wait">
                    {Object.entries(filteredApiPermissions).map(([mainPermId, groupPermissions]) => {
                      const isExpanded = expandedMainPermissions[mainPermId] || false;
                      const stats = getGroupSelectionStats(groupPermissions);
                      const mainPermName = getMainPermissionName(mainPermId);
                      const PermIcon = getPermissionIcon(mainPermName);

                      return (
                          <motion.div
                              key={mainPermId}
                              variants={groupVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
                          >
                            <div
                                className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => toggleMainPermissionExpansion(mainPermId)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    {PermIcon}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                                      {mainPermName}
                                      <span className="text-xs ml-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                  {groupPermissions.length}
                                </span>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stats.selectedCount / stats.totalCount) * 100}%` }} />
                                      </div>
                                      <span className="text-xs text-slate-500">{stats.selectedCount}/{stats.totalCount}</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectAllInGroup(mainPermId, groupPermissions);
                                    }}
                                    className="px-3 py-1 text-xs rounded-lg border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                >
                                  {stats.selectedCount === groupPermissions.length ? 'Deselect' : 'Select All'}
                                </button>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                  <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="p-4 space-y-2"
                                  >
                                    {groupPermissions.map(apiPermission => (
                                        <label key={apiPermission.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                                          <Checkbox
                                              checked={formData.apiPermissions.includes(apiPermission.id)}
                                              onCheckedChange={() => handleApiPermissionChange(apiPermission.id)}
                                          />
                                          <span className="text-sm flex-1">{apiPermission.name}</span>
                                          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">{apiPermission.action}</span>
                                        </label>
                                    ))}
                                  </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                      );
                    })}
                  </AnimatePresence>
              ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">No permissions found</p>
                  </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{selectedPermissions.length}</div>
                  <div className="text-xs text-slate-500">Menu Permissions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{formData.apiPermissions.length}</div>
                  <div className="text-xs text-slate-500">API Permissions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{totalPermissions}</div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={onBack} disabled={isLoading}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                Review & Continue
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
  );
};