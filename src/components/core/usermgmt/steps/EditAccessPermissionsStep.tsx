// steps/EditAccessPermissionsStep.tsx - COMPLETE FIXED VERSION

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Check, ChevronDown, Save, X, Key, ShieldCheck,
  AlertCircle, Loader2, FileText, Plus, Minus, ArrowRight,
  FolderTree, LayoutDashboard, Users, DollarSign, Calendar,
  Clock, Briefcase, Building, CreditCard, Shield, UserCheck,
  BarChart, FileCheck, Settings, Database, Package, Truck,
  ShoppingCart, Target, Flag, Layers, FileSpreadsheet,
  GraduationCap, UserPlus, UserX, ClipboardCheck, GitBranch,
  Play, CheckCircle, RefreshCw, AlertTriangle, History
} from "lucide-react";
import { Button } from "../../../ui/button";
import { Checkbox } from "../../../ui/checkbox";
import { Input } from "../../../ui/input";
import { Badge } from "../../../ui/badge";
import { api } from "../../../../services/api";
import type { EditWizardFormData } from "../steps/EditAccountWizard";
import toast from 'react-hot-toast';
import { getAllMenus, saveUserPermissions } from "../../../../services/auth/account/account.api";
interface Props {
  selectedMenuIds: string[];
  selectedModuleIds: string[];
  userId: string;
  initialData: EditWizardFormData["step3"];
  onSave: (data: EditWizardFormData["step3"]) => void;
  onCancel: () => void;
  saving?: boolean;
  onFormChange?: () => void;
  originalApiActionIds?: string[];
}

interface ApiAction {
  id: string;
  name: string;
  key?: string;
  description?: string;
}

interface MenuWithApis {
  menuId: string;
  menuName: string;
  key: string;
  parentKey: string;
  isChild: boolean;
  module: string;
  moduleId?: string;
  actions: ApiAction[];
  children?: MenuWithApis[];
}

interface ModuleGroup {
  moduleName: string;
  moduleId?: string;
  icon?: React.ReactNode;
  menus: MenuWithApis[];
}

// Module icon mapping
const getModuleIcon = (moduleName: string): React.ReactNode => {
  const name = moduleName.toLowerCase();
  if (name.includes('human resource')) return <Users className="w-4 h-4 text-indigo-500" />;
  if (name.includes('financial')) return <DollarSign className="w-4 h-4 text-emerald-500" />;
  if (name.includes('procurement')) return <ShoppingCart className="w-4 h-4 text-blue-500" />;
  if (name.includes('crm') || name.includes('customer')) return <UserCheck className="w-4 h-4 text-purple-500" />;
  if (name.includes('inventory')) return <Package className="w-4 h-4 text-amber-500" />;
  if (name.includes('project')) return <Briefcase className="w-4 h-4 text-cyan-500" />;
  if (name.includes('core')) return <Settings className="w-4 h-4 text-gray-500" />;
  if (name.includes('file')) return <FileText className="w-4 h-4 text-rose-500" />;
  if (name.includes('plan') || name.includes('development')) return <Target className="w-4 h-4 text-teal-500" />;
  if (name.includes('report')) return <BarChart className="w-4 h-4 text-violet-500" />;
  return <FolderTree className="w-4 h-4 text-gray-500" />;
};

