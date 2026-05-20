import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Search, Check, ChevronDown } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Checkbox } from '../../../../ui/checkbox';
import { MOCK_MODULE_MENUS, MOCK_MENU_APIS } from '../../../../../data/usermgmt/permissionsMock';
import type { WizardFormData } from '../AddAccountWizard';
import { Input } from '../../../../ui/input';

interface Props {
  selectedMenuIds: string[];
  initialData: WizardFormData['step3'];
  onSubmit: (data: WizardFormData['step3']) => void;
  onBack: () => void;
}

export function AccessPermissionsStep({ selectedMenuIds, initialData, onSubmit, onBack }: Props) {
  // Always show all mock data
  const data = MOCK_MENU_APIS;

  // Build module → menus map from MOCK_MODULE_MENUS for grouping the sidebar
  const moduleGroups = useMemo(() => {
    return MOCK_MODULE_MENUS.map(mod => ({
      moduleId:   mod.perModuleId,
      moduleName: mod.perModule,
      menus: mod.perMenuList
        .map(menu => data.find(d => d.perMenuId === menu.id))
        .filter(Boolean) as typeof data,
    })).filter(g => g.menus.length > 0);
  }, [data]);

  const [selected, setSelected]       = useState<string[]>(initialData.accessIds);
  const [activeMenu, setActiveMenu]   = useState(data[0]?.perMenuId ?? '');
  const [search, setSearch]           = useState('');
  // Track which module groups are expanded in the sidebar
  const [expandedMods, setExpandedMods] = useState<Record<string, boolean>>(
    () => Object.fromEntries(moduleGroups.map(g => [g.moduleId, true]))
  );

  const toggleMod = (id: string) =>
    setExpandedMods(s => ({ ...s, [id]: !s[id] }));

  const activeApis = useMemo(() => {
    const menu = data.find(d => d.perMenuId === activeMenu);
    if (!menu) return [];
    const q = search.toLowerCase();
    return q ? menu.perApiList.filter(a => a.name.toLowerCase().includes(q)) : menu.perApiList;
  }, [data, activeMenu, search]);

  const activeApiIds = useMemo(() =>
    data.find(d => d.perMenuId === activeMenu)?.perApiList.map(a => a.id) ?? [],
    [data, activeMenu]
  );

  const allActiveSelected = activeApiIds.length > 0 && activeApiIds.every(id => selected.includes(id));

  const toggleApi = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(allActiveSelected
      ? selected.filter(id => !activeApiIds.includes(id))
      : [...new Set([...selected, ...activeApiIds])]
    );

  const actionColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('create') || n.includes('add') || n.includes('upload'))     return 'bg-green-100 text-green-700';
    if (n.includes('edit')   || n.includes('update'))                           return 'bg-blue-100 text-blue-700';
    if (n.includes('delete') || n.includes('remove'))                           return 'bg-red-100 text-red-700';
    if (n.includes('approve'))                                                  return 'bg-purple-100 text-purple-700';
    if (n.includes('export') || n.includes('download') || n.includes('print')) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  const totalApis = data.reduce((acc, m) => acc + m.perApiList.length, 0);

  const activeMenuName = data.find(d => d.perMenuId === activeMenu)?.perMenu ?? '';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Access Permissions</h2>
          <p className="text-sm text-gray-500 mt-1">Define what actions this account can perform per menu.</p>
        </div>
        <span className="text-sm text-gray-400">{selected.length} / {totalApis} selected</span>
      </div>

      <div className="flex gap-0 h-[460px] border border-gray-100 rounded-xl overflow-hidden">

        {/* ── Sidebar: modules → menus (collapsible, scrollable) ── */}
        <div className="w-48 shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Menus</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {moduleGroups.map(group => {
              const expanded = expandedMods[group.moduleId] ?? true;
              // Count selected actions across all menus in this module group
              const groupSelectedCount = group.menus.reduce((acc, menu) =>
                acc + menu.perApiList.filter(a => selected.includes(a.id)).length, 0
              );
              const groupTotalCount = group.menus.reduce((acc, menu) => acc + menu.perApiList.length, 0);

              return (
                <div key={group.moduleId}>
                  {/* Module header — collapsible, visually distinct from menu items */}
                  <button
                    onClick={() => toggleMod(group.moduleId)}
                   className={`w-full flex items-center justify-between px-3 py-2.5 border-b transition-all
${
  expanded
    ? 'bg-emerald-50 border-emerald-200'
    : 'bg-white hover:bg-gray-50 border-gray-100'
}`}
                  >
                    <div className="min-w-0 flex flex-col items-start">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {group.moduleName}
                      </p>
                      <p className="text-[10px] text-emerald-600 ">{groupSelectedCount}/{groupTotalCount}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                  </button>

                  {/* Menu items under this module */}
                  {expanded && group.menus.map(menu => {
                    const menuSelected = menu.perApiList.filter(a => selected.includes(a.id)).length;
                    const isActive = activeMenu === menu.perMenuId;
                    return (
                      <button
                        key={menu.perMenuId}
                        onClick={() => { setActiveMenu(menu.perMenuId); setSearch(''); }}
                        className={`w-full text-left px-4 py-2.5 border-b border-gray-100 transition-colors ${
                          isActive ? 'bg-green-50 border-l-2 border-l-green-500' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                          {menu.perMenu}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {menuSelected}/{menu.perApiList.length} actions
                        </p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Actions panel ── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-700 truncate">{activeMenuName}</p>
            </div>
            <div className="relative w-44 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <button
              onClick={toggleAll}
              className="text-sm font-medium text-green-600 hover:text-green-700 whitespace-nowrap shrink-0"
            >
              {allActiveSelected ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {/* Action list — scrollable */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {activeApis.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                No actions found
              </div>
            ) : activeApis.map(api => {
              const checked = selected.includes(api.id);
              return (
                <label
                  key={api.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    checked ? 'border-green-300 bg-green-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleApi(api.id)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${actionColor(api.name)}`}>
                    {api.name.split(/[._\s]/)[0].toUpperCase()}
                  </span>
                  {/* <span className="text-sm text-gray-700 truncate flex-1">{api.name}</span> */}
                  {checked && <Check className="w-3 h-3 text-green-500 shrink-0" />}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={() => onSubmit({ accessIds: selected })}
          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
