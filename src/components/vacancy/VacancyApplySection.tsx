import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import type { Vacancy } from '../../types/vacancy';
import { useCreateJobApplication } from '../../services/hr/recruitment/jobApplication/jobApplication.queries';
import { showToast } from '../../layout/layout';

interface VacancyApplySectionProps {
  vacancy: Vacancy;
  hasApplied: boolean;
  onApply: () => void;
}

const VacancyApplySection = ({ vacancy, hasApplied, onApply }: VacancyApplySectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const applyMutation = useCreateJobApplication({
    onSuccess: () => {
      showToast.success('Application submitted successfully');
      // Persist to localStorage so the applied state survives page refresh
      const applications = JSON.parse(localStorage.getItem('vacancyApplications') || '[]');
      applications.push({ vacancyId: vacancy.id, appliedDate: new Date().toISOString() });
      localStorage.setItem('vacancyApplications', JSON.stringify(applications));
      setIsModalOpen(false);
      setCoverLetter('');
      onApply();
    },
    onError: (e) => showToast.error(e.message || 'Failed to submit application'),
  });

  const handleSubmit = () => {
    if (!coverLetter.trim()) return;
    applyMutation.mutate({
      jobPostingId: vacancy.id,
      coverLetter,
    });
  };

  const handleClose = () => {
    if (!applyMutation.isPending) {
      setIsModalOpen(false);
      setCoverLetter('');
    }
  };

  if (hasApplied) {
    return (
      <Card className="sticky top-6">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted</h3>
            <p className="text-sm text-gray-600">
              Your application has been successfully submitted. The HR team will review it and contact you soon.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-green-600" />
            Apply for this Position
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full bg-green-600 hover:bg-green-700 cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <Send className="w-4 h-4 mr-2" />
            Apply Now
          </Button>
          <p className="text-xs text-center text-gray-500">
            Application deadline:{' '}
            {vacancy.closingDate}
          </p>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-xl">Apply for {vacancy.title}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-sm font-medium text-gray-700">
                Cover Letter <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="coverLetter"
                rows={8}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write your cover letter here..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50"
                disabled={applyMutation.isPending}
              />
              <p className="text-xs text-gray-400">{coverLetter.length} characters</p>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2 border-t">
            <Button variant="outline" className="px-6 cursor-pointer" onClick={handleClose} disabled={applyMutation.isPending}>
              Cancel
            </Button>
            <Button
              className="px-6 bg-green-600 hover:bg-green-700 cursor-pointer"
              onClick={handleSubmit}
              disabled={applyMutation.isPending || !coverLetter.trim()}
            >
              {applyMutation.isPending
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Submitting...</>
                : 'Submit Application'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VacancyApplySection;
