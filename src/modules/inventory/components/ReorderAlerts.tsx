import type { ReorderAlert } from '@/modules/inventory/types/reorder.types';

export default function ReorderAlerts({ alerts }: { alerts?: ReorderAlert[] }) {
  const list = alerts ?? [];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Reorder Alerts</h3>
      {list.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No items below their reorder level.</p>
      ) : (
        <ul className="mt-2 text-sm text-red-600 space-y-1">
          {list.map((alert) => (
            <li key={`${alert.productId}-${alert.warehouseId}`}>
              {alert.productName ?? alert.productId} – on hand {alert.quantityOnHand} (reorder at{' '}
              {alert.reorderLevel})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
