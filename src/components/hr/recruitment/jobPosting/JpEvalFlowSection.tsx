import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ClipboardCheck, Plus, CheckCircle2, Circle,
  X, Trash2, Edit,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { showToast } from '../../../../layout/layout';
import {
  useJpEvalFlows, useCreateJpEvalFlow, useUpdateJpEvalFlow, useDeleteJpEvalFlow,
} from '../../../../services/hr/recruitment/jpEvalFlow/jpEvalFlow.queries';
import { useEvaluationFlows, useCreateEvaluationFlow } from '../../../../services/hr/recruitment/evaluationFlow/evaluationFlow.queries';
import { useEvaluationTypes } from '../../../../services/hr/recruitment/evaluationType/evaluationType.queries';
import { evaluationStepApi } from '../../../../services/hr/recruitment/evaluationStep/evaluationStep.api';
import type { JpEvalFlowListDto } from '../../../../types/hr/recruit/jpEvalFlow';
import type { EvaluationFlowListDto } from '../../../../types/hr/recruit/evaluationFlow';

interface StepRow { stepName: string; stepOrder: number; isFinal: boolean; evalTypeId: string; minScore: number; maxScore: number; }

// ── Fetch and cache steps per flow ─────────────────────────────────────────
const useFlowSteps = (flowId: string) => {
  const [steps, setSteps] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!flowId) { setSteps([]); setLoaded(false); return; }
    setLoaded(false);
    evaluationStepApi.getAllByFlow(flowId)
      .then(s => { setSteps(s); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [flowId]);
  return { steps, loaded };
};

// ── Vertical stepper ────────────────────────────────────────────────────────
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

// ── Left panel: flow card ───────────────────────────────────────────────────
const FlowCard: React.FC<{
  flow: EvaluationFlowListDto;
  selected: boolean;
  onClick: () => void;
}> = ({ flow, selected, onClick }) => {
  const { steps, loaded } = useFlowSteps(flow.id);
  const preview = loaded && steps.length > 0
    ? steps.map(s => s.stepName).slice(0, 3).join(' → ') + (steps.length > 3 ? ' …' : '')
    : loaded ? 'No steps' : 'Loading…';

  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all cursor-pointer ${
        selected
          ? 'border-green-500 bg-green-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
      }`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm font-semibold truncate ${selected ? 'text-green-800' : 'text-gray-800'}`}>{flow.name}</p>
        {selected && <CheckCircle2 size={15} className="text-green-600 shrink-0" />}
      </div>
      <p className="text-xs text-gray-400 mt-1 truncate">{preview}</p>
    </button>
  );
};

// ── Assigned flow row ───────────────────────────────────────────────────────
const AssignedRow: React.FC<{
  item: JpEvalFlowListDto;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}> = ({ item, onEdit, onDelete, isDeleting }) => (
  <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
    <ClipboardCheck size={16} className="text-green-600 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">{item.evalFlowName}</p>
      <p className="text-xs text-gray-400">From {item.effeDateFrom}{item.effeDateTo ? ` → ${item.effeDateTo}` : ''} · {item.steps?.length ?? 0} step{item.steps?.length !== 1 ? 's' : ''}</p>
    </div>
    <button type="button" onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer transition-colors"><Edit size={13} /></button>
    <button type="button" onClick={onDelete} disabled={isDeleting} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"><Trash2 size={13} /></button>
  </div>
);

