// src/components/hr/recruitment/jobPosting/evalFlow/JpEvalFlowSection.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ClipboardCheck, Plus, CheckCircle2, Circle,
  X, Trash2, Edit, RefreshCw, Loader2, Eye, Sparkles,
  ChevronDown, ChevronUp, AlertCircle, Info
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { showToast } from '@/shared/layout/layout';
import {
  useJpEvalFlows,
  useCreateJpEvalFlow,
  useUpdateJpEvalFlow,
  useDeleteJpEvalFlow,
} from '@/modules/hr/services/recruitment/jpEvalFlow/jpEvalFlow.queries';
import { useEvaluationFlows, useCreateEvaluationFlow } from '@/modules/hr/services/recruitment/evaluationFlow/evaluationFlow.queries';
import { useEvaluationTypes } from '@/modules/hr/services/recruitment/evaluationType/evaluationType.queries';
import { evaluationStepApi } from '@/modules/hr/services/recruitment/evaluationStep/evaluationStep.api';
import type { JpEvalFlowListDto } from '@/modules/hr/types/recruit/jpEvalFlow';
import type { EvaluationFlowListDto } from '@/modules/hr/types/recruit/evaluationFlow';

interface StepRow {
  stepName: string;
  stepOrder: number;
  isFinal: boolean;
  evalTypeId: string;
  minScore: number;
  maxScore: number;
}

// ── Fetch and cache steps per flow ─────────────────────────────────────────
const useFlowSteps = (flowId: string) => {
  const [steps, setSteps] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!flowId) {
      setSteps([]);
      setLoaded(false);
      return;
    }
    setLoaded(false);
    setLoading(true);
    evaluationStepApi.getAllByFlow(flowId)
        .then(s => { setSteps(s); setLoaded(true); })
        .catch(() => setLoaded(true))
        .finally(() => setLoading(false));
  }, [flowId]);

  return { steps, loaded, loading };
};

