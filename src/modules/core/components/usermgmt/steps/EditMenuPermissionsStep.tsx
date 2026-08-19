// steps/EditMenuPermissionsStep.tsx - FIXED VERSION

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Check, ChevronDown, Save, X, FileText, FolderTree, AlertCircle, Loader2, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { getAllMenus, saveUserPermissions } from "@/modules/auth/services/account/account.api";
import type { EditWizardFormData } from "@/modules/core/components/usermgmt/steps/EditAccountWizard";
import toast from "react-hot-toast";

interface Props {
  selectedModuleIds: string[];
  userId: string;
  initialData: EditWizardFormData["step2"];
  onSave: (data: EditWizardFormData["step2"]) => void;
  onCancel: () => void;
  saving?: boolean;
  onFormChange?: () => void;
  originalMenuIds?: string[];
}

interface MenuNode {
  id: string;
  name: string;
  label: string;
  key?: string;
  parentId?: string | null;
  parentKey?: string;
  children?: MenuNode[];
  perModuleId?: string;
  module?: string;
  isChild?: boolean;
}

export function EditMenuPermissionsStep({
                                          selectedModuleIds,
                                          userId,
                                          initialData,
                                          onSave,
                                          onCancel,
                                          saving,
                                          onFormChange,
                                          originalMenuIds = []
                                        }: Props) {
  const [selected, setSelected] = useState<string[]>(initialData.menuIds || []);
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string>("");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "selected" | "unselected">("all");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangesSummary, setShowChangesSummary] = useState(false);

  // ✅ LOGGING: Initial data
  console.log('=== EditMenuPermissionsStep INIT ===');
  console.log('selectedModuleIds:', selectedModuleIds);
  console.log('userId:', userId);
  console.log('initialData.menuIds:', initialData.menuIds);
  console.log('originalMenuIds received:', originalMenuIds);
  console.log('originalMenuIds length:', originalMenuIds?.length);

  // ✅ Calculate changes with proper filtering
  const changes = useMemo(() => {
    const currentIds = selected || [];
    const originalIds = originalMenuIds || [];

    const validCurrent = currentIds.filter(id => id && id.length > 0);
    const validOriginal = originalIds.filter(id => id && id.length > 0);

    const current = new Set(validCurrent);
    const original = new Set(validOriginal);

    const added = validCurrent.filter(id => !original.has(id));
    const removed = validOriginal.filter(id => !current.has(id));
    const unchanged = validCurrent.filter(id => original.has(id));

    console.log('=== CHANGE CALCULATION ===');
    console.log('validCurrent:', validCurrent.length);
    console.log('validOriginal:', validOriginal.length);
    console.log('added:', added.length);
    console.log('removed:', removed.length);
    console.log('unchanged:', unchanged.length);

    return { added, removed, unchanged };
  }, [selected, originalMenuIds]);

  const hasChanges = changes.added.length > 0 || changes.removed.length > 0;

  // ✅ Helper to get menu name
  const getMenuName = useCallback((menu: any): string => {
    return menu.label || menu.name || menu.title || menu.key || 'Unnamed Menu';
  }, []);

  // ✅ Process menu tree
  const processMenuTree = useCallback((menus: any[]): any[] => {
    return menus.map(menu => ({
      ...menu,
      name: getMenuName(menu),
      label: getMenuName(menu),
      children: menu.children ? processMenuTree(menu.children) : []
    }));
  }, [getMenuName]);

  // ✅ Get all menu IDs from a list of menus
  const getAllMenuIds = useCallback((menus: any[]): string[] => {
    const ids: string[] = [];
    menus.forEach(menu => {
      ids.push(menu.id);
      if (menu.children?.length) {
        ids.push(...getAllMenuIds(menu.children));
      }
    });
    return ids;
  }, []);

  // ✅ Fetch menus
  useEffect(() => {
    const fetchMenus = async () => {
      if (selectedModuleIds.length === 0) {
        setModules([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('=== Fetching Menus ===');
      console.log('selectedModuleIds:', selectedModuleIds);

      try {
        const menuTree = await getAllMenus();
        console.log('menuTree received:', menuTree?.length || 0, 'menus');

        const processedTree = processMenuTree(menuTree || []);
        console.log('processedTree:', processedTree.length);

        // ✅ Create a set of valid menu IDs from the tree
        const validMenuIdSet = new Set();
        const flattenMenus = (menus: any[]) => {
          menus.forEach((menu: MenuNode) => {
            validMenuIdSet.add(menu.id);
            if (menu.children) {
              flattenMenus(menu.children);
            }
          });
        };
        flattenMenus(processedTree);
        console.log('validMenuIdSet size:', validMenuIdSet.size);

        // ✅ Filter originalMenuIds to only those that exist in the current tree
        const validOriginalMenuIds = originalMenuIds.filter(id => validMenuIdSet.has(id));
        console.log('validOriginalMenuIds:', validOriginalMenuIds.length);

        // ✅ BUILD MODULE MAP WITH PROPER FILTERING
        const moduleMap = new Map();
        const selectedModuleIdSet = new Set(selectedModuleIds);
        console.log('selectedModuleIdSet:', selectedModuleIdSet);

        // ✅ Track menus that were skipped
        let skippedMenus = 0;

        processedTree.forEach((menu: MenuNode) => {
          const modId = menu.perModuleId || menu.moduleId;

          // ✅ Only include if the menu belongs to a selected module
          if (selectedModuleIdSet.has(modId)) {
            if (!moduleMap.has(modId)) {
              let moduleName = menu.module || `Module ${modId}`;
              moduleMap.set(modId, {
                moduleId: modId,
                moduleName: moduleName,
                menus: []
              });
            }

            // ✅ Add menu with children
            const menuWithChildren = {
              ...menu,
              name: getMenuName(menu),
              label: getMenuName(menu),
              children: menu.children ? menu.children.map((child: any) => ({
                ...child,
                name: getMenuName(child),
                label: getMenuName(child)
              })) : []
            };
            moduleMap.get(modId).menus.push(menuWithChildren);
          } else {
            skippedMenus++;
            console.log(`⏭️ Skipping menu ${menu.name} - not in selected modules (${modId})`);
          }
        });

        const modulesList = Array.from(moduleMap.values());
        console.log('modulesList built:', modulesList.length, 'modules');
        console.log('⏭️ Total skipped menus:', skippedMenus);

        // ✅ Log what was included
        modulesList.forEach(mod => {
          console.log(`📁 Module: ${mod.moduleName} (${mod.moduleId})`);
          console.log(`   Menus: ${mod.menus.length}`);
          mod.menus.forEach((menu: any) => {
            console.log(`   - ${menu.name} (${menu.id})`);
            if (menu.children) {
              menu.children.forEach((child: any) => {
                console.log(`     - ${child.name} (${child.id})`);
              });
            }
          });
        });

        setModules(modulesList);

        if (modulesList.length > 0 && !activeModuleId) {
          setActiveModuleId(modulesList[0].moduleId);
        }

        // ✅ If no modules found, show a message
        if (modulesList.length === 0) {
          toast.error('No menus found for the selected modules');
        }
      } catch (error) {
        console.error("Failed to fetch menus:", error);
        toast.error("Failed to load menu permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [selectedModuleIds, originalMenuIds, processMenuTree, getMenuName]);

  const activeModule = modules.find(m => m.moduleId === activeModuleId);
  const activeMenuIds = activeModule ? getAllMenuIds(activeModule.menus) : [];
  const allActiveSelected = activeMenuIds.length > 0 && activeMenuIds.every(id => selected.includes(id));

  const toggleMenu = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    onFormChange?.();
  };

  const toggleAll = () => {
    const newSelected = allActiveSelected
        ? selected.filter(id => !activeMenuIds.includes(id))
        : [...new Set([...selected, ...activeMenuIds])];
    setSelected(newSelected);
    onFormChange?.();
  };

  const toggleParentExpand = (id: string) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMenus = useMemo(() => {
    if (!activeModule) return [];
    let menus = [...activeModule.menus];

    if (search) {
      const q = search.toLowerCase();
      menus = menus.filter(menu =>
          menu.name.toLowerCase().includes(q) ||
          menu.children?.some((c: any) => c.name.toLowerCase().includes(q))
      );
    }

    if (quickFilter === "selected") {
      menus = menus.filter(menu => {
        const menuSelected = selected.includes(menu.id);
        const childrenSelected = menu.children?.some((c: any) => selected.includes(c.id));
        return menuSelected || childrenSelected;
      });
    } else if (quickFilter === "unselected") {
      menus = menus.filter(menu => {
        const menuSelected = !selected.includes(menu.id);
        const childrenUnselected = menu.children?.every((c: any) => !selected.includes(c.id));
        return menuSelected && (childrenUnselected ?? true);
      });
    }

    return menus;
  }, [activeModule, search, quickFilter, selected]);

  const totalMenus = modules.reduce((acc, mod) => acc + getAllMenuIds(mod.menus).length, 0);

  const isNewlyAdded = (id: string) => changes.added.includes(id);
  const isRemoved = (id: string) => changes.removed.includes(id);

  const handleSave = async () => {
    console.log('=== SAVING MENU PERMISSIONS ===');
    console.log('userId:', userId);
    console.log('selected menu count:', selected.length);
    console.log('hasChanges:', hasChanges);
    console.log('changes.added:', changes.added.length);
    console.log('changes.removed:', changes.removed.length);

    if (!userId) {
      toast.error("User ID is missing");
      return;
    }

    if (hasChanges) {
      const allMenus: Record<string, string> = {};
      modules.forEach(mod => {
        const menuIds = getAllMenuIds(mod.menus);
        mod.menus.forEach((menu: any) => {
          allMenus[menu.id] = menu.name;
          if (menu.children) {
            menu.children.forEach((child: any) => {
              allMenus[child.id] = child.name;
            });
          }
        });
      });

      const addedNames = changes.added.map(id => allMenus[id] || id);
      const removedNames = changes.removed.map(id => allMenus[id] || id);

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
      await saveUserPermissions({
        userId: userId,
        moduleIds: null,    // ✅ Preserve modules
        menuIds: selected,
        apiActionIds: null  // ✅ Preserve APIs
      });

      const message = hasChanges
          ? `✅ ${changes.added.length} menu(s) added, ${changes.removed.length} menu(s) removed`
          : `Menu permissions updated: ${selected.length} menus selected`;

      toast.success(message);
      onSave({
        menuIds: selected,
        changes: {
          added: changes.added,
          removed: changes.removed
        }
      });
    } catch (error: any) {
      console.error('Save failed:', error);
      toast.error(error.message || "Failed to save menu permissions");
    } finally {
      setIsSaving(false);
    }
  };


  // ============ LOADING STATE ============
  if (loading) {
    return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          <span className="ml-3 text-gray-500">Loading menus...</span>
        </div>
    );
  }

  // ============ NO MODULES SELECTED ============
  if (selectedModuleIds.length === 0) {
    return (
        <div className="text-center py-16 bg-gray-50 rounded border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No modules selected. Please go back and select modules first.</p>
          <Button onClick={onCancel} variant="outline" className="mt-4">Go Back</Button>
        </div>
    );
  }

  // ============ NO MENUS AVAILABLE ============
  if (modules.length === 0) {
    return (
        <div className="text-center py-16 bg-gray-50 rounded border border-gray-200">
          <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No menus available for the selected modules.</p>
          <Button onClick={() => onSave({ menuIds: [] })} className="mt-4 bg-gray-800 text-white hover:bg-gray-900">
            Continue without menus
          </Button>
        </div>
    );
  }

  // ============ MAIN RENDER ============
  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Menu Permissions</h2>
            <p className="text-sm text-gray-500 mt-1">Select which menus this account can access</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-gray-100">
              <span className="text-sm font-medium text-gray-700">{selected.length} / {totalMenus} selected</span>
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
                            const mod = modules.find(m => m.menus.some((menu: any) => menu.id === id));
                            const menu = mod?.menus.find((m: any) => m.id === id);
                            const childMenu = mod?.menus.flatMap((m: any) => m.children || []).find((c: any) => c.id === id);
                            const name = menu?.name || childMenu?.name || id.slice(0, 8);
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
                            const mod = modules.find(m => m.menus.some((menu: any) => menu.id === id));
                            const menu = mod?.menus.find((m: any) => m.id === id);
                            const childMenu = mod?.menus.flatMap((m: any) => m.children || []).find((c: any) => c.id === id);
                            const name = menu?.name || childMenu?.name || id.slice(0, 8);
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

        <div className="flex flex-col lg:flex-row gap-0 h-[500px] border border-gray-200 rounded overflow-hidden">
          {/* Module Sidebar */}
          <div className="w-full lg:w-56 shrink-0 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
            <div className="p-2">
              {modules.map((mod) => {
                const menuIds = getAllMenuIds(mod.menus);
                const selectedCount = menuIds.filter(id => selected.includes(id)).length;
                const isActive = activeModuleId === mod.moduleId;
                return (
                    <button
                        key={mod.moduleId}
                        onClick={() => setActiveModuleId(mod.moduleId)}
                        className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                            isActive
                                ? "bg-gray-100 border-l-4 border-gray-600"
                                : "hover:bg-gray-100"
                        }`}
                    >
                      <p className={`text-sm font-medium truncate ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                        {mod.moduleName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{selectedCount}/{menuIds.length} menus</p>
                    </button>
                );
              })}
            </div>
          </div>

          {/* Menu Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-white shrink-0 flex-wrap">
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search menus..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 text-sm"
                />
              </div>
              <div className="flex gap-1">
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
              <button onClick={toggleAll} className="text-sm font-medium text-gray-600 hover:text-gray-800">
                {allActiveSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30">
              {filteredMenus.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No menus found</div>
              ) : (
                  filteredMenus.map((menu) => {
                    // ✅ Check if this is a parent menu with children
                    if (menu.children && menu.children.length > 0) {
                      const expanded = expandedParents[menu.id] ?? true;
                      const childIds = menu.children.map((c: any) => c.id);
                      const allSelected = childIds.every(id => selected.includes(id));
                      const selectedCount = childIds.filter(id => selected.includes(id)).length;

                      return (
                          <div key={menu.id} className="border border-gray-200 rounded overflow-hidden">
                            <div
                                onClick={() => toggleParentExpand(menu.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-white cursor-pointer hover:bg-gray-50"
                            >
                              <FolderTree className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-800 flex-1 truncate">{menu.name}</span>
                              <span className="text-xs text-gray-600">{selectedCount}/{childIds.length}</span>
                              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "" : "-rotate-90"}`} />
                            </div>
                            {expanded && (
                                <div className="pl-6 pr-2 py-2 space-y-1 border-t border-gray-100 bg-gray-50/50">
                                  <button
                                      onClick={() => {
                                        const newSelected = allSelected
                                            ? selected.filter(id => !childIds.includes(id))
                                            : [...new Set([...selected, ...childIds])];
                                        setSelected(newSelected);
                                        onFormChange?.();
                                      }}
                                      className="text-xs text-gray-600 hover:text-gray-800 mb-1"
                                  >
                                    {allSelected ? "Deselect All" : "Select All"}
                                  </button>
                                  {menu.children.map((child: any) => {
                                    const checked = selected.includes(child.id);
                                    const isNew = isNewlyAdded(child.id);
                                    const isRemovedMenu = isRemoved(child.id);
                                    // ✅ Use child.name which should now be properly populated
                                    const childName = child.name || child.label || child.title || child.key || 'Unnamed Child';

                                    return (
                                        <label
                                            key={child.id}
                                            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition ${
                                                checked ? "bg-gray-100" : "hover:bg-gray-100"
                                            } ${isNew && checked ? "bg-emerald-50 border border-emerald-200" : ""} 
                                               ${isRemovedMenu && !checked ? "bg-red-50 border border-red-200 opacity-60" : ""}`}
                                        >
                                          <Checkbox
                                              checked={checked}
                                              onCheckedChange={() => toggleMenu(child.id)}
                                          />
                                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                                          <span className="text-sm text-gray-700 flex-1 truncate">{childName}</span>
                                          {isNew && checked && <span className="text-xs text-emerald-600 font-medium">✨ New</span>}
                                          {isRemovedMenu && !checked && <span className="text-xs text-red-600 font-medium">🗑️ Removed</span>}
                                          {checked && <Check className="w-3.5 h-3.5 text-gray-600" />}
                                        </label>
                                    );
                                  })}
                                </div>
                            )}
                          </div>
                      );
                    }

                    // ✅ Single menu (no children)
                    const checked = selected.includes(menu.id);
                    const isNew = isNewlyAdded(menu.id);
                    const isRemovedMenu = isRemoved(menu.id);

                    return (
                        <label
                            key={menu.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition ${
                                checked ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"
                            } ${isNew && checked ? "border-emerald-400 bg-emerald-50" : ""} 
                               ${isRemovedMenu && !checked ? "border-red-400 bg-red-50 opacity-60" : ""}`}
                        >
                          <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleMenu(menu.id)}
                          />
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 flex-1 truncate">{menu.name}</span>
                          {isNew && checked && <span className="text-xs text-emerald-600 font-medium">✨ New</span>}
                          {isRemovedMenu && !checked && <span className="text-xs text-red-600 font-medium">🗑️ Removed</span>}
                          {checked && <Check className="w-4 h-4 text-gray-600" />}
                        </label>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel} className="gap-1.5">
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || isSaving} className="gap-1.5 bg-gray-800 hover:bg-gray-900 text-white">
            {(saving || isSaving) ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
            ) : (
                <>
                  <Save className="w-4 h-4" /> Save Menu Permissions
                </>
            )}
          </Button>
        </div>
      </div>
  );
}