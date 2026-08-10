import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  RefreshCw, BriefcaseBusiness, Kanban, Users, Calendar, Clock,
  CheckCircle2, AlertCircle, BarChart3, ListTodo, Milestone,
  MoreVertical, Plus, TrendingUp, Sun, Moon, Activity, Shield,
  Sparkles, Filter, Download, Eye, Edit, Trash2, Target, Flag
} from 'lucide-react';
import { useModuleStore } from '@/shared/stores/module.store';

// Dark mode hook
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return { isDarkMode, toggleDarkMode };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, when: "beforeChildren" }
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20, duration: 0.3 }
  },
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, duration: 0.2 }
  },
};

const projects = [
  { id: 1, name: 'ERP System Implementation', status: 'in-progress', progress: 62, team: ['AT', 'SM', 'YK'], due: '2026-08-01', priority: 'High' },
  { id: 2, name: 'Office Renovation', status: 'on-hold', progress: 30, team: ['HG', 'BT'], due: '2026-07-15', priority: 'Medium' },
  { id: 3, name: 'Annual Report 2025', status: 'completed', progress: 100, team: ['AT', 'HG', 'SM'], due: '2026-04-30', priority: 'High' },
  { id: 4, name: 'Staff Wellness Program', status: 'in-progress', progress: 48, team: ['YK', 'BT'], due: '2026-06-20', priority: 'Low' },
];

const tasks = [
  { id: 1, title: 'Finalize system requirements', project: 'ERP Implementation', assignee: 'Abebe T.', due: 'May 10', status: 'todo' },
  { id: 2, title: 'Vendor evaluation meeting', project: 'ERP Implementation', assignee: 'Sara M.', due: 'May 12', status: 'in-progress' },
  { id: 3, title: 'Submit renovation proposal', project: 'Office Renovation', assignee: 'Hana G.', due: 'May 14', status: 'todo' },
  { id: 4, title: 'Review wellness survey results', project: 'Wellness Program', assignee: 'Yonas K.', due: 'May 9', status: 'done' },
  { id: 5, title: 'Prepare Q2 project report', project: 'Annual Report', assignee: 'Abebe T.', due: 'May 8', status: 'done' },
  { id: 6, title: 'System architecture review', project: 'ERP Implementation', assignee: 'Sara M.', due: 'May 15', status: 'in-progress' },
];

const milestones = [
  { id: 1, name: 'ERP Phase 1 Kickoff', date: 'May 15, 2026', status: 'upcoming' },
  { id: 2, name: 'Renovation Design Approval', date: 'May 20, 2026', status: 'upcoming' },
  { id: 3, name: 'Wellness Survey Launch', date: 'May 10, 2026', status: 'overdue' },
  { id: 4, name: 'Annual Report Submission', date: 'Apr 30, 2026', status: 'completed' },
];

const teamMembers = [
  { name: 'Abebe T.', role: 'Project Manager', avatar: 'AT', tasks: 12, completed: 8 },
  { name: 'Sara M.', role: 'Business Analyst', avatar: 'SM', tasks: 10, completed: 6 },
  { name: 'Yonas K.', role: 'Developer', avatar: 'YK', tasks: 15, completed: 10 },
  { name: 'Hana G.', role: 'Designer', avatar: 'HG', tasks: 8, completed: 5 },
  { name: 'Betty T.', role: 'QA Engineer', avatar: 'BT', tasks: 9, completed: 7 },
];

const statusColor: Record<string, string> = {
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'on-hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  upcoming: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColor: Record<string, string> = {
  High: 'text-red-600 dark:text-red-400',
  Medium: 'text-amber-600 dark:text-amber-400',
  Low: 'text-emerald-600 dark:text-emerald-400',
};

