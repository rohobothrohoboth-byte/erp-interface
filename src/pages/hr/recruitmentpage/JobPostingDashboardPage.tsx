// src/pages/hr/recruitment/JobPostingDashboardPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import JobPostingDashboard from '../../../components/hr/recruitment/jobPosting/dashboard/JobPostingDashboard';

const JobPostingDashboardPage: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    return <JobPostingDashboard postId={postId || ''} />;
};

export default JobPostingDashboardPage;