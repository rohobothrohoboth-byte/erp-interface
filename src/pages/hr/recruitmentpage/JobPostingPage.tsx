import React from 'react';
import { useParams } from 'react-router-dom';
import JobPostingSection from '../../../components/hr/recruitment/jobPosting/JobPostingSection';

const JobPostingPage: React.FC = () => {
  const { reqId = '' } = useParams<{ reqId: string }>();
  return <JobPostingSection reqId={reqId} />;
};

export default JobPostingPage;
