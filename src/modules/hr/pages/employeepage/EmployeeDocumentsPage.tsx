import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function EmployeeDocumentsPage() {
  return (
    <HrPlaceholderPage
      title="Employee Documents"
      subtitle="Contracts, IDs, and supporting employee files."
      rows={[
        { id: "1", name: "National ID", detail: "EMP-1042 · PDF", status: "Ready" },
        { id: "2", name: "Employment Contract", detail: "EMP-1042 · PDF", status: "Ready" },
        { id: "3", name: "Bank Details Form", detail: "EMP-1108 · PDF", status: "Draft" },
      ]}
    />
  );
}
