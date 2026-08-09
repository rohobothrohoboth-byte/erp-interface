// src/components/ui/skeleton.tsx

import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    variant?: 'default' | 'circle' | 'text' | 'card';
    children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
                                                      className = '',
                                                      variant = 'default',
                                                      children,
                                                      ...props
                                                  }) => {
    const baseClasses = 'animate-pulse bg-gray-200 rounded-md';

    const variantClasses = {
        default: '',
        circle: 'rounded-full',
        text: 'rounded h-4',
        card: 'rounded-xl',
    };

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Skeleton;