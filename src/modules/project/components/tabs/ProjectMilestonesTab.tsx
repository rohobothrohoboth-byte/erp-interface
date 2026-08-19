// src/modules/project/components/tabs/ProjectMilestonesTab.tsx
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { showToast } from "@/shared/layout/layout";
import { getMilestonesByProject, completeMilestone, deleteMilestone } from "../../services/project.api";
import type{ ProjectMilestone } from "../../types";
import { Plus, CheckCircle2, XCircle, Trash2, Calendar } from "lucide-react";

interface ProjectMilestonesTabProps {
    projectId: string;
}

export function ProjectMilestonesTab({ projectId }: ProjectMilestonesTabProps) {
    const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMilestones = async () => {
        setLoading(true);
        try {
            const response = await getMilestonesByProject(projectId);
            setMilestones(response.data || []);
        } catch (error) {
            console.error("Error fetching milestones:", error);
            showToast.error("Failed to load milestones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMilestones();
    }, [projectId]);

    const handleComplete = async (id: string, isCompleted: boolean) => {
        try {
            await completeMilestone(id, { completedBy: "System", notes: isCompleted ? "Marked as complete" : "Reopened" });
            showToast.success(`Milestone ${isCompleted ? "completed" : "reopened"} successfully`);
            fetchMilestones();
        } catch (error) {
            showToast.error("Failed to update milestone");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this milestone?")) return;
        try {
            await deleteMilestone(id, "System");
            showToast.success("Milestone deleted successfully");
            fetchMilestones();
        } catch (error) {
            showToast.error("Failed to delete milestone");
        }
    };

    const getStatusColor = (milestone: ProjectMilestone) => {
        if (milestone.isCompleted) return "bg-emerald-100 text-emerald-700";
        if (new Date(milestone.dueDate) < new Date()) return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700";
    };

    const getStatusLabel = (milestone: ProjectMilestone) => {
        if (milestone.isCompleted) return "Completed";
        if (new Date(milestone.dueDate) < new Date()) return "Overdue";
        return "In Progress";
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{milestones.length} milestones</p>
                <Button onClick={() => {/* Navigate to create milestone */}}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading milestones...</div>
            ) : milestones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No milestones yet</div>
            ) : (
                <div className="space-y-3">
                    {milestones.map((milestone) => (
                        <Card key={milestone.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{milestone.title}</h4>
                                            <Badge className={getStatusColor(milestone)}>
                                                {getStatusLabel(milestone)}
                                            </Badge>
                                        </div>
                                        {milestone.description && (
                                            <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                                            {milestone.phaseName && (
                                                <span className="flex items-center gap-1">
                          Phase: {milestone.phaseName}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24">
                                            <Progress value={milestone.completionPercentage} className="h-2" />
                                            <span className="text-xs text-gray-500">{milestone.completionPercentage}%</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleComplete(milestone.id, !milestone.isCompleted)}
                                            >
                                                {milestone.isCompleted ? (
                                                    <XCircle className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                                onClick={() => handleDelete(milestone.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}