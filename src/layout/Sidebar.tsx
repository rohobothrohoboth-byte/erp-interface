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
  Wallet,
  Layers,
  History,
  Target,
} from "lucide-react";
import { useModule } from "../ModuleContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { useAuthStore } from "../stores/auth.store";
import { useSidebarStore } from "../stores/sidebar.store";

/* ================= TYPES ================= */

interface MenuItem {
  K: string;
  L: string;
  P?: string;
  I?: string;
  C?: MenuItem[] | null;
}

/* ================= NAV ITEM ================= */

const NavItem = ({
  to,
  icon,
  label,
  end = false,
  isChild = false,
  collapsed = false,
  activeBg,
  textColor,
  hoverBg,
  matchPaths = [],
}: any) => {
  const location = useLocation();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isActive = () => {
    const currentPath = location.pathname;

    const matchesPattern = (pattern: string, path: string): boolean => {
      const regexPattern = pattern
        .replace(/:[^/]+/g, "([^/]+)")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(path);
    };

    if (isChild && matchPaths && matchPaths.length > 0) {
      const matchesAdditionalPaths = matchPaths.some((path: string) => {
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
      return matchPaths.some((path: string) => {
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
          React.cloneElement(icon, {
            size: collapsed ? 22 : 20,
            className: `transition-all duration-200 ${active ? "stroke-2" : "stroke-1.5"}`,
          })
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

/* ================= NAV GROUP ================= */

const NavGroup = ({
  icon,
  label,
  children,
  isOpen,
  onToggle,
  collapsed = false,
  hoverBg,
  textColor,
  activeBg,
}: any) => {
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
            {React.cloneElement(icon, { size: 20 })}
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
            {React.cloneElement(icon, { size: 18 })}
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

/* ================= SIDEBAR ================= */

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { activeModule } = useModule();

const collapsed = useSidebarStore((s) => s.collapsed);
const openGroups = useSidebarStore((s) => s.openGroups);

const toggleSidebar = useSidebarStore((s) => s.toggleCollapsed);
const toggleGroup = useSidebarStore((s) => s.toggleGroup);

const openGroup = openGroups[activeModule];

 const { employeeId, role, permissions, userName, isAuthenticated } =
  useAuthStore();

  // Check if user is admin
const isAdmin = 
  role === "admin" || 
  employeeId === "019d19c0-ae3e-78bd-bd2a-98d36bd6e078";


  const getIcon = (iconType?: string) => {
    // Return appropriate icon based on type or default
    return <FileText size={18} />;
  };

  const themeMap: Record<
    string,
    { textColor: string; activeBg: string; hoverBg: string }
  > = {
    "mod.inv": {
      textColor: "text-yellow-700",
      activeBg: "bg-yellow-50",
      hoverBg: "hover:bg-yellow-50/50",
    },
    "mod.hrm": {
      textColor: "text-green-700",
      activeBg: "bg-green-50",
      hoverBg: "hover:bg-green-50/50",
    },
    "mod.core": {
      textColor: "text-emerald-700",
      activeBg: "bg-emerald-50",
      hoverBg: "hover:bg-emerald-50/50",
    },
    "mod.crm": {
      textColor: "text-orange-700",
      activeBg: "bg-orange-50",
      hoverBg: "hover:bg-orange-50/50",
    },
    "mod.fnm": {
      textColor: "text-indigo-700",
      activeBg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-50/50",
    },
    "mod.pro": {
      textColor: "text-purple-700",
      activeBg: "bg-purple-50",
      hoverBg: "hover:bg-purple-50/50",
    },
    "mod.flm": {
      textColor: "text-emerald-700",
      activeBg: "bg-emerald-50",
      hoverBg: "hover:bg-emerald-50/50",
    },
    "mod.plan": {
      textColor: "text-indigo-700",
      activeBg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-50/50",
    },
    "mod.prj": {
      textColor: "text-yellow-700",
      activeBg: "bg-yellow-50",
      hoverBg: "hover:bg-yellow-50/50",
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


  // Render dynamic menus from token (for non-admin users)
  const renderDynamicMenus = (menus: MenuItem[]) => {
    return menus.map((menu) => {
      const hasChildren = menu.C && menu.C.length > 0;

      if (hasChildren) {
        return (
          <NavGroup
            key={menu.K}
            icon={getIcon(menu.I)}
            label={menu.L}
            isOpen={openGroup === menu.L}
            onToggle={() => toggleGroup(activeModule, menu.L)}
            {...theme}
            collapsed={collapsed}
            activeBg={theme.activeBg}
          >
            {menu.C!.map((child) => (
              <NavItem
                key={child.K}
                to={child.P || "#"}
                icon={getIcon(child.I)}
                label={child.L}
                {...theme}
                isChild
                collapsed={collapsed}
              />
            ))}
          </NavGroup>
        );
      }

      return (
        <NavItem
          key={menu.K}
          to={menu.P || "#"}
          icon={getIcon(menu.I)}
          label={menu.L}
          collapsed={collapsed}
          {...theme}
        />
      );
    });
  };

  // Render static admin menus (all modules) - using the same module keys
  const renderAdminMenus = () => {
    // Based on activeModule (which comes as "mod.inv", "mod.hrm", etc.)
    switch (activeModule) {
      case "mod.hrm":
        return (
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
              onToggle={() => toggleGroup(activeModule,"Recruitment")}
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
              <NavItem
                to="/hr/recruitment/workforce-plan"
                icon={<ClipboardList size={18} />}
                label="Workforce Plan"
                {...theme}
                isChild
                collapsed={collapsed}
              />
              <NavItem
                to="/hr/recruitment/approved-requisitions"
                icon={<FileText size={18} />}
                label="Job Requisitions"
                {...theme}
                isChild
                collapsed={collapsed}
              />
              <NavItem
                to="/hr/recruitment/applicants"
                icon={<Users size={18} />}
                label="Applicants"
                {...theme}
                isChild
                collapsed={collapsed}
              />
            </NavGroup>

            <NavGroup
              icon={<Building2 size={18} />}
              label="Annual Leave"
              isOpen={openGroup === "Leave"}
              onToggle={() => toggleGroup(activeModule,"Leave")}
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
              onToggle={() => toggleGroup(activeModule,"Attendance")}
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
        );

      case "mod.inv":
        return (
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
        );

      case "mod.core":
        return (
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
              matchPaths={["/core/add-employee", "/core/user-management/add/:empId", "/core/user-management/edit/:empId"]}
              collapsed={collapsed}
            />
          </>
        );

      case "mod.crm":
        return (
          <>
            <NavGroup
              icon={<Trophy size={18} />}
              label="Lead Management"
              isOpen={openGroup === "LeadManagement"}
              onToggle={() => toggleGroup(activeModule,"LeadManagement")}
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
              onToggle={() => toggleGroup(activeModule,"Contacts")}
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
              onToggle={() => toggleGroup(activeModule,"Sales")}
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
              onToggle={() => toggleGroup(activeModule,"Marketing")}
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
              onToggle={() => toggleGroup(activeModule,"CustomerService")}
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
              onToggle={() => toggleGroup(activeModule,"Activities")}
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
        );

      case "mod.fnm":
        return (
          <>
            <NavGroup
              icon={<FileText size={18} />}
              label="General Ledger"
              isOpen={openGroup === "General Ledger"}
              onToggle={() => toggleGroup(activeModule,"General Ledger")}
              {...theme}
              collapsed={collapsed}
            >
              <NavItem
                to="/finance/gl/chart-of-accounts"
                icon={<Layers size={18} />}
                label="Chart of Accounts"
                {...theme}
                isChild
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/gl/journal-entries"
                icon={<FileText size={18} />}
                label="Journal Entries"
                {...theme}
                isChild
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/gl/audit-trail"
                icon={<History size={18} />}
                label="Audit Trail"
                {...theme}
                isChild
                collapsed={collapsed}
              />
            </NavGroup>
            <NavItem
              to="/finance/accounts"
              icon={<Package size={18} />}
              label="Chart of Account"
              {...theme}
              collapsed={collapsed}
            />
            <NavItem
              to="/finance/journals"
              icon={<Notebook size={18} />}
              label="Journals"
              {...theme}
              collapsed={collapsed}
            />
            <NavGroup
              icon={<DollarSign size={18} />}
              label="Accounts Payable"
              isOpen={openGroup === "Accounts Payable"}
              onToggle={() => toggleGroup(activeModule,"Accounts Payable")}
              {...theme}
              collapsed={collapsed}
            >
              <NavItem
                to="/finance/accounts-payable"
                icon={<DollarSign size={18} />}
                label="Payment Entry"
                {...theme}
                isChild
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/payments"
                icon={<FileText size={18} />}
                label="Payments"
                {...theme}
                isChild
                collapsed={collapsed}
              />
            </NavGroup>
            <NavGroup
              icon={<DollarSign size={18} />}
              label="Accounts Receivable"
              isOpen={openGroup === "Accounts Receivable"}
              onToggle={() => toggleGroup(activeModule,"Accounts Receivable")}
              {...theme}
              collapsed={collapsed}
            >
              <NavItem
                to="/finance/invoice-posting"
                icon={<FileCheck size={18} />}
                label="Invoice Posting"
                {...theme}
                isChild
                collapsed={collapsed}
              />
              <NavItem
                to="/finance/payment-receipt"
                icon={<Wallet size={18} />}
                label="Payment Receipt"
                {...theme}
                isChild
                collapsed={collapsed}
              />
            </NavGroup>
            <NavItem
              to="/finance/assets"
              icon={<Briefcase size={18} />}
              label="Assets"
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
        );

      case "mod.pro":
        return (
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
        );

      case "mod.flm":
        return (
          <>
            <NavGroup
              icon={<Folder size={18} />}
              label="Folders"
              isOpen={openGroup === "FileFolders"}
              onToggle={() => toggleGroup(activeModule,"FileFolders")}
              {...theme}
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
            </NavGroup>
            <NavGroup
              icon={<File size={18} />}
              label="Documents"
              isOpen={openGroup === "FileDocuments"}
              onToggle={() => toggleGroup(activeModule,"FileDocuments")}
              {...theme}
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
            </NavGroup>
            <NavItem
              to="/file/uploads"
              icon={<Upload size={18} />}
              label="Upload Manager"
              {...theme}
              collapsed={collapsed}
            />
          </>
        );

      case "mod.plan":
        return (
          <>
            <NavItem
              to="/plandev/plans"
              icon={<ClipboardList size={18} />}
              label="Strategic Plans"
              {...theme}
              collapsed={collapsed}
            />
            <NavGroup
              icon={<Target size={18} />}
              label="Initiatives"
              isOpen={openGroup === "PlanInitiatives"}
              onToggle={() => toggleGroup(activeModule, "PlanInitiatives")}
              {...theme}
              collapsed={collapsed}
            >
              <NavItem
                to="/plandev/initiatives/active"
                icon={<CheckCircle2 size={18} />}
                label="Active"
                {...theme}
                isChild
                collapsed={collapsed}
              />
              <NavItem
                to="/plandev/initiatives/review"
                icon={<Eye size={18} />}
                label="Under Review"
                {...theme}
                isChild
                collapsed={collapsed}
              />
            </NavGroup>
            <NavItem
              to="/plandev/calendar"
              icon={<Calendar size={18} />}
              label="Planning Calendar"
              {...theme}
              collapsed={collapsed}
            />
            <NavItem
              to="/plandev/reports"
              icon={<BarChart4 size={18} />}
              label="Reports"
              {...theme}
              collapsed={collapsed}
            />
          </>
        );

      case "mod.prj":
        return (
          <>
            <NavItem
              to="/project-management/projects"
              icon={<Briefcase size={18} />}
              label="Projects"
              {...theme}
              collapsed={collapsed}
            />
            <NavGroup
              icon={<ClipboardList size={18} />}
              label="Tasks"
              isOpen={openGroup === "PrjTasks"}
              onToggle={() => toggleGroup(activeModule, "PrjTasks")}
              {...theme}
              collapsed={collapsed}
            >
              <NavItem
                to="/project-management/tasks/my"
                icon={<CheckCircle2 size={18} />}
                label="My Tasks"
                {...theme}
                isChild
                collapsed={collapsed}
              />
              <NavItem
                to="/project-management/tasks/all"
                icon={<FileText size={18} />}
                label="All Tasks"
                {...theme}
                isChild
                collapsed={collapsed}
              />
            </NavGroup>
            <NavItem
              to="/project-management/milestones"
              icon={<Network size={18} />}
              label="Milestones"
              {...theme}
              collapsed={collapsed}
            />
            <NavItem
              to="/project-management/team"
              icon={<Users size={18} />}
              label="Team"
              {...theme}
              collapsed={collapsed}
            />
            <NavItem
              to="/project-management/reports"
              icon={<BarChart4 size={18} />}
              label="Reports"
              {...theme}
              collapsed={collapsed}
            />
          </>
        );

      default:
        return null;
    }
  };

const parsedPermissions = permissions || [];
const menus =
  parsedPermissions.find((m: MenuItem) => m.K === activeModule)?.M || [];
  const hasDynamicMenus = menus && menus.length > 0;

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
          {/* Dashboard */}
          <NavItem
            to={
              activeModule === "mod.inv"
                ? "/inventory"
                : activeModule === "mod.core"
                  ? "/core"
                  : activeModule === "mod.hrm"
                    ? "/hr"
                    : activeModule === "mod.crm"
                      ? "/crm"
                      : activeModule === "mod.fnm"
                        ? "/finance"
                        : activeModule === "mod.pro"
                          ? "/procurement"
                          : activeModule === "mod.flm"
                            ? "/file"
                            : activeModule === "mod.plan"
                              ? "/plandev"
                              : activeModule === "mod.prj"
                                ? "/project-management"
                                : "/dashboard"
            }
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            end
            {...theme}
            collapsed={collapsed}
          />

          {/* Render menus based on admin status (uncomment when needed)*/}
          {/* {isAdmin
            ? renderAdminMenus()
            : hasDynamicMenus && renderDynamicMenus(menus)} */}

          {/* { for now render for all users until role based module access is implemented} */}
          {renderAdminMenus()}
        </div>
      </div>

      {/* Footer Settings - Only for Core and File modules */}
      {(activeModule === "mod.core" || activeModule === "mod.flm") && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200/80">
          <NavItem
            to={activeModule === "mod.flm" ? "/file/settings" : "/settings"}
            icon={<Settings size={18} />}
            label={activeModule === "mod.flm" ? "File Settings" : "Settings"}
            {...theme}
            collapsed={collapsed}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
