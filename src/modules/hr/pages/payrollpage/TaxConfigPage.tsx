import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function TaxConfigPage() {
  return (
    <HrPlaceholderPage
      title="Tax Configurations"
      subtitle="Payroll tax brackets and statutory deduction settings."
      rows={[
        { id: "1", name: "PIT Bracket Set 2026", detail: "Active national brackets", status: "Ready" },
        { id: "2", name: "Pension Contribution", detail: "Employee 7% · Employer 11%", status: "Ready" },
      ]}
    />
  );
}
