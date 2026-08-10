// src/components/crm/leadManagement/shared/LeadPriorityBadge.tsx

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';

interface LeadPriorityBadgeProps {
    priority: string | number | undefined;
}

// ✅ Correct priority mapping
const PRIORITY_MAP: Record<number, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
};

// ✅ Helper: Get priority as string
const getPriorityString = (priority: any): string => {
    if (!priority) return 'Medium';
    if (typeof priority === 'string') {
        const num = parseInt(priority);
        if (!isNaN(num) && num in PRIORITY_MAP) return PRIORITY_MAP[num];
        return priority;
    }
    if (typeof priority === 'number') {
        return PRIORITY_MAP[priority] || 'Medium';
    }
    return String(priority);
};

const LeadPriorityBadge: React.FC<LeadPriorityBadgeProps> = ({ priority }) => {
    const priorityStr = getPriorityString(priority);

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            'Low': 'bg-blue-100 text-blue-700 border-blue-200',
            'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'High': 'bg-orange-100 text-orange-700 border-orange-200',
            'Urgent': 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <Badge variant="outline" className={getPriorityColor(priorityStr)}>
            {priorityStr}
        </Badge>
    );
};

export default LeadPriorityBadge;