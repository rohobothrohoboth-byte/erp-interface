import { Navigate } from "react-router-dom";

/**
 * Seeder path /hr/recruitment/applicant/evaluate has no applicant id.
 * Send users to the applicants list to pick a candidate to evaluate.
 */
export default function ApplicantEvaluateEntryPage() {
  return <Navigate to="/hr/recruitment/applicants" replace />;
}
