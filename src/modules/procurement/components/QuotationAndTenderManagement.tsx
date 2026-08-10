export default function QuotationAndTenderManagement() {
  const tenders = [
    { id: "TDR-2023-15", name: "Office Equipment", status: "Evaluation" },
    { id: "TDR-2023-16", name: "IT Infrastructure", status: "Open" },
    { id: "TDR-2023-14", name: "Facility Maintenance", status: "Awarded" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Quotation & Tender Management</h3>
      <div className="space-y-3">
        {tenders.map((tender, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
            <div>
              <div className="font-medium text-gray-700">{tender.id}</div>
              <div className="text-xs text-gray-500">{tender.name}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              tender.status === 'Awarded' ? 'bg-green-100 text-green-800' :
              tender.status === 'Evaluation' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {tender.status}
            </span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Active Tenders:</span>
            <span className="text-sm font-medium">5</span>
          </div>
        </div>
      </div>
    </div>
  );
}