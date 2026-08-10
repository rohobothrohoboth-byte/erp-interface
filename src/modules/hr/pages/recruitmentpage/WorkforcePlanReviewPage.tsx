// src/pages/hr/recruitment/WorkforcePlanReviewPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import WorkforcePlanReviewSection from '@/modules/hr/components/recruitment/workforcePlan/WorkforcePlanReviewSection';

const WorkforcePlanReviewPage: React.FC = () => {
  const { planId = '' } = useParams<{ planId: string }>();
  return <WorkforcePlanReviewSection planId={planId} />;
};

export default WorkforcePlanReviewPage;