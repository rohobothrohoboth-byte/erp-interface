import { HrReportTablePage } from "./HrReportTablePage";

const DATA = [
  { id: "p1", period: "2026-07", employees: 128, gross: "ETB 4,820,000", deductions: "ETB 610,000", net: "ETB 4,210,000", status: "Paid" },
  { id: "p2", period: "2026-06", employees: 126, gross: "ETB 4,710,000", deductions: "ETB 598,000", net: "ETB 4,112,000", status: "Paid" },
  { id: "p3", period: "2026-05", employees: 125, gross: "ETB 4,650,000", deductions: "ETB 590,000", net: "ETB 4,060,000", status: "Paid" },
  { id: "p4", period: "2026-08", employees: 130, gross: "ETB 4,950,000", deductions: "ETB 625,000", net: "ETB 4,325,000", status: "Draft" },
];

export default function PayrollReportsPage() {
  return (
    <HrReportTablePage
      title="Payroll Reports"
      subtitle="Payroll run summaries, cost totals, and payment status by period."
      stats={[
        { label: "Periods", value: DATA.length },
        { label: "Paid", value: DATA.filter((r) => r.status === "Paid").length },
        { label: "Draft", value: DATA.filter((r) => r.status === "Draft").length },
        { label: "Latest net", value: DATA[0]?.net ?? "—" },
      ]}
      columns={[
        { key: "period", label: "Period" },
        { key: "employees", label: "Employees" },
        { key: "gross", label: "Gross" },
        { key: "deductions", label: "Deductions" },
        { key: "net", label: "Net" },
        { key: "status", label: "Status" },
      ]}
      data={DATA}
      statusTone={(s) => (s === "Paid" ? "success" : s === "Draft" ? "warning" : "neutral")}
    />
  );
}
