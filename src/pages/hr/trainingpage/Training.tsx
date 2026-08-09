import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import HrPageShell from '../../../components/hr/shared/HrPageShell';
import {
  useTrainingCertificates,
  useTrainingEnrollments,
  useTrainingEvaluations,
  useTrainingPrograms,
  useTrainingSessions,
} from '../../../services/hr/training/training.queries';

const CardLink: React.FC<{
  title: string;
  to: string;
  count?: number;
  hint: string;
  loading?: boolean;
  error?: string | null;
}> = ({ title, to, count, hint, loading, error }) => (
  <Link to={to} className="block bg-white border rounded-lg p-4 hover:border-green-600 transition">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <Badge variant={error ? 'destructive' : 'default'}>
        {loading ? '…' : error ? 'Error' : (count ?? 0)}
      </Badge>
    </div>
    <p className="text-xs text-gray-500">{error || hint}</p>
  </Link>
);

/**
 * Training hub — loads live Training API counts (gateway /training/*).
 * Subpages under /hr/training/* own create/publish/enroll flows.
 */
const Training: React.FC = () => {
  const programs = useTrainingPrograms();
  const sessions = useTrainingSessions();
  const enrollments = useTrainingEnrollments();
  const evaluations = useTrainingEvaluations();
  const certificates = useTrainingCertificates();

  const loading =
    programs.isLoading || sessions.isLoading || enrollments.isLoading
    || evaluations.isLoading || certificates.isLoading;
  const error =
    programs.error?.message
    || sessions.error?.message
    || enrollments.error?.message
    || evaluations.error?.message
    || certificates.error?.message;

  return (
    <HrPageShell
      title="Training & Development"
      subtitle="Live data from gateway /training → Training service :7017"
      loading={loading}
      error={error}
      actionLabel="Refresh"
      onAction={() => {
        void programs.refetch();
        void sessions.refetch();
        void enrollments.refetch();
        void evaluations.refetch();
        void certificates.refetch();
      }}
    >
      <p className="text-xs text-gray-500 mb-3">
        Expected API: <code>GET {import.meta.env.VITE_HR_TRAINING_URL || '/training'}/programs</code>
      </p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <CardLink
          title="Programs"
          to="/hr/training/programs"
          count={programs.data?.length}
          loading={programs.isLoading}
          error={programs.error?.message}
          hint="Create, publish, and enroll"
        />
        <CardLink
          title="Calendar / Sessions"
          to="/hr/training/calendar"
          count={sessions.data?.length}
          loading={sessions.isLoading}
          error={sessions.error?.message}
          hint="Scheduled sessions"
        />
        <CardLink
          title="Enrollments"
          to="/hr/training/programs"
          count={enrollments.data?.length}
          loading={enrollments.isLoading}
          error={enrollments.error?.message}
          hint="Employee enrollments"
        />
        <CardLink
          title="Feedback"
          to="/hr/training/feedback"
          count={evaluations.data?.length}
          loading={evaluations.isLoading}
          error={evaluations.error?.message}
          hint="Evaluations and feedback"
        />
        <CardLink
          title="Certificates"
          to="/hr/training/certificates"
          count={certificates.data?.length}
          loading={certificates.isLoading}
          error={certificates.error?.message}
          hint="Issued certificates"
        />
      </div>
    </HrPageShell>
  );
};

export default Training;
