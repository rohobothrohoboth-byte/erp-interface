import React from "react";
import MetricCard from "../../ui/MetricCard";
import {
  Users,
  UserPlus,
  Clock,
  Award,
  BookOpen,
  UserCheck,
  UserX,
  UserMinus,
  PauseCircle,
} from "lucide-react";

import type { EmpDbReport } from "../../../types/hr/dashboard";

interface StatsCardsProps {
  report?: EmpDbReport;
}

const StatsCards: React.FC<StatsCardsProps> = ({ report }) => {
  const stats = [
    {
      title: "Total Employees",
      value: report?.empTot ?? 0,
      icon: <Users size={24} className="text-primary-600" />,
      className: "border-l-primary-500",
    },
    {
      title: "Active Employees",
      value: report?.empAct ?? 0,
      icon: <UserCheck size={24} className="text-success-600" />,
      className: "border-l-success-500",
    },
    {
      title: "Pending Employees",
      value: report?.empPen ?? 0,
      icon: <UserPlus size={24} className="text-warning-600" />,
      className: "border-l-warning-500",
    },
    {
      title: "Suspended Employees",
      value: report?.empSus ?? 0,
      icon: <PauseCircle size={24} className="text-red-600" />,
      className: "border-l-red-500",
    },
    {
      title: "Retired Employees",
      value: report?.empRet ?? 0,
      icon: <Award size={24} className="text-secondary-600" />,
      className: "border-l-secondary-500",
    },
    {
      title: "Standby Employees",
      value: report?.empStd ?? 0,
      icon: <Clock size={24} className="text-accent-600" />,
      className: "border-l-accent-500",
    },
    {
      title: "Terminated Employees",
      value: report?.empTer ?? 0,
      icon: <UserMinus size={24} className="text-red-600" />,
      className: "border-l-red-500",
    },
    {
      title: "Employees On Leave",
      value: report?.empLeave ?? 0,
      icon: <BookOpen size={24} className="text-blue-600" />,
      className: "border-l-blue-500",
    },
    {
      title: "Rejected Employees",
      value: report?.empRej ?? 0,
      icon: <UserX size={24} className="text-gray-600" />,
      className: "border-l-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <MetricCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          className={`border-l-4 px-4 ${stat.className}`}
        />
      ))}
    </div>
  );
};

export default StatsCards;