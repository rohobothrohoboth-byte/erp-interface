import type { StockMovement } from '@/modules/inventory/types/stock.types';

export default function StockMovements({ movements }: { movements?: StockMovement[] }) {
  const list = movements ?? [];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Recent Stock Movements</h3>
      {list.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No recent stock movements.</p>
      ) : (
        <ul className="mt-2 text-sm text-gray-600 space-y-1">
          {list.slice(0, 8).map((m) => {
            const inbound = m.type?.toUpperCase() === 'IN';
            return (
              <li key={m.id} className="flex items-center justify-between">
                <span>
                  {m.type}: {m.productName ?? m.productId} – Qty {m.quantity}
                </span>
                <span className={inbound ? 'text-emerald-600' : 'text-red-600'}>
                  {inbound ? '+' : '-'}
                  {Math.abs(m.quantity)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
