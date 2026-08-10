// src/pages/hr/recruitment/JobRequisitionPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import JobRequisitionSection from '@/modules/hr/components/recruitment/jobRequisition/JobRequisitionSection';

const JobRequisitionPage: React.FC = () => {
  const { planId = '' } = useParams<{ planId: string }>();
  return <JobRequisitionSection workforcePlanId={planId} />;
};

export default JobRequisitionPage;