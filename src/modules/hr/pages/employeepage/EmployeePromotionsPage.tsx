import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function EmployeePromotionsPage() {
  return (
    <HrPlaceholderPage
      title="Promotions"
      subtitle="Promotion requests and approved grade changes."
      rows={[
        { id: "1", name: "Grade Step Up", detail: "Dawit Mekonnen · IT Developer → Senior", status: "Ready" },
        { id: "2", name: "Role Change", detail: "Sara Hailu · Supervisor → Manager", status: "Draft" },
      ]}
    />
  );
}
