import React, { useMemo, useState } from 'react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import HrPageShell from '../shared/HrPageShell';
import SimpleModal from '../shared/SimpleModal';
import {
  useCreateTrainingProgram, useEnrollTraining, usePublishTrainingProgram, useTrainingPrograms,
} from '../../../services/hr/training/training.queries';

const TrainingProgramsSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', title: '', category: 'General', description: '' });
  const [employeeId, setEmployeeId] = useState('');

  const { data = [], isLoading, error } = useTrainingPrograms();
  const createMut = useCreateTrainingProgram({
    onSuccess: () => { showToast.success('Program created'); setOpen(false); },
    onError: (e) => showToast.error(e.message),
  });
  const publishMut = usePublishTrainingProgram({
    onSuccess: () => showToast.success('Published'),
    onError: (e) => showToast.error(e.message),
  });
  const enrollMut = useEnrollTraining({
    onSuccess: () => { showToast.success('Enrolled'); setEnrollOpen(null); },
    onError: (e) => showToast.error(e.message),
  });

  const rows = useMemo(() => data.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  return (
    <HrPageShell title="Training Programs" subtitle="Programs, publish, and enroll employees"
      actionLabel="New Program" onAction={() => setOpen(true)}
      search={search} onSearchChange={setSearch} loading={isLoading} error={error?.message}>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3">Status</th>
              <th className="p-3">Courses</th><th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.code}</td>
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">{p.courseCount}</td>
                <td className="p-3 space-x-1">
                  {p.status === 'Draft' && (
                    <Button size="sm" onClick={() => publishMut.mutate(p.id)}>Publish</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEnrollOpen(p.id)}>Enroll</Button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No programs</td></tr>}
          </tbody>
        </table>
      </div>

      <SimpleModal open={open} title="Create Program" onClose={() => setOpen(false)} loading={createMut.isPending}
        onSubmit={() => createMut.mutate({
          code: form.code.trim(), title: form.title.trim(), category: form.category, description: form.description || null,
        })}>
        <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
        <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
        <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      </SimpleModal>

      <SimpleModal open={!!enrollOpen} title="Enroll Employee" onClose={() => setEnrollOpen(null)} loading={enrollMut.isPending}
        submitLabel="Enroll"
        onSubmit={() => enrollOpen && enrollMut.mutate({ programId: enrollOpen, employeeId: employeeId.trim() })}>
        <div className="space-y-2"><Label>Employee ID</Label><Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} /></div>
      </SimpleModal>
    </HrPageShell>
  );
};

export default TrainingProgramsSection;
