// layout/layout.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Menu } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import NotificationCenter from "../components/Notification/NotificationCenter";
import { useNotification } from "../contexts/NotificationContext";
import toast from 'react-hot-toast';

// ✅ Helper function to safely extract error message
const getErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  // API error response
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.data?.message) return error.data.message;
  if (error?.message) return error.message;

  // If it's an object with errors array
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (Array.isArray(errors)) return errors.join(', ');
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ');
    }
    return String(errors);
  }

  // Try to stringify if it's an object
  try {
    if (typeof error === 'object') return JSON.stringify(error);
  } catch {
    // Ignore
  }

  return 'An unexpected error occurred';
};

// ✅ Updated showToast with safe error handling
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (error: any) => {
    const message = getErrorMessage(error);
    toast.error(message);
  },
  info: (message: string) => toast(message, { icon: "ℹ️" }),
  warning: (message: string) => toast(message, { icon: "⚠️" }),
  loading: (message: string) => toast.loading(message),
  dismiss: (toastId?: string) => toastId ? toast.dismiss(toastId) : toast.dismiss(),
  custom: (message: string, options?: any) => toast(message, options),
};

/* ==================== LAYOUT ==================== */
const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const { t } = useLanguage();
  const { unreadCount } = useNotification();

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) setMobileSidebarOpen(false);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    document.body.style.overflow = (mobileSidebarOpen && isMobile) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileSidebarOpen, isMobile]);

  const toggleSidebar = useCallback(() => setMobileSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {isMobile && mobileSidebarOpen && (
            <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={closeSidebar} />
        )}

        {isMobile && (
            <motion.div
                animate={{ x: mobileSidebarOpen ? 0 : "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-30 lg:hidden"
            >
              <Sidebar onClose={closeSidebar} />
            </motion.div>
        )}

        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
              isSidebarOpen={mobileSidebarOpen}
          />

          {isMobile && !mobileSidebarOpen && (
              <button
                  onClick={toggleSidebar}
                  className="fixed bottom-6 left-6 z-20 lg:hidden bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
          )}

          <main className="flex-1 overflow-y-auto">
            <div className="py-6 px-4 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
  );
};

export default Layout;