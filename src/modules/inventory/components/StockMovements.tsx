export default function StockMovements() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Recent Stock Movements</h3>
      {/* insert table or list */}
      <ul className="mt-2 text-sm text-gray-600">
        <li>Inbound: Item A – Qty 50</li>
        <li>Outbound: Item B – Qty 30</li>
      </ul>
    </div>
  );
}
