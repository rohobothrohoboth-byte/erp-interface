export default function PurchaseOrderManagement() {
  const orders = [
    { id: "PO-1001", vendor: "Tech Supplies", amount: "$8,500", status: "Shipped" },
    { id: "PO-1002", vendor: "Office World", amount: "$3,200", status: "Processing" },
    { id: "PO-1003", vendor: "Global Parts", amount: "$12,800", status: "Delivered" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Purchase Order Management</h3>
      <div className="space-y-3">
        {orders.map((order, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
            <div>
              <div className="font-medium text-gray-700">{order.id}</div>
              <div className="text-xs text-gray-500">{order.vendor}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{order.amount}</div>
              <span className={`text-xs px-2 py-1 rounded ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Open Orders:</span>
            <span className="text-sm font-medium">8</span>
          </div>
        </div>
      </div>
    </div>
  );
}