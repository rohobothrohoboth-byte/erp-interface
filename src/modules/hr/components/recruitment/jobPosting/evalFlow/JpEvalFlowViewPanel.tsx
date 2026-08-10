import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Plus, CheckCircle2, Circle, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { evaluationStepApi } from '@/modules/hr/services/recruitment/evaluationStep/evaluationStep.api';
import type { EvaluationFlowListDto } from '@/modules/hr/types/recruit/evaluationFlow';
import type { JpEvalFlowListDto } from '@/modules/hr/types/recruit/jpEvalFlow';
import type { EvaluationTypeListDto } from '@/modules/hr/types/recruit/evaluationType';
import type { StepRow } from '@/modules/hr/components/recruitment/jobPosting/evalFlow/types';

// ── Vertical stepper ──────────────────────────────────────────────────────────
const Stepper: React.FC<{ steps: any[] }> = ({ steps }) => (
  <div className="relative pl-5">
    {steps.map((s, i) => (
      <div key={s.id ?? i} className="relative flex gap-3 pb-5 last:pb-0">
        {i < steps.length - 1 && <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-green-200" />}
        {s.isFinalStr === 'Yes'
          ? <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5 z-10" />
          : <Circle size={18} className="text-gray-300 shrink-0 mt-0.5 z-10" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{s.stepName}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400">{s.evalType}</span>
            {s.maxScore > 0 && <><span className="text-gray-300 text-xs">·</span><span className="text-xs text-gray-400">Score {s.minScore}–{s.maxScore}</span></>}
            {s.isFinalStr === 'Yes' && <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Final</span>}
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface JpEvalFlowRightPanelProps {
  mode: 'empty' | 'preview' | 'edit' | 'create';
  selectedFlow: EvaluationFlowListDto | null;
  editingItem: JpEvalFlowListDto | null;
  evalTypes: EvaluationTypeListDto[];
  isAssigning: boolean;
  effectiveFrom: string;
  onEffectiveFromChange: (v: string) => void;
  onAssign: () => void;
  onReset: () => void;
  onSaveCreate: (data: { name: string; isGlobal: boolean; steps: StepRow[]; effectiveFrom: string }) => void;
  isCreating: boolean;
}

const JpEvalFlowRightPanel: React.FC<JpEvalFlowRightPanelProps> = ({
  mode, selectedFlow, editingItem, evalTypes,
  isAssigning, effectiveFrom, onEffectiveFromChange,
  onAssign, onReset, onSaveCreate, isCreating,
}) => {
  const [previewSteps, setPreviewSteps] = useState<any[]>([]);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  // Create form state (local to this panel)
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowGlobal, setNewFlowGlobal] = useState(false);
  const [newSteps, setNewSteps] = useState<StepRow[]>([{ stepName: '', stepOrder: 0, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
  const [createEffectiveFrom, setCreateEffectiveFrom] = useState('');

  useEffect(() => {
    if (!selectedFlow?.id) { setPreviewSteps([]); setPreviewLoaded(false); return; }
    setPreviewLoaded(false);
    evaluationStepApi.getAllByFlow(selectedFlow.id)
      .then(s => { setPreviewSteps(s); setPreviewLoaded(true); })
      .catch(() => setPreviewLoaded(true));
  }, [selectedFlow?.id]);

  // Reset create form when mode changes away from create
  useEffect(() => {
    if (mode !== 'create') {
      setNewFlowName(''); setNewFlowGlobal(false);
      setNewSteps([{ stepName: '', stepOrder: 0, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
      setCreateEffectiveFrom('');
    }
  }, [mode]);

  const addStep = () => setNewSteps(s => [...s, { stepName: '', stepOrder: 0, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
  const removeStep = (i: number) => setNewSteps(s => s.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: keyof StepRow, val: any) =>
    setNewSteps(s => s.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  return (
    <AnimatePresence mode="wait">

      {/* Empty */}
      {mode === 'empty' && (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <ClipboardCheck size={28} className="text-gray-300" />
          </div>
          <p className="font-medium text-gray-500">Select a flow to preview and assign</p>
          <p className="text-sm text-gray-400 mt-1">or create a new one from the left panel</p>
        </motion.div>
      )}

      {/* Preview / Edit */}
      {(mode === 'preview' || mode === 'edit') && selectedFlow && (
        <motion.div key="preview" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{selectedFlow.name}</p>
              {mode === 'edit' && editingItem && <p className="text-xs text-amber-600 mt-0.5">Editing existing assignment</p>}
            </div>
            <button type="button" onClick={onReset} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"><X size={16} /></button>
          </div>
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Evaluation Steps</p>
            {!previewLoaded ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" /> Loading steps...
              </div>
            ) : previewSteps.length === 0 ? (
              <p className="text-sm text-gray-400 italic">This flow has no steps defined.</p>
            ) : (
              <Stepper steps={previewSteps} />
            )}
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assignment</p>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Effective From <span className="text-red-500">*</span></Label>
              <Input type="date" value={effectiveFrom} onChange={e => onEffectiveFromChange(e.target.value)} disabled={isAssigning} className="h-10 max-w-xs" />
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={onAssign} disabled={!effectiveFrom || isAssigning}
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-lg px-6">
                {isAssigning ? 'Saving...' : mode === 'edit' ? 'Update Assignment' : 'Assign Flow'}
              </Button>
              <Button type="button" variant="outline" onClick={onReset} disabled={isAssigning} className="cursor-pointer rounded-lg">Cancel</Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create */}
      {mode === 'create' && (
        <motion.div key="create" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-lg font-bold text-gray-900">Create New Flow</p>
            <button type="button" onClick={onReset} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"><X size={16} /></button>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Flow Name <span className="text-red-500">*</span></Label>
              <Input value={newFlowName} onChange={e => setNewFlowName(e.target.value)} placeholder="e.g. Technical Interview Flow" disabled={isCreating} className="h-10" />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={newFlowGlobal} onChange={e => setNewFlowGlobal(e.target.checked)} disabled={isCreating} className="w-4 h-4 rounded accent-green-600 cursor-pointer" />
              <span className="text-sm text-gray-600">Global — reusable across all postings</span>
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Steps</Label>
                <button type="button" onClick={addStep} disabled={isCreating}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 cursor-pointer font-medium">
                  <Plus size={13} /> Add Step
                </button>
              </div>
              <div className="space-y-2">
                {newSteps.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl border border-gray-200 p-3">
                    <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                      <Input type="number" min={1} value={s.stepOrder}
                        onChange={e => updateStep(i, 'stepOrder', parseInt(e.target.value) || 1)}
                        disabled={isCreating} className="w-14 h-8 text-center text-sm font-semibold" />
                      <span className="text-[10px] text-gray-400">Order</span>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input value={s.stepName} onChange={e => updateStep(i, 'stepName', e.target.value)}
                        placeholder="Step name" disabled={isCreating} className="h-9 text-sm col-span-2" />
                      <Select value={s.evalTypeId} onValueChange={v => updateStep(i, 'evalTypeId', v)} disabled={isCreating}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Evaluation type" /></SelectTrigger>
                        <SelectContent>{evalTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <label className="flex items-center gap-2 cursor-pointer self-center">
                        <input type="checkbox" checked={s.isFinal} onChange={e => updateStep(i, 'isFinal', e.target.checked)}
                          disabled={isCreating} className="w-3.5 h-3.5 rounded accent-green-600 cursor-pointer" />
                        <span className="text-xs text-gray-500">Final step</span>
                      </label>
                      <div className="col-span-2 grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Min Score</span>
                          <Input type="number" min={0} value={s.minScore}
                            onChange={e => updateStep(i, 'minScore', Number(e.target.value))}
                            disabled={isCreating} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Max Score</span>
                          <Input type="number" min={1} value={s.maxScore}
                            onChange={e => updateStep(i, 'maxScore', Number(e.target.value))}
                            disabled={isCreating} className="h-8 text-sm" />
                        </div>
                      </div>
                    </div>
                    {newSteps.length > 1 && (
                      <button type="button" onClick={() => removeStep(i)} disabled={isCreating}
                        className="text-gray-400 hover:text-red-500 cursor-pointer pt-1 shrink-0"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Effective From <span className="text-xs text-gray-400 font-normal">(optional)</span></Label>
              <Input type="date" value={createEffectiveFrom} onChange={e => setCreateEffectiveFrom(e.target.value)} disabled={isCreating} className="h-10 max-w-xs" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button"
                onClick={() => onSaveCreate({ name: newFlowName, isGlobal: newFlowGlobal, steps: newSteps, effectiveFrom: createEffectiveFrom })}
                disabled={!newFlowName.trim() || isCreating}
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-lg px-6">
                {isCreating ? 'Creating...' : createEffectiveFrom ? 'Save & Assign' : 'Save Flow'}
              </Button>
              <Button type="button" variant="outline" onClick={onReset} disabled={isCreating} className="cursor-pointer rounded-lg">Cancel</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JpEvalFlowRightPanel;
