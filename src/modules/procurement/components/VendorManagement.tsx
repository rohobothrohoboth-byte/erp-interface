export default function VendorManagement() {
  const vendors = [
    { name: "Tech Supplies Inc", rating: "4.8", status: "Active" },
    { name: "Office Solutions Ltd", rating: "4.5", status: "Active" },
    { name: "Global Logistics", rating: "4.2", status: "Review" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Vendor Management</h3>
      <div className="space-y-3">
        {vendors.map((vendor, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
            <div>
              <div className="font-medium text-gray-700">{vendor.name}</div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="text-yellow-500 mr-1">★</span>
                {vendor.rating}
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              vendor.status === 'Active' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {vendor.status}
            </span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Vendors:</span>
            <span className="text-sm font-medium">42</span>
          </div>
        </div>
      </div>
    </div>
  );
}