// Posting-scoped evaluation-flow page.
// Route: /hr/recruitment/posting/:postId/eval-flow
// Renders the posting-scoped section (reads :postId from the route) so evaluation
// flows are managed against the specific job posting rather than the global catalog
// (the global catalog lives under Settings → HR → Recruitment).
import JpEvalFlowSection from '@/modules/hr/components/recruitment/jobPosting/evalFlow/JpEvalFlowSection';

export default function JpEvalFlowPage() {
  return <JpEvalFlowSection />;
}
