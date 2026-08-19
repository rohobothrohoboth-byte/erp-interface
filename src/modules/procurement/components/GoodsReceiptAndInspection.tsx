export default function GoodsReceiptAndInspection() {
  const receipts = [
    { po: "PO-1001", items: 15, status: "Inspected" },
    { po: "PO-1002", items: 8, status: "Pending" },
    { po: "PO-1003", items: 22, status: "Partial" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Goods Receipt & Inspection</h3>
      <div className="space-y-3">
        {receipts.map((receipt, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
            <div>
              <div className="font-medium text-gray-700">{receipt.po}</div>
              <div className="text-xs text-gray-500">{receipt.items} items</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              receipt.status === 'Inspected' ? 'bg-green-100 text-green-800' :
              receipt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {receipt.status}
            </span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Pending Inspections:</span>
            <span className="text-sm font-medium">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}