import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, LayoutGrid, Check } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { authListApi } from '../../../../../services/List/auth/authList.api';
import type { NameListItem } from '../../../../../types/NameList/nameList';
import type { WizardFormData } from '../AddAccountWizard';

const MODULE_COLORS: Record<string, string> = {
  hr:          'bg-blue-100 text-blue-700',
  finance:     'bg-emerald-100 text-emerald-700',
  core:        'bg-gray-100 text-gray-700',
  crm:         'bg-purple-100 text-purple-700',
  inventory:   'bg-orange-100 text-orange-700',
  procurement: 'bg-yellow-100 text-yellow-700',
  file:        'bg-teal-100 text-teal-700',
};

function moduleColor(name: string) {
  const key = Object.keys(MODULE_COLORS).find(k => name.toLowerCase().includes(k));
  return key ? MODULE_COLORS[key] : 'bg-green-100 text-green-700';
}

interface Props {
  initialData: WizardFormData['step2'];
  onSubmit: (data: WizardFormData['step2']) => void;
  onBack: () => void;
}

export function ModuleAccessStep({ initialData, onSubmit, onBack }: Props) {
  const [modules, setModules] = useState<NameListItem[]>([]);
  const [selected, setSelected] = useState<string[]>(initialData.moduleIds);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authListApi.getAllModuleNames()
      .then(setModules)
      .catch(() => setError('Could not load modules'))
      .finally(() => setFetching(false));
  }, []);

  const toggle = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(selected.length === modules.length ? [] : modules.map(m => m.id));

  const handleNext = () => {
    if (selected.length === 0) { setError('Select at least one module'); return; }
    const moduleNames = modules.filter(m => selected.includes(m.id)).map(m => m.name);
    onSubmit({ moduleIds: selected, moduleNames });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Module Access</h2>
          <p className="text-sm text-gray-500 mt-1">Choose which modules this account can access.</p>
        </div>
        {modules.length > 0 && (
          <button onClick={toggleAll}
            className="text-xs font-medium text-green-600 hover:text-green-700 underline underline-offset-2">
            {selected.length === modules.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      {fetching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {modules.map(mod => {
            const active = selected.includes(mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => toggle(mod.id)}
                className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                  active
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                {active && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${moduleColor(mod.name)}`}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-gray-800 leading-tight">{mod.name}</p>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{selected.length} selected</span>
          <Button onClick={handleNext} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
