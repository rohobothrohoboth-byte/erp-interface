import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Plus, BookOpen, Award, Clock, FileText, Users, Calendar, BarChart2, CheckCircle, ChevronRight, ArrowRight, Download } from 'lucide-react';
import { useModuleStore } from '@/shared/stores/module.store';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TrainingCourse {
  id: number;
  title: string;
  category: string;
  duration: string;
  format: 'Online' | 'Classroom' | 'Hybrid';
  status: 'Active' | 'Draft' | 'Archived';
  enrolled: number;
  completionRate: number;
}

interface EmployeeTraining {
  id: number;
  employee: string;
  position: string;
  department: string;
  course: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  completionDate: string;
  score?: number;
  certification: boolean;
}

interface TrainingProgram {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  budget: string;
  status: 'Planning' | 'Ongoing' | 'Completed' | 'Cancelled';
}

interface TrainingEvaluation {
  id: number;
  course: string;
  participants: number;
  averageScore: number;
  effectiveness: number;
  feedback: string;
}

interface TrainingBudget {
  id: number;
  category: string;
  allocated: string;
  spent: string;
  remaining: string;
  utilization: number;
}

interface Employee {
  id: number;
  name: string;
  department: string;
}

const CourseOverview: React.FC<{ courses: TrainingCourse[] }> = ({ courses }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {courses.map(course => (
      <motion.div 
        key={course.id}
        whileHover={{ y: -5 }}
        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              course.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 
              course.status === 'Draft' ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <BookOpen className={`h-5 w-5 ${
                course.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 
                course.status === 'Draft' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {course.duration}
                </Badge>
                <Badge variant={course.format === 'Online' ? 'default' : 'secondary'} className="text-xs">
                  {course.format}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {course.enrolled} enrolled
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-800">
                <div 
                  className="h-2 rounded-full bg-emerald-500" 
                  style={{ width: `${course.completionRate}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {course.completionRate}%
              </span>
            </div>
          </div>
        </div>
        <div className="border-t px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Last updated: 2 days ago</span>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            Details <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    ))}
  </div>
);

const EmployeeTrainingOverview: React.FC<{ records: EmployeeTraining[] }> = ({ records }) => (
  <div className="space-y-4">
    {records.map(record => (
      <motion.div 
        key={record.id}
        whileHover={{ x: 5 }}
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{record.employee}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {record.position} • {record.department}
            </p>
            <p className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">
              {record.course}
            </p>
          </div>
          <div className="text-right">
            <Badge 
              variant={
                record.status === 'Completed' ? 'default' : 
                record.status === 'In Progress' ? 'secondary' : 'outline'
              }
              className="capitalize"
            >
              {record.status}
            </Badge>
            {record.completionDate && (
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {record.completionDate}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center flex-wrap">
          <div className="flex items-center gap-2">
            {record.certification && (
              <Badge variant="default" className="px-2 py-0.5 text-xs flex items-center gap-1">
                <Award className="h-3 w-3" /> Certified
              </Badge>
            )}
            {record.score && (
              <Badge variant="outline" className="px-2 py-0.5 text-xs">
                Score: {record.score}/100
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs md:mt-1">
            View Record <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    ))}
  </div>
);

const ProgramOverview: React.FC<{ programs: TrainingProgram[] }> = ({ programs }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {programs.map(program => (
      <motion.div 
        key={program.id}
        whileHover={{ scale: 1.02 }}
        className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900 ${
          program.status === 'Ongoing' 
            ? 'ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/20' 
            : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{program.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {program.startDate} - {program.endDate}
            </p>
          </div>
          <Badge 
            variant={
              program.status === 'Ongoing' ? 'default' : 
              program.status === 'Planning' ? 'secondary' : 
              program.status === 'Completed' ? 'outline' : 'destructive'
            }
            className="capitalize"
          >
            {program.status}
          </Badge>
        </div>
        
        <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
          {program.description}
        </p>
        
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Participants</p>
            <p className="font-medium">{program.participants}</p>
          </div>
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
            <p className="font-medium">{program.budget}</p>
          </div>
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Days Left</p>
            <p className="font-medium">
              {program.status === 'Completed' ? 'Finished' : 
               program.status === 'Planning' ? '--' : '14'}
            </p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const EvaluationOverview: React.FC<{ evaluations: TrainingEvaluation[] }> = ({ evaluations }) => (
  <div className="space-y-4">
    {evaluations.map(evalItem => (
      <motion.div 
        key={evalItem.id}
        whileHover={{ scale: 1.01 }}
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{evalItem.course}</h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>{evalItem.participants} participants</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <BarChart2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>Avg. score: {evalItem.averageScore}/100</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={evalItem.effectiveness > 70 ? "#10b981" : evalItem.effectiveness > 40 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${evalItem.effectiveness}, 100`}
                />
                <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill={evalItem.effectiveness > 70 ? "#10b981" : evalItem.effectiveness > 40 ? "#f59e0b" : "#ef4444"} fontWeight="bold">
                  {evalItem.effectiveness}%
                </text>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Feedback:</span> {evalItem.feedback}
          </p>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            Detailed Report <Download className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    ))}
  </div>
);

const BudgetOverview: React.FC<{ budgets: TrainingBudget[] }> = ({ budgets }) => (
  <div className="space-y-4">
    {budgets.map(budget => {
      // Ensure utilization doesn't exceed 100% for the progress bar
      const displayUtilization = Math.min(budget.utilization, 100);
      
      return (
        <motion.div 
          key={budget.id}
          whileHover={{ scale: 1.01 }}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{budget.category}</h3>
            <Badge 
              variant={
                budget.utilization > 90 ? 'destructive' : 
                budget.utilization > 70 ? 'secondary' : 'outline'
              }
              className="text-xs"
            >
              {budget.utilization}% utilized
            </Badge>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Allocated</p>
              <p className="font-medium">{budget.allocated}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
              <p className="font-medium">{budget.spent}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
              <p className="font-medium" style={{ 
                color: parseFloat(budget.remaining.replace(/[^0-9.]/g, '')) < 0 ? '#ef4444' : 'inherit'
              }}>
                {budget.remaining}
              </p>
            </div>
          </div>
          
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className={`h-2.5 rounded-full ${
                budget.utilization > 90 ? 'bg-red-500' : 
                budget.utilization > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`} 
              style={{ width: `${displayUtilization}%` }}
            ></div>
          </div>
          
          {/* Show warning if utilization exceeds 100% */}
          {budget.utilization > 100 && (
            <p className="mt-2 text-xs text-red-500">
              Warning: Budget exceeded by {budget.utilization - 100}%
            </p>
          )}
        </motion.div>
      );
    })}
  </div>
);
const TrainingList = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-emerald-500" />
        <span>Training List</span>
      </CardTitle>
      <CardDescription>
        Comprehensive list of all training programs and courses
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {courseData.map(course => (
          <div key={course.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium">{course.title}</h3>
              <p className="text-sm text-gray-500">{course.category} • {course.duration}</p>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const TrainingForm = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Plus className="h-5 w-5 text-emerald-500" />
        <span>Create New Training</span>
      </CardTitle>
      <CardDescription>
        Add a new training program or course to the system
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Training Title</label>
            <input className="w-full p-2 border rounded" placeholder="Enter title" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select className="w-full p-2 border rounded">
              <option>Select category</option>
              <option>Leadership</option>
              <option>Technical</option>
              <option>Compliance</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <input type="date" className="w-full p-2 border rounded" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <input type="date" className="w-full p-2 border rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea className="w-full p-2 border rounded" rows={3} placeholder="Enter description"></textarea>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">Save Training</Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

const EnrollmentManagement: React.FC<{ courseId: number }> = ({ courseId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  
  // Fetch employees (mock data for example)
  useEffect(() => {
    const mockEmployees = [
      { id: 1, name: 'John Smith', department: 'Finance' },
      { id: 2, name: 'Jane Doe', department: 'HR' },
      { id: 3, name: 'Robert Johnson', department: 'IT' },
      { id: 4, name: 'Emily Davis', department: 'Finance' },
      { id: 5, name: 'Michael Brown', department: 'IT' },
      { id: 6, name: 'Sarah Wilson', department: 'HR' },
    ];
    setEmployees(mockEmployees);
  }, []);

  const departments = ['All', ...new Set(employees.map(e => e.department))];

  const filteredEmployees = departmentFilter === 'All' 
    ? employees 
    : employees.filter(e => e.department === departmentFilter);

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  const handleEnroll = () => {
    console.log(`Enrolling employees ${selectedEmployees.join(', ')} in course ${courseId}`);
    alert(`Successfully enrolled ${selectedEmployees.length} employees`);
    setSelectedEmployees([]);
  };
    return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-500" />
          <span>Enroll Employees</span>
        </CardTitle>
        <CardDescription>
          Select employees to enroll in this training program
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="department-filter" className="block text-sm font-medium mb-1">
                Filter by Department
              </label>
              <select
                id="department-filter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline"
                onClick={handleSelectAll}
                className="w-full sm:w-auto"
              >
                {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
          
          <div className="grid gap-2 max-h-96 overflow-y-auto p-1">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <input 
                  type="checkbox" 
                  id={`employee-${employee.id}`}
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={() => {
                    setSelectedEmployees(prev => 
                      prev.includes(employee.id)
                        ? prev.filter(id => id !== employee.id)
                        : [...prev, employee.id]
                    );
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label 
                  htmlFor={`employee-${employee.id}`} 
                  className="flex-1 flex justify-between items-center"
                >
                  <span>{employee.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {employee.department}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleEnroll}
            disabled={selectedEmployees.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Enroll Selected Employees ({selectedEmployees.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


const TrainingDetails = () => {
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-500" />
          <span>Training Details</span>
        </CardTitle>
        <CardDescription>
          Detailed information about the selected training program
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className='cursor-pointer'>Details</TabsTrigger>
            <TabsTrigger value="enrollment" className='cursor-pointer'>Enrollment</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {activeTab === 'details' ? (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold">Leadership Development Program</h2>
              <div className="flex gap-2 mt-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">8 weeks</Badge>
                <Badge variant="outline">Hybrid</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive leadership training for managers and team leads.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Schedule</h3>
                <p className="text-sm text-gray-600">
                  Every Tuesday & Thursday<br />
                  2:00 PM - 4:00 PM<br />
                  Starts: Jun 15, 2024
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Statistics</h3>
                <p className="text-sm text-gray-600">
                  24 enrolled<br />
                  78% completion rate<br />
                  4.5/5 average rating
                </p>
              </div>
            </div>
          </div>
        ) : (
          <EnrollmentManagement courseId={1} />
        )}
      </CardContent>
    </Card>
  );
};

const TrainingCalendar = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-emerald-500" />
        <span>Training Calendar</span>
      </CardTitle>
      <CardDescription>
        View and manage all scheduled training sessions
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i - 5 + 1;
            const hasTraining = [2, 7, 9, 14, 16, 21, 23, 28, 30].includes(day);
            
            return (
              <div 
                key={i} 
                className={`min-h-16 p-1 border ${i >= 5 && day <= 30 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
              >
                {i >= 5 && day <= 30 && (
                  <>
                    <div className="text-sm font-medium">{day}</div>
                    {hasTraining && (
                      <div className="mt-1 text-xs p-1 bg-emerald-100 dark:bg-emerald-900 rounded">
                        Training Session
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CardContent>
  </Card>
);

const TrainingRecords = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5 text-emerald-500" />
        <span>Training Records</span>
      </CardTitle>
      <CardDescription>
        Track and manage employee training participation and completion
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {employeeTrainingData.map(record => (
              <tr key={record.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium">{record.employee}</div>
                  <div className="text-sm text-gray-500">{record.department}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium">{record.course}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge 
                    variant={
                      record.status === 'Completed' ? 'default' : 
                      record.status === 'In Progress' ? 'secondary' : 'outline'
                    }
                    className="capitalize"
                  >
                    {record.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {record.completionDate || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {record.score ? `${record.score}/100` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const AnalysisImprovement = () => {
  // Data for charts
  const data = [
  { name: 'Jan', enrolled: 12, completed: 10 },
  { name: 'Feb', enrolled: 19, completed: 13 },
  { name: 'Mar', enrolled: 15, completed: 12 },
  { name: 'Apr', enrolled: 18, completed: 16 },
  { name: 'May', enrolled: 22, completed: 19 },
  { name: 'Jun', enrolled: 25, completed: 22 },
];

const pieData = [
  { name: 'Completed', value: 78 },
  { name: 'In Progress', value: 15 },
  { name: 'Not Started', value: 7 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];


    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Analytics</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Training Participation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enrolled" fill="#8884d8" name="Enrolled" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold">84%</div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div>
              <div className="text-2xl font-bold">4.7/5</div>
              <p className="text-sm text-gray-600">Average Satisfaction</p>
            </div>
            <div>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">JD</div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">Completed 12 trainings</p>
                  </div>
                </div>
                <div className="text-green-600 font-medium">98% avg</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">AS</div>
                  <div>
                    <p className="font-medium">Alice Smith</p>
                    <p className="text-sm text-gray-600">Completed 10 trainings</p>
                  </div>
                </div>
                <div className="text-green-600 font-medium">96% avg</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">RJ</div>
                  <div>
                    <p className="font-medium">Robert Johnson</p>
                    <p className="text-sm text-gray-600">Completed 9 trainings</p>
                  </div>
                </div>
                <div className="text-green-600 font-medium">94% avg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

  );
};
const AttendanceTracking = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-emerald-500" />
        <span>Attendance Tracking</span>
      </CardTitle>
      <CardDescription>
        Track training attendance and participation
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Time Tracking</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Check-in Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Biometric</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>RFID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Mobile App</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>John Smith - 9:02 AM</p>
                  <p>Jane Doe - 9:05 AM</p>
                  <p>Robert Johnson - 8:58 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Absence Management</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Approved Leaves</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">12</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unexcused Absences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">2</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Sample data
const courseData: TrainingCourse[] = [
  { id: 1, title: 'Leadership Development', category: 'Management', duration: '8 weeks', format: 'Hybrid', status: 'Active', enrolled: 24, completionRate: 78 },
  { id: 2, title: 'Cybersecurity Awareness', category: 'IT', duration: '2 hours', format: 'Online', status: 'Active', enrolled: 156, completionRate: 92 },
  { id: 3, title: 'Diversity & Inclusion', category: 'HR', duration: '4 hours', format: 'Classroom', status: 'Active', enrolled: 89, completionRate: 65 },
  { id: 4, title: 'Advanced Excel', category: 'Finance', duration: '3 days', format: 'Online', status: 'Draft', enrolled: 0, completionRate: 0 },
];

const employeeTrainingData: EmployeeTraining[] = [
  { id: 1, employee: 'John Smith', position: 'Manager', department: 'Finance', course: 'Leadership Development', status: 'Completed', completionDate: 'May 15, 2024', score: 88, certification: true },
  { id: 2, employee: 'Jane Doe', position: 'HR Specialist', department: 'HR', course: 'Diversity & Inclusion', status: 'In Progress', completionDate: '', certification: false },
  { id: 3, employee: 'Robert Johnson', position: 'IT Support', department: 'IT', course: 'Cybersecurity Awareness', status: 'Completed', completionDate: 'Apr 28, 2024', score: 95, certification: true },
  { id: 4, employee: 'Emily Davis', position: 'Accountant', department: 'Finance', course: 'Advanced Excel', status: 'Not Started', completionDate: '', certification: false },
];

const programData: TrainingProgram[] = [
  { id: 1, name: 'Annual Leadership Program', description: 'Year-long leadership development for managers', startDate: 'Jan 1, 2024', endDate: 'Dec 31, 2024', participants: 24, budget: '$45,000', status: 'Ongoing' },
  { id: 2, name: 'Q3 Technical Training', description: 'Technical skills upgrade for IT department', startDate: 'Jul 15, 2024', endDate: 'Sep 30, 2024', participants: 18, budget: '$22,500', status: 'Planning' },
  { id: 3, name: 'New Hire Orientation', description: 'Monthly onboarding for new employees', startDate: 'Jun 1, 2024', endDate: 'Jun 30, 2024', participants: 12, budget: '$8,000', status: 'Completed' },
];

const evaluationData: TrainingEvaluation[] = [
  { id: 1, course: 'Leadership Development', participants: 24, averageScore: 82, effectiveness: 85, feedback: 'Excellent content and delivery. Some participants requested more case studies.' },
  { id: 2, course: 'Cybersecurity Awareness', participants: 156, averageScore: 91, effectiveness: 92, feedback: 'Highly effective training. Employees reported increased awareness.' },
  { id: 3, course: 'Diversity & Inclusion', participants: 89, averageScore: 76, effectiveness: 68, feedback: 'Good foundation but needs more interactive elements.' },
];

const budgetData: TrainingBudget[] = [
  { id: 1, category: 'Leadership Development', allocated: '$50,000', spent: '$42,300', remaining: '$7,700', utilization: 85 },
  { id: 2, category: 'Technical Skills', allocated: '$35,000', spent: '$28,150', remaining: '$6,850', utilization: 80 },
  { id: 3, category: 'Compliance Training', allocated: '$15,000', spent: '$16,200', remaining: '$-1,200', utilization: 108 },
  { id: 4, category: 'Soft Skills', allocated: '$20,000', spent: '$12,000', remaining: '$8,000', utilization: 60 },
];

type StatKey = 'totalCourses' | 'activeTrainings' | 'employeesTraining' | 'completionRate' | 'trainingBudget';

interface Stats {
  totalCourses: number;
  activeTrainings: number;
  employeesTraining: number;
  completionRate: number;
  trainingBudget: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      when: "beforeChildren" as const
    } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: 'spring' as const, 
      stiffness: 260, 
      damping: 20 
    }
  }
};

const statCardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300 }
  }
};

const Training = () => {
  const activeModule = useModuleStore((s) => s.activeModule);
  
  const stats: Stats = {
    totalCourses: courseData.length,
    activeTrainings: programData.filter(p => p.status === 'Ongoing').length,
    employeesTraining: employeeTrainingData.filter(e => e.status === 'In Progress').length,
    completionRate: Math.round(
      employeeTrainingData.filter(e => e.status === 'Completed').length / 
      employeeTrainingData.length * 100
    ),
    trainingBudget: '$120,000'
  };

  const statConfig = {
    totalCourses: {
      icon: <BookOpen className="h-4 w-4 text-emerald-600" />,
      title: 'Total Courses',
      description: 'Available training programs'
    },
    activeTrainings: {
      icon: <Clock className="h-4 w-4 text-emerald-500" />,
      title: 'Active Trainings',
      description: 'Ongoing programs'
    },
    employeesTraining: {
      icon: <Users className="h-4 w-4 text-emerald-500" />,
      title: 'Employees Training',
      description: 'Currently in training'
    },
    completionRate: {
      icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
      title: 'Completion Rate',
      description: 'Overall training completion'
    },
    trainingBudget: {
      icon: <FileText className="h-4 w-4 text-emerald-600" />,
      title: 'Training Budget',
      description: 'Annual training allocation'
    }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section with Gradient Title */}
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-500 mr-3">
              Training 
            </span>& Development
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Central hub for managing employee training programs, tracking progress, and evaluating effectiveness.
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {(Object.keys(statConfig) as StatKey[]).map((key) => (
          <motion.div key={key} variants={statCardVariants}>
            <Card className="hover:shadow-lg hover:ring-1 hover:ring-emerald-400 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {statConfig[key].title}
                </CardTitle>
                {statConfig[key].icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {key === 'completionRate' 
                    ? `${stats[key]}%`
                    : key === 'trainingBudget'
                    ? stats[key]
                    : stats[key]
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {statConfig[key].description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="Overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7">
          <TabsTrigger value="Overview" className="cursor-pointer">Overview</TabsTrigger>
          <TabsTrigger value="list" className="cursor-pointer">Training List</TabsTrigger>
          <TabsTrigger value="form" className="cursor-pointer">New Training</TabsTrigger>
          <TabsTrigger value="details" className="cursor-pointer">Details</TabsTrigger>
          <TabsTrigger value="calendar" className="cursor-pointer">Calendar</TabsTrigger>
          <TabsTrigger value="records" className="cursor-pointer">Records</TabsTrigger>
          <TabsTrigger value="analysis" className="cursor-pointer">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="Overview">
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  <span>Course Overview</span>
                </CardTitle>
                <CardDescription>
                  View and manage all available training courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourseOverview courses={courseData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                  <span>Employee Training</span>
                </CardTitle>
                <CardDescription>
                  Track employee participation and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeTrainingOverview records={employeeTrainingData} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                  <span>Program Overview</span>
                </CardTitle>
                <CardDescription>
                  Current and upcoming training programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgramOverview programs={programData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-emerald-500" />
                  <span>Training Evaluation</span>
                </CardTitle>
                <CardDescription>
                  Effectiveness metrics and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvaluationOverview evaluations={evaluationData} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <span>Budget Overview</span>
                </CardTitle>
                <CardDescription>
                  Training budget allocation and utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetOverview budgets={budgetData} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="list">
          <TrainingList />
        </TabsContent>

        <TabsContent value="form">
          <TrainingForm />
        </TabsContent>

        <TabsContent value="details">
          <TrainingDetails />
        </TabsContent>

        <TabsContent value="calendar">
          <TrainingCalendar />
        </TabsContent>

        <TabsContent value="records">
          <TrainingRecords />
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisImprovement />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Training;