// components/finance/SkeletonWidget.tsx

import React from 'react';

interface SkeletonWidgetProps {
    className?: string;
}

export const SkeletonWidget: React.FC<SkeletonWidgetProps> = ({ className = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md p-4 border-2 border-gray-100 ${className}`}>
            <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
};

export const SkeletonKPI: React.FC = () => {
    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
            <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    );
};

export const SkeletonDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="animate-pulse flex gap-2">
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
            </div>

            {/* Filter skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* KPI skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="animate-pulse bg-white rounded-xl border-2 border-gray-200 p-4 h-24" />
                ))}
            </div>

            {/* Widgets skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <SkeletonWidget key={i} />
                ))}
            </div>
        </div>
    );
};