export default function PurchaseRequisitionManagement() {
  const requisitions = [
    { id: "REQ-001", department: "Marketing", amount: "$8,500", status: "Approved" },
    { id: "REQ-002", department: "Operations", amount: "$12,200", status: "Pending" },
    { id: "REQ-003", department: "R&D", amount: "$5,800", status: "Draft" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Purchase Requisition Management</h3>
      <div className="space-y-3">
        {requisitions.map((req, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
            <div>
              <div className="font-medium text-gray-700">{req.id}</div>
              <div className="text-xs text-gray-500">{req.department}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{req.amount}</div>
              <span className={`text-xs px-2 py-1 rounded ${
                req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {req.status}
              </span>
            </div>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Pending Approval:</span>
            <span className="text-sm font-medium">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}