// ── Vertical stepper ────────────────────────────────────────────────────────
const Stepper: React.FC<{ steps: any[] }> = ({ steps }) => (
    <div className="relative pl-5">
      {steps.map((s, i) => (
          <div key={s.id ?? i} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && (
                <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-emerald-200" />
            )}
            {s.isFinalStr === 'Yes' ? (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5 z-10" />
            ) : (
                <Circle size={18} className="text-gray-300 shrink-0 mt-0.5 z-10" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{s.stepName}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400">{s.evalType}</span>
                {s.maxScore > 0 && (
                    <>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-gray-400">Score {s.minScore}–{s.maxScore}</span>
                    </>
                )}
                {s.isFinalStr === 'Yes' && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">Final</span>
                )}
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
  const { steps, loaded, loading } = useFlowSteps(flow.id);
  const preview = loaded && steps.length > 0
      ? steps.map(s => s.stepName).slice(0, 3).join(' → ') + (steps.length > 3 ? ' …' : '')
      : loaded ? 'No steps' : 'Loading…';

  return (
      <button
          type="button"
          onClick={onClick}
          className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all cursor-pointer ${
              selected
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-semibold truncate ${selected ? 'text-emerald-800' : 'text-gray-800'}`}>
            {flow.name}
          </p>
          {selected && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={flow.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
            {flow.isActiveStr}
          </Badge>
          {flow.isGlobal && (
              <Badge className="bg-blue-100 text-blue-700">Global</Badge>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1.5 truncate">
          {loading ? 'Loading steps...' : preview}
        </p>
        {loading && (
            <Loader2 className="w-3 h-3 animate-spin text-gray-400 mt-1" />
        )}
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
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-2 bg-emerald-100 rounded-lg">
        <ClipboardCheck size={16} className="text-emerald-600 shrink-0" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.evalFlowName}</p>
        <p className="text-xs text-gray-400">
          From {item.effeDateFrom}{item.effeDateTo ? ` → ${item.effeDateTo}` : ''}
          <span className="ml-2 text-emerald-600">
          · {item.steps?.length ?? 0} step{item.steps?.length !== 1 ? 's' : ''}
        </span>
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
        >
          <Edit size={14} />
        </button>
        <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-50"
        >
          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
);

// ── Main Component ──────────────────────────────────────────────────────────
const JpEvalFlowSection: React.FC = () => {
  const navigate = useNavigate();
  const { postId, postNumber } = useParams<{ postId: string; postNumber?: string }>();
  const id = postId ?? '';
  const displayPostNumber = postNumber ? decodeURIComponent(postNumber) : '';

  // Right panel state
  const [rightMode, setRightMode] = useState<'empty' | 'preview' | 'create' | 'edit'>('empty');
  const [selectedFlow, setSelectedFlow] = useState<EvaluationFlowListDto | null>(null);
  const [editingItem, setEditingItem] = useState<JpEvalFlowListDto | null>(null);

  // Assign form
  const [effectiveFrom, setEffectiveFrom] = useState('');

  // Create form
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowGlobal, setNewFlowGlobal] = useState(false);
  const [newSteps, setNewSteps] = useState<StepRow[]>([
    { stepName: '', stepOrder: 1, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }
  ]);
  const [createEffectiveFrom, setCreateEffectiveFrom] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: items = [], isLoading: itemsLoading, refetch } = useJpEvalFlows(id);
  const { data: evalFlows = [], isLoading: flowsLoading, refetch: refetchFlows } = useEvaluationFlows();
  const { data: evalTypes = [] } = useEvaluationTypes();
  const { steps: previewSteps, loaded: previewLoaded, loading: previewLoading } = useFlowSteps(selectedFlow?.id ?? '');

  // Mutations
  const createMutation = useCreateJpEvalFlow({
    onSuccess: () => {
      showToast.success('Flow assigned successfully');
      resetRight();
      refetch();
    },
    onError: (e) => showToast.error(e.message || 'Failed to assign flow'),
  });

  const updateMutation = useUpdateJpEvalFlow(id, {
    onSuccess: () => {
      showToast.success('Flow updated successfully');
      resetRight();
      refetch();
    },
    onError: (e) => showToast.error(e.message || 'Failed to update flow'),
  });

  const deleteMutation = useDeleteJpEvalFlow(id, {
    onSuccess: () => {
      showToast.success('Flow removed successfully');
      refetch();
    },
    onError: (e) => showToast.error(e.message || 'Failed to remove flow'),
  });

  const createFlowMutation = useCreateEvaluationFlow();

  const resetRight = () => {
    setRightMode('empty');
    setSelectedFlow(null);
    setEditingItem(null);
    setEffectiveFrom('');
    setNewFlowName('');
    setNewFlowGlobal(false);
    setNewSteps([{ stepName: '', stepOrder: 1, isFinal: false, evalTypeId: '', minScore: 0, maxScore: 100 }]);
    setCreateEffectiveFrom('');
  };

  const handleSelectFlow = (flow: EvaluationFlowListDto) => {
    setSelectedFlow(flow);
    setRightMode('preview');
    setEditingItem(null);
    setEffectiveFrom('');
  };

  const handleAssign = () => {
    if (!selectedFlow || !effectiveFrom) return;
    const iso = new Date(effectiveFrom).toISOString();
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        evaluationFlowId: selectedFlow.id,
        effectiveFrom: iso,
        rowVersion: editingItem.rowVersion,
      });
    } else {
      createMutation.mutate({
        evaluationFlowId: selectedFlow.id,
        jobPostingId: id,
        effectiveFrom: iso,
      });
    }
  };

  const startEdit = (item: JpEvalFlowListDto) => {
    setEditingItem(item);
    const matched = evalFlows.find(f => f.name === item.evalFlowName);
    if (matched) setSelectedFlow(matched);
    try {
      const d = new Date(item.effeDateFrom);
      setEffectiveFrom(isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]);
    } catch {
      setEffectiveFrom('');
    }
    setRightMode('edit');
  };

  const handleSaveCreate = async () => {
    if (!newFlowName.trim()) {
      showToast.error('Please enter a flow name');
      return;
    }

    const validSteps = newSteps.filter(s => s.stepName.trim() && s.evalTypeId);
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

      if (createEffectiveFrom) {
        await createMutation.mutateAsync({
          evaluationFlowId: newFlow.id,
          jobPostingId: id,
          effectiveFrom: new Date(createEffectiveFrom).toISOString(),
        });
      }

      await refetchFlows();
      showToast.success(`"${newFlowName}" created${createEffectiveFrom ? ' and assigned' : ''} successfully`);
      resetRight();
    } catch (e: any) {
      showToast.error(e.message || 'Failed to create flow');
    } finally {
      setIsCreating(false);
    }
  };

  const addNewStep = () => {
    setNewSteps(s => [...s, {
      stepName: '',
      stepOrder: s.length + 1,
      isFinal: false,
      evalTypeId: '',
      minScore: 0,
      maxScore: 100
    }]);
  };

  const removeNewStep = (i: number) => {
    setNewSteps(s => s.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, stepOrder: idx + 1 })));
  };

  const updateNewStep = (i: number, field: keyof StepRow, val: any) => {
    setNewSteps(s => s.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const isAssigning = createMutation.isPending || updateMutation.isPending;

  // Loading state
  if (itemsLoading || flowsLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="mt-4 text-sm text-gray-500">Loading evaluation flows...</p>
        </div>
    );
  }

  return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Evaluation Flows
              </span>
              </h1>
              {displayPostNumber && (
                  <p className="text-sm text-gray-500">Job Posting: {displayPostNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Assigned flows */}
        {(itemsLoading || items.length > 0) && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Assigned Flows</p>
                  <p className="text-xs text-gray-400">
                    {items.length} flow{items.length !== 1 ? 's' : ''} assigned
                  </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </Button>
              </div>
              {itemsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
              ) : items.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ClipboardCheck className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No flows assigned</p>
                      <p className="text-sm text-gray-400">Select a flow from the panel below to assign</p>
                    </CardContent>
                  </Card>
              ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {items.map(item => (
                        <AssignedRow
                            key={item.id}
                            item={item}
                            onEdit={() => startEdit(item)}
                            onDelete={() => deleteMutation.mutate(item.id)}
                            isDeleting={deleteMutation.isPending}
                        />
                    ))}
                  </div>
              )}
            </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* LEFT: Available flows */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <p className="text-sm font-semibold text-gray-700">Available Flows</p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setRightMode('create'); setSelectedFlow(null); }}
                    className="flex items-center gap-1.5 border-emerald-500 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                >
                  <Plus size={14} /> Create New
                </Button>
              </div>
              <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
                {flowsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                ) : evalFlows.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p>No flows available</p>
                      <p className="text-sm">Create a new flow to get started</p>
                    </div>
                ) : (
                    evalFlows.map(flow => (
                        <FlowCard
                            key={flow.id}
                            flow={flow}
                            selected={selectedFlow?.id === flow.id}
                            onClick={() => handleSelectFlow(flow)}
                        />
                    ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Detail / Assign / Create */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Empty State */}
              {rightMode === 'empty' && (
                  <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <ClipboardCheck size={28} className="text-gray-300" />
                    </div>
                    <p className="font-medium text-gray-500">Select a flow to preview and assign</p>
                    <p className="text-sm text-gray-400 mt-1">or create a new one from the left panel</p>
                  </motion.div>
              )}

              {/* Preview / Edit */}
              {(rightMode === 'preview' || rightMode === 'edit') && selectedFlow && (
                  <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{selectedFlow.name}</p>
                        {rightMode === 'edit' && editingItem && (
                            <p className="text-xs text-amber-600 mt-0.5">Editing existing assignment</p>
                        )}
                      </div>
                      <button
                          type="button"
                          onClick={resetRight}
                          className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Steps preview */}
                    <div className="px-6 py-5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Evaluation Steps</p>
                      {previewLoading ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                            Loading steps...
                          </div>
                      ) : !previewLoaded ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                            Loading...
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
                        <Label className="text-sm font-medium">
                          Effective From <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            value={effectiveFrom}
                            onChange={e => setEffectiveFrom(e.target.value)}
                            disabled={isAssigning}
                            className="h-10 max-w-xs"
                            min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={handleAssign}
                            disabled={!effectiveFrom || isAssigning}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer rounded-lg px-6"
                        >
                          {isAssigning ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Saving...
                              </>
                          ) : (
                              rightMode === 'edit' ? 'Update Assignment' : 'Assign Flow'
                          )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetRight}
                            disabled={isAssigning}
                            className="cursor-pointer rounded-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
              )}

              {/* Create */}
              {rightMode === 'create' && (
                  <motion.div
                      key="create"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
                      <p className="text-lg font-bold text-gray-900">Create New Flow</p>
                      <button
                          type="button"
                          onClick={resetRight}
                          className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="px-6 py-5 space-y-5 max-h-[500px] overflow-y-auto">
                      {/* Flow name */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                          Flow Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={newFlowName}
                            onChange={e => setNewFlowName(e.target.value)}
                            placeholder="e.g. Technical Interview Flow"
                            disabled={isCreating}
                            className="h-10"
                        />
                      </div>

                      <label className="flex items-center gap-2.5 cursor-pointer">
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
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Steps</Label>
                          <button
                              type="button"
                              onClick={addNewStep}
                              disabled={isCreating}
                              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium"
                          >
                            <Plus size={13} /> Add Step
                          </button>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
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
                                  <Input
                                      value={s.stepName}
                                      onChange={e => updateNewStep(i, 'stepName', e.target.value)}
                                      placeholder="Step name"
                                      disabled={isCreating}
                                      className="h-9 text-sm col-span-2"
                                  />
                                  <Select
                                      value={s.evalTypeId}
                                      onValueChange={v => updateNewStep(i, 'evalTypeId', v)}
                                      disabled={isCreating}
                                  >
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue placeholder="Evaluation type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {evalTypes.map(t => (
                                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <label className="flex items-center gap-2 cursor-pointer self-center">
                                    <input
                                        type="checkbox"
                                        checked={s.isFinal}
                                        onChange={e => updateNewStep(i, 'isFinal', e.target.checked)}
                                        disabled={isCreating}
                                        className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-500">Final step</span>
                                  </label>
                                  <div className="col-span-2 grid grid-cols-2 gap-2">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Min Score</span>
                                      <Input
                                          type="number"
                                          min={0}
                                          value={s.minScore}
                                          onChange={e => updateNewStep(i, 'minScore', Number(e.target.value))}
                                          disabled={isCreating}
                                          className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Max Score</span>
                                      <Input
                                          type="number"
                                          min={1}
                                          value={s.maxScore}
                                          onChange={e => updateNewStep(i, 'maxScore', Number(e.target.value))}
                                          disabled={isCreating}
                                          className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                                {newSteps.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeNewStep(i)}
                                        disabled={isCreating}
                                        className="text-gray-400 hover:text-red-500 cursor-pointer pt-1 shrink-0"
                                    >
                                      <X size={14} />
                                    </button>
                                )}
                              </div>
                          ))}
                        </div>
                      </div>

                      {/* Effective from */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                          Effective From <span className="text-xs text-gray-400 font-normal">(optional — assigns immediately)</span>
                        </Label>
                        <Input
                            type="date"
                            value={createEffectiveFrom}
                            onChange={e => setCreateEffectiveFrom(e.target.value)}
                            disabled={isCreating}
                            className="h-10 max-w-xs"
                            min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                            type="button"
                            onClick={handleSaveCreate}
                            disabled={!newFlowName.trim() || isCreating}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer rounded-lg px-6"
                        >
                          {isCreating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Creating...
                              </>
                          ) : (
                              createEffectiveFrom ? 'Save & Assign' : 'Save Flow'
                          )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetRight}
                            disabled={isCreating}
                            className="cursor-pointer rounded-lg"
                        >
                          Cancel
                        </Button>
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