// src/modules/project/components/tabs/ProjectResourcesTab.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { getResourcesByProject, releaseResource } from "../../services/project.api";
import {  ResourceAllocationStatus } from "../../types";
import type{ ProjectResource } from "../../types";
import { Users, User, Clock, DollarSign, Plus, Trash2 } from "lucide-react";

interface ProjectResourcesTabProps {
    projectId: string;
}

const statusLabels: Record<ResourceAllocationStatus, string> = {
    [ResourceAllocationStatus.Planned]: "Planned",
    [ResourceAllocationStatus.Allocated]: "Allocated",
    [ResourceAllocationStatus.InUse]: "In Use",
    [ResourceAllocationStatus.Released]: "Released",
    [ResourceAllocationStatus.Completed]: "Completed",
};

const statusColors: Record<ResourceAllocationStatus, string> = {
    [ResourceAllocationStatus.Planned]: "bg-gray-200 text-gray-700",
    [ResourceAllocationStatus.Allocated]: "bg-blue-200 text-blue-700",
    [ResourceAllocationStatus.InUse]: "bg-emerald-200 text-emerald-700",
    [ResourceAllocationStatus.Released]: "bg-gray-300 text-gray-700",
    [ResourceAllocationStatus.Completed]: "bg-purple-200 text-purple-700",
};

export function ProjectResourcesTab({ projectId }: ProjectResourcesTabProps) {
    const [resources, setResources] = useState<ProjectResource[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await getResourcesByProject(projectId);
            setResources(response.data || []);
        } catch (error) {
            console.error("Error fetching resources:", error);
            showToast.error("Failed to load resources");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [projectId]);

    const handleRelease = async (id: string) => {
        if (!confirm("Are you sure you want to release this resource?")) return;
        try {
            await releaseResource(id, { releasedBy: "System", notes: "Released" });
            showToast.success("Resource released successfully");
            fetchResources();
        } catch (error) {
            showToast.error("Failed to release resource");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{resources.length} resources allocated</p>
                <Button onClick={() => {/* Navigate to allocate resource */}}>
                    <Plus className="w-4 h-4 mr-2" />
                    Allocate Resource
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading resources...</div>
            ) : resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No resources allocated yet</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((resource) => (
                        <Card key={resource.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        {resource.type === 1 ? (
                                            <User className="w-5 h-5 text-blue-500 mt-0.5" />
                                        ) : (
                                            <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                                        )}
                                        <div>
                                            <h4 className="font-medium">{resource.resourceName}</h4>
                                            <p className="text-xs text-gray-500">
                                                {resource.type === 1 ? "Human" : "Equipment"} • {resource.department}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <Badge className={statusColors[resource.status]}>
                                                    {statusLabels[resource.status]}
                                                </Badge>
                                                {resource.skills && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {resource.skills}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                            {new Date(resource.startDate).toLocaleDateString()}
                        </span>
                                                {resource.endDate && (
                                                    <span>
                            → {new Date(resource.endDate).toLocaleDateString()}
                          </span>
                                                )}
                                                <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${resource.costPerUnit}/unit
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                    {resource.status !== ResourceAllocationStatus.Released && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700"
                                            onClick={() => handleRelease(resource.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}