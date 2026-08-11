import type { DashboardStats } from '@/modules/inventory/types/dashboard.types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value || 0
  );

export default function InventoryStatCards({ stats }: { stats?: DashboardStats | null }) {
  const cards = [
    { label: 'Total Stock Value', value: stats ? formatCurrency(stats.totalStockValue) : '—' },
    { label: 'Products', value: stats ? stats.productCount.toLocaleString() : '—' },
    { label: 'Warehouses', value: stats ? stats.warehouseCount.toLocaleString() : '—' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm text-gray-500">{card.label}</h3>
          <p className="text-xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
