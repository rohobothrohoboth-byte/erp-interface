import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  RefreshCw, ClipboardList, Target, TrendingUp, Users, Calendar,
  CheckCircle2, Clock, AlertCircle, BarChart3, BookOpen, Lightbulb,
  MoreVertical, ArrowUpRight,
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

const plans = [
  { id: 1, title: 'Q2 Strategic Plan', status: 'active', progress: 68, owner: 'Abebe T.', due: '2026-06-30', priority: 'High' },
  { id: 2, title: 'Digital Transformation Roadmap', status: 'review', progress: 42, owner: 'Sara M.', due: '2026-09-15', priority: 'Medium' },
  { id: 3, title: 'Capacity Building Program', status: 'active', progress: 85, owner: 'Yonas K.', due: '2026-05-20', priority: 'High' },
  { id: 4, title: 'Budget Allocation Plan', status: 'draft', progress: 15, owner: 'Hana G.', due: '2026-07-01', priority: 'Low' },
];

const initiatives = [
  { id: 1, name: 'Leadership Training', dept: 'HR', budget: '120,000', spent: 72, status: 'on-track' },
  { id: 2, name: 'System Upgrade', dept: 'IT', budget: '350,000', spent: 45, status: 'at-risk' },
  { id: 3, name: 'Market Expansion', dept: 'Sales', budget: '200,000', spent: 90, status: 'on-track' },
  { id: 4, name: 'Process Automation', dept: 'Ops', budget: '180,000', spent: 30, status: 'delayed' },
];

const activities = [
  { id: 1, user: 'Abebe T.', action: 'updated', target: 'Q2 Strategic Plan', time: '15 min ago', icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
  { id: 2, user: 'Sara M.', action: 'commented on', target: 'Digital Roadmap', time: '1 hr ago', icon: <BookOpen className="h-4 w-4 text-blue-500" /> },
  { id: 3, user: 'Yonas K.', action: 'submitted', target: 'Capacity Report', time: '2 hrs ago', icon: <ClipboardList className="h-4 w-4 text-indigo-500" /> },
  { id: 4, user: 'Hana G.', action: 'created', target: 'Budget Plan Draft', time: '3 hrs ago', icon: <Lightbulb className="h-4 w-4 text-amber-500" /> },
];

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  review: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-600',
  'on-track': 'bg-green-100 text-green-700',
  'at-risk': 'bg-amber-100 text-amber-700',
  delayed: 'bg-red-100 text-red-700',
};

const PlanDevDashboard = () => {
  const activeModule = useModuleStore((s) => s.activeModule);

  const stats = [
    { label: 'Active Plans', value: '12', icon: <ClipboardList className="h-4 w-4 text-indigo-600" />, desc: 'Currently in progress' },
    { label: 'Initiatives', value: '28', icon: <Target className="h-4 w-4 text-sky-600" />, desc: 'Across all departments' },
    { label: 'Completion Rate', value: '74%', icon: <TrendingUp className="h-4 w-4 text-green-600" />, desc: 'This quarter' },
    { label: 'Team Members', value: '45', icon: <Users className="h-4 w-4 text-purple-600" />, desc: 'Involved in planning' },
    { label: 'Upcoming Reviews', value: '6', icon: <Calendar className="h-4 w-4 text-amber-600" />, desc: 'Next 30 days' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Plan & Development</h1>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">Active</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">Manage strategic plans, initiatives, and organizational development programs.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <ClipboardList size={16} /> New Plan
          </Button>
        </div>
      </section>

      {/* Stats */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={cardVariants}>
            <Card className="hover:shadow-lg hover:ring-1 hover:ring-indigo-400 transition-all">
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
        {/* Plans */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-500" /> Strategic Plans
            </CardTitle>
            <CardDescription>Active and in-review plans with progress tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{p.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status]}`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span>{p.owner}</span><span>•</span><span>Due {p.due}</span>
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

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" /> Recent Activity
            </CardTitle>
            <CardDescription>Latest updates across all plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="mt-0.5">{a.icon}</div>
                <div>
                  <p className="text-sm"><span className="font-medium">{a.user}</span> {a.action} <span className="font-medium">{a.target}</span></p>
                  <p className="text-xs text-gray-500">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Initiatives */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-sky-500" /> Key Initiatives
            </CardTitle>
            <CardDescription>Budget utilization and status per initiative.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {initiatives.map((i) => (
                <div key={i.id} className="p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{i.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[i.status]}`}>{i.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Dept: {i.dept} · Budget: ETB {i.budget}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={i.spent} className="h-2 flex-1" />
                    <span className="text-xs font-semibold text-gray-600">{i.spent}%</span>
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

export default PlanDevDashboard;
