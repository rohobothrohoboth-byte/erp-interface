// src/shared/components/ModulePageShell.tsx
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Search, Plus, RefreshCw } from "lucide-react";

type Stat = {
    label: string;
    value: string | number;
    hint?: string;
};

type ModulePageShellProps = {
    title: string | ReactNode;
    subtitle: string | ReactNode;
    stats?: Stat[];
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    onRefresh?: () => void;
    primaryActionLabel?: string | ReactNode;
    onPrimaryAction?: () => void;
    filters?: ReactNode;
    action?: ReactNode;  // ✅ ADD THIS
    children: ReactNode;
};

export function ModulePageShell({
                                    title,
                                    subtitle,
                                    stats = [],
                                    searchPlaceholder = "Search...",
                                    searchValue,
                                    onSearchChange,
                                    onRefresh,
                                    primaryActionLabel,
                                    onPrimaryAction,
                                    filters,
                                    action,  // ✅ ADD THIS
                                    children,
                                }: ModulePageShellProps) {
    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    {action && action}
                    {onRefresh && (
                        <Button variant="outline" size="sm" onClick={onRefresh}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    )}
                    {primaryActionLabel && onPrimaryAction && (
                        <Button onClick={onPrimaryAction} className="bg-emerald-600 hover:bg-emerald-700">
                            {typeof primaryActionLabel === "string" ? (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {primaryActionLabel}
                                </>
                            ) : (
                                primaryActionLabel
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            {stats.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-slate-200 shadow-none">
                            <CardContent className="p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</div>
                                <div className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</div>
                                {stat.hint && <div className="mt-1 text-xs text-slate-400">{stat.hint}</div>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <Card className="border-slate-200 shadow-none">
                <CardContent className="space-y-4 p-4">
                    {/* Search & Filters */}
                    {(onSearchChange || filters) && (
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            {onSearchChange && (
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={searchValue || ""}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        placeholder={searchPlaceholder}
                                        className="pl-9"
                                    />
                                </div>
                            )}
                            {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
                        </div>
                    )}
                    {/* Children */}
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}

export function StatusBadge({
                                status,
                                tone = "neutral",
                            }: {
    status: string;
    tone?: "success" | "warning" | "danger" | "neutral" | "info" | "primary";
}) {
    const tones: Record<string, string> = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-rose-50 text-rose-700 border-rose-200",
        info: "bg-sky-50 text-sky-700 border-sky-200",
        primary: "bg-blue-50 text-blue-700 border-blue-200",
        neutral: "bg-slate-50 text-slate-700 border-slate-200",
    };

    return (
        <Badge variant="outline" className={tones[tone] || tones.neutral}>
            {status}
        </Badge>
    );
}