// ── Main ────────────────────────────────────────────────────────────────────
const JpEvalFlowSection: React.FC = () => {
  const navigate = useNavigate();
  const { postId, postNumber } = useParams<{ postId: string; postNumber?: string }>();
  const id = postId ?? '';
  const displayPostNumber = postNumber ? decodeURIComponent(postNumber) : '';

  // Right panel state: 'empty' | 'preview' | 'create' | 'edit'
  const [rightMode, setRightMode] = useState<'empty' | 'preview' | 'create' | 'edit'>('empty');
  const [selectedFlow, setSelectedFlow] = useState<EvaluationFlowListDto | null>(null);
  const [editingItem, setEditingItem] = useState<JpEvalFlowListDto | null>(null);

  // Assign form
  const [effectiveFrom, setEffectiveFrom] = useState('');

  // Create form
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowGlobal, setNewFlowGlobal] = useState(false);
  const [newSteps, setNewSteps] = useState<StepRow[]>([{ stepName: '', stepOrder: 0, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
  const [createEffectiveFrom, setCreateEffectiveFrom] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: items = [], isLoading: itemsLoading, refetch } = useJpEvalFlows(id);
  const { data: evalFlows = [], refetch: refetchFlows } = useEvaluationFlows();
  const { data: evalTypes = [] } = useEvaluationTypes();
  const { steps: previewSteps, loaded: previewLoaded } = useFlowSteps(selectedFlow?.id ?? '');

  const createMutation = useCreateJpEvalFlow({
    onSuccess: () => { showToast.success('Flow assigned'); resetRight(); refetch(); },
    onError: (e) => showToast.error(e.message),
  });
  const updateMutation = useUpdateJpEvalFlow(id, {
    onSuccess: () => { showToast.success('Flow updated'); resetRight(); },
    onError: (e) => showToast.error(e.message),
  });
  const deleteMutation = useDeleteJpEvalFlow(id, {
    onSuccess: () => { showToast.success('Flow removed');  },
    onError: (e) => showToast.error(e.message),
  });
  const createFlowMutation = useCreateEvaluationFlow();

  const resetRight = () => {
    setRightMode('empty'); setSelectedFlow(null); setEditingItem(null);
    setEffectiveFrom(''); setNewFlowName(''); setNewFlowGlobal(false);
    setNewSteps([{ stepName: '', stepOrder: 0, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
    setCreateEffectiveFrom('');
  };

  const handleSelectFlow = (flow: EvaluationFlowListDto) => {
    setSelectedFlow(flow); setRightMode('preview'); setEditingItem(null); setEffectiveFrom('');
  };

  const handleAssign = () => {
    if (!selectedFlow || !effectiveFrom) return;
    const iso = new Date(effectiveFrom).toISOString();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, evaluationFlowId: selectedFlow.id, effectiveFrom: iso, rowVersion: editingItem.rowVersion });
    } else {
      createMutation.mutate({ evaluationFlowId: selectedFlow.id, jobPostingId: id, effectiveFrom: iso });
    }
  };

  const startEdit = (item: JpEvalFlowListDto) => {
    setEditingItem(item);
    const matched = evalFlows.find(f => f.name === item.evalFlowName);
    if (matched) { setSelectedFlow(matched); }
    try { const d = new Date(item.effeDateFrom); setEffectiveFrom(isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]); } catch { setEffectiveFrom(''); }
    setRightMode('edit');
  };

  const handleSaveCreate = async () => {
    if (!newFlowName.trim()) return;
    const validSteps = newSteps.filter(s => s.stepName.trim() && s.evalTypeId);
    setIsCreating(true);
    try {
      const newFlow = await createFlowMutation.mutateAsync({ name: newFlowName.trim(), isGlobal: newFlowGlobal });
      for (const s of validSteps) await evaluationStepApi.create({ ...s, evaluationFlowId: newFlow.id });
      if (createEffectiveFrom) {
        await createMutation.mutateAsync({ evaluationFlowId: newFlow.id, jobPostingId: id, effectiveFrom: new Date(createEffectiveFrom).toISOString() });
      }
      await refetchFlows();
      showToast.success(`"${newFlowName}" created${createEffectiveFrom ? ' and assigned' : ''}`);
      resetRight();
    } catch (e: any) { showToast.error(e.message || 'Failed'); }
    finally { setIsCreating(false); }
  };

  const addNewStep = () => setNewSteps(s => [...s, { stepName: '', stepOrder: 0, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
  const removeNewStep = (i: number) => setNewSteps(s => s.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, stepOrder: idx + 1 })));
  const updateNewStep = (i: number, field: keyof StepRow, val: any) => setNewSteps(s => s.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const isAssigning = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Evaluation Flows</span>
            </h1>
            {displayPostNumber && <p className="text-sm text-gray-500">Job Posting: {displayPostNumber}</p>}
          </div>
        </div>
      </div>

      {/* ── Assigned flows — full width, above the grid ── */}
      {(itemsLoading || items.length > 0) && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assigned to this posting</p>
          {itemsLoading ? (
            <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <ClipboardCheck size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{item.evalFlowName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Effective {item.effeDateFrom}{item.effeDateTo ? ` → ${item.effeDateTo}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => startEdit(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer transition-colors">
                        <Edit size={14} />
                      </button>
                      <button type="button" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Horizontal stepper */}
                  {item.steps?.length > 0 && (
                    <div className="px-5 py-4 overflow-x-auto">
                      <div className="flex items-center gap-0 min-w-max">
                        {item.steps.map((s, i) => (
                          <React.Fragment key={i}>
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.isFinalStr === 'Yes' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
                                {i + 1}
                              </div>
                              <div className="text-center max-w-[90px]">
                                <p className="text-xs font-medium text-gray-700 leading-tight truncate">{s.stepName}</p>
                                <p className="text-[10px] text-gray-400 truncate">{s.evalType}</p>
                                {s.isFinalStr === 'Yes' && <span className="text-[9px] bg-green-100 text-green-700 font-semibold px-1 py-0.5 rounded-full">Final</span>}
                              </div>
                            </div>
                            {i < item.steps.length - 1 && (
                              <div className="w-10 h-0.5 bg-green-200 shrink-0 mb-5" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── LEFT: Available flows ── */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700"> Evaluation Flows</p>
              <Button type="button" variant="outline" size="sm" onClick={() => { setRightMode('create'); setSelectedFlow(null); }}
                className="flex items-center gap-1.5 border-green-500 text-green-700 hover:bg-green-50 cursor-pointer">
                <Plus size={14} /> Create New Flow
              </Button>
            </div>
            <div className="p-4">
              <Select
                value={selectedFlow?.id ?? ''}
                onValueChange={(val) => {
                  const flow = evalFlows.find(f => f.id === val);
                  if (flow) handleSelectFlow(flow);
                }}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select a flow ..." />
                </SelectTrigger>
                <SelectContent>
                  {evalFlows.length === 0
                    ? <div className="px-3 py-2 text-sm text-gray-400 italic">No flows yet — create one</div>
                    : evalFlows.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        {/* ── RIGHT: Detail / Assign / Create ── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">

            {/* State 1: Empty */}
            {rightMode === 'empty' && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <ClipboardCheck size={28} className="text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">Select a flow to preview and assign</p>
                <p className="text-sm text-gray-400 mt-1">or create a new one from the left panel</p>
              </motion.div>
            )}

            {/* State 2: Flow selected — preview + assign */}
            {(rightMode === 'preview' || rightMode === 'edit') && selectedFlow && (
              <motion.div key="preview" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{selectedFlow.name}</p>
                    {rightMode === 'edit' && editingItem && (
                      <p className="text-xs text-amber-600 mt-0.5">Editing existing assignment</p>
                    )}
                  </div>
                  <button type="button" onClick={resetRight} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"><X size={16} /></button>
                </div>

                {/* Steps preview */}
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

                {/* Assign section */}
                <div className="px-6 py-5 space-y-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assignment</p>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Effective From <span className="text-red-500">*</span></Label>
                    <Input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} disabled={isAssigning} className="h-10 max-w-xs" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAssign} disabled={!effectiveFrom || isAssigning}
                      className="bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-lg px-6">
                      {isAssigning ? 'Saving...' : rightMode === 'edit' ? 'Update Assignment' : 'Assign Flow'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetRight} disabled={isAssigning} className="cursor-pointer rounded-lg">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* State 3: Create new flow */}
            {rightMode === 'create' && (
              <motion.div key="create" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">Create New Flow</p>
                  <button type="button" onClick={resetRight} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"><X size={16} /></button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Flow name */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Flow Name <span className="text-red-500">*</span></Label>
                    <Input value={newFlowName} onChange={e => setNewFlowName(e.target.value)} placeholder="e.g. Technical Interview Flow" disabled={isCreating} className="h-10" />
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={newFlowGlobal} onChange={e => setNewFlowGlobal(e.target.checked)} disabled={isCreating} className="w-4 h-4 rounded accent-green-600 cursor-pointer" />
                    <span className="text-sm text-gray-600">Global — reusable across all postings</span>
                  </label>

                  {/* Step builder */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Steps</Label>
                      <button type="button" onClick={addNewStep} disabled={isCreating}
                        className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 cursor-pointer font-medium">
                        <Plus size={13} /> Add Step
                      </button>
                    </div>
                    <div className="space-y-2">
                      {newSteps.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl border border-gray-200 p-3">
                          <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                            <Input
                              type="number"
                              min={1}
                              value={s.stepOrder}
                              onChange={e => updateNewStep(i, 'stepOrder', parseInt(e.target.value) || 1)}
                              disabled={isCreating}
                              className="w-14 h-8 text-center text-sm font-semibold"
                            />
                            <span className="text-[10px] text-gray-400">Order</span>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input value={s.stepName} onChange={e => updateNewStep(i, 'stepName', e.target.value)} placeholder="Step name" disabled={isCreating} className="h-9 text-sm col-span-2" />
                            <Select value={s.evalTypeId} onValueChange={v => updateNewStep(i, 'evalTypeId', v)} disabled={isCreating}>
                              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Evaluation type" /></SelectTrigger>
                              <SelectContent>{evalTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <label className="flex items-center gap-2 cursor-pointer self-center">
                              <input type="checkbox" checked={s.isFinal} onChange={e => updateNewStep(i, 'isFinal', e.target.checked)} disabled={isCreating} className="w-3.5 h-3.5 rounded accent-green-600 cursor-pointer" />
                              <span className="text-xs text-gray-500">Final step</span>
                            </label>
                            <div className="col-span-2 grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Min Score</span>
                                <Input type="number" min={0} value={s.minScore} onChange={e => updateNewStep(i, 'minScore', Number(e.target.value))} disabled={isCreating} className="h-8 text-sm" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Max Score</span>
                                <Input type="number" min={1} value={s.maxScore} onChange={e => updateNewStep(i, 'maxScore', Number(e.target.value))} disabled={isCreating} className="h-8 text-sm" />
                              </div>
                            </div>
                          </div>
                          {newSteps.length > 1 && (
                            <button type="button" onClick={() => removeNewStep(i)} disabled={isCreating} className="text-gray-400 hover:text-red-500 cursor-pointer pt-1 shrink-0"><X size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Effective from + CTA */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Effective From <span className="text-xs text-gray-400 font-normal">(optional — assigns immediately)</span></Label>
                    <Input type="date" value={createEffectiveFrom} onChange={e => setCreateEffectiveFrom(e.target.value)} disabled={isCreating} className="h-10 max-w-xs" />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button type="button" onClick={handleSaveCreate} disabled={!newFlowName.trim() || isCreating}
                      className="bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-lg px-6">
                      {isCreating ? 'Creating...' : createEffectiveFrom ? 'Save & Assign' : 'Save Flow'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetRight} disabled={isCreating} className="cursor-pointer rounded-lg">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};

export default JpEvalFlowSection;
