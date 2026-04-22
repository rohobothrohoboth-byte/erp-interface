import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Plus, Trash2, Edit, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { showToast } from '../../../../layout/layout';
import {
  useJpEvalFlows,
  useCreateJpEvalFlow,
  useUpdateJpEvalFlow,
  useDeleteJpEvalFlow,
} from '../../../../services/hr/recruitment/jpEvalFlow/jpEvalFlow.queries';
import { useEvaluationFlows } from '../../../../services/hr/recruitment/evaluationFlow/evaluationFlow.queries';
import type { JpEvalFlowListDto } from '../../../../types/hr/recruit/jpEvalFlow';
import type { JobPostingListDto } from '../../../../types/hr/recruit/jobPosting';

interface JpEvalFlowModalProps {
  isOpen: boolean;
  posting: JobPostingListDto | null;
  onClose: () => void;
}

const JpEvalFlowModal: React.FC<JpEvalFlowModalProps> = ({ isOpen, posting, onClose }) => {
  const postId = posting?.id ?? '';
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<JpEvalFlowListDto | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [flowId, setFlowId] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');

  const { data: items = [], isLoading } = useJpEvalFlows(postId);
  const { data: evalFlows = [] } = useEvaluationFlows();

  const createMutation = useCreateJpEvalFlow({
    onSuccess: () => { showToast.success('Evaluation flow assigned'); resetForm(); },
    onError: (e) => showToast.error(e.message),
  });

  const updateMutation = useUpdateJpEvalFlow(postId, {
    onSuccess: () => { showToast.success('Evaluation flow updated'); resetForm(); },
    onError: (e) => showToast.error(e.message),
  });

  const deleteMutation = useDeleteJpEvalFlow(postId, {
    onSuccess: () => showToast.success('Evaluation flow removed'),
    onError: (e) => showToast.error(e.message),
  });

  const resetForm = () => {
    setFlowId(''); setEffectiveFrom('');
    setShowAdd(false); setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!flowId || !effectiveFrom) return;
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, evaluationFlowId: flowId, effectiveFrom: new Date(effectiveFrom).toISOString(), rowVersion: editingItem.rowVersion });
    } else {
      createMutation.mutate({ evaluationFlowId: flowId, jobPostingId: postId, effectiveFrom: new Date(effectiveFrom).toISOString() });
    }
  };

  const startEdit = (item: JpEvalFlowListDto) => {
    setEditingItem(item);
    setFlowId(item.id); // will be overridden — we don't have evaluationFlowId in list dto, use item.id as placeholder
    setEffectiveFrom(item.effeDateFrom ? new Date(item.effeDateFrom).toISOString().split('T')[0] : '');
    setShowAdd(true);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      {isOpen && posting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <ClipboardCheck size={20} className="text-green-600" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Evaluation Flows</h2>
                <p className="text-xs text-gray-500">{posting.postNumber} · {posting.reqNumber}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Add / Edit form */}
              {showAdd && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-green-800">{editingItem ? 'Edit Evaluation Flow' : 'Assign Evaluation Flow'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Evaluation Flow <span className="text-red-500">*</span></Label>
                      <Select value={flowId} onValueChange={setFlowId} disabled={isSubmitting}>
                        <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select flow" /></SelectTrigger>
                        <SelectContent>
                          {evalFlows.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Effective From <span className="text-red-500">*</span></Label>
                      <Input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} disabled={isSubmitting} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={resetForm} disabled={isSubmitting} className="cursor-pointer">Cancel</Button>
                    <Button type="button" size="sm" onClick={handleSubmit}
                      disabled={!flowId || !effectiveFrom || isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                      {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Assign'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Add button */}
              {!showAdd && (
                <Button type="button" size="sm" onClick={() => setShowAdd(true)}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                  <Plus size={14} /> Assign Flow
                </Button>
              )}

              {/* List */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-green-600" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No evaluation flows assigned yet.</div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Row header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                        <button type="button" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          {expandedId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{item.evalFlowName}</p>
                          <p className="text-xs text-gray-500">
                            Effective: {item.effeDateFrom}{item.effeDateTo ? ` → ${item.effeDateTo}` : ''}
                          </p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {item.steps?.length ?? 0} step{item.steps?.length !== 1 ? 's' : ''}
                        </span>
                        <button type="button" onClick={() => startEdit(item)}
                          className="text-gray-400 hover:text-blue-600 cursor-pointer p-1">
                          <Edit size={14} />
                        </button>
                        <button type="button" onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          className="text-gray-400 hover:text-red-600 cursor-pointer p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Steps expanded */}
                      {expandedId === item.id && item.steps?.length > 0 && (
                        <div className="border-t border-gray-100">
                          <table className="w-full text-xs">
                            <thead className="bg-white">
                              <tr>
                                {['Step', 'Type', 'Min Score', 'Max Score', 'Final'].map(h => (
                                  <th key={h} className="text-left px-4 py-2 text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {item.steps.map((s, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 font-medium text-gray-700">{s.stepName}</td>
                                  <td className="px-4 py-2 text-gray-600">{s.evalType}</td>
                                  <td className="px-4 py-2 text-gray-600">{s.minScore}</td>
                                  <td className="px-4 py-2 text-gray-600">{s.maxScore}</td>
                                  <td className="px-4 py-2">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${s.isFinalStr === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                      {s.isFinalStr}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end">
              <Button variant="outline" onClick={onClose} className="cursor-pointer">Close</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JpEvalFlowModal;
