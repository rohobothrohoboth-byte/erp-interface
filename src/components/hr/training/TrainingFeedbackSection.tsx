import React from 'react';
import HrPageShell from '../shared/HrPageShell';
import { useTrainingEvaluations } from '../../../services/hr/training/training.queries';

const TrainingFeedbackSection: React.FC = () => {
  const { data = [], isLoading, error } = useTrainingEvaluations();
  return (
    <HrPageShell title="Training Feedback" subtitle="Program evaluations" loading={isLoading} error={error?.message}>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3">Employee</th><th className="p-3">Rating</th><th className="p-3">Feedback</th><th className="p-3">Submitted</th></tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3 font-mono text-xs">{e.employeeId.slice(0, 8)}…</td>
                <td className="p-3">{e.rating}/5</td>
                <td className="p-3">{e.feedback || '—'}</td>
                <td className="p-3">{e.submittedAt?.slice(0, 10)}</td>
              </tr>
            ))}
            {!data.length && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No feedback yet</td></tr>}
          </tbody>
        </table>
      </div>
    </HrPageShell>
  );
};

export default TrainingFeedbackSection;
