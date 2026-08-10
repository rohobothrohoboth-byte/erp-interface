// src/components/ui/tooltip.tsx (Simple version without Radix UI)

import React, { useState } from 'react';

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    delay?: number;
}

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ children }) => {
    return <>{children}</>;
};

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
};

export const Tooltip: React.FC<TooltipProps> = ({ children, content, delay = 200 }) => {
    const [show, setShow] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => setShow(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setShow(false);
    };

    return (
        <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {children}
            {show && (
                <div className="absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2">
                    {content}
                </div>
            )}
        </div>
    );
};