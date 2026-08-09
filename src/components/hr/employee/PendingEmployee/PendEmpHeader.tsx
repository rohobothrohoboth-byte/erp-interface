import { motion } from 'framer-motion';
import { Users, Clock, UserCheck, Sparkles, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../i18n/LanguageContext';

export default function PenEmpHeader() {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(t.locale || 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(t.locale || 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: 0.5
      }
    }
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        delay: 0.2
      }
    }
  };

  return (
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 via-orange-50/30 to-transparent rounded-2xl" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          {/* Left Section - Title */}
          <div className="flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur-lg opacity-30" />
              <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            <div>
              <motion.h1
                  variants={itemVariants}
                  className="text-3xl lg:text-4xl font-bold"
              >
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                {t.pending || "Pending"}
              </span>
                <span className="text-slate-800"> {t.employees || "Employees"}</span>
              </motion.h1>

              <motion.p
                  variants={itemVariants}
                  className="text-sm text-slate-500 mt-1 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {t.reviewAndManage || "Review and manage employee approval requests"}
              </motion.p>
            </div>
          </div>

          {/* Right Section - Stats & Date/Time */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <motion.div variants={badgeVariants} className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative bg-white rounded-lg px-3 py-2 shadow-sm border border-amber-200 hover:border-amber-300 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t.totalPending || "Total Pending"}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-amber-700">0</span>
                        <span className="text-xs text-slate-400">{t.awaiting || "awaiting"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative bg-white rounded-lg px-3 py-2 shadow-sm border border-blue-200 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t.toReview || "To Review"}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-blue-700">0</span>
                        <span className="text-xs text-slate-400">{t.today || "today"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

            <motion.div variants={itemVariants} className="text-right">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span>{t.liveUpdates || "Live Updates"}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{formatDate(currentTime)}</div>
              <div className="text-lg font-semibold text-slate-700 font-mono">
                {formatTime(currentTime)}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full"
            style={{ transformOrigin: 'left' }}
        />
      </motion.div>
  );
}