import React from 'react';
import { Download, FileSpreadsheet, TrendingUp, BarChart3, TrendingDown } from 'lucide-react';

export const QuickRunReports: React.FC = () => {
  const quickReports = [
    { 
      name: 'Trial Balance', 
      period: 'Current Month', 
      icon: <FileSpreadsheet className="w-4 h-4" />,
      color: 'bg-indigo-100 text-indigo-900'
    },
    { 
      name: 'P&L Statement', 
      period: 'YTD', 
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-emerald-100 text-emerald-900'
    },
    { 
      name: 'Balance Sheet', 
      period: 'As of Today', 
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-900'
    },
    { 
      name: 'Cash Flow', 
      period: 'Last Quarter', 
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'bg-cyan-100 text-cyan-900'
    },
  ];

  const handleQuickRun = (reportName: string) => {
    console.log(`Quick running ${reportName}`);
    // Add quick run logic here
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-xl border border-indigo-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        Quick Run Standard Reports
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickReports.map((report, index) => (
          <button
            key={index}
            onClick={() => handleQuickRun(report.name)}
            className="bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg p-4 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 ${report.color.split(' ')[0]} rounded-lg group-hover:bg-opacity-90 transition-colors`}>
                <div className={report.color.split(' ')[1]}>
                  {report.icon}
                </div>
              </div>
              <Download className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div className="font-medium text-gray-900">{report.name}</div>
            <div className="text-xs text-gray-600 mt-1">{report.period}</div>
          </button>
        ))}
      </div>
    </div>
  );
};