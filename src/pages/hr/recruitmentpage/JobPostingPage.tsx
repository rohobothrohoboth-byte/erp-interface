import React from 'react';
import { useParams } from 'react-router-dom';
import JobPostingSection from '../../../components/hr/recruitment/jobPosting/JobPostingSection';

const JobPostingPage: React.FC = () => {
  const { reqId, planId } = useParams<{ reqId?: string; planId?: string }>();
  return <JobPostingSection reqId={reqId ?? ''} planId={planId ?? ''} />;
};

export default JobPostingPage;
