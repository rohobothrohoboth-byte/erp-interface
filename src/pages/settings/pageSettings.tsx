import { motion } from 'framer-motion'
import {
  Users,
  Building,
  CreditCard,
  ShoppingCart,
  Package,
  FileText,
  Settings as SettingsIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  MessageSquare,
  Zap,
  Shield
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

// Animation variants - reduced for performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
}

// Module settings cards - with better color differentiation
const mainSettingsCards = [
  { id: 1, title: "Core Module", icon: SettingsIcon, href: "/settings/core", color: "slate" },
  { id: 2, title: "HRM Module", icon: Users, href: "/settings/hr", color: "blue" },
  { id: 3, title: "CRM Module", icon: Building, href: "/settings/crm", color: "emerald" },
  { id: 4, title: "Finance Module", icon: CreditCard, href: "/settings/finance", color: "purple" },
  { id: 5, title: "Procurement Module", icon: ShoppingCart, href: "/settings/procurement", color: "orange" },
  { id: 6, title: "Inventory Module", icon: Package, href: "/settings/inventory", color: "amber" },
  { id: 7, title: "File Management", icon: FileText, href: "/settings/file", color: "rose" }
]

const getModuleColors = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    slate: { bg: 'bg-slate-50 dark:bg-slate-900/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800', hover: 'hover:border-slate-300 dark:hover:border-slate-700' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', hover: 'hover:border-blue-300 dark:hover:border-blue-700' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', hover: 'hover:border-emerald-300 dark:hover:border-emerald-700' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', hover: 'hover:border-purple-300 dark:hover:border-purple-700' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', hover: 'hover:border-orange-300 dark:hover:border-orange-700' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', hover: 'hover:border-amber-300 dark:hover:border-amber-700' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', hover: 'hover:border-rose-300 dark:hover:border-rose-700' }
  }
  return colors[color] || colors.slate
}

// Activity Feed Component
const ActivityFeed = () => {
  const activities = [
    { id: 1, user: 'John Doe', action: 'updated module settings', time: '5 min ago', type: 'update', module: 'HRM' },
    { id: 2, user: 'Sarah Chen', action: 'added new department', time: '1 hour ago', type: 'create', module: 'Core' },
    { id: 3, user: 'Mike Ross', action: 'configured payroll', time: '3 hours ago', type: 'config', module: 'Finance' },
    { id: 4, user: 'Lisa Wong', action: 'updated user permissions', time: '5 hours ago', type: 'update', module: 'Security' }
  ]

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'update': return <SettingsIcon className="w-3 h-3" />
      case 'create': return <CheckCircle className="w-3 h-3" />
      case 'config': return <Zap className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-slate-500"> {activity.action}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs px-1.5">{activity.module}</Badge>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
  )
}

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    { label: 'Add User', icon: Users, href: '/settings/users/add' },
    { label: 'Configure Module', icon: SettingsIcon, href: '/settings/modules' },
    { label: 'Backup Data', icon: Shield, href: '/settings/backup' },
    { label: 'System Logs', icon: FileText, href: '/settings/logs' }
  ]

  return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
                <Button key={action.label} variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs">
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </Button>
            ))}
          </div>
        </CardContent>
      </Card>
  )
}

// Employee Trends Component
const EmployeeTrends = () => {
  const data = [
    { month: 'Jan', hires: 12, terminations: 3 },
    { month: 'Feb', hires: 8, terminations: 2 },
    { month: 'Mar', hires: 15, terminations: 4 },
    { month: 'Apr', hires: 10, terminations: 3 },
    { month: 'May', hires: 18, terminations: 2 },
    { month: 'Jun', hires: 14, terminations: 5 }
  ]

  const maxValue = Math.max(...data.flatMap(d => [d.hires, d.terminations]))

  return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Employee Trends
            </CardTitle>
            <Badge variant="outline" className="text-xs">+12% vs last period</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {data.map((item) => (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{item.month}</span>
                    <div className="flex gap-3">
                      <span className="text-emerald-600">+{item.hires}</span>
                      <span className="text-rose-600">-{item.terminations}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(item.hires / maxValue) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${(item.terminations / maxValue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
  )
}

// Attendance Graph Component
const AttendanceGraph = () => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const attendance = [92, 88, 95, 89, 91, 78, 65]

  return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weekly Attendance
            </CardTitle>
            <span className="text-xs text-emerald-600 font-medium">88% avg</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end gap-2 h-32">
            {attendance.map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                      className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                      style={{ height: `${(value / 100) * 100}px` }}
                  />
                  <span className="text-xs text-slate-400">{days[i]}</span>
                  <span className="text-[10px] font-medium">{value}%</span>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
  )
}

// AI Insights Panel
const AIInsightsPanel = () => {
  const insights = [
    { title: 'HR Efficiency', message: 'Department headcount increased by 15% this quarter', type: 'positive', metric: '+15%' },
    { title: 'System Health', message: 'All modules operating at optimal performance', type: 'positive', metric: '99.9%' },
    { title: 'Pending Actions', message: '3 user permissions require review', type: 'warning', metric: '3' }
  ]

  return (
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-900">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-sm font-semibold">AI Insights</CardTitle>
            <Badge className="ml-auto bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-0 text-xs">
              Beta
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/50 dark:bg-white/5">
                  <div className={`p-1 rounded-full ${
                      insight.type === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-amber-100 dark:bg-amber-900'
                  }`}>
                    {insight.type === 'positive' ? (
                        <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{insight.title}</p>
                    <p className="text-xs text-slate-500">{insight.message}</p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{insight.metric}</span>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
  )
}

// Settings Card Component
const SettingsCard = ({ title, icon: Icon, href, color }: any) => {
  const colors = getModuleColors(color)

  return (
      <a href={href} className="block group">
        <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-200`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure settings</p>
            </div>
          </div>
        </div>
      </a>
  )
}

function PageSettings() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check for dark mode preference
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header - Reduced height */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage system configurations</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleDarkMode} className="gap-2">
                  {darkMode ? '🌙' : '☀️'}
                  {darkMode ? 'Dark' : 'Light'}
                </Button>
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <SettingsIcon className="w-4 h-4" />
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Settings Cards */}
            <div className="lg:col-span-2 space-y-4">
              {/* Module Settings Section */}
              <div>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Modules Configuration</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mainSettingsCards.map((card) => (
                      <SettingsCard key={card.id} {...card} />
                  ))}
                </div>
              </div>

              {/* Analytics Widgets - More compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EmployeeTrends />
                <AttendanceGraph />
              </div>
            </div>

            {/* Right Column - Insights & Activity */}
            <div className="space-y-4">
              <AIInsightsPanel />
              <QuickActions />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
  )
}

export default PageSettings