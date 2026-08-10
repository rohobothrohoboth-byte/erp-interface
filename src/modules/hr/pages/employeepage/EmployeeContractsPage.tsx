import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function EmployeeContractsPage() {
  return (
    <HrPlaceholderPage
      title="Contracts"
      subtitle="Active and historical employment contracts."
      rows={[
        { id: "1", name: "Permanent Contract", detail: "Abebe Kebede · Expires 2027-03-14", status: "Ready" },
        { id: "2", name: "Fixed Term", detail: "Hanna Tadesse · Expires 2026-10-31", status: "Draft" },
      ]}
    />
  );
}
