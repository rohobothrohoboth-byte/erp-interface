// src/components/crm/leadManagement/shared/LeadStatusBadge.tsx

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';

interface LeadStatusBadgeProps {
    status: string | number | undefined;
}

// ✅ Correct status mapping based on backend enum
const STATUS_MAP: Record<number, string> = {
    1: 'New',
    2: 'Contacted',
    3: 'Qualified',
    4: 'Proposal',
    5: 'Negotiation',
    6: 'Converted',
    7: 'Lost',
    8: 'Archived',
};

// ✅ Helper: Get status as string
const getStatusString = (status: any): string => {
    if (!status) return 'New';
    if (typeof status === 'string') {
        const num = parseInt(status);
        if (!isNaN(num) && num in STATUS_MAP) return STATUS_MAP[num];
        return status;
    }
    if (typeof status === 'number') {
        return STATUS_MAP[status] || 'New';
    }
    return String(status);
};

const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status }) => {
    const statusStr = getStatusString(status);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'New': 'bg-blue-100 text-blue-700 border-blue-200',
            'Contacted': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Qualified': 'bg-green-100 text-green-700 border-green-200',
            'Proposal': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Negotiation': 'bg-pink-100 text-pink-700 border-pink-200',
            'Converted': 'bg-purple-100 text-purple-700 border-purple-200',
            'Lost': 'bg-red-100 text-red-700 border-red-200',
            'Archived': 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <Badge variant="outline" className={getStatusColor(statusStr)}>
            {statusStr}
        </Badge>
    );
};

export default LeadStatusBadge;