export default function WarehouseManagement({ warehouseCount }: { warehouseCount?: number }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Warehouse Overview</h3>
      <p className="text-sm text-gray-600 mt-2">
        Active warehouses: {warehouseCount ?? "—"}
      </p>
    </div>
  );
}
