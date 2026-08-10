import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function PayrollHistoryPage() {
  return (
    <HrPlaceholderPage
      title="Payroll History"
      subtitle="Past payroll runs and payment confirmations."
      rows={[
        { id: "1", name: "July 2026", detail: "Net ETB 4,210,000 · Paid", status: "Ready" },
        { id: "2", name: "June 2026", detail: "Net ETB 4,112,000 · Paid", status: "Ready" },
      ]}
    />
  );
}
