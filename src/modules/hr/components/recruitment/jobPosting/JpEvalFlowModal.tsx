// src/components/hr/recruitment/jobPosting/evalFlow/JpEvalFlowModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Plus, Trash2, Edit, ChevronDown, ChevronUp,
  Eye, X, Check, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
  useJpEvalFlows,
  useCreateJpEvalFlow,
  useUpdateJpEvalFlow,
  useDeleteJpEvalFlow,
} from '@/modules/hr/services/recruitment/jpEvalFlow/jpEvalFlow.queries';
import { useEvaluationFlows } from '@/modules/hr/services/recruitment/evaluationFlow/evaluationFlow.queries';
import { useEvaluationTypes } from '@/modules/hr/services/recruitment/evaluationType/evaluationType.queries';
import { evaluationStepApi } from '@/modules/hr/services/recruitment/evaluationStep/evaluationStep.api';
import type { JpEvalFlowListDto } from '@/modules/hr/types/recruit/jpEvalFlow';
import type { JobPostingListDto } from '@/modules/hr/types/recruit/jobPosting';

interface Props {
  isOpen: boolean;
  posting: JobPostingListDto | null;
  onClose: () => void;
}

interface StepRow {
  stepName: string;
  stepOrder: number;
  isFinal: boolean;
  evalTypeId: string;
  minScore: number;
  maxScore: number;
}

const FlowStepsPreview: React.FC<{ flowId: string }> = ({ flowId }) => {
  const [steps, setSteps] = React.useState<any[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!flowId) return;
    setLoaded(false);
    setLoading(true);
    evaluationStepApi.getAllByFlow(flowId)
        .then(s => { setSteps(s); setLoaded(true); })
        .catch(() => setLoaded(true))
        .finally(() => setLoading(false));
  }, [flowId]);

  if (loading) return <p className="text-xs text-gray-400 py-1">Loading steps...</p>;
  if (!loaded) return <p className="text-xs text-gray-400 py-1">Loading...</p>;
  if (steps.length === 0) return <p className="text-xs text-gray-400 italic py-1">No steps defined</p>;

  return (
      <div className="space-y-1.5 pt-1">
        {steps.map((s, i) => (
            <div key={s.id || i} className="flex items-center gap-2 text-xs">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-[10px]">
            {i + 1}
          </span>
              <span className="font-medium text-gray-700 flex-1 truncate">{s.stepName}</span>
              <span className="text-gray-400 shrink-0">{s.evalType}</span>
              {s.isFinalStr === 'Yes' && (
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0">Final</span>
              )}
            </div>
        ))}
      </div>
  );
};

