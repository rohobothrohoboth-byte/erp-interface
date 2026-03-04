import ModulesSection from "../components/ModulesSection";
import { AnimatedList } from "../components/magicui/animated-list";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { Bell, Briefcase } from "lucide-react";
import Calendar from "../components/Calender";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { getAccessToken } from "../utils/auth.utils";
import { hasRole } from "../utils/jwt.utils";
import { useAuth } from "../contexts/AuthContext";

interface Notification {
  id: number;
  name: string;
  description: string;
  time: string;
  icon: string;
}

interface Task {
  id: number;
  title: string;
  time: string;
  completed: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    name: "Payment received",
    description: "New finance transaction completed",
    time: "15m ago",
    icon: "💸",
  },
  {
    id: 2,
    name: "New employee onboarded",
    description: "John Doe joined the HR system",
    time: "1h ago",
    icon: "👤",
  },
  {
    id: 3,
    name: "Inventory low",
    description: "Stock for Product X is running low",
    time: "2h ago",
    icon: "⚠️",
  },
  {
    id: 4,
    name: "CRM update",
    description: "New lead added in the sales pipeline",
    time: "3h ago",
    icon: "📈",
  },
  {
    id: 5,
    name: "System alert",
    description: "Scheduled maintenance tonight at 10PM",
    time: "5h ago",
    icon: "🔧",
  },
  {
    id: 6,
    name: "Server Restarted",
    description: "Backend server restarted successfully",
    time: "6h ago",
    icon: "🔄",
  },
  {
    id: 7,
    name: "Bug fixed",
    description: "Issue #234 resolved in dev branch",
    time: "7h ago",
    icon: "🐛",
  },
];
const mockTasks: Task[] = [
  { id: 1, title: "Team Meeting", time: "10:00 AM", completed: false },
  { id: 2, title: "Client Presentation", time: "2:30 PM", completed: true },
  { id: 3, title: "Project Deadline", time: "4:00 PM", completed: false },
  { id: 4, title: "Review Reports", time: "5:30 PM", completed: false },
];

function Modules() {
  const navigate = useNavigate();
const { logout, isAuthenticated, isLoading } = useAuth();
  const [visibleNotifications, setVisibleNotifications] = useState<
    Notification[]
  >([]);
  const [allNotifications, setAllNotifications] =
    useState<Notification[]>(initialNotifications);
  const [shownNotificationCount, setShownNotificationCount] =
    useState<number>(0);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Modules → not authenticated → redirect to login");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return null; // effect will handle redirect
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Get token and check roles
  const token = getAccessToken();
  const isAdmin = token ? hasRole(token, "admin") : false;
  const isCEO = token ? hasRole(token, "ceo") : false;
  const isViceCEO = token
    ? hasRole(token, "vice.ceo") || hasRole(token, "vice_ceo")
    : false;
  const isAuditor = token ? hasRole(token, "auditor") : false;

  // Hide sidebars for admin, CEO, vice CEO, and auditor roles
  const hideSidebars = isAdmin || isCEO || isViceCEO || isAuditor;

  useEffect(() => {
    document.title = selectedModule ? `RST | ${selectedModule}` : "RST";
  }, [selectedModule]);

  const handleModuleSelect = useCallback((moduleName: string) => {
    setSelectedModule(moduleName);
  }, []);

  const toggleTaskCompletion = useCallback((taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  useEffect(() => {
    const showTimer = setInterval(() => {
      if (allNotifications.length > 0) {
        const nextNotification = allNotifications[0];
        setVisibleNotifications((prev) => [nextNotification, ...prev]);
        setAllNotifications((prev) => prev.slice(1));
        setShownNotificationCount((prev) => prev + 1);
      } else {
        clearInterval(showTimer);
      }
    }, 1000);

    return () => clearInterval(showTimer);
  }, [allNotifications]);

  useEffect(() => {
    if (visibleNotifications.length > 0) {
      const removeTimer = setInterval(() => {
        setVisibleNotifications((prev) => prev.slice(0, -1));
      }, 20000);

      return () => clearInterval(removeTimer);
    }
  }, [visibleNotifications]);

  return (
    <div className="relative h-screen w-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-x-hidden overflow-y-auto">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Centered Title (Desktop) */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 drop-shadow">
                Welcome to the{" "}
                <i className="text-blue-500 relative not-italic">
                  RST
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full"></div>
                </i>{" "}
                <span className="text-blue-500">ERP</span>
              </h1>
            </div>

            {/* Header Controls */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              {/* Vacancies Button (Original Green Style) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/vacancies")}
                className="flex items-center gap-2 bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 shadow-sm"
              >
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">Vacancies</span>
              </Button>

              {/* Notification */}
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Bell className="h-6 w-6 text-gray-700" />
                </button>
                {shownNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {shownNotificationCount}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto h-full flex items-start md:items-center pt-32 md:pt-28 px-4">
        {" "}
        {/* Left Panel - Calendar (Hidden for admin/executive roles) */}
        {!hideSidebars && (
          <div className="w-1/4 h-full pr-8">
            <div className="h-full overflow-y-auto">
              <Calendar tasks={tasks} onTaskToggle={toggleTaskCompletion} />
            </div>
          </div>
        )}
        {/* Center Panel - Modules Section */}
        <div
          className={`flex items-center justify-center ${
            hideSidebars ? "w-full max-w-7xl mx-auto" : "flex-1"
          }`}
        >
          <div className="relative w-full h-full min-h-[600px]">
            <ModulesSection onModuleSelect={handleModuleSelect} />
          </div>
        </div>
        {/* Right Panel - Notifications (Hidden for admin/executive roles) */}
        {!hideSidebars && (
          <div className="w-1/4 pl-8 h-full">
            <div className="h-full flex flex-col">
              {/* Notification List with Scroll */}
              <div className="flex-1 overflow-y-auto">
                <div className="bg-transparent rounded-2xl p-6 relative">
                  <div className="relative">
                    <AnimatedList>
                      {visibleNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/70 hover:bg-white transition-all duration-200 cursor-pointer mb-3 animate-in slide-in-from-right-96 fade-in duration-300"
                        >
                          <div className="text-2xl">{notification.icon}</div>
                          <div className="flex flex-col">
                            <h3 className="font-medium text-gray-800">
                              {notification.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {notification.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </AnimatedList>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Modules;
