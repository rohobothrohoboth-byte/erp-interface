// src/modules/project/components/tabs/ProjectOverviewTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Project, ProjectStatus, ProjectType } from "../../types/project.types";
import {
    Calendar,
    User,
    Building2,
    DollarSign,
    Tag,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

interface ProjectOverviewTabProps {
    project: Project;
    onRefresh: () => void;
}

const statusColors: Record<ProjectStatus, string> = {
    [ProjectStatus.Draft]: "bg-gray-100 text-gray-700",
    [ProjectStatus.Planning]: "bg-blue-100 text-blue-700",
    [ProjectStatus.InProgress]: "bg-green-100 text-green-700",
    [ProjectStatus.OnHold]: "bg-yellow-100 text-yellow-700",
    [ProjectStatus.Completed]: "bg-emerald-100 text-emerald-700",
    [ProjectStatus.Cancelled]: "bg-red-100 text-red-700",
    [ProjectStatus.Archived]: "bg-gray-200 text-gray-700",
};

const statusLabels: Record<ProjectStatus, string> = {
    [ProjectStatus.Draft]: "Draft",
    [ProjectStatus.Planning]: "Planning",
    [ProjectStatus.InProgress]: "In Progress",
    [ProjectStatus.OnHold]: "On Hold",
    [ProjectStatus.Completed]: "Completed",
    [ProjectStatus.Cancelled]: "Cancelled",
    [ProjectStatus.Archived]: "Archived",
};

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
    const infoItems = [
        {
            label: "Project Code",
            value: project.code,
            icon: <Tag className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "Status",
            value: (
                <Badge className={statusColors[project.status]}>
                    {statusLabels[project.status]}
                </Badge>
            ),
            icon: <AlertCircle className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "Type",
            value: project.type,
            icon: <Tag className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "Project Manager",
            value: project.projectManagerName || "Not Assigned",
            icon: <User className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "Department",
            value: project.departmentName || "Not Assigned",
            icon: <Building2 className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "Budget",
            value: `$${project.budget.toLocaleString()}`,
            icon: <DollarSign className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "Start Date",
            value: new Date(project.startDate).toLocaleDateString(),
            icon: <Calendar className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "End Date",
            value: project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not Set",
            icon: <Calendar className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "Created",
            value: new Date(project.createdAt).toLocaleString(),
            icon: <Clock className="w-4 h-4 text-gray-400" />,
        },
        {
            label: "Last Updated",
            value: project.updatedAt ? new Date(project.updatedAt).toLocaleString() : "Never",
            icon: <Clock className="w-4 h-4 text-gray-400" />,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 whitespace-pre-wrap">
                        {project.description || "No description provided."}
                    </p>
                    {project.tags && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {project.tags.split(",").map((tag) => (
                                <Badge key={tag.trim()} variant="secondary" className="text-xs">
                                    {tag.trim()}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Project Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infoItems.map((item) => (
                    <Card key={item.label} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">{item.icon}</div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">{item.label}</p>
                                    <p className="text-sm font-medium mt-0.5">{item.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{project.taskCount || 0}</p>
                        <p className="text-xs text-gray-500">Total Tasks</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{project.milestoneCount || 0}</p>
                        <p className="text-xs text-gray-500">Milestones</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{project.resourceCount || 0}</p>
                        <p className="text-xs text-gray-500">Resources</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{project.completionPercentage}%</p>
                        <p className="text-xs text-gray-500">Completion</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}