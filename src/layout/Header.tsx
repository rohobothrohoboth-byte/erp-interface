import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bell, HelpCircle, Menu, X, LogOut, User, Settings, Sun, Moon, Activity, LayoutDashboard, Building2, MapPin, Users, Briefcase } from 'lucide-react';
import { useModuleStore } from '../stores/module.store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { useNavigate } from "react-router";
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import { useLanguage } from '../i18n/LanguageContext';
import NotificationCenter from '../components/Notification/NotificationCenter';

interface HeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
  isSidebarOpen?: boolean;
}

const MODULE_NAMES: Record<string, string> = {
  "mod.hrm": "Human Resources", "mod.core": "Core System", "mod.inv": "Inventory",
  "mod.crm": "CRM", "mod.fnm": "Finance", "mod.pro": "Procurement",
  "mod.flm": "File Management", "mod.pld": "Planning", "mod.prm": "Projects",
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isMobile, isSidebarOpen = false }) => {
  const activeModule = useModuleStore((s) => s.activeModule);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    userName,
    role,
    logout,
    branchName,
    departmentName,
    positionName,
    branchId,
    departmentId,
    positionId,
    userId,
    fetchOrganizationDetails,
    isAuthenticated
  } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const [helpOpen, setHelpOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const helpRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === 'admin' || role === 'super_admin';
  const moduleName = MODULE_NAMES[activeModule] || t.dashboard || 'Dashboard';

  // ✅ Debug: Log org fields
  useEffect(() => {
    if (isAuthenticated && userId && !branchName && !departmentName && !positionName) {
      console.log('📡 Header: Fetching organization details for user:', userId);
      fetchOrganizationDetails(userId);
    }
  }, [isAuthenticated, userId, branchName, departmentName, positionName, fetchOrganizationDetails]);

  // ✅ Organization display name
  const orgDisplay = useMemo(() => {
    const parts = [];
    if (branchName) parts.push(branchName);
    if (departmentName) parts.push(departmentName);
    if (positionName) parts.push(positionName);
    return parts.length > 0 ? parts.join(' • ') : 'No Organization Assigned';
  }, [branchName, departmentName, positionName]);

  // ✅ Short org display for mobile
  const shortOrgDisplay = useMemo(() => {
    if (branchName && departmentName) {
      return `${branchName} • ${departmentName}`;
    }
    return branchName || departmentName || 'No Org';
  }, [branchName, departmentName]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const timeStr = useMemo(() => currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), [currentTime]);
  const dateStr = useMemo(() => currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), [currentTime]);

  const helpItems = [
    { label: t.documentation || 'Documentation', onClick: () => window.open('/docs', '_blank') },
    { label: t.faq || 'FAQ', onClick: () => navigate('/faq') },
    { label: t.contactSupport || 'Contact Support', onClick: () => window.open('mailto:support@rst.com') }
  ];

  // ✅ Get initials for avatar
  const initials = useMemo(() => {
    if (userName) return userName.charAt(0).toUpperCase();
    return 'U';
  }, [userName]);

  // ✅ Check if user has org info
  const hasOrgInfo = useMemo(() => {
    return !!(branchName || departmentName || positionName);
  }, [branchName, departmentName, positionName]);

  return (
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14 lg:h-16">
          {/* Left - Logo & Module Name */}
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
                <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0">
                  {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            )}
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide truncate">
              {moduleName}
            </span>
            </div>
          </div>

          {/* Center - Organization Info */}
          <div className="hidden lg:flex items-center gap-4 text-slate-500 dark:text-slate-400">
            {hasOrgInfo ? (
                <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                  {branchName && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Building2 size={12} className="text-emerald-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                      {branchName}
                    </span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                      </>
                  )}
                  {departmentName && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Users size={12} className="text-blue-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                      {departmentName}
                    </span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                      </>
                  )}
                  {positionName && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Briefcase size={12} className="text-purple-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                    {positionName}
                  </span>
                      </div>
                  )}
                </div>
            ) : (
                <div className="text-xs text-slate-400">No Organization Assigned</div>
            )}

            {/* Time */}
            <div className="flex items-center gap-2 text-sm">
              <Activity size={14} />
              <span className="font-mono">{dateStr} • {timeStr}</span>
            </div>
          </div>

          {/* Center - Short Org Info (Mobile) */}
          <div className="flex lg:hidden items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
            <Building2 size={12} className="text-emerald-500 flex-shrink-0" />
            <span className="truncate">{shortOrgDisplay}</span>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Help */}
            <div className="relative" ref={helpRef}>
              <button onClick={() => setHelpOpen(!helpOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <HelpCircle size={20} />
              </button>
              {helpOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.helpAndSupport || 'Help & Support'}</p>
                    </div>
                    <div className="p-1">
                      {helpItems.map(item => (
                          <button key={item.label} onClick={() => { item.onClick(); setHelpOpen(false); }}
                                  className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                            {item.label}
                          </button>
                      ))}
                    </div>
                  </div>
              )}
            </div>

            {/* Notification Center */}
            <NotificationCenter />

            {/* User */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="hidden sm:block text-right min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{userName || t.user || "User"}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                  {branchName && (
                      <>
                        <Building2 size={10} />
                        <span className="truncate max-w-[80px]">{branchName}</span>
                      </>
                  )}
                  {departmentName && (
                      <>
                        <span className="text-slate-300">•</span>
                        <Users size={10} />
                        <span className="truncate max-w-[80px]">{departmentName}</span>
                      </>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl">
                  <DropdownMenuLabel>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{userName || t.user || "User"}</div>
                    <div className="text-xs text-slate-500 capitalize">{role || t.employee || "Employee"}</div>

                    {/* Organization Info in Dropdown */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      {branchName && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Building2 size={12} className="text-emerald-500" />
                            <span>{branchName}</span>
                          </div>
                      )}
                      {departmentName && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Users size={12} className="text-blue-500" />
                            <span>{departmentName}</span>
                          </div>
                      )}
                      {positionName && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Briefcase size={12} className="text-purple-500" />
                            <span>{positionName}</span>
                          </div>
                      )}
                      {!branchName && !departmentName && !positionName && (
                          <div className="text-xs text-slate-400 italic">No organization assigned</div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />{t.profile || 'Profile'}
                  </DropdownMenuItem>
                  {isAdmin && (
                      <DropdownMenuItem onSelect={() => navigate("/settings")}>
                        <Settings className="w-4 h-4 mr-2" />{t.settings || 'Settings'}
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => navigate("/modules")}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />{t.dashboard || 'Dashboard'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />{t.logout || 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
  );
};

export default React.memo(Header);