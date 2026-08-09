// src/pages/hr/recruitment/JobRequisitionReviewPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import JobRequisitionReviewSection from '../../../components/hr/recruitment/jobRequisition/JobRequisitionReviewSection';

const JobRequisitionReviewPage: React.FC = () => {
  const { reqId = '' } = useParams<{ reqId: string }>();
  return <JobRequisitionReviewSection reqId={reqId} />;
};

export default JobRequisitionReviewPage;