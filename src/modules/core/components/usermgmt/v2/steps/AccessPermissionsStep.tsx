// steps/AccessPermissionsStep.tsx - COMPLETE FIXED VERSION

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ChevronRight, ChevronLeft, Search, Check, ChevronDown, Key, ShieldCheck, AlertCircle,
  CheckSquare, Square, Filter, Download, Copy, Eye, HelpCircle,
  Zap, Layers, FolderTree, CheckCheck, Trash2, Plus, Minus,
  GitBranch, Grid3x3, ListChecks, Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import type { WizardFormData } from '@/modules/core/components/usermgmt/v2/AddAccountWizard';
import { Input } from '@/shared/components/ui/input';
import { api } from '@/shared/services/api';
import toast from 'react-hot-toast';

// Import icons from lucide-react
import * as LucideIcons from 'lucide-react';

interface Props {
  selectedMenuIds: string[];
  initialData: WizardFormData['step3'];
  onSubmit: (data: WizardFormData['step3']) => void;
  onBack: () => void;
}

interface ModuleGroup {
  moduleId: string;
  moduleName: string;
  icon?: string;
  menus: MenuData[];
}

interface MenuData {
  menuId: string;
  menuName: string;
  key: string;
  parentKey: string;
  isChild: boolean;
  icon?: string;
  children?: MenuData[];
  perApiList: ApiAction[];
}

interface ApiAction {
  id: string;      // ✅ MUST be the GUID from the database
  name: string;
  key?: string;    // Store the string key for display only
}

interface MenuItem {
  id: string;
  key: string;
  modKey: string;
  label: string;
  name?: string;
  title?: string;
  parKey?: string;
  parentKey?: string;
  isChild: boolean;
  perModuleId: string;
  module: string;
  parent: string;
  icon?: string;
  children?: MenuItem[];
  order?: number;
}

// ✅ Helper to get Lucide icon component from string name
const getIconComponent = (iconName: string | undefined): React.ReactNode => {
  if (!iconName) return null;

  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return <IconComponent className="w-3.5 h-3.5" />;
  }

  const capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const FallbackIcon = (LucideIcons as any)[capitalized];
  if (FallbackIcon) {
    return <FallbackIcon className="w-3.5 h-3.5" />;
  }

  return null;
};

// ✅ Helper to get Lucide icon for module
const getModuleIconComponent = (iconName: string | undefined): React.ReactNode => {
  if (!iconName) return <FolderTree className="w-4 h-4 text-gray-400" />;

  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return <IconComponent className="w-4 h-4 text-indigo-500" />;
  }

  const capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const FallbackIcon = (LucideIcons as any)[capitalized];
  if (FallbackIcon) {
    return <FallbackIcon className="w-4 h-4 text-indigo-500" />;
  }

  return <FolderTree className="w-4 h-4 text-gray-400" />;
};

// ✅ Build menu tree from flat list using parentKey
const buildMenuTree = (menus: MenuItem[]): MenuItem[] => {
  const menuMap = new Map<string, MenuItem>();
  const rootMenus: MenuItem[] = [];

  menus.forEach(menu => {
    menuMap.set(menu.key, { ...menu, children: [] });
  });

  menus.forEach(menu => {
    const node = menuMap.get(menu.key);
    if (!node) return;

    const parentKey = menu.parentKey || menu.parKey;

    if (parentKey && menuMap.has(parentKey) && menu.isChild) {
      const parent = menuMap.get(parentKey);
      if (parent) {
        if (!parent.children) parent.children = [];
        if (!parent.children.find(c => c.key === node.key)) {
          parent.children.push(node);
        }
        return;
      }
    }
    if (!rootMenus.find(m => m.key === node.key)) {
      rootMenus.push(node);
    }
  });

  const sortChildren = (items: MenuItem[]) => {
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    items.forEach(item => {
      if (item.children) {
        sortChildren(item.children);
      }
    });
  };
  sortChildren(rootMenus);

  return rootMenus;
};

// ✅ Get action type
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

