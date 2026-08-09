import React, { useState } from 'react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import HrPageShell from '../shared/HrPageShell';
import SimpleModal from '../shared/SimpleModal';
import {
  useCreateGoal, useCreateReview, useGoals, useReviewAction, useReviews,
} from '../../../services/hr/performance/performance.queries';

const PerformanceSection: React.FC = () => {
  const [goalOpen, setGoalOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ employeeId: '', title: '', startDate: '', targetDate: '' });
  const [reviewForm, setReviewForm] = useState({ employeeId: '', title: '', periodStart: '', periodEnd: '' });

  const goalsQ = useGoals();
  const reviewsQ = useReviews();
  const createGoal = useCreateGoal({
    onSuccess: () => { showToast.success('Goal created'); setGoalOpen(false); },
    onError: (e) => showToast.error(e.message),
  });
  const createReview = useCreateReview({
    onSuccess: () => { showToast.success('Review created'); setReviewOpen(false); },
    onError: (e) => showToast.error(e.message),
  });
  const submitMut = useReviewAction('submit', { onSuccess: () => showToast.success('Submitted'), onError: (e) => showToast.error(e.message) });
  const approveMut = useReviewAction('approve', { onSuccess: () => showToast.success('Approved'), onError: (e) => showToast.error(e.message) });
  const rejectMut = useReviewAction('reject', { onSuccess: () => showToast.success('Rejected'), onError: (e) => showToast.error(e.message) });

  return (
    <HrPageShell title="Performance" subtitle="Goals and performance reviews"
      error={goalsQ.error?.message || reviewsQ.error?.message}>
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-3">
          <Button className="bg-green-700 text-white" onClick={() => setReviewOpen(true)}>New Review</Button>
          <div className="bg-white border rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr><th className="p-3">Title</th><th className="p-3">Employee</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody>
                {(reviewsQ.data || []).map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.title}</td>
                    <td className="p-3 font-mono text-xs">{r.employeeId.slice(0, 8)}…</td>
                    <td className="p-3">{r.status}</td>
                    <td className="p-3 space-x-1">
                      <Button size="sm" variant="outline" onClick={() => submitMut.mutate({ id: r.id })}>Submit</Button>
                      <Button size="sm" onClick={() => approveMut.mutate({ id: r.id, decision: {} })}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => rejectMut.mutate({ id: r.id, decision: { rejectionReason: 'Needs revision' } })}>Reject</Button>
                    </td>
                  </tr>
                ))}
                {!reviewsQ.data?.length && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No reviews</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-3">
          <Button className="bg-green-700 text-white" onClick={() => setGoalOpen(true)}>New Goal</Button>
          <div className="bg-white border rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr><th className="p-3">Title</th><th className="p-3">Employee</th><th className="p-3">Status</th><th className="p-3">Progress</th></tr>
              </thead>
              <tbody>
                {(goalsQ.data || []).map((g) => (
                  <tr key={g.id} className="border-t">
                    <td className="p-3">{g.title}</td>
                    <td className="p-3 font-mono text-xs">{g.employeeId.slice(0, 8)}…</td>
                    <td className="p-3">{g.status}</td>
                    <td className="p-3">{g.progressPercent}%</td>
                  </tr>
                ))}
                {!goalsQ.data?.length && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No goals</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <SimpleModal open={goalOpen} title="Create Goal" onClose={() => setGoalOpen(false)} loading={createGoal.isPending}
        onSubmit={() => createGoal.mutate({
          employeeId: goalForm.employeeId.trim(),
          title: goalForm.title.trim(),
          startDate: new Date(goalForm.startDate).toISOString(),
          targetDate: new Date(goalForm.targetDate).toISOString(),
        })}>
        <div className="space-y-2"><Label>Employee ID</Label><Input value={goalForm.employeeId} onChange={(e) => setGoalForm({ ...goalForm, employeeId: e.target.value })} /></div>
        <div className="space-y-2"><Label>Title</Label><Input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Start</Label><Input type="date" value={goalForm.startDate} onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })} /></div>
          <div className="space-y-2"><Label>Target</Label><Input type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })} /></div>
        </div>
      </SimpleModal>

      <SimpleModal open={reviewOpen} title="Create Review" onClose={() => setReviewOpen(false)} loading={createReview.isPending}
        onSubmit={() => createReview.mutate({
          employeeId: reviewForm.employeeId.trim(),
          title: reviewForm.title.trim(),
          periodStart: new Date(reviewForm.periodStart).toISOString(),
          periodEnd: new Date(reviewForm.periodEnd).toISOString(),
        })}>
        <div className="space-y-2"><Label>Employee ID</Label><Input value={reviewForm.employeeId} onChange={(e) => setReviewForm({ ...reviewForm, employeeId: e.target.value })} /></div>
        <div className="space-y-2"><Label>Title</Label><Input value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Period start</Label><Input type="date" value={reviewForm.periodStart} onChange={(e) => setReviewForm({ ...reviewForm, periodStart: e.target.value })} /></div>
          <div className="space-y-2"><Label>Period end</Label><Input type="date" value={reviewForm.periodEnd} onChange={(e) => setReviewForm({ ...reviewForm, periodEnd: e.target.value })} /></div>
        </div>
      </SimpleModal>
    </HrPageShell>
  );
};

export default PerformanceSection;
