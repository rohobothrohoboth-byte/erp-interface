#!/usr/bin/env python3
"""Generate real Inventory + Project module pages and fix A-item shells."""

from __future__ import annotations

from pathlib import Path

ROOT = Path("/workspace/src")


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.lstrip("\n"), encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT.parent)}")


LIST_PAGE = '''
import {{ useMemo, useState }} from "react";
import {{ useNavigate }} from "react-router-dom";
import {{ ModulePageShell, StatusBadge }} from "@/shared/components/ModulePageShell";
import {{ Button }} from "@/shared/components/ui/button";
import {{ showToast }} from "@/shared/layout/layout";
{extra_imports}

const DATA = {data_literal};

export default function {component_name}() {{
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState(DATA);

  const filtered = useMemo(() => {{
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }}, [rows, search]);

  return (
    <ModulePageShell
      title="{title}"
      subtitle="{subtitle}"
      stats={{{stats}}}
      searchValue={{search}}
      onSearchChange={{setSearch}}
      searchPlaceholder="{search_placeholder}"
      onRefresh={{() => showToast("Refreshed {title}", "success")}}
      primaryActionLabel="{primary_label}"
      onPrimaryAction={{() => {{
        {primary_action}
      }}}}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
{headers}
            </tr>
          </thead>
          <tbody>
            {{filtered.map((row) => (
              <tr key={{row.id}} className="border-t border-slate-100 hover:bg-slate-50/80">
{cells}
              </tr>
            ))}}
            {{filtered.length === 0 && (
              <tr>
                <td colSpan={{99}} className="px-4 py-8 text-center text-slate-400">
                  No records match your filters.
                </td>
              </tr>
            )}}
          </tbody>
        </table>
      </div>
    </ModulePageShell>
  );
}}
'''


FORM_PAGE = '''
import {{ useState }} from "react";
import {{ useNavigate }} from "react-router-dom";
import {{ ModulePageShell }} from "@/shared/components/ModulePageShell";
import {{ Button }} from "@/shared/components/ui/button";
import {{ Input }} from "@/shared/components/ui/input";
import {{ Label }} from "@/shared/components/ui/label";
import {{ showToast }} from "@/shared/layout/layout";

export default function {component_name}() {{
  const navigate = useNavigate();
  const [form, setForm] = useState({default_form});

  const update = (key: string, value: string) =>
    setForm((prev) => ({{ ...prev, [key]: value }}));

  return (
    <ModulePageShell
      title="{title}"
      subtitle="{subtitle}"
      onRefresh={{() => navigate(-1)}}
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={{(e) => {{
          e.preventDefault();
          showToast("{success_toast}", "success");
          navigate("{success_nav}");
        }}}}
      >
{fields}
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={{() => navigate(-1)}}>
            Cancel
          </Button>
        </div>
      </form>
    </ModulePageShell>
  );
}}
'''


def th(label: str) -> str:
    return f'              <th className="px-4 py-3 font-medium">{label}</th>'


def td(expr: str) -> str:
    return f"                <td className=\"px-4 py-3 text-slate-700\">{{{expr}}}</td>"


def field(name: str, label: str, placeholder: str = "") -> str:
    return f'''        <div className="space-y-1.5">
          <Label htmlFor="{name}">{label}</Label>
          <Input
            id="{name}"
            value={{form.{name}}}
            placeholder="{placeholder or label}"
            onChange={{(e) => update("{name}", e.target.value)}}
            required
          />
        </div>'''


