// src/components/hr/Leave/FiscalYearSelector.tsx
import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import type { FiscalYear } from '../../../types/hr/leave/leaveye';  // Changed to type-only import

interface Props {
    fiscalYears: FiscalYear[];
    selectedYear: FiscalYear | null;
    onYearChange: (year: FiscalYear) => void;
    hasProcessedData: boolean;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString();
    } catch {
        return 'Invalid Date';
    }
};

export const FiscalYearSelector: React.FC<Props> = ({ fiscalYears, selectedYear, onYearChange, hasProcessedData }) => {
    if (fiscalYears.length === 0) return null;

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <label className="text-sm font-medium text-gray-700">Select Fiscal Year:</label>
                    <select
                        value={selectedYear?.id || ''}
                        onChange={(e) => {
                            const year = fiscalYears.find(y => y.id === e.target.value);
                            if (year) onYearChange(year);
                        }}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        {fiscalYears.map(year => (
                            <option key={year.id} value={year.id}>
                                {year.name} ({formatDate(year.startDate)} - {formatDate(year.endDate)})
                            </option>
                        ))}
                    </select>
                    {selectedYear && (
                        <Badge variant={hasProcessedData ? "default" : "secondary"}>
                            {hasProcessedData ? "✓ Year End Processed" : "Not Processed"}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};