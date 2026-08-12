import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Field, inputCls } from '@/modules/inventory/components/FormModal';
import { showToast } from '@/shared/layout/layout';
import { offerApi } from '@/modules/hr/services/recruitment/offer/offer.api';
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { jobPostingApi } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.api';
import type { JobPostingListDto } from '@/modules/hr/types/recruit/jobPosting';

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export default function OfferCreatePage() {
  const navigate = useNavigate();
  const { data: applicants = [] } = useAllApplicants();
  const { data: postings = [] } = useQuery<JobPostingListDto[]>({
    queryKey: ['recruit', 'postings'],
    queryFn: jobPostingApi.getAll,
  });

  const [form, setForm] = useState({
    applicantId: '',
    jobPostingId: '',
    salary: '',
    currency: 'ETB',
    benefits: '',
    startDate: plusDays(30),
    expiryDate: plusDays(14),
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const applicantOptions = useMemo(
    () => applicants.map((a: any) => ({ id: String(a.id), label: `${a.applicant}${a.position ? ` — ${a.position}` : ''}` })),
    [applicants],
  );

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.applicantId) return showToast.error('Select an applicant');
    if (!form.jobPostingId) return showToast.error('Select a job posting');
    if (!form.salary || Number(form.salary) <= 0) return showToast.error('Enter a valid salary');
    setSaving(true);
    try {
      await offerApi.create({
        applicantId: form.applicantId,
        jobPostingId: form.jobPostingId,
        salary: Number(form.salary),
        currency: form.currency || 'ETB',
        benefits: form.benefits,
        startDate: new Date(form.startDate).toISOString(),
        expiryDate: new Date(form.expiryDate).toISOString(),
        notes: form.notes || null,
      });
      showToast.success('Offer created (Draft)');
      navigate('/hr/recruitment/offers');
    } catch (e) {
      showToast.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/hr/recruitment/offers')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Create Offer</h1>
          <p className="text-sm text-slate-500">Draft an employment offer for a selected applicant.</p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Applicant *">
            <select className={inputCls} value={form.applicantId} onChange={(e) => set('applicantId', e.target.value)}>
              <option value="">Select applicant…</option>
              {applicantOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Job Posting *">
            <select className={inputCls} value={form.jobPostingId} onChange={(e) => set('jobPostingId', e.target.value)}>
              <option value="">Select posting…</option>
              {postings.map((p) => (
                <option key={p.id} value={p.id}>{p.postNumber}{p.reqNumber ? ` · ${p.reqNumber}` : ''}</option>
              ))}
            </select>
          </Field>
          <Field label="Salary *">
            <input type="number" min={0} className={inputCls} value={form.salary} onChange={(e) => set('salary', e.target.value)} placeholder="e.g. 25000" />
          </Field>
          <Field label="Currency">
            <input className={inputCls} value={form.currency} onChange={(e) => set('currency', e.target.value)} />
          </Field>
          <Field label="Start Date">
            <input type="date" className={inputCls} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </Field>
          <Field label="Offer Expiry Date">
            <input type="date" className={inputCls} value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} min={today()} />
          </Field>
        </div>
        <Field label="Benefits">
          <textarea rows={2} className={inputCls} value={form.benefits} onChange={(e) => set('benefits', e.target.value)} placeholder="Housing, transport, medical, etc." />
        </Field>
        <Field label="Notes">
          <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => navigate('/hr/recruitment/offers')}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Create Offer
          </Button>
        </div>
      </div>
    </div>
  );
}
