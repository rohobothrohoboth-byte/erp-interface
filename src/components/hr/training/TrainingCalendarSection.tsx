import React from 'react';
import HrPageShell from '../shared/HrPageShell';
import { useTrainingSessions } from '../../../services/hr/training/training.queries';

const TrainingCalendarSection: React.FC = () => {
  const { data = [], isLoading, error } = useTrainingSessions();
  return (
    <HrPageShell title="Training Calendar" subtitle="Scheduled sessions" loading={isLoading} error={error?.message}>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Title</th><th className="p-3">Start</th><th className="p-3">End</th>
              <th className="p-3">Location</th><th className="p-3">Status</th><th className="p-3">Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.title}</td>
                <td className="p-3">{s.startAt?.slice(0, 16).replace('T', ' ')}</td>
                <td className="p-3">{s.endAt?.slice(0, 16).replace('T', ' ')}</td>
                <td className="p-3">{s.location || s.mode || '—'}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3">{s.enrollmentCount}{s.capacity ? ` / ${s.capacity}` : ''}</td>
              </tr>
            ))}
            {!data.length && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No sessions scheduled</td></tr>}
          </tbody>
        </table>
      </div>
    </HrPageShell>
  );
};

export default TrainingCalendarSection;
