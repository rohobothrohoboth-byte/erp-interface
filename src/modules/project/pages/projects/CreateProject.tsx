// src/modules/project/pages/projects/CreateProject.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { showToast } from "@/shared/layout/layout";
import { projectApi, createProject } from "../../services/project.api";
import { ProjectType, ProjectCreateDto } from "../../types/project.types";

interface ProjectFormData {
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  budget: string;
  projectManagerName: string;
  departmentName: string;
  priority: number;
  tags: string;
}

const initialFormData: ProjectFormData = {
  name: "",
  description: "",
  type: "",
  startDate: "",
  endDate: "",
  budget: "",
  projectManagerName: "",
  departmentName: "",
  priority: 1,
  tags: "",
};

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

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  const handleChange = (key: keyof ProjectFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    if (!formData.type) {
      newErrors.type = "Project type is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }
    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = "Budget must be greater than or equal to 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const payload: ProjectCreateDto = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: parseInt(formData.type) as ProjectType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        projectManagerName: formData.projectManagerName.trim() || undefined,
        departmentName: formData.departmentName.trim() || undefined,
        priority: formData.priority,
        tags: formData.tags.trim() || undefined,
      };

      const response = await createProject(payload);

      if (response.status === 201 || response.status === 200) {
        showToast.success(`Project "${response.data.name}" created successfully!`);
        navigate("/project-management/projects");
      } else {
        showToast.error("Failed to create project. Please try again.");
      }
    } catch (error: any) {
      console.error("Create project error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create project";
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <ModulePageShell
          title="Create Project"
          subtitle="Fill in the project details to create a new project"
          onRefresh={() => navigate(-1)}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="required">
                Project Name
              </Label>
              <Input
                  id="name"
                  value={formData.name}
                  placeholder="Enter project name"
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={loading}
                  required
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Project Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="required">
                Project Type
              </Label>
              <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                  disabled={loading}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
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
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="required">
                Start Date
              </Label>
              <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className={errors.startDate ? "border-red-500" : ""}
                  disabled={loading}
                  required
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className={errors.endDate ? "border-red-500" : ""}
                  disabled={loading}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
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
                  placeholder="Enter budget amount"
                  onChange={(e) => handleChange("budget", e.target.value)}
                  className={errors.budget ? "border-red-500" : ""}
                  disabled={loading}
              />
              {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select
                  value={String(formData.priority)}
                  onValueChange={(value) => handleChange("priority", parseInt(value))}
                  disabled={loading}
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

            {/* Project Manager */}
            <div className="space-y-1.5">
              <Label htmlFor="projectManagerName">Project Manager</Label>
              <Input
                  id="projectManagerName"
                  value={formData.projectManagerName}
                  placeholder="Enter project manager name"
                  onChange={(e) => handleChange("projectManagerName", e.target.value)}
                  disabled={loading}
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label htmlFor="departmentName">Department</Label>
              <Input
                  id="departmentName"
                  value={formData.departmentName}
                  placeholder="Enter department name"
                  onChange={(e) => handleChange("departmentName", e.target.value)}
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </ModulePageShell>
  );
}