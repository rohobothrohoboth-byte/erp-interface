import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Search, Check, ChevronDown,
  Users, CalendarOff, Clock, DollarSign, Briefcase,
  BookOpen as BookOpenIcon, ArrowDownCircle, ArrowUpCircle, PieChart, Package,
  Shield, Building2, GitBranch, Layers, Calendar, Sun,
  Target, Contact, Building, TrendingUp, Activity,
  FolderLock, FolderOpen, Share2,
  List, UserPlus, UserCircle, UserMinus, ClipboardList, BarChart2, CheckSquare,
  FileText, Star, CheckCircle, Scale, Zap, UserCheck, Lock, User,
  Archive, SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Checkbox } from '../../../../ui/checkbox';
import { MOCK_MODULE_MENU_TREE, getAllLeafMenuIds } from '../../../../../data/usermgmt/permissionsMock';
import type { MenuNode } from '../../../../../data/usermgmt/permissionsMock';
import type { WizardFormData } from '../AddAccountWizard';
import { Input } from '../../../../ui/input';

// Map icon name string → Lucide component
const ICON_MAP: Record<string, React.ElementType> = {
  Users, CalendarOff, Clock, DollarSign, Briefcase, BookOpen: BookOpenIcon,
  ArrowDownCircle, ArrowUpCircle, PieChart, Package,
  Shield, Building2, GitBranch, Layers, Calendar, Sun,
  Target, Contact, Building, TrendingUp, Activity,
  FolderLock, FolderOpen, Share2,
  List, UserPlus, UserCircle, UserMinus, ClipboardList, BarChart2, CheckSquare,
  FileText, Star, CheckCircle, Scale, Zap, UserCheck, Lock, User,
  Archive, SlidersHorizontal,
};

function MenuIcon({ name, className = 'w-3.5 h-3.5' }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? FileText;
  return <Icon className={className} />;
}

interface Props {
  selectedModuleIds: string[];
  initialData: WizardFormData['step2'];
  onSubmit: (data: WizardFormData['step2']) => void;
  onBack: () => void;
}

