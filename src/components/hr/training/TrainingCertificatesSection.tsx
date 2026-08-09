import React, { useState } from 'react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import HrPageShell from '../shared/HrPageShell';
import SimpleModal from '../shared/SimpleModal';
import { useIssueCertificate, useTrainingCertificates } from '../../../services/hr/training/training.queries';

const TrainingCertificatesSection: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState('');
  const { data = [], isLoading, error } = useTrainingCertificates();
  const issueMut = useIssueCertificate({
    onSuccess: () => { showToast.success('Certificate issued'); setOpen(false); },
    onError: (e) => showToast.error(e.message),
  });

  return (
    <HrPageShell title="Certifications" subtitle="Issued training certificates"
      actionLabel="Issue Certificate" onAction={() => setOpen(true)}
      loading={isLoading} error={error?.message}>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Number</th><th className="p-3">Title</th><th className="p-3">Employee</th>
              <th className="p-3">Status</th><th className="p-3">Issued</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.certificateNumber}</td>
                <td className="p-3">{c.title}</td>
                <td className="p-3 font-mono text-xs">{c.employeeId.slice(0, 8)}…</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">{c.issuedAt?.slice(0, 10)}</td>
              </tr>
            ))}
            {!data.length && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No certificates</td></tr>}
          </tbody>
        </table>
      </div>

      <SimpleModal open={open} title="Issue Certificate" onClose={() => setOpen(false)} loading={issueMut.isPending}
        submitLabel="Issue" onSubmit={() => issueMut.mutate(enrollmentId.trim())}>
        <div className="space-y-2"><Label>Enrollment ID</Label><Input value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)} /></div>
      </SimpleModal>
    </HrPageShell>
  );
};

export default TrainingCertificatesSection;
