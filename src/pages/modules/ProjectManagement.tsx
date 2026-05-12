import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  RefreshCw, BriefcaseBusiness, Kanban, Users, Calendar, Clock,
  CheckCircle2, AlertCircle, BarChart3, ListTodo, Milestone,
  MoreVertical, Plus, TrendingUp,
} from 'lucide-react';
import { useModuleStore } from '../../stores/module.store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};
const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
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
];

const milestones = [
  { id: 1, name: 'ERP Phase 1 Kickoff', date: 'May 15, 2026', status: 'upcoming' },
  { id: 2, name: 'Renovation Design Approval', date: 'May 20, 2026', status: 'upcoming' },
  { id: 3, name: 'Wellness Survey Launch', date: 'May 10, 2026', status: 'overdue' },
  { id: 4, name: 'Annual Report Submission', date: 'Apr 30, 2026', status: 'completed' },
];

const statusColor: Record<string, string> = {
  'in-progress': 'bg-blue-100 text-blue-700',
  'on-hold': 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  todo: 'bg-gray-100 text-gray-600',
  done: 'bg-green-100 text-green-700',
  upcoming: 'bg-sky-100 text-sky-700',
  overdue: 'bg-red-100 text-red-700',
};

const ProjectManagementDashboard = () => {
  const activeModule = useModuleStore((s) => s.activeModule);

  const stats = [
    { label: 'Active Projects', value: '8', icon: <BriefcaseBusiness className="h-4 w-4 text-yellow-600" />, desc: 'Currently running' },
    { label: 'Total Tasks', value: '134', icon: <ListTodo className="h-4 w-4 text-blue-600" />, desc: 'Across all projects' },
    { label: 'Completed', value: '89', icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, desc: 'Tasks done this month' },
    { label: 'Team Members', value: '22', icon: <Users className="h-4 w-4 text-purple-600" />, desc: 'Assigned to projects' },
    { label: 'Overdue', value: '5', icon: <AlertCircle className="h-4 w-4 text-red-500" />, desc: 'Needs attention' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Active</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">Track projects, tasks, milestones, and team performance in one place.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50">
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button size="sm" className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
            <Plus size={16} /> New Project
          </Button>
        </div>
      </section>

      {/* Stats */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={cardVariants}>
            <Card className="hover:shadow-lg hover:ring-1 hover:ring-yellow-400 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{s.label}</CardTitle>
                {s.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Kanban className="h-5 w-5 text-yellow-500" /> Projects Overview
            </CardTitle>
            <CardDescription>Progress and status of all active projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status]}`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {p.team.map((t) => (
                      <Avatar key={t} className="w-5 h-5">
                        <AvatarFallback className="text-[9px] bg-yellow-100 text-yellow-700">{t}</AvatarFallback>
                      </Avatar>
                    ))}
                    <span className="text-xs text-gray-400">· Due {p.due}</span>
                  </div>
                  <Progress value={p.progress} className="h-1.5" />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700">{p.progress}%</span>
                  <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Milestone className="h-5 w-5 text-purple-500" /> Milestones
            </CardTitle>
            <CardDescription>Upcoming and recent milestones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                  m.status === 'completed' ? 'bg-green-500' :
                  m.status === 'overdue' ? 'bg-red-500' : 'bg-sky-500'
                }`} />
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.date}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColor[m.status]}`}>{m.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-blue-500" /> Recent Tasks
            </CardTitle>
            <CardDescription>Latest tasks across all projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      t.status === 'done' ? 'bg-green-500' :
                      t.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.project} · {t.assignee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" />{t.due}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[t.status]}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProjectManagementDashboard;