export function MenuPermissionsStep({ selectedModuleIds: _selectedModuleIds, initialData, onSubmit, onBack }: Props) {
  const data = MOCK_MODULE_MENU_TREE;

  const [selected, setSelected]     = useState<string[]>(initialData.menuIds);
  const [activeModule, setActiveModule] = useState(data[0]?.perModuleId ?? '');
  // Track which parent menus are expanded to show children
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [search, setSearch]         = useState('');

  const activeModuleData = data.find(d => d.perModuleId === activeModule);

  // Flat list of all selectable leaf IDs in the active module
  const activeLeafIds = useMemo(() => {
    if (!activeModuleData) return [];
    return activeModuleData.menus.flatMap(m =>
      m.isParent && m.children ? m.children.map(c => c.id) : [m.id]
    );
  }, [activeModuleData]);

  const allActiveSelected = activeLeafIds.length > 0 && activeLeafIds.every(id => selected.includes(id));

  const toggleLeaf = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleParentChildren = (children: MenuNode[]) => {
    const childIds = children.map(c => c.id);
    const allSelected = childIds.every(id => selected.includes(id));
    setSelected(s =>
      allSelected ? s.filter(id => !childIds.includes(id)) : [...new Set([...s, ...childIds])]
    );
  };

  const toggleAll = () =>
    setSelected(allActiveSelected
      ? selected.filter(id => !activeLeafIds.includes(id))
      : [...new Set([...selected, ...activeLeafIds])]
    );

  const toggleParentExpand = (id: string) =>
    setExpandedParents(s => ({ ...s, [id]: !s[id] }));

  // Filter menus by search — for parents, check if any child matches
  const filteredMenus = useMemo(() => {
    if (!activeModuleData) return [];
    const q = search.toLowerCase();
    if (!q) return activeModuleData.menus;
    return activeModuleData.menus.filter(m => {
      if (m.isParent && m.children) {
        return m.name.toLowerCase().includes(q) || m.children.some(c => c.name.toLowerCase().includes(q));
      }
      return m.name.toLowerCase().includes(q);
    });
  }, [activeModuleData, search]);

  const totalLeafs = getAllLeafMenuIds(data).length;

  // Count selected per module for sidebar badge
  const moduleSelectedCount = (modId: string) => {
    const mod = data.find(d => d.perModuleId === modId);
    if (!mod) return 0;
    const leafIds = mod.menus.flatMap(m =>
      m.isParent && m.children ? m.children.map(c => c.id) : [m.id]
    );
    return leafIds.filter(id => selected.includes(id)).length;
  };

  const moduleTotalCount = (modId: string) => {
    const mod = data.find(d => d.perModuleId === modId);
    if (!mod) return 0;
    return mod.menus.flatMap(m =>
      m.isParent && m.children ? m.children : [m]
    ).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Menu Permissions</h2>
          <p className="text-sm text-gray-500 mt-1">Select which menus this account can access per module.</p>
        </div>
        <span className="text-xs text-gray-400">{selected.length} / {totalLeafs} selected</span>
      </div>

      <div className="flex gap-0 h-[480px] border border-gray-100 rounded-xl overflow-hidden">

        {/* ── Module sidebar ── */}
        <div className="w-44 shrink-0 bg-gray-50 border-r border-gray-100 overflow-y-auto">
          {data.map(mod => {
            const selCount = moduleSelectedCount(mod.perModuleId);
            const totCount = moduleTotalCount(mod.perModuleId);
            const isActive = activeModule === mod.perModuleId;
            return (
              <button
                key={mod.perModuleId}
                onClick={() => { setActiveModule(mod.perModuleId); setSearch(''); }}
                className={`w-full text-left px-3 py-3 border-b border-gray-100 transition-colors ${
                  isActive ? 'bg-white border-l-2 border-l-green-500' : 'hover:bg-white'
                }`}
              >
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                  {mod.perModule}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{selCount}/{totCount} menus</p>
              </button>
            );
          })}
        </div>

        {/* ── Menu content ── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search menus..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <button onClick={toggleAll}
              className="text-sm font-medium text-green-600 hover:text-green-700 whitespace-nowrap">
              {allActiveSelected ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {/* Menu list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredMenus.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                No menus found
              </div>
            ) : filteredMenus.map(menu => {
              if (menu.isParent && menu.children) {
                // ── Parent menu — not selectable, click to expand ──
                const expanded = expandedParents[menu.id] ?? false;
                const childIds = menu.children.map(c => c.id);
                const allChildSelected = childIds.every(id => selected.includes(id));
                const someChildSelected = childIds.some(id => selected.includes(id));

                return (
                  <div key={menu.id}>
                    {/* Parent row — not selectable, click to expand/collapse */}
                    <div
                      onClick={() => toggleParentExpand(menu.id)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-lg  border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    >
                      <MenuIcon name={menu.icon} className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{menu.name}</span>
                      <span className={`text-xs shrink-0 font-medium ${someChildSelected ? 'text-green-600' : 'text-gray-400'}`}>
                        {childIds.filter(id => selected.includes(id)).length}/{childIds.length}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                    </div>

                    {/* Children */}
                    {expanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-green-100 pl-3">
                        <button
                          onClick={() => toggleParentChildren(menu.children!)}
                          className="text-xs font-medium text-green-600 hover:text-green-700 mb-1.5"
                        >
                          {allChildSelected ? 'Deselect all' : 'Select all'}
                        </button>
                        {menu.children.map(child => {
                          const checked = selected.includes(child.id);
                          return (
                            <label
                              key={child.id}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                                checked ? 'border-green-300 bg-green-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleLeaf(child.id)}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                              <span className="text-sm font-medium text-gray-700 truncate">{child.name}</span>
                              {checked && <Check className="w-3.5 h-3.5 text-green-500 ml-auto shrink-0" />}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Leaf menu — selectable ──
              const checked = selected.includes(menu.id);
              return (
                <label
                  key={menu.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    checked ? 'border-green-300 bg-green-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleLeaf(menu.id)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <MenuIcon name={menu.icon} className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">{menu.name}</span>
                  {checked && <Check className="w-3 h-3 text-green-500 ml-auto shrink-0" />}
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
          onClick={() => onSubmit({ menuIds: selected })}
          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
