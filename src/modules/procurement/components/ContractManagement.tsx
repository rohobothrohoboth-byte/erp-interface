export default function ContractManagement() {
  const contracts = [
    { vendor: "Tech Supplies", endDate: "2024-06-30", status: "Active" },
    { vendor: "Office World", endDate: "2023-12-31", status: "Expiring" },
    { vendor: "Global Logistics", endDate: "2025-03-15", status: "Active" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Contract Management</h3>
      <div className="space-y-3">
        {contracts.map((contract, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
            <div>
              <div className="font-medium text-gray-700">{contract.vendor}</div>
              <div className="text-xs text-gray-500">Ends: {contract.endDate}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              contract.status === 'Active' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {contract.status}
            </span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Expiring Soon:</span>
            <span className="text-sm font-medium">2</span>
          </div>
        </div>
      </div>
    </div>
  );
}