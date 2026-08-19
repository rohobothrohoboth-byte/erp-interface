// src/components/hr/Leave/SummaryCards.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
interface Props {
    fiscalYearName: string;
    totalRemaining: number;
    totalCarryover: number;
    totalLost: number;
}

export const SummaryCards: React.FC<Props> = ({ fiscalYearName, totalRemaining, totalCarryover, totalLost }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-blue-400">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Fiscal Year</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <span className="text-2xl font-bold">{fiscalYearName}</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-yellow-400">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Remaining</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{totalRemaining.toFixed(2)} days</div>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-green-400">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Will Carry Over</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-2xl font-bold text-green-600">{totalCarryover.toFixed(2)} days</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-red-400">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Will be Lost</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        <span className="text-2xl font-bold text-red-600">{totalLost.toFixed(2)} days</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};