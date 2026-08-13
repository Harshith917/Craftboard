import AccessPage from "@/pages/AccessPage";

export default function RequestsPage() {
  return (
    <AccessPage
      title="Requests"
      subtitle="Review and manage access requests from your team"
      typeFilter="access_request"
    />
  );
}
