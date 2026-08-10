// src/pages/crm/CRMDashboard.tsx

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import {
  RefreshCw,
  Plus,
  User,
  Users,
  TrendingUp,
  Headphones,
  CheckCircle,
  Workflow,
  Filter,
  Download,
  BarChart4,
  Sun,
  Moon,
  Activity,
  Sparkles,
  Shield,
  Loader2,
} from "lucide-react";
import LeadOverview from "@/modules/crm/components/LeadOverview";
import ContactOverview from "@/modules/crm/components/ContactOverview";
import SalesOverview from "@/modules/crm/components/SalesOverview";
import MarketingOverview from "@/modules/crm/components/MarketingOverview";
import SupportOverview from "@/modules/crm/components/SupportOverview";
import ActivityOverview from "@/modules/crm/components/ActivityOverview";
import AnalyticsOverview from "@/modules/crm/components/AnalyticsOverview";
import WorkflowDiagram from "@/modules/crm/components/WorkflowDiagram";
import { useModuleStore } from "@/shared/stores/module.store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useCrmData } from "@/modules/crm/hooks/useCrmData";

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
    transition: {
      staggerChildren: 0.08,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.4,
    },
  },
};

const statCardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
};

type StatCardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
  loading?: boolean;
};

const StatCard = ({
                    title,
                    value,
                    change,
                    icon: Icon,
                    loading = false,
                  }: StatCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (loading) {
    return (
        <div className="p-5 rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 flex items-center shadow-sm">
          <div className="p-3 rounded-full bg-white dark:bg-slate-800 bg-opacity-70 mr-4 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-2 animate-pulse" />
          </div>
        </div>
    );
  }

  return (
      <motion.div
          variants={statCardVariants}
          initial="hidden"
          animate="visible"
          whileHover={prefersReducedMotion ? {} : "hover"}
          className="p-5 rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 flex items-center shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="p-3 rounded-full bg-white dark:bg-slate-800 bg-opacity-70 mr-4 shadow-inner">
          <Icon className="text-orange-600 dark:text-orange-400 opacity-90" size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold mt-1 text-orange-900 dark:text-orange-100">{value}</p>
            {change !== undefined && change !== 0 && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                        change > 0
                            ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                    }`}
                >
                  {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
                </motion.span>
            )}
          </div>
        </div>
      </motion.div>
  );
};

// Real data Workflow Visualization Component
const SimpleWorkflowVisualization = () => {
  const { opportunities, loading } = useCrmData();

  if (loading) {
    return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading workflow data...</span>
        </div>
    );
  }

  // Use real opportunities data for workflow steps
  const steps = opportunities?.slice(0, 5).map((opp: any, index: number) => ({
    id: opp.id || index + 1,
    title: opp.name || `Opportunity ${index + 1}`,
    person: opp.assignedToUserName || 'Unassigned',
    role: opp.stage || 'Discovery',
    order: index + 1,
    amount: opp.amount || 0,
    probability: opp.winProbability || 0,
  })) || [];

  if (steps.length === 0) {
    return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No workflow data available. Create opportunities to see them here.
        </div>
    );
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Discovery': 'bg-blue-500 dark:bg-blue-600',
      'Qualification': 'bg-purple-500 dark:bg-purple-600',
      'Proposal': 'bg-orange-500 dark:bg-orange-600',
      'Negotiation': 'bg-yellow-500 dark:bg-yellow-600',
      'ClosedWon': 'bg-green-500 dark:bg-green-600',
      'ClosedLost': 'bg-red-500 dark:bg-red-600',
    };
    return colors[role] || 'bg-gray-500 dark:bg-gray-600';
  };

  const getRoleBg = (role: string) => {
    const bgColors: Record<string, string> = {
      'Discovery': 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700',
      'Qualification': 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700',
      'Proposal': 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-700',
      'Negotiation': 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700',
      'ClosedWon': 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700',
      'ClosedLost': 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700',
    };
    return bgColors[role] || 'bg-gray-100 dark:bg-gray-900/30 border-2 border-gray-300 dark:border-gray-700';
  };

  const getRoleBadgeColor = (role: string) => {
    const badgeColors: Record<string, string> = {
      'Discovery': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
      'Qualification': 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
      'Proposal': 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
      'Negotiation': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
      'ClosedWon': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
      'ClosedLost': 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
    };
    return badgeColors[role] || 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats from real data
  const totalValue = steps.reduce((sum, s) => sum + (s.amount || 0), 0);
  const avgProbability = steps.length > 0 ? steps.reduce((sum, s) => sum + (s.probability || 0), 0) / steps.length : 0;

  return (
      <div className="w-full">
        {/* Workflow Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 mb-4">
              <Workflow className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Sales Pipeline Workflow
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {steps.length} active opportunities • Total Value: {formatCurrency(totalValue)}
            </p>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="relative flex flex-col md:flex-row items-center justify-between overflow-x-auto py-8">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 dark:from-orange-800 dark:via-orange-700 dark:to-orange-800 transform -translate-y-1/2"></div>

          {steps.map((step, index) => (
              <div key={step.id} className="relative flex flex-col items-center mb-8 md:mb-0 w-full md:w-auto min-w-[200px]">
                <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-4 ${getRoleBg(step.role)}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRoleColor(step.role)}`}>
                    <span className="text-white font-bold text-lg">{step.order}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border dark:border-slate-700 p-4 w-64 text-center">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1 truncate" title={step.title}>
                    {step.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{step.person}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(step.role)}`}>
                                    {step.role}
                                </span>
                    {step.probability > 0 && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        {step.probability}%
                                    </span>
                    )}
                  </div>
                  {step.amount > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatCurrency(step.amount)}
                      </p>
                  )}
                </div>

                {index < steps.length - 1 && (
                    <div className="md:hidden h-8 w-0.5 bg-gradient-to-b from-orange-300 to-orange-200 dark:from-orange-700 dark:to-orange-800 my-4"></div>
                )}
              </div>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Discovery</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Qualification</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Proposal</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Negotiation</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Closed Won</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Closed Lost</span>
            </div>
          </div>
          <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
            {steps.length} opportunities in pipeline • Avg. Win Probability: {Math.round(avgProbability)}% • Avg. Deal Size: {formatCurrency(totalValue / steps.length || 0)}
          </div>
        </div>
      </div>
  );
};

export default function CRMDashboard() {
  const activeModule = useModuleStore((s) => s.activeModule);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const prefersReducedMotion = useReducedMotion();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { stats, dashboardData, loading, refreshing, refresh, opportunities } = useCrmData();

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStepClick = useCallback((step: any) => {
    console.log("Workflow step clicked:", step);
  }, []);

  const handleAddStep = useCallback(() => {
    console.log("Add new step");
  }, []);

  const handleEditStep = useCallback((step: any) => {
    console.log("Edit step:", step);
  }, []);

  const handleDeleteStep = useCallback((stepId: string) => {
    console.log("Delete step:", stepId);
  }, []);

  const buttonVariants = useMemo(() => ({
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  }), [prefersReducedMotion]);

  // Calculate real stats
  const totalLeads = stats?.totalLeads || 0;
  const totalContacts = 0; // This will come from contacts API
  const pipelineValue = dashboardData?.totalRevenue || 0;
  const openTickets = 0; // This will come from tickets API
  const pendingApprovals = opportunities?.filter((o: any) => o.stage === 'Negotiation').length || 0;

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-amber-400/10 dark:from-orange-400/5 dark:to-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-400/10 to-pink-400/10 dark:from-red-400/5 dark:to-pink-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                CRM
                            </span>{" "}
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage leads, contacts, sales, marketing, support, and customer interactions
                {stats && (
                    <span className="ml-2 font-medium">
                                    • {stats.totalLeads} leads • {dashboardData?.activeOpportunities || 0} active opportunities
                                </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Current Time */}
              <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Activity size={14} />
                <span className="font-mono">
                                {formatDate(currentTime)} • {formatTime(currentTime)}
                            </span>
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              {/* Refresh Button */}
              <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={refreshing}
                  className="gap-2 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </Button>

              {/* New Entry Button */}
              <Button
                  size="sm"
                  className="flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md transition-all"
                  onClick={() => window.location.href = '/crm/leads/add'}
              >
                <Plus size={16} className="mr-2" />
                <span>New Lead</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards - Using Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            <StatCard
                title="Total Leads"
                value={totalLeads}
                change={12.5}
                icon={User}
                color="orange"
                loading={loading}
            />
            <StatCard
                title="Active Contacts"
                value={totalContacts}
                change={4.2}
                icon={Users}
                color="orange"
                loading={loading}
            />
            <StatCard
                title="Pipeline Value"
                value={`$${(pipelineValue / 1000).toFixed(1)}K`}
                change={8.7}
                icon={TrendingUp}
                color="orange"
                loading={loading}
            />
            <StatCard
                title="Open Tickets"
                value={openTickets}
                change={-3.8}
                icon={Headphones}
                color="orange"
                loading={loading}
            />
            <StatCard
                title="Pending Approvals"
                value={pendingApprovals}
                change={5.3}
                icon={CheckCircle}
                color="orange"
                loading={loading}
            />
          </div>

          {/* Workflow Tabs Section */}
          <div className="mb-8">
            <Tabs defaultValue="workflow" className="w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <TabsList className="bg-orange-50 dark:bg-orange-950/30 p-1">
                  <TabsTrigger
                      value="workflow"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:text-gray-300"
                  >
                    <Workflow className="w-4 h-4 mr-2" />
                    Dynamic Workflow
                  </TabsTrigger>
                  <TabsTrigger
                      value="approval"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:text-gray-300"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sales Pipeline
                  </TabsTrigger>
                  <TabsTrigger
                      value="analytics"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:text-gray-300"
                  >
                    <BarChart4 className="w-4 h-4 mr-2" />
                    Lead Analytics
                  </TabsTrigger>
                </TabsList>
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

              <TabsContent value="workflow" className="space-y-6">
                <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
                  <CardContent className="pt-6">
                    <WorkflowDiagram
                        editable={true}
                        onStepClick={handleStepClick}
                        onAddStep={handleAddStep}
                        onEditStep={handleEditStep}
                        onDeleteStep={handleDeleteStep}
                        height={500}
                        loading={loading}
                    />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Opportunities</p>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {dashboardData?.activeOpportunities || 0}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                          <Workflow className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {dashboardData?.winRate?.toFixed(1) || 0}%
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            ${((dashboardData?.totalRevenue || 0) / 1000).toFixed(1)}K
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                          <BarChart4 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="approval">
                <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
                  <CardHeader className="border-b border-orange-100 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-orange-900 dark:text-orange-100">
                          Sales Pipeline Visualization
                        </CardTitle>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          Visual representation of your sales opportunities by stage
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                              {opportunities?.length || 0} Opportunities
                                            </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <SimpleWorkflowVisualization />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
                  <CardHeader className="border-b border-orange-100 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-orange-900 dark:text-orange-100">
                          Lead Analytics Dashboard
                        </CardTitle>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          Comprehensive insights into lead performance and conversion metrics
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300">
                                                <BarChart4 className="w-3 h-3 mr-1" />
                                                Live Data
                                            </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">Conversion Rate</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {stats?.conversionRate?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-700 dark:text-green-300">Qualified Leads</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {stats?.qualifiedLeads || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-purple-700 dark:text-purple-300">Avg. Lead Score</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {stats?.averageLeadScore || 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      More analytics features coming soon
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LeadOverview />
            <ContactOverview />
            <SalesOverview />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <MarketingOverview />
            <SupportOverview />
            <ActivityOverview />
          </div>

          <div className="mt-6">
            <AnalyticsOverview />
          </div>

          {/* Recent Activities */}
          <div className="mt-8">
            <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
              <CardHeader className="border-b border-orange-100 dark:border-orange-800">
                <CardTitle className="text-orange-900 dark:text-orange-100">
                  Recent Workflow Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Loading activities...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                      {opportunities?.slice(0, 5).map((opp: any, index: number) => (
                          <div
                              key={opp.id || index}
                              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${
                                  opp.stage === 'ClosedWon' ? 'bg-green-500' :
                                      opp.stage === 'ClosedLost' ? 'bg-red-500' :
                                          opp.stage === 'Negotiation' ? 'bg-yellow-500' :
                                              opp.stage === 'Proposal' ? 'bg-orange-500' :
                                                  opp.stage === 'Qualification' ? 'bg-purple-500' :
                                                      'bg-blue-500'
                              }`} />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {opp.name || `Opportunity ${index + 1}`}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {opp.customerName || 'No customer'} • {opp.stage || 'Discovery'}
                                  {opp.amount && ` • $${(opp.amount / 1000).toFixed(1)}K`}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {opp.assignedToUserName || 'Unassigned'}
                            </div>
                          </div>
                      ))}
                      {(!opportunities || opportunities.length === 0) && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No opportunities found. Create your first opportunity.
                          </div>
                      )}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Live Data</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="w-3 h-3" />
                <span>Secure Connection</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>Real-time Sync</span>
              </div>
            </div>
          </div>
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
}