// src/modules/project/pages/projects/EditProject.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { showToast } from "@/shared/layout/layout";
import { getProjectById, updateProject } from "../../services/project.api";
import { Project, ProjectStatus, ProjectType } from "../../types/project.types";

const statusOptions = [
    { value: "1", label: "Draft" },
    { value: "2", label: "Planning" },
    { value: "3", label: "In Progress" },
    { value: "4", label: "On Hold" },
    { value: "5", label: "Completed" },
    { value: "6", label: "Cancelled" },
    { value: "7", label: "Archived" },
];

const projectTypes = [
    { value: "1", label: "Internal" },
    { value: "2", label: "External" },
    { value: "3", label: "Research" },
    { value: "4", label: "Development" },
    { value: "5", label: "Maintenance" },
    { value: "6", label: "Consulting" },
];

const priorityOptions = [
    { value: "1", label: "Low" },
    { value: "2", label: "Medium" },
    { value: "3", label: "High" },
    { value: "4", label: "Urgent" },
    { value: "5", label: "Critical" },
];

export default function EditProject() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: "",
        description: "",
        type: "",
        status: "",
        startDate: "",
        endDate: "",
        budget: "",
        projectManagerName: "",
        departmentName: "",
        priority: "",
        tags: "",
    });

    useEffect(() => {
        if (id) {
            fetchProject(id);
        }
    }, [id]);

    const fetchProject = async (projectId: string) => {
        try {
            const response = await getProjectById(projectId);
            const data = response.data;
            setFormData({
                name: data.name || "",
                description: data.description || "",
                type: String(data.type || ""),
                status: String(data.status || ""),
                startDate: data.startDate ? data.startDate.split("T")[0] : "",
                endDate: data.endDate ? data.endDate.split("T")[0] : "",
                budget: String(data.budget || ""),
                projectManagerName: data.projectManagerName || "",
                departmentName: data.departmentName || "",
                priority: String(data.priority || 1),
                tags: data.tags || "",
                rowVersion: data.rowVersion || "",
            });
        } catch (error) {
            console.error("Error fetching project:", error);
            showToast.error("Failed to load project data");
            navigate("/project-management/projects");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: string | number) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        try {
            const payload = {
                id: id,
                name: formData.name,
                description: formData.description,
                type: parseInt(formData.type),
                status: parseInt(formData.status),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                budget: parseFloat(formData.budget),
                projectManagerName: formData.projectManagerName,
                departmentName: formData.departmentName,
                priority: parseInt(formData.priority),
                tags: formData.tags,
                rowVersion: formData.rowVersion,
                updatedBy: "System",
            };

            await updateProject(payload);
            showToast.success(`Project "${formData.name}" updated successfully!`);
            navigate("/project-management/projects");
        } catch (error: any) {
            console.error("Error updating project:", error);
            showToast.error(error.response?.data?.message || "Failed to update project");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ModulePageShell title="Edit Project" subtitle="Loading project data...">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
            </ModulePageShell>
        );
    }

    return (
        <ModulePageShell
            title="Edit Project"
            subtitle={`Editing: ${formData.name}`}
            onRefresh={() => navigate(-1)}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="required">Project Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                            disabled={saving}
                        />
                    </div>

                    {/* Project Type */}
                    <div className="space-y-1.5">
                        <Label htmlFor="type" className="required">Project Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => handleChange("type", value)}
                            disabled={saving}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {projectTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <Label htmlFor="status" className="required">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleChange("status", value)}
                            disabled={saving}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1.5">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                            value={String(formData.priority)}
                            onValueChange={(value) => handleChange("priority", value)}
                            disabled={saving}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                {priorityOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="startDate" className="required">Start Date</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                            required
                            disabled={saving}
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    {/* Budget */}
                    <div className="space-y-1.5">
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                            id="budget"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.budget}
                            onChange={(e) => handleChange("budget", e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    {/* Project Manager */}
                    <div className="space-y-1.5">
                        <Label htmlFor="projectManagerName">Project Manager</Label>
                        <Input
                            id="projectManagerName"
                            value={formData.projectManagerName}
                            onChange={(e) => handleChange("projectManagerName", e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    {/* Department */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="departmentName">Department</Label>
                        <Input
                            id="departmentName"
                            value={formData.departmentName}
                            onChange={(e) => handleChange("departmentName", e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            placeholder="Enter tags separated by commas"
                            onChange={(e) => handleChange("tags", e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            placeholder="Enter project description"
                            rows={4}
                            onChange={(e) => handleChange("description", e.target.value)}
                            disabled={saving}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                        {saving ? "Saving..." : "Update Project"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
                        Cancel
                    </Button>
                </div>
            </form>
        </ModulePageShell>
    );
}