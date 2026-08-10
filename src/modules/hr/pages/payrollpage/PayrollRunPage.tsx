import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function PayrollRunPage() {
  return (
    <HrPlaceholderPage
      title="Run Payroll"
      subtitle="Prepare and execute the current payroll period."
      rows={[
        { id: "1", name: "August 2026 Run", detail: "130 employees · Draft calculations ready", status: "Draft" },
        { id: "2", name: "July 2026 Run", detail: "128 employees · Completed", status: "Ready" },
      ]}
    />
  );
}
