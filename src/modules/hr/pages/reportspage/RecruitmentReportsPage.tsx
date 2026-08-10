import { HrReportTablePage } from "./HrReportTablePage";

const DATA = [
  { id: "r1", opening: "Senior Accountant", applicants: 42, interviews: 8, offers: 2, hired: 1, status: "Filled" },
  { id: "r2", opening: "Network Engineer", applicants: 31, interviews: 6, offers: 1, hired: 0, status: "Open" },
  { id: "r3", opening: "HR Officer", applicants: 55, interviews: 10, offers: 2, hired: 1, status: "Filled" },
  { id: "r4", opening: "Project Coordinator", applicants: 27, interviews: 5, offers: 0, hired: 0, status: "Screening" },
];

export default function RecruitmentReportsPage() {
  return (
    <HrReportTablePage
      title="Recruitment Reports"
      subtitle="Pipeline conversion, time-to-hire, and opening status across requisitions."
      stats={[
        { label: "Openings", value: DATA.length },
        { label: "Applicants", value: DATA.reduce((sum, r) => sum + Number(r.applicants), 0) },
        { label: "Offers", value: DATA.reduce((sum, r) => sum + Number(r.offers), 0) },
        { label: "Hired", value: DATA.reduce((sum, r) => sum + Number(r.hired), 0) },
      ]}
      columns={[
        { key: "opening", label: "Opening" },
        { key: "applicants", label: "Applicants" },
        { key: "interviews", label: "Interviews" },
        { key: "offers", label: "Offers" },
        { key: "hired", label: "Hired" },
        { key: "status", label: "Status" },
      ]}
      data={DATA}
      statusTone={(s) =>
        s === "Filled" ? "success" : s === "Open" ? "info" : s === "Screening" ? "warning" : "neutral"
      }
    />
  );
}
