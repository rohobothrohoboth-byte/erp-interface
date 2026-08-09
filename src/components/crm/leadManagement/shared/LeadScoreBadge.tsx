// src/components/crm/leadManagement/shared/LeadScoreBadge.tsx

import React from 'react';
import { Badge } from '../../../ui/badge';

interface LeadScoreBadgeProps {
    score: number;
}

const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({ score }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
        if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Hot';
        if (score >= 50) return 'Warm';
        return 'Cold';
    };

    return (
        <Badge variant="outline" className={getScoreColor(score)}>
            {score} ({getScoreLabel(score)})
        </Badge>
    );
};

export default LeadScoreBadge;