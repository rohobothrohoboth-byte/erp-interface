// src/components/crm/salesManagement/components/SalesPipeline.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export interface PipelineStage {
    name: string;
    count: number;
    value: number;
    probability: number;
    color?: string;
}

interface SalesPipelineProps {
    stages: PipelineStage[];
    totalValue?: number;
    className?: string;
}

export const SalesPipeline: React.FC<SalesPipelineProps> = ({
                                                                stages,
                                                                totalValue,
                                                                className = '',
                                                            }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const total = totalValue || stages.reduce((sum, s) => sum + s.value, 0);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Sales Pipeline</CardTitle>
                {total > 0 && (
                    <p className="text-sm text-gray-500">
                        Total Pipeline Value: {formatCurrency(total)}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {stages.map((stage, index) => {
                        const percentage = total > 0 ? (stage.value / total) * 100 : 0;
                        const colors = [
                            'bg-blue-500',
                            'bg-cyan-500',
                            'bg-purple-500',
                            'bg-orange-500',
                            'bg-green-500',
                            'bg-red-500',
                        ];
                        const bgColor = stage.color || colors[index % colors.length];

                        return (
                            <div key={index}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            {stage.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({stage.count} deals)
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatCurrency(stage.value)}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {stage.probability}% prob.
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`${bgColor} rounded-full h-2 transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};