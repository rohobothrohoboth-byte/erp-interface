import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Briefcase, ClipboardCheck,
  CheckCircle2, XCircle, ChevronRight,
  FileText, MessageSquare,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { showToast } from '../../../../layout/layout';
import { useApplicantDetail } from '../../../../services/hr/recruitment/applicant/applicant.queries';
import { useEvaluateApplicant } from '../../../../services/hr/recruitment/jobPostEval/jobPostEval.queries';
import { Input } from '../../../ui/input';

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, { bg: string; text: string; dot: string }> = {
    'In Progress': { bg: 'bg-blue-100',   text: 'text-blue-800',  dot: 'bg-blue-500' },
    Rejected:      { bg: 'bg-red-100',    text: 'text-red-800',   dot: 'bg-red-500' },
    Completed:     { bg: 'bg-green-100',  text: 'text-green-800', dot: 'bg-green-500' },
    Pending:       { bg: 'bg-yellow-100', text: 'text-yellow-800',dot: 'bg-yellow-500' },
  };
  const c = cfg[status] ?? cfg['In Progress'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

// ── Score input — plain number field ─────────────────────────────────────────
const ScoreInput: React.FC<{ value: number; onChange: (v: number) => void; disabled?: boolean; min?: number; max?: number }> = ({ value, onChange, disabled, min = 0, max = 100 }) => {
  const color = max > 0 && value / max >= 0.7 ? 'text-green-600' : max > 0 && value / max >= 0.4 ? 'text-yellow-600' : 'text-red-500';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Score <span className="text-red-500">*</span></Label>
     
      </div>
      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={e => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          disabled={disabled}
          className={`disabled:opacity-50 ${color}`}
        />
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const ApplicantEvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const { applicantId } = useParams<{ applicantId: string }>();
  const id = applicantId ?? '';

  const [score, setScore] = useState(50);
  const [feedback, setFeedback] = useState('');
  const [evalState, setEvalState] = useState<'active' | 'rejected' | 'completed'>('active');

  const { data: applicant, isLoading } = useApplicantDetail(id);

  const evalMutation = useEvaluateApplicant({
    onSuccess: () => {
      showToast.success('Evaluation submitted');
      // Backend determines next step — for now show completed
      // When backend returns status, update evalState accordingly
      setEvalState('completed');
    },
    onError: (e) => showToast.error(e.message || 'Failed to submit evaluation'),
  });

  const handleSubmit = () => {
    if (!applicant) return;
    evalMutation.mutate({
      id: applicant.jobApplicationId,
      score,
      feedback: feedback.trim() || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!applicant) return null;

  const statusLabel = evalState === 'rejected' ? 'Rejected' : evalState === 'completed' ? 'Completed' : 'In Progress';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm cursor-pointer transition-colors shrink-0">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="w-px h-5 bg-gray-200 shrink-0" />
            {/* Applicant info */}
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-green-700">{applicant.applicant?.charAt(0) ?? '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm">{applicant.applicant}</p>
                <StatusBadge status={statusLabel} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {applicant.position} · {applicant.department} · {applicant.postNumber}
              </p>
            </div>
            {/* Flow + step info */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 shrink-0">
              <ClipboardCheck size={13} className="text-green-600" />
              <span>Evaluation Flow</span>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="font-medium text-gray-700">Current Step</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Main evaluation card (2/3) ── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* Active state */}
              {evalState === 'active' && (
                <motion.div key="active" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Step header */}
                  <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                        <ClipboardCheck size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Current Step</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">Evaluation</p>
                      </div>
                    </div>
                    {/* <p className="text-sm text-gray-500 mt-3 ml-13">
                      Review the applicant's performance and provide a score and feedback for this evaluation step.
                    </p> */}
                  </div>

                  {/* Form */}
                  <div className="px-6 py-6 space-y-6">
                    {/* Score */}
                    <ScoreInput value={score} onChange={setScore} disabled={evalMutation.isPending} />

                    {/* Feedback */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-gray-400" /> Feedback
                        <span className="text-gray-400 font-normal text-xs">(optional)</span>
                      </Label>
                      <textarea rows={5} value={feedback} onChange={e => setFeedback(e.target.value)}
                        disabled={evalMutation.isPending}
                        placeholder="Provide detailed feedback about the applicant's performance in this step..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50 transition-colors" />
                      <p className="text-xs text-gray-400 text-right">{feedback.length} characters</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
                    <Button type="button" onClick={handleSubmit} disabled={evalMutation.isPending}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-xl px-6 shrink-0">
                      {evalMutation.isPending ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                      ) : (
                        <> Submit & Continue</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Rejected state */}
              {evalState === 'rejected' && (
                <motion.div key="rejected" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                      <XCircle size={28} className="text-red-500" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">Applicant Not Qualified</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">
                      The applicant did not meet the minimum score requirement for this evaluation step.
                    </p>
                    <div className="mt-6 bg-red-50 rounded-xl px-6 py-4 text-left w-full max-w-sm">
                      <p className="text-xs text-red-600 font-semibold uppercase tracking-wide mb-1">Score Submitted</p>
                      <p className="text-3xl font-bold text-red-600">{score}<span className="text-sm font-normal text-red-400"> / 100</span></p>
                      {feedback && <p className="text-sm text-gray-600 mt-2 italic">"{feedback}"</p>}
                    </div>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} className="mt-6 cursor-pointer rounded-xl">
                      Back to Applicants
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Completed state */}
              {evalState === 'completed' && (
                <motion.div key="completed" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle2 size={28} className="text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">Evaluation Submitted</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">
                      The evaluation has been recorded. 
                    </p>
                    <div className="mt-6 bg-green-50 rounded-xl px-6 py-4 text-left w-full max-w-sm">
                      <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Score Submitted</p>
                      <p className="text-3xl font-bold text-green-600">{score}<span className="text-sm font-normal text-green-400"> / 100</span></p>
                      {feedback && <p className="text-sm text-gray-600 mt-2 italic">"{feedback}"</p>}
                    </div>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} className="mt-6 cursor-pointer rounded-xl">
                      Back to Applicants
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Side panel (1/3) ── */}
          <div className="space-y-4">
            {/* Applicant details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <User size={12} /> Applicant Details
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Name', value: applicant.applicant },
                  { label: 'Position', value: applicant.position },
                  { label: 'Department', value: applicant.department },
                  { label: 'Job Grade', value: applicant.jgStep },
                  { label: 'Post Number', value: applicant.postNumber },
                  { label: 'Req Number', value: applicant.reqNumber },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <p className="text-xs text-gray-400 shrink-0">{label}</p>
                    <p className="text-xs font-medium text-gray-800 text-right truncate">{value}</p>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Job details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Briefcase size={12} /> Job Details
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Title', value: applicant.title },
                  { label: 'Contract', value: applicant.contractType },
                  { label: 'Location', value: applicant.workLocation },
                  { label: 'Period', value: applicant.period },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <p className="text-xs text-gray-400 shrink-0">{label}</p>
                    <p className="text-xs font-medium text-gray-800 text-right truncate">{value}</p>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Qualifications */}
            {(applicant.qualification || applicant.keySkills) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <FileText size={12} /> Requirements
                </p>
                {applicant.qualification && (
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Qualifications</p>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{applicant.qualification}</p>
                  </div>
                )}
                {applicant.keySkills && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Key Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {applicant.keySkills.split(/[,\n•]+/).map(s => s.trim()).filter(Boolean).map((s, i) => (
                        <span key={i} className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-lg font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantEvaluationPage;
