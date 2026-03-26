import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ReviewModal({ onClose }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setSubmitStatus('Please select a star rating.');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('Submitting...');

        try {
            await addDoc(collection(db, 'reviews'), {
                userId: user?.uid || 'anonymous',
                displayName: user?.displayName || 'Anonymous',
                email: user?.email || '',
                rating,
                reviewText: reviewText.trim(),
                createdAt: serverTimestamp(),
            });

            setSubmitStatus('Thank you for your review!');
            setTimeout(() => onClose(), 2000);
        } catch (error) {
            console.error('Error submitting review:', error);
            setSubmitStatus('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-base-850 rounded-md p-6 max-w-md w-full border border-border shadow-floating">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-content-primary flex items-center">
                        <Star className="w-5 h-5 mr-2 text-warning-500" strokeWidth={1.5} />
                        Rate Apex Scholar
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-content-muted hover:text-content-primary transition-colors"
                    >
                        <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-3">
                            How would you rate your experience?
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-9 h-9 transition-colors ${
                                            star <= (hoveredStar || rating)
                                                ? 'text-warning-400 fill-warning-400'
                                                : 'text-content-muted'
                                        }`}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-sm text-content-muted mt-2">
                                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                            </p>
                        )}
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-2">
                            Tell us more (optional)
                        </label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            className="w-full bg-base-800 border border-border rounded-lg px-3 py-2 text-content-primary focus:border-content-muted focus:ring-2 focus:ring-content-muted/20 transition-all resize-none"
                            placeholder="What do you like? What could be improved?"
                        />
                        <p className="text-xs text-content-muted mt-1 text-right">
                            {reviewText.length}/1000
                        </p>
                    </div>

                    {/* Status Message */}
                    {submitStatus && (
                        <div className={`p-3 rounded-lg text-sm ${
                            submitStatus.includes('Thank you')
                                ? 'bg-success-900/30 border border-success-600 text-success-300'
                                : submitStatus.includes('Failed') || submitStatus.includes('Please select')
                                ? 'bg-error-900/30 border border-error-600 text-error-300'
                                : 'bg-base-800/30 border border-border text-content-muted'
                        }`}>
                            {submitStatus}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-base-800 hover:bg-base-750 text-content-secondary rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-warning-600 hover:bg-warning-700 text-content-primary rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-content-primary border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" strokeWidth={1.5} />
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
