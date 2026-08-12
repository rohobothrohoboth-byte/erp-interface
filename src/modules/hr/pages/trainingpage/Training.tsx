import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Award,
  XCircle,
  Loader2,
  BookOpen,
  GraduationCap,
  Users,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { FormModal, Field, inputCls } from '@/modules/inventory/components/FormModal';
import { trainingApi } from '@/modules/hr/services/training/training.api';
import { getAllEmployees } from '@/modules/hr/services/employee/emp.api';
import type { EmployeeListDto } from '@/modules/hr/types/employee';
import type {
  TrainingProgram,
  TrainingProgramCreate,
  TrainingCourse,
  TrainingCourseCreate,
  TrainingEnrollment,
} from '@/modules/hr/types/training.types';

// ─────────────────────────────────────────────────────────────────────────────
// Shared local helpers
// ─────────────────────────────────────────────────────────────────────────────

const PROGRAM_STATUSES = ['Planning', 'Ongoing', 'Completed', 'Cancelled'];

function fmtDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'An unexpected error occurred';
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || '').toLowerCase();
  const tone =
    s.includes('complete')
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      : s.includes('cancel')
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
      : s.includes('ongoing') || s.includes('progress') || s.includes('active')
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status || '—'}
    </span>
  );
}

function StateMessage({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: typeof BookOpen;
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Icon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
        {detail && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500 dark:text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

const thCls = 'px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';
const tdCls = 'px-4 py-3 text-sm text-slate-700 dark:text-slate-200';

// ─────────────────────────────────────────────────────────────────────────────
// Programs tab
// ─────────────────────────────────────────────────────────────────────────────

interface ProgramFormState {
  name: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  status: string;
}

const emptyProgramForm: ProgramFormState = {
  name: '',
  description: '',
  category: '',
  startDate: '',
  endDate: '',
  status: 'Planning',
};

function ProgramsTab({ onProgramsChange }: { onProgramsChange?: (programs: TrainingProgram[]) => void }) {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingProgram | null>(null);
  const [form, setForm] = useState<ProgramFormState>(emptyProgramForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingApi.getPrograms();
      setPrograms(data);
      onProgramsChange?.(data);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProgramForm);
    setModalOpen(true);
  };

  const openEdit = (p: TrainingProgram) => {
    setEditing(p);
    setForm({
      name: p.name ?? '',
      description: p.description ?? '',
      category: p.category ?? '',
      startDate: toDateInput(p.startDate),
      endDate: toDateInput(p.endDate),
      status: p.status ?? 'Planning',
    });
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Program name is required');
      return;
    }
    const dto: TrainingProgramCreate = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: form.status,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await trainingApi.updateProgram(editing.id, dto);
        toast.success('Program updated');
      } else {
        await trainingApi.createProgram(dto);
        toast.success('Program created');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (p: TrainingProgram) => {
    if (!window.confirm(`Delete program "${p.name}"? This cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      await trainingApi.deleteProgram(p.id);
      toast.success('Program deleted');
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Training Programs</CardTitle>
          <CardDescription>Create and manage training programs.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-1 h-4 w-4" /> Add Program
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loading label="Loading programs…" />
        ) : error ? (
          <StateMessage
            icon={AlertTriangle}
            title="Failed to load programs"
            detail={error}
            action={
              <Button size="sm" variant="outline" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : programs.length === 0 ? (
          <StateMessage
            icon={BookOpen}
            title="No programs yet"
            detail="Get started by creating your first training program."
            action={
              <Button size="sm" onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-1 h-4 w-4" /> Add Program
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Category</th>
                  <th className={thCls}>Start</th>
                  <th className={thCls}>End</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {programs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className={tdCls}>
                      <div className="font-medium text-slate-800 dark:text-slate-100">{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">{p.description}</div>
                      )}
                    </td>
                    <td className={tdCls}>{p.category || '—'}</td>
                    <td className={tdCls}>{fmtDate(p.startDate)}</td>
                    <td className={tdCls}>{fmtDate(p.endDate)}</td>
                    <td className={tdCls}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(p)}
                          disabled={deletingId === p.id}
                          title="Delete"
                          className="text-rose-600 hover:text-rose-700"
                        >
                          {deletingId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <FormModal
        open={modalOpen}
        title={editing ? 'Edit Program' : 'Add Program'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={editing ? 'Update' : 'Create'}
      >
        <Field label="Name">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Leadership Development"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputCls}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <input
            className={inputCls}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Technical, Soft Skills"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date">
            <input
              type="date"
              className={inputCls}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>
          <Field label="End Date">
            <input
              type="date"
              className={inputCls}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Status">
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {PROGRAM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </FormModal>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Courses tab
// ─────────────────────────────────────────────────────────────────────────────

interface CourseFormState {
  title: string;
  description: string;
  instructor: string;
  durationHours: string;
  location: string;
  capacity: string;
  scheduledDate: string;
}

const emptyCourseForm: CourseFormState = {
  title: '',
  description: '',
  instructor: '',
  durationHours: '',
  location: '',
  capacity: '',
  scheduledDate: '',
};

function CoursesTab({ programs }: { programs: TrainingProgram[] }) {
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingCourse | null>(null);
  const [form, setForm] = useState<CourseFormState>(emptyCourseForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProgram && programs.length > 0) {
      setSelectedProgram(programs[0].id);
    }
  }, [programs, selectedProgram]);

  const load = async (programId: string) => {
    if (!programId) {
      setCourses([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await trainingApi.getCoursesByProgram(programId);
      setCourses(data);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProgram) load(selectedProgram);
    else setCourses([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgram]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCourseForm);
    setModalOpen(true);
  };

  const openEdit = (c: TrainingCourse) => {
    setEditing(c);
    setForm({
      title: c.title ?? '',
      description: c.description ?? '',
      instructor: c.instructor ?? '',
      durationHours: String(c.durationHours ?? ''),
      location: c.location ?? '',
      capacity: String(c.capacity ?? ''),
      scheduledDate: toDateInput(c.scheduledDate),
    });
    setModalOpen(true);
  };

  const submit = async () => {
    if (!selectedProgram) {
      toast.error('Select a program first');
      return;
    }
    if (!form.title.trim()) {
      toast.error('Course title is required');
      return;
    }
    const dto: TrainingCourseCreate = {
      programId: selectedProgram,
      title: form.title.trim(),
      description: form.description.trim() || null,
      instructor: form.instructor.trim() || null,
      durationHours: Number(form.durationHours) || 0,
      location: form.location.trim() || null,
      capacity: Number(form.capacity) || 0,
      scheduledDate: form.scheduledDate || null,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await trainingApi.updateCourse(editing.id, dto);
        toast.success('Course updated');
      } else {
        await trainingApi.createCourse(dto);
        toast.success('Course created');
      }
      setModalOpen(false);
      await load(selectedProgram);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (c: TrainingCourse) => {
    if (!window.confirm(`Delete course "${c.title}"?`)) return;
    setDeletingId(c.id);
    try {
      await trainingApi.deleteCourse(c.id);
      toast.success('Course deleted');
      await load(selectedProgram);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Manage courses within a program.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(selectedProgram)}
            disabled={loading || !selectedProgram}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            disabled={!selectedProgram}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Course
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 max-w-sm">
          <Field label="Program">
            <select
              className={inputCls}
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              disabled={programs.length === 0}
            >
              {programs.length === 0 && <option value="">No programs available</option>}
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {programs.length === 0 ? (
          <StateMessage
            icon={BookOpen}
            title="No programs available"
            detail="Create a program in the Programs tab before adding courses."
          />
        ) : loading ? (
          <Loading label="Loading courses…" />
        ) : error ? (
          <StateMessage
            icon={AlertTriangle}
            title="Failed to load courses"
            detail={error}
            action={
              <Button size="sm" variant="outline" onClick={() => load(selectedProgram)}>
                Retry
              </Button>
            }
          />
        ) : courses.length === 0 ? (
          <StateMessage
            icon={GraduationCap}
            title="No courses in this program"
            detail="Add a course to get started."
            action={
              <Button size="sm" onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-1 h-4 w-4" /> Add Course
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className={thCls}>Title</th>
                  <th className={thCls}>Instructor</th>
                  <th className={thCls}>Duration</th>
                  <th className={thCls}>Location</th>
                  <th className={thCls}>Capacity</th>
                  <th className={thCls}>Scheduled</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className={tdCls}>
                      <div className="font-medium text-slate-800 dark:text-slate-100">{c.title}</div>
                      {c.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">{c.description}</div>
                      )}
                    </td>
                    <td className={tdCls}>{c.instructor || '—'}</td>
                    <td className={tdCls}>{c.durationHours ? `${c.durationHours} h` : '—'}</td>
                    <td className={tdCls}>{c.location || '—'}</td>
                    <td className={tdCls}>{c.capacity ?? '—'}</td>
                    <td className={tdCls}>{fmtDate(c.scheduledDate)}</td>
                    <td className={`${tdCls} text-right`}>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(c)}
                          disabled={deletingId === c.id}
                          title="Delete"
                          className="text-rose-600 hover:text-rose-700"
                        >
                          {deletingId === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <FormModal
        open={modalOpen}
        title={editing ? 'Edit Course' : 'Add Course'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={editing ? 'Update' : 'Create'}
      >
        <Field label="Title">
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Intro to React"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputCls}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Instructor">
          <input
            className={inputCls}
            value={form.instructor}
            onChange={(e) => setForm({ ...form, instructor: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration (hours)">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.durationHours}
              onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
            />
          </Field>
          <Field label="Capacity">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Location">
          <input
            className={inputCls}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </Field>
        <Field label="Scheduled Date">
          <input
            type="date"
            className={inputCls}
            value={form.scheduledDate}
            onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
          />
        </Field>
      </FormModal>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Enrollments tab
// ─────────────────────────────────────────────────────────────────────────────

function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [employees, setEmployees] = useState<EmployeeListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);

  const courseTitle = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((c) => map.set(c.id, c.title));
    return (id: string) => map.get(id) || id;
  }, [courses]);

  const employeeName = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((e) => map.set(String(e.id), e.empFullName));
    return (id: string) => map.get(String(id)) || id;
  }, [employees]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [enr, crs, emps] = await Promise.all([
        trainingApi.getEnrollments(),
        trainingApi.getCourses(),
        getAllEmployees(),
      ]);
      setEnrollments(enr);
      setCourses(crs);
      setEmployees(emps);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEnroll = () => {
    setCourseId(courses[0]?.id ?? '');
    setEmployeeId(employees[0] ? String(employees[0].id) : '');
    setModalOpen(true);
  };

  const submit = async () => {
    if (!courseId) {
      toast.error('Select a course');
      return;
    }
    if (!employeeId) {
      toast.error('Select an employee');
      return;
    }
    setSubmitting(true);
    try {
      await trainingApi.enroll({ courseId, employeeId });
      toast.success('Employee enrolled');
      setModalOpen(false);
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (en: TrainingEnrollment) => {
    if (!window.confirm('Cancel this enrollment?')) return;
    setRowBusyId(en.id);
    try {
      await trainingApi.cancelEnrollment(en.id);
      toast.success('Enrollment cancelled');
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setRowBusyId(null);
    }
  };

  const issue = async (en: TrainingEnrollment) => {
    setRowBusyId(en.id);
    try {
      await trainingApi.issueCertificate(en.id);
      toast.success('Certificate issued');
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setRowBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Enrollments</CardTitle>
          <CardDescription>Enroll employees and manage their training records.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            onClick={openEnroll}
            disabled={courses.length === 0 || employees.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="mr-1 h-4 w-4" /> Enroll
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loading label="Loading enrollments…" />
        ) : error ? (
          <StateMessage
            icon={AlertTriangle}
            title="Failed to load enrollments"
            detail={error}
            action={
              <Button size="sm" variant="outline" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : enrollments.length === 0 ? (
          <StateMessage
            icon={Users}
            title="No enrollments yet"
            detail={
              courses.length === 0
                ? 'Create courses before enrolling employees.'
                : 'Enroll an employee to get started.'
            }
            action={
              courses.length > 0 && employees.length > 0 ? (
                <Button size="sm" onClick={openEnroll} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-1 h-4 w-4" /> Enroll
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className={thCls}>Employee</th>
                  <th className={thCls}>Course</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Score</th>
                  <th className={thCls}>Certificate</th>
                  <th className={thCls}>Enrolled</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {enrollments.map((en) => (
                  <tr key={en.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className={`${tdCls} font-medium text-slate-800 dark:text-slate-100`}>
                      {employeeName(en.employeeId)}
                    </td>
                    <td className={tdCls}>{courseTitle(en.courseId)}</td>
                    <td className={tdCls}>
                      <StatusBadge status={en.status} />
                    </td>
                    <td className={tdCls}>{en.score ?? '—'}</td>
                    <td className={tdCls}>
                      {en.certificateIssued ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Issued
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Not issued</span>
                      )}
                    </td>
                    <td className={tdCls}>{fmtDate(en.enrolledAt)}</td>
                    <td className={`${tdCls} text-right`}>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => issue(en)}
                          disabled={rowBusyId === en.id || en.certificateIssued}
                          title="Issue certificate"
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          {rowBusyId === en.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Award className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => cancel(en)}
                          disabled={rowBusyId === en.id}
                          title="Cancel enrollment"
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <FormModal
        open={modalOpen}
        title="Enroll Employee"
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitting={submitting}
        submitLabel="Enroll"
      >
        <Field label="Course">
          <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.length === 0 && <option value="">No courses available</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Employee">
          <select className={inputCls} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            {employees.length === 0 && <option value="">No employees available</option>}
            {employees.map((emp) => (
              <option key={String(emp.id)} value={String(emp.id)}>
                {emp.empFullName}
                {emp.code ? ` (${emp.code})` : ''}
              </option>
            ))}
          </select>
        </Field>
      </FormModal>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const Training = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 md:p-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Training Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage training programs, courses, and employee enrollments.
        </p>
      </div>

      <Tabs defaultValue="programs" className="gap-4">
        <TabsList>
          <TabsTrigger value="programs">
            <BookOpen className="mr-1 h-4 w-4" /> Programs
          </TabsTrigger>
          <TabsTrigger value="courses">
            <GraduationCap className="mr-1 h-4 w-4" /> Courses
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <Users className="mr-1 h-4 w-4" /> Enrollments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <ProgramsTab onProgramsChange={setPrograms} />
        </TabsContent>
        <TabsContent value="courses">
          <CoursesTab programs={programs} />
        </TabsContent>
        <TabsContent value="enrollments">
          <EnrollmentsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Training;
