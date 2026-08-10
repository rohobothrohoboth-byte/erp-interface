export default function InventoryStatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-white rounded-lg shadow"> 
        <h3 className="text-sm text-gray-500">Total Stock Value</h3>
        <p className="text-xl font-bold">$1,200,000</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-sm text-gray-500">Items Inbound Today</h3>
        <p className="text-xl font-bold">144</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-sm text-gray-500">Items Outbound Today</h3>
        <p className="text-xl font-bold">98</p>
      </div>
    </div>
  );
}