// ✅ Get action color
const getActionColor = (type: string): string => {
  const colors: Record<string, string> = {
    'CREATE': "bg-green-100 text-green-700 border-green-200",
    'EDIT': "bg-blue-100 text-blue-700 border-blue-200",
    'DELETE': "bg-red-100 text-red-700 border-red-200",
    'VIEW': "bg-gray-100 text-gray-700 border-gray-200",
    'APPROVE': "bg-purple-100 text-purple-700 border-purple-200",
    'EXPORT': "bg-amber-100 text-amber-700 border-amber-200",
    'IMPORT': "bg-cyan-100 text-cyan-700 border-cyan-200",
    'PRINT': "bg-indigo-100 text-indigo-700 border-indigo-200",
  };
  return colors[type] || "bg-gray-100 text-gray-600 border-gray-200";
};

// ✅ QUICK TEMPLATES
const QUICK_TEMPLATES = {
  '👀 Read Only': (apis: ApiAction[]) => apis.filter(a =>
      ['view', 'list', 'search', 'export', 'detail', 'get'].includes(
          (a.key || a.name).split('.').pop()?.toLowerCase() || ''
      )
  ),
  '✍️ Create & Edit': (apis: ApiAction[]) => apis.filter(a =>
      ['create', 'add', 'edit', 'update', 'modify'].includes(
          (a.key || a.name).split('.').pop()?.toLowerCase() || ''
      )
  ),
  '🗑️ Delete Only': (apis: ApiAction[]) => apis.filter(a =>
      ['delete', 'remove', 'archive'].includes(
          (a.key || a.name).split('.').pop()?.toLowerCase() || ''
      )
  ),
  '✅ Approval': (apis: ApiAction[]) => apis.filter(a =>
      ['approve', 'reject'].includes(
          (a.key || a.name).split('.').pop()?.toLowerCase() || ''
      )
  ),
  '⚡ Full Access': (apis: ApiAction[]) => apis,
};

