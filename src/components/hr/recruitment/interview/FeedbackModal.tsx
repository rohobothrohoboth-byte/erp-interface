// src/components/hr/recruitment/interview/FeedbackModal.tsx

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Star, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    interviewId: string;
    applicantName: string;
    onSuccess: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         interviewId,
                                                         applicantName,
                                                         onSuccess,
                                                     }) => {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!feedback.trim()) {
            toast.error('Please provide feedback');
            return;
        }
        if (rating === 0) {
            toast.error('Please provide a rating');
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            toast.success('Feedback submitted successfully!');
            setIsSubmitting(false);
            onSuccess();
            onClose();
            setFeedback('');
            setRating(0);
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Add Feedback
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-600">
                            Providing feedback for <span className="font-medium text-gray-900">{applicantName}</span>
                        </p>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Rating <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="p-1 transition-colors"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= (hoveredRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        } transition-colors`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-500">
                                {rating > 0 ? `${rating} of 5` : 'Select rating'}
                            </span>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Feedback <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="Provide detailed feedback about the interview..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="w-full resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!feedback.trim() || rating === 0 || isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Feedback
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackModal;