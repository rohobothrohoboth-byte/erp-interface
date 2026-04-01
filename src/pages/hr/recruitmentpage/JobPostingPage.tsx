import React from 'react';
import { useParams } from 'react-router-dom';
import JobPostingSection from '../../../components/hr/recruitment/jobPosting/JobPostingSection';

const JobPostingPage: React.FC = () => {
  // Works for both /job-requisition/:reqId/postings and /workforce-plan/:planId/postings
  const { reqId, planId } = useParams<{ reqId?: string; planId?: string }>();
  return <JobPostingSection reqId={reqId ?? planId ?? ''} />;
};

export default JobPostingPage;