def gen_inventory() -> None:
    # types + mock service
    write(
        ROOT / "modules/inventory/types/inventory.types.ts",
        """
export type ProductStatus = 'Active' | 'Inactive' | 'Discontinued';
export type StockMovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST' | 'COUNT';

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  qtyOnHand: number;
  reorderLevel: number;
  unitCost: number;
  warehouse: string;
  status: ProductStatus;
};

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  location: string;
  zones: number;
  capacity: number;
  utilization: number;
  status: 'Active' | 'Inactive';
};

export type StockMovement = {
  id: string;
  type: StockMovementType;
  sku: string;
  productName: string;
  qty: number;
  warehouse: string;
  reference: string;
  date: string;
  status: 'Posted' | 'Draft' | 'Cancelled';
};
""",
    )

    write(
        ROOT / "modules/inventory/services/inventory.api.ts",
        """
import type { Product, StockMovement, Warehouse } from '@/modules/inventory/types/inventory.types';

const products: Product[] = [
  { id: 'p1', sku: 'RM-1001', name: 'Portland Cement 50kg', category: 'Raw Material', uom: 'BAG', qtyOnHand: 1240, reorderLevel: 300, unitCost: 18.5, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p2', sku: 'FG-2204', name: 'Ceramic Floor Tile 60x60', category: 'Finished Goods', uom: 'BOX', qtyOnHand: 86, reorderLevel: 120, unitCost: 42, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p3', sku: 'SP-3310', name: 'Hydraulic Pump Seal Kit', category: 'Spare Parts', uom: 'SET', qtyOnHand: 24, reorderLevel: 40, unitCost: 75, warehouse: 'WH-MEK-02', status: 'Active' },
  { id: 'p4', sku: 'CO-4402', name: 'Copper Cable 2.5mm', category: 'Consumables', uom: 'M', qtyOnHand: 3500, reorderLevel: 1000, unitCost: 1.2, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p5', sku: 'FG-1188', name: 'Office Desk Modular', category: 'Finished Goods', uom: 'PCS', qtyOnHand: 12, reorderLevel: 8, unitCost: 210, warehouse: 'WH-AA-OUT', status: 'Inactive' },
];

const warehouses: Warehouse[] = [
  { id: 'w1', code: 'WH-ADDIS-01', name: 'Addis Central Warehouse', location: 'Addis Ababa', zones: 6, capacity: 10000, utilization: 72, status: 'Active' },
  { id: 'w2', code: 'WH-MEK-02', name: 'Mekelle Spare Depot', location: 'Mekelle', zones: 3, capacity: 2500, utilization: 58, status: 'Active' },
  { id: 'w3', code: 'WH-AA-OUT', name: 'Outbound Staging', location: 'Addis Ababa', zones: 2, capacity: 1200, utilization: 41, status: 'Active' },
];

const movements: StockMovement[] = [
  { id: 'm1', type: 'IN', sku: 'RM-1001', productName: 'Portland Cement 50kg', qty: 500, warehouse: 'WH-ADDIS-01', reference: 'GRN-1042', date: '2026-08-08', status: 'Posted' },
  { id: 'm2', type: 'OUT', sku: 'FG-2204', productName: 'Ceramic Floor Tile 60x60', qty: 40, warehouse: 'WH-ADDIS-01', reference: 'SO-8891', date: '2026-08-08', status: 'Posted' },
  { id: 'm3', type: 'TRANSFER', sku: 'SP-3310', productName: 'Hydraulic Pump Seal Kit', qty: 10, warehouse: 'WH-MEK-02', reference: 'TR-221', date: '2026-08-07', status: 'Posted' },
  { id: 'm4', type: 'ADJUST', sku: 'CO-4402', productName: 'Copper Cable 2.5mm', qty: -25, warehouse: 'WH-ADDIS-01', reference: 'ADJ-77', date: '2026-08-06', status: 'Draft' },
  { id: 'm5', type: 'COUNT', sku: 'FG-1188', productName: 'Office Desk Modular', qty: 12, warehouse: 'WH-AA-OUT', reference: 'CNT-19', date: '2026-08-05', status: 'Posted' },
];

const delay = <T,>(data: T, ms = 250) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));

export const inventoryApi = {
  getProducts: () => delay(products),
  getWarehouses: () => delay(warehouses),
  getMovements: () => delay(movements),
  getCategories: () => delay([
    { id: 'c1', name: 'Raw Material', products: 42, status: 'Active' },
    { id: 'c2', name: 'Finished Goods', products: 31, status: 'Active' },
    { id: 'c3', name: 'Spare Parts', products: 58, status: 'Active' },
    { id: 'c4', name: 'Consumables', products: 77, status: 'Active' },
  ]),
  getUnits: () => delay([
    { id: 'u1', code: 'PCS', name: 'Pieces', decimals: 0 },
    { id: 'u2', code: 'BAG', name: 'Bag', decimals: 0 },
    { id: 'u3', code: 'BOX', name: 'Box', decimals: 0 },
    { id: 'u4', code: 'M', name: 'Meter', decimals: 2 },
    { id: 'u5', code: 'SET', name: 'Set', decimals: 0 },
  ]),
};
""",
    )

    pages = [
        {
            "path": "modules/inventory/pages/products/ProductList.tsx",
            "component_name": "ProductList",
            "title": "Products",
            "subtitle": "Maintain SKUs, stock on hand, reorder levels, and costing.",
            "search_placeholder": "Search SKU, name, category, warehouse...",
            "primary_label": "Add Product",
            "primary_action": 'showToast("Open create product form", "success");',
            "stats": "{[{ label: 'SKUs', value: rows.length }, { label: 'Below Reorder', value: rows.filter(r => r.qtyOnHand < r.reorderLevel).length, hint: 'Needs purchase attention' }, { label: 'Active', value: rows.filter(r => r.status === 'Active').length }, { label: 'Inventory Value', value: `$${rows.reduce((s, r) => s + r.qtyOnHand * r.unitCost, 0).toLocaleString()}`, hint: 'On-hand × unit cost' }]}",
            "data_literal": """[
  { id: 'p1', sku: 'RM-1001', name: 'Portland Cement 50kg', category: 'Raw Material', uom: 'BAG', qtyOnHand: 1240, reorderLevel: 300, unitCost: 18.5, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p2', sku: 'FG-2204', name: 'Ceramic Floor Tile 60x60', category: 'Finished Goods', uom: 'BOX', qtyOnHand: 86, reorderLevel: 120, unitCost: 42, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p3', sku: 'SP-3310', name: 'Hydraulic Pump Seal Kit', category: 'Spare Parts', uom: 'SET', qtyOnHand: 24, reorderLevel: 40, unitCost: 75, warehouse: 'WH-MEK-02', status: 'Active' },
  { id: 'p4', sku: 'CO-4402', name: 'Copper Cable 2.5mm', category: 'Consumables', uom: 'M', qtyOnHand: 3500, reorderLevel: 1000, unitCost: 1.2, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p5', sku: 'FG-1188', name: 'Office Desk Modular', category: 'Finished Goods', uom: 'PCS', qtyOnHand: 12, reorderLevel: 8, unitCost: 210, warehouse: 'WH-AA-OUT', status: 'Inactive' },
]""",
            "headers": "\n".join(th(x) for x in ["SKU", "Product", "Category", "On Hand", "Reorder", "Warehouse", "Status", ""]),
            "cells": "\n".join([
                td("row.sku"),
                '                <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>',
                td("row.category"),
                td("`${row.qtyOnHand} ${row.uom}`"),
                td("row.reorderLevel"),
                td("row.warehouse"),
                '                <td className="px-4 py-3"><StatusBadge status={row.status} tone={row.status === "Active" ? "success" : "neutral"} /></td>',
                '                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => showToast(`View ${row.sku}`, "success")}>View</Button></td>',
            ]),
            "extra_imports": "",
        },
        {
            "path": "modules/inventory/pages/categories/CategoriesPage.tsx",
            "component_name": "CategoriesPage",
            "title": "Product Categories",
            "subtitle": "Organize inventory master data for reporting and replenishment.",
            "search_placeholder": "Search categories...",
            "primary_label": "Add Category",
            "primary_action": 'showToast("Category draft created", "success"); setRows((prev) => [...prev, { id: `c${prev.length+1}`, name: `New Category ${prev.length+1}`, products: 0, status: "Active" }]);',
            "stats": "{[{ label: 'Categories', value: rows.length }, { label: 'Active', value: rows.filter(r => r.status === 'Active').length }, { label: 'Products Mapped', value: rows.reduce((s, r) => s + r.products, 0) }]}",
            "data_literal": "[{ id: 'c1', name: 'Raw Material', products: 42, status: 'Active' }, { id: 'c2', name: 'Finished Goods', products: 31, status: 'Active' }, { id: 'c3', name: 'Spare Parts', products: 58, status: 'Active' }, { id: 'c4', name: 'Consumables', products: 77, status: 'Active' }]",
            "headers": "\n".join(th(x) for x in ["Category", "Products", "Status", ""]),
            "cells": "\n".join([
                '                <td className="px-4 py-3 font-medium">{row.name}</td>',
                td("row.products"),
                '                <td className="px-4 py-3"><StatusBadge status={row.status} tone="success" /></td>',
                '                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => showToast("Edit category", "success")}>Edit</Button></td>',
            ]),
            "extra_imports": "",
        },
        {
            "path": "modules/inventory/pages/units/UnitsPage.tsx",
            "component_name": "UnitsPage",
            "title": "Units of Measure",
            "subtitle": "Define stock keeping and conversion units used across warehouses.",
            "search_placeholder": "Search unit code or name...",
            "primary_label": "Add Unit",
            "primary_action": 'showToast("Unit saved locally", "success");',
            "stats": "{[{ label: 'Units', value: rows.length }, { label: 'Integer Units', value: rows.filter(r => r.decimals === 0).length }, { label: 'Decimal Units', value: rows.filter(r => r.decimals > 0).length }]}",
            "data_literal": "[{ id: 'u1', code: 'PCS', name: 'Pieces', decimals: 0 }, { id: 'u2', code: 'BAG', name: 'Bag', decimals: 0 }, { id: 'u3', code: 'BOX', name: 'Box', decimals: 0 }, { id: 'u4', code: 'M', name: 'Meter', decimals: 2 }, { id: 'u5', code: 'SET', name: 'Set', decimals: 0 }]",
            "headers": "\n".join(th(x) for x in ["Code", "Name", "Decimals", ""]),
            "cells": "\n".join([
                '                <td className="px-4 py-3 font-medium">{row.code}</td>',
                td("row.name"),
                td("row.decimals"),
                '                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">Edit</Button></td>',
            ]),
            "extra_imports": "",
        },
        {
            "path": "modules/inventory/pages/barcodes/BarcodePage.tsx",
            "component_name": "BarcodePage",
            "title": "Barcode Management",
            "subtitle": "Map barcodes and labels to inventory SKUs for warehouse scanning.",
            "search_placeholder": "Search barcode or SKU...",
            "primary_label": "Generate Labels",
            "primary_action": 'showToast("Label batch queued", "success");',
            "stats": "{[{ label: 'Barcodes', value: rows.length }, { label: 'Active', value: rows.filter(r => r.status === 'Active').length }, { label: 'Unassigned', value: rows.filter(r => !r.sku).length }]}",
            "data_literal": "[{ id: 'b1', barcode: '6281001001001', sku: 'RM-1001', format: 'EAN-13', status: 'Active' }, { id: 'b2', barcode: '6281001002204', sku: 'FG-2204', format: 'EAN-13', status: 'Active' }, { id: 'b3', barcode: 'QR-SP-3310', sku: 'SP-3310', format: 'QR', status: 'Active' }, { id: 'b4', barcode: 'TEMP-0008', sku: '', format: 'CODE128', status: 'Draft' }]",
            "headers": "\n".join(th(x) for x in ["Barcode", "SKU", "Format", "Status"]),
            "cells": "\n".join([
                '                <td className="px-4 py-3 font-mono text-xs">{row.barcode}</td>',
                td("row.sku || '—'"),
                td("row.format"),
                '                <td className="px-4 py-3"><StatusBadge status={row.status} tone={row.status === "Active" ? "success" : "warning"} /></td>',
            ]),
            "extra_imports": "",
        },
    ]

    # stock movement pages share pattern
    for name, title, mtype, path in [
        ("StockInPage", "Stock In", "IN", "modules/inventory/pages/stock/StockInPage.tsx"),
        ("StockOutPage", "Stock Out", "OUT", "modules/inventory/pages/stock/StockOutPage.tsx"),
        ("StockTransferPage", "Stock Transfer", "TRANSFER", "modules/inventory/pages/stock/StockTransferPage.tsx"),
        ("StockAdjustmentPage", "Stock Adjustment", "ADJUST", "modules/inventory/pages/stock/StockAdjustmentPage.tsx"),
        ("StockCountPage", "Stock Count", "COUNT", "modules/inventory/pages/stock/StockCountPage.tsx"),
    ]:
        pages.append({
            "path": path,
            "component_name": name,
            "title": title,
            "subtitle": f"Post and track {title.lower()} movements across warehouses.",
            "search_placeholder": "Search reference, SKU, warehouse...",
            "primary_label": f"New {title}",
            "primary_action": f'showToast("Draft {title.lower()} created", "success");',
            "stats": f"{{[{{ label: 'Documents', value: rows.length }}, {{ label: 'Posted', value: rows.filter(r => r.status === 'Posted').length }}, {{ label: 'Draft', value: rows.filter(r => r.status === 'Draft').length }}, {{ label: 'Qty', value: rows.reduce((s, r) => s + Math.abs(r.qty), 0) }}]}}",
            "data_literal": f"""[
  {{ id: 'm1', type: '{mtype}', sku: 'RM-1001', productName: 'Portland Cement 50kg', qty: 120, warehouse: 'WH-ADDIS-01', reference: '{mtype}-1042', date: '2026-08-08', status: 'Posted' }},
  {{ id: 'm2', type: '{mtype}', sku: 'FG-2204', productName: 'Ceramic Floor Tile 60x60', qty: 35, warehouse: 'WH-ADDIS-01', reference: '{mtype}-1043', date: '2026-08-07', status: 'Posted' }},
  {{ id: 'm3', type: '{mtype}', sku: 'SP-3310', productName: 'Hydraulic Pump Seal Kit', qty: 8, warehouse: 'WH-MEK-02', reference: '{mtype}-1044', date: '2026-08-06', status: 'Draft' }},
]""",
            "headers": "\n".join(th(x) for x in ["Reference", "SKU", "Product", "Qty", "Warehouse", "Date", "Status"]),
            "cells": "\n".join([
                '                <td className="px-4 py-3 font-medium">{row.reference}</td>',
                td("row.sku"),
                td("row.productName"),
                td("row.qty"),
                td("row.warehouse"),
                td("row.date"),
                '                <td className="px-4 py-3"><StatusBadge status={row.status} tone={row.status === "Posted" ? "success" : "warning"} /></td>',
            ]),
            "extra_imports": "",
        })

    pages.extend([
        {
            "path": "modules/inventory/pages/warehouse/WarehousePage.tsx",
            "component_name": "WarehousePage",
            "title": "Warehouses",
            "subtitle": "Manage warehouse sites, capacity, and operational status.",
            "search_placeholder": "Search warehouse code or location...",
            "primary_label": "Add Warehouse",
            "primary_action": 'showToast("Warehouse form opened", "success");',
            "stats": "{[{ label: 'Warehouses', value: rows.length }, { label: 'Avg Utilization', value: `${Math.round(rows.reduce((s,r)=>s+r.utilization,0)/rows.length)}%` }, { label: 'Zones', value: rows.reduce((s,r)=>s+r.zones,0) }]}",
            "data_literal": "[{ id: 'w1', code: 'WH-ADDIS-01', name: 'Addis Central Warehouse', location: 'Addis Ababa', zones: 6, capacity: 10000, utilization: 72, status: 'Active' }, { id: 'w2', code: 'WH-MEK-02', name: 'Mekelle Spare Depot', location: 'Mekelle', zones: 3, capacity: 2500, utilization: 58, status: 'Active' }, { id: 'w3', code: 'WH-AA-OUT', name: 'Outbound Staging', location: 'Addis Ababa', zones: 2, capacity: 1200, utilization: 41, status: 'Active' }]",
            "headers": "\n".join(th(x) for x in ["Code", "Name", "Location", "Zones", "Utilization", "Status"]),
            "cells": "\n".join([
                '                <td className="px-4 py-3 font-medium">{row.code}</td>',
                td("row.name"),
                td("row.location"),
                td("row.zones"),
                td("`$${row.utilization}% of ${row.capacity}`".replace("$$", "$") if False else '                <td className="px-4 py-3">{row.utilization}% <span className="text-slate-400">/ {row.capacity}</span></td>'),
                '                <td className="px-4 py-3"><StatusBadge status={row.status} tone="success" /></td>',
            ]),
            "extra_imports": "",
        },
        {
            "path": "modules/inventory/pages/warehouse/WarehouseZonesPage.tsx",
            "component_name": "WarehouseZonesPage",
            "title": "Warehouse Zones",
            "subtitle": "Configure putaway zones, picking areas, and staging locations.",
            "search_placeholder": "Search zone or warehouse...",
            "primary_label": "Add Zone",
            "primary_action": 'showToast("Zone created", "success");',
            "stats": "{[{ label: 'Zones', value: rows.length }, { label: 'Picking', value: rows.filter(r => r.type === 'Picking').length }, { label: 'Bulk', value: rows.filter(r => r.type === 'Bulk').length }]}",
            "data_literal": "[{ id: 'z1', warehouse: 'WH-ADDIS-01', code: 'A-RECV', name: 'Receiving Dock', type: 'Receiving', bins: 12 }, { id: 'z2', warehouse: 'WH-ADDIS-01', code: 'B-PICK', name: 'Fast Pick', type: 'Picking', bins: 48 }, { id: 'z3', warehouse: 'WH-ADDIS-01', code: 'C-BULK', name: 'Bulk Storage', type: 'Bulk', bins: 30 }, { id: 'z4', warehouse: 'WH-MEK-02', code: 'M-SPARE', name: 'Spare Parts Cage', type: 'Secure', bins: 16 }]",
            "headers": "\n".join(th(x) for x in ["Warehouse", "Zone", "Name", "Type", "Bins"]),
            "cells": "\n".join([td("row.warehouse"), '                <td className="px-4 py-3 font-medium">{row.code}</td>', td("row.name"), td("row.type"), td("row.bins")]),
            "extra_imports": "",
        },
        {
            "path": "modules/inventory/pages/warehouse/WarehouseLayoutPage.tsx",
            "component_name": "WarehouseLayoutPage",
            "title": "Warehouse Layout",
            "subtitle": "Visualize aisle/bin structure used for directed putaway and picking.",
            "search_placeholder": "Search aisle or bin...",
            "primary_label": "Import Layout",
            "primary_action": 'showToast("Layout import started", "success");',
            "stats": "{[{ label: 'Aisles', value: rows.length }, { label: 'Bins', value: rows.reduce((s,r)=>s+r.bins,0) }, { label: 'Occupied', value: `${Math.round(rows.reduce((s,r)=>s+r.occupancy,0)/rows.length)}%` }]}",
            "data_literal": "[{ id: 'a1', aisle: 'A1', bins: 20, occupancy: 80, temperature: 'Ambient' }, { id: 'a2', aisle: 'A2', bins: 20, occupancy: 65, temperature: 'Ambient' }, { id: 'a3', aisle: 'B1', bins: 16, occupancy: 42, temperature: 'Ambient' }, { id: 'a4', aisle: 'C-COLD', bins: 10, occupancy: 55, temperature: 'Cold' }]",
            "headers": "\n".join(th(x) for x in ["Aisle", "Bins", "Occupancy", "Climate"]),
            "cells": "\n".join(['                <td className="px-4 py-3 font-medium">{row.aisle}</td>', td("row.bins"), td("`$${row.occupancy}%`".replace("$$","") and '                <td className="px-4 py-3">{row.occupancy}%</td>'), td("row.temperature")]),
            "extra_imports": "",
        },
    ])

    for name, title, subtitle, path, data, headers_list, cell_exprs, stats in [
        ("ValuationMethodsPage", "Valuation Methods", "Configure FIFO, weighted average, and standard cost policies.",
         "modules/inventory/pages/reports/ValuationMethodsPage.tsx",
         "[{ id: 'v1', method: 'Weighted Average', scope: 'Company Default', items: 188, status: 'Active' }, { id: 'v2', method: 'FIFO', scope: 'Spare Parts', items: 58, status: 'Active' }, { id: 'v3', method: 'Standard Cost', scope: 'Finished Goods', items: 31, status: 'Draft' }]",
         ["Method", "Scope", "Items", "Status"],
         ["row.method", "row.scope", "row.items", None],
         "{[{ label: 'Methods', value: rows.length }, { label: 'Active Policies', value: rows.filter(r => r.status === 'Active').length }]}"),
        ("ValuationReportPage", "Valuation Report", "On-hand inventory value by warehouse and category.",
         "modules/inventory/pages/reports/ValuationReportPage.tsx",
         "[{ id: 'vr1', warehouse: 'WH-ADDIS-01', category: 'Raw Material', qty: 1240, value: 22940 }, { id: 'vr2', warehouse: 'WH-ADDIS-01', category: 'Finished Goods', qty: 98, value: 6132 }, { id: 'vr3', warehouse: 'WH-MEK-02', category: 'Spare Parts', qty: 24, value: 1800 }]",
         ["Warehouse", "Category", "Qty", "Value"],
         ["row.warehouse", "row.category", "row.qty", "`$${row.value.toLocaleString()}`"],
         "{[{ label: 'Lines', value: rows.length }, { label: 'Total Value', value: `$${rows.reduce((s,r)=>s+r.value,0).toLocaleString()}` }]}"),
        ("ReorderLevelsPage", "Reorder Levels", "Maintain min/max and safety stock thresholds.",
         "modules/inventory/pages/reports/ReorderLevelsPage.tsx",
         "[{ id: 'r1', sku: 'FG-2204', name: 'Ceramic Floor Tile 60x60', onHand: 86, reorder: 120, max: 250, status: 'Below Min' }, { id: 'r2', sku: 'SP-3310', name: 'Hydraulic Pump Seal Kit', onHand: 24, reorder: 40, max: 80, status: 'Below Min' }, { id: 'r3', sku: 'RM-1001', name: 'Portland Cement 50kg', onHand: 1240, reorder: 300, max: 2000, status: 'Healthy' }]",
         ["SKU", "Product", "On Hand", "Reorder", "Max", "Status"],
         ["row.sku", "row.name", "row.onHand", "row.reorder", "row.max", None],
         "{[{ label: 'Tracked SKUs', value: rows.length }, { label: 'Below Min', value: rows.filter(r => r.status === 'Below Min').length }]}"),
        ("ReorderRequestsPage", "Reorder Requests", "Suggested and approved replenishment requests.",
         "modules/inventory/pages/reports/ReorderRequestsPage.tsx",
         "[{ id: 'rr1', requestNo: 'RR-501', sku: 'FG-2204', qty: 100, vendor: 'TileCo', status: 'Pending' }, { id: 'rr2', requestNo: 'RR-502', sku: 'SP-3310', qty: 30, vendor: 'HydroParts', status: 'Approved' }, { id: 'rr3', requestNo: 'RR-503', sku: 'CO-4402', qty: 500, vendor: 'CableWorks', status: 'Draft' }]",
         ["Request", "SKU", "Qty", "Vendor", "Status"],
         ["row.requestNo", "row.sku", "row.qty", "row.vendor", None],
         "{[{ label: 'Requests', value: rows.length }, { label: 'Pending', value: rows.filter(r => r.status === 'Pending').length }]}"),
        ("StockReportsPage", "Stock Reports", "Snapshot of on-hand balances and availability.",
         "modules/inventory/pages/reports/StockReportsPage.tsx",
         "[{ id: 's1', sku: 'RM-1001', warehouse: 'WH-ADDIS-01', available: 1200, reserved: 40, onHand: 1240 }, { id: 's2', sku: 'FG-2204', warehouse: 'WH-ADDIS-01', available: 70, reserved: 16, onHand: 86 }, { id: 's3', sku: 'SP-3310', warehouse: 'WH-MEK-02', available: 20, reserved: 4, onHand: 24 }]",
         ["SKU", "Warehouse", "Available", "Reserved", "On Hand"],
         ["row.sku", "row.warehouse", "row.available", "row.reserved", "row.onHand"],
         "{[{ label: 'SKU Locations', value: rows.length }, { label: 'Reserved Qty', value: rows.reduce((s,r)=>s+r.reserved,0) }]}"),
        ("MovementReportsPage", "Movement Reports", "Audit stock in/out/transfer/adjustment history.",
         "modules/inventory/pages/reports/MovementReportsPage.tsx",
         "[{ id: 'mr1', date: '2026-08-08', type: 'IN', reference: 'GRN-1042', sku: 'RM-1001', qty: 500 }, { id: 'mr2', date: '2026-08-08', type: 'OUT', reference: 'SO-8891', sku: 'FG-2204', qty: 40 }, { id: 'mr3', date: '2026-08-07', type: 'TRANSFER', reference: 'TR-221', sku: 'SP-3310', qty: 10 }]",
         ["Date", "Type", "Reference", "SKU", "Qty"],
         ["row.date", "row.type", "row.reference", "row.sku", "row.qty"],
         "{[{ label: 'Movements', value: rows.length }, { label: 'Qty Moved', value: rows.reduce((s,r)=>s+r.qty,0) }]}"),
        ("DemandForecastPage", "Demand Forecast", "Forecast demand to drive purchase and production planning.",
         "modules/inventory/pages/reports/DemandForecastPage.tsx",
         "[{ id: 'd1', sku: 'FG-2204', period: 'Sep 2026', forecastQty: 140, confidence: 82, method: 'Moving Avg' }, { id: 'd2', sku: 'RM-1001', period: 'Sep 2026', forecastQty: 900, confidence: 76, method: 'Seasonal' }, { id: 'd3', sku: 'CO-4402', period: 'Sep 2026', forecastQty: 2100, confidence: 71, method: 'Linear' }]",
         ["SKU", "Period", "Forecast Qty", "Confidence", "Method"],
         ["row.sku", "row.period", "row.forecastQty", "`$${row.confidence}%`".replace("$$","").replace("`$${row.confidence}%`", "") or "row.confidence + '%'", "row.method"],
         "{[{ label: 'SKU Forecasts', value: rows.length }, { label: 'Avg Confidence', value: `${Math.round(rows.reduce((s,r)=>s+r.confidence,0)/rows.length)}%` }]}"),
    ]:
        cells = []
        for i, expr in enumerate(cell_exprs):
            if expr is None:
                # status column
                cells.append('                <td className="px-4 py-3"><StatusBadge status={row.status} tone={String(row.status).includes("Below") || row.status === "Pending" || row.status === "Draft" ? "warning" : "success"} /></td>')
            elif "confidence" in str(expr) or expr.endswith("+ '%'"):
                cells.append('                <td className="px-4 py-3">{row.confidence}%</td>')
            elif "toLocaleString" in str(expr) or "value" == headers_list[i].lower() if False else False:
                cells.append('                <td className="px-4 py-3">${row.value.toLocaleString()}</td>')
            elif headers_list[i] == "Value":
                cells.append('                <td className="px-4 py-3">${row.value.toLocaleString()}</td>')
            elif i == 0:
                cells.append(f'                <td className="px-4 py-3 font-medium">{{{expr}}}</td>')
            else:
                cells.append(td(expr))
        pages.append({
            "path": path,
            "component_name": name,
            "title": title,
            "subtitle": subtitle,
            "search_placeholder": "Search report rows...",
            "primary_label": "Export",
            "primary_action": 'showToast("Export queued", "success");',
            "stats": stats,
            "data_literal": data,
            "headers": "\n".join(th(x) for x in headers_list),
            "cells": "\n".join(cells),
            "extra_imports": "",
        })

    for p in pages:
        # fix accidental broken cell for warehouse utilization - already handled
        content = LIST_PAGE.format(**p)
        # remove unused navigate warning by referencing navigate in product list only - use void for others
        if "navigate(" not in content:
            content = content.replace(
                "const navigate = useNavigate();\n  const [search, setSearch] = useState(\"\");",
                "useNavigate();\n  const [search, setSearch] = useState(\"\");",
            )
        write(ROOT / p["path"], content)


