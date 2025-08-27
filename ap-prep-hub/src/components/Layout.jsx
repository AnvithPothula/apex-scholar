import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, Calendar, Settings, LogOut, Award, Shield, X, MessageSquare, Send, FileQuestion } from 'lucide-react';
import { Button, Avatar, AvatarFallback, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { createPageUrl, cn } from '../utils/helpers';
import emailService from '../services/emailService';

export function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const isActiveTab = (pageName) => location.pathname.startsWith(createPageUrl(pageName));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
            <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/90 backdrop-blur-lg shadow-lg">
                <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <Link to="/AITutors" className="flex items-center space-x-2 sm:space-x-3 group">
                            <div className="p-1 sm:p-1.5 rounded-lg group-hover:opacity-80 transition-all duration-200">
                                <img 
                                    src="/Apex_Scholar_Logo_NoText.png" 
                                    alt="Apex Scholar" 
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                />
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">Apex Scholar</h1>
                        </Link>
                        
                        {/* Mobile-optimized navigation */}
                        <nav className="flex space-x-0.5 sm:space-x-1 bg-slate-800/80 p-0.5 sm:p-1 rounded-lg sm:rounded-xl backdrop-blur-sm border border-slate-700">
                            <Link 
                                to={createPageUrl("AITutors")} 
                                className={cn(
                                    "px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center space-x-1 sm:space-x-2 font-medium transition-all duration-200 text-xs sm:text-sm",
                                    isActiveTab("AITutors") ? "bg-slate-700 shadow-sm text-blue-400" : "text-slate-300 hover:text-slate-100"
                                )}
                            >
                                <Brain size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline sm:inline">AI Tutors</span>
                                <span className="xs:hidden sm:hidden">AI</span>
                            </Link>
                            <Link 
                                to={createPageUrl("PracticeTests")} 
                                className={cn(
                                    "px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center space-x-1 sm:space-x-2 font-medium transition-all duration-200 text-xs sm:text-sm",
                                    isActiveTab("PracticeTests") ? "bg-slate-700 shadow-sm text-blue-400" : "text-slate-300 hover:text-slate-100"
                                )}
                            >
                                <FileQuestion size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline sm:inline">Practice Tests</span>
                                <span className="xs:hidden sm:hidden">Tests</span>
                            </Link>
                            <Link 
                                to={createPageUrl("SmartScheduler")} 
                                className={cn(
                                    "px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center space-x-1 sm:space-x-2 font-medium transition-all duration-200 text-xs sm:text-sm",
                                    isActiveTab("SmartScheduler") ? "bg-slate-700 shadow-sm text-blue-400" : "text-slate-300 hover:text-slate-100"
                                )}
                            >
                                <Calendar size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline sm:inline">Scheduler</span>
                                <span className="xs:hidden sm:hidden">Schedule</span>
                            </Link>
                        </nav>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 p-0.5 sm:p-1 rounded-full hover:bg-slate-800 transition-all duration-200">
                                        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-slate-600">
                                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm">
                                                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 sm:w-48 bg-slate-800 border-slate-700">
                                    <DropdownMenuItem onSelect={() => navigate(createPageUrl('Settings'))} className="flex items-center text-slate-200 hover:bg-slate-700 hover:text-slate-100">
                                        <Settings size={14} className="mr-2"/>Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setShowFeedbackModal(true)} className="flex items-center text-slate-200 hover:bg-slate-700 hover:text-slate-100">
                                        <MessageSquare size={14} className="mr-2"/>Feedback
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setShowCreditsModal(true)} className="flex items-center text-slate-200 hover:bg-slate-700 hover:text-slate-100">
                                        <Award size={14} className="mr-2"/>Credits
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setShowPrivacyModal(true)} className="flex items-center text-slate-200 hover:bg-slate-700 hover:text-slate-100">
                                        <Shield size={14} className="mr-2"/>Privacy Policy
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-700" />
                                    <DropdownMenuItem onSelect={logout} className="flex items-center text-red-400 hover:text-red-300 hover:bg-slate-700">
                                        <LogOut size={14} className="mr-2"/>Log Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>
            <main className="relative">{children}</main>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <FeedbackModal 
                    user={user}
                    onClose={() => setShowFeedbackModal(false)} 
                />
            )}

            {/* Credits Modal */}
            {showCreditsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                                Credits
                            </h2>
                            <button
                                onClick={() => setShowCreditsModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">Creators & Developers:</h3>
                                <ul className="space-y-1 text-slate-300">
                                    <li>• Anvith Pothula</li>
                                    <li>• Prateek Roy</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-400 mb-2">Special Thanks:</h3>
                                <ul className="space-y-1 text-slate-300 text-sm">
                                    <li>• Open-source community for amazing libraries</li>
                                    <li>• React & Tailwind CSS teams</li>
                                    <li>• Firebase for backend services</li>
                                    <li>• Lucide React for beautiful icons</li>
                                    <li>• All beta testers and early users</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Policy Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                                Privacy Policy
                            </h2>
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-6 text-slate-300">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">Information We Collect</h3>
                                <p className="text-sm leading-relaxed">
                                    We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This may include your name, email address, study preferences, and academic progress data.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">How We Use Your Information</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Provide and improve our AI tutoring services</li>
                                    <li>• Personalize your learning experience</li>
                                    <li>• Generate study schedules and recommendations</li>
                                    <li>• Communicate with you about your account</li>
                                    <li>• Ensure the security of our platform</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">Data Security</h3>
                                <p className="text-sm leading-relaxed">
                                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">Third-Party Services</h3>
                                <p className="text-sm leading-relaxed">
                                    We may use third-party services (like Firebase for authentication) that have their own privacy policies. We encourage you to review their privacy practices.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">Your Rights</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Access your personal information</li>
                                    <li>• Correct inaccurate data</li>
                                    <li>• Delete your account and data</li>
                                    <li>• Export your data</li>
                                    <li>• Opt out of marketing communications</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">Contact Us</h3>
                                <p className="text-sm leading-relaxed">
                                    If you have any questions about this Privacy Policy, please contact us through our support channels or email us at privacy@apexscholar.com
                                </p>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-600">
                                <p className="text-xs text-slate-400">
                                    Last updated: {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                        Send Feedback
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Feedback Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Feedback Type *
                        </label>
                        <select
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Brief description of your feedback"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Message *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                            placeholder="Please provide detailed feedback..."
                            required
                        />
                    </div>

                    {/* Status Message */}
                    {submitStatus && (
                        <div className={`p-3 rounded-lg text-sm ${
                            submitStatus.includes('success') || submitStatus.includes('Thank you')
                                ? 'bg-green-900/30 border border-green-600 text-green-300'
                                : submitStatus.includes('Failed') || submitStatus.includes('Please fill')
                                ? 'bg-red-900/30 border border-red-600 text-red-300'
                                : 'bg-blue-900/30 border border-blue-600 text-blue-300'
                        }`}>
                            {submitStatus}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Feedback
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
