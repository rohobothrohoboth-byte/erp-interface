import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function EmployeePerformancePage() {
  return (
    <HrPlaceholderPage
      title="Performance Reviews"
      subtitle="Review cycles, ratings, and follow-up actions."
      rows={[
        { id: "1", name: "FY2025 Mid-Year", detail: "Sara Hailu · Rating 4.2", status: "Ready" },
        { id: "2", name: "FY2025 Annual", detail: "Abebe Kebede · In progress", status: "Draft" },
      ]}
    />
  );
}
