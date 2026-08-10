import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function SalaryStructurePage() {
  return (
    <HrPlaceholderPage
      title="Salary Structure"
      subtitle="Grade bands, allowances, and compensation components."
      rows={[
        { id: "1", name: "Grade 5 · Step 2", detail: "Base + transport + housing", status: "Ready" },
        { id: "2", name: "Grade 7 · Step 1", detail: "Base + responsibility allowance", status: "Ready" },
      ]}
    />
  );
}
