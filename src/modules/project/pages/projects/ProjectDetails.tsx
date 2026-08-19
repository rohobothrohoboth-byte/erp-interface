// src/modules/project/pages/projects/ProjectDetails.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { showToast } from "@/shared/layout/layout";
import { getProjectById, deleteProject } from "../../services/project.api";
import {  ProjectStatus, ProjectType } from "../../types";
import type{ Project } from "../../types";
import {
    ArrowLeft,
    Edit,
    Trash2,

    Users,
    ListTodo,
    Calendar,
    DollarSign,
    AlertTriangle,
    FileText,
    MessageSquare,
    Activity,
    Clock,

    XCircle,


    Printer,
    Share2,
} from "lucide-react";

// Import tab components
import { ProjectOverviewTab } from "../../components/tabs/ProjectOverviewTab";
import { ProjectTasksTab } from "../../components/tabs/ProjectTasksTab";
import { ProjectMilestonesTab } from "../../components/tabs/ProjectMilestonesTab";
import { ProjectResourcesTab } from "../../components/tabs/ProjectResourcesTab";
import { ProjectBudgetTab } from "../../components/tabs/ProjectBudgetTab";
/*import { ProjectRisksTab } from "../../components/tabs/ProjectRisksTab";
import { ProjectIssuesTab } from "../../components/tabs/ProjectIssuesTab";
import { ProjectDocumentsTab } from "../../components/tabs/ProjectDocumentsTab";
import { ProjectCommentsTab } from "../../components/tabs/ProjectCommentsTab";
import { ProjectActivityTab } from "../../components/tabs/ProjectActivityTab";*/

const statusColors: Record<ProjectStatus, string> = {
    [ProjectStatus.Draft]: "bg-gray-100 text-gray-700 border-gray-300",
    [ProjectStatus.Planning]: "bg-blue-100 text-blue-700 border-blue-300",
    [ProjectStatus.InProgress]: "bg-green-100 text-green-700 border-green-300",
    [ProjectStatus.OnHold]: "bg-yellow-100 text-yellow-700 border-yellow-300",
    [ProjectStatus.Completed]: "bg-emerald-100 text-emerald-700 border-emerald-300",
    [ProjectStatus.Cancelled]: "bg-red-100 text-red-700 border-red-300",
    [ProjectStatus.Archived]: "bg-gray-200 text-gray-700 border-gray-300",
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

const typeLabels: Record<ProjectType, string> = {
    [ProjectType.Internal]: "Internal",
    [ProjectType.External]: "External",
    [ProjectType.Research]: "Research",
    [ProjectType.Development]: "Development",
    [ProjectType.Maintenance]: "Maintenance",
    [ProjectType.Consulting]: "Consulting",
};

export default function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
    const [saving, setSaving] = useState(false);

    const fetchProject = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await getProjectById(id);
            setProject(response.data);
        } catch (error) {
            console.error("Error fetching project:", error);
            showToast.error("Failed to load project details");
            navigate("/project-management/projects");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && ["overview", "tasks", "milestones", "resources", "budget", "risks", "issues", "documents", "comments", "activity"].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setSearchParams({ tab: value });
    };

    const handleDelete = async () => {
        if (!project) return;
        if (!confirm(`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`)) return;

        setSaving(true);
        try {
            await deleteProject(project.id, "System");
            showToast.success(`Project "${project.name}" deleted successfully`);
            navigate("/project-management/projects");
        } catch (error) {
            console.error("Error deleting project:", error);
            showToast.error("Failed to delete project");
        } finally {
            setSaving(false);
        }
    };

    const handleRefresh = () => {
        fetchProject();
    };

    if (loading) {
        return (
            <ModulePageShell title="Project Details" subtitle="Loading project data...">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
            </ModulePageShell>
        );
    }

    if (!project) {
        return (
            <ModulePageShell title="Project Not Found" subtitle="The project you're looking for doesn't exist">
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500 mb-4">Project not found</p>
                    <Button onClick={() => navigate("/project-management/projects")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Button>
                </div>
            </ModulePageShell>
        );
    }

    return (
        <ModulePageShell
            title={
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/project-management/projects")}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <span className="truncate">{project.name}</span>
                    <Badge className={statusColors[project.status]}>
                        {statusLabels[project.status]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {project.code}
                    </Badge>
                </div>
            }
            subtitle={
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{typeLabels[project.type]}</span>
                    <span>•</span>
                    <span>{project.departmentName || "No Department"}</span>
                    <span>•</span>
                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Progress: {project.completionPercentage}%</span>
                </div>
            }
            onRefresh={handleRefresh}
            action={
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Handle share */}}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/project-management/projects/edit/${project.id}`)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={saving}
                    >
                        {saving ? (
                            "Deleting..."
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            }
        >
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Project Progress</span>
                    <span className="text-sm font-medium text-gray-700">{project.completionPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${project.completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <Activity className="w-4 h-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <ListTodo className="w-4 h-4 mr-2" />
                        Tasks ({project.taskCount || 0})
                    </TabsTrigger>
                    <TabsTrigger value="milestones" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Milestones ({project.milestoneCount || 0})
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <Users className="w-4 h-4 mr-2" />
                        Resources ({project.resourceCount || 0})
                    </TabsTrigger>
                    <TabsTrigger value="budget" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Budget
                    </TabsTrigger>
                    <TabsTrigger value="risks" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Risks
                    </TabsTrigger>
                    <TabsTrigger value="issues" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <XCircle className="w-4 h-4 mr-2" />
                        Issues
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <FileText className="w-4 h-4 mr-2" />
                        Documents
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comments
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <Clock className="w-4 h-4 mr-2" />
                        Activity
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <ProjectOverviewTab project={project} onRefresh={handleRefresh} />
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4">
                    <ProjectTasksTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                    <ProjectMilestonesTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                    <ProjectResourcesTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="budget" className="space-y-4">
                    <ProjectBudgetTab projectId={project.id} />
                </TabsContent>

               {/* <TabsContent value="risks" className="space-y-4">
                    <ProjectRisksTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                    <ProjectIssuesTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <ProjectDocumentsTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                    <ProjectCommentsTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    <ProjectActivityTab projectId={project.id} />
                </TabsContent>*/}
            </Tabs>
        </ModulePageShell>
    );
}