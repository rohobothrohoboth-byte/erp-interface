// src/pages/hr/recruitmentpage/OnBoarding.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  Settings,
  Users,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Building2,
  Award,
  Star,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  Edit,
  Trash2,
  ClipboardCheck,
  UserCheck,
  UserX,
  UserCog,
  Send,
  Download,
  Printer,
  ListChecks,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Progress } from '../../../components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { useAllApplicants } from '../../../services/hr/recruitment/applicant/applicant.queries';
import { useAuthStore } from '../../../stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface OnboardingEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  startDate: string;
  manager: string;
  email: string;
  phone: string;
  progress: number;
  status: 'active' | 'completed' | 'pending';
}

interface OnboardingTask {
  id: string;
  taskName: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  assignedTo?: string;
  dueDate?: string;
}

const OnBoarding: React.FC = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId?: string }>();
  const { role } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<OnboardingEmployee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: applicants, isLoading: applicantsLoading } = useAllApplicants();
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);

  useEffect(() => {
    // Build real employees from hired applicants
    if (applicants && !applicantsLoading) {
      const hiredApplicants = applicants.filter(a => a.statusStr === 'Hired');

      const realEmployees: OnboardingEmployee[] = hiredApplicants.map((applicant, index) => ({
        id: applicant.id,
        employeeId: applicant.employeeId || applicant.id,
        employeeName: applicant.applicant || 'Unknown',
        position: applicant.position || 'Position Not Set',
        department: applicant.department || 'Department Not Set',
        startDate: applicant.appliedDate || new Date().toISOString(),
        manager: 'HR Manager',
        email: applicant.email || 'email@example.com',
        phone: applicant.phone || 'N/A',
        progress: Math.floor(Math.random() * 100),
        status: index % 3 === 0 ? 'completed' : index % 3 === 1 ? 'active' : 'pending'
      }));

      setEmployees(realEmployees);
      setLoading(false);

      // If employeeId is provided, find and select that employee
      if (employeeId) {
        const found = realEmployees.find(e => e.id === employeeId || e.employeeId === employeeId);
        if (found) {
          setSelectedEmployee(found);
          setShowEmployeeModal(true);
        }
      }
    }

    // Mock onboarding tasks - in real app, fetch from API
    setOnboardingTasks([
      { id: '1', taskName: 'Employment Contract', description: 'Review and sign employment contract', status: 'completed' },
      { id: '2', taskName: 'Tax Forms Submission', description: 'Complete and submit tax forms', status: 'completed' },
      { id: '3', taskName: 'System Access Setup', description: 'Set up system access and credentials', status: 'in-progress', assignedTo: 'IT Department' },
      { id: '4', taskName: 'Orientation Schedule', description: 'Complete new employee orientation', status: 'pending' },
      { id: '5', taskName: 'Training Program', description: 'Complete mandatory training modules', status: 'pending' },
      { id: '6', taskName: 'Equipment Setup', description: 'Set up workstation and equipment', status: 'pending' },
    ]);
  }, [applicants, applicantsLoading, employeeId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      'completed': {
        label: 'Completed',
        className: 'bg-emerald-100 text-emerald-700',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      },
      'active': {
        label: 'In Progress',
        className: 'bg-blue-100 text-blue-700',
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      'pending': {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      'in-progress': {
        label: 'In Progress',
        className: 'bg-blue-100 text-blue-700',
        icon: <Clock className="w-3.5 h-3.5" />,
      },
    };
    const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700', icon: null };
    return (
        <Badge className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${info.className}`}>
          {info.icon}
          {info.label}
        </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getEmployeeStatus = (employee: OnboardingEmployee) => {
    if (employee.progress === 100) return 'completed';
    if (employee.progress > 0) return 'active';
    return 'pending';
  };

  // Filter employees based on tab and search
  const filteredEmployees = employees.filter(employee => {
    const employeeStatus = getEmployeeStatus(employee);
    const matchesTab = activeTab === 'all' || employeeStatus === activeTab;
    const matchesSearch = employee.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => getEmployeeStatus(e) === 'active').length,
    completed: employees.filter(e => getEmployeeStatus(e) === 'completed').length,
    pending: employees.filter(e => getEmployeeStatus(e) === 'pending').length,
  };

  const handleViewEmployee = (employee: OnboardingEmployee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleAddEmployee = () => {
    navigate('/hr/employees/record/Add');
  };

  const handleViewTasks = () => {
    navigate('/hr/recruitment/onboarding/tasks');
  };

  const handleViewAssignments = () => {
    navigate('/hr/recruitment/onboarding/assignments');
  };

  const handleCompleteTask = (taskId: string) => {
    setOnboardingTasks(prev =>
        prev.map(task =>
            task.id === taskId
                ? { ...task, status: 'completed' as const }
                : task
        )
    );
    toast.success('Task marked as completed');
  };

  if (loading || applicantsLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    );
  }

  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header with Back button */}
        <div className="flex items-center gap-4">
          <Button
              variant="outline"
              onClick={() => navigate('/hr/recruitment/onboarding')}
              className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Onboarding Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage employee onboarding process</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewTasks}>
              <ListChecks className="w-4 h-4 mr-2" />
              Tasks
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewAssignments}>
              <UserCheck className="w-4 h-4 mr-2" />
              Assignments
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={handleAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Onboarding</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-yellow-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-red-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="active">In Progress ({stats.active})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardContent className="p-6">
            {filteredEmployees.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No employees in onboarding</p>
                  <p className="text-sm text-gray-400">New hires will appear here</p>
                  <Button
                      variant="outline"
                      className="mt-4"
                      onClick={handleAddEmployee}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Employee
                  </Button>
                </div>
            ) : (
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => {
                    const status = getEmployeeStatus(employee);
                    return (
                        <div
                            key={employee.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => handleViewEmployee(employee)}
                        >
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <p className="font-medium text-gray-900">{employee.employeeName}</p>
                                <p className="text-sm text-gray-500">{employee.position} • {employee.department}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                {getStatusBadge(status)}
                                <p className="text-sm font-medium">{employee.progress}%</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Progress value={employee.progress} className={`h-2 ${getProgressColor(employee.progress)}`} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Starts {formatDate(employee.startDate)}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewEmployee(employee); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                    );
                  })}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-4 hover:bg-emerald-50"
                  onClick={handleViewTasks}
              >
                <ListChecks className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">View Tasks</span>
              </Button>
              <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-4 hover:bg-blue-50"
                  onClick={handleViewAssignments}
              >
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Assignments</span>
              </Button>
              <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-4 hover:bg-purple-50"
                  onClick={() => navigate('/settings/hr/onboarding-tasks')}
              >
                <Settings className="w-5 h-5 text-purple-600" />
                <span className="text-xs">Settings</span>
              </Button>
              <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-4 hover:bg-orange-50"
                  onClick={handleAddEmployee}
              >
                <UserPlus className="w-5 h-5 text-orange-600" />
                <span className="text-xs">Add Employee</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee Detail Modal */}
        <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Employee Onboarding Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.employeeName}</h3>
                      <p className="text-gray-500">{selectedEmployee.position} • {selectedEmployee.department}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(getEmployeeStatus(selectedEmployee))}
                        <span className="text-sm text-gray-500">Progress: {selectedEmployee.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(selectedEmployee.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manager</p>
                      <p className="font-medium">{selectedEmployee.manager}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedEmployee.phone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Onboarding Progress</p>
                    <Progress value={selectedEmployee.progress} className={`h-3 ${getProgressColor(selectedEmployee.progress)}`} />
                  </div>

                  {/* Assigned Tasks */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Assigned Tasks</h4>
                      <Button variant="ghost" size="sm" onClick={handleViewTasks}>
                        View All <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {onboardingTasks.filter(t => t.status !== 'completed').slice(0, 3).map(task => (
                          <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {task.status === 'in-progress' ? (
                                  <Clock className="w-4 h-4 text-blue-500" />
                              ) : (
                                  <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm">{task.taskName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(task.status)}
                              {task.status === 'pending' && (
                                  <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs text-blue-600"
                                      onClick={() => handleCompleteTask(task.id)}
                                  >
                                    Start
                                  </Button>
                              )}
                            </div>
                          </div>
                      ))}
                      {onboardingTasks.filter(t => t.status !== 'completed').length === 0 && (
                          <p className="text-sm text-gray-400">All tasks completed!</p>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEmployeeModal(false)}>Close</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                      setShowEmployeeModal(false);
                      navigate(`/hr/employees/${selectedEmployee.employeeId}`);
                    }}>
                      View Full Profile
                    </Button>
                  </DialogFooter>
                </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
  );
};

export default OnBoarding;