def gen_project() -> None:
    write(
        ROOT / "modules/project/types/project.types.ts",
        """
export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
export type TaskStatus = 'Backlog' | 'In Progress' | 'Blocked' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Project = {
  id: string;
  code: string;
  name: string;
  manager: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
};

export type ProjectTask = {
  id: string;
  projectCode: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimateHours: number;
};
""",
    )

    write(
        ROOT / "modules/project/services/project.api.ts",
        """
import type { Project, ProjectTask } from '@/modules/project/types/project.types';

export const mockProjects: Project[] = [
  { id: 'pr1', code: 'PRJ-2401', name: 'HQ Fit-Out Phase 2', manager: 'Sara Bekele', client: 'BDA Internal', status: 'Active', progress: 62, budget: 850000, spent: 512000, startDate: '2026-03-01', endDate: '2026-11-30' },
  { id: 'pr2', code: 'PRJ-2407', name: 'ERP Rollout - Finance', manager: 'Daniel Tadesse', client: 'BDA Group', status: 'Active', progress: 44, budget: 420000, spent: 190000, startDate: '2026-05-15', endDate: '2026-12-15' },
  { id: 'pr3', code: 'PRJ-2412', name: 'Warehouse Automation', manager: 'Helen Girma', client: 'Logistics Co', status: 'Planning', progress: 18, budget: 610000, spent: 45000, startDate: '2026-08-01', endDate: '2027-02-28' },
  { id: 'pr4', code: 'PRJ-2355', name: 'Branch Network Upgrade', manager: 'Yonas Alemu', client: 'Retail Ops', status: 'Completed', progress: 100, budget: 275000, spent: 268000, startDate: '2025-09-01', endDate: '2026-04-30' },
];

export const mockTasks: ProjectTask[] = [
  { id: 't1', projectCode: 'PRJ-2401', title: 'Approve interior package', assignee: 'Sara Bekele', status: 'In Progress', priority: 'High', dueDate: '2026-08-15', estimateHours: 16 },
  { id: 't2', projectCode: 'PRJ-2407', title: 'Map chart of accounts', assignee: 'Daniel Tadesse', status: 'Done', priority: 'Critical', dueDate: '2026-08-05', estimateHours: 24 },
  { id: 't3', projectCode: 'PRJ-2407', title: 'UAT script for AP invoices', assignee: 'Marta Hailu', status: 'In Progress', priority: 'High', dueDate: '2026-08-20', estimateHours: 20 },
  { id: 't4', projectCode: 'PRJ-2412', title: 'Vendor shortlist for WMS', assignee: 'Helen Girma', status: 'Backlog', priority: 'Medium', dueDate: '2026-08-28', estimateHours: 12 },
  { id: 't5', projectCode: 'PRJ-2401', title: 'MEP coordination meeting', assignee: 'Abel Kebede', status: 'Blocked', priority: 'High', dueDate: '2026-08-12', estimateHours: 8 },
];

const delay = <T,>(data: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(data)), 200));

export const projectApi = {
  getProjects: () => delay(mockProjects),
  getTasks: () => delay(mockTasks),
};
""",
    )

    project_pages = [
        ("modules/project/pages/projects/ProjectList.tsx", "ProjectList", "Projects", "Portfolio of active and planned projects with budget and progress.",
         "[{ id: 'pr1', code: 'PRJ-2401', name: 'HQ Fit-Out Phase 2', manager: 'Sara Bekele', client: 'BDA Internal', status: 'Active', progress: 62, budget: 850000, spent: 512000, endDate: '2026-11-30' }, { id: 'pr2', code: 'PRJ-2407', name: 'ERP Rollout - Finance', manager: 'Daniel Tadesse', client: 'BDA Group', status: 'Active', progress: 44, budget: 420000, spent: 190000, endDate: '2026-12-15' }, { id: 'pr3', code: 'PRJ-2412', name: 'Warehouse Automation', manager: 'Helen Girma', client: 'Logistics Co', status: 'Planning', progress: 18, budget: 610000, spent: 45000, endDate: '2027-02-28' }, { id: 'pr4', code: 'PRJ-2355', name: 'Branch Network Upgrade', manager: 'Yonas Alemu', client: 'Retail Ops', status: 'Completed', progress: 100, budget: 275000, spent: 268000, endDate: '2026-04-30' }]",
         ["Code", "Project", "Manager", "Progress", "Budget", "Status", ""],
         True),
        ("modules/project/pages/projects/ProjectTemplates.tsx", "ProjectTemplates", "Project Templates", "Reusable WBS and stage templates for faster project setup.",
         "[{ id: 'pt1', name: 'Construction Fit-Out', stages: 8, tasks: 42, owner: 'PMO' }, { id: 'pt2', name: 'ERP Implementation', stages: 6, tasks: 55, owner: 'IT PMO' }, { id: 'pt3', name: 'Branch Launch', stages: 5, tasks: 28, owner: 'Ops' }]",
         ["Template", "Stages", "Tasks", "Owner", ""], False),
        ("modules/project/pages/tasks/TaskList.tsx", "TaskList", "All Tasks", "Cross-project task register with priority and due dates.",
         "[{ id: 't1', projectCode: 'PRJ-2401', title: 'Approve interior package', assignee: 'Sara Bekele', status: 'In Progress', priority: 'High', dueDate: '2026-08-15' }, { id: 't2', projectCode: 'PRJ-2407', title: 'Map chart of accounts', assignee: 'Daniel Tadesse', status: 'Done', priority: 'Critical', dueDate: '2026-08-05' }, { id: 't3', projectCode: 'PRJ-2407', title: 'UAT script for AP invoices', assignee: 'Marta Hailu', status: 'In Progress', priority: 'High', dueDate: '2026-08-20' }, { id: 't4', projectCode: 'PRJ-2412', title: 'Vendor shortlist for WMS', assignee: 'Helen Girma', status: 'Backlog', priority: 'Medium', dueDate: '2026-08-28' }, { id: 't5', projectCode: 'PRJ-2401', title: 'MEP coordination meeting', assignee: 'Abel Kebede', status: 'Blocked', priority: 'High', dueDate: '2026-08-12' }]",
         ["Project", "Task", "Assignee", "Priority", "Due", "Status"], False),
        ("modules/project/pages/tasks/MyTasksPage.tsx", "MyTasksPage", "My Tasks", "Tasks assigned to the current user.",
         "[{ id: 't1', projectCode: 'PRJ-2401', title: 'Approve interior package', status: 'In Progress', priority: 'High', dueDate: '2026-08-15' }, { id: 't5', projectCode: 'PRJ-2401', title: 'MEP coordination meeting', status: 'Blocked', priority: 'High', dueDate: '2026-08-12' }, { id: 't6', projectCode: 'PRJ-2407', title: 'Review migration checklist', status: 'Backlog', priority: 'Medium', dueDate: '2026-08-22' }]",
         ["Project", "Task", "Priority", "Due", "Status"], False),
        ("modules/project/pages/team/TeamMembersPage.tsx", "TeamMembersPage", "Team Members", "Project staffing and allocation overview.",
         "[{ id: 'tm1', name: 'Sara Bekele', role: 'Project Manager', projects: 2, allocation: 90 }, { id: 'tm2', name: 'Daniel Tadesse', role: 'Functional Lead', projects: 1, allocation: 80 }, { id: 'tm3', name: 'Marta Hailu', role: 'Business Analyst', projects: 2, allocation: 70 }, { id: 'tm4', name: 'Abel Kebede', role: 'Site Engineer', projects: 1, allocation: 100 }]",
         ["Name", "Role", "Projects", "Allocation %"], False),
        ("modules/project/pages/team/RolesPage.tsx", "RolesPage", "Project Roles", "Define RACI roles used across project teams.",
         "[{ id: 'rl1', role: 'Project Manager', members: 4, permissions: 'Full' }, { id: 'rl2', role: 'Functional Lead', members: 6, permissions: 'Edit' }, { id: 'rl3', role: 'Contributor', members: 22, permissions: 'Task Update' }, { id: 'rl4', role: 'Viewer', members: 18, permissions: 'Read' }]",
         ["Role", "Members", "Permissions"], False),
        ("modules/project/pages/team/WorkloadPage.tsx", "WorkloadPage", "Workload", "Capacity vs assigned hours for the next planning window.",
         "[{ id: 'w1', name: 'Sara Bekele', capacity: 40, assigned: 36, available: 4 }, { id: 'w2', name: 'Daniel Tadesse', capacity: 40, assigned: 32, available: 8 }, { id: 'w3', name: 'Marta Hailu', capacity: 40, assigned: 28, available: 12 }, { id: 'w4', name: 'Abel Kebede', capacity: 40, assigned: 40, available: 0 }]",
         ["Member", "Capacity", "Assigned", "Available"], False),
        ("modules/project/pages/milestones/MilestonesPage.tsx", "MilestonesPage", "Milestones", "Track stage gates and contractual milestones.",
         "[{ id: 'ms1', projectCode: 'PRJ-2401', name: 'Design Freeze', dueDate: '2026-08-30', status: 'On Track' }, { id: 'ms2', projectCode: 'PRJ-2407', name: 'UAT Sign-off', dueDate: '2026-09-15', status: 'At Risk' }, { id: 'ms3', projectCode: 'PRJ-2412', name: 'Vendor Award', dueDate: '2026-09-01', status: 'On Track' }]",
         ["Project", "Milestone", "Due", "Status"], False),
        ("modules/project/pages/budget/BudgetPage.tsx", "BudgetPage", "Project Budget", "Budget vs actual by project and cost category.",
         "[{ id: 'b1', projectCode: 'PRJ-2401', category: 'Materials', budget: 420000, actual: 280000 }, { id: 'b2', projectCode: 'PRJ-2401', category: 'Labor', budget: 250000, actual: 170000 }, { id: 'b3', projectCode: 'PRJ-2407', category: 'Licenses', budget: 120000, actual: 90000 }, { id: 'b4', projectCode: 'PRJ-2407', category: 'Consulting', budget: 180000, actual: 75000 }]",
         ["Project", "Category", "Budget", "Actual", "Variance"], False),
        ("modules/project/pages/risks/RiskRegisterPage.tsx", "RiskRegisterPage", "Risk Register", "Identify, score, and mitigate project risks.",
         "[{ id: 'rk1', projectCode: 'PRJ-2407', title: 'Data migration defects', probability: 'High', impact: 'High', owner: 'Daniel Tadesse', status: 'Open' }, { id: 'rk2', projectCode: 'PRJ-2401', title: 'MEP lead time slip', probability: 'Medium', impact: 'High', owner: 'Sara Bekele', status: 'Mitigating' }, { id: 'rk3', projectCode: 'PRJ-2412', title: 'Vendor lock-in', probability: 'Medium', impact: 'Medium', owner: 'Helen Girma', status: 'Open' }]",
         ["Project", "Risk", "Probability", "Impact", "Owner", "Status"], False),
        ("modules/project/pages/reports/ProgressReportsPage.tsx", "ProgressReportsPage", "Progress Reports", "Status summaries for steering committees.",
         "[{ id: 'rp1', projectCode: 'PRJ-2401', period: 'Week 32', progress: 62, rag: 'Green', summary: 'Fit-out on plan' }, { id: 'rp2', projectCode: 'PRJ-2407', period: 'Week 32', progress: 44, rag: 'Amber', summary: 'UAT scripts delayed' }, { id: 'rp3', projectCode: 'PRJ-2412', period: 'Week 32', progress: 18, rag: 'Green', summary: 'Scoping complete' }]",
         ["Project", "Period", "Progress", "RAG", "Summary"], False),
        ("modules/project/pages/reports/TimeReportsPage.tsx", "TimeReportsPage", "Time Reports", "Logged hours by project and team member.",
         "[{ id: 'tr1', projectCode: 'PRJ-2401', member: 'Abel Kebede', hours: 38, billable: 32 }, { id: 'tr2', projectCode: 'PRJ-2407', member: 'Marta Hailu', hours: 30, billable: 28 }, { id: 'tr3', projectCode: 'PRJ-2407', member: 'Daniel Tadesse', hours: 34, billable: 30 }]",
         ["Project", "Member", "Hours", "Billable"], False),
        ("modules/project/pages/reports/FinancialReportsPage.tsx", "FinancialReportsPage", "Financial Reports", "Project P&L style burn and forecast views.",
         "[{ id: 'fr1', projectCode: 'PRJ-2401', budget: 850000, spent: 512000, forecast: 830000, cpi: 0.98 }, { id: 'fr2', projectCode: 'PRJ-2407', budget: 420000, spent: 190000, forecast: 455000, cpi: 0.91 }, { id: 'fr3', projectCode: 'PRJ-2412', budget: 610000, spent: 45000, forecast: 610000, cpi: 1.02 }]",
         ["Project", "Budget", "Spent", "Forecast", "CPI"], False),
    ]

    for path, comp, title, subtitle, data, headers, is_project_list in project_pages:
        header_html = "\n".join(th(h) for h in headers)
        # build cells based on headers heuristically using row fields
        cell_lines = []
        for h in headers:
            key = h.lower().replace(" %", "").replace(" ", "")
            mapping = {
                "code": "row.code",
                "project": "row.name || row.projectCode",
                "manager": "row.manager",
                "progress": "row.progress + '%'",
                "budget": "('$'+Number(row.budget).toLocaleString())",
                "status": None,
                "": None,
                "template": "row.name",
                "stages": "row.stages",
                "tasks": "row.tasks",
                "owner": "row.owner",
                "task": "row.title",
                "assignee": "row.assignee",
                "priority": "row.priority",
                "due": "row.dueDate",
                "name": "row.name",
                "role": "row.role",
                "projects": "row.projects",
                "allocation": "row.allocation + '%'",
                "members": "row.members",
                "permissions": "row.permissions",
                "member": "row.member || row.name",
                "capacity": "row.capacity",
                "assigned": "row.assigned",
                "available": "row.available",
                "milestone": "row.name",
                "category": "row.category",
                "actual": "('$'+Number(row.actual).toLocaleString())",
                "variance": "('$'+Number(row.budget - row.actual).toLocaleString())",
                "risk": "row.title",
                "probability": "row.probability",
                "impact": "row.impact",
                "period": "row.period",
                "rag": "row.rag",
                "summary": "row.summary",
                "hours": "row.hours",
                "billable": "row.billable",
                "spent": "('$'+Number(row.spent).toLocaleString())",
                "forecast": "('$'+Number(row.forecast).toLocaleString())",
                "cpi": "row.cpi",
            }
            # normalize header key
            hk = h.lower().replace(" %", "").replace("%", "").strip()
            hk2 = hk.replace(" ", "")
            expr = mapping.get(hk) or mapping.get(hk2)
            if h == "Status" or h == "RAG":
                cell_lines.append('                <td className="px-4 py-3"><StatusBadge status={String(row.status || row.rag)} tone={["Done","Completed","Green","Healthy","On Track","Active"].includes(String(row.status || row.rag)) ? "success" : ["Blocked","At Risk","Amber","Cancelled","Critical"].includes(String(row.status || row.rag)) || String(row.priority)==="Critical" ? "danger" : "warning"} /></td>')
            elif h == "":
                cell_lines.append('                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => navigate(`/project-management/projects`)}>Open</Button></td>')
            elif expr is None and h == "Priority":
                cell_lines.append('                <td className="px-4 py-3"><StatusBadge status={row.priority} tone={row.priority === "Critical" || row.priority === "High" ? "danger" : "info"} /></td>')
            elif h == "Project" and "projectCode" in data:
                cell_lines.append('                <td className="px-4 py-3 font-medium">{row.projectCode || row.code}</td>' if "title" in data else '                <td className="px-4 py-3 font-medium">{row.name}</td>')
                if "title" in data and h == "Project":
                    # for task lists first col is project code
                    cell_lines[-1] = '                <td className="px-4 py-3 font-medium">{row.projectCode}</td>'
            elif h == "Task" or h == "Risk" or h == "Milestone" or h == "Template" or (h == "Project" and "manager" in data):
                field = "title" if ("title" in data and h in ("Task", "Risk")) else "name"
                cell_lines.append(f'                <td className="px-4 py-3 font-medium">{{row.{field}}}</td>')
            elif h == "Budget" and "budget" in data:
                cell_lines.append('                <td className="px-4 py-3">${Number(row.budget).toLocaleString()}</td>')
            elif h == "Actual":
                cell_lines.append('                <td className="px-4 py-3">${Number(row.actual).toLocaleString()}</td>')
            elif h == "Variance":
                cell_lines.append('                <td className="px-4 py-3">${Number(row.budget - row.actual).toLocaleString()}</td>')
            elif h == "Spent":
                cell_lines.append('                <td className="px-4 py-3">${Number(row.spent).toLocaleString()}</td>')
            elif h == "Forecast":
                cell_lines.append('                <td className="px-4 py-3">${Number(row.forecast).toLocaleString()}</td>')
            elif h == "Progress":
                cell_lines.append('                <td className="px-4 py-3">{row.progress}%</td>')
            elif h == "Allocation %":
                cell_lines.append('                <td className="px-4 py-3">{row.allocation}%</td>')
            elif h == "Due":
                cell_lines.append('                <td className="px-4 py-3">{row.dueDate}</td>')
            else:
                # fallback map common
                field_map = {
                    "Manager": "manager", "Assignee": "assignee", "Owner": "owner", "Role": "role",
                    "Stages": "stages", "Tasks": "tasks", "Projects": "projects", "Members": "members",
                    "Permissions": "permissions", "Member": "member", "Capacity": "capacity",
                    "Assigned": "assigned", "Available": "available", "Category": "category",
                    "Probability": "probability", "Impact": "impact", "Period": "period",
                    "Summary": "summary", "Hours": "hours", "Billable": "billable", "CPI": "cpi",
                    "Code": "code", "Name": "name",
                }
                f = field_map.get(h, "name")
                if h in ("Member",) and "name" in data and "member" not in data:
                    f = "name"
                cell_lines.append(f'                <td className="px-4 py-3">{{row.{f}}}</td>')

        primary = "Create Project" if is_project_list else "Add"
        primary_action = 'navigate("/project-management/projects/create");' if is_project_list else 'showToast("Created", "success");'
        stats = "{[{ label: 'Records', value: rows.length }]}"
        content = LIST_PAGE.format(
            component_name=comp,
            title=title,
            subtitle=subtitle,
            search_placeholder="Search...",
            primary_label=primary,
            primary_action=primary_action,
            stats=stats,
            data_literal=data,
            headers=header_html,
            cells="\n".join(cell_lines),
            extra_imports="",
        )
        write(ROOT / path, content)

    # Create project form
    write(
        ROOT / "modules/project/pages/projects/CreateProject.tsx",
        FORM_PAGE.format(
            component_name="CreateProject",
            title="Create Project",
            subtitle="Capture charter details, dates, budget, and ownership.",
            default_form='{ code: "", name: "", manager: "", client: "", budget: "", startDate: "", endDate: "" }',
            success_toast="Project created",
            success_nav="/project-management/projects",
            fields="\n".join([
                field("code", "Project Code", "PRJ-25XX"),
                field("name", "Project Name"),
                field("manager", "Project Manager"),
                field("client", "Client / Sponsor"),
                field("budget", "Budget"),
                field("startDate", "Start Date", "YYYY-MM-DD"),
                field("endDate", "End Date", "YYYY-MM-DD"),
            ]),
        ),
    )

    # Board / calendar / timeline as structured boards
    write(
        ROOT / "modules/project/pages/tasks/TaskBoardPage.tsx",
        """
import { useMemo, useState } from 'react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Card, CardContent } from '@/shared/components/ui/card';
import { showToast } from '@/shared/layout/layout';

const COLUMNS = ['Backlog', 'In Progress', 'Blocked', 'Done'] as const;
const SEED = [
  { id: 't1', title: 'Approve interior package', projectCode: 'PRJ-2401', status: 'In Progress', priority: 'High' },
  { id: 't2', title: 'Map chart of accounts', projectCode: 'PRJ-2407', status: 'Done', priority: 'Critical' },
  { id: 't3', title: 'UAT script for AP invoices', projectCode: 'PRJ-2407', status: 'In Progress', priority: 'High' },
  { id: 't4', title: 'Vendor shortlist for WMS', projectCode: 'PRJ-2412', status: 'Backlog', priority: 'Medium' },
  { id: 't5', title: 'MEP coordination meeting', projectCode: 'PRJ-2401', status: 'Blocked', priority: 'High' },
];

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState(SEED);
  const grouped = useMemo(() => {
    return COLUMNS.map((status) => ({ status, items: tasks.filter((t) => t.status === status) }));
  }, [tasks]);

  return (
    <ModulePageShell
      title="Task Board"
      subtitle="Kanban board for execution tracking across projects."
      stats={[{ label: 'Cards', value: tasks.length }, { label: 'Blocked', value: tasks.filter((t) => t.status === 'Blocked').length }]}
      onRefresh={() => showToast('Board refreshed', 'success')}
      primaryActionLabel="Add Card"
      onPrimaryAction={() => {
        setTasks((prev) => [
          ...prev,
          { id: `t${prev.length + 1}`, title: 'New task', projectCode: 'PRJ-2407', status: 'Backlog', priority: 'Medium' },
        ]);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {grouped.map((col) => (
          <div key={col.status} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">{col.status}</h3>
              <span className="text-xs text-slate-500">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((task) => (
                <Card key={task.id} className="shadow-none">
                  <CardContent className="space-y-2 p-3">
                    <div className="text-sm font-medium text-slate-900">{task.title}</div>
                    <div className="text-xs text-slate-500">{task.projectCode}</div>
                    <StatusBadge status={task.priority} tone={task.priority === 'Critical' || task.priority === 'High' ? 'danger' : 'info'} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ModulePageShell>
  );
}
""",
    )

    write(
        ROOT / "modules/project/pages/tasks/TaskCalendarPage.tsx",
        """
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { showToast } from '@/shared/layout/layout';

const EVENTS = [
  { id: 'e1', date: '2026-08-12', title: 'MEP coordination', projectCode: 'PRJ-2401', status: 'Blocked' },
  { id: 'e2', date: '2026-08-15', title: 'Interior package approval', projectCode: 'PRJ-2401', status: 'In Progress' },
  { id: 'e3', date: '2026-08-20', title: 'AP UAT scripts due', projectCode: 'PRJ-2407', status: 'In Progress' },
  { id: 'e4', date: '2026-08-28', title: 'WMS vendor shortlist', projectCode: 'PRJ-2412', status: 'Backlog' },
];

export default function TaskCalendarPage() {
  return (
    <ModulePageShell
      title="Task Calendar"
      subtitle="Due-date calendar for project commitments."
      stats={[{ label: 'Scheduled', value: EVENTS.length }]}
      onRefresh={() => showToast('Calendar refreshed', 'success')}
    >
      <div className="space-y-3">
        {EVENTS.map((event) => (
          <div key={event.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">{event.date}</div>
              <div className="font-medium text-slate-900">{event.title}</div>
              <div className="text-sm text-slate-500">{event.projectCode}</div>
            </div>
            <StatusBadge status={event.status} tone={event.status === 'Blocked' ? 'danger' : 'info'} />
          </div>
        ))}
      </div>
    </ModulePageShell>
  );
}
""",
    )

    write(
        ROOT / "modules/project/pages/timeline/TimelinePage.tsx",
        """
import { ModulePageShell } from '@/shared/components/ModulePageShell';
import { showToast } from '@/shared/layout/layout';

const PHASES = [
  { id: 'ph1', project: 'PRJ-2401', name: 'Design', start: 'Mar', end: 'Jun', progress: 100 },
  { id: 'ph2', project: 'PRJ-2401', name: 'Build', start: 'Jun', end: 'Oct', progress: 55 },
  { id: 'ph3', project: 'PRJ-2407', name: 'Configure', start: 'May', end: 'Aug', progress: 70 },
  { id: 'ph4', project: 'PRJ-2407', name: 'UAT', start: 'Aug', end: 'Oct', progress: 20 },
  { id: 'ph5', project: 'PRJ-2412', name: 'Select Vendor', start: 'Aug', end: 'Sep', progress: 35 },
];

export default function TimelinePage() {
  return (
    <ModulePageShell
      title="Project Timeline"
      subtitle="High-level phase timeline across the portfolio."
      stats={[{ label: 'Phases', value: PHASES.length }]}
      onRefresh={() => showToast('Timeline refreshed', 'success')}
    >
      <div className="space-y-4">
        {PHASES.map((phase) => (
          <div key={phase.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium text-slate-800">{phase.project} · {phase.name}</div>
              <div className="text-slate-500">{phase.start} → {phase.end}</div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${phase.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ModulePageShell>
  );
}
""",
    )


def main() -> None:
    gen_inventory()
    gen_project()
    print("generation complete")


if __name__ == "__main__":
    main()
