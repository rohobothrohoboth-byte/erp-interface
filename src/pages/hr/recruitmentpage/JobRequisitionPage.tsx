import React from 'react';
import { useParams } from 'react-router-dom';
import JobRequisitionSection from '../../../components/hr/recruitment/jobRequisition/JobRequisitionSection';

const JobRequisitionPage: React.FC = () => {
  const { planId = '' } = useParams<{ planId: string }>();
  return <JobRequisitionSection workforcePlanId={planId} />;
};

export default JobRequisitionPage;
