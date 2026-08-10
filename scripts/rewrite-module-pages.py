#!/usr/bin/env python3
"""Rewrite inventory + remaining project pages with valid TSX."""

from pathlib import Path

ROOT = Path("/workspace/src")


def w(rel: str, content: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print("wrote", rel)


def list_page(
    component: str,
    title: str,
    subtitle: str,
    columns: list[tuple[str, str]],
    rows_ts: str,
    primary: str = "Add",
    primary_action: str = 'showToast("Saved", "success");',
    status_field: str | None = "status",
) -> str:
    ths = "\n".join(f'              <th className="px-4 py-3 font-medium">{h}</th>' for h, _ in columns)
    tds = []
    for i, (h, expr) in enumerate(columns):
        if h.lower() == "status" or expr == "__status__":
            tds.append(
                '                <td className="px-4 py-3"><StatusBadge status={String(row.status)} tone={["Active","Posted","Approved","Healthy","Done","Completed","On Track","Green"].includes(String(row.status)) ? "success" : ["Draft","Pending","Below Min","Blocked","At Risk","Amber"].includes(String(row.status)) ? "warning" : "neutral"} /></td>'
            )
        elif i == 0:
            tds.append(f'                <td className="px-4 py-3 font-medium text-slate-900">{{row.{expr}}}</td>')
        else:
            tds.append(f'                <td className="px-4 py-3 text-slate-700">{{row.{expr}}}</td>')
    body = "\n".join(tds)

    return f'''import {{ useMemo, useState }} from "react";
import {{ ModulePageShell, StatusBadge }} from "@/shared/components/ModulePageShell";
import {{ Button }} from "@/shared/components/ui/button";
import {{ showToast }} from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = {rows_ts};

export default function {component}() {{
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>(DATA);

  const filtered = useMemo(() => {{
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }}, [rows, search]);

  const stats = [
    {{ label: "Records", value: rows.length }},
    {{ label: "Showing", value: filtered.length }},
  ];

  return (
    <ModulePageShell
      title="{title}"
      subtitle="{subtitle}"
      stats={{stats}}
      searchValue={{search}}
      onSearchChange={{setSearch}}
      searchPlaceholder="Search..."
      onRefresh={{() => showToast("Refreshed {title}", "success")}}
      primaryActionLabel="{primary}"
      onPrimaryAction={{() => {{
        {primary_action}
        setRows((prev) => prev);
      }}}}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
{ths}
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {{filtered.map((row) => (
              <tr key={{String(row.id)}} className="border-t border-slate-100 hover:bg-slate-50/80">
{body}
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={{() => showToast("Opened record", "success")}}>
                    View
                  </Button>
                </td>
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


def main() -> None:
    inv = [
        ("modules/inventory/pages/products/ProductList.tsx", "ProductList", "Products", "Maintain SKUs, stock on hand, reorder levels, and costing.",
         [("SKU", "sku"), ("Product", "name"), ("Category", "category"), ("On Hand", "qtyOnHand"), ("UOM", "uom"), ("Reorder", "reorderLevel"), ("Warehouse", "warehouse"), ("Status", "__status__")],
         """[
  { id: "p1", sku: "RM-1001", name: "Portland Cement 50kg", category: "Raw Material", uom: "BAG", qtyOnHand: 1240, reorderLevel: 300, warehouse: "WH-ADDIS-01", status: "Active" },
  { id: "p2", sku: "FG-2204", name: "Ceramic Floor Tile 60x60", category: "Finished Goods", uom: "BOX", qtyOnHand: 86, reorderLevel: 120, warehouse: "WH-ADDIS-01", status: "Active" },
  { id: "p3", sku: "SP-3310", name: "Hydraulic Pump Seal Kit", category: "Spare Parts", uom: "SET", qtyOnHand: 24, reorderLevel: 40, warehouse: "WH-MEK-02", status: "Active" },
  { id: "p4", sku: "CO-4402", name: "Copper Cable 2.5mm", category: "Consumables", uom: "M", qtyOnHand: 3500, reorderLevel: 1000, warehouse: "WH-ADDIS-01", status: "Active" },
  { id: "p5", sku: "FG-1188", name: "Office Desk Modular", category: "Finished Goods", uom: "PCS", qtyOnHand: 12, reorderLevel: 8, warehouse: "WH-AA-OUT", status: "Inactive" }
]""", "Add Product"),
        ("modules/inventory/pages/categories/CategoriesPage.tsx", "CategoriesPage", "Product Categories", "Organize inventory master data for reporting and replenishment.",
         [("Category", "name"), ("Products", "products"), ("Status", "__status__")],
         '[{ id: "c1", name: "Raw Material", products: 42, status: "Active" }, { id: "c2", name: "Finished Goods", products: 31, status: "Active" }, { id: "c3", name: "Spare Parts", products: 58, status: "Active" }, { id: "c4", name: "Consumables", products: 77, status: "Active" }]', "Add Category"),
        ("modules/inventory/pages/units/UnitsPage.tsx", "UnitsPage", "Units of Measure", "Define stock keeping units used across warehouses.",
         [("Code", "code"), ("Name", "name"), ("Decimals", "decimals")],
         '[{ id: "u1", code: "PCS", name: "Pieces", decimals: 0 }, { id: "u2", code: "BAG", name: "Bag", decimals: 0 }, { id: "u3", code: "BOX", name: "Box", decimals: 0 }, { id: "u4", code: "M", name: "Meter", decimals: 2 }, { id: "u5", code: "SET", name: "Set", decimals: 0 }]', "Add Unit"),
        ("modules/inventory/pages/barcodes/BarcodePage.tsx", "BarcodePage", "Barcode Management", "Map barcodes and labels to inventory SKUs.",
         [("Barcode", "barcode"), ("SKU", "sku"), ("Format", "format"), ("Status", "__status__")],
         '[{ id: "b1", barcode: "6281001001001", sku: "RM-1001", format: "EAN-13", status: "Active" }, { id: "b2", barcode: "6281001002204", sku: "FG-2204", format: "EAN-13", status: "Active" }, { id: "b3", barcode: "QR-SP-3310", sku: "SP-3310", format: "QR", status: "Active" }, { id: "b4", barcode: "TEMP-0008", sku: "—", format: "CODE128", status: "Draft" }]', "Generate Labels"),
    ]

    for name, title in [
        ("StockInPage", "Stock In"),
        ("StockOutPage", "Stock Out"),
        ("StockTransferPage", "Stock Transfer"),
        ("StockAdjustmentPage", "Stock Adjustment"),
        ("StockCountPage", "Stock Count"),
    ]:
        folder = name.replace("Page", "")
        # StockIn -> stock/StockInPage
        inv.append((
            f"modules/inventory/pages/stock/{name}.tsx",
            name,
            title,
            f"Post and track {title.lower()} movements across warehouses.",
            [("Reference", "reference"), ("SKU", "sku"), ("Product", "productName"), ("Qty", "qty"), ("Warehouse", "warehouse"), ("Date", "date"), ("Status", "__status__")],
            f"""[
  {{ id: "m1", reference: "{title[:3].upper()}-1042", sku: "RM-1001", productName: "Portland Cement 50kg", qty: 120, warehouse: "WH-ADDIS-01", date: "2026-08-08", status: "Posted" }},
  {{ id: "m2", reference: "{title[:3].upper()}-1043", sku: "FG-2204", productName: "Ceramic Floor Tile 60x60", qty: 35, warehouse: "WH-ADDIS-01", date: "2026-08-07", status: "Posted" }},
  {{ id: "m3", reference: "{title[:3].upper()}-1044", sku: "SP-3310", productName: "Hydraulic Pump Seal Kit", qty: 8, warehouse: "WH-MEK-02", date: "2026-08-06", status: "Draft" }}
]""",
            f"New {title}",
        ))

    inv.extend([
        ("modules/inventory/pages/warehouse/WarehousePage.tsx", "WarehousePage", "Warehouses", "Manage warehouse sites, capacity, and operational status.",
         [("Code", "code"), ("Name", "name"), ("Location", "location"), ("Zones", "zones"), ("Utilization %", "utilization"), ("Status", "__status__")],
         '[{ id: "w1", code: "WH-ADDIS-01", name: "Addis Central Warehouse", location: "Addis Ababa", zones: 6, utilization: 72, status: "Active" }, { id: "w2", code: "WH-MEK-02", name: "Mekelle Spare Depot", location: "Mekelle", zones: 3, utilization: 58, status: "Active" }, { id: "w3", code: "WH-AA-OUT", name: "Outbound Staging", location: "Addis Ababa", zones: 2, utilization: 41, status: "Active" }]', "Add Warehouse"),
        ("modules/inventory/pages/warehouse/WarehouseZonesPage.tsx", "WarehouseZonesPage", "Warehouse Zones", "Configure putaway zones, picking areas, and staging locations.",
         [("Warehouse", "warehouse"), ("Zone", "code"), ("Name", "name"), ("Type", "type"), ("Bins", "bins")],
         '[{ id: "z1", warehouse: "WH-ADDIS-01", code: "A-RECV", name: "Receiving Dock", type: "Receiving", bins: 12 }, { id: "z2", warehouse: "WH-ADDIS-01", code: "B-PICK", name: "Fast Pick", type: "Picking", bins: 48 }, { id: "z3", warehouse: "WH-ADDIS-01", code: "C-BULK", name: "Bulk Storage", type: "Bulk", bins: 30 }, { id: "z4", warehouse: "WH-MEK-02", code: "M-SPARE", name: "Spare Parts Cage", type: "Secure", bins: 16 }]', "Add Zone"),
        ("modules/inventory/pages/warehouse/WarehouseLayoutPage.tsx", "WarehouseLayoutPage", "Warehouse Layout", "Aisle and bin structure for directed putaway and picking.",
         [("Aisle", "aisle"), ("Bins", "bins"), ("Occupancy %", "occupancy"), ("Climate", "temperature")],
         '[{ id: "a1", aisle: "A1", bins: 20, occupancy: 80, temperature: "Ambient" }, { id: "a2", aisle: "A2", bins: 20, occupancy: 65, temperature: "Ambient" }, { id: "a3", aisle: "B1", bins: 16, occupancy: 42, temperature: "Ambient" }, { id: "a4", aisle: "C-COLD", bins: 10, occupancy: 55, temperature: "Cold" }]', "Import Layout"),
        ("modules/inventory/pages/reports/ValuationMethodsPage.tsx", "ValuationMethodsPage", "Valuation Methods", "Configure FIFO, weighted average, and standard cost policies.",
         [("Method", "method"), ("Scope", "scope"), ("Items", "items"), ("Status", "__status__")],
         '[{ id: "v1", method: "Weighted Average", scope: "Company Default", items: 188, status: "Active" }, { id: "v2", method: "FIFO", scope: "Spare Parts", items: 58, status: "Active" }, { id: "v3", method: "Standard Cost", scope: "Finished Goods", items: 31, status: "Draft" }]', "Add Method"),
        ("modules/inventory/pages/reports/ValuationReportPage.tsx", "ValuationReportPage", "Valuation Report", "On-hand inventory value by warehouse and category.",
         [("Warehouse", "warehouse"), ("Category", "category"), ("Qty", "qty"), ("Value", "value")],
         '[{ id: "vr1", warehouse: "WH-ADDIS-01", category: "Raw Material", qty: 1240, value: 22940 }, { id: "vr2", warehouse: "WH-ADDIS-01", category: "Finished Goods", qty: 98, value: 6132 }, { id: "vr3", warehouse: "WH-MEK-02", category: "Spare Parts", qty: 24, value: 1800 }]', "Export"),
        ("modules/inventory/pages/reports/ReorderLevelsPage.tsx", "ReorderLevelsPage", "Reorder Levels", "Maintain min/max and safety stock thresholds.",
         [("SKU", "sku"), ("Product", "name"), ("On Hand", "onHand"), ("Reorder", "reorder"), ("Max", "max"), ("Status", "__status__")],
         '[{ id: "r1", sku: "FG-2204", name: "Ceramic Floor Tile 60x60", onHand: 86, reorder: 120, max: 250, status: "Below Min" }, { id: "r2", sku: "SP-3310", name: "Hydraulic Pump Seal Kit", onHand: 24, reorder: 40, max: 80, status: "Below Min" }, { id: "r3", sku: "RM-1001", name: "Portland Cement 50kg", onHand: 1240, reorder: 300, max: 2000, status: "Healthy" }]', "Update Levels"),
        ("modules/inventory/pages/reports/ReorderRequestsPage.tsx", "ReorderRequestsPage", "Reorder Requests", "Suggested and approved replenishment requests.",
         [("Request", "requestNo"), ("SKU", "sku"), ("Qty", "qty"), ("Vendor", "vendor"), ("Status", "__status__")],
         '[{ id: "rr1", requestNo: "RR-501", sku: "FG-2204", qty: 100, vendor: "TileCo", status: "Pending" }, { id: "rr2", requestNo: "RR-502", sku: "SP-3310", qty: 30, vendor: "HydroParts", status: "Approved" }, { id: "rr3", requestNo: "RR-503", sku: "CO-4402", qty: 500, vendor: "CableWorks", status: "Draft" }]', "Create Request"),
        ("modules/inventory/pages/reports/StockReportsPage.tsx", "StockReportsPage", "Stock Reports", "Snapshot of on-hand balances and availability.",
         [("SKU", "sku"), ("Warehouse", "warehouse"), ("Available", "available"), ("Reserved", "reserved"), ("On Hand", "onHand")],
         '[{ id: "s1", sku: "RM-1001", warehouse: "WH-ADDIS-01", available: 1200, reserved: 40, onHand: 1240 }, { id: "s2", sku: "FG-2204", warehouse: "WH-ADDIS-01", available: 70, reserved: 16, onHand: 86 }, { id: "s3", sku: "SP-3310", warehouse: "WH-MEK-02", available: 20, reserved: 4, onHand: 24 }]', "Export"),
        ("modules/inventory/pages/reports/MovementReportsPage.tsx", "MovementReportsPage", "Movement Reports", "Audit stock in/out/transfer/adjustment history.",
         [("Date", "date"), ("Type", "type"), ("Reference", "reference"), ("SKU", "sku"), ("Qty", "qty")],
         '[{ id: "mr1", date: "2026-08-08", type: "IN", reference: "GRN-1042", sku: "RM-1001", qty: 500 }, { id: "mr2", date: "2026-08-08", type: "OUT", reference: "SO-8891", sku: "FG-2204", qty: 40 }, { id: "mr3", date: "2026-08-07", type: "TRANSFER", reference: "TR-221", sku: "SP-3310", qty: 10 }]', "Export"),
        ("modules/inventory/pages/reports/DemandForecastPage.tsx", "DemandForecastPage", "Demand Forecast", "Forecast demand to drive purchase and production planning.",
         [("SKU", "sku"), ("Period", "period"), ("Forecast Qty", "forecastQty"), ("Confidence %", "confidence"), ("Method", "method")],
         '[{ id: "d1", sku: "FG-2204", period: "Sep 2026", forecastQty: 140, confidence: 82, method: "Moving Avg" }, { id: "d2", sku: "RM-1001", period: "Sep 2026", forecastQty: 900, confidence: 76, method: "Seasonal" }, { id: "d3", sku: "CO-4402", period: "Sep 2026", forecastQty: 2100, confidence: 71, method: "Linear" }]', "Run Forecast"),
    ])

    for path, comp, title, subtitle, cols, rows, primary in inv:
        w(path, list_page(comp, title, subtitle, cols, rows, primary))

    # Remaining project pages
    w(
        "modules/project/pages/projects/CreateProject.tsx",
        '''
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { showToast } from "@/shared/layout/layout";

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "",
    name: "",
    manager: "",
    client: "",
    budget: "",
    startDate: "",
    endDate: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <ModulePageShell
      title="Create Project"
      subtitle="Capture charter details, dates, budget, and ownership."
      onRefresh={() => navigate(-1)}
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          showToast("Project created", "success");
          navigate("/project-management/projects");
        }}
      >
        {(
          [
            ["code", "Project Code", "PRJ-25XX"],
            ["name", "Project Name", ""],
            ["manager", "Project Manager", ""],
            ["client", "Client / Sponsor", ""],
            ["budget", "Budget", ""],
            ["startDate", "Start Date", "YYYY-MM-DD"],
            ["endDate", "End Date", "YYYY-MM-DD"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              value={form[key]}
              placeholder={placeholder || label}
              onChange={(e) => update(key, e.target.value)}
              required
            />
          </div>
        ))}
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </ModulePageShell>
  );
}
''',
    )

    w(
        "modules/project/pages/tasks/TaskBoardPage.tsx",
        '''
