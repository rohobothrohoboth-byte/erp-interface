export default function InvoiceProcessingAndPayment() {
  const invoices = [
    { vendor: "Tech Supplies", amount: "$8,500", due: "2023-12-15" },
    { vendor: "Office World", amount: "$3,200", due: "2023-12-20" },
    { vendor: "Global Parts", amount: "$12,800", due: "2023-12-18" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Processing & Payment</h3>
      <div className="space-y-3">
        {invoices.map((invoice, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
            <div>
              <div className="font-medium text-gray-700">{invoice.vendor}</div>
              <div className="text-xs text-gray-500">Due: {invoice.due}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{invoice.amount}</div>
              <div className={`text-xs ${
                new Date(invoice.due) < new Date() ? 'text-red-600' : 'text-green-600'
              }`}>
                {new Date(invoice.due) < new Date() ? 'Overdue' : 'On Time'}
              </div>
            </div>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Payable:</span>
            <span className="text-sm font-medium">$24,500</span>
          </div>
        </div>
      </div>
    </div>
  );
}