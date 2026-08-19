// src/modules/project/components/tabs/ProjectBudgetTab.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { getBudgetsByProject, getBudgetSummary } from "../../services/project.api";
import type{ ProjectBudget, BudgetSummaryDto } from "../../types";
import { DollarSign, TrendingUp, TrendingDown, Plus } from "lucide-react";

interface ProjectBudgetTabProps {
    projectId: string;
}

export function ProjectBudgetTab({ projectId }: ProjectBudgetTabProps) {
    const [budgets, setBudgets] = useState<ProjectBudget[]>([]);
    const [summary, setSummary] = useState<BudgetSummaryDto | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [budgetsRes, summaryRes] = await Promise.all([
                getBudgetsByProject(projectId),
                getBudgetSummary(projectId),
            ]);
            setBudgets(budgetsRes.data || []);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error("Error fetching budget data:", error);
            showToast.error("Failed to load budget data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading budget data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Total Budget</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    ${summary?.totalBudget.toLocaleString() || 0}
                                </p>
                            </div>
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Actual Spend</p>
                                <p className="text-xl font-bold text-blue-600">
                                    ${summary?.totalActual.toLocaleString() || 0}
                                </p>
                            </div>
                            <TrendingDown className="w-5 h-5 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Remaining</p>
                                <p className="text-xl font-bold text-purple-600">
                                    ${summary?.totalRemaining.toLocaleString() || 0}
                                </p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Utilization</p>
                                <p className="text-xl font-bold text-orange-600">
                                    {summary?.utilizationPercentage.toFixed(1) || 0}%
                                </p>
                            </div>
                            <Progress value={summary?.utilizationPercentage || 0} className="h-2 w-16" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Budget by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    {budgets.length === 0 ? (
                        <p className="text-gray-500 text-sm">No budget entries yet</p>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map((budget) => {
                                const utilization = budget.plannedAmount > 0
                                    ? (budget.actualAmount / budget.plannedAmount) * 100
                                    : 0;
                                return (
                                    <div key={budget.id} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{budget.categoryName}</span>
                                            <span>
                        ${budget.actualAmount.toLocaleString()} / ${budget.plannedAmount.toLocaleString()}
                                                <span className="text-gray-500 ml-2">({utilization.toFixed(1)}%)</span>
                      </span>
                                        </div>
                                        <Progress
                                            value={Math.min(utilization, 100)}
                                            className={`h-2 ${utilization > 90 ? "bg-red-100" : utilization > 70 ? "bg-yellow-100" : "bg-emerald-100"}`}
                                        />
                                        {budget.remainingAmount > 0 && (
                                            <p className="text-xs text-gray-500">Remaining: ${budget.remainingAmount.toLocaleString()}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button variant="outline" onClick={() => {/* Navigate to budget management */}}>
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Budget
                </Button>
            </div>
        </div>
    );
}