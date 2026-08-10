import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { showToast } from '@/shared/layout/layout';
import {
  useJobPostingDetail,
} from '@/modules/hr/services/recruitment/jobPosting/jobPosting.queries';
import { useApplicantsByPost } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { useJpEvalFlows } from '@/modules/hr/services/recruitment/jpEvalFlow/jpEvalFlow.queries';
import PublishJobPostingModal from '@/modules/hr/components/recruitment/jobPosting/PublishJobPostingModal';
import ApplicantDetailModal from '@/modules/hr/components/recruitment/applicant/ApplicantDetailModal';
import JobPostingDashboardHeader from '@/modules/hr/components/recruitment/jobPosting/dashboard/JobPostingDashboardHeader';
import JobPostingKpiCards from '@/modules/hr/components/recruitment/jobPosting/dashboard/JobPostingKpiCards';
import JobPostingInfoCard from '@/modules/hr/components/recruitment/jobPosting/dashboard/JobPostingInfoCard';
import JobPostingSummaryCards from '@/modules/hr/components/recruitment/jobPosting/dashboard/JobPostingSummaryCards';
import { useCloseJobPosting, usePublishJobPosting } from '@/modules/hr/services/recruitment/JobPublish/jobPublish.queries';
import { useStartEvaluation } from '@/modules/hr/services/recruitment/jobPostEval/jobPostEval.queries';

const JobPostingDashboard: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const id = postId ?? '';

  const [publishOpen, setPublishOpen] = React.useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = React.useState<string | null>(null);

  const { data: post, isLoading, refetch } = useJobPostingDetail(id);
  const { data: applicants = [] } = useApplicantsByPost(id);
  const { data: evalFlows = [] } = useJpEvalFlows(id);

  const closeMutation = useCloseJobPosting({
    onSuccess: () => { showToast.success('Posting closed'); refetch(); },
    onError: (e) => showToast.error(e.message),
  });
  const startEvalMutation = useStartEvaluation({
    onSuccess: () => { showToast.success('Evaluation started successfully'); refetch(); },
    onError: (e) => showToast.error(e.message || 'Failed to start evaluation'),
  });
  const publishMutation = usePublishJobPosting({
    onSuccess: () => { showToast.success('Posting published'); setPublishOpen(false); refetch(); },
    onError: (e) => showToast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }
  if (!post) return null;

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 space-y-6">

      <JobPostingDashboardHeader
        post={post}
        postId={id}
        onPublish={() => setPublishOpen(true)}
        onClose={() => closeMutation.mutate(id)}
        onHold={() => showToast.custom('On Hold feature — API endpoint pending')}
        onStartEvaluation={() => startEvalMutation.mutate(id)}
        isClosing={closeMutation.isPending}
      />

      <JobPostingKpiCards post={post} applicantCount={applicants.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JobPostingInfoCard post={post} />
        </div>
        <div>
          <JobPostingSummaryCards
            postId={id}
            postNumber={post.postNumber}
            applicants={applicants}
            evalFlows={evalFlows}
            onApplicantClick={setSelectedApplicantId}
          />
        </div>
      </div>

      <PublishJobPostingModal
        isOpen={publishOpen}
        item={publishOpen ? { id, postNumber: post.postNumber, reqNumber: post.reqNumber, statusStr: post.statusStr, postTypeStr: post.postTypeStr, reqAppQuan: '' } as any : null}
        isLoading={publishMutation.isPending}
        onClose={() => setPublishOpen(false)}
        onSubmit={(pid, comment) => publishMutation.mutate({ id: pid, comment })}
      />
      <ApplicantDetailModal applicantId={selectedApplicantId} onClose={() => setSelectedApplicantId(null)} />
    </motion.section>
  );
};

export default JobPostingDashboard;

