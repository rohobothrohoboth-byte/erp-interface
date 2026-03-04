import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  Trophy,
  Calendar,
  GraduationCap,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  BarChart4,
  FileText,
  RefreshCw,
  Warehouse,
  ClipboardList,
  FileCheck,
  CheckCircle2,
  Package,
  Briefcase,
  ClipboardCheck,
  LineChart,
  Building,
  Network,
  File,
  Folder,
  Archive,
  Shield,
  Clock,
  Upload,
  FolderOpen,
  Eye,
  FileSearch,
  Image,
  User,
  Trash2,
  Notebook,
  Mail,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { useModule } from "../ModuleContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

interface NavItemProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  end?: boolean;
  activeBg: string;
  textColor: string;
  hoverBg: string;
  matchPaths?: string[];
  isChild?: boolean;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  end = false,
  activeBg,
  textColor,
  hoverBg,
  matchPaths = [],
  isChild = false,
  collapsed = false,
}) => {
  const location = useLocation();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isActive = () => {
    const currentPath = location.pathname;

    const matchesPattern = (pattern: string, path: string): boolean => {
      const regexPattern = pattern
        .replace(/:[^/]+/g, "([^/]+)")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);

      if (pattern === "/crm/leads/:id") {
        const knownSegments = [
          "generation",
          "assigned",
          "grouping",
          "add",
          "import",
          "routing",
        ];
        const match = path.match(/^\/crm\/leads\/([^/]+)$/);
        if (match) {
          const segment = match[1];
          if (knownSegments.includes(segment)) {
            return false;
          }
        }
      }

      return regex.test(path);
    };

    if (isChild && matchPaths && matchPaths.length > 0) {
      const matchesAdditionalPaths = matchPaths.some((path) => {
        if (path.includes(":")) {
          return matchesPattern(path, currentPath);
        }
        return currentPath === path;
      });

      if (matchesAdditionalPaths) return true;
    }

    if (end) {
      if (currentPath === to) return true;
    } else {
      if (isChild) {
        if (currentPath === to) return true;
      } else {
        if (currentPath.startsWith(to)) return true;
      }
    }

    if (matchPaths && matchPaths.length > 0) {
      return matchPaths.some((path) => {
        if (path.includes(":")) {
          return matchesPattern(path, currentPath);
        }
        return currentPath.startsWith(path);
      });
    }

    return false;
  };

  const active = isActive();

  const itemContent = (
    <div
      className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
        active
          ? `${activeBg} ${textColor} shadow-sm`
          : `text-gray-600 ${hoverBg}`
      } ${isChild && !collapsed ? "ml-2" : ""}`}
    >
      <span
        className={`${collapsed && !isChild ? "mx-auto" : "mr-3"} flex items-center justify-center`}
      >
        {isChild ? (
          <div
            className={`w-1.5 h-1.5 rounded-full ${active ? textColor : "bg-gray-400"} transition-colors duration-200`}
          />
        ) : (
          icon &&
          React.cloneElement(
            icon as React.ReactElement<{ size?: number; className?: string }>,
            {
              size: collapsed ? 22 : 20,
              className: `transition-all duration-200 ${active ? "stroke-2" : "stroke-1.5"}`,
            },
          )
        )}
      </span>
      {(!collapsed || isChild) && (
        <span
          className={`flex-1 transition-opacity duration-200 ${
            isChild ? "text-sm" : "text-base font-medium"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );

  // For child items in popover, don't show popover
  if (collapsed && !isChild) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => setPopoverOpen(true)}
            onMouseLeave={() => setPopoverOpen(false)}
          >
            <NavLink to={to} end={end} className="block">
              {itemContent}
            </NavLink>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="center"
          className="w-auto px-3 py-1.5 text-sm"
          onMouseEnter={() => setPopoverOpen(true)}
          onMouseLeave={() => setPopoverOpen(false)}
        >
          {label}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <NavLink to={to} end={end} className="block">
      {itemContent}
    </NavLink>
  );
};

interface NavGroupProps {
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  hoverBg: string;
  textColor: string;
  activeBg: string;
  collapsed?: boolean;
}