const JpEvalFlowModal: React.FC<Props> = ({ isOpen, posting, onClose }) => {
  const postId = posting?.id ?? '';

  // Left panel mode
  const [leftMode, setLeftMode] = useState<'assign' | 'create'>('assign');
  const [editingItem, setEditingItem] = useState<JpEvalFlowListDto | null>(null);

  // Assign form
  const [flowId, setFlowId] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [previewFlowId, setPreviewFlowId] = useState<string | null>(null);

  // Create form
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowGlobal, setNewFlowGlobal] = useState(false);
  const [steps, setSteps] = useState<StepRow[]>([
    { stepName: '', stepOrder: 1, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }
  ]);
  const [isCreating, setIsCreating] = useState(false);

  // Right panel
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: items = [], isLoading: itemsLoading, refetch: refetchItems } = useJpEvalFlows(postId);
  const { data: evalFlows = [], isLoading: flowsLoading, refetch: refetchFlows } = useEvaluationFlows();
  const { data: evalTypes = [] } = useEvaluationTypes();

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLeftMode('assign');
      setEditingItem(null);
      setFlowId('');
      setEffectiveFrom('');
      setPreviewFlowId(null);
      setNewFlowName('');
      setNewFlowGlobal(false);
      setSteps([{ stepName: '', stepOrder: 1, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
      setExpandedId(null);
    }
  }, [isOpen]);

  const createJpMutation = useCreateJpEvalFlow({
    onSuccess: () => {
      showToast.success('Evaluation flow assigned');
      resetAssign();
      refetchItems();
    },
    onError: (e) => showToast.error(e.message),
  });

  const updateJpMutation = useUpdateJpEvalFlow(postId, {
    onSuccess: () => {
      showToast.success('Evaluation flow updated');
      resetAssign();
      refetchItems();
    },
    onError: (e) => showToast.error(e.message),
  });

  const deleteJpMutation = useDeleteJpEvalFlow(postId, {
    onSuccess: () => {
      showToast.success('Evaluation flow removed');
      refetchItems();
    },
    onError: (e) => showToast.error(e.message),
  });

  const createFlowMutation = useCreateEvaluationFlow();

  const resetAssign = () => {
    setEditingItem(null);
    setFlowId('');
    setEffectiveFrom('');
    setPreviewFlowId(null);
  };

  const resetCreate = () => {
    setNewFlowName('');
    setNewFlowGlobal(false);
    setSteps([{ stepName: '', stepOrder: 1, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
  };

  const startEdit = (item: JpEvalFlowListDto) => {
    setEditingItem(item);
    const matched = evalFlows.find(f => f.name === item.evalFlowName);
    setFlowId(matched?.id ?? '');
    setPreviewFlowId(matched?.id ?? null);
    try {
      const d = new Date(item.effeDateFrom);
      setEffectiveFrom(isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]);
    } catch {
      setEffectiveFrom('');
    }
    setLeftMode('assign');
  };

  const handleAssignSubmit = () => {
    if (!flowId || !effectiveFrom) return;
    const iso = new Date(effectiveFrom).toISOString();
    if (editingItem) {
      updateJpMutation.mutate({
        id: editingItem.id,
        evaluationFlowId: flowId,
        effectiveFrom: iso,
        rowVersion: editingItem.rowVersion,
      });
    } else {
      createJpMutation.mutate({
        evaluationFlowId: flowId,
        jobPostingId: postId,
        effectiveFrom: iso,
      });
    }
  };

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) {
      showToast.error('Please enter a flow name');
      return;
    }

    const validSteps = steps.filter(s => s.stepName.trim() && s.evalTypeId);
    if (validSteps.length === 0) {
      showToast.error('Please add at least one step with a name and type');
      return;
    }

    setIsCreating(true);
    try {
      const newFlow = await createFlowMutation.mutateAsync({
        name: newFlowName.trim(),
        isGlobal: newFlowGlobal,
      });

      for (const s of validSteps) {
        await evaluationStepApi.create({
          ...s,
          evaluationFlowId: newFlow.id,
        });
      }

      await refetchFlows();
      showToast.success(`"${newFlowName}" created with ${validSteps.length} step(s)`);
      resetCreate();
      setFlowId(newFlow.id);
      setPreviewFlowId(newFlow.id);
      setLeftMode('assign');
    } catch (e: any) {
      showToast.error(e.message || 'Failed to create flow');
    } finally {
      setIsCreating(false);
    }
  };

  const addStep = () => {
    setSteps(s => [...s, {
      stepName: '',
      stepOrder: s.length + 1,
      isFinal: false,
      evalTypeId: '',
      minScore: 0,
      maxScore: 100
    }]);
  };

  const removeStep = (i: number) => {
    setSteps(s => s.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, stepOrder: idx + 1 })));
  };

  const updateStep = (i: number, field: keyof StepRow, val: any) => {
    setSteps(s => s.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const isAssignSubmitting = createJpMutation.isPending || updateJpMutation.isPending;

  if (!isOpen || !posting) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 shrink-0 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-2xl">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ClipboardCheck size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900">Evaluation Flows</h2>
              <p className="text-xs text-gray-500 truncate">{posting.postNumber} · {posting.reqNumber}</p>
            </div>
            <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Two-column body */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT: Form panel */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
              {/* Tab switcher */}
              <div className="flex border-b border-gray-200 shrink-0">
                <button
                    type="button"
                    onClick={() => setLeftMode('assign')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        leftMode === 'assign'
                            ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Plus size={14} /> {editingItem ? 'Edit' : 'Assign'}
                </button>
                <button
                    type="button"
                    onClick={() => { setLeftMode('create'); resetCreate(); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        leftMode === 'create'
                            ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Sparkles size={14} /> Create Flow
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ASSIGN FORM */}
                {leftMode === 'assign' && (
                    <>
                      {editingItem && (
                          <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
                            <p className="text-xs font-medium text-emerald-700">Editing: {editingItem.evalFlowName}</p>
                            <button
                                type="button"
                                onClick={resetAssign}
                                className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
                            >
                              <X size={13} />
                            </button>
                          </div>
                      )}

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Select Flow <span className="text-red-500">*</span></Label>
                        <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-52 overflow-y-auto">
                          {flowsLoading ? (
                              <div className="flex justify-center py-6">
                                <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                              </div>
                          ) : evalFlows.length === 0 ? (
                              <p className="px-3 py-3 text-sm text-gray-400 text-center italic">No flows — create one →</p>
                          ) : (
                              evalFlows.map(f => (
                                  <div key={f.id}>
                                    <button
                                        type="button"
                                        onClick={() => { setFlowId(f.id); setPreviewFlowId(previewFlowId === f.id ? null : f.id); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                                            flowId === f.id ? 'bg-emerald-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                          flowId === f.id ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                                      }`}>
                                        {flowId === f.id && <Check size={9} className="text-white" />}
                                      </div>
                                      <span className={`text-sm flex-1 truncate ${
                                          flowId === f.id ? 'font-semibold text-emerald-800' : 'text-gray-700'
                                      }`}>{f.name}</span>
                                      <button
                                          type="button"
                                          onClick={e => { e.stopPropagation(); setPreviewFlowId(previewFlowId === f.id ? null : f.id); }}
                                          className="text-gray-400 hover:text-emerald-600 cursor-pointer shrink-0"
                                      >
                                        <Eye size={13} />
                                      </button>
                                    </button>
                                    <AnimatePresence>
                                      {previewFlowId === f.id && (
                                          <motion.div
                                              initial={{ height: 0 }}
                                              animate={{ height: 'auto' }}
                                              exit={{ height: 0 }}
                                              className="overflow-hidden bg-emerald-50/60 border-t border-emerald-100 px-3 pb-2"
                                          >
                                            <FlowStepsPreview flowId={f.id} />
                                          </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                              ))
                          )}
                        </div>
                        <button
                            type="button"
                            onClick={() => { setLeftMode('create'); resetCreate(); }}
                            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer mt-1"
                        >
                          <Plus size={12} /> Create a new flow instead
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Effective From <span className="text-red-500">*</span></Label>
                        <Input
                            type="date"
                            value={effectiveFrom}
                            onChange={e => setEffectiveFrom(e.target.value)}
                            disabled={isAssignSubmitting}
                            className="h-10 text-sm"
                            min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <Button
                          type="button"
                          onClick={handleAssignSubmit}
                          disabled={!flowId || !effectiveFrom || isAssignSubmitting}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer rounded-lg"
                      >
                        {isAssignSubmitting ? 'Saving...' : editingItem ? 'Update Assignment' : 'Assign Flow'}
                      </Button>
                    </>
                )}

                {/* CREATE FLOW FORM */}
                {leftMode === 'create' && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Flow Name <span className="text-red-500">*</span></Label>
                        <Input
                            value={newFlowName}
                            onChange={e => setNewFlowName(e.target.value)}
                            placeholder="e.g. Technical Interview Flow"
                            disabled={isCreating}
                            className="h-10 text-sm"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newFlowGlobal}
                            onChange={e => setNewFlowGlobal(e.target.checked)}
                            disabled={isCreating}
                            className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">Global — reusable across all postings</span>
                      </label>

                      {/* Steps */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Steps</Label>
                          <button
                              type="button"
                              onClick={addStep}
                              disabled={isCreating}
                              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 cursor-pointer"
                          >
                            <Plus size={13} /> Add
                          </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {steps.map((s, i) => (
                              <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                                {s.stepOrder}
                              </span>
                              Step {s.stepOrder}
                            </span>
                                  {steps.length > 1 && (
                                      <button
                                          type="button"
                                          onClick={() => removeStep(i)}
                                          disabled={isCreating}
                                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                                      >
                                        <X size={13} />
                                      </button>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  <Input
                                      value={s.stepName}
                                      onChange={e => updateStep(i, 'stepName', e.target.value)}
                                      placeholder="Step name"
                                      disabled={isCreating}
                                      className="h-9 text-sm"
                                  />
                                  <Select
                                      value={s.evalTypeId}
                                      onValueChange={v => updateStep(i, 'evalTypeId', v)}
                                      disabled={isCreating}
                                  >
                                    <SelectTrigger className="h-9 text-sm w-full">
                                      <SelectValue placeholder="Evaluation type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {evalTypes.map(t => (
                                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs text-gray-500">Min Score</Label>
                                      <Input
                                          type="number"
                                          min={0}
                                          value={s.minScore}
                                          onChange={e => updateStep(i, 'minScore', Number(e.target.value))}
                                          disabled={isCreating}
                                          className="h-8 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">Max Score</Label>
                                      <Input
                                          type="number"
                                          min={1}
                                          value={s.maxScore}
                                          onChange={e => updateStep(i, 'maxScore', Number(e.target.value))}
                                          disabled={isCreating}
                                          className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={s.isFinal}
                                        onChange={e => updateStep(i, 'isFinal', e.target.checked)}
                                        disabled={isCreating}
                                        className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-500">Final step</span>
                                  </label>
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>

                      <Button
                          type="button"
                          onClick={handleCreateFlow}
                          disabled={!newFlowName.trim() || isCreating}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer rounded-lg"
                      >
                        {isCreating ? 'Creating...' : 'Create Flow'}
                      </Button>
                    </>
                )}
              </div>
            </div>

            {/* RIGHT: Assigned flows */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 shrink-0 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">Assigned Flows</p>
                <p className="text-xs text-gray-400">
                  {items.length} flow{items.length !== 1 ? 's' : ''} assigned
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {itemsLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                        <ClipboardCheck size={20} className="text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400">No flows assigned yet</p>
                      <p className="text-xs text-gray-300 mt-1">Use the left panel to assign or create</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">
                          <div className="flex items-center gap-2.5 px-3 py-3 bg-gray-50/80">
                            <button
                                type="button"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
                            >
                              {expandedId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.evalFlowName}</p>
                              <p className="text-xs text-gray-400">From {item.effeDateFrom}{item.effeDateTo ? ` → ${item.effeDateTo}` : ''}</p>
                            </div>
                            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
                        {item.steps?.length ?? 0} step{item.steps?.length !== 1 ? 's' : ''}
                      </span>
                            <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteJpMutation.mutate(item.id)}
                                disabled={deleteJpMutation.isPending}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <AnimatePresence>
                            {expandedId === item.id && item.steps?.length > 0 && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden border-t border-gray-100"
                                >
                                  <div className="px-3 py-3 space-y-2">
                                    {item.steps.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-xs">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-[10px]">
                                  {i + 1}
                                </span>
                                          <span className="font-medium text-gray-700 flex-1 truncate">{s.stepName}</span>
                                          <span className="text-gray-400 shrink-0">{s.evalType}</span>
                                          <span className="text-gray-400 shrink-0">{s.minScore}–{s.maxScore}</span>
                                          {s.isFinalStr === 'Yes' && (
                                              <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0">
                                    Final
                                  </span>
                                          )}
                                        </div>
                                    ))}
                                  </div>
                                </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between rounded-b-2xl shrink-0">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                {items.length} assigned
              </Badge>
            </div>
            <Button variant="outline" onClick={onClose} className="cursor-pointer rounded-lg">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
  );
};

export default JpEvalFlowModal;