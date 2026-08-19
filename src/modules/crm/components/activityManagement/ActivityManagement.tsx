import { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import { mockActivities } from '@/modules/crm/data/crmMockData';
import ActivityHeader from '@/modules/crm/components/activityManagement/activities/ActivityHeader';
import ActivityMetrics from '@/modules/crm/components/activityManagement/activities/ActivityMetrics';
import ActivityFilters from '@/modules/crm/components/activityManagement/activities/ActivityFilters';
import ActivityTable from '@/modules/crm/components/activityManagement/activities/ActivityTable';
import ActivityCalendarView from '@/modules/crm/components/activityManagement/activities/ActivityCalendarView';
import ActivityForm from '@/modules/crm/components/activityManagement/tasks/ActivityForm';
import type { Activity } from '@/modules/crm/types/crm';

interface FilterState {
  searchTerm: string;
  status: string;
  type: string;
  priority: string;
  assignedTo: string;
  dateRange: string;
}

export default function ActivityManagement() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    type: 'all',
    priority: 'all',
    assignedTo: 'all',
    dateRange: 'all'
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter activities based on current filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      activity.assignedTo.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      activity.relatedTo?.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || activity.status === filters.status;
    const matchesType = filters.type === 'all' || activity.type === filters.type;
    const matchesPriority = filters.priority === 'all' || activity.priority === filters.priority;
    const matchesAssignedTo = filters.assignedTo === 'all' || activity.assignedTo === filters.assignedTo;
    
    // Date range filter
    const matchesDateRange = (() => {
      if (filters.dateRange === 'all') return true;
      
      const activityDate = new Date(activity.scheduledDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      switch (filters.dateRange) {
        case 'overdue':
          return activityDate < today && activity.status !== 'Completed';
        case 'today':
          return activityDate >= today && activityDate < tomorrow;
        case 'tomorrow':
          return activityDate >= tomorrow && activityDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          return activityDate >= today && activityDate <= weekFromNow;
        case 'month':
          return activityDate >= today && activityDate <= monthFromNow;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesAssignedTo && matchesDateRange;
  });

  // Get unique assignees for filter
  const uniqueAssignees = Array.from(new Set(activities.map(a => a.assignedTo)));

  const handleAddActivity = (activityData: Partial<Activity>) => {
    const activity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Activity;
    
    setActivities([...activities, activity]);
    setIsAddDialogOpen(false);
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
      setIsEditDialogOpen(false);
      showToast.success('Activity updated successfully');
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities(activities.filter(activity => activity.id !== activityId));
    showToast.success('Activity deleted successfully');
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      type: 'all',
      priority: 'all',
      assignedTo: 'all',
      dateRange: 'all'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <ActivityHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddActivity={() => setIsAddDialogOpen(true)}
      />

      {/* Metrics Cards */}
      <ActivityMetrics activities={activities} />

      {/* Filters - Only show in list view */}
      {viewMode === 'list' && (
        <ActivityFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          totalCount={activities.length}
          filteredCount={filteredActivities.length}
          assignees={uniqueAssignees}
        />
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        <ActivityTable
          activities={filteredActivities}
          onEdit={(activity) => {
            setSelectedActivity(activity);
            setIsEditDialogOpen(true);
          }}
          onDelete={handleDeleteActivity}
        />
      ) : (
        <ActivityCalendarView
          activities={filteredActivities}
          onEdit={(activity) => {
            setSelectedActivity(activity);
            setIsEditDialogOpen(true);
          }}
        />
      )}

      {/* Add Activity Dialog */}
      <ActivityForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddActivity}
        mode="add"
      />

      {/* Edit Activity Dialog */}
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
