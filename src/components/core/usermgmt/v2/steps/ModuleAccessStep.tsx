// steps/ModuleAccessStep.tsx - Updated with dynamic icons

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronRight, ChevronLeft, LayoutGrid, Check,
  HelpCircle, Search, X, Copy,
  CheckCircle, RefreshCw, Settings, Users, DollarSign, Package, Heart,
  ShoppingCart, Target, Briefcase, Folder, BarChart
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { authListApi } from '../../../../../services/List/auth/authList.api';
import type { NameListItem } from '../../../../../types/NameList/nameList';
import type { WizardFormData } from '../AddAccountWizard';
import toast from 'react-hot-toast';

// Icon mapping from string to component
const ICON_COMPONENT_MAP: Record<string, any> = {
  'Settings': Settings,
  'Users': Users,
  'DollarSign': DollarSign,
  'Package': Package,
  'Heart': Heart,
  'ShoppingCart': ShoppingCart,
  'Target': Target,
  'Briefcase': Briefcase,
  'Folder': Folder,
  'BarChart': BarChart,
  'LayoutDashboard': LayoutGrid,
  'Building': LayoutGrid,
  'MapPin': LayoutGrid,
  'Network': LayoutGrid,
  'Calendar': LayoutGrid,
  'Shield': LayoutGrid,
  'History': LayoutGrid,
  'Database': LayoutGrid,
  'GraduationCap': LayoutGrid,
  'Clock': LayoutGrid,
};

function getIconComponent(iconName?: string) {
  const Icon = ICON_COMPONENT_MAP[iconName || ''] || LayoutGrid;
  return <Icon className="w-5 h-5" />;
}

function HelpTooltip({ text }: { text: string }) {
  return (
      <div className="group relative inline-block ml-1">
        <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {text}
        </div>
      </div>
  );
}

function getModuleCategory(moduleName: string): string {
  const lowerName = moduleName.toLowerCase();
  if (lowerName.includes('hr') || lowerName.includes('human')) return 'Human Resources';
  if (lowerName.includes('finance')) return 'Financial';
  if (lowerName.includes('core')) return 'Core Infrastructure';
  if (lowerName.includes('crm')) return 'Customer Relations';
  if (lowerName.includes('inventory')) return 'Operations';
  if (lowerName.includes('procurement')) return 'Operations';
  if (lowerName.includes('file')) return 'Administrative';
  if (lowerName.includes('report')) return 'Analytics';
  if (lowerName.includes('plan')) return 'Strategic';
  if (lowerName.includes('project')) return 'Project Management';
  return 'Other';
}

const QUICK_TEMPLATES = {
  'All Modules': (modules: NameListItem[]) => modules.map(m => m.id),
  'Core Infrastructure': (modules: NameListItem[]) => modules.filter(m =>
      getModuleCategory(m.name) === 'Core Infrastructure'
  ).map(m => m.id),
  'Human Resources': (modules: NameListItem[]) => modules.filter(m =>
      getModuleCategory(m.name) === 'Human Resources'
  ).map(m => m.id),
  'Financial': (modules: NameListItem[]) => modules.filter(m =>
      getModuleCategory(m.name) === 'Financial'
  ).map(m => m.id),
  'Operations': (modules: NameListItem[]) => modules.filter(m =>
      ['Operations'].includes(getModuleCategory(m.name))
  ).map(m => m.id),
};

interface Props {
  initialData: WizardFormData['step2'];
  onSubmit: (data: WizardFormData['step2']) => void;
  onBack: () => void;
  title?: string;
  description?: string;
}

