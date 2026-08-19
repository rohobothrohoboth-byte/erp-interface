import React from 'react';
import { Users, ClipboardCheck, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { JobAppListDto } from '@/modules/hr/types/recruit/jopApp';
import type { JpEvalFlowListDto } from '@/modules/hr/types/recruit/jpEvalFlow';

interface JobPostingSummaryCardsProps {
  postId: string;
  postNumber: string;
  applicants: JobAppListDto[];
  evalFlows: JpEvalFlowListDto[];
  onApplicantClick: (id: string) => void;
}

const JobPostingSummaryCards: React.FC<JobPostingSummaryCardsProps> = ({
  postId, postNumber, applicants, evalFlows, onApplicantClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Latest applicants */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users size={14} className="text-green-600" /> Latest Applicants
          </p>
          <button type="button"
            onClick={() => navigate(`/hr/recruitment/job-posting/${postId}/applicants/${encodeURIComponent(postNumber)}`)}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 cursor-pointer font-medium">
            View all <ChevronRight size={12} />
          </button>
        </div>
        {applicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
              <Users size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No applicants yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {applicants.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 cursor-pointer"
                  onClick={() => onApplicantClick(a.id)}>
                  <span className="text-xs font-bold text-green-700">{a.applicant?.charAt(0) ?? '?'}</span>
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onApplicantClick(a.id)}>
                  <p className="text-sm font-medium text-gray-800 truncate">{a.applicant}</p>
                  <p className="text-xs text-gray-400">{a.appliedDateStr || a.appliedDate?.split('T')[0]}</p>
                </div>
                <button type="button" onClick={() => navigate(`/hr/recruitment/applicant/${a.id}/evaluate`)}
                  className="flex items-center gap-1 text-[10px] text-green-600 hover:text-green-700 font-semibold cursor-pointer shrink-0 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">
                  <ClipboardCheck size={11} /> Evaluate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned evaluation flow */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ClipboardCheck size={14} className="text-green-600" /> Evaluation Flow
          </p>
          <button type="button"
            onClick={() => navigate(`/hr/recruitment/posting/${postId}/eval-flow`)}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 cursor-pointer font-medium">
            Manage <ChevronRight size={12} />
          </button>
        </div>
        {evalFlows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
              <ClipboardCheck size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No flow assigned</p>
            <button type="button"
              onClick={() => navigate(`/hr/recruitment/posting/${postId}/eval-flow`)}
              className="mt-2 text-xs text-green-600 hover:underline cursor-pointer">
              Assign one →
            </button>
          </div>
        ) : evalFlows.map(flow => (
          <div key={flow.id} className="px-5 py-4 border-b border-gray-100 last:border-0">
            <p className="text-sm font-semibold text-gray-800">{flow.evalFlowName}</p>
            <p className="text-xs text-gray-400 mt-0.5">From {flow.effeDateFrom}</p>
            {flow.steps?.length > 0 && (
              <div className="mt-3 flex items-center overflow-x-auto">
                {flow.steps.map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      {s.isFinalStr === 'Yes'
                        ? <CheckCircle2 size={16} className="text-green-500" />
                        : <Circle size={16} className="text-gray-300" />}
                      <p className="text-[10px] text-gray-500 max-w-[60px] text-center leading-tight truncate">{s.stepName}</p>
                    </div>
                    {i < flow.steps.length - 1 && <div className="w-6 h-px bg-gray-200 shrink-0 mb-4" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobPostingSummaryCards;