// Team Performance Component
const TeamPerformance = () => {
  return (
      <Card className="border-yellow-200 dark:border-yellow-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Performance
              </CardTitle>
              <CardDescription>Task completion by team members</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              View all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member, idx) => {
              const completionRate = (member.completed / member.tasks) * 100;
              return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{member.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {member.completed}/{member.tasks}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">completed</p>
                      </div>
                    </div>
                    <Progress value={completionRate} className="h-1.5" />
                  </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
  );
};

// Project Timeline Component
const ProjectTimeline = () => {
  return (
      <Card className="border-yellow-200 dark:border-yellow-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Project Timeline
              </CardTitle>
              <CardDescription>Key dates and deadlines</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                        project.status === 'completed' ? 'bg-emerald-500' :
                            project.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Due: {project.due}</span>
                    <Badge className={`text-xs ${statusColor[project.status]}`}>{project.status}</Badge>
                  </div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
  );
};

const ProjectManagementDashboard = () => {
  const activeModule = useModuleStore((s) => s.activeModule);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const prefersReducedMotion = useReducedMotion();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const buttonVariants = useMemo(() => ({
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  }), [prefersReducedMotion]);

  const stats = [
    { label: 'Active Projects', value: '8', icon: <BriefcaseBusiness className="h-4 w-4" />, desc: 'Currently running', color: 'yellow' },
    { label: 'Total Tasks', value: '134', icon: <ListTodo className="h-4 w-4" />, desc: 'Across all projects', color: 'blue' },
    { label: 'Completed', value: '89', icon: <CheckCircle2 className="h-4 w-4" />, desc: 'Tasks done this month', color: 'emerald' },
    { label: 'Team Members', value: '22', icon: <Users className="h-4 w-4" />, desc: 'Assigned to projects', color: 'purple' },
    { label: 'Overdue', value: '5', icon: <AlertCircle className="h-4 w-4" />, desc: 'Needs attention', color: 'red' },
  ];

  const getStatColor = (color: string) => {
    const colors: Record<string, string> = {
      yellow: 'from-yellow-500 to-yellow-600',
      blue: 'from-blue-500 to-blue-600',
      emerald: 'from-emerald-500 to-emerald-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
    };
    return colors[color] || colors.yellow;
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50/30 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 dark:from-yellow-400/5 dark:to-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 dark:from-blue-400/5 dark:to-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-6 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full" />
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Project Management</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Project Management Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Track projects, tasks, milestones, and team performance in one place
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Activity size={14} />
                <span className="font-mono">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
              </div>

              <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-2 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </Button>

              <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 transition-all"
              >
                <Plus size={16} />
                <span>New Project</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
          >
            {stats.map((s, index) => (
                <motion.div key={s.label} variants={cardVariants}>
                  <Card className="hover:shadow-lg hover:ring-1 hover:ring-yellow-400 dark:hover:ring-yellow-600 transition-all border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</CardTitle>
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatColor(s.color)} bg-opacity-10`}>
                        <div className="text-white">{s.icon}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
            ))}
          </motion.div>

          {/* Main Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects Section */}
            <div className="lg:col-span-2">
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg text-yellow-700 dark:text-yellow-300">
                        <Kanban className="h-5 w-5" />
                        Projects Overview
                      </CardTitle>
                      <CardDescription>Progress and status of all active projects</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status]}`}>{p.status}</span>
                            <span className={`text-xs font-medium ${priorityColor[p.priority]}`}>{p.priority} Priority</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {p.team.map((t) => (
                                <Avatar key={t} className="w-5 h-5">
                                  <AvatarFallback className="text-[9px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">{t}</AvatarFallback>
                                </Avatar>
                            ))}
                            <span className="text-xs text-slate-400">Due {p.due}</span>
                          </div>
                          <Progress value={p.progress} className="h-1.5" />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{p.progress}%</span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            <div>
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg text-purple-700 dark:text-purple-300">
                        <Milestone className="h-5 w-5" />
                        Milestones
                      </CardTitle>
                      <CardDescription>Upcoming and recent milestones</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      View all
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {milestones.map((m) => (
                      <div key={m.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                            m.status === 'completed' ? 'bg-emerald-500' :
                                m.status === 'overdue' ? 'bg-red-500' : 'bg-sky-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{m.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{m.date}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[m.status]} mt-1 inline-block`}>
                        {m.status}
                      </span>
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Tasks Section */}
            <div className="lg:col-span-3">
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-300">
                        <ListTodo className="h-5 w-5" />
                        Recent Tasks
                      </CardTitle>
                      <CardDescription>Latest tasks across all projects</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View all tasks
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tasks.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                t.status === 'done' ? 'bg-emerald-500' :
                                    t.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{t.project} • {t.assignee}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />{t.due}
                        </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[t.status]}`}>
                          {t.status}
                        </span>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Performance */}
            <div className="lg:col-span-2">
              <TeamPerformance />
            </div>

            {/* Project Timeline */}
            <div>
              <ProjectTimeline />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-6"
          >
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Live Project Data</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="w-3 h-3" />
                <span>Secure Collaboration</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </motion.div>
        </div>

        <style>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 32px 32px;
        }
        .dark .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
        }
      `}</style>
      </div>
  );
};

export default ProjectManagementDashboard;