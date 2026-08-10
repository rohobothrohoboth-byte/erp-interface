import { HrReportTablePage } from "./HrReportTablePage";

const DATA = [
  { id: "l1", employee: "Abebe Kebede", type: "Annual", from: "2026-07-01", to: "2026-07-05", days: 5, status: "Approved" },
  { id: "l2", employee: "Sara Hailu", type: "Sick", from: "2026-07-12", to: "2026-07-13", days: 2, status: "Approved" },
  { id: "l3", employee: "Dawit Mekonnen", type: "Annual", from: "2026-08-04", to: "2026-08-15", days: 10, status: "Pending" },
  { id: "l4", employee: "Hanna Tadesse", type: "Unpaid", from: "2026-06-20", to: "2026-06-21", days: 2, status: "Rejected" },
];

export default function LeaveReportsPage() {
  return (
    <HrReportTablePage
      title="Leave Reports"
      subtitle="Leave usage, approvals, and balance trends by employee and type."
      stats={[
        { label: "Requests", value: DATA.length },
        { label: "Approved", value: DATA.filter((r) => r.status === "Approved").length },
        { label: "Pending", value: DATA.filter((r) => r.status === "Pending").length },
        { label: "Days", value: DATA.reduce((sum, r) => sum + Number(r.days), 0) },
      ]}
      columns={[
        { key: "employee", label: "Employee" },
        { key: "type", label: "Type" },
        { key: "from", label: "From" },
        { key: "to", label: "To" },
        { key: "days", label: "Days" },
        { key: "status", label: "Status" },
      ]}
      data={DATA}
      statusTone={(s) =>
        s === "Approved" ? "success" : s === "Pending" ? "warning" : s === "Rejected" ? "danger" : "neutral"
      }
    />
  );
}
