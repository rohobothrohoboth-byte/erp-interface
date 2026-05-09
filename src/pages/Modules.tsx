import ModulesSection from "../components/ModulesSection";
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
import { useAuthStore } from "../stores/auth.store";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

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
  { id: 1, name: "Payment received",      description: "New finance transaction completed",   time: "15m ago", icon: "💸" },
  { id: 2, name: "New employee onboarded", description: "John Doe joined the HR system",       time: "1h ago",  icon: "👤" },
  { id: 3, name: "Inventory low",          description: "Stock for Product X is running low",  time: "2h ago",  icon: "⚠️" },
  { id: 4, name: "CRM update",             description: "New lead added in the sales pipeline", time: "3h ago", icon: "📈" },
  { id: 5, name: "System alert",           description: "Scheduled maintenance tonight at 10PM", time: "5h ago", icon: "🔧" },
  { id: 6, name: "Server Restarted",       description: "Backend server restarted successfully", time: "6h ago", icon: "🔄" },
  { id: 7, name: "Bug fixed",              description: "Issue #234 resolved in dev branch",   time: "7h ago",  icon: "🐛" },
];

const mockTasks: Task[] = [
  { id: 1, title: "Team Meeting",        time: "10:00 AM", completed: false },
  { id: 2, title: "Client Presentation", time: "2:30 PM",  completed: true  },
  { id: 3, title: "Project Deadline",    time: "4:00 PM",  completed: false },
  { id: 4, title: "Review Reports",      time: "5:30 PM",  completed: false },
];

function Modules() {
  const navigate = useNavigate();
  const { logout, isAuthenticated, isLoading, role, employeeId } = useAuthStore();

  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isAdmin    = role === "admin";
  const isCEO      = role === "ceo";
  const isViceCEO  = role === "vice.ceo" || role === "vice_ceo";
  const isAuditor  = role === "auditor";
  const isSuperAdmin = employeeId === "019d19c0-ae3e-78bd-bd2a-98d36bd6e078";
  const hideSidebars = isAdmin || isCEO || isViceCEO || isAuditor || isSuperAdmin;

  const toggleTaskCompletion = useCallback((taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="relative h-screen w-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-x-hidden overflow-y-auto">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-center hidden sm:block">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 drop-shadow">
                Welcome to the{" "}
                <i className="text-blue-500 relative not-italic">
                  RST
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full" />
                </i>{" "}
                <span className="text-blue-500">ERP</span>
              </h1>
            </div>
            {/* Mobile title — compact */}
            <div className="flex-1 sm:hidden">
              <h1 className="text-lg font-bold text-gray-800">
                <span className="text-blue-500">RST</span> ERP
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/vacancies")}
                className="flex items-center gap-2 bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 shadow-sm"
              >
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">Vacancies</span>
              </Button>

              {/* Notification bell with popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                    <Bell className="h-6 w-6 text-gray-700" />

                    <span className="absolute -top-0.5 -right-0.5 flex">
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75 animate-ping" />
                      <span className="relative min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {initialNotifications.length}
                      </span>
                    </span>
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  className="w-80 p-0 rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-800">
                      Notifications
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {initialNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="text-xl mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {n.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {n.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

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
                  <DropdownMenuItem onSelect={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          {/* <Popover>
  <PopoverTrigger asChild>
    <button>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </button>
  </PopoverTrigger>

  <PopoverContent
    align="end"
    className="w-32 p-1 rounded-xl"
  >
    <div className="px-3 py-2 text-xs font-semibold text-gray-500">
      My Account
    </div>

    <div className="h-px bg-gray-200 my-1" />

    <div className="flex flex-col">
      <button
        onClick={() => navigate("/profile")}
        className="text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
      >
        Profile
      </button>

      <button
        onClick={handleLogout}
        className="text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        Logout
      </button>
    </div>
  </PopoverContent>
</Popover> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto pt-28 md:pt-24 lg:pt-20 px-4 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 h-full">
          {/* Modules — full width on mobile/tablet, flex-1 on desktop */}
          <div className="flex-1 min-w-0">
            <div className="relative w-full min-h-[500px]">
              <ModulesSection />
            </div>
          </div>

          {/* Calendar — right panel on desktop, full width below on mobile/tablet */}
          {!hideSidebars && (
            <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:flex lg:flex-col">
              <Calendar tasks={tasks} onTaskToggle={toggleTaskCompletion} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modules;