// Menu icon mapping
const getMenuIcon = (menuName: string): React.ReactNode => {
  const name = menuName.toLowerCase();
  if (name.includes('dashboard')) return <LayoutDashboard className="w-3.5 h-3.5" />;
  if (name.includes('employee') || name.includes('staff')) return <Users className="w-3.5 h-3.5" />;
  if (name.includes('payroll')) return <DollarSign className="w-3.5 h-3.5" />;
  if (name.includes('leave')) return <Calendar className="w-3.5 h-3.5" />;
  if (name.includes('attendance')) return <Clock className="w-3.5 h-3.5" />;
  if (name.includes('recruitment') || name.includes('recruit')) return <Briefcase className="w-3.5 h-3.5" />;
  if (name.includes('finance') || name.includes('account')) return <Building className="w-3.5 h-3.5" />;
  if (name.includes('procurement') || name.includes('purchase')) return <ShoppingCart className="w-3.5 h-3.5" />;
  if (name.includes('tax')) return <Shield className="w-3.5 h-3.5" />;
  if (name.includes('hr')) return <UserCheck className="w-3.5 h-3.5" />;
  if (name.includes('report')) return <BarChart className="w-3.5 h-3.5" />;
  if (name.includes('document') || name.includes('file')) return <FileText className="w-3.5 h-3.5" />;
  if (name.includes('setting') || name.includes('config')) return <Settings className="w-3.5 h-3.5" />;
  if (name.includes('database') || name.includes('backup')) return <Database className="w-3.5 h-3.5" />;
  if (name.includes('vendor')) return <Truck className="w-3.5 h-3.5" />;
  if (name.includes('invoice')) return <FileCheck className="w-3.5 h-3.5" />;
  if (name.includes('project')) return <Briefcase className="w-3.5 h-3.5" />;
  if (name.includes('task')) return <ClipboardCheck className="w-3.5 h-3.5" />;
  if (name.includes('audit') || name.includes('history')) return <History className="w-3.5 h-3.5" />;
  if (name.includes('role') || name.includes('permission')) return <Shield className="w-3.5 h-3.5" />;
  if (name.includes('user')) return <UserCheck className="w-3.5 h-3.5" />;
  if (name.includes('branch') || name.includes('company')) return <Building className="w-3.5 h-3.5" />;
  return <FolderTree className="w-3.5 h-3.5" />;
};

// Get action type
const getActionType = (key: string): string => {
  if (!key) return 'ACTION';
  const upper = key.toUpperCase();
  if (upper.includes('CREATE') || upper.includes('ADD')) return 'CREATE';
  if (upper.includes('EDIT') || upper.includes('UPDATE') || upper.includes('MODIFY')) return 'EDIT';
  if (upper.includes('DELETE') || upper.includes('REMOVE')) return 'DELETE';
  if (upper.includes('VIEW') || upper.includes('GET') || upper.includes('LIST') || upper.includes('SEARCH')) return 'VIEW';
  if (upper.includes('APPROVE')) return 'APPROVE';
  if (upper.includes('EXPORT') || upper.includes('DOWNLOAD')) return 'EXPORT';
  if (upper.includes('IMPORT') || upper.includes('UPLOAD')) return 'IMPORT';
  if (upper.includes('PRINT')) return 'PRINT';
  return 'ACTION';
};

// Get action color
const getActionColor = (type: string): string => {
  const colors: Record<string, string> = {
    'CREATE': "bg-green-100 text-green-700",
    'EDIT': "bg-blue-100 text-blue-700",
    'DELETE': "bg-red-100 text-red-700",
    'VIEW': "bg-gray-100 text-gray-700",
    'APPROVE': "bg-purple-100 text-purple-700",
    'EXPORT': "bg-amber-100 text-amber-700",
    'IMPORT': "bg-cyan-100 text-cyan-700",
    'PRINT': "bg-indigo-100 text-indigo-700",
  };
  return colors[type] || "bg-gray-100 text-gray-600";
};

