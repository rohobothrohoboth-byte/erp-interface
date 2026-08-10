import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function OfferCreatePage() {
  return (
    <HrPlaceholderPage
      title="Create Offer"
      subtitle="Draft a new employment offer for a selected applicant."
      rows={[
        { id: "1", name: "Offer template · Permanent", detail: "Standard benefits package", status: "Ready" },
        { id: "2", name: "Offer template · Fixed term", detail: "12-month contract", status: "Draft" },
      ]}
    />
  );
}
