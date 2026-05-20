import { Button } from "../../components/ui/button";
import StatsCards from "../../components/hr/dashboard/StatsCards";
import UpcomingEvents from "../../components/hr/dashboard/UpcomingEvents";
import RecentActivity from "../../components/hr/dashboard/RecentActivity";
import PendingActivity from "../../components/hr/dashboard/PendingActivity";
import {
  timeOffRequests,
  attendanceApprovals,
  recentActivities,
  upcomingEvents,
  onLeaveEmployees,
} from "../../data/data";
import { motion } from "framer-motion";
import { RefreshCw, FileDown } from "lucide-react";
import {
  useEmpDbRepo,
  usePendEmpList,
} from "../../services/hr/dashboard/dashboard.queries";
import OnLeaveEmployee from "../../components/hr/dashboard/OnLeaveEmployee";

function Dashboard() {
  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
    refetch,
  } = useEmpDbRepo();

  const {
    data: pendingEmployees,
    isLoading: pendingLoading,
    error: pendingError,
  } = usePendEmpList();

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  if (reportLoading || pendingLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (reportError || pendingError) {
    return <div>Failed to load dashboard data.</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      {/* <section className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              John
            </span>
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here is the overview of the key metrics and activities.
          </p>
        </div>

        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <FileDown size={16} />
            Export
          </Button>
        </div>
      </section> */}

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <StatsCards
          report={report}
      
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={itemVariants}
        className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* Charts Here */}
      </motion.div>

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          variants={itemVariants}
          className=""
        >
          <PendingActivity
            timeOffRequests={timeOffRequests}
            attendanceApprovals={attendanceApprovals}
            pendingEmployees={pendingEmployees ?? []}
          />
          {/* <motion.div variants={itemVariants} className="mt-6">
            <RecentActivity activities={recentActivities} />
          </motion.div> */}
        </motion.div>
         <motion.div variants={itemVariants}>
           <OnLeaveEmployee employees={onLeaveEmployees} />
          </motion.div>

        {/* Sidebar */}
        {/* <motion.div
          variants={itemVariants}
          className="lg:col-span-1"
        >
          <div className="sticky top-0">
            <UpcomingEvents events={upcomingEvents} />
          </div>
        </motion.div> */}
      </div>
    </motion.div>
  );
}

export default Dashboard;