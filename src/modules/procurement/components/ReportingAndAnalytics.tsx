export default function ReportingAndAnalytics() {
  const reports = [
    { name: "Spend Analysis", lastRun: "2023-12-01" },
    { name: "Vendor Performance", lastRun: "2023-12-05" },
    { name: "Savings Report", lastRun: "2023-11-28" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Reporting & Analytics</h3>
      <div className="space-y-3">
        {reports.map((report, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
            <span className="text-gray-700">{report.name}</span>
            <span className="text-xs text-gray-500">{report.lastRun}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Monthly Savings:</span>
            <span className="text-sm font-medium text-green-600">$42,800</span>
          </div>
        </div>
      </div>
    </div>
  );
}