export function ModuleAccessStep({
                                   initialData,
                                   onSubmit,
                                   onBack,
                                   title = "Module Access",
                                   description = "Choose which modules this account can access."
                                 }: Props) {
  const [modules, setModules] = useState<NameListItem[]>([]);
  const [selected, setSelected] = useState<string[]>(initialData.moduleIds);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentlyCopied, setRecentlyCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch modules from your API endpoint
  const fetchModules = useCallback(async () => {
    try {
      setFetching(true);
      setError('');
      const modulesData = await authListApi.getAllModuleNames();
      console.log('Fetched modules with icons:', modulesData); // Debug log
      setModules(modulesData);

      const validSelected = initialData.moduleIds.filter(id =>
          modulesData.some(m => m.id === id)
      );
      if (validSelected.length !== initialData.moduleIds.length) {
        setSelected(validSelected);
      }
    } catch (err: any) {
      console.error('Error fetching modules:', err);
      setError('Unable to load modules. Please try again.');
      toast.error('Failed to load modules');
    } finally {
      setFetching(false);
    }
  }, [initialData.moduleIds]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    modules.forEach(module => {
      cats.add(getModuleCategory(module.name));
    });
    return Array.from(cats).sort();
  }, [modules]);

  const filteredModules = useMemo(() => {
    let filtered = modules;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
          m.name.toLowerCase().includes(query) ||
          (m.key && m.key.toLowerCase().includes(query))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m =>
          getModuleCategory(m.name) === selectedCategory
      );
    }
    // Sort by order from database
    return [...filtered].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [modules, searchQuery, selectedCategory]);

  const toggle = (id: string) =>
      setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () =>
      setSelected(selected.length === filteredModules.length ? [] : filteredModules.map(m => m.id));

  const applyTemplate = (templateName: keyof typeof QUICK_TEMPLATES) => {
    const templateIds = QUICK_TEMPLATES[templateName](filteredModules);
    setSelected(prev => [...new Set([...prev, ...templateIds])]);
    toast.success(`Applied "${templateName}" template`);
  };

  const clearAll = () => {
    setSelected([]);
    toast.info('All modules deselected');
  };

  const copySelectionSummary = useCallback(() => {
    const selectedModules = modules.filter(m => selected.includes(m.id));
    const summary = {
      moduleCount: selected.length,
      modules: selectedModules.map(m => ({ id: m.id, name: m.name, icon: m.icon })),
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setRecentlyCopied(true);
    toast.success('Selection summary copied');
    setTimeout(() => setRecentlyCopied(false), 2000);
  }, [modules, selected]);

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Please select at least one module');
      toast.error('Please select at least one module');
      return;
    }
    const moduleNames = modules.filter(m => selected.includes(m.id)).map(m => m.name);
    onSubmit({ moduleIds: selected, moduleNames });
  };

  const selectedCount = selected.length;
  const totalCount = modules.length;
  const completionPercentage = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        toggleAll();
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        clearAll();
      }
      if (e.ctrlKey && e.key === 'c' && e.shiftKey) {
        e.preventDefault();
        copySelectionSummary();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleAll, clearAll, copySelectionSummary]);

  return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <HelpTooltip text="Select the modules this account will have access to" />
            </div>
            <p className="text-sm text-gray-500 ml-10">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
                onClick={fetchModules}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                title="Refresh modules"
                disabled={fetching}
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${fetching ? 'animate-spin' : ''}`} />
            </button>

            <button
                onClick={copySelectionSummary}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                title="Copy summary (Ctrl+Shift+C)"
            >
              {recentlyCopied ? (
                  <Check className="w-4 h-4 text-green-600" />
              ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
              <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg"
            />
          </div>

          <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {(searchQuery || selectedCategory !== 'all') && (
              <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
          )}
        </div>

        {/* Quick Templates */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg mb-6">
          <span className="text-xs text-gray-500 font-medium">Quick select:</span>
          {Object.keys(QUICK_TEMPLATES).map(template => (
              <button
                  key={template}
                  onClick={() => applyTemplate(template as keyof typeof QUICK_TEMPLATES)}
                  className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              >
                {template}
              </button>
          ))}
          <button
              onClick={clearAll}
              className="text-xs px-2.5 py-1 rounded-full text-gray-600 hover:bg-gray-100 ml-auto"
          >
            Clear All
          </button>
        </div>

        {/* Progress Bar */}
        {!fetching && modules.length > 0 && (
            <div className="space-y-1.5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-gray-500">Selection progress</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-700">{selectedCount} of {totalCount} modules</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">{filteredModules.length} modules shown</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gray-600 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
        )}

        {/* Modules Grid/List */}
        {fetching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
        ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
              {filteredModules.map(mod => {
                const active = selected.includes(mod.id);
                const category = getModuleCategory(mod.name);
                return (
                    <button
                        key={mod.id}
                        onClick={() => toggle(mod.id)}
                        className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            active
                                ? 'bg-gray-50 border-gray-400 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                    >
                      {active && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                      )}
                      <div className="mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                          {getIconComponent(mod.icon)}
                        </div>
                      </div>
                      <p className={`text-sm font-semibold leading-tight ${active ? 'text-gray-900' : 'text-gray-700'}`}>
                        {mod.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{category}</p>
                      {mod.order !== undefined && mod.order > 0 && (
                          <p className="text-xs text-gray-400 mt-1">Order: {mod.order}</p>
                      )}
                    </button>
                );
              })}
            </div>
        ) : (
            <div className="space-y-2 mb-6">
              {filteredModules.map(mod => {
                const active = selected.includes(mod.id);
                const category = getModuleCategory(mod.name);
                return (
                    <label
                        key={mod.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                            active ? 'bg-gray-50 border-gray-300' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                      <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggle(mod.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500"
                      />
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getIconComponent(mod.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{mod.name}</p>
                        <p className="text-xs text-gray-400">{category}</p>
                      </div>
                      {active && <Check className="w-4 h-4 text-gray-600" />}
                    </label>
                );
              })}
            </div>
        )}

        {/* Empty State */}
        {!fetching && filteredModules.length === 0 && (
            <div className="text-center py-12 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No modules match your search</p>
              <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="text-xs text-gray-600 mt-2 hover:underline"
              >
                Clear filters
              </button>
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-sm text-red-600">{error}</p>
              <button onClick={fetchModules} className="ml-auto text-sm text-red-600 hover:underline">
                Retry
              </button>
            </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onBack} className="gap-2 rounded-lg border-gray-200 hover:bg-gray-50 px-5">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {selectedCount} module{selectedCount !== 1 ? 's' : ''} selected
              </p>
              {selectedCount > 0 && (
                  <p className="text-xs text-gray-600 mt-0.5 font-medium flex items-center gap-1 justify-end">
                    <CheckCircle className="w-3 h-3" /> Ready to continue
                  </p>
              )}
            </div>

            <Button
                onClick={handleNext}
                disabled={selectedCount === 0}
                className={`gap-2 rounded-lg px-6 ${
                    selectedCount > 0
                        ? 'bg-gray-800 hover:bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-center text-xs text-gray-400 pt-4 mt-2">
                <span className="inline-flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">Ctrl+A</span> Select All
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">Ctrl+D</span> Deselect All
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">Ctrl+Shift+C</span> Copy Summary
                </span>
        </div>
      </div>
  );
}