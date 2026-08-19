// src/modules/project/pages/projects/ProjectsList.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Pagination } from "@/shared/components/ui/pagination";
import { showToast } from "@/shared/layout/layout";
import { getProjects, deleteProject } from "../../services/project.api";
import { ProjectStatus } from "../../types"; // ✅ Import enum directly
import type { Project, ProjectFilterDto } from "../../types";
import { MoreHorizontal, Edit, Trash2, Eye, Plus, Search } from "lucide-react";

// ✅ Use the enum values directly
const statusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.Draft]: "bg-gray-200 text-gray-700",
  [ProjectStatus.Planning]: "bg-blue-200 text-blue-700",
  [ProjectStatus.InProgress]: "bg-green-200 text-green-700",
  [ProjectStatus.OnHold]: "bg-yellow-200 text-yellow-700",
  [ProjectStatus.Completed]: "bg-emerald-200 text-emerald-700",
  [ProjectStatus.Cancelled]: "bg-red-200 text-red-700",
  [ProjectStatus.Archived]: "bg-gray-300 text-gray-700",
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

export default function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilterDto>({
    page: 1,
    pageSize: 10,
    search: "",
    status: undefined,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProjects(filters);
      setProjects(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value ? parseInt(value) as ProjectStatus : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;

    try {
      await deleteProject(id, "System");
      showToast.success(`Project "${name}" deleted successfully`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast.error("Failed to delete project");
    }
  };

  return (
      <ModulePageShell
          title="Projects"
          subtitle={`${totalCount} projects found`}
          onRefresh={fetchProjects}
          action={
            <Button onClick={() => navigate("/project-management/projects/create")} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          }
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
              />
            </div>
          </div>
          <Select value={String(filters.status || "")} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setFilters({ page: 1, pageSize: 10, search: "", status: undefined })}>
            Reset
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading projects...
                    </TableCell>
                  </TableRow>
              ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No projects found. Create your first project!
                    </TableCell>
                  </TableRow>
              ) : (
                  projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.code}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[project.status]}>
                            {statusLabels[project.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{project.projectManagerName || "-"}</TableCell>
                        <TableCell>${project.budget.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                  className="h-full bg-emerald-500 rounded-full transition-all"
                                  style={{ width: `${project.completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                        {project.completionPercentage}%
                      </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/project-management/projects/${project.id}`)}>
                                <Eye className="w-4 h-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/project-management/projects/edit/${project.id}`)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(project.id, project.name)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={filters.pageSize}
            onPageChange={handlePageChange}
            itemLabel="projects"
        />
      </ModulePageShell>
  );
}