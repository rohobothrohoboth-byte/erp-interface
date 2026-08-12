import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Trash2, Send, CheckCircle2 } from 'lucide-react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { FormModal, Field, inputCls } from '@/modules/inventory/components/FormModal';
import { showToast } from '@/shared/layout/layout';
import { performanceApi } from '@/modules/hr/services/performance/performance.api';
import { useEmployeeList } from '@/modules/hr/services/employee/emp.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import type {
  PerformanceReview,
  PerformanceReviewCreate,
} from '@/modules/hr/types/performance.types';

const REVIEWS_KEY = ['performance', 'reviews'];

const emptyForm: PerformanceReviewCreate = {
  employeeId: '',
  reviewerId: '',
  period: '',
  overallScore: null,
  comments: '',
};

const statusTone = (status: string): 'success' | 'warning' | 'info' | 'neutral' => {
  const s = (status || '').toLowerCase();
  if (s.includes('approved')) return 'success';
  if (s.includes('submit')) return 'info';
  if (s.includes('draft')) return 'warning';
  return 'neutral';
};

export default function EmployeePerformancePage() {
  const qc = useQueryClient();
  const employeeIdFromAuth = useAuthStore((s) => s.employeeId);
  const userId = useAuthStore((s) => s.userId);
  const reviewerId = employeeIdFromAuth || userId || '';

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PerformanceReviewCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PerformanceReview[], Error>({
    queryKey: REVIEWS_KEY,
    queryFn: () => performanceApi.getReviews(),
  });

  const { data: employees = [] } = useEmployeeList();

  const employeeName = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((e) => map.set(String(e.id), e.empFullName));
    return map;
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) =>
      [employeeName.get(r.employeeId) || r.employeeId, r.period, r.status, r.comments]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [reviews, search, employeeName]);

  const invalidate = () => qc.invalidateQueries({ queryKey: REVIEWS_KEY });

  const createMutation = useMutation({
    mutationFn: (dto: PerformanceReviewCreate) => performanceApi.createReview(dto),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PerformanceReviewCreate }) =>
      performanceApi.updateReview(id, dto),
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, reviewerId });
    setModalOpen(true);
  };

  const openEdit = (r: PerformanceReview) => {
    setEditingId(r.id);
    setForm({
      employeeId: r.employeeId,
      reviewerId: r.reviewerId || reviewerId,
      period: r.period,
      overallScore: r.overallScore ?? null,
      status: r.status,
      comments: r.comments ?? '',
      reviewDate: r.reviewDate ?? null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.employeeId) {
      showToast.error('Please select an employee');
      return;
    }
    if (!form.period.trim()) {
      showToast.error('Review period is required');
      return;
    }
    const payload: PerformanceReviewCreate = {
      ...form,
      reviewerId: form.reviewerId || reviewerId,
      overallScore:
        form.overallScore === null || form.overallScore === undefined || (form.overallScore as any) === ''
          ? null
          : Number(form.overallScore),
    };
    setSubmitting(true);
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, dto: payload });
        showToast.success('Review updated');
      } else {
        await createMutation.mutateAsync(payload);
        showToast.success('Review created');
      }
      setModalOpen(false);
      invalidate();
    } catch (err) {
      showToast.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (r: PerformanceReview) => {
    if (!window.confirm('Delete this performance review?')) return;
    setBusyId(r.id);
    try {
      await performanceApi.deleteReview(r.id);
      showToast.success('Review deleted');
      invalidate();
    } catch (err) {
      showToast.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmitReview = async (r: PerformanceReview) => {
    setBusyId(r.id);
    try {
      await performanceApi.submitReview(r.id);
      showToast.success('Review submitted');
      invalidate();
    } catch (err) {
      showToast.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (r: PerformanceReview) => {
    setBusyId(r.id);
    try {
      await performanceApi.approveReview(r.id);
      showToast.success('Review approved');
      invalidate();
    } catch (err) {
      showToast.error(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ModulePageShell
      title="Performance reviews"
      subtitle="Create review cycles, capture ratings, and track approvals."
      stats={[
        { label: 'Reviews', value: reviews.length },
        {
          label: 'Approved',
          value: reviews.filter((r) => (r.status || '').toLowerCase().includes('approved')).length,
        },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search reviews..."
      onRefresh={() => refetch()}
      primaryActionLabel="New review"
      onPrimaryAction={openAdd}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading reviews...
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 py-12 text-center">
          <p className="text-sm text-rose-700">{error?.message || 'Failed to load reviews.'}</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {employeeName.get(r.employeeId) || r.employeeId}
                    </div>
                    {r.comments && (
                      <div className="max-w-xs truncate text-xs text-slate-500">{r.comments}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">{r.period}</td>
                  <td className="px-4 py-3">{r.overallScore ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status || 'Draft'} tone={statusTone(r.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id}
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-sky-200 text-sky-700 hover:bg-sky-50"
                        disabled={busyId === r.id}
                        onClick={() => handleSubmitReview(r)}
                      >
                        {busyId === r.id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="mr-1 h-3.5 w-3.5" />
                        )}
                        Submit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        disabled={busyId === r.id}
                        onClick={() => handleApprove(r)}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        disabled={busyId === r.id}
                        onClick={() => handleDelete(r)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    {search ? 'No reviews match your search.' : 'No performance reviews yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        title={editingId ? 'Edit performance review' : 'New performance review'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={editingId ? 'Save changes' : 'Create review'}
      >
        <Field label="Employee *">
          <select
            className={inputCls}
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
          >
            <option value="">Select employee…</option>
            {employees.map((emp) => (
              <option key={String(emp.id)} value={String(emp.id)}>
                {emp.empFullName} {emp.code ? `(${emp.code})` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Review period *">
          <input
            className={inputCls}
            placeholder="e.g. FY2026 Annual"
            value={form.period}
            onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
          />
        </Field>
        <Field label="Overall score">
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            className={inputCls}
            placeholder="e.g. 4.2"
            value={form.overallScore ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                overallScore: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
          />
        </Field>
        <Field label="Comments">
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Strengths, development areas, follow-up actions…"
            value={form.comments ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
          />
        </Field>
      </FormModal>
    </ModulePageShell>
  );
}