const NavGroup: React.FC<NavGroupProps> = ({
  icon,
  label,
  children,
  isOpen,
  onToggle,
  hoverBg,
  collapsed = false,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (collapsed) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            onMouseEnter={() => setPopoverOpen(true)}
            onMouseLeave={() => setPopoverOpen(false)}
            className={`w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${hoverBg} text-gray-600`}
          >
            {React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
              size: 20,
            })}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          className="w-56 p-1 ml-2"
          onMouseEnter={() => setPopoverOpen(true)}
          onMouseLeave={() => setPopoverOpen(false)}
        >
          <div>
            <div className="px-2 py-1 text-sm font-semibold text-gray-700">
              {label}
            </div>
            <div className="py-1">{children}</div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${hoverBg} text-gray-700 hover:text-gray-900`}
      >
        <div className="flex items-center min-w-0">
          <span className="mr-3 flex-shrink-0">
            {React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
              size: 18,
            })}
          </span>
          <span className="truncate font-medium">{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="flex-shrink-0 text-gray-500" />
        ) : (
          <ChevronRight size={16} className="flex-shrink-0 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden pl-6 pr-2 mt-1 space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { activeModule } = useModule();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    setOpenGroup(null);
  }, [activeModule]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleGroup = (groupLabel: string) => {
    setOpenGroup((prev) => (prev === groupLabel ? null : groupLabel));
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const themeMap: Record<
    string,
    { textColor: string; activeBg: string; hoverBg: string }
  > = {
    Inventory: {
      textColor: "text-yellow-700",
      activeBg: "bg-yellow-50",
      hoverBg: "hover:bg-yellow-50/50",
    },
    HR: {
      textColor: "text-green-700",
      activeBg: "bg-green-50",
      hoverBg: "hover:bg-green-50/50",
    },
    Core: {
      textColor: "text-emerald-700",
      activeBg: "bg-emerald-50",
      hoverBg: "hover:bg-emerald-50/50",
    },
    CRM: {
      textColor: "text-orange-700",
      activeBg: "bg-orange-50",
      hoverBg: "hover:bg-orange-50/50",
    },
    Finance: {
      textColor: "text-indigo-700",
      activeBg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-50/50",
    },
    Procurement: {
      textColor: "text-purple-700",
      activeBg: "bg-purple-50",
      hoverBg: "hover:bg-purple-50/50",
    },
    File: {
      textColor: "text-emerald-700",
      activeBg: "bg-emerald-50",
      hoverBg: "hover:bg-emerald-50/50",
    },
    Logo: {
      textColor: "text-cyan-700",
      activeBg: "bg-cyan-50",
      hoverBg: "hover:bg-cyan-50/50",
    },
    default: {
      textColor: "text-gray-700",
      activeBg: "bg-gray-100",
      hoverBg: "hover:bg-gray-100/70",
    },
  };

  const theme = themeMap[activeModule] || themeMap.default;

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-white flex flex-col shadow-lg border-r border-gray-200/80 relative z-40"
    >
      {/* Logo Area */}
      <div
        className={`flex-shrink-0 p-4 flex items-center ${collapsed ? "justify-center gap-10" : "justify-between"} border-b border-gray-200/80`}
      >
        <button
          onClick={() => navigate("/modules")}
          className="focus:outline-none cursor-pointer flex items-center gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <img
              src="/bda-logo-1.png"
              alt="Logo"
              className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
            />
          </motion.div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <h1
                className={`text-lg font-bold ${theme.textColor} leading-tight`}
              >
                BDA
              </h1>
              <p className="text-xs text-gray-500">Investment Group</p>
            </motion.div>
          )}
        </button>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
        <div className={`px-3 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
          <NavItem
            to={
              activeModule === "Inventory"
                ? "/inventory"
                : activeModule === "Core"
                  ? "/core"
                  : activeModule === "HR"
                    ? "/hr"
                    : activeModule === "CRM"
                      ? "/crm"
                      : activeModule === "Finance"
                        ? "/finance"
                        : activeModule === "Procurement"
                          ? "/procurement"
                          : activeModule === "File"
                            ? "/file"
                            : "/dashboard"
            }
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            end
            {...theme}
            collapsed={collapsed}
          />

          {/* Module-specific navigation items... (all existing navigation code remains the same, 
              just add collapsed={collapsed} to each NavItem and NavGroup) */}

          {/* HR Module */}
          {activeModule === "HR" && !collapsed && (
            <>
              <NavItem
                to="/hr/employees/record"
                icon={<Users size={18} />}
                label="Employees"
                {...theme}
                collapsed={collapsed}
              />

              <NavGroup
                icon={<Building2 size={18} />}
                label="Recruitment"
                isOpen={openGroup === "Recruitment"}
                onToggle={() => toggleGroup("Recruitment")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/hr/recruitment/list"
                  icon={<Building2 size={18} />}
                  label="Recruitment List"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/hr/recruitment/pipeline"
                  icon={<Building2 size={18} />}
                  label="Candidate Pipeline"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/hr/recruitment/onboarding"
                  icon={<Users size={18} />}
                  label="On Boarding"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>

              <NavGroup
                icon={<Building2 size={18} />}
                label="Annual Leave"
                isOpen={openGroup === "Leave"}
                onToggle={() => toggleGroup("Leave")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/hr/leave/list"
                  icon={<Building2 size={18} />}
                  label="My Leave"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/hr/leave/form"
                  icon={<Building2 size={18} />}
                  label="Leave Request"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/hr/leave/Entitlement"
                  icon={<Users size={18} />}
                  label="Leave Entitlement"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>

              <NavGroup
                icon={<Building2 size={18} />}
                label="Attendance"
                isOpen={openGroup === "Attendance"}
                onToggle={() => toggleGroup("Attendance")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/hr/attendance/list"
                  icon={<Building2 size={18} />}
                  label="Attendance List"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/hr/shift-scheduler"
                  icon={<Building2 size={18} />}
                  label="Shift Schedule"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/hr/time-clock"
                  icon={<Users size={18} />}
                  label="Time clock"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/hr/attendance/form"
                  icon={<Users size={18} />}
                  label="Attendance Form"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>

              <NavItem
                to="/hr/training"
                icon={<GraduationCap size={18} />}
                label="Training"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/hr/reports"
                icon={<FileSpreadsheet size={18} />}
                label="Reports"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {/* Collapsed HR Module - Show only icons with tooltips */}
          {activeModule === "HR" && collapsed && (
            <>
              <NavItem
                to="/hr/employees/record"
                icon={<Users size={18} />}
                label="Employees"
                {...theme}
                collapsed={collapsed}
              />
              <NavGroup
                icon={<Building2 size={18} />}
                label="Recruitment"
                isOpen={openGroup === "Recruitment"}
                onToggle={() => toggleGroup("Recruitment")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/hr/recruitment/list"
                  icon={<Building2 size={18} />}
                  label="Recruitment List"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/hr/recruitment/pipeline"
                  icon={<Building2 size={18} />}
                  label="Candidate Pipeline"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/hr/recruitment/onboarding"
                  icon={<Users size={18} />}
                  label="On Boarding"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavGroup
                icon={<Building2 size={18} />}
                label="Annual Leave"
                isOpen={openGroup === "Leave"}
                onToggle={() => toggleGroup("Leave")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/hr/leave/list"
                  icon={<Building2 size={18} />}
                  label="My Leave"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/hr/leave/form"
                  icon={<Building2 size={18} />}
                  label="Leave Request"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/hr/leave/Entitlement"
                  icon={<Users size={18} />}
                  label="Leave Entitlement"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavGroup
                icon={<Building2 size={18} />}
                label="Attendance"
                isOpen={openGroup === "Attendance"}
                onToggle={() => toggleGroup("Attendance")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/hr/attendance/list"
                  icon={<Building2 size={18} />}
                  label="Attendance List"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/hr/shift-scheduler"
                  icon={<Building2 size={18} />}
                  label="Shift Schedule"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/hr/time-clock"
                  icon={<Users size={18} />}
                  label="Time clock"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/hr/attendance/form"
                  icon={<Users size={18} />}
                  label="Attendance Form"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavItem
                to="/hr/training"
                icon={<GraduationCap size={18} />}
                label="Training"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/hr/reports"
                icon={<FileSpreadsheet size={18} />}
                label="Reports"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {/* Inventory Module */}
          {activeModule === "Inventory" && !collapsed && (
            <>
              <NavItem
                to="/inventory/tracking"
                icon={<FileText size={18} />}
                label="Inventory Tracking"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/inbound"
                icon={<FileText size={18} />}
                label="Stock Management"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/warehouse"
                icon={<Warehouse size={18} />}
                label="Warehouse Management"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/valuation"
                icon={<BarChart4 size={18} />}
                label="Inventory Valuation"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/reorder"
                icon={<RefreshCw size={18} />}
                label="Reorder Management"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/analytics"
                icon={<BarChart4 size={18} />}
                label="Reporting & Analytics"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {activeModule === "Inventory" && collapsed && (
            <>
              <NavItem
                to="/inventory/tracking"
                icon={<FileText size={18} />}
                label="Inventory Tracking"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/inbound"
                icon={<FileText size={18} />}
                label="Stock Management"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/warehouse"
                icon={<Warehouse size={18} />}
                label="Warehouse Management"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/valuation"
                icon={<BarChart4 size={18} />}
                label="Inventory Valuation"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/reorder"
                icon={<RefreshCw size={18} />}
                label="Reorder Management"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/inventory/analytics"
                icon={<BarChart4 size={18} />}
                label="Reporting & Analytics"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {/* Core Module */}
          {activeModule === "Core" && !collapsed && (
            <>
              <NavItem
                to="/core/company"
                icon={<Building size={18} />}
                label="Companies"
                {...theme}
                matchPaths={["/branches"]}
                collapsed={collapsed}
              />
              <NavItem
                to="/core/department"
                icon={<Network size={18} />}
                label="Department"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/core/fiscal-year"
                icon={<FileText size={18} />}
                label="Fiscal Year"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/core/users"
                icon={<Users size={18} />}
                label="User Management"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {activeModule === "Core" && collapsed && (
            <>
              <NavItem
                to="/core/company"
                icon={<Building size={18} />}
                label="Companies"
                {...theme}
                matchPaths={["/branches"]}
                collapsed={collapsed}
              />
              <NavItem
                to="/core/department"
                icon={<Network size={18} />}
                label="Department"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/core/fiscal-year"
                icon={<FileText size={18} />}
                label="Fiscal Year"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/core/users"
                icon={<Users size={18} />}
                label="User Management"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {/* CRM Module */}
          {activeModule === "CRM" && !collapsed && (
            <>
              <NavGroup
                icon={<Trophy size={18} />}
                label="Lead Management"
                isOpen={openGroup === "LeadManagement"}
                onToggle={() => toggleGroup("LeadManagement")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/leads/generation"
                  icon={<Trophy size={18} />}
                  label="Lead Generation"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                  matchPaths={[
                    "/crm/leads/add",
                    "/crm/leads/generation/import",
                    "/crm/leads/:id/edit",
                  ]}
                />
                <NavItem
                  to="/crm/leads/grouping"
                  icon={<Trophy size={18} />}
                  label="Lead Grouping"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/leads/assigned"
                  icon={<Trophy size={18} />}
                  label="Assigned Leads"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                  matchPaths={["/crm/leads/:id"]}
                />
              </NavGroup>
              <NavGroup
                icon={<Users size={18} />}
                label="Contact Management"
                isOpen={openGroup === "Contacts"}
                onToggle={() => toggleGroup("Contacts")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/contacts"
                  icon={<Users size={18} />}
                  label="Contacts"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                  matchPaths={["/crm/contacts/add", "/crm/contacts/:id/edit"]}
                />
                <NavItem
                  to="/crm/contacts/grouping"
                  icon={<Users size={18} />}
                  label="Contact Grouping"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/contacts/assigned"
                  icon={<Users size={18} />}
                  label="Assigned Contacts"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                  matchPaths={["/crm/contacts/assigned/:id"]}
                />
              </NavGroup>
              <NavGroup
                icon={<BarChart4 size={18} />}
                label="Sales Management"
                isOpen={openGroup === "Sales"}
                onToggle={() => toggleGroup("Sales")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/sales/opportunities"
                  icon={<BarChart4 size={18} />}
                  label="Opportunities"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/quotations"
                  icon={<BarChart4 size={18} />}
                  label="Quotations"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/orders"
                  icon={<BarChart4 size={18} />}
                  label="Orders"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>
              <NavGroup
                icon={<FileSpreadsheet size={18} />}
                label="Marketing Automation"
                isOpen={openGroup === "Marketing"}
                onToggle={() => toggleGroup("Marketing")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/campaigns"
                  icon={<FileSpreadsheet size={18} />}
                  label="Campaigns"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                  end
                />
                <NavItem
                  to="/crm/campaigns/email"
                  icon={<Mail size={18} />}
                  label="Email Campaigns"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/campaigns/sms"
                  icon={<MessageSquare size={18} />}
                  label="SMS Campaigns"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>
              <NavGroup
                icon={<Calendar size={18} />}
                label="Customer Service"
                isOpen={openGroup === "CustomerService"}
                onToggle={() => toggleGroup("CustomerService")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/support/tickets"
                  icon={<Calendar size={18} />}
                  label="Tickets"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/support/knowledge-base"
                  icon={<Calendar size={18} />}
                  label="Knowledge Base"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>
              <NavGroup
                icon={<ClipboardList size={18} />}
                label="Activity Management"
                isOpen={openGroup === "Activities"}
                onToggle={() => toggleGroup("Activities")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/activities/tasks"
                  icon={<ClipboardList size={18} />}
                  label="Tasks"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/activities/calendar"
                  icon={<Calendar size={18} />}
                  label="Calendar"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/activities/time-tracking"
                  icon={<Clock size={18} />}
                  label="Time Tracking"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/crm/activities/notifications"
                  icon={<Calendar size={18} />}
                  label="Notifications"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>
              <NavItem
                to="/crm/analytics"
                icon={<BarChart4 size={18} />}
                label="Analytics & Reporting"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {activeModule === "CRM" && collapsed && (
            <>
              <NavGroup
                icon={<Trophy size={18} />}
                label="Lead Management"
                isOpen={openGroup === "LeadManagement"}
                onToggle={() => toggleGroup("LeadManagement")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/leads/generation"
                  icon={<Trophy size={18} />}
                  label="Lead Generation"
                  {...theme}
                  isChild
                  collapsed={false}
                  matchPaths={[
                    "/crm/leads/add",
                    "/crm/leads/generation/import",
                    "/crm/leads/:id/edit",
                  ]}
                />
                <NavItem
                  to="/crm/leads/grouping"
                  icon={<Trophy size={18} />}
                  label="Lead Grouping"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/leads/assigned"
                  icon={<Trophy size={18} />}
                  label="Assigned Leads"
                  {...theme}
                  isChild
                  collapsed={false}
                  matchPaths={["/crm/leads/:id"]}
                />
              </NavGroup>
              <NavGroup
                icon={<Users size={18} />}
                label="Contact Management"
                isOpen={openGroup === "Contacts"}
                onToggle={() => toggleGroup("Contacts")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/contacts"
                  icon={<Users size={18} />}
                  label="Contacts"
                  {...theme}
                  isChild
                  collapsed={false}
                  matchPaths={["/crm/contacts/add", "/crm/contacts/:id/edit"]}
                />
                <NavItem
                  to="/crm/contacts/grouping"
                  icon={<Users size={18} />}
                  label="Contact Grouping"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/contacts/assigned"
                  icon={<Users size={18} />}
                  label="Assigned Contacts"
                  {...theme}
                  isChild
                  collapsed={false}
                  matchPaths={["/crm/contacts/assigned/:id"]}
                />
              </NavGroup>
              <NavGroup
                icon={<BarChart4 size={18} />}
                label="Sales Management"
                isOpen={openGroup === "Sales"}
                onToggle={() => toggleGroup("Sales")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/sales/opportunities"
                  icon={<BarChart4 size={18} />}
                  label="Opportunities"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/quotations"
                  icon={<BarChart4 size={18} />}
                  label="Quotations"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/orders"
                  icon={<BarChart4 size={18} />}
                  label="Orders"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavGroup
                icon={<FileSpreadsheet size={18} />}
                label="Marketing"
                isOpen={openGroup === "Marketing"}
                onToggle={() => toggleGroup("Marketing")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/campaigns"
                  icon={<FileSpreadsheet size={18} />}
                  label="Campaigns"
                  {...theme}
                  isChild
                  collapsed={false}
                  end
                />
                <NavItem
                  to="/crm/campaigns/email"
                  icon={<Mail size={18} />}
                  label="Email Campaigns"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/campaigns/sms"
                  icon={<MessageSquare size={18} />}
                  label="SMS Campaigns"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavGroup
                icon={<Calendar size={18} />}
                label="Customer Service"
                isOpen={openGroup === "CustomerService"}
                onToggle={() => toggleGroup("CustomerService")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/support/tickets"
                  icon={<Calendar size={18} />}
                  label="Tickets"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/support/knowledge-base"
                  icon={<Calendar size={18} />}
                  label="Knowledge Base"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavGroup
                icon={<ClipboardList size={18} />}
                label="Activities"
                isOpen={openGroup === "Activities"}
                onToggle={() => toggleGroup("Activities")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/crm/activities/tasks"
                  icon={<ClipboardList size={18} />}
                  label="Tasks"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/activities/calendar"
                  icon={<Calendar size={18} />}
                  label="Calendar"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/activities/time-tracking"
                  icon={<Clock size={18} />}
                  label="Time Tracking"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/crm/activities/notifications"
                  icon={<Calendar size={18} />}
                  label="Notifications"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavItem
                to="/crm/analytics"
                icon={<BarChart4 size={18} />}
                label="Analytics"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {/* Finance Module */}
          {activeModule === "Finance" && !collapsed && (
            <>
              <NavItem
                to="/finance/gl"
                icon={<FileText size={18} />}
                label="General Ledger"
                {...theme}
                collapsed={collapsed}
              />
              <NavGroup
                icon={<Package size={18} />}
                label="Account"
                isOpen={openGroup === "Account"}
                onToggle={() => toggleGroup("Account")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/finance/accounts"
                  icon={<Package size={18} />}
                  label="Chart of Account"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>
              <NavItem
                to="/finance/journals"
                icon={<Notebook size={18} />}
                label="Journals"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/assets"
                icon={<Briefcase size={18} />}
                label="Assets"
                {...theme}
                collapsed={collapsed}
              />
              <NavGroup
                icon={<FileSpreadsheet size={18} />}
                label="Budgeting"
                isOpen={openGroup === "Budgeting"}
                onToggle={() => toggleGroup("Budgeting")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/finance/budget"
                  icon={<FileSpreadsheet size={18} />}
                  label="Budget"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/finance/budget-plan"
                  icon={<FileText size={18} />}
                  label="Budget Plan"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/finance/budget-approval"
                  icon={<FileCheck size={18} />}
                  label="Budget Approval"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/finance/additional-budget"
                  icon={<DollarSign size={18} />}
                  label="Additional Budget"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/finance/budget-review"
                  icon={<ClipboardCheck size={18} />}
                  label="Budget Review"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />

                <NavItem
                  to="/finance/additional-budget-approval"
                  icon={<FileCheck size={18} />}
                  label="Additional Budget Approval"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>
              <NavItem
                to="/finance/payroll"
                icon={<FileSpreadsheet size={18} />}
                label="Payroll"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/transactions"
                icon={<FileSpreadsheet size={18} />}
                label="Transaction"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/reports"
                icon={<LineChart size={18} />}
                label="Reports"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {activeModule === "Finance" && collapsed && (
            <>
              <NavItem
                to="/finance/gl"
                icon={<FileText size={18} />}
                label="General Ledger"
                {...theme}
                collapsed={collapsed}
              />
              <NavGroup
                icon={<Package size={18} />}
                label="Account"
                isOpen={openGroup === "Account"}
                onToggle={() => toggleGroup("Account")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/finance/accounts"
                  icon={<Package size={18} />}
                  label="Chart of Account"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/finance/account-category"
                  icon={<Package size={18} />}
                  label="Account Category"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavItem
                to="/finance/journals"
                icon={<Notebook size={18} />}
                label="Journals"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/assets"
                icon={<Briefcase size={18} />}
                label="Assets"
                {...theme}
                collapsed={collapsed}
              />
              <NavGroup
                icon={<FileSpreadsheet size={18} />}
                label="Budgeting"
                isOpen={openGroup === "Budgeting"}
                onToggle={() => toggleGroup("Budgeting")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/finance/budget"
                  icon={<FileSpreadsheet size={18} />}
                  label="Budget"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/finance/budget-plan"
                  icon={<FileText size={18} />}
                  label="Budget Plan"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/finance/budget-approval"
                  icon={<FileCheck size={18} />}
                  label="Budget Approval"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavItem
                to="/finance/payroll"
                icon={<FileSpreadsheet size={18} />}
                label="Payroll"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/transactions"
                icon={<FileSpreadsheet size={18} />}
                label="Transaction"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/reports"
                icon={<LineChart size={18} />}
                label="Reports"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {/* Procurement Module */}
          {activeModule === "Procurement" && !collapsed && (
            <>
              <NavItem
                to="/procurement/requisitions"
                icon={<FileText size={18} />}
                label="Requisitions"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/vendors"
                icon={<Users size={18} />}
                label="Vendors"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/po"
                icon={<ClipboardCheck size={18} />}
                label="Purchase Orders"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/receipt"
                icon={<CheckCircle2 size={18} />}
                label="Goods Receipt"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/invoice"
                icon={<FileCheck size={18} />}
                label="Invoices"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/analytics"
                icon={<BarChart4 size={18} />}
                label="Analytics"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {activeModule === "Procurement" && collapsed && (
            <>
              <NavItem
                to="/procurement/requisitions"
                icon={<FileText size={18} />}
                label="Requisitions"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/vendors"
                icon={<Users size={18} />}
                label="Vendors"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/po"
                icon={<ClipboardCheck size={18} />}
                label="Purchase Orders"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/receipt"
                icon={<CheckCircle2 size={18} />}
                label="Goods Receipt"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/invoice"
                icon={<FileCheck size={18} />}
                label="Invoices"
                {...theme}
                collapsed={collapsed}
              />
              <NavItem
                to="/procurement/analytics"
                icon={<BarChart4 size={18} />}
                label="Analytics"
                {...theme}
                collapsed={collapsed}
              />
            </>
          )}

          {/* File Module */}
          {activeModule === "File" && !collapsed && (
            <>
              <NavGroup
                icon={<Folder size={18} />}
                label="Folders"
                isOpen={openGroup === "FileFolders"}
                onToggle={() => toggleGroup("FileFolders")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/file/folders/all"
                  icon={<FolderOpen size={18} />}
                  label="All Folders"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/folders/shared"
                  icon={<Users size={18} />}
                  label="Shared Folders"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/folders/personal"
                  icon={<User size={18} />}
                  label="Personal Folders"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/folders/archived"
                  icon={<Archive size={18} />}
                  label="Archived Folders"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>

              <NavGroup
                icon={<File size={18} />}
                label="Documents"
                isOpen={openGroup === "FileDocuments"}
                onToggle={() => toggleGroup("FileDocuments")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/file/documents/all"
                  icon={<FileText size={18} />}
                  label="All Documents"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/documents/recent"
                  icon={<Clock size={18} />}
                  label="Recent"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/documents/favorites"
                  icon={<FileCheck size={18} />}
                  label="Favorites"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/documents/trash"
                  icon={<Trash2 size={18} />}
                  label="Trash"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>

              <NavItem
                to="/file/uploads"
                icon={<Upload size={18} />}
                label="Upload Manager"
                {...theme}
                collapsed={collapsed}
              />

              <NavGroup
                icon={<Shield size={18} />}
                label="Security"
                isOpen={openGroup === "FileSecurity"}
                onToggle={() => toggleGroup("FileSecurity")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/file/permissions/users"
                  icon={<Users size={18} />}
                  label="User Permissions"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/permissions/groups"
                  icon={<Users size={18} />}
                  label="Group Permissions"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/permissions/shared-links"
                  icon={<Eye size={18} />}
                  label="Shared Links"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/permissions/audit-logs"
                  icon={<ClipboardList size={18} />}
                  label="Audit Logs"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>

              <NavItem
                to="/file/analytics"
                icon={<BarChart4 size={18} />}
                label="Analytics & Reports"
                {...theme}
                collapsed={collapsed}
              />

              <NavGroup
                icon={<Archive size={18} />}
                label="Storage"
                isOpen={openGroup === "FileStorage"}
                onToggle={() => toggleGroup("FileStorage")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/file/storage/overview"
                  icon={<BarChart4 size={18} />}
                  label="Storage Overview"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/storage/quota"
                  icon={<FileSearch size={18} />}
                  label="Quota Management"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/storage/backup"
                  icon={<Archive size={18} />}
                  label="Backup & Restore"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
                <NavItem
                  to="/file/storage/file-types"
                  icon={<Image size={18} />}
                  label="File Types"
                  {...theme}
                  isChild
                  collapsed={collapsed}
                />
              </NavGroup>
            </>
          )}

          {activeModule === "File" && collapsed && (
            <>
              <NavGroup
                icon={<Folder size={18} />}
                label="Folders"
                isOpen={openGroup === "FileFolders"}
                onToggle={() => toggleGroup("FileFolders")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/file/folders/all"
                  icon={<FolderOpen size={18} />}
                  label="All Folders"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/folders/shared"
                  icon={<Users size={18} />}
                  label="Shared Folders"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/folders/personal"
                  icon={<User size={18} />}
                  label="Personal Folders"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/folders/archived"
                  icon={<Archive size={18} />}
                  label="Archived Folders"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavGroup
                icon={<File size={18} />}
                label="Documents"
                isOpen={openGroup === "FileDocuments"}
                onToggle={() => toggleGroup("FileDocuments")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/file/documents/all"
                  icon={<FileText size={18} />}
                  label="All Documents"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/documents/recent"
                  icon={<Clock size={18} />}
                  label="Recent"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/documents/favorites"
                  icon={<FileCheck size={18} />}
                  label="Favorites"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/documents/trash"
                  icon={<Trash2 size={18} />}
                  label="Trash"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavItem
                to="/file/uploads"
                icon={<Upload size={18} />}
                label="Upload Manager"
                {...theme}
                collapsed={collapsed}
              />
              <NavGroup
                icon={<Shield size={18} />}
                label="Security"
                isOpen={openGroup === "FileSecurity"}
                onToggle={() => toggleGroup("FileSecurity")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/file/permissions/users"
                  icon={<Users size={18} />}
                  label="User Permissions"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/permissions/groups"
                  icon={<Users size={18} />}
                  label="Group Permissions"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/permissions/shared-links"
                  icon={<Eye size={18} />}
                  label="Shared Links"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/permissions/audit-logs"
                  icon={<ClipboardList size={18} />}
                  label="Audit Logs"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
              <NavItem
                to="/file/analytics"
                icon={<BarChart4 size={18} />}
                label="Analytics"
                {...theme}
                collapsed={collapsed}
              />
              <NavGroup
                icon={<Archive size={18} />}
                label="Storage"
                isOpen={openGroup === "FileStorage"}
                onToggle={() => toggleGroup("FileStorage")}
                hoverBg={theme.hoverBg}
                textColor={theme.textColor}
                activeBg={theme.activeBg}
                collapsed={collapsed}
              >
                <NavItem
                  to="/file/storage/overview"
                  icon={<BarChart4 size={18} />}
                  label="Storage Overview"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/storage/quota"
                  icon={<FileSearch size={18} />}
                  label="Quota Management"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/storage/backup"
                  icon={<Archive size={18} />}
                  label="Backup & Restore"
                  {...theme}
                  isChild
                  collapsed={false}
                />
                <NavItem
                  to="/file/storage/file-types"
                  icon={<Image size={18} />}
                  label="File Types"
                  {...theme}
                  isChild
                  collapsed={false}
                />
              </NavGroup>
            </>
          )}
        </div>
      </div>

      {/* Footer Settings */}
      {(activeModule === "Core" || activeModule === "File") && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200/80">
          <NavItem
            to={activeModule === "File" ? "/file/settings" : "/settings"}
            icon={<Settings size={18} />}
            label={activeModule === "File" ? "File Settings" : "Settings"}
            {...theme}
            collapsed={collapsed}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
