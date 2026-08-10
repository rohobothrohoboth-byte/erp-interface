import { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import { mockActivities } from '@/modules/crm/data/crmMockData';
import TasksHeader from '@/modules/crm/components/activityManagement/tasks/TasksHeader';
import TasksSearchFilter from '@/modules/crm/components/activityManagement/tasks/TasksSearchFilter';
import type { TaskFilterState } from '@/modules/crm/components/activityManagement/tasks/TasksSearchFilter';
import TaskList from '@/modules/crm/components/activityManagement/tasks/TaskList';
import ActivityForm from '@/modules/crm/components/activityManagement/tasks/ActivityForm';
import type { Activity } from '@/modules/crm/types/crm';

export default function TasksSection() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilterState>({
    searchTerm: '',
    status: 'all',
    type: 'all',
    dateRange: 'all',
  });

  const handleAddActivity = (activityData: Partial<Activity>) => {
    const activity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminder: activityData.reminder || false
    } as Activity;
    
    setActivities([...activities, activity]);
    showToast.success('Activity created successfully');
  };

  const handleEditActivity = (activityData: Partial<Activity>) => {
    if (selectedActivity) {
      const updatedActivities = activities.map(activity => 
        activity.id === selectedActivity.id 
          ? { ...activity, ...activityData, updatedAt: new Date().toISOString() }
          : activity
      );
      setActivities(updatedActivities);
      setSelectedActivity(null);
      showToast.success('Activity updated successfully');
    }
  };

  const handleStatusChange = (activityId: string, newStatus: Activity['status']) => {
    const updatedActivities = activities.map(activity => {
      if (activity.id === activityId) {
        const updatedActivity = { 
          ...activity, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        };
        
        if (newStatus === 'Completed' && !activity.completedDate) {
          updatedActivity.completedDate = new Date().toISOString();
        }
        
        return updatedActivity;
      }
      return activity;
    });
    
    setActivities(updatedActivities);
    showToast.success(`Activity ${newStatus.toLowerCase()}`);
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities(activities.filter(activity => activity.id !== activityId));
    showToast.success('Activity deleted successfully');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <TasksHeader />
      <TasksSearchFilter
        filters={filters}
        onFiltersChange={setFilters}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

      <TaskList
        activities={activities}
        filters={filters}
        onStatusChange={handleStatusChange}
        onEdit={(activity) => {
          setSelectedActivity(activity);
          setIsEditDialogOpen(true);
        }}
        onDelete={handleDeleteActivity}
      />

      <ActivityForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddActivity}
        mode="add"
      />

      <ActivityForm
        activity={selectedActivity}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedActivity(null);
        }}
        onSubmit={handleEditActivity}
        mode="edit"
      />
    </motion.div>
  );
}
