// src/modules/project/pages/ModuleDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModulePageShell } from '@/shared/components/ModulePageShell';
import { StatsCard } from '@/shared/components/StatsCard'; // ✅ Now exists
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { getProjectDashboard } from '../services/project.api';
import type{ ProjectDashboardDto } from '../types';
import {
  Projector,
  ListTodo,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
} from 'lucide-react';

export default function ModuleDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ProjectDashboardDto | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getProjectDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showToast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <ModulePageShell title="Project Dashboard" subtitle="Loading...">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        </ModulePageShell>
    );
  }

  // Get counts from projectsByStatus
  const inProgressCount = dashboard?.projectsByStatus?.[3] || 0;
  const draftCount = dashboard?.projectsByStatus?.[1] || 0;
  const planningCount = dashboard?.projectsByStatus?.[2] || 0;
  const completedCount = dashboard?.projectsByStatus?.[5] || 0;

  const stats = [
    {
      title: 'Total Projects',
      value: dashboard?.totalProjects || 0,
      icon: <Projector className="w-4 h-4" />,
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      icon: <Activity className="w-4 h-4" />,
      change: `${inProgressCount} active`,
      changeType: 'neutral' as const,
    },
    {
      title: 'Team Members',
      value: dashboard?.resourceSummary?.totalResources || 0,
      icon: <Users className="w-4 h-4" />,
      change: 'Allocated',
      changeType: 'neutral' as const,
    },
    {
      title: 'Upcoming Milestones',
      value: dashboard?.upcomingMilestones?.length || 0,
      icon: <Calendar className="w-4 h-4" />,
      change: 'Due soon',
      changeType: 'neutral' as const,
    },
  ];

  return (
      <ModulePageShell
          title="Project Dashboard"
          subtitle="Overview of all projects and activities"
          onRefresh={fetchDashboard}
          action={
            <Button onClick={() => navigate('/project-management/projects/create')} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
              <StatsCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  change={stat.change}
                  changeType={stat.changeType}
              />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/project-management/projects/create')}>
            <CardContent className="p-4 text-center">
              <Projector className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm font-medium">Create Project</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/project-management/tasks/create')}>
            <CardContent className="p-4 text-center">
              <ListTodo className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Add Task</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/project-management/timesheets/create')}>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Log Time</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/project-management/resources/allocate')}>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Allocate Resource</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.recentProjects?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No projects yet</p>
              ) : (
                  <div className="space-y-3">
                    {dashboard?.recentProjects?.slice(0, 5).map((project) => (
                        <div
                            key={project.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            onClick={() => navigate(`/project-management/projects/${project.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <Projector className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{project.name}</p>
                              <p className="text-xs text-gray-500">{project.code}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {project.completionPercentage}%
                          </Badge>
                        </div>
                    ))}
                  </div>
              )}
              <Button
                  variant="link"
                  className="mt-2 p-0"
                  onClick={() => navigate('/project-management/projects')}
              >
                View all projects →
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.upcomingMilestones?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming milestones</p>
              ) : (
                  <div className="space-y-3">
                    {dashboard?.upcomingMilestones?.slice(0, 5).map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{milestone.title}</p>
                            <p className="text-xs text-gray-500">{milestone.projectName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                            <Badge variant={milestone.isCompleted ? 'default' : 'destructive'} className="text-xs">
                              {milestone.isCompleted ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ModulePageShell>
  );
}