import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Card, CardContent } from "@/shared/components/ui/card";
import { showToast } from "@/shared/layout/layout";

const COLUMNS = ["Backlog", "In Progress", "Blocked", "Done"] as const;

type CardItem = {
  id: string;
  title: string;
  projectCode: string;
  status: (typeof COLUMNS)[number];
  priority: string;
};

const SEED: CardItem[] = [
  { id: "t1", title: "Approve interior package", projectCode: "PRJ-2401", status: "In Progress", priority: "High" },
  { id: "t2", title: "Map chart of accounts", projectCode: "PRJ-2407", status: "Done", priority: "Critical" },
  { id: "t3", title: "UAT script for AP invoices", projectCode: "PRJ-2407", status: "In Progress", priority: "High" },
  { id: "t4", title: "Vendor shortlist for WMS", projectCode: "PRJ-2412", status: "Backlog", priority: "Medium" },
  { id: "t5", title: "MEP coordination meeting", projectCode: "PRJ-2401", status: "Blocked", priority: "High" },
];

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState(SEED);
  const grouped = useMemo(
    () => COLUMNS.map((status) => ({ status, items: tasks.filter((t) => t.status === status) })),
    [tasks],
  );

  return (
    <ModulePageShell
      title="Task Board"
      subtitle="Kanban board for execution tracking across projects."
      stats={[
        { label: "Cards", value: tasks.length },
        { label: "Blocked", value: tasks.filter((t) => t.status === "Blocked").length },
      ]}
      onRefresh={() => showToast("Board refreshed", "success")}
      primaryActionLabel="Add Card"
      onPrimaryAction={() =>
        setTasks((prev) => [
          ...prev,
          {
            id: `t${prev.length + 1}`,
            title: "New task",
            projectCode: "PRJ-2407",
            status: "Backlog",
            priority: "Medium",
          },
        ])
      }
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
                    <StatusBadge
                      status={task.priority}
                      tone={task.priority === "Critical" || task.priority === "High" ? "danger" : "info"}
                    />
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
''',
    )

    w(
        "modules/project/pages/tasks/TaskCalendarPage.tsx",
        '''
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { showToast } from "@/shared/layout/layout";

const EVENTS = [
  { id: "e1", date: "2026-08-12", title: "MEP coordination", projectCode: "PRJ-2401", status: "Blocked" },
  { id: "e2", date: "2026-08-15", title: "Interior package approval", projectCode: "PRJ-2401", status: "In Progress" },
  { id: "e3", date: "2026-08-20", title: "AP UAT scripts due", projectCode: "PRJ-2407", status: "In Progress" },
  { id: "e4", date: "2026-08-28", title: "WMS vendor shortlist", projectCode: "PRJ-2412", status: "Backlog" },
];

export default function TaskCalendarPage() {
  return (
    <ModulePageShell
      title="Task Calendar"
      subtitle="Due-date calendar for project commitments."
      stats={[{ label: "Scheduled", value: EVENTS.length }]}
      onRefresh={() => showToast("Calendar refreshed", "success")}
    >
      <div className="space-y-3">
        {EVENTS.map((event) => (
          <div
            key={event.id}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">{event.date}</div>
              <div className="font-medium text-slate-900">{event.title}</div>
              <div className="text-sm text-slate-500">{event.projectCode}</div>
            </div>
            <StatusBadge status={event.status} tone={event.status === "Blocked" ? "danger" : "info"} />
          </div>
        ))}
      </div>
    </ModulePageShell>
  );
}
''',
    )

    w(
        "modules/project/pages/timeline/TimelinePage.tsx",
        '''
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { showToast } from "@/shared/layout/layout";

const PHASES = [
  { id: "ph1", project: "PRJ-2401", name: "Design", start: "Mar", end: "Jun", progress: 100 },
  { id: "ph2", project: "PRJ-2401", name: "Build", start: "Jun", end: "Oct", progress: 55 },
  { id: "ph3", project: "PRJ-2407", name: "Configure", start: "May", end: "Aug", progress: 70 },
  { id: "ph4", project: "PRJ-2407", name: "UAT", start: "Aug", end: "Oct", progress: 20 },
  { id: "ph5", project: "PRJ-2412", name: "Select Vendor", start: "Aug", end: "Sep", progress: 35 },
];

export default function TimelinePage() {
  return (
    <ModulePageShell
      title="Project Timeline"
      subtitle="High-level phase timeline across the portfolio."
      stats={[{ label: "Phases", value: PHASES.length }]}
      onRefresh={() => showToast("Timeline refreshed", "success")}
    >
      <div className="space-y-4">
        {PHASES.map((phase) => (
          <div key={phase.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium text-slate-800">
                {phase.project} · {phase.name}
              </div>
              <div className="text-slate-500">
                {phase.start} → {phase.end}
              </div>
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
''',
    )

    print("done")


if __name__ == "__main__":
    main()
