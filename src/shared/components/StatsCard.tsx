// src/shared/components/StatsCard.tsx
import type{ ReactNode } from "react";
import { Card, CardContent } from "@/shared/components/ui/card.tsx";
import { cn } from "@/shared/lib/utils.ts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    description?: string;
    change?: string | number;
    changeType?: "increase" | "decrease" | "neutral";
    className?: string;
}

export function StatsCard({
                              title,
                              value,
                              icon,
                              description,
                              change,
                              changeType = "neutral",
                              className,
                          }: StatsCardProps) {
    const changeIcon = {
        increase: <TrendingUp className="w-3 h-3 text-emerald-500" />,
        decrease: <TrendingDown className="w-3 h-3 text-red-500" />,
        neutral: <Minus className="w-3 h-3 text-gray-400" />,
    };

    const changeColor = {
        increase: "text-emerald-600 bg-emerald-50",
        decrease: "text-red-600 bg-red-50",
        neutral: "text-gray-500 bg-gray-50",
    };

    return (
        <Card className={cn("hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {description && (
                            <p className="text-xs text-gray-400 mt-1">{description}</p>
                        )}
                    </div>
                    {icon && (
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            {icon}
                        </div>
                    )}
                </div>
                {change && (
                    <div className={cn(
                        "flex items-center gap-1 mt-3 px-2 py-1 rounded-full text-xs font-medium w-fit",
                        changeColor[changeType]
                    )}>
                        {changeIcon[changeType]}
                        <span>{change}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}