export function AccessPermissionsStep({ selectedMenuIds, initialData, onSubmit, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [moduleGroups, setModuleGroups] = useState<ModuleGroup[]>([]);
  const [selected, setSelected] = useState<string[]>(initialData.accessIds || []);
  const [activeMenuId, setActiveMenuId] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'create' | 'edit' | 'delete' | 'view' | 'approve'>('all');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [search, setSearch] = useState('');
  const [showBulkBar, setShowBulkBar] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [recentlyCopied, setRecentlyCopied] = useState(false);

  // ✅ Load menus from database using the correct endpoint
  useEffect(() => {
    const loadMenusFromDB = async () => {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingError(null);

      try {
        // ✅ Step 1: Get ALL menus from API
        const response = await api.get('/auth/v1/Permission/AllPerMenu');
        const allMenus = response.data?.data || response.data || [];
        console.log('All menus loaded:', allMenus.length);

        if (!allMenus || allMenus.length === 0) {
          setModuleGroups([]);
          setLoading(false);
          toast.info('No menus found');
          return;
        }

        setLoadingProgress(30);

        const selectedMenuIdsSet = new Set(selectedMenuIds);

        // ✅ Function to filter menus by selected IDs
        const filterMenus = (items: any[]): any[] => {
          const result: any[] = [];

          for (const item of items) {
            const isSelected = selectedMenuIdsSet.has(item.id) || selectedMenuIdsSet.has(item.key);

            const filteredChildren = item.children ? filterMenus(item.children) : [];

            if (isSelected || filteredChildren.length > 0) {
              result.push({
                ...item,
                children: filteredChildren.length > 0 ? filteredChildren : item.children
              });
            }
          }

          return result;
        };

        // ✅ Build the full tree first using ALL menus
        const fullTree = buildMenuTree(allMenus);
        console.log('Full tree built:', fullTree.length, 'root menus');

        setLoadingProgress(50);

        // ✅ Then filter by selected menu IDs
        const filteredTree = filterMenus(fullTree);
        console.log('Filtered tree:', filteredTree.length, 'root menus');

        setLoadingProgress(60);

        // ✅ Group by module
        const moduleMap = new Map<string, { moduleName: string; icon?: string; menus: any[] }>();

        const processTreeItems = (items: any[]) => {
          for (const item of items) {
            const moduleName = item.module || 'Unknown Module';
            const moduleIcon = item.icon || '';

            if (!moduleMap.has(moduleName)) {
              moduleMap.set(moduleName, {
                moduleName,
                icon: moduleIcon,
                menus: []
              });
            }

            moduleMap.get(moduleName)!.menus.push(item);

            if (item.children) {
              processTreeItems(item.children);
            }
          }
        };

        processTreeItems(filteredTree);

        setLoadingProgress(70);

        // ✅ Convert to array and sort
        const moduleGroupsResult: ModuleGroup[] = [];
        const totalMenus = moduleMap.size;
        let processedMenus = 0;

        for (const [moduleName, moduleData] of moduleMap) {
          if (moduleData.menus.length === 0) continue;

          const menusWithActions: MenuData[] = [];

          for (const menu of moduleData.menus) {
            // ✅ Get API actions for this menu - USE THE GUID!
            let actions: ApiAction[] = [];
            try {
              const apiResponse = await api.get(`/auth/v1/Permission/GetPerApiByMenu/${menu.id}`);
              const apiData = apiResponse.data?.data || apiResponse.data || [];

              // ✅ IMPORTANT: The id MUST be the GUID from the database
              if (Array.isArray(apiData)) {
                actions = apiData.map((api: any) => {
                  // Get the GUID - try different possible property names
                  const guid = api.id || api.Id || api.perApiId || api.perApiID || '';

                  return {
                    id: guid,  // ✅ This MUST be the GUID
                    name: api.name || api.Name || api.desc || api.Desc || api.label || api.key || 'Unknown',
                    key: api.key || api.Key || '',  // Store the key for display
                  };
                });
              } else if (apiData.perApiList && Array.isArray(apiData.perApiList)) {
                actions = apiData.perApiList.map((api: any) => {
                  const guid = api.id || api.Id || api.perApiId || api.perApiID || '';
                  return {
                    id: guid,
                    name: api.name || api.Name || api.desc || api.Desc || api.label || api.key || 'Unknown',
                    key: api.key || api.Key || '',
                  };
                });
              }

              // ✅ Filter out any actions without a valid GUID
              actions = actions.filter(a => a.id && a.id.length > 0);

              if (actions.length > 0) {
                console.log(`✅ Found ${actions.length} permissions for menu ${menu.key}`);
              }

            } catch (err) {
              console.warn(`❌ Error fetching actions for ${menu.key}:`, err);
            }

            // Build children recursively
            const childMenus: MenuData[] = [];
            if (menu.children) {
              for (const child of menu.children) {
                let childActions: ApiAction[] = [];
                try {
                  const childResponse = await api.get(`/auth/v1/Permission/GetPerApiByMenu/${child.id}`);
                  const childData = childResponse.data?.data || childResponse.data || [];

                  if (Array.isArray(childData)) {
                    childActions = childData.map((api: any) => {
                      const guid = api.id || api.Id || api.perApiId || api.perApiID || '';
                      return {
                        id: guid,
                        name: api.name || api.Name || api.desc || api.Desc || api.label || api.key || 'Unknown',
                        key: api.key || api.Key || '',
                      };
                    }).filter(a => a.id && a.id.length > 0);
                  }
                } catch (err) {
                  console.warn(`❌ Error fetching actions for child ${child.key}:`, err);
                }

                childMenus.push({
                  menuId: child.id,
                  menuName: child.label || child.name || child.key,
                  key: child.key,
                  parentKey: child.parentKey || child.parKey || '',
                  isChild: child.isChild || false,
                  icon: child.icon,
                  perApiList: childActions,
                });
              }
            }

            menusWithActions.push({
              menuId: menu.id,
              menuName: menu.label || menu.name || menu.key,
              key: menu.key,
              parentKey: menu.parentKey || menu.parKey || '',
              isChild: menu.isChild || false,
              icon: menu.icon,
              perApiList: actions,
              children: childMenus.length > 0 ? childMenus : undefined,
            });

            processedMenus++;
            const progress = 70 + Math.round((processedMenus / totalMenus) * 20);
            setLoadingProgress(Math.min(progress, 90));
          }

          moduleGroupsResult.push({
            moduleId: moduleName,
            moduleName: moduleName,
            icon: moduleData.icon,
            menus: menusWithActions,
          });
        }

        console.log('Module groups:', moduleGroupsResult.length);
        setModuleGroups(moduleGroupsResult);

        setLoadingProgress(95);

        if (moduleGroupsResult.length === 0) {
          setLoading(false);
          toast.info("No menus with API permissions found");
          return;
        }

        // Set first menu as active
        let firstMenuId = "";
        for (const group of moduleGroupsResult) {
          if (group.menus.length > 0) {
            firstMenuId = group.menus[0].menuId;
            break;
          }
        }
        setActiveMenuId(firstMenuId);

        // Initialize expanded states - expand all by default
        const expandedMods: Record<string, boolean> = {};
        const expandedMenusState: Record<string, boolean> = {};
        moduleGroupsResult.forEach(g => {
          expandedMods[g.moduleId] = true;
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

      } catch (error) {
        console.error('Failed to load menus:', error);
        setLoadingError('Failed to load permissions. Please try again.');
        toast.error('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    loadMenusFromDB();
  }, [selectedMenuIds]);

  // Helper functions for selection counts
  const getAllActionIds = useCallback(() => {
    const ids: string[] = [];
    moduleGroups.forEach(group => {
      group.menus.forEach(menu => {
        menu.perApiList.forEach(action => {
          ids.push(action.id);
        });
        if (menu.children) {
          menu.children.forEach(child => {
            child.perApiList.forEach(action => {
              ids.push(action.id);
            });
          });
        }
      });
    });
    return ids;
  }, [moduleGroups]);

  const getModuleActionIds = useCallback((moduleId: string) => {
    const module = moduleGroups.find(m => m.moduleId === moduleId);
    if (!module) return [];
    const ids: string[] = [];
    module.menus.forEach(menu => {
      menu.perApiList.forEach(action => {
        ids.push(action.id);
      });
      if (menu.children) {
        menu.children.forEach(child => {
          child.perApiList.forEach(action => {
            ids.push(action.id);
          });
        });
      }
    });
    return ids;
  }, [moduleGroups]);

  const getMenuActionIds = useCallback((menuId: string) => {
    const menu = moduleGroups.flatMap(m => m.menus).find(m => m.menuId === menuId);
    if (!menu) return [];
    const ids = menu.perApiList.map(a => a.id);
    if (menu.children) {
      menu.children.forEach(child => {
        child.perApiList.forEach(action => {
          ids.push(action.id);
        });
      });
    }
    return ids;
  }, [moduleGroups]);

  // Selection state helpers
  const getModuleSelectionState = useCallback((moduleId: string) => {
    const moduleActionIds = getModuleActionIds(moduleId);
    if (moduleActionIds.length === 0) return { isChecked: false, isIndeterminate: false };
    const selectedCount = moduleActionIds.filter(id => selected.includes(id)).length;
    if (selectedCount === 0) return { isChecked: false, isIndeterminate: false };
    if (selectedCount === moduleActionIds.length) return { isChecked: true, isIndeterminate: false };
    return { isChecked: false, isIndeterminate: true };
  }, [selected, getModuleActionIds]);

  const getMenuSelectionState = useCallback((menuId: string) => {
    const menuActionIds = getMenuActionIds(menuId);
    if (menuActionIds.length === 0) return { isChecked: false, isIndeterminate: false };
    const selectedCount = menuActionIds.filter(id => selected.includes(id)).length;
    if (selectedCount === 0) return { isChecked: false, isIndeterminate: false };
    if (selectedCount === menuActionIds.length) return { isChecked: true, isIndeterminate: false };
    return { isChecked: false, isIndeterminate: true };
  }, [selected, getMenuActionIds]);

  // Toggle functions
  const toggleModule = useCallback((moduleId: string) => {
    const moduleActionIds = getModuleActionIds(moduleId);
    const allSelected = moduleActionIds.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !moduleActionIds.includes(id)));
      toast.success(`Deselected all actions in module`);
    } else {
      setSelected(prev => [...new Set([...prev, ...moduleActionIds])]);
      toast.success(`Selected all actions in module`);
    }
  }, [selected, getModuleActionIds]);

  const toggleMenu = useCallback((menuId: string) => {
    const menuActionIds = getMenuActionIds(menuId);
    const allSelected = menuActionIds.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !menuActionIds.includes(id)));
      toast.success(`Deselected all actions in menu`);
    } else {
      setSelected(prev => [...new Set([...prev, ...menuActionIds])]);
      toast.success(`Selected all actions in menu`);
    }
  }, [selected, getMenuActionIds]);

  const toggleAction = useCallback((id: string) => {
    setSelected(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  // Bulk operations
  const selectAll = useCallback(() => {
    const allIds = getAllActionIds();
    setSelected(allIds);
    toast.success(`Selected all ${allIds.length} actions`);
  }, [getAllActionIds]);

  const deselectAll = useCallback(() => {
    setSelected([]);
    toast.success('Deselected all actions');
  }, []);

  const selectAllModules = useCallback(() => {
    const allModuleIds = moduleGroups.flatMap(m => getModuleActionIds(m.moduleId));
    setSelected(allModuleIds);
    toast.success(`Selected all modules (${moduleGroups.length} modules)`);
  }, [moduleGroups, getModuleActionIds]);

  const selectAllMenus = useCallback(() => {
    const allMenuIds = moduleGroups.flatMap(m => m.menus.flatMap(menu => getMenuActionIds(menu.menuId)));
    setSelected(allMenuIds);
    toast.success(`Selected all menus (${moduleGroups.flatMap(m => m.menus).length} menus)`);
  }, [moduleGroups, getModuleActionIds]);

  const activeMenu = useMemo(() => {
    for (const group of moduleGroups) {
      for (const menu of group.menus) {
        if (menu.menuId === activeMenuId) return menu;
        if (menu.children) {
          for (const child of menu.children) {
            if (child.menuId === activeMenuId) return child;
          }
        }
      }
    }
    return null;
  }, [moduleGroups, activeMenuId]);

  const activeApis = useMemo(() => {
    if (!activeMenu) return [];
    let apis = [...activeMenu.perApiList];
    if (search) apis = apis.filter(a => (a.name || '').toLowerCase().includes(search.toLowerCase()));
    if (filterType !== 'all') apis = apis.filter(a => (a.key || a.name || '').toLowerCase().includes(filterType));
    if (showOnlySelected) apis = apis.filter(a => selected.includes(a.id));
    return apis;
  }, [activeMenu, search, filterType, showOnlySelected, selected]);

  const activeApiIds = activeMenu?.perApiList.map(a => a.id) ?? [];
  const allActiveSelected = activeApiIds.length > 0 && activeApiIds.every(id => selected.includes(id));
  const totalApis = getAllActionIds().length;
  const completionPercentage = totalApis > 0 ? (selected.length / totalApis) * 100 : 0;

  const permissionStats = useMemo(() => {
    const stats = { create: 0, edit: 0, delete: 0, view: 0, approve: 0, other: 0 };
    selected.forEach(id => {
      const api = moduleGroups.flatMap(m => m.menus).flatMap(menu => {
        const actions = [...menu.perApiList];
        if (menu.children) {
          menu.children.forEach(child => {
            actions.push(...child.perApiList);
          });
        }
        return actions;
      }).find(a => a.id === id);
      if (api) {
        const action = (api.key || api.name || '').split('.').pop()?.toLowerCase() || '';
        if (['create', 'add'].includes(action)) stats.create++;
        else if (['edit', 'update', 'modify'].includes(action)) stats.edit++;
        else if (['delete', 'remove', 'archive'].includes(action)) stats.delete++;
        else if (['view', 'list', 'search', 'detail', 'get'].includes(action)) stats.view++;
        else if (['approve', 'reject'].includes(action)) stats.approve++;
        else stats.other++;
      }
    });
    return stats;
  }, [selected, moduleGroups]);

  useEffect(() => {
    setShowBulkBar(selected.length > 0 && selected.length < totalApis);
  }, [selected.length, totalApis]);

  const toggleExpandedMenu = (menuId: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const toggleExpandedModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // ============ LOADING STATE ============
  if (loading) {
    return (
        <div className="text-center py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800">Loading Permissions</h4>
            <p className="text-sm text-gray-500">Fetching access permissions for selected menus...</p>
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
            <p className="text-xs text-gray-400 mt-2">
              {selectedMenuIds.length} menus selected
            </p>
          </div>
        </div>
    );
  }

  // ============ ERROR STATE ============
  if (loadingError) {
    return (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Permissions</h4>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">{loadingError}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Go Back
            </Button>
            <Button
                onClick={() => window.location.reload()}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Loader2 className="w-4 h-4" /> Retry
            </Button>
          </div>
        </div>
    );
  }

  // ============ NO MENUS SELECTED ============
  if (selectedMenuIds.length === 0) {
    return (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No Menus Selected</h4>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Please go back and select at least one menu to configure access permissions.</p>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Menu Selection
          </Button>
        </div>
    );
  }

  // ============ NO MODULES FOUND ============
  if (moduleGroups.length === 0) {
    return (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No Modules Found</h4>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Could not organize the selected menus into modules. Please check your menu selection.</p>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Go Back
          </Button>
        </div>
    );
  }

  // ============ MAIN RENDER ============
  return (
      <div className="space-y-5">
        {/* Header with Stats */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-500" />
              Access Permissions
            </h3>
            <p className="text-sm text-gray-500">
              {moduleGroups.flatMap(m => m.menus).length} menus · {totalApis} total actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="text-sm font-medium text-emerald-700">
                {selected.length} / {totalApis} selected
              </span>
            </div>
            <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({ selected }, null, 2));
                  setRecentlyCopied(true);
                  toast.success('Copied to clipboard');
                  setTimeout(() => setRecentlyCopied(false), 2000);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Copy selection to clipboard"
            >
              {recentlyCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
              ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Completion Progress</span>
            <span className="font-medium text-emerald-600">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Permission Type Stats */}
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(permissionStats).map(([type, count]) => (
              <div key={type} className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-lg font-semibold text-gray-800">{count}</p>
                <p className="text-xs text-gray-500 capitalize">{type}</p>
              </div>
          ))}
        </div>

        {/* Bulk Action Bar */}
        {showBulkBar && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-gray-900 text-white rounded-full shadow-2xl px-4 py-2 flex items-center gap-3">
                <span className="text-sm font-medium">{selected.length} actions selected</span>
                <div className="w-px h-4 bg-gray-600" />
                <button onClick={selectAll} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <CheckCheck className="w-4 h-4" /> Select All
                </button>
                <button onClick={deselectAll} className="text-sm hover:text-red-400 transition-colors flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
                <div className="w-px h-4 bg-gray-600" />
                <button onClick={selectAllModules} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <FolderTree className="w-4 h-4" /> All Modules
                </button>
                <button onClick={selectAllMenus} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <GitBranch className="w-4 h-4" /> All Menus
                </button>
              </div>
            </div>
        )}

        <div className="flex gap-4 h-[460px] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          {/* Sidebar - Modules with sub-menus from DB */}
          <div className="w-80 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase">Modules &amp; Menus ({moduleGroups.length})</p>
                <div className="flex items-center gap-1">
                  <button onClick={selectAllModules} className="p-1 rounded hover:bg-gray-100" title="Select all modules">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {moduleGroups.map(module => {
                const { isChecked, isIndeterminate } = getModuleSelectionState(module.moduleId);
                const moduleSelectedCount = getModuleActionIds(module.moduleId).filter(id => selected.includes(id)).length;
                const moduleTotalCount = getModuleActionIds(module.moduleId).length;
                const isExpanded = expandedModules[module.moduleId] ?? true;

                return (
                    <div key={module.moduleId} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Module Header */}
                      <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer bg-gray-50/50">
                        <Checkbox
                            checked={isChecked}
                            ref={(el) => {
                              if (el) {
                                (el as any).indeterminate = isIndeterminate;
                              }
                            }}
                            onCheckedChange={() => toggleModule(module.moduleId)}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <div className="flex-1" onClick={() => toggleExpandedModule(module.moduleId)}>
                          <div className="flex items-center gap-2">
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                            <span className="text-sm font-semibold flex items-center gap-1">
                              {getModuleIconComponent(module.icon)}
                              {module.moduleName}
                            </span>
                            <span className="text-xs text-gray-400">({module.menus.length})</span>
                          </div>
                          <div className="flex items-center gap-2 ml-5 mt-1">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: moduleTotalCount > 0 ? `${(moduleSelectedCount / moduleTotalCount) * 100}%` : 0 }} />
                            </div>
                            <span className="text-xs text-gray-500">{moduleSelectedCount}/{moduleTotalCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Module Menus - Tree Structure */}
                      {isExpanded && module.menus.length > 0 && (
                          <div className="border-t border-gray-100">
                            {module.menus.map(menu => (
                                <MenuTreeNode
                                    key={menu.menuId}
                                    menu={menu}
                                    selected={selected}
                                    onToggle={toggleMenu}
                                    onToggleExpand={toggleExpandedMenu}
                                    expanded={expandedMenus[menu.menuId] ?? true}
                                    activeMenuId={activeMenuId}
                                    setActiveMenuId={setActiveMenuId}
                                    getActionIds={getMenuActionIds}
                                    depth={0}
                                    getIconComponent={getIconComponent}
                                />
                            ))}
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </div>

          {/* Actions Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {activeMenu?.menuName || 'Select a menu'}
                </p>
                {activeMenu && (
                    <p className="text-xs text-gray-400">{activeMenu.perApiList.length} available actions</p>
                )}
              </div>

              {/* Quick Templates */}
              {activeMenu && activeMenu.perApiList.length > 0 && (
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Zap className="w-3.5 h-3.5" /> Quick Select <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      {Object.keys(QUICK_TEMPLATES).map(template => (
                          <button key={template} onClick={() => {
                            const matched = QUICK_TEMPLATES[template as keyof typeof QUICK_TEMPLATES](activeMenu.perApiList);
                            setSelected(prev => [...new Set([...prev, ...matched.map(a => a.id)])]);
                            toast.success(`${template}: ${matched.length} actions added`);
                          }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                            {template}
                          </button>
                      ))}
                    </div>
                  </div>
              )}

              <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`p-1.5 rounded-lg transition-colors ${showAdvancedFilters ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}
              >
                <Filter className="w-4 h-4" />
              </button>

              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search actions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                    onClick={() => {
                      if (allActiveSelected) {
                        setSelected(prev => prev.filter(id => !activeApiIds.includes(id)));
                        toast.success('Deselected all actions');
                      } else {
                        setSelected(prev => [...new Set([...prev, ...activeApiIds])]);
                        toast.success(`Selected all ${activeApiIds.length} actions`);
                      }
                    }}
                    className="text-sm text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors"
                >
                  {allActiveSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Action Type:</span>
                    <div className="flex gap-1">
                      {(['all', 'view', 'create', 'edit', 'delete', 'approve'] as const).map(type => (
                          <button
                              key={type}
                              onClick={() => setFilterType(type)}
                              className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                                  filterType === type
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            {type}
                          </button>
                      ))}
                    </div>
                  </div>
                  <button
                      onClick={() => setShowOnlySelected(!showOnlySelected)}
                      className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full transition-colors ${
                          showOnlySelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {showOnlySelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                    Selected Only
                  </button>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Layers className="w-3 h-3" /> {activeApis.length} actions
                  </div>
                </div>
            )}

            {/* Actions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-gray-50/30">
              {!activeMenu ? (
                  <div className="text-center py-12 text-gray-400">
                    <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">Select a menu from the sidebar</p>
                  </div>
              ) : activeApis.length === 0 ? (
                  <div className="text-center py-12">
                    <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No actions match your filters</p>
                    <button
                        onClick={() => { setSearch(''); setFilterType('all'); setShowOnlySelected(false); }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
              ) : (
                  activeApis.map(api => {
                    const checked = selected.includes(api.id);
                    const actionType = getActionType(api.key || api.name);
                    const actionColor = getActionColor(actionType);

                    return (
                        <label
                            key={api.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                checked
                                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                          <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleAction(api.id)}
                              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />
                          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${actionColor}`}>
                            {actionType}
                          </span>
                          <span className="text-sm text-gray-700 flex-1">{api.key || api.name}</span>
                          {checked && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                        </label>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 hidden sm:block">
              {selected.length} actions selected
            </div>
            <Button
                onClick={() => {
                  // ✅ Log the final selection for debugging
                  console.log('📤 SUBMITTING ACCESS PERMISSIONS:');
                  console.log('Total selected:', selected.length);
                  console.log('Sample IDs (should all be GUIDs):', selected.slice(0, 5));

                  // ✅ Validate all are GUIDs
                  const invalidIds = selected.filter(id => {
                    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    return !guidRegex.test(id);
                  });

                  if (invalidIds.length > 0) {
                    console.error('❌ Invalid IDs found (should be GUIDs):', invalidIds);
                    toast.error(`Invalid permissions detected: ${invalidIds.length} items are not valid GUIDs`);
                    return;
                  }

                  onSubmit({ accessIds: selected });
                }}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 shadow-sm hover:shadow-md transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
  );
}

// ✅ MenuTreeNode Component - Handles tree rendering with icons from DB
const MenuTreeNode: React.FC<{
  menu: MenuData;
  selected: string[];
  onToggle: (menuId: string) => void;
  onToggleExpand: (menuId: string) => void;
  expanded: boolean;
  activeMenuId: string;
  setActiveMenuId: (id: string) => void;
  getActionIds: (menuId: string) => string[];
  depth: number;
  getIconComponent: (iconName: string | undefined) => React.ReactNode;
}> = ({
        menu,
        selected,
        onToggle,
        onToggleExpand,
        expanded,
        activeMenuId,
        setActiveMenuId,
        getActionIds,
        depth,
        getIconComponent
      }) => {
  const allIds = getActionIds(menu.menuId);
  const allSelected = allIds.every(id => selected.includes(id));
  const isActive = activeMenuId === menu.menuId;
  const hasChildren = menu.children && menu.children.length > 0;
  const paddingLeft = depth * 16 + 8;

  return (
      <div>
        {/* Menu Item */}
        <div
            className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors ${
                isActive ? "bg-emerald-50 border-l-2 border-emerald-500" : ""
            }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={() => setActiveMenuId(menu.menuId)}
        >
          {hasChildren && (
              <button
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(menu.menuId); }}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
              >
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? "" : "-rotate-90"}`} />
              </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {getIconComponent(menu.icon)}

          <span className={`text-sm flex-1 truncate ${isActive ? "font-medium text-emerald-700" : "text-gray-700"}`}>
            {menu.menuName}
          </span>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">{allIds.length}</span>
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(menu.menuId); }}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              <Checkbox
                  checked={allSelected && allIds.length > 0}
                  className="data-[state=checked]:bg-emerald-600 h-3.5 w-3.5"
              />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && expanded && (
            <div>
              {menu.children!.map(child => (
                  <MenuTreeNode
                      key={child.menuId}
                      menu={child}
                      selected={selected}
                      onToggle={onToggle}
                      onToggleExpand={onToggleExpand}
                      expanded={expanded}
                      activeMenuId={activeMenuId}
                      setActiveMenuId={setActiveMenuId}
                      getActionIds={getActionIds}
                      depth={depth + 1}
                      getIconComponent={getIconComponent}
                  />
              ))}
            </div>
        )}
      </div>
  );
};