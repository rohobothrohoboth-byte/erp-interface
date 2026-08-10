// steps/MenuPermissionsStep.tsx - UPDATED with correct field mapping

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight, ChevronLeft, Search, Check, ChevronDown,
  FolderTree, Menu, AlertCircle, FileText,
  CheckSquare, Square, Sun, Moon,
  CheckCheck, Trash2, RefreshCw, Loader2
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Checkbox } from '../../../../ui/checkbox';
import type { WizardFormData } from '../AddAccountWizard';
import { Input } from '../../../../ui/input';
import { permissionStructureApi } from '../../../../../services/auth/permission/permissionStructure.api';
import toast from 'react-hot-toast';

// Optional display-name overrides keyed by module GUID. The module label
// normally comes from the API (menu.module); this map is only a fallback.
const MODULE_NAME_MAP: Record<string, string> = {};

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode) };
};

interface Props {
  selectedModuleIds: string[];
  initialData: WizardFormData['step2'];
  onSubmit: (data: WizardFormData['step2']) => void;
  onBack: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  label?: string;
  key?: string;
  parentId?: string | null;
  children?: MenuItem[];
  module?: string;
  perModuleId?: string;
  path?: string;
  icon?: string;
  order?: number;
}

interface ModuleGroup {
  moduleId: string;
  moduleName: string;
  menus: MenuItem[];
}

