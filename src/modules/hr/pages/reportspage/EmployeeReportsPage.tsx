import { HrReportTablePage } from "./HrReportTablePage";

const DATA = [
  { id: "e1", code: "EMP-1042", name: "Abebe Kebede", department: "Finance", position: "Accountant", status: "Active", hired: "2022-03-14" },
  { id: "e2", code: "EMP-1108", name: "Sara Hailu", department: "Operations", position: "Supervisor", status: "Active", hired: "2021-08-02" },
  { id: "e3", code: "EMP-1180", name: "Dawit Mekonnen", department: "IT", position: "Developer", status: "On Leave", hired: "2023-01-20" },
  { id: "e4", code: "EMP-1215", name: "Hanna Tadesse", department: "HR", position: "Officer", status: "Probation", hired: "2025-11-01" },
];

export default function EmployeeReportsPage() {
  return (
    <HrReportTablePage
      title="Employee Reports"
      subtitle="Headcount, status, and tenure summaries across the organization."
      stats={[
        { label: "Employees", value: DATA.length },
        { label: "Active", value: DATA.filter((r) => r.status === "Active").length },
        { label: "On Leave", value: DATA.filter((r) => r.status === "On Leave").length },
        { label: "Probation", value: DATA.filter((r) => r.status === "Probation").length },
      ]}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Employee" },
        { key: "department", label: "Department" },
        { key: "position", label: "Position" },
        { key: "hired", label: "Hired" },
        { key: "status", label: "Status" },
      ]}
      data={DATA}
      statusTone={(s) =>
        s === "Active" ? "success" : s === "On Leave" ? "warning" : s === "Probation" ? "info" : "neutral"
      }
    />
  );
}