export function EditAccessPermissionsStep({
                                            selectedMenuIds,
                                            selectedModuleIds,
                                            userId,
                                            initialData,
                                            onSave,
                                            onCancel,
                                            saving,
                                            onFormChange,
                                            originalApiActionIds = []
                                          }: Props) {
  const [selected, setSelected] = useState<string[]>(initialData.accessIds || []);
  const [moduleGroups, setModuleGroups] = useState<ModuleGroup[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string>("");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "selected" | "unselected">("all");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangesSummary, setShowChangesSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate changes
  const changes = useMemo(() => {
    const currentIds = selected || [];
    const originalIds = originalApiActionIds || [];

    const validCurrent = currentIds.filter(id => id && id.length > 0);
    const validOriginal = originalIds.filter(id => id && id.length > 0);

    const current = new Set(validCurrent);
    const original = new Set(validOriginal);

    const added = validCurrent.filter(id => !original.has(id));
    const removed = validOriginal.filter(id => !current.has(id));
    const unchanged = validCurrent.filter(id => original.has(id));

    return { added, removed, unchanged };
  }, [selected, originalApiActionIds]);

  const hasChanges = changes.added.length > 0 || changes.removed.length > 0;

  // Get all action IDs from a menu (including children)
  const getMenuAllActionIds = useCallback((menu: MenuWithApis): string[] => {
    const ids = menu.actions.map(a => a.id);
    if (menu.children) {
      menu.children.forEach(child => {
        ids.push(...getMenuAllActionIds(child));
      });
    }
    return ids;
  }, []);

  // Get all action IDs from a module group
  const getAllActionIdsFromGroup = useCallback((menus: MenuWithApis[]): string[] => {
    const ids: string[] = [];
    menus.forEach(menu => {
      ids.push(...getMenuAllActionIds(menu));
    });
    return ids;
  }, [getMenuAllActionIds]);

  // Toggle action
  const toggleAction = useCallback((id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    onFormChange?.();
  }, [onFormChange]);

  // Toggle menu (including children)
  const toggleMenu = useCallback((menu: MenuWithApis) => {
    const allIds = getMenuAllActionIds(menu);
    const allSelected = allIds.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...allIds])]);
    }
    onFormChange?.();
  }, [selected, getMenuAllActionIds, onFormChange]);

  // Toggle module group
  const toggleModuleGroup = useCallback((moduleName: string) => {
    const group = moduleGroups.find(g => g.moduleName === moduleName);
    if (!group) return;
    const allIds = getAllActionIdsFromGroup(group.menus);
    const allSelected = allIds.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...allIds])]);
    }
    onFormChange?.();
  }, [moduleGroups, selected, getAllActionIdsFromGroup, onFormChange]);

  // Toggle expanded menu
  const toggleExpandedMenu = useCallback((menuId: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  }, []);

  // Toggle expanded module
  const toggleExpandedModule = useCallback((moduleName: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }));
  }, []);

  // ✅ FIXED: Build module groups with proper menu filtering
  const buildModuleGroups = useCallback((menuTree: any[], selectedMenuIds: string[], selectedModuleIds: string[]) => {
    // Safety: If selectedModuleIds is empty, try to extract from menuTree
    let safeSelectedModuleIds = selectedModuleIds && Array.isArray(selectedModuleIds)
        ? selectedModuleIds
        : [];

    // If still empty, try to extract module IDs from the menu tree
    if (safeSelectedModuleIds.length === 0 && menuTree.length > 0) {
      const moduleIds: string[] = [];
      const extractModuleIds = (items: any[]) => {
        for (const item of items) {
          const moduleId = item.perModuleId || item.moduleId;
          if (moduleId && !moduleIds.includes(moduleId)) {
            moduleIds.push(moduleId);
          }
          if (item.children) {
            extractModuleIds(item.children);
          }
        }
      };
      extractModuleIds(menuTree);
      safeSelectedModuleIds = moduleIds;
    }

    const selectedMenuIdsSet = new Set(selectedMenuIds);
    const selectedModuleIdsSet = new Set(safeSelectedModuleIds);
    const moduleGroupsMap = new Map<string, ModuleGroup>();

    console.log('🔍 buildModuleGroups - selectedMenuIds count:', selectedMenuIds.length);
    console.log('🔍 buildModuleGroups - selectedModuleIds count:', safeSelectedModuleIds.length);

    const processMenus = (items: any[], moduleName: string, moduleId: string, parentSelected: boolean = false): MenuWithApis[] => {
      const result: MenuWithApis[] = [];

      for (const item of items) {
        // ✅ Check if this menu or any of its children are selected
        const isSelected = selectedMenuIdsSet.has(item.id) || selectedMenuIdsSet.has(item.key);

        // Process children first to check if they have selected items
        let children: MenuWithApis[] = [];
        let hasSelectedChildren = false;

        if (item.children && item.children.length > 0) {
          children = processMenus(item.children, moduleName, moduleId, isSelected || parentSelected);
          hasSelectedChildren = children.length > 0;
        }

        // ✅ Only include this menu if:
        // 1. It was selected in Step 2, OR
        // 2. It has selected children, OR
        // 3. It has actions (API permissions) AND is selected or has selected parent
        const hasActions = item.actions && item.actions.length > 0;

        const shouldInclude = isSelected || hasSelectedChildren;
        if (shouldInclude) {
          // Get actions for this menu (only if the menu is selected)
          const actions = isSelected
              ? (item.actions || []).map((api: any) => ({
                id: api.id || api.Id || api.perApiId || api.perApiID || '',
                name: api.name || api.Name || api.desc || api.Desc || api.label || api.key || 'Unknown',
                key: api.key || api.Key || '',
                description: api.description || api.Desc || ''
              })).filter((a: ApiAction) => a.id && a.id.length > 0)
              : [];

          // ✅ Store the moduleId for later filtering
          const menuModuleId = item.perModuleId || item.moduleId || moduleId;

          const menuWithApis: MenuWithApis = {
            menuId: item.id,
            menuName: item.label || item.name || item.key,
            key: item.key,
            parentKey: item.parentKey || '',
            isChild: item.isChild || false,
            module: moduleName,
            moduleId: menuModuleId,
            actions,
            children: children.length > 0 ? children : undefined
          };

          result.push(menuWithApis);
        }
      }

      return result;
    };

    // Process each item in the menu tree
    for (const item of menuTree) {
      const moduleId = item.perModuleId || item.moduleId || item.id;
      const moduleName = item.module || item.label || item.name || 'Unknown Module';

      // Only include modules that are in selectedModuleIds
      const isModuleSelected = selectedModuleIdsSet.size === 0 || selectedModuleIdsSet.has(moduleId);

      if (!isModuleSelected) {
        continue;
      }

      const moduleKey = moduleId || moduleName;

      if (!moduleGroupsMap.has(moduleKey)) {
        moduleGroupsMap.set(moduleKey, {
          moduleName: moduleName,
          moduleId: moduleId,
          menus: []
        });
      }

      const processedMenus = processMenus([item], moduleName, moduleId);
      const moduleData = moduleGroupsMap.get(moduleKey)!;
      moduleData.menus.push(...processedMenus);
    }

    // Filter out modules with no menus
    const result = Array.from(moduleGroupsMap.values())
        .filter(group => group.menus.length > 0)
        .sort((a, b) => a.moduleName.localeCompare(b.moduleName));

    console.log('📊 Final module groups:', result.length);
    result.forEach(g => {
      console.log(`  ${g.moduleName}: ${g.menus.length} menus`);
    });

    return result;
  }, []);

  // ✅ Helper function to process tree with error handling
  const processTreeWithPermissions = useCallback(async (menus: any[]): Promise<any[]> => {
    const processedMenus: any[] = [];
    let processed = 0;
    const total = menus.length;

    for (const menu of menus) {
      try {
        let actions: ApiAction[] = [];

        const isLeaf = !menu.children || menu.children.length === 0;
        const isDashboard = menu.label?.toLowerCase() === 'dashboard' || menu.key?.toLowerCase().includes('.db');
        const isSettings = menu.label?.toLowerCase() === 'settings' || menu.key?.toLowerCase().includes('setting');

        if (isLeaf && !isDashboard && !isSettings) {
          try {
            const response = await api.get(`/auth/v1/Permission/GetPerApiByMenu/${menu.id}`);
            const apiData = response.data?.data || response.data || [];

            if (Array.isArray(apiData) && apiData.length > 0) {
              actions = apiData.map((api: any) => ({
                id: api.id || api.Id || api.perApiId || api.perApiID || '',
                name: api.name || api.Name || api.desc || api.Desc || api.label || api.key || 'Unknown',
                key: api.key || api.Key || '',
                description: api.description || api.Desc || ''
              })).filter((a: ApiAction) => a.id && a.id.length > 0);
            } else if (apiData.perApiList && Array.isArray(apiData.perApiList)) {
              actions = apiData.perApiList.map((api: any) => ({
                id: api.id || api.Id || api.perApiId || api.perApiID || '',
                name: api.name || api.Name || api.desc || api.Desc || api.label || api.key || 'Unknown',
                key: api.key || api.Key || '',
                description: api.description || api.Desc || ''
              })).filter((a: ApiAction) => a.id && a.id.length > 0);
            }
          } catch (apiError: any) {
            // 400/404 means no permissions - silently skip
            if (apiError.response?.status !== 400 && apiError.response?.status !== 404) {
              console.error('Error fetching permissions:', apiError);
            }
          }
        }

        let children: any[] = [];
        if (menu.children && menu.children.length > 0) {
          children = await processTreeWithPermissions(menu.children);
        }

        processedMenus.push({
          ...menu,
          actions: actions,
          children: children
        });

      } catch (error) {
        console.error('Error processing menu:', error);
        processedMenus.push({
          ...menu,
          actions: [],
          children: []
        });
      }

      processed++;
      setLoadingProgress(Math.round((processed / total) * 100));
    }

    return processedMenus;
  }, []);

  // ✅ Main data fetching function
  const fetchData = useCallback(async () => {
    if (selectedMenuIds.length === 0) {
      setModuleGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setError(null);

    try {
      const response = await api.get('/auth/v1/Permission/GetMenuTree');
      const menuTree = response.data?.data || response.data || [];

      if (!menuTree || menuTree.length === 0) {
        setModuleGroups([]);
        setLoading(false);
        toast.error('No menus found');
        return;
      }

      setLoadingProgress(20);

      const processedTree = await processTreeWithPermissions(menuTree);
      setLoadingProgress(70);

      const groups = buildModuleGroups(processedTree, selectedMenuIds, selectedModuleIds);
      setModuleGroups(groups);

      setLoadingProgress(90);

      if (groups.length === 0) {
        toast('No API permissions found for the selected menus', {
          icon: "ℹ️",
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      let firstMenuId = "";
      for (const group of groups) {
        if (group.menus.length > 0) {
          firstMenuId = group.menus[0].menuId;
          break;
        }
      }
      setActiveMenuId(firstMenuId);

      const expandedMods: Record<string, boolean> = {};
      const expandedMenusState: Record<string, boolean> = {};
      groups.forEach(g => {
        expandedMods[g.moduleName] = true;
        g.menus.forEach(m => {
          expandedMenusState[m.menuId] = true;
          if (m.children) {
            m.children.forEach(c => {
              expandedMenusState[c.menuId] = true;
            });
          }
        });
      });
      setExpandedModules(expandedMods);
      setExpandedMenus(expandedMenusState);

      setLoadingProgress(100);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load permissions data');
      if (error.response?.status !== 400 && error.response?.status !== 404) {
        toast.error('Failed to load API permissions');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMenuIds, selectedModuleIds, processTreeWithPermissions, buildModuleGroups]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get active menu
  const activeMenu = useMemo(() => {
    for (const group of moduleGroups) {
      const findMenu = (menus: MenuWithApis[]): MenuWithApis | null => {
        for (const menu of menus) {
          if (menu.menuId === activeMenuId) return menu;
          if (menu.children) {
            const found = findMenu(menu.children);
            if (found) return found;
          }
        }
        return null;
      };
      const found = findMenu(group.menus);
      if (found) return found;
    }
    return null;
  }, [moduleGroups, activeMenuId]);

  // Filter actions based on search and filters
  const filteredActions = useMemo(() => {
    if (!activeMenu) return [];
    let actions = [...activeMenu.actions];

    if (search) {
      const q = search.toLowerCase();
      actions = actions.filter(a =>
          (a.name || '').toLowerCase().includes(q) ||
          (a.key || '').toLowerCase().includes(q)
      );
    }

    if (quickFilter === "selected") {
      actions = actions.filter(a => selected.includes(a.id));
    } else if (quickFilter === "unselected") {
      actions = actions.filter(a => !selected.includes(a.id));
    }

    return actions;
  }, [activeMenu, search, quickFilter, selected]);

  const activeActionIds = activeMenu?.actions.map(a => a.id) || [];
  const allActiveSelected = activeActionIds.length > 0 && activeActionIds.every(id => selected.includes(id));

  const toggleAll = useCallback(() => {
    const newSelected = allActiveSelected
        ? selected.filter(id => !activeActionIds.includes(id))
        : [...new Set([...selected, ...activeActionIds])];
    setSelected(newSelected);
    onFormChange?.();
  }, [selected, activeActionIds, allActiveSelected, onFormChange]);

  const totalApis = moduleGroups.reduce((acc, g) =>
      acc + getAllActionIdsFromGroup(g.menus).length, 0);

  const isNewlyAdded = (id: string) => changes.added.includes(id);
  const isRemoved = (id: string) => changes.removed.includes(id);

  // ✅ Handle save
  const handleSave = async () => {
    if (!userId) {
      toast.error("User ID is missing");
      return;
    }

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validSelected = selected.filter(id => id && typeof id === 'string' && guidRegex.test(id));

    const invalidIds = selected.filter(id => !guidRegex.test(id));
    if (invalidIds.length > 0) {
      toast.error(`Invalid IDs detected: ${invalidIds.length} items are not valid GUIDs`);
      return;
    }

    if (validSelected.length === 0) {
      toast.error("No valid API actions selected to save");
      return;
    }

    if (hasChanges) {
      const allActions: Record<string, string> = {};
      moduleGroups.forEach(group => {
        const collectActions = (menus: MenuWithApis[]) => {
          menus.forEach(menu => {
            menu.actions.forEach(action => {
              allActions[action.id] = action.name;
            });
            if (menu.children) collectActions(menu.children);
          });
        };
        collectActions(group.menus);
      });

      const validChanges = {
        added: changes.added.filter(id => guidRegex.test(id)),
        removed: changes.removed.filter(id => guidRegex.test(id))
      };

      const addedNames = validChanges.added.map(id => allActions[id] || id);
      const removedNames = validChanges.removed.map(id => allActions[id] || id);

      let message = '📋 You are about to make the following changes:\n\n';
      if (addedNames.length > 0) {
        message += `➕ Added (${addedNames.length}):\n${addedNames.map(n => `  • ${n}`).join('\n')}\n\n`;
      }
      if (removedNames.length > 0) {
        message += `➖ Removed (${removedNames.length}):\n${removedNames.map(n => `  • ${n}`).join('\n')}\n\n`;
      }
      message += 'Proceed with these changes?';

      if (!confirm(message)) {
        return;
      }
    }

    setIsSaving(true);
    try {
      // ✅ Save the response - using the saveUserPermissions function
      const response = await saveUserPermissions({
        userId: userId,
        moduleIds: null,    // ✅ Preserve modules
        menuIds: null,      // ✅ Preserve menus
        apiActionIds: validSelected
      });

      // ✅ Check if response is successful
      if (response?.success || response?.data?.success) {
        const successMessage = hasChanges
            ? `✅ ${changes.added.length} added, ${changes.removed.length} removed`
            : `API permissions updated: ${validSelected.length} actions selected`;

        toast.success(successMessage);

        onSave({
          accessIds: validSelected,
          changes: {
            added: changes.added,
            removed: changes.removed
          }
        });
      } else {
        const errorMsg = response?.message || response?.data?.message || "Failed to save permissions";
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to save API permissions";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // ============ LOADING STATE ============
  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500">Loading API permissions...</p>
          <div className="w-64">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Loading menus</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
    );
  }

  // ============ ERROR STATE ============
  if (error) {
    return (
        <div className="text-center py-16 bg-gray-50 rounded border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Error Loading Permissions</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <Button onClick={fetchData} variant="outline" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
    );
  }

  // ============ NO MENUS SELECTED ============
  if (selectedMenuIds.length === 0) {
    return (
        <div className="text-center py-16 bg-gray-50 rounded border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No menus selected. Please go back and select menus first.</p>
          <Button onClick={onCancel} variant="outline" className="mt-4">Go Back</Button>
        </div>
    );
  }

  // ============ NO API PERMISSIONS AVAILABLE ============
  if (moduleGroups.length === 0 || totalApis === 0) {
    return (
        <div className="text-center py-16 bg-gray-50 rounded border border-gray-200">
          <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No API permissions available for the selected menus.</p>
          <Button onClick={() => onSave({ accessIds: [] })} className="mt-4 bg-gray-800 text-white hover:bg-gray-900">
            Continue without API permissions
          </Button>
        </div>
    );
  }

  // ============ MAIN RENDER ============
  return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">API Access Permissions</h2>
            <p className="text-sm text-gray-500 mt-1">Define which API actions this account can perform</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-gray-100">
              <span className="text-sm font-medium text-gray-700">{selected.length} / {totalApis} actions</span>
            </div>
            {hasChanges && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">
                  {changes.added.length} added, {changes.removed.length} removed
                </Badge>
            )}
          </div>
        </div>

        {/* Changes Summary Banner */}
        {hasChanges && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
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

              {showChangesSummary && (
                  <div className="mt-2 space-y-1">
                    {changes.added.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs font-medium text-emerald-600">Added:</span>
                          {changes.added.map(id => {
                            let name = id.slice(0, 8);
                            for (const group of moduleGroups) {
                              const findName = (menus: MenuWithApis[]): string | null => {
                                for (const menu of menus) {
                                  const action = menu.actions.find(a => a.id === id);
                                  if (action) return action.name;
                                  if (menu.children) {
                                    const found = findName(menu.children);
                                    if (found) return found;
                                  }
                                }
                                return null;
                              };
                              const found = findName(group.menus);
                              if (found) {
                                name = found;
                                break;
                              }
                            }
                            return (
                                <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> {name}
                                </span>
                            );
                          })}
                        </div>
                    )}
                    {changes.removed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs font-medium text-red-600">Removed:</span>
                          {changes.removed.map(id => {
                            let name = id.slice(0, 8);
                            for (const group of moduleGroups) {
                              const findName = (menus: MenuWithApis[]): string | null => {
                                for (const menu of menus) {
                                  const action = menu.actions.find(a => a.id === id);
                                  if (action) return action.name;
                                  if (menu.children) {
                                    const found = findName(menu.children);
                                    if (found) return found;
                                  }
                                }
                                return null;
                              };
                              const found = findName(group.menus);
                              if (found) {
                                name = found;
                                break;
                              }
                            }
                            return (
                                <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                  <Minus className="w-3 h-3" /> {name}
                                </span>
                            );
                          })}
                        </div>
                    )}
                  </div>
              )}
            </div>
        )}

        {/* Main Layout - Module Tree View */}
        <div className="flex flex-col lg:flex-row gap-0 h-[550px] border border-gray-200 rounded overflow-hidden">
          {/* Module Sidebar with Tree */}
          <div className="w-full lg:w-80 shrink-0 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
            <div className="p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
              <p className="text-xs font-semibold text-gray-500 uppercase">Modules &amp; Menus</p>
            </div>

            {moduleGroups.map(group => {
              const allIds = getAllActionIdsFromGroup(group.menus);
              const selectedCount = allIds.filter(id => selected.includes(id)).length;
              const expanded = expandedModules[group.moduleName] ?? true;

              return (
                  <div key={group.moduleName} className="border-b border-gray-200 last:border-b-0">
                    {/* Module Header - FIXED: No button nesting */}
                    <div
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-100 bg-white cursor-pointer"
                        onClick={() => toggleExpandedModule(group.moduleName)}
                    >
                      <div className="flex items-center gap-2">
                        {getModuleIcon(group.moduleName)}
                        <span className="text-sm font-semibold text-gray-800 truncate">{group.moduleName}</span>
                        <span className="text-xs text-gray-400">({allIds.length} actions)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{selectedCount}/{allIds.length}</span>
                        {/* FIXED: Checkbox is not inside a button */}
                        <div
                            onClick={(e) => { e.stopPropagation(); toggleModuleGroup(group.moduleName); }}
                            className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                        >
                          <Checkbox
                              checked={selectedCount === allIds.length && allIds.length > 0}
                              className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Module Menus (Tree) */}
                    {expanded && (
                        <div className="bg-gray-50/50">
                          {group.menus.map(menu => (
                              <MenuTreeItem
                                  key={menu.menuId}
                                  menu={menu}
                                  selected={selected}
                                  onToggle={toggleMenu}
                                  onToggleExpand={toggleExpandedMenu}
                                  expanded={expandedMenus[menu.menuId] ?? true}
                                  activeMenuId={activeMenuId}
                                  setActiveMenuId={setActiveMenuId}
                                  getActionIds={getMenuAllActionIds}
                                  isNewlyAdded={isNewlyAdded}
                                  isRemoved={isRemoved}
                                  getMenuIcon={getMenuIcon}
                              />
                          ))}
                        </div>
                    )}
                  </div>
              );
            })}
          </div>

          {/* Actions Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-white shrink-0 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {activeMenu?.menuName || "Select a menu"}
                </p>
                <p className="text-xs text-gray-400">{activeMenu?.actions.length || 0} actions</p>
              </div>
              <div className="flex items-center gap-1">
                {(["all", "selected", "unselected"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setQuickFilter(f)}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                            quickFilter === f ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
              </div>
              <div className="relative w-40">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                    placeholder="Search actions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-7 text-sm"
                />
              </div>
              <button onClick={toggleAll} className="text-sm font-medium text-gray-600 hover:text-gray-800 whitespace-nowrap">
                {allActiveSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Actions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-gray-50/30">
              {filteredActions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    {activeMenu?.actions.length === 0 ? "No API actions available for this menu" : "No actions match your filters"}
                  </div>
              ) : (
                  filteredActions.map(action => {
                    const checked = selected.includes(action.id);
                    const actionType = getActionType(action.key || action.name);
                    const colorClass = getActionColor(actionType);
                    const isNew = isNewlyAdded(action.id);
                    const isRemovedAction = isRemoved(action.id);

                    return (
                        <label
                            key={action.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded border cursor-pointer transition ${
                                checked ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"
                            } ${isNew && checked ? "border-emerald-400 bg-emerald-50" : ""} 
                       ${isRemovedAction && !checked ? "border-red-400 bg-red-50 opacity-60" : ""}`}
                        >
                          <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleAction(action.id)}
                          />
                          <span className={`text-xs font-mono px-2 py-0.5 rounded ${colorClass}`}>
                            {actionType}
                          </span>
                          <span className="text-sm text-gray-700 flex-1 truncate">{action.name}</span>
                          {isNew && checked && <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">✨ New</span>}
                          {isRemovedAction && !checked && <span className="text-xs text-red-600 font-medium whitespace-nowrap">🗑️ Removed</span>}
                          {checked && <Check className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                        </label>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel} className="gap-1.5">
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button
              onClick={handleSave}
              disabled={saving || isSaving}
              className="gap-1.5 bg-gray-800 hover:bg-gray-900 text-white"
          >
            {(saving || isSaving) ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
            ) : (
                <>
                  <Save className="w-4 h-4" /> Save API Permissions
                </>
            )}
          </Button>
        </div>
      </div>
  );
}

// ✅ MenuTreeItem Component - FIXED: No button nesting
const MenuTreeItem: React.FC<{
  menu: MenuWithApis;
  selected: string[];
  onToggle: (menu: MenuWithApis) => void;
  onToggleExpand: (menuId: string) => void;
  expanded: boolean;
  activeMenuId: string;
  setActiveMenuId: (id: string) => void;
  getActionIds: (menu: MenuWithApis) => string[];
  isNewlyAdded: (id: string) => boolean;
  isRemoved: (id: string) => boolean;
  getMenuIcon: (name: string) => React.ReactNode;
  depth?: number;
}> = ({
        menu,
        selected,
        onToggle,
        onToggleExpand,
        expanded,
        activeMenuId,
        setActiveMenuId,
        getActionIds,
        isNewlyAdded,
        isRemoved,
        getMenuIcon,
        depth = 0
      }) => {
  const allIds = getActionIds(menu);
  const allSelected = allIds.every(id => selected.includes(id));
  const isActive = activeMenuId === menu.menuId;
  const hasChildren = menu.children && menu.children.length > 0;
  const paddingLeft = depth * 16 + 8;

  return (
      <div>
        {/* Menu Item - FIXED: No button nesting */}
        <div
            className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors ${
                isActive ? "bg-indigo-50 border-l-2 border-indigo-500" : ""
            }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={() => setActiveMenuId(menu.menuId)}
        >
          {hasChildren && (
              <div
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(menu.menuId); }}
                  className="p-0.5 hover:bg-gray-200 rounded cursor-pointer"
              >
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? "" : "-rotate-90"}`} />
              </div>
          )}
          {!hasChildren && <div className="w-4" />}

          {getMenuIcon(menu.menuName)}

          <span className={`text-sm flex-1 truncate ${isActive ? "font-medium text-indigo-700" : "text-gray-700"}`}>
            {menu.menuName}
          </span>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">{allIds.length}</span>
            <div
                onClick={(e) => { e.stopPropagation(); onToggle(menu); }}
                className="p-0.5 hover:bg-gray-200 rounded cursor-pointer"
            >
              <Checkbox
                  checked={allSelected && allIds.length > 0}
                  className="data-[state=checked]:bg-indigo-600 h-3.5 w-3.5"
              />
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && expanded && (
            <div>
              {menu.children!.map(child => (
                  <MenuTreeItem
                      key={child.menuId}
                      menu={child}
                      selected={selected}
                      onToggle={onToggle}
                      onToggleExpand={onToggleExpand}
                      expanded={expanded}
                      activeMenuId={activeMenuId}
                      setActiveMenuId={setActiveMenuId}
                      getActionIds={getActionIds}
                      isNewlyAdded={isNewlyAdded}
                      isRemoved={isRemoved}
                      getMenuIcon={getMenuIcon}
                      depth={depth + 1}
                  />
              ))}
            </div>
        )}
      </div>
  );
};