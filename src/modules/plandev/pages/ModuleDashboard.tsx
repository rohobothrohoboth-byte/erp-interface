import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import {
  RefreshCw, ClipboardList, Target, TrendingUp, Users, Calendar,
  CheckCircle2, Clock, AlertCircle, BarChart3, BookOpen, Lightbulb,
  MoreVertical, ArrowUpRight, Plus, Sun, Moon, Activity, Shield,
  Sparkles, Filter, Download, Eye, Edit, Trash2, Rocket,
  Award, Crown, Layers, GitBranch, DollarSign, Building2,
  AlertTriangle, ShieldAlert, ShieldCheck, ShieldX
} from 'lucide-react';
import { useModuleStore } from '@/shared/stores/module.store';
import { getProjects, getTasksByProject, getMilestonesByProject } from '@/modules/plandev/services/project.api';
import type { Project, Task, Milestone } from '@/modules/plandev/types/types';

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
const getStatColor = (color: string) => {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    sky: 'from-sky-500 to-sky-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };
  return colors[color] || colors.indigo;
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

const statusColor: Record<string, string> = {
  Planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  OnHold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColor: Record<string, string> = {
  Low: 'text-emerald-600 dark:text-emerald-400',
  Medium: 'text-amber-600 dark:text-amber-400',
  High: 'text-red-600 dark:text-red-400',
  Critical: 'text-purple-600 dark:text-purple-400',
};

const planTypeColors: Record<string, string> = {
  Strategic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Corporate: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Business: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Functional: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Operational: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Innovation: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

const PlanDevDashboard = () => {
  const activeModule = useModuleStore((s) => s.activeModule);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const prefersReducedMotion = useReducedMotion();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch real data
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, []);

  const buttonVariants = useMemo(() => ({
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  }), [prefersReducedMotion]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'Active');
    const planningProjects = projects.filter(p => p.status === 'Planning');
    const completedProjects = projects.filter(p => p.status === 'Completed');
    const totalPlanned = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
    const totalActual = projects.reduce((acc, p) => acc + (p.actualCost || 0), 0);
    const avgProgress = projects.length > 0
        ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
        : 0;
    const totalTasks = projects.reduce((acc, p) => acc + (p.taskCount || 0), 0);
    const totalMilestones = projects.reduce((acc, p) => acc + (p.milestoneCount || 0), 0);

    return [
      {
        label: 'Total Plans',
        value: projects.length.toString(),
        icon: <ClipboardList className="h-4 w-4" />,
        desc: 'Strategic plans',
        color: 'indigo'
      },
      {
        label: 'Active',
        value: activeProjects.length.toString(),
        icon: <Rocket className="h-4 w-4" />,
        desc: 'In progress',
        color: 'emerald'
      },
      {
        label: 'Avg Progress',
        value: `${avgProgress}%`,
        icon: <TrendingUp className="h-4 w-4" />,
        desc: 'Completion rate',
        color: 'sky'
      },
      {
        label: 'Budget',
        value: formatCurrency(totalPlanned),
        icon: <DollarSign className="h-4 w-4" />,
        desc: 'Total planned',
        color: 'purple'
      },
      {
        label: 'Tasks',
        value: totalTasks.toString(),
        icon: <CheckCircle2 className="h-4 w-4" />,
        desc: 'Across all plans',
        color: 'amber'
      },
    ];
  }, [projects]);

  // Prepare plans data from real API
  const plans = useMemo(() => {
    return projects.map(p => ({
      id: p.id,
      title: p.name,
      status: p.status.toLowerCase(),
      progress: p.progress || 0,
      owner: p.managerName || 'Unassigned',
      due: p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A',
      priority: p.priority || 'Medium',
      projectType: p.projectType || 'Strategic',
      department: p.department || 'N/A',
      tasks: p.taskCount || 0,
      milestones: p.milestoneCount || 0
    }));
  }, [projects]);

  // Get status distribution for dashboard
  const statusDistribution = useMemo(() => {
    const counts = {
      Active: 0,
      Planning: 0,
      OnHold: 0,
      Completed: 0,
      Cancelled: 0
    };
    projects.forEach(p => {
      if (counts.hasOwnProperty(p.status)) {
        counts[p.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [projects]);

  // Get priority distribution
  const priorityDistribution = useMemo(() => {
    const counts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };
    projects.forEach(p => {
      if (counts.hasOwnProperty(p.priority)) {
        counts[p.priority as keyof typeof counts]++;
      }
    });
    return counts;
  }, [projects]);

  if (loading && projects.length === 0) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading dashboard...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 dark:from-indigo-400/5 dark:to-purple-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 dark:from-emerald-400/5 dark:to-teal-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-6 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Plan & Development</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Strategic Planning Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {projects.length} strategic plans • {stats[3].value} budget • {stats[4].value} tasks
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
                  className="gap-2 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </Button>

              <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                <Plus size={16} />
                <span>New Plan</span>
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
                  <Card className="hover:shadow-lg hover:ring-1 hover:ring-indigo-400 dark:hover:ring-indigo-600 transition-all border-slate-200 dark:border-slate-700">
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

          {/* Status & Priority Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(statusDistribution).map(([status, count]) => (
                      <div key={status} className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-24 ${statusColor[status] || statusColor.Planning}`}>
                      {status}
                    </span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                              className={`h-full rounded-full ${status === 'Active' ? 'bg-emerald-500' :
                                  status === 'Completed' ? 'bg-purple-500' :
                                      status === 'Planning' ? 'bg-blue-500' :
                                          status === 'OnHold' ? 'bg-amber-500' :
                                              'bg-red-500'
                              }`}
                              style={{ width: projects.length > 0 ? `${(count / projects.length) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-8">{count}</span>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(priorityDistribution).map(([priority, count]) => (
                      <div key={priority} className="flex items-center gap-2">
                    <span className={`text-xs font-medium w-24 ${priorityColor[priority] || priorityColor.Medium}`}>
                      {priority}
                    </span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                              className={`h-full rounded-full ${priority === 'Critical' ? 'bg-purple-500' :
                                  priority === 'High' ? 'bg-red-500' :
                                      priority === 'Medium' ? 'bg-amber-500' :
                                          'bg-emerald-500'
                              }`}
                              style={{ width: projects.length > 0 ? `${(count / projects.length) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-8">{count}</span>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plans Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg text-indigo-700 dark:text-indigo-300">
                      <ClipboardList className="h-5 w-5" />
                      Strategic Plans
                    </CardTitle>
                    <CardDescription>{projects.length} plans with progress tracking</CardDescription>
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
                {plans.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No strategic plans found</p>
                      <p className="text-sm mt-1">Create your first strategic plan to get started</p>
                    </div>
                ) : (
                    plans.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{p.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status] || statusColor.Planning}`}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                              <span className={`text-xs font-medium ${priorityColor[p.priority]}`}>{p.priority}</span>
                              {p.projectType && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planTypeColors[p.projectType] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {p.projectType}
                          </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                              <span>Owner: {p.owner}</span>
                              <span>•</span>
                              <span>Due: {p.due}</span>
                              {p.department && <span>• {p.department}</span>}
                              {p.tasks > 0 && <span>• {p.tasks} tasks</span>}
                              {p.milestones > 0 && <span>• {p.milestones} milestones</span>}
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
                    ))
                )}
              </CardContent>
            </Card>
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
                <span>Live Planning Data</span>
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

export default PlanDevDashboard;