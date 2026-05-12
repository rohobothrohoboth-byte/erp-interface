import React, { useState } from 'react';
import { Bell, HelpCircle, Menu } from 'lucide-react';
import { useModuleStore } from '../stores/module.store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { useNavigate } from "react-router";
import { useAuthStore } from '../stores/auth.store';
import { EmpPhotoCircle } from '../components/ui/EmpPhoto';
import type { EmpPhotoRes } from '../types/hr/employee/empPhoto';


interface HeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

const MOCK_NOTIFICATIONS = [
  { id: 1, name: "Payment received",       description: "New finance transaction completed",    time: "15m ago", icon: "💸" },
  { id: 2, name: "New employee onboarded", description: "John Doe joined the HR system",        time: "1h ago",  icon: "👤" },
  { id: 3, name: "Inventory low",          description: "Stock for Product X is running low",   time: "2h ago",  icon: "⚠️" },
  { id: 4, name: "CRM update",             description: "New lead added in the sales pipeline", time: "3h ago",  icon: "📈" },
  { id: 5, name: "System alert",           description: "Scheduled maintenance tonight at 10PM", time: "5h ago", icon: "🔧" },
];

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isMobile }) => {
  const activeModule = useModuleStore((s) => s.activeModule);
  const navigate = useNavigate();
  const userName = useAuthStore((s) => s.userName);
  const logout = useAuthStore((s) => s.logout);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const DEMO_PHOTO: EmpPhotoRes = {
  id: 'demo-id',
  fileName: 'demo.png',
  contentType: 'image/png',
  photoSize: '1 KB',
  photo: 'https://github.com/shadcn.png',
};


  
  // Module-based color themes
  const themeMap: Record<string, { bg: string; border: string; text: string }> =
    {
      "mod.inv": {
        bg: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-700",
      },
      "mod.hrm": {
        bg: "bg-green-100",
        border: "border-green-200",
        text: "text-green-700",
      },
      "mod.core": {
        bg: "bg-emerald-100",
        border: "border-emerald-200",
        text: "text-emerald-700",
      },
      "mod.flm": {
        bg: "bg-emerald-100",
        border: "border-emerald-200",
        text: "text-emerald-700",
      },
      "mod.crm": {
        bg: "bg-orange-100",
        border: "border-orange-200",
        text: "text-orange-700",
      },
      "mod.fnm": {
        bg: "bg-indigo-100",
        border: "border-indigo-200",
        text: "text-indigo-700",
      },
      "mod.pro": {
        bg: "bg-purple-100",
        border: "border-purple-200",
        text: "text-purple-700",
      },
      default: {
        bg: "bg-white",
        border: "border-gray-200",
        text: "text-gray-600",
      },
    };

  const theme = themeMap[activeModule] || themeMap.default;

  return (
    <header
      className={`${theme.bg} border-b ${theme.border} shadow-nav h-16 flex items-center justify-between px-4 lg:px-6`}
    >
      <div className="flex items-center">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error-500 ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">Notifications</span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-xl mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{n.name}</p>
                      <p className="text-xs text-gray-500 truncate">{n.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
          <HelpCircle size={20} />
        </button>

        <div className="flex items-center border-l border-gray-200 pl-4 ml-2">
           <div className="mr-3 text-right hidden sm:block">
            <p className={`text-sm font-medium ${theme.text}`}>
              {userName || "User"}
            </p>
            {/* <p className="text-xs text-gray-500">
              {role || "Role"}
            </p> */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full">
              {/* <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar> */}
              <EmpPhotoCircle photo={DEMO_PHOTO} size={32} name={userName || undefined}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;