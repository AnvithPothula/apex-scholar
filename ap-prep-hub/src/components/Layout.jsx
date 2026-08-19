import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { overlayVariants, modalVariants } from '../utils/animations';
import { Brain, Calendar, Settings, LogOut, Award, Shield, X, MessageSquare, Send, FileQuestion, Calculator, Star, Code2, Sun, Moon, Lock, LogIn, GraduationCap, FileText } from 'lucide-react';
import { Button, Avatar, AvatarFallback, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { createPageUrl, cn } from '../utils/helpers';
import ApexScholarLogo from './ui/ApexScholarLogo';
import CommandPalette, { CommandPaletteTrigger } from './ui/CommandPalette';
import PuterAuthPrompt from './auth/PuterAuthPrompt';
import { isAdmin } from '../constants/admins';
import { useTheme } from '../contexts/ThemeContext';

// Modals, not first paint. Each of these pulled firebase/firestore into the
// eager bundle just by being imported at module scope.
const OnboardingWalkthrough = lazy(() => import('./OnboardingWalkthrough'));
const ReviewModal = lazy(() => import('./ReviewModal'));
const DeveloperSettings = lazy(() => import('./DeveloperSettings'));

export function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isGuest, logout } = useAuth();
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDevSettings, setShowDevSettings] = useState(false);
    const { toggleTheme, isDark } = useTheme();
    const isActiveTab = (pageName) => location.pathname.startsWith(createPageUrl(pageName));
    // The Practice tab owns its three child destinations, so it stays lit while
    // the user is inside any of them.
    const isPracticeTab = ['Practice', 'PracticeTests', 'Flashcards', 'Review'].some(isActiveTab);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen page-bg text-content-primary">
            {/* Skip to main content link for keyboard/screen reader users */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-base-800 focus:text-content-primary focus:rounded-md focus:border focus:border-border-strong">
                Skip to main content
            </a>
            <header className={`sticky top-0 z-50 border-b border-border transition-all duration-200 ${scrolled ? 'bg-base-900/98 backdrop-blur-md shadow-subtle' : 'bg-base-900/95 backdrop-blur-sm'}`}>
                <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className={`flex items-center justify-between transition-all duration-200 ${scrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16'}`}>
                                                <Link
                                                        to="/"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigate('/');
                                                        }}
                                                        className="flex items-center space-x-2 group"
                                                >
                            <div className="p-1 rounded-md group-hover:opacity-80 transition-opacity duration-150">
                                <ApexScholarLogo
                                    className="w-7 h-7 sm:w-8 sm:h-8"
                                />
                            </div>
                            <h1 className="text-base sm:text-lg font-display font-semibold text-content-primary truncate max-w-[120px] sm:max-w-none">Apex Scholar</h1>
                        </Link>
                        
                        {/* Mobile-optimized navigation */}
                        <nav aria-label="Main navigation" className="hidden md:flex space-x-0.5 sm:space-x-1 md:space-x-1.5 lg:space-x-2">
                            <Link
                                to={createPageUrl("AITutors")}
                                aria-label="AI Tutors"
                                aria-current={isActiveTab("AITutors") ? "page" : undefined}
                                className={cn(
                                    "px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 flex items-center space-x-1 md:space-x-1.5 font-medium transition-all duration-200 text-xs sm:text-sm",
                                    isActiveTab("AITutors") ? "text-content-primary border-b-2 border-content-primary" : "text-content-muted hover:text-content-primary"
                                )}
                            >
                                <Brain strokeWidth={1.5} size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="hidden md:inline">Tutors</span>
                            </Link>
                            {/* Tests + Cards + Review collapsed into one Practice
                                entry — they are one job, and three tabs pushed the
                                bar to 7 (HIG/Material cap at 5). */}
                            <Link
                                to={createPageUrl("Practice")}
                                aria-label="Practice"
                                aria-current={isPracticeTab ? "page" : undefined}
                                className={cn(
                                    "px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 flex items-center space-x-1 md:space-x-1.5 font-medium transition-all duration-200 text-xs sm:text-sm",
                                    isPracticeTab ? "text-content-primary border-b-2 border-content-primary" : "text-content-muted hover:text-content-primary"
                                )}
                            >
                                <FileQuestion strokeWidth={1.5} size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="hidden md:inline">Practice</span>
                                {isGuest && <Lock strokeWidth={1.5} size={11} className="ml-0.5 flex-shrink-0 opacity-50" />}
                            </Link>
                            <Link
                                to={createPageUrl("Solver")}
                                aria-label="Problem Solver"
                                aria-current={isActiveTab("Solver") ? "page" : undefined}
                                className={cn(
                                    "px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 flex items-center space-x-1 md:space-x-1.5 font-medium transition-all duration-200 text-xs sm:text-sm",
                                    isActiveTab("Solver") ? "text-content-primary border-b-2 border-content-primary" : "text-content-muted hover:text-content-primary"
                                )}
                            >
                                <Calculator strokeWidth={1.5} size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="hidden md:inline">Solver</span>
                                {isGuest && <Lock strokeWidth={1.5} size={11} className="ml-0.5 flex-shrink-0 opacity-50" />}
                            </Link>
                            <Link
                                to={createPageUrl("SmartScheduler")}
                                aria-label="Smart Scheduler"
                                aria-current={isActiveTab("SmartScheduler") ? "page" : undefined}
                                className={cn(
                                    "px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 flex items-center space-x-1 md:space-x-1.5 font-medium transition-all duration-200 text-xs sm:text-sm",
                                    isActiveTab("SmartScheduler") ? "text-content-primary border-b-2 border-content-primary" : "text-content-muted hover:text-content-primary"
                                )}
                            >
                                <Calendar strokeWidth={1.5} size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="hidden md:inline">Schedule</span>
                                {isGuest && <Lock strokeWidth={1.5} size={11} className="ml-0.5 flex-shrink-0 opacity-50" />}
                            </Link>
                            {/* Learn tab is dev-only for now */}
                            {isAdmin(user?.uid) && (
                            <Link
                                to={createPageUrl("Learn")}
                                aria-label="Learn"
                                aria-current={isActiveTab("Learn") ? "page" : undefined}
                                className={cn(
                                    "px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 flex items-center space-x-1 md:space-x-1.5 font-medium transition-all duration-200 text-xs sm:text-sm",
                                    isActiveTab("Learn") ? "text-content-primary border-b-2 border-content-primary" : "text-content-muted hover:text-content-primary"
                                )}
                            >
                                <GraduationCap strokeWidth={1.5} size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="hidden md:inline">Learn</span>
                            </Link>
                            )}
                        </nav>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <CommandPaletteTrigger />
                            <button
                                onClick={toggleTheme}
                                className="p-1.5 sm:p-2 rounded-lg text-content-muted hover:text-content-primary hover:bg-base-850 transition-all duration-200"
                                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {isDark ? <Sun strokeWidth={1.5} size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon strokeWidth={1.5} size={16} className="sm:w-[18px] sm:h-[18px]" />}
                            </button>
                            {!user ? (
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                                >
                                    <LogIn strokeWidth={1.5} size={14} className="mr-1.5" />
                                    Sign in
                                </Button>
                            ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 p-0.5 sm:p-1 rounded-full hover:bg-base-850 transition-all duration-200">
                                        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-border-strong">
                                            <AvatarFallback
                                                className="text-content-primary font-semibold text-sm"
                                                style={{ background: user?.avatarGradient || 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                                            >
                                                {(user?.displayName?.[0] || user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 sm:w-48 bg-base-850 border-border">
                                    <DropdownMenuItem onSelect={() => navigate(createPageUrl('Settings'))} className="flex items-center text-content-primary hover:bg-base-800 hover:text-content-primary">
                                        <Settings strokeWidth={1.5} size={14} className="mr-2"/>Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setShowFeedbackModal(true)} className="flex items-center text-content-primary hover:bg-base-800 hover:text-content-primary">
                                        <MessageSquare strokeWidth={1.5} size={14} className="mr-2"/>Feedback
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setShowCreditsModal(true)} className="flex items-center text-content-primary hover:bg-base-800 hover:text-content-primary">
                                        <Award strokeWidth={1.5} size={14} className="mr-2"/>Credits
                                    </DropdownMenuItem>
                                    {/* Real pages in new tabs, so each has its own
                                        shareable link and the user doesn't lose
                                        their place in the app. */}
                                    <DropdownMenuItem onSelect={() => window.open(createPageUrl('Privacy'), '_blank', 'noopener,noreferrer')} className="flex items-center text-content-primary hover:bg-base-800 hover:text-content-primary">
                                        <Shield strokeWidth={1.5} size={14} className="mr-2"/>Privacy Policy
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => window.open(createPageUrl('Terms'), '_blank', 'noopener,noreferrer')} className="flex items-center text-content-primary hover:bg-base-800 hover:text-content-primary">
                                        <FileText strokeWidth={1.5} size={14} className="mr-2"/>Terms of Service
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setShowReviewModal(true)} className="flex items-center text-content-primary hover:bg-base-800 hover:text-content-primary">
                                        <Star strokeWidth={1.5} size={14} className="mr-2"/>Rate Us
                                    </DropdownMenuItem>
                                    {isAdmin(user?.uid) && (
                                        <DropdownMenuItem onSelect={() => setShowDevSettings(true)} className="flex items-center text-content-primary hover:bg-base-800 hover:text-content-primary">
                                            <Code2 strokeWidth={1.5} size={14} className="mr-2"/>Developer Settings
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem onSelect={logout} className="flex items-center text-error-400 hover:text-error-300 hover:bg-base-800">
                                        <LogOut strokeWidth={1.5} size={14} className="mr-2"/>Log Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <main id="main-content" className="relative pb-16 md:pb-0">{children}</main>

            {/* Mobile Bottom Tab Bar */}
            <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-base-900/95 backdrop-blur-md border-t border-border">
                <div className="flex items-stretch justify-around">
                    {[
                        // 4 destinations. Apple's HIG collapses iPhone tab bars past
                        // 5 and Material Design specifies 3-5, so Tests/Cards/Review
                        // live under Practice and Settings stays in the avatar menu
                        // (where it already was — it used to be duplicated here).
                        { page: 'AITutors', label: 'Tutors', Icon: Brain },
                        { page: 'Practice', label: 'Practice', Icon: FileQuestion, locked: true },
                        { page: 'Solver', label: 'Solver', Icon: Calculator, locked: true },
                        { page: 'SmartScheduler', label: 'Schedule', Icon: Calendar, locked: true },
                        // Dev-only: Learn tab only appears in the mobile nav for admins.
                        ...(isAdmin(user?.uid) ? [{ page: 'Learn', label: 'Learn', Icon: GraduationCap }] : []),
                    ].map(({ page, label, Icon, locked }) => (
                        <Link
                            key={page}
                            to={createPageUrl(page)}
                            aria-label={label}
                            aria-current={isActiveTab(page) ? 'page' : undefined}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 py-2 px-1 flex-1 transition-colors duration-200',
                                isActiveTab(page) ? 'text-content-primary' : 'text-content-muted'
                            )}
                        >
                            <span className="relative">
                                <Icon strokeWidth={1.5} size={16} />
                                {isGuest && locked && (
                                    <Lock strokeWidth={2} size={9} className="absolute -top-1 -right-1.5 text-content-muted" />
                                )}
                            </span>
                            <span className="text-[10px] leading-tight">{label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Feedback Modal */}
            <AnimatePresence>
            {showFeedbackModal && (
                <FeedbackModal
                    user={user}
                    onClose={() => setShowFeedbackModal(false)}
                />
            )}
            </AnimatePresence>

            {/* Credits Modal */}
            <AnimatePresence>
            {showCreditsModal && (
                <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="bg-base-850 rounded-md p-6 max-w-md w-full border border-border shadow-floating">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-display font-semibold text-content-primary">
                                Credits
                            </h2>
                            <button
                                onClick={() => setShowCreditsModal(false)}
                                className="text-content-muted hover:text-content-primary transition-colors"
                            >
                                <X strokeWidth={1.5} className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-content-primary mb-2">Creators & Developers:</h3>
                                <ul className="space-y-1 text-content-secondary">
                                    <li>• Anvith Pothula</li>
                                    <li>• Prateek Roy</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* The Privacy Policy modal that lived here is gone — it is now a
                real page at /privacy (see pages/Legal.jsx), alongside /terms. */}

            {/* Review Modal — lazy, so null fallback (nothing should flash) */}
            {showReviewModal && (
                <Suspense fallback={null}>
                    <ReviewModal onClose={() => setShowReviewModal(false)} />
                </Suspense>
            )}

            {/* Developer Settings Modal */}
            {showDevSettings && (
                <Suspense fallback={null}>
                    <DeveloperSettings onClose={() => setShowDevSettings(false)} />
                </Suspense>
            )}

            {/* Puter AI auth prompt — shown once after login if not yet connected */}
            <PuterAuthPrompt />

            {/* Onboarding walkthrough — signed-in users only (it writes
                completion state to Firestore and tours member-only pages) */}
            {user && (
                <Suspense fallback={null}>
                    <OnboardingWalkthrough />
                </Suspense>
            )}

            {/* Global command palette (Cmd+K) */}
            <CommandPalette />
        </div>
    );
}

// Feedback Modal Component
function FeedbackModal({ user, onClose }) {
    const [feedbackType, setFeedbackType] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const feedbackTypes = [
        { value: 'bug', label: 'Bug/Issue' },
        { value: 'suggestion', label: 'Suggestion' },
        { value: 'feature', label: 'Feature Request' },
        { value: 'general', label: 'General Feedback' },
        { value: 'other', label: 'Other' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!feedbackType || !title || !message) {
            setSubmitStatus('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('Sending...');

        try {
            const { default: emailService } = await import('../services/emailService');
            const result = await emailService.sendFeedback(
                { feedbackType, title, message },
                user
            );
            
            if (result.demo) {
                if (result.fallback) {
                    setSubmitStatus('Your feedback has been logged (EmailJS configuration issue). Check console for details.');
                } else {
                    setSubmitStatus('Demo: Your feedback has been logged to console. Configure EmailJS to send real emails.');
                }
            } else {
                setSubmitStatus('Thank you! Your feedback has been sent successfully.');
            }
            
            // Close modal after 3 seconds
            setTimeout(() => {
                onClose();
            }, 3000);
            
        } catch (error) {
            console.error('Error sending feedback:', error);
            setSubmitStatus('Your feedback has been logged locally. There may be an email configuration issue.');
            
            // Still close modal after showing error
            setTimeout(() => {
                onClose();
            }, 4000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="bg-base-850 rounded-md p-6 max-w-lg w-full border border-border shadow-floating">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-display font-semibold text-content-primary">
                        Send Feedback
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-content-muted hover:text-content-primary transition-colors"
                    >
                        <X strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Feedback Type */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-2">
                            Feedback Type *
                        </label>
                        <select
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value)}
                            className="w-full bg-base-800 border border-border-strong rounded-sm px-3 py-2 text-content-primary focus:border-content-muted focus:ring-1 focus:ring-content-muted/20 transition-all"
                            required
                        >
                            <option value="">Select feedback type...</option>
                            {feedbackTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-base-800 border border-border-strong rounded-sm px-3 py-2 text-content-primary focus:border-content-muted focus:ring-1 focus:ring-content-muted/20 transition-all"
                            placeholder="Brief description of your feedback"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-2">
                            Message *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full bg-base-800 border border-border-strong rounded-sm px-3 py-2 text-content-primary focus:border-content-muted focus:ring-1 focus:ring-content-muted/20 transition-all resize-none"
                            placeholder="Please provide detailed feedback..."
                            required
                        />
                    </div>

                    {/* Status Message */}
                    {submitStatus && (
                        <div className={`p-3 rounded-lg text-sm ${
                            submitStatus.includes('success') || submitStatus.includes('Thank you')
                                ? 'bg-success-900/30 border border-success-600 text-success-300'
                                : submitStatus.includes('Failed') || submitStatus.includes('Please fill')
                                ? 'bg-error-900/30 border border-error-600 text-error-300'
                                : 'bg-base-800/30 border border-border text-content-muted'
                        }`}>
                            {submitStatus}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-base-800 hover:bg-base-750 text-content-secondary rounded-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-content-primary text-base-950 rounded-sm transition-colors hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-base-950 border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send strokeWidth={1.5} className="w-4 h-4" />
                                    Send Feedback
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
