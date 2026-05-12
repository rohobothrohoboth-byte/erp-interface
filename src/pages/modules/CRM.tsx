import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
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
} from "lucide-react";
import LeadOverview from "../../components/crm/LeadOverview";
import ContactOverview from "../../components/crm/ContactOverview";
import SalesOverview from "../../components/crm/SalesOverview";
import MarketingOverview from "../../components/crm/MarketingOverview";
import SupportOverview from "../../components/crm/SupportOverview";
import ActivityOverview from "../../components/crm/ActivityOverview";
import AnalyticsOverview from "../../components/crm/AnalyticsOverview";
import WorkflowDiagram from "../../components/crm/WorkflowDiagram";
import { useModuleStore } from "../../stores/module.store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
      duration: 0.5,
    },
  },
};

const statCardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 10,
    },
  },
  hover: {
    scale: 1.03,
    transition: { duration: 0.2 },
  },
};

type StatCardProps = {
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
};

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
}: StatCardProps) => (
  <motion.div
    variants={statCardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    className={`p-5 rounded-xl border ${color} flex items-center shadow-sm hover:shadow-md transition-all duration-300`}
  >
    <div className="p-3 rounded-full bg-white bg-opacity-70 mr-4 shadow-inner">
      <Icon className="text-orange-600 opacity-90" size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-orange-800">{title}</p>
      <div className="flex items-center">
        <p className="text-2xl font-bold mt-1 text-orange-900">{value}</p>
        {change !== undefined && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              change > 0
                ? "bg-orange-100 text-orange-800"
                : "bg-amber-800 text-amber-100"
            }`}
          >
            {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
          </motion.span>
        )}
      </div>
    </div>
  </motion.div>
);

// Simple Workflow Visualization Component
const SimpleWorkflowVisualization = () => {
  const steps = [
    {
      id: 1,
      title: "Initial Review",
      person: "John Manager",
      role: "Manager",
      order: 1,
    },
    {
      id: 2,
      title: "Department Approval",
      person: "Sarah Wilson",
      role: "Manager",
      order: 2,
    },
    {
      id: 3,
      title: "HR Final Approval",
      person: "Michael Chen",
      role: "HR",
      order: 3,
    },
  ];

  return (
    <div className="w-full">
      {/* Workflow Header */}
      <div className="flex items-center justify-center mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Approval Workflow</h3>
          <p className="text-sm text-gray-600">
            Effective: 2024-01-01 to 2024-12-31
          </p>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="relative flex flex-col md:flex-row items-center justify-between">
        {/* Connection Lines */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 transform -translate-y-1/2"></div>

        {steps.map((step, index) => (
          <div
            key={step.id}
            className="relative flex flex-col items-center mb-8 md:mb-0 w-full md:w-auto"
          >
            {/* Step Circle */}
            <div
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                step.role === "HR"
                  ? "bg-red-100 border-2 border-red-300"
                  : step.role === "Manager"
                    ? "bg-blue-100 border-2 border-blue-300"
                    : "bg-orange-100 border-2 border-orange-300"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.role === "HR"
                    ? "bg-red-500"
                    : step.role === "Manager"
                      ? "bg-blue-500"
                      : "bg-orange-500"
                }`}
              >
                <span className="text-white font-bold text-lg">
                  {step.order}
                </span>
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-md border p-4 w-64 text-center">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {step.title}
              </h4>
              <p className="text-gray-700 text-sm mb-2">{step.person}</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  step.role === "HR"
                    ? "bg-red-100 text-red-800"
                    : step.role === "Manager"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                }`}
              >
                {step.role}
              </span>
            </div>

            {/* Mobile Connection Line */}
            {index < steps.length - 1 && (
              <div className="md:hidden h-8 w-0.5 bg-gradient-to-b from-orange-300 to-orange-200 my-4"></div>
            )}
          </div>
        ))}
      </div>

      {/* Workflow Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-sm text-gray-700">Workflow Start</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
            <span className="text-sm text-gray-700">Manager Approval (2)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
            <span className="text-sm text-gray-700">HR Approval (1)</span>
          </div>
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          3-step approval process • Average completion: 2.4 days
        </div>
      </div>
    </div>
  );
};

export default function CRMDashboard() {
  const activeModule = useModuleStore((s) => s.activeModule);

  // Orange color variants
  const cardColors = [
    "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-lg hover:ring-1 hover:ring-orange-400 transition-all",
    "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-lg hover:ring-1 hover:ring-orange-400 transition-all",
    "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-lg hover:ring-1 hover:ring-orange-400 transition-all",
    "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-lg hover:ring-1 hover:ring-orange-400 transition-all",
    "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-lg hover:ring-1 hover:ring-orange-400 transition-all",
  ];

  // Handle workflow interactions
  const handleStepClick = (step: any) => {
    console.log("Workflow step clicked:", step);
    // You can open a modal or navigate to step details
  };

  const handleAddStep = () => {
    console.log("Add new step");
    // You can open a form to add new step
  };

  const handleEditStep = (step: any) => {
    console.log("Edit step:", step);
    // You can open an edit form
  };

  const handleDeleteStep = (stepId: string) => {
    console.log("Delete step:", stepId);
    // You can show confirmation modal
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 min-h-screen bg-gray-50"
    >
      {/* Header Section */}
      <motion.section
        variants={itemVariants}
        className="mb-8 flex flex-col sm:flex-row sm:justify-between items-start sm:items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeModule === "CRM" ? (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block"
              >
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  CRM
                </span>{" "}
                Dashboard
              </motion.span>
            ) : (
              "CRM Dashboard"
            )}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-sm text-gray-600"
          >
            Manage leads, contacts, sales, marketing, support, and customer
            interactions
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex space-x-3 mt-4 sm:mt-0"
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-800 transition-colors"
          >
            <RefreshCw size={16} className="hover:animate-spin" />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            className="flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-orange-200 transition-all"
          >
            <Plus size={16} className="mr-2" />
            <span>New Entry</span>
          </Button>
        </motion.div>
      </motion.section>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8"
      >
        <StatCard
          title="Total Leads"
          value="1,248"
          change={12.5}
          icon={User}
          color={cardColors[0]}
        />
        <StatCard
          title="Active Contacts"
          value="3,742"
          change={4.2}
          icon={Users}
          color={cardColors[1]}
        />
        <StatCard
          title="Sales Pipeline"
          value="$284K"
          change={8.7}
          icon={TrendingUp}
          color={cardColors[2]}
        />
        <StatCard
          title="Open Tickets"
          value="127"
          change={-3.8}
          icon={Headphones}
          color={cardColors[3]}
        />
        <StatCard
          title="Pending Approvals"
          value="12"
          change={5.3}
          icon={CheckCircle}
          color={cardColors[4]}
        />
      </motion.div>

      {/* Workflow Tabs Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <Tabs defaultValue="workflow" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-orange-50 p-1">
              <TabsTrigger
                value="workflow"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Workflow className="w-4 h-4 mr-2" />
                Dynamic Workflow
              </TabsTrigger>
              <TabsTrigger
                value="approval"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approval Workflow
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
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
            {/* Dynamic Workflow Diagram */}
            <Card className="border-orange-200 shadow-sm">
              <CardContent className="pt-6">
                <WorkflowDiagram
                  editable={true}
                  onStepClick={handleStepClick}
                  onAddStep={handleAddStep}
                  onEditStep={handleEditStep}
                  onDeleteStep={handleDeleteStep}
                  height={500}
                />
              </CardContent>
            </Card>

            {/* Workflow Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Workflows
                      </p>
                      <p className="text-2xl font-bold text-orange-600">8</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Workflow className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Steps in Progress
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">24</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg. Completion Time
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        3.2 days
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="approval">
            {/* Simple Approval Workflow */}
            <Card className="border-orange-200 shadow-sm">
              <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-orange-900">
                      Approval Workflow Hierarchy
                    </CardTitle>
                    <p className="text-sm text-orange-700 mt-1">
                      Visual representation of the approval process for customer
                      contracts
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                    <span className="text-xs text-orange-600">
                      Valid: 2024-01-01 - 2024-12-31
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
            {/* Lead Analytics */}
            <Card className="border-orange-200 shadow-sm">
              <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-orange-900">
                      Lead Analytics Dashboard
                    </CardTitle>
                    <p className="text-sm text-orange-700 mt-1">
                      Comprehensive insights into lead performance and
                      conversion metrics
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <BarChart4 className="w-3 h-3 mr-1" />
                      Live Data
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  Lead analytics dashboard coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Main Dashboard Sections */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <LeadOverview />
        <ContactOverview />
        <SalesOverview />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
      >
        <MarketingOverview />
        <SupportOverview />
        <ActivityOverview />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <AnalyticsOverview />
      </motion.div>

      {/* Recent Activities */}
      <motion.div variants={itemVariants} className="mt-8">
        <Card className="border-orange-200 shadow-sm">
          <CardHeader className="border-b border-orange-100">
            <CardTitle className="text-orange-900">
              Recent Workflow Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  action: "Step completed",
                  user: "Sarah Wilson",
                  workflow: "Customer Onboarding",
                  time: "10 minutes ago",
                  color: "green",
                },
                {
                  id: 2,
                  action: "New step added",
                  user: "Michael Chen",
                  workflow: "Contract Approval",
                  time: "45 minutes ago",
                  color: "blue",
                },
                {
                  id: 3,
                  action: "Workflow updated",
                  user: "John Manager",
                  workflow: "Lead Qualification",
                  time: "2 hours ago",
                  color: "orange",
                },
                {
                  id: 4,
                  action: "Approval requested",
                  user: "Lisa Wong",
                  workflow: "Budget Approval",
                  time: "5 hours ago",
                  color: "purple",
                },
                {
                  id: 5,
                  action: "Step blocked",
                  user: "Robert Kim",
                  workflow: "Vendor Onboarding",
                  time: "1 day ago",
                  color: "red",
                },
              ].map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full bg-${activity.color}-500`}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.action}
                      </div>
                      <div className="text-sm text-gray-600">
                        {activity.user} • {activity.workflow}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
