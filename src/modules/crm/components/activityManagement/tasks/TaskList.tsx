import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, User, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Pagination } from '@/shared/components/ui/pagination';
import TaskDetailModal from '@/modules/crm/components/activityManagement/tasks/TaskDetailModal';
import type { Activity } from '@/modules/crm/types/crm';
import type { TaskFilterState } from '@/modules/crm/components/activityManagement/tasks/TasksSearchFilter';

interface TaskListProps {
  activities: Activity[];
  filters: TaskFilterState;
  onStatusChange: (activityId: string, newStatus: Activity['status']) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}


export default function TaskList({ activities, filters, onStatusChange, onEdit, onDelete }: TaskListProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'created'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTask, setSelectedTask] = useState<Activity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  const handleViewDetails = (activity: Activity) => {
    setSelectedTask(activity);
    setIsDetailModalOpen(true);
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (activity.relatedTo?.name ?? '').toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || activity.status === filters.status;
    const matchesType = filters.type === 'all' || activity.type === filters.type;
    
    const matchesDateRange = (() => {
      if (filters.dateRange === 'all') return true;
      const activityDate = new Date(activity.scheduledDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      switch (filters.dateRange) {
        case 'overdue': return activityDate < today && activity.status !== 'Completed';
        case 'today': return activityDate >= today && activityDate < tomorrow;
        case 'tomorrow': return activityDate >= tomorrow && activityDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        case 'week': return activityDate >= today && activityDate <= weekFromNow;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'dueDate':
        comparison = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(sortedActivities.map(a => a.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleBulkStatusChange = (newStatus: Activity['status']) => {
    selectedTasks.forEach(taskId => {
      onStatusChange(taskId, newStatus);
    });
    setSelectedTasks([]);
  };

  const handleBulkDelete = () => {
    selectedTasks.forEach(taskId => {
      onDelete(taskId);
    });
    setSelectedTasks([]);
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'Call': return '📞';
      case 'Email': return '📧';
      case 'Meeting': return '🤝';
      case 'Task': return '✅';
      case 'Note': return '📝';
      default: return '📅';
    }
  };

  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'Completed': return 'bg-orange-100 text-orange-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const isOverdue = (activity: Activity) => {
    const now = new Date();
    const scheduledDate = new Date(activity.scheduledDate);
    return scheduledDate < now && activity.status !== 'Completed';
  };

  // Pagination calculations
  const totalItems = sortedActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedActivities.slice(startIndex, endIndex);
  }, [sortedActivities, currentPage]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <Select onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Mark as Pending</SelectItem>
                    <SelectItem value="In Progress">Mark as In Progress</SelectItem>
                    <SelectItem value="Completed">Mark as Completed</SelectItem>
                    <SelectItem value="Cancelled">Mark as Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" onClick={handleBulkDelete}>
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-orange-600" />
              <span>Tasks & Activities</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                  <SelectItem value="created">Sort by Created</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedActivities.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500">No tasks match your current filters.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTasks.length === sortedActivities.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Related To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedActivities.map((activity) => (
                  <TableRow 
                    key={activity.id} 
                    className={`hover:bg-gray-50 ${isOverdue(activity) ? 'bg-red-50' : ''}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedTasks.includes(activity.id)}
                        onCheckedChange={(checked) => handleSelectTask(activity.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getActivityIcon(activity.type)}</span>
                          <span className="font-medium text-gray-900">{activity.title}</span>
                          {isOverdue(activity) && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={activity.status}
                        onValueChange={(value) => onStatusChange(activity.id, value as Activity['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{activity.assignedTo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={`text-sm ${isOverdue(activity) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {new Date(activity.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.scheduledDate).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.relatedTo && (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.relatedTo.type}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewDetails(activity)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(activity)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(activity.id, 'Completed')}
                            disabled={activity.status === 'Completed'}
                          >
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(activity.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="tasks"
            />
            </>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}