// src/components/finance/payroll/PayrollHeader.tsx
import { motion } from "framer-motion";
import { Users, Calendar, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface PayrollHeaderProps {
  attendanceSummary?: {
    todayPresent: number;
    todayAbsent: number;
    todayLate: number;
    attendanceRate: number;
  };
  month?: string;
  year?: number;
}

const PayrollHeader: React.FC<PayrollHeaderProps> = ({
                                                       attendanceSummary,
                                                       month = new Date().toLocaleString('default', { month: 'long' }),
                                                       year = new Date().getFullYear()
                                                     }) => {
  return (
      <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-indigo-600" size={28} />
            <h1 className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent text-3xl font-bold">
              Payroll <span className="text-gray-700">Management</span>
            </h1>
            <Badge variant="outline" className="ml-2 text-indigo-600 border-indigo-200">
              {month} {year}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Manage employee payroll, attendance tracking, and compensation
          </p>
        </div>

        {/* Attendance Summary */}
        {attendanceSummary && (
            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Today</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-600 font-medium">{attendanceSummary.todayPresent}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-red-600 font-medium">{attendanceSummary.todayAbsent}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-amber-600 font-medium">{attendanceSummary.todayLate}</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-500">Attendance Rate</p>
                <p className={`text-sm font-bold ${attendanceSummary.attendanceRate >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {attendanceSummary.attendanceRate}%
                </p>
              </div>
            </div>
        )}
      </motion.div>
  );
};

export default PayrollHeader;