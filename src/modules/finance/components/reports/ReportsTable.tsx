import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  CheckCircle,
  Clock,
  Users,
  Building,
  Globe,
  ChevronRight,
  ChevronDown,
  Loader,
} from 'lucide-react';

interface ReportItem {
  id: number;
  name: string;
  description: string;
  type: 'Financial' | 'Analytical' | 'Operational' | 'Compliance';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  lastRun: string;
  status: 'Scheduled' | 'Ready' | 'Running' | 'Error';
  size: string;
}

interface ReportsTableProps {
  data: ReportItem[];
  onViewReport: (reportId: number) => void;
  onExportReport: (reportId: number, format: 'PDF' | 'Excel' | 'CSV') => void;
  onScheduleReport: (reportId: number) => void;
  loading?: boolean;
}

const ReportsTable: React.FC<ReportsTableProps> = ({
  data,
  onViewReport,
  onExportReport,
  onScheduleReport,
  loading = false,
}) => {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      'Scheduled': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Ready': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      'Running': { bg: 'bg-amber-100', text: 'text-amber-800' },
      'Error': { bg: 'bg-rose-100', text: 'text-rose-800' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'Financial': { 
        bg: 'bg-indigo-100', 
        text: 'text-indigo-800',
        icon: <BarChart3 className="w-3 h-3 mr-1" />
      },
      'Analytical': { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        icon: <PieChart className="w-3 h-3 mr-1" />
      },
      'Operational': { 
        bg: 'bg-cyan-100', 
        text: 'text-cyan-800',
        icon: <FileText className="w-3 h-3 mr-1" />
      },
      'Compliance': { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800',
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
    };
    const config = typeConfig[type] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center`}>
        {config.icon}
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {data.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <FileSpreadsheet className="h-16 w-16 text-indigo-300 mb-4" />
          <p className="text-lg font-medium text-indigo-700">No reports found</p>
          <p className="text-sm text-indigo-500">Try adjusting your search or filter</p>
        </div>
      ) : (
        data.map((report) => (
          <motion.div
            key={report.id}
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 },
            }}
            className={`bg-white rounded-xl border ${selectedReport === report.id ? 'border-indigo-300 shadow-lg' : 'border-indigo-200 shadow-sm'} transition-all duration-200 overflow-hidden hover:shadow-md`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{report.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{report.description}</p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {report.type === 'Financial' && <BarChart3 className="w-5 h-5 text-indigo-500" />}
                  {report.type === 'Analytical' && <PieChart className="w-5 h-5 text-purple-500" />}
                  {report.type === 'Operational' && <FileText className="w-5 h-5 text-cyan-500" />}
                  {report.type === 'Compliance' && <CheckCircle className="w-5 h-5 text-amber-500" />}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {getTypeBadge(report.type)}
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {report.frequency}
                </span>
                {getStatusBadge(report.status)}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Last run: {report.lastRun}
                </div>
                <div className="text-gray-700 font-medium">{report.size}</div>
              </div>

              <div className="flex justify-between space-x-2">
                <button
                  onClick={() => onViewReport(report.id)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {selectedReport === report.id ? 'Less' : 'More'}
                  {selectedReport === report.id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>

              {selectedReport === report.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Export as:</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onExportReport(report.id, 'PDF')}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded transition-colors"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => onExportReport(report.id, 'Excel')}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded transition-colors"
                        >
                          Excel
                        </button>
                        <button
                          onClick={() => onExportReport(report.id, 'CSV')}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded transition-colors"
                        >
                          CSV
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Schedule:</span>
                      <button
                        onClick={() => onScheduleReport(report.id)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded transition-colors flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        Schedule
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Delivery:</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-indigo-50 rounded transition-colors">
                          <Users className="w-4 h-4 text-indigo-500" />
                        </button>
                        <button className="p-1 hover:bg-indigo-50 rounded transition-colors">
                          <Building className="w-4 h-4 text-indigo-500" />
                        </button>
                        <button className="p-1 hover:bg-indigo-50 rounded transition-colors">
                          <Globe className="w-4 h-4 text-indigo-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
};

export default ReportsTable;