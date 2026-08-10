import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function EmployeeProfilePage() {
  return (
    <HrPlaceholderPage
      title="Employee Profile"
      subtitle="View and manage core employee profile information."
      rows={[
        { id: "1", name: "Abebe Kebede", detail: "Finance · Accountant", status: "Active" },
        { id: "2", name: "Sara Hailu", detail: "Operations · Supervisor", status: "Active" },
      ]}
    />
  );
}
