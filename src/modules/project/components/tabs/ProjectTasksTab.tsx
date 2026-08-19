// src/modules/project/components/tabs/ProjectTasksTab.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { showToast } from "@/shared/layout/layout";
import { getTasksByProject, deleteTask, updateTaskStatus } from "../../services/project.api";
import type{  ProjectTask } from "../../types";
import {  TaskStatus,TaskPriority } from "../../types";

import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

interface ProjectTasksTabProps {
    projectId: string;
}

const statusLabels: Record<TaskStatus, string> = {
    [TaskStatus.NotStarted]: "Not Started",
    [TaskStatus.InProgress]: "In Progress",
    [TaskStatus.Blocked]: "Blocked",
    [TaskStatus.UnderReview]: "Under Review",
    [TaskStatus.Completed]: "Completed",
    [TaskStatus.Cancelled]: "Cancelled",
};

const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.NotStarted]: "bg-gray-200 text-gray-700",
    [TaskStatus.InProgress]: "bg-blue-200 text-blue-700",
    [TaskStatus.Blocked]: "bg-red-200 text-red-700",
    [TaskStatus.UnderReview]: "bg-purple-200 text-purple-700",
    [TaskStatus.Completed]: "bg-emerald-200 text-emerald-700",
    [TaskStatus.Cancelled]: "bg-gray-300 text-gray-700",
};

const priorityLabels: Record<TaskPriority, string> = {
    [TaskPriority.Low]: "Low",
    [TaskPriority.Medium]: "Medium",
    [TaskPriority.High]: "High",
    [TaskPriority.Urgent]: "Urgent",
    [TaskPriority.Critical]: "Critical",
};

export function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await getTasksByProject(projectId, {
                page: 1,
                pageSize: 50,
                search: search || undefined,
                status: statusFilter ? parseInt(statusFilter) as TaskStatus : undefined,
            });
            setTasks(response.data.items || []);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            showToast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [projectId, search, statusFilter]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(id, "System");
            showToast.success("Task deleted successfully");
            fetchTasks();
        } catch (error) {
            showToast.error("Failed to delete task");
        }
    };

    const handleStatusChange = async (id: string, status: TaskStatus) => {
        try {
            await updateTaskStatus(id, { status, updatedBy: "System" });
            showToast.success("Task status updated");
            fetchTasks();
        } catch (error) {
            showToast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
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
                    <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter(""); }}>
                        Reset
                    </Button>
                </div>
                <Button onClick={() => navigate("/project-management/tasks/create", { state: { projectId } })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        Loading tasks...
                                    </TableCell>
                                </TableRow>
                            ) : tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No tasks found. Create your first task!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">{task.title}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={String(task.status)}
                                                onValueChange={(value) => handleStatusChange(task.id, parseInt(value) as TaskStatus)}
                                            >
                                                <SelectTrigger className="w-[130px] h-8 border-0 bg-transparent p-0">
                                                    <SelectValue>
                                                        <Badge className={statusColors[task.status]}>
                                                            {statusLabels[task.status]}
                                                        </Badge>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(statusLabels).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                task.priority === TaskPriority.Critical ? "border-red-500 text-red-600" :
                                                    task.priority === TaskPriority.Urgent ? "border-orange-500 text-orange-600" :
                                                        task.priority === TaskPriority.High ? "border-yellow-500 text-yellow-600" :
                                                            "border-gray-300 text-gray-500"
                                            }>
                                                {priorityLabels[task.priority]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{task.assigneeName || "-"}</TableCell>
                                        <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${task.completionPercentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">{task.completionPercentage}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => navigate(`/project-management/tasks/${task.id}`)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => navigate(`/project-management/tasks/edit/${task.id}`)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700"
                                                    onClick={() => handleDelete(task.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}