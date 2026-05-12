import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, RefreshCw, Building, Users, Calendar, Layers, User, MapPin, Users as UsersIcon, Clock, ChevronRight, ArrowRight } from 'lucide-react';
import { useModuleStore } from '../../stores/module.store';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'

// Type definitions for each component's props
interface Branch {
  id: number;
  name: string;
  location: string;
  status: string;
  users: number;
}

interface Department {
  id: number;
  name: string;
  head: string;
  employees: number;
  budget: string;
}

interface FiscalYear {
  id: number;
  year: string;
  start: string;
  end: string;
  status: string;
}

interface HierarchyLevel {
  id: number;
  name: string;
  description: string;
}

interface HierarchyStructure {
  from: string;
  to: string;
}

interface HierarchyData {
  levels: HierarchyLevel[];
  structure: HierarchyStructure[];
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: string;
}

// Component props interfaces
interface BranchOverviewProps {
  branches: Branch[];
}

interface DepartmentOverviewProps {
  departments: Department[];
}

interface FiscalYearOverviewProps {
  fiscalYears: FiscalYear[];
}

interface HierarchyOverviewProps {
  hierarchy: HierarchyData;
}

interface UserOverviewProps {
  users: User[];
}

// Mock components with proper typing
const BranchOverview: React.FC<BranchOverviewProps> = ({ branches }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {branches.map(branch => (
      <motion.div 
        key={branch.id}
        whileHover={{ y: -5 }}
        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{branch.name}</h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {branch.location}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(Math.min(branch.users, 5))].map((_, i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-gray-900">
                    <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                      {branch.name.charAt(0)}{i+1}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {branch.users} users
              </span>
            </div>
            
            <Badge 
              variant={branch.status === 'active' ? 'default' : 'secondary'} 
              className="px-3 py-1 text-xs"
            >
              {branch.status}
            </Badge>
          </div>
        </div>
        <div className="border-t px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Last updated: Today</span>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            Details <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    ))}
  </div>
);

const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({ departments }) => (
  <div className="space-y-4">
    {departments.map(dept => (
      <motion.div 
        key={dept.id}
        whileHover={{ x: 5 }}
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <UsersIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </span>
              {dept.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Head: <span className="font-medium text-gray-700 dark:text-gray-300">{dept.head}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{dept.employees}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">employees</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">
              Budget: {dept.budget}
            </span>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            Manage <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    ))}
  </div>
);

const FiscalYearOverview: React.FC<FiscalYearOverviewProps> = ({ fiscalYears }) => (
  <div className="space-y-4">
    {fiscalYears.map(year => (
      <motion.div 
        key={year.id}
        whileHover={{ scale: 1.02 }}
        className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900 ${
          year.status === 'Current' 
            ? 'ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/20' 
            : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className={`p-1.5 rounded-lg ${
                year.status === 'Current' 
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <Calendar className="h-5 w-5" />
              </span>
              FY {year.year}
              {year.status === 'Current' && (
                <span className="text-xs font-normal bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-200">
                  Current
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {year.start} - {year.end}
            </p>
          </div>
          <Badge 
            variant={
              year.status === 'Current' ? 'default' : 
              year.status === 'Planning' ? 'secondary' : 'outline'
            }
            className="capitalize"
          >
            {year.status}
          </Badge>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Q1</p>
            <p className="font-medium">$1.2M</p>
          </div>
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Q2</p>
            <p className="font-medium">$1.5M</p>
          </div>
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Q3</p>
            <p className="font-medium">$1.8M</p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const HierarchyOverview: React.FC<HierarchyOverviewProps> = ({ hierarchy }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {hierarchy.levels.map(level => (
        <motion.div 
          key={level.id}
          whileHover={{ scale: 1.03 }}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{level.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{level.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
    
    <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-900">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
          <ArrowRight className="h-5 w-5" />
        </span>
        Reporting Structure
      </h3>
      <div className="space-y-2">
        {hierarchy.structure.map((link, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
            <div className="font-medium min-w-[80px] text-right">{link.from}</div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className="font-medium">{link.to}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const UserOverview: React.FC<UserOverviewProps> = ({ users }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {users.map(user => (
      <motion.div 
        key={user.id}
        whileHover={{ scale: 1.03 }}
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
      >
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            <Badge 
              variant={user.status === 'active' ? 'default' : 'outline'} 
              className="px-2 py-0.5 text-xs"
            >
              {user.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Last Active:</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {user.lastLogin}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            View Profile
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            Message
          </Button>
        </div>
      </motion.div>
    ))}
  </div>
);

// Dashboard types
type StatKey = 'branches' | 'departments' | 'fiscalYears' | 'hierarchyLevels' | 'activeUsers';

interface Stats {
  branches: number;
  departments: number;
  fiscalYears: number;
  hierarchyLevels: number;
  activeUsers: number;
}

// Animation variants
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

// Sample data
const branchData: Branch[] = [
  { id: 1, name: 'Headquarters', location: 'New York', status: 'active', users: 45 },
  { id: 2, name: 'West Coast', location: 'San Francisco', status: 'active', users: 32 },
  { id: 3, name: 'Europe', location: 'London', status: 'active', users: 28 },
  { id: 4, name: 'Asia', location: 'Singapore', status: 'active', users: 22 },
  { id: 5, name: 'Africa', location: 'Addis Ababa', status: 'active', users: 28 },
  { id: 6, name: 'Middle East', location: 'UAE', status: 'active', users: 22 }
];

const departmentData: Department[] = [
  { id: 1, name: 'Finance', head: 'Sarah Johnson', employees: 18, budget: '$2.5M' },
  { id: 2, name: 'Human Resources', head: 'Michael Chen', employees: 12, budget: '$1.2M' },
  { id: 3, name: 'Operations', head: 'David Wilson', employees: 35, budget: '$3.8M' },
  { id: 4, name: 'IT', head: 'Emily Rodriguez', employees: 15, budget: '$2.1M' }
];

const fiscalYearData: FiscalYear[] = [
  { id: 1, year: '2023/2024', start: 'Jan 1, 2023', end: 'Dec 31, 2023', status: 'Closed' },
  { id: 2, year: '2024/2025', start: 'Jan 1, 2024', end: 'Dec 31, 2024', status: 'Current' },
  { id: 3, year: '2024/2025', start: 'Jan 1, 2025', end: 'Dec 31, 2025', status: 'Planning' }
];

const hierarchyData: HierarchyData = {
  levels: [
    { id: 1, name: 'Executive', description: 'C-level management' },
    { id: 2, name: 'Department Heads', description: 'Functional leaders' },
    { id: 3, name: 'Managers', description: 'Team supervisors' },
    { id: 4, name: 'Staff', description: 'Individual contributors' }
  ],
  structure: [
    { from: 'CEO', to: 'CFO' },
    { from: 'CEO', to: 'COO' },
    { from: 'CFO', to: 'Finance Director' },
    { from: 'COO', to: 'Operations Manager' }
  ]
};

const userData: User[] = [
  { id: 1, name: 'John Smith', email: 'john@company.com', role: 'Admin', lastLogin: '2 hours ago', status: 'active' },
  { id: 2, name: 'Jane Doe', email: 'jane@company.com', role: 'Finance Manager', lastLogin: '1 day ago', status: 'active' },
  { id: 3, name: 'Robert Johnson', email: 'robert@company.com', role: 'HR Specialist', lastLogin: '3 days ago', status: 'active' },
  { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'IT Support', lastLogin: '1 week ago', status: 'inactive' }
];

const CoreDashboard = () => {
  const activeModule = useModuleStore((s) => s.activeModule);
  
  const stats: Stats = {
    branches: branchData.length,
    departments: departmentData.length,
    fiscalYears: fiscalYearData.length,
    hierarchyLevels: hierarchyData.levels.length,
    activeUsers: userData.filter(u => u.status === 'active').length
  };

  const statConfig = {
    branches: {
      icon: <Building className="h-4 w-4 text-emerald-600" />,
      title: 'Branches',
      description: 'Operational units'
    },
    departments: {
      icon: <Users className="h-4 w-4 text-emerald-500" />,
      title: 'Departments',
      description: 'Functional divisions'
    },
    fiscalYears: {
      icon: <Calendar className="h-4 w-4 text-emerald-500" />,
      title: 'Current Year',
      description: 'Active fiscal period'
    },
    hierarchyLevels: {
      icon: <Layers className="h-4 w-4 text-emerald-400" />,
      title: 'Hierarchy Levels',
      description: 'Organizational levels'
    },
    activeUsers: {
      icon: <User className="h-4 w-4 text-emerald-600" />,
      title: 'Active Users',
      description: 'System users'
    }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <section className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeModule === 'Core' ? 'Core Module' : 'Dashboard'}
            </h1>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100">
              Active
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Central hub for managing organizational structure, financial periods, and user access.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={16} />
            <span>New</span>
          </Button>
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
                  {key === 'fiscalYears' 
                    ? fiscalYearData.find(y => y.status === 'Current')?.year || 'N/A'
                    : stats[key]
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {key === 'fiscalYears'
                    ? fiscalYearData.find(y => y.status === 'Current') 
                        ? `${fiscalYearData.find(y => y.status === 'Current')?.start} - ${fiscalYearData.find(y => y.status === 'Current')?.end}`
                        : 'No active fiscal year'
                    : statConfig[key].description
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Components Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-500" />
              <span>Branch Overview</span>
            </CardTitle>
            <CardDescription>
              Manage multi-location operations, inventory, and financial reporting by branch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BranchOverview branches={branchData} />
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Department Overview</span>
            </CardTitle>
            <CardDescription>
              Organize functional divisions, roles, and departmental resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentOverview departments={departmentData} />
          </CardContent>
        </Card>

        {/* Fiscal Year Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span>Fiscal Year Overview</span>
            </CardTitle>
            <CardDescription>
              Configure financial periods, budgets, and compliance reporting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FiscalYearOverview fiscalYears={fiscalYearData} />
          </CardContent>
        </Card>

        {/* Hierarchy Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" />
              <span>Hierarchy Overview</span>
            </CardTitle>
            <CardDescription>
              Define organizational structure, workflows, and access control.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HierarchyOverview hierarchy={hierarchyData} />
          </CardContent>
        </Card>

        {/* User Overview */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-rose-500" />
              <span>User Overview</span>
            </CardTitle>
            <CardDescription>
              Manage system access, roles, permissions, and activity logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserOverview users={userData} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>

  );
};

export default CoreDashboard;