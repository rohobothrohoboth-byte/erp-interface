export default function ReorderAlerts() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Reorder Alerts</h3>
      <ul className="mt-2 text-sm text-red-600">
        <li>Item C below reorder point!</li>
        <li>Item D low stock!</li>
      </ul>
    </div>
  );
}
