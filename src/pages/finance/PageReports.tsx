// src/pages/finance/PageReports.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Eye, Calendar,
  TrendingUp, TrendingDown, DollarSign, PieChart
} from 'lucide-react';
import { getIncomeStatement, getBalanceSheet, getCashFlowStatement, getExpenseReport } from '../../services/finance/finance.api';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const PageReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const reports: ReportType[] = [
    {
      id: 'income-statement',
      name: 'Income Statement',
      description: 'Summary of revenues and expenses',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'Snapshot of assets, liabilities, equity',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows',
      icon: <TrendingDown className="h-5 w-5" />,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      id: 'expense-report',
      name: 'Expense Report',
      description: 'Detailed expense breakdown',
      icon: <PieChart className="h-5 w-5" />,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
  ];

  const fetchReport = async (reportId: string) => {
    setLoading(true);
    setActiveReport(reportId);
    try {
      let response;
      const params = {
        startDate: `${dateRange.startDate}T00:00:00Z`,
        endDate: `${dateRange.endDate}T23:59:59Z`,
      };

      switch (reportId) {
        case 'income-statement':
          response = await getIncomeStatement(params);
          break;
        case 'balance-sheet':
          response = await getBalanceSheet({ asOfDate: `${dateRange.endDate}T23:59:59Z` });
          break;
        case 'cash-flow':
          response = await getCashFlowStatement(params);
          break;
        case 'expense-report':
          response = await getExpenseReport(params);
          break;
        default:
          return;
      }
      setReportData(response.data.data || response.data);
    } catch (error) {
      console.error(`Error fetching ${reportId}:`, error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500">Generate and view financial reports</p>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
          />
          <span className="text-gray-400">to</span>
          <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
          />
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => (
              <div
                  key={report.id}
                  className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-md transition-all ${
                      activeReport === report.id ? 'ring-2 ring-indigo-500' : 'border-gray-200'
                  }`}
                  onClick={() => fetchReport(report.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    {report.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-xs text-gray-500">{report.description}</p>
                  </div>
                </div>
                <button
                    onClick={() => fetchReport(report.id)}
                    className="w-full mt-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  View Report
                </button>
              </div>
          ))}
        </div>

        {/* Report Results */}
        {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        ) : reportData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {reports.find(r => r.id === activeReport)?.name || 'Report'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                  </p>
                </div>
                <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800">
                  <Download size={18} />
                  Export
                </button>
              </div>
              <div className="p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {JSON.stringify(reportData, null, 2)}
            </pre>
              </div>
            </div>
        )}
      </motion.div>
  );
};

export default PageReports;