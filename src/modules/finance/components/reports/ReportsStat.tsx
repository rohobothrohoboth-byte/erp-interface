import React from 'react';
import { FileSpreadsheet, Calendar, TrendingUp, Clock } from 'lucide-react';

export const ReportsStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-700">Total Reports</p>
            <p className="text-2xl font-bold text-indigo-900">24</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-indigo-600">+3 this month</div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-700">Scheduled</p>
            <p className="text-2xl font-bold text-indigo-900">8</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-indigo-600">Next: Today, 2:00 PM</div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-700">Last 24h Runs</p>
            <p className="text-2xl font-bold text-indigo-900">156</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-indigo-600">+12% from yesterday</div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-700">Avg. Run Time</p>
            <p className="text-2xl font-bold text-indigo-900">4.2s</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-indigo-600">-0.8s from last month</div>
      </div>
    </div>
  );
};