import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { showToast } from '../../../../../layout/layout';
import {
  useJpEvalFlows, useCreateJpEvalFlow, useUpdateJpEvalFlow, useDeleteJpEvalFlow,
} from '../../../../../services/hr/recruitment/jpEvalFlow/jpEvalFlow.queries';
import { useEvaluationFlows, useCreateEvaluationFlow } from '../../../../../services/hr/recruitment/evaluationFlow/evaluationFlow.queries';
import { useEvaluationTypes } from '../../../../../services/hr/recruitment/evaluationType/evaluationType.queries';
import { evaluationStepApi } from '../../../../../services/hr/recruitment/evaluationStep/evaluationStep.api';
import type { JpEvalFlowListDto } from '../../../../../types/hr/recruit/jpEvalFlow';
import type { EvaluationFlowListDto } from '../../../../../types/hr/recruit/evaluationFlow';
import JpEvalFlowHeader from './JpEvalFlowHeader';
import JpAssignedFlowCard from './JpAssignedFlowCard';
import JpFlowSelector from './JpFlowSelector';
import JpEvalFlowRightPanel from './JpEvalFlowViewPanel';
import type { StepRow } from './types';

const JpEvalFlowSection: React.FC = () => {
  const { postId, postNumber } = useParams<{ postId: string; postNumber?: string }>();
  const id = postId ?? '';
  const displayPostNumber = postNumber ? decodeURIComponent(postNumber) : '';

  const [rightMode, setRightMode] = useState<'empty' | 'preview' | 'edit' | 'create'>('empty');
  const [selectedFlow, setSelectedFlow] = useState<EvaluationFlowListDto | null>(null);
  const [editingItem, setEditingItem] = useState<JpEvalFlowListDto | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: items = [], isLoading: itemsLoading, refetch } = useJpEvalFlows(id);
  const { data: evalFlows = [], refetch: refetchFlows } = useEvaluationFlows();
  const { data: evalTypes = [] } = useEvaluationTypes();

  const createMutation = useCreateJpEvalFlow({
    onSuccess: () => { showToast.success('Flow assigned'); resetRight(); refetch(); },
    onError: (e) => showToast.error(e.message),
  });
  const updateMutation = useUpdateJpEvalFlow(id, {
    onSuccess: () => { showToast.success('Flow updated'); resetRight(); refetch(); },
    onError: (e) => showToast.error(e.message),
  });
  const deleteMutation = useDeleteJpEvalFlow(id, {
    onSuccess: () => { showToast.success('Flow removed'); refetch(); },
    onError: (e) => showToast.error(e.message),
  });
  const createFlowMutation = useCreateEvaluationFlow();

  const resetRight = () => {
    setRightMode('empty'); setSelectedFlow(null); setEditingItem(null); setEffectiveFrom('');
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
    if (matched) setSelectedFlow(matched);
    try {
      const d = new Date(item.effeDateFrom);
      setEffectiveFrom(isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]);
    } catch { setEffectiveFrom(''); }
    setRightMode('edit');
  };

  const handleSaveCreate = async (data: { name: string; isGlobal: boolean; steps: StepRow[]; effectiveFrom: string }) => {
    if (!data.name.trim()) return;
    const validSteps = data.steps.filter(s => s.stepName.trim() && s.evalTypeId);
    setIsCreating(true);
    try {
      const newFlow = await createFlowMutation.mutateAsync({ name: data.name.trim(), isGlobal: data.isGlobal });
      for (const s of validSteps) await evaluationStepApi.create({ ...s, evaluationFlowId: newFlow.id });
      if (data.effectiveFrom) {
        await createMutation.mutateAsync({ evaluationFlowId: newFlow.id, jobPostingId: id, effectiveFrom: new Date(data.effectiveFrom).toISOString() });
      }
      await refetchFlows();
      showToast.success(`"${data.name}" created${data.effectiveFrom ? ' and assigned' : ''}`);
      resetRight();
    } catch (e: any) { showToast.error(e.message || 'Failed'); }
    finally { setIsCreating(false); }
  };

  const isAssigning = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 space-y-6">

      <JpEvalFlowHeader displayPostNumber={displayPostNumber} />

      {/* Assigned flows — full width */}
      {(itemsLoading || items.length > 0) && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assigned to this posting</p>
          {itemsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {items.map(item => (
                <JpAssignedFlowCard
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

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <JpFlowSelector
            evalFlows={evalFlows}
            selectedFlowId={selectedFlow?.id ?? ''}
            onSelect={handleSelectFlow}
            onCreateNew={() => { setRightMode('create'); setSelectedFlow(null); }}
          />
        </div>
        <div className="lg:col-span-3">
          <JpEvalFlowRightPanel
            mode={rightMode}
            selectedFlow={selectedFlow}
            editingItem={editingItem}
            evalTypes={evalTypes}
            isAssigning={isAssigning}
            effectiveFrom={effectiveFrom}
            onEffectiveFromChange={setEffectiveFrom}
            onAssign={handleAssign}
            onReset={resetRight}
            onSaveCreate={handleSaveCreate}
            isCreating={isCreating}
          />
        </div>
      </div>
    </motion.section>
  );
};

export default JpEvalFlowSection;