export function MenuPermissionsStep({ selectedModuleIds, initialData, onSubmit, onBack }: Props) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [moduleGroups, setModuleGroups] = useState<ModuleGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Fetch using GetMenuTree (has unique IDs and proper hierarchy)
  useEffect(() => {
    const fetchMenuData = async () => {
      if (selectedModuleIds.length === 0) {
        setModuleGroups([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('=== Fetching GetMenuTree ===');

        const menuTree = await permissionStructureApi.getMenuTree();
        console.log('GetMenuTree response:', menuTree);

        if (!menuTree || !Array.isArray(menuTree)) {
          setModuleGroups([]);
          setIsLoading(false);
          return;
        }

        // Group menus by module
        const grouped: Record<string, { name: string; menus: MenuItem[] }> = {};

        menuTree.forEach((menu: any) => {
          const modId = menu.perModuleId;

          if (modId && selectedModuleIds.includes(modId)) {
            // Use module name from API or from mapping or fallback
            const moduleName = menu.module || MODULE_NAME_MAP[modId] || `Module ${modId.substring(0, 8)}`;

            if (!grouped[modId]) {
              grouped[modId] = {
                name: moduleName,
                menus: []
              };
            }

            // Add parent menu
            grouped[modId].menus.push({
              id: menu.id,
              name: menu.label || menu.name || menu.key,
              label: menu.label,
              key: menu.key,
              parentId: menu.parentId || null,
              children: menu.children?.map((child: any) => ({
                id: child.id,
                name: child.label || child.name || child.key,
                label: child.label,
                key: child.key,
                parentId: child.parentId || null
              })) || []
            });
          }
        });

        const result: ModuleGroup[] = Object.entries(grouped).map(([id, data]) => ({
          moduleId: id,
          moduleName: data.name,
          menus: data.menus
        }));

        // Sort by module name
        result.sort((a, b) => a.moduleName.localeCompare(b.moduleName));

        console.log('Final result:', result);
        setModuleGroups(result);

      } catch (err: any) {
        console.error('Failed:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load');
        toast.error('Failed to load menu permissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [selectedModuleIds]);

  // Get ALL menu IDs including children
  const getAllMenuIds = useCallback((): string[] => {
    const ids: string[] = [];
    moduleGroups.forEach(group => {
      group.menus.forEach(menu => {
        ids.push(menu.id);
        if (menu.children) {
          menu.children.forEach(child => ids.push(child.id));
        }
      });
    });
    return ids;
  }, [moduleGroups]);

  const totalMenuCount = getAllMenuIds().length;

  const [selected, setSelected] = useState<string[]>(initialData.menuIds || []);
  const [activeModuleId, setActiveModuleId] = useState('');
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (moduleGroups.length > 0 && !activeModuleId) {
      setActiveModuleId(moduleGroups[0].moduleId);
    }
  }, [moduleGroups, activeModuleId]);

  // Get menu IDs for a module (including children)
  const getModuleMenuIds = useCallback((moduleId: string): string[] => {
    const group = moduleGroups.find(g => g.moduleId === moduleId);
    if (!group) return [];
    const ids: string[] = [];
    group.menus.forEach(menu => {
      ids.push(menu.id);
      if (menu.children) {
        menu.children.forEach(child => ids.push(child.id));
      }
    });
    return ids;
  }, [moduleGroups]);

  const getModuleSelectionState = useCallback((moduleId: string) => {
    const menuIds = getModuleMenuIds(moduleId);
    if (menuIds.length === 0) return { isChecked: false, isIndeterminate: false };
    const selectedCount = menuIds.filter(id => selected.includes(id)).length;
    if (selectedCount === 0) return { isChecked: false, isIndeterminate: false };
    if (selectedCount === menuIds.length) return { isChecked: true, isIndeterminate: false };
    return { isChecked: false, isIndeterminate: true };
  }, [selected, getModuleMenuIds]);

  const getParentSelectionState = useCallback((menu: MenuItem) => {
    if (!menu.children || menu.children.length === 0) {
      return { isChecked: selected.includes(menu.id), isIndeterminate: false };
    }
    const childIds = menu.children.map(c => c.id);
    const selectedCount = childIds.filter(id => selected.includes(id)).length;
    if (selectedCount === 0) return { isChecked: false, isIndeterminate: false };
    if (selectedCount === childIds.length) return { isChecked: true, isIndeterminate: false };
    return { isChecked: false, isIndeterminate: true };
  }, [selected]);

  const toggleModule = useCallback((moduleId: string) => {
    const menuIds = getModuleMenuIds(moduleId);
    const allSelected = menuIds.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !menuIds.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...menuIds])]);
    }
  }, [selected, getModuleMenuIds]);

  const toggleParentMenu = useCallback((menu: MenuItem) => {
    if (!menu.children || menu.children.length === 0) {
      toggleLeafMenu(menu.id);
      return;
    }
    const childIds = menu.children.map(c => c.id);
    // Include the parent's own GUID so the saved assignment matches the
    // rendered hierarchy (the parent/group node itself is selected too).
    const groupIds = [menu.id, ...childIds];
    const allSelected = childIds.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...groupIds])]);
    }
  }, [selected]);

  const toggleLeafMenu = (menuId: string) => {
    setSelected(prev =>
        prev.includes(menuId) ? prev.filter(x => x !== menuId) : [...prev, menuId]
    );
  };

  const selectAll = useCallback(() => {
    const allIds = getAllMenuIds();
    setSelected(allIds);
    toast.success(`Selected all ${allIds.length} menus`);
  }, [getAllMenuIds]);

  const deselectAll = useCallback(() => {
    setSelected([]);
    toast.success('Deselected all menus');
  }, []);

  const completionPercentage = totalMenuCount > 0 ? (selected.length / totalMenuCount) * 100 : 0;

  const handleSubmit = () => {
    console.log('Submitting menu IDs:', selected);
    onSubmit({ menuIds: selected });
  };

  // Filter menus based on search
  const filterMenusBySearch = (menus: MenuItem[]): MenuItem[] => {
    if (!search) return menus;
    return menus.filter(menu => {
      const matchesParent = menu.name.toLowerCase().includes(search.toLowerCase());
      const matchesChildren = menu.children?.some(child =>
          child.name.toLowerCase().includes(search.toLowerCase())
      );
      if (matchesParent || matchesChildren) return true;
      return false;
    }).map(menu => ({
      ...menu,
      children: menu.children?.filter(child =>
          child.name.toLowerCase().includes(search.toLowerCase())
      )
    }));
  };

  // Filter selected menus
  const filterSelectedMenus = (menus: MenuItem[]): MenuItem[] => {
    if (!showOnlySelected) return menus;
    return menus.filter(menu => {
      const isParentSelected = selected.includes(menu.id);
      const hasSelectedChildren = menu.children?.some(child => selected.includes(child.id));
      if (isParentSelected || hasSelectedChildren) {
        return {
          ...menu,
          children: menu.children?.filter(child => selected.includes(child.id))
        };
      }
      return false;
    });
  };

  // Loading
  if (isLoading) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-4">Loading menus...</p>
          </div>
        </div>
    );
  }

  // Error
  if (error) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-slate-800 mb-2">Error</h4>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button variant="outline" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
          </div>
        </div>
    );
  }

  if (selectedModuleIds.length === 0 || moduleGroups.length === 0 || totalMenuCount === 0) {
    return (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">No Menus Available</h4>
          <p className="text-gray-500 mb-6">The selected modules have no menus.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button onClick={() => onSubmit({ menuIds: [] })} className="gap-2 bg-emerald-600 text-white">
              Skip <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
    );
  }

  const activeModule = moduleGroups.find(g => g.moduleId === activeModuleId);
  const filteredMenus = activeModule ? filterSelectedMenus(filterMenusBySearch(activeModule.menus)) : [];

  return (
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Menu Permissions</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {moduleGroups.length} modules • {totalMenuCount} menus
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30">
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {selected.length} / {totalMenuCount}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Completion</span>
            <span className="font-medium text-emerald-600">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                 style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        <div className="flex gap-4 h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          {/* Sidebar */}
          <div className="w-72 shrink-0 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                <FolderTree className="w-3 h-3" /> Modules ({moduleGroups.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {moduleGroups.map(group => {
                const { isChecked, isIndeterminate } = getModuleSelectionState(group.moduleId);
                const menuIds = getModuleMenuIds(group.moduleId);
                const selectedCount = menuIds.filter(id => selected.includes(id)).length;
                const percentage = menuIds.length > 0 ? (selectedCount / menuIds.length) * 100 : 0;

                return (
                    <div key={group.moduleId}
                         className={`border rounded-lg transition-all cursor-pointer ${activeModuleId === group.moduleId ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'}`}
                         onClick={() => setActiveModuleId(group.moduleId)}>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Checkbox checked={isChecked}
                                  ref={(el) => { if (el) (el as any).indeterminate = isIndeterminate; }}
                                  onCheckedChange={() => toggleModule(group.moduleId)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="data-[state=checked]:bg-emerald-600" />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{group.moduleName}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{selectedCount}/{menuIds.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          {/* Menu List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activeModule?.moduleName || 'Select a module'}</p>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Search menus..." value={search}
                       onChange={e => setSearch(e.target.value)}
                       className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800" />
              </div>
              <button onClick={() => setShowOnlySelected(!showOnlySelected)}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${showOnlySelected ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {showOnlySelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />} Selected
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/20 dark:bg-slate-900/20">
              {filteredMenus.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">No menus found</p>
                  </div>
              )}
              {filteredMenus.map(menu => {
                if (menu.children && menu.children.length > 0) {
                  const { isChecked, isIndeterminate } = getParentSelectionState(menu);
                  const childIds = menu.children.map(c => c.id);
                  const selectedCount = childIds.filter(id => selected.includes(id)).length;
                  const expanded = expandedParents[menu.id] !== false;

                  return (
                      <div key={menu.id} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                             onClick={() => setExpandedParents(prev => ({ ...prev, [menu.id]: !expanded }))}>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                          <Checkbox checked={isChecked}
                                    ref={(el) => { if (el) (el as any).indeterminate = isIndeterminate; }}
                                    onCheckedChange={(e) => { e.stopPropagation(); toggleParentMenu(menu); }}
                                    className="data-[state=checked]:bg-emerald-500" />
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{menu.name}</span>
                          <span className="text-xs text-emerald-600">{selectedCount}/{childIds.length}</span>
                        </div>
                        {expanded && (
                            <div className="p-2 space-y-1 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                              {menu.children.map(child => {
                                const checked = selected.includes(child.id);
                                return (
                                    <label key={child.id}
                                           className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all ${checked ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                      <Checkbox checked={checked} onCheckedChange={() => toggleLeafMenu(child.id)}
                                                className="data-[state=checked]:bg-emerald-600" />
                                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{child.name}</span>
                                      {checked && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                                    </label>
                                );
                              })}
                            </div>
                        )}
                      </div>
                  );
                }

                // Leaf menu (no children)
                const checked = selected.includes(menu.id);
                return (
                    <label key={menu.id}
                           className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${checked ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                      <Checkbox checked={checked} onCheckedChange={() => toggleLeafMenu(menu.id)}
                                className="data-[state=checked]:bg-emerald-600" />
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{menu.name}</span>
                      {checked && <Check className="w-4 h-4 text-emerald-500" />}
                    </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button variant="outline" onClick={selectAll} className="gap-2">
              <CheckCheck className="w-4 h-4" /> Select All
            </Button>
            <Button variant="outline" onClick={deselectAll} disabled={selected.length === 0}>
              <Trash2 className="w-4 h-4" /> Clear
            </Button>
          </div>
          <Button onClick={handleSubmit}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 shadow-md">
            {selected.length === 0 ? 'Skip' : 'Next'} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
  );
}