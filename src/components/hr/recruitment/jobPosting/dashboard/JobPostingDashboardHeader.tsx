import React from 'react';
import { ArrowLeft, Megaphone, Users, ClipboardCheck, XCircle, PlayCircle, PauseCircle, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../ui/button';
import type { JobPostingViewDto } from '../../../../../types/hr/recruit/jobPosting';

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  Draft:     { bg: 'bg-gray-100',   text: 'text-gray-700',  dot: 'bg-gray-400',   label: 'Draft' },
  Published: { bg: 'bg-green-100',  text: 'text-green-800', dot: 'bg-green-500',  label: 'Open' },
  Closed:    { bg: 'bg-red-100',    text: 'text-red-800',   dot: 'bg-red-500',    label: 'Closed' },
  OnHold:    { bg: 'bg-yellow-100', text: 'text-yellow-800',dot: 'bg-yellow-500', label: 'On Hold' },
  Cancelled: { bg: 'bg-orange-100', text: 'text-orange-800',dot: 'bg-orange-500', label: 'Cancelled' },
};

const ActionBtn: React.FC<{
  label: string; icon: React.ReactNode; onClick: () => void;
  variant?: 'primary' | 'danger' | 'outline'; disabled?: boolean;
}> = ({ label, icon, onClick, variant = 'outline', disabled }) => {
  const cls = {
    primary: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    danger:  'bg-red-50 hover:bg-red-100 text-red-700 border-red-200',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200',
  }[variant];
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${cls}`}>
      {icon} {label}
    </button>
  );
};

interface JobPostingDashboardHeaderProps {
  post: JobPostingViewDto;
  postId: string;
  onPublish: () => void;
  onClose: () => void;
  onHold: () => void;
  onStartEvaluation: () => void;
  isClosing?: boolean;
}

const JobPostingDashboardHeader: React.FC<JobPostingDashboardHeaderProps> = ({
  post, postId, onPublish, onClose, onHold, onStartEvaluation, isClosing,
}) => {
  const navigate = useNavigate();
  const sc = statusConfig[post.statusStr] ?? statusConfig.Draft;
  const isPublished = post.statusStr === 'Published';
  const isDraft = post.statusStr === 'Draft';
  const isClosed = post.statusStr === 'Closed';

  return (
    <div className="space-y-2">
      {/* Row 1: Back + Title + Status */}
      <div className="flex items-start gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 cursor-pointer shrink-0 mt-0.5">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Megaphone className="w-5 h-5 text-green-600 shrink-0" />
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {post.postNumber}
              </span>
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Action buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {isDraft && <ActionBtn label="Publish" icon={<PlayCircle size={15} />} variant="primary" onClick={onPublish} />}
        {isPublished && (
          <ActionBtn label="Close" icon={<XCircle size={15} />} variant="danger" onClick={onClose} disabled={isClosing} />
        )}
        {isPublished && (
          <ActionBtn label="On Hold" icon={<PauseCircle size={15} />} variant="outline" onClick={onHold} />
        )}
        {isClosed && (
          <ActionBtn label="Start Evaluation" icon={<FlaskConical size={15} />} variant="primary" onClick={onStartEvaluation} />
        )}
        <ActionBtn label="Eval Flow" icon={<ClipboardCheck size={15} />}
          onClick={() => navigate(`/hr/recruitment/job-posting/${postId}/eval-flow/${encodeURIComponent(post.postNumber)}`)} />
        <ActionBtn label="Applicants" icon={<Users size={15} />}
          onClick={() => navigate(`/hr/recruitment/job-posting/${postId}/applicants/${encodeURIComponent(post.postNumber)}`)} />
      </div>
    </div>
  );
};

export default JobPostingDashboardHeader;
