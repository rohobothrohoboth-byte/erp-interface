import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, MoreHorizontal, Trash2, Phone, Mail, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Pagination } from '@/shared/components/ui/pagination';
import ActivityDetailModal from '@/modules/crm/components/activityManagement/activities/ActivityDetailModal';
import DeleteActivityModal from '@/modules/crm/components/activityManagement/activities/DeleteActivityModal';
import type { Activity } from '@/modules/crm/types/crm';

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Completed': 'bg-orange-100 text-orange-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800'
};

const typeIcons = {
  'Call': Phone,
  'Email': Mail,
  'Meeting': MessageSquare,
  'Task': CheckCircle,
  'Note': FileText
};

interface ActivityTableProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export default function ActivityTable({ activities, onEdit, onDelete }: ActivityTableProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  // Pagination calculations
  const totalItems = activities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return activities.slice(startIndex, endIndex);
  }, [activities, currentPage]);

  const handleViewDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (activity: Activity) => {
    setActivityToDelete(activity);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (activity: Activity) => {
    onDelete(activity.id);
    setIsDeleteModalOpen(false);
    setActivityToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setActivityToDelete(null);
  };

  const isOverdue = (activity: Activity) => {
    const now = new Date();
    const scheduledDate = new Date(activity.scheduledDate);
    return scheduledDate < now && activity.status !== 'Completed';
  };

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
        <p className="text-gray-500">No activities match your current filters.</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Activity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActivities.map((activity) => {
                const IconComponent = typeIcons[activity.type];
                return (
                  <TableRow 
                    key={activity.id} 
                    className={`hover:bg-gray-50 ${isOverdue(activity) ? 'bg-red-50' : ''}`}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-gray-900">{activity.title}</span>
                          {isOverdue(activity) && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(activity.scheduledDate).toLocaleDateString()} at{' '}
                          {new Date(activity.scheduledDate).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[activity.priority]}>
                        {activity.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[activity.status]}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{activity.assignedTo}</span>
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
                            Edit Activity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(activity)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="activities"
          />
        </div>
      </motion.div>

      {/* Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedActivity(null);
        }}
      />

      {/* Delete Modal */}
      <DeleteActivityModal
        activity={activityToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
