// steps/AccessPermissionsStep.tsx - COMPLETE FIXED VERSION

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    ChevronRight, ChevronLeft, Search, Check, ChevronDown, Key, ShieldCheck, AlertCircle,
    CheckSquare, Square, Filter, Copy, Loader2,
    Layers, FolderTree, CheckCheck, Trash2, GitBranch
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import type { WizardFormData } from '../../../AddAccountWizard';
import { api } from '@/shared/services/api';
import toast from 'react-hot-toast';

interface Props {
    selectedMenuIds: string[];
    initialData: WizardFormData['step3'];
    onSubmit: (data: WizardFormData['step3']) => void;
    onBack: () => void;
    userId?: string;
}

interface ApiAction {
    id: string;      // ✅ This MUST be the GUID from the database
    name: string;    // Display name
    key: string;     // Store the key for reference but DON'T use it as the ID
    desc?: string;
}

interface MenuWithPermissions {
    menuId: string;
    menuName: string;
    moduleId: string;
    moduleName: string;
    perApiList: ApiAction[];
}

// ✅ Cache for API permissions
let permissionsCache: Record<string, ApiAction[]> = {};

export function AccessPermissionsStep({ selectedMenuIds, initialData, onSubmit, onBack, userId }: Props) {
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [menusWithPermissions, setMenusWithPermissions] = useState<MenuWithPermissions[]>([]);
    const [selected, setSelected] = useState<string[]>(initialData.accessIds || []);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'create' | 'edit' | 'delete' | 'view' | 'approve'>('all');
    const [showOnlySelected, setShowOnlySelected] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [activeMenuId, setActiveMenuId] = useState<string>('');

    // ============ FETCH PERMISSIONS FROM API ============
    const fetchPermissionsForMenus = useCallback(async (menuIds: string[]) => {
        const results: MenuWithPermissions[] = [];
        const total = menuIds.length;
        let completed = 0;

        for (const menuId of menuIds) {
            try {
                // ✅ Step 1: Get menu details
                const menuResponse = await api.get(`/auth/v1/Permission/GetPerMenu/${menuId}`);
                const menuData = menuResponse.data?.data || menuResponse.data || {};

                // ✅ Step 2: Get module details
                const moduleId = menuData.perModuleId || menuData.PerModuleId || '';
                let moduleName = 'Unknown Module';
                if (moduleId) {
                    try {
                        const moduleResponse = await api.get(`/auth/v1/Permission/GetPerModule/${moduleId}`);
                        const moduleData = moduleResponse.data?.data || moduleResponse.data || {};
                        moduleName = moduleData.l || moduleData.L || moduleData.name || moduleData.Name || 'Unknown Module';
                    } catch (e) {
                        console.warn(`Could not fetch module for ${moduleId}`);
                    }
                }

                // ✅ Step 3: Get API permissions - IMPORTANT: Use the GUID as the ID!
                let apiActions: ApiAction[] = [];
                try {
                    const apiResponse = await api.get(`/auth/v1/Permission/GetPerApiByMenu/${menuId}`);
                    const apiData = apiResponse.data?.data || apiResponse.data || [];

                    if (Array.isArray(apiData)) {
                        apiActions = apiData.map((item: any) => {
                            // ✅ CRITICAL: Use the GUID as the ID
                            const guid = item.id || item.Id || item.perApiId || '';
                            const key = item.key || item.Key || '';

                            // Log to verify we're getting GUIDs
                            if (guid && key) {
                                console.log(`✅ Menu ${menuId}: ${key} -> ${guid}`);
                            }

                            return {
                                id: guid,     // ✅ This MUST be the GUID
                                key: key,     // Store the key for display
                                name: item.name || item.Name || item.desc || item.Desc || item.label || key || 'Unknown',
                                desc: item.desc || item.Desc || ''
                            };
                        });
                    }
                } catch (e) {
                    console.warn(`Could not fetch API permissions for menu ${menuId}`);
                }

                // ✅ Filter out invalid entries (empty GUIDs)
                apiActions = apiActions.filter(a => a.id && a.id.length > 0);

                results.push({
                    menuId,
                    menuName: menuData.label || menuData.L || menuData.name || menuData.Name || 'Unknown Menu',
                    moduleId,
                    moduleName,
                    perApiList: apiActions
                });

                completed++;
                setLoadingProgress(Math.round((completed / total) * 100));

            } catch (error) {
                console.error(`❌ Failed to fetch data for menu ${menuId}:`, error);
                results.push({
                    menuId,
                    menuName: 'Unknown Menu',
                    moduleId: '',
                    moduleName: 'Unknown Module',
                    perApiList: []
                });
                completed++;
                setLoadingProgress(Math.round((completed / total) * 100));
            }
        }

        return results;
    }, []);

    // ============ LOAD ALL DATA ============
    useEffect(() => {
        const loadData = async () => {
            if (!selectedMenuIds || selectedMenuIds.length === 0) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setLoadingProgress(0);
            setLoadingError(null);

            try {
                const results = await fetchPermissionsForMenus(selectedMenuIds);
                setMenusWithPermissions(results);

                // Expand all menus by default
                const expanded: Record<string, boolean> = {};
                results.forEach(m => expanded[m.menuId] = true);
                setExpandedMenus(expanded);

                // Set first menu as active
                if (results.length > 0) {
                    setActiveMenuId(results[0].menuId);
                }

                // ✅ DEBUG: Log all permissions to verify they have GUIDs
                const allActions = results.flatMap(m => m.perApiList);
                console.log(`✅ Loaded ${allActions.length} total API permissions`);
                console.log('✅ Sample permissions (should show GUIDs):', allActions.slice(0, 5));

            } catch (error) {
                console.error('❌ Failed to load permissions:', error);
                setLoadingError('Failed to load permissions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // Clear cache on unmount
        return () => {
            permissionsCache = {};
        };
    }, [selectedMenuIds, fetchPermissionsForMenus]);

    // ============ HELPER FUNCTIONS ============
    const getAllActionIds = useCallback(() =>
            menusWithPermissions.flatMap(m => m.perApiList.map(a => a.id)),
        [menusWithPermissions]
    );

    const getMenuActionIds = useCallback((menuId: string) => {
        const menu = menusWithPermissions.find(m => m.menuId === menuId);
        return menu?.perApiList.map(a => a.id) || [];
    }, [menusWithPermissions]);

    const getMenuSelectionState = useCallback((menuId: string) => {
        const menuActionIds = getMenuActionIds(menuId);
        if (menuActionIds.length === 0) return { isChecked: false, isIndeterminate: false };
        const selectedCount = menuActionIds.filter(id => selected.includes(id)).length;
        if (selectedCount === 0) return { isChecked: false, isIndeterminate: false };
        if (selectedCount === menuActionIds.length) return { isChecked: true, isIndeterminate: false };
        return { isChecked: false, isIndeterminate: true };
    }, [selected, getMenuActionIds]);

    // ============ TOGGLE FUNCTIONS ============
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

    // ============ BULK OPERATIONS ============
    const selectAll = useCallback(() => {
        const allIds = getAllActionIds();
        setSelected(allIds);
        toast.success(`Selected all ${allIds.length} actions`);
    }, [getAllActionIds]);

    const deselectAll = useCallback(() => {
        setSelected([]);
        toast.success('Deselected all actions');
    }, []);

    // ============ COMPUTED VALUES ============
    const activeMenu = useMemo(() =>
            menusWithPermissions.find(m => m.menuId === activeMenuId),
        [menusWithPermissions, activeMenuId]
    );

    const activeApis = useMemo(() => {
        if (!activeMenu) return [];
        let apis = [...activeMenu.perApiList];
        if (search) apis = apis.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
        if (filterType !== 'all') apis = apis.filter(a => a.name.toLowerCase().includes(filterType));
        if (showOnlySelected) apis = apis.filter(a => selected.includes(a.id));
        return apis;
    }, [activeMenu, search, filterType, showOnlySelected, selected]);

    const activeApiIds = activeMenu?.perApiList.map(a => a.id) ?? [];
    const allActiveSelected = activeApiIds.length > 0 && activeApiIds.every(id => selected.includes(id));
    const totalApis = getAllActionIds().length;
    const completionPercentage = totalApis > 0 ? (selected.length / totalApis) * 100 : 0;

    // Group menus by module for display
    const groupedMenus = useMemo(() => {
        const groups: Record<string, { moduleName: string; menus: MenuWithPermissions[] }> = {};

        menusWithPermissions.forEach(menu => {
            const key = menu.moduleId || 'unknown';
            if (!groups[key]) {
                groups[key] = { moduleName: menu.moduleName || 'Other', menus: [] };
            }
            groups[key].menus.push(menu);
        });

        return groups;
    }, [menusWithPermissions]);

    // ============ RENDER: LOADING ============
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
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${loadingProgress}%` }} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{selectedMenuIds.length} menus to load</p>
                </div>
            </div>
        );
    }

    // ============ RENDER: ERROR ============
    if (loadingError) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Permissions</h4>
                <p className="text-gray-500 mb-6">{loadingError}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    // ============ RENDER: NO MENUS ============
    if (selectedMenuIds.length === 0 || menusWithPermissions.length === 0) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Menus Selected</h4>
                <p className="text-gray-500 mb-6">Please go back and select at least one menu.</p>
                <Button variant="outline" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
            </div>
        );
    }

    // ============ RENDER: MAIN ============
    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-emerald-500" />
                        Access Permissions
                    </h3>
                    <p className="text-sm text-gray-500">{menusWithPermissions.length} menus · {totalApis} total actions</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                    <span className="text-sm font-medium text-emerald-700">{selected.length} / {totalApis} selected</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Completion Progress</span>
                    <span className="font-medium text-emerald-600">{Math.round(completionPercentage)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex gap-4 h-[460px] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                {/* Sidebar - Menus grouped by module */}
                <div className="w-72 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-gray-200 bg-white">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                            Menus ({menusWithPermissions.length})
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {Object.entries(groupedMenus).map(([moduleId, group]) => (
                            <div key={moduleId} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                                    <span className="text-xs font-semibold text-gray-600">{group.moduleName}</span>
                                </div>
                                {group.menus.map(menu => {
                                    const { isChecked, isIndeterminate } = getMenuSelectionState(menu.menuId);
                                    const menuSelectedCount = getMenuActionIds(menu.menuId).filter(id => selected.includes(id)).length;
                                    const isActive = activeMenuId === menu.menuId;

                                    return (
                                        <div
                                            key={menu.menuId}
                                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                                                isActive ? 'bg-emerald-50 border-l-2 border-emerald-500' : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() => setActiveMenuId(menu.menuId)}
                                        >
                                            <Checkbox
                                                checked={isChecked}
                                                ref={(el) => {
                                                    if (el) (el as any).indeterminate = isIndeterminate;
                                                }}
                                                onCheckedChange={(e) => { e.stopPropagation(); toggleMenu(menu.menuId); }}
                                                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium truncate ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                                                    {menu.menuName}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="flex-1 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${menu.perApiList.length > 0 ? (menuSelectedCount / menu.perApiList.length) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-400">{menuSelectedCount}/{menu.perApiList.length}</span>
                                                </div>
                                            </div>
                                            {isActive && <Key className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
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

                        <button
                            onClick={() => setFilterType(prev => prev === 'all' ? 'view' : 'all')}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors ${filterType !== 'all' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}
                        >
                            {filterType !== 'all' ? `Filter: ${filterType}` : 'Filter'}
                        </button>

                        <button
                            onClick={() => setShowOnlySelected(!showOnlySelected)}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors ${showOnlySelected ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}
                        >
                            {showOnlySelected ? 'Selected Only' : 'All Actions'}
                        </button>
                    </div>

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
                            </div>
                        ) : (
                            activeApis.map(api => {
                                const checked = selected.includes(api.id);
                                const actionType = api.key?.split('.').pop()?.toUpperCase() || 'ACTION';
                                const actionColor = (() => {
                                    const action = actionType.toLowerCase();
                                    if (['create', 'add'].includes(action)) return 'bg-green-100 text-green-700';
                                    if (['edit', 'update'].includes(action)) return 'bg-blue-100 text-blue-700';
                                    if (['delete', 'remove'].includes(action)) return 'bg-red-100 text-red-700';
                                    if (['approve', 'reject'].includes(action)) return 'bg-purple-100 text-purple-700';
                                    if (['export', 'download'].includes(action)) return 'bg-amber-100 text-amber-700';
                                    return 'bg-gray-100 text-gray-600';
                                })();

                                return (
                                    <label
                                        key={api.id}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                            checked ? 'bg-emerald-50 border border-emerald-200 shadow-sm' : 'bg-white border border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={() => toggleAction(api.id)}
                                            className="data-[state=checked]:bg-emerald-600"
                                        />
                                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${actionColor}`}>
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
                            // ✅ DEBUG: Log the final selection
                            console.log('📤 SUBMITTING ACCESS PERMISSIONS:');
                            console.log('Total selected:', selected.length);
                            console.log('Sample IDs (should all be GUIDs):', selected.slice(0, 5));
                            console.log('Full selected array:', selected);

                            // ✅ Verify all are valid GUIDs
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
                        className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}