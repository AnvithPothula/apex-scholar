import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils/helpers";
import { Brain, Calendar, GraduationCap, Settings, LogOut, Code2, Award, Shield, X, MessageSquare, Send } from "lucide-react";
import ApexScholarLogo from './components/ui/ApexScholarLogo';
import emailService from './services/emailService';

// Make CORS proxy tester available in development
if (process.env.NODE_ENV === 'development') {
  window.corsProxyTester = new CorsProxyTester();
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    // Force dark theme permanently
    document.documentElement.classList.add("dark");

    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        // Not logged in, user will be null
      }
    };
    fetchUser();
  }, []);


  const handleLogout = async () => {
    await User.logout();
    navigate(createPageUrl("AITutors"));
    window.location.reload();
  };
  
  const isActiveTab = (pageName) => {
    return location.pathname.startsWith(createPageUrl(pageName));
  };

  return (
    <div data-filename="pages/ViewCode" data-linenumber="2300" data-visual-selector-id="pages/ViewCode2300" className="min-h-screen bg-slate-900 text-slate-100 transition-colors duration-300">
      <style data-filename="pages/ViewCode" data-linenumber="2301" data-visual-selector-id="pages/ViewCode2301">
        {`
          .glass-effect {
            backdrop-filter: blur(20px);
            background: rgba(15, 23, 42, 0.7);
            border-color: rgba(51, 65, 85, 0.5);
          }
          
          .tab-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .glow-effect {
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
          }
        `}
      </style>
      
      {/* Header */}
      <header data-filename="pages/ViewCode" data-linenumber="2320" data-visual-selector-id="pages/ViewCode2320" className="glass-effect sticky top-0 z-50 border-b border-slate-800/50">
        <div data-filename="pages/ViewCode" data-linenumber="2321" data-visual-selector-id="pages/ViewCode2321" className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-filename="pages/ViewCode" data-linenumber="2322" data-visual-selector-id="pages/ViewCode2322" className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 flex items-center justify-center">
                <ApexScholarLogo 
                  size="lg" 
                  className="w-10 h-10" 
                />
              </div>
              <div data-filename="pages/ViewCode" data-linenumber="2328" data-visual-selector-id="pages/ViewCode2328" className="hidden md:block">
                <h1 data-filename="pages/ViewCode" data-linenumber="2329" data-visual-selector-id="pages/ViewCode2329" className="text-xl font-bold text-white">Apex Scholar</h1>
                <p data-filename="pages/ViewCode" data-linenumber="2330" data-visual-selector-id="pages/ViewCode2330" className="text-xs text-slate-400 -mt-1">AI-Powered Study Assistant</p>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav data-filename="pages/ViewCode" data-linenumber="2335" data-visual-selector-id="pages/ViewCode2335" className="flex-1 md:flex-initial md:flex-grow-0 flex justify-center">
              <div data-filename="pages/ViewCode" data-linenumber="2336" data-visual-selector-id="pages/ViewCode2336" className="flex space-x-1 bg-slate-800 p-1 rounded-xl">
                <Link
                  to={createPageUrl("AITutors")}
                  className={`tab-transition px-3 md:px-5 py-2 rounded-lg flex items-center space-x-2 font-medium text-sm ${
                    isActiveTab("AITutors")
                      ? "bg-slate-700 text-white shadow-sm glow-effect"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Brain data-filename="pages/ViewCode" data-linenumber="2345" data-visual-selector-id="pages/ViewCode2345" className="w-4 h-4" />
                  <span data-filename="pages/ViewCode" data-linenumber="2346" data-visual-selector-id="pages/ViewCode2346" className="hidden sm:inline">Tutors</span>
                </Link>
                <Link
                  to={createPageUrl("SmartScheduler")}
                  className={`tab-transition px-3 md:px-5 py-2 rounded-lg flex items-center space-x-2 font-medium text-sm ${
                    isActiveTab("SmartScheduler")
                      ? "bg-slate-700 text-white shadow-sm glow-effect"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Calendar data-filename="pages/ViewCode" data-linenumber="2356" data-visual-selector-id="pages/ViewCode2356" className="w-4 h-4" />
                  <span data-filename="pages/ViewCode" data-linenumber="2357" data-visual-selector-id="pages/ViewCode2357" className="hidden sm:inline">Scheduler</span>
                </Link>
                <Link
                  to={createPageUrl("ViewCode")}
                  className={`tab-transition px-3 md:px-5 py-2 rounded-lg flex items-center space-x-2 font-medium text-sm ${
                    isActiveTab("ViewCode")
                      ? "bg-slate-700 text-white shadow-sm glow-effect"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span data-filename="pages/ViewCode" data-linenumber="2368" data-visual-selector-id="pages/ViewCode2368" className="hidden sm:inline">View Code</span>
                </Link>
              </div>
            </nav>

            {/* User Menu */}
            <div data-filename="pages/ViewCode" data-linenumber="2374" data-visual-selector-id="pages/ViewCode2374" className="flex items-center space-x-2">
              <DropdownMenu data-filename="pages/ViewCode" data-linenumber="2375" data-visual-selector-id="pages/ViewCode2375">
                <DropdownMenuTrigger data-filename="pages/ViewCode" data-linenumber="2376" data-visual-selector-id="pages/ViewCode2376" asChild>
                  <button data-filename="pages/ViewCode" data-linenumber="2377" data-visual-selector-id="pages/ViewCode2377" className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-800 transition-colors">
                    <Avatar data-filename="pages/ViewCode" data-linenumber="2378" data-visual-selector-id="pages/ViewCode2378" className="w-8 h-8">
                      <AvatarImage data-filename="pages/ViewCode" data-linenumber="2379" data-visual-selector-id="pages/ViewCode2379" src={currentUser?.profile_picture_url || currentUser?.google_profile_picture} />
                      <AvatarFallback data-filename="pages/ViewCode" data-linenumber="2380" data-visual-selector-id="pages/ViewCode2380">{currentUser?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span data-filename="pages/ViewCode" data-linenumber="2382" data-visual-selector-id="pages/ViewCode2382" className="hidden lg:inline font-medium text-sm">{currentUser?.full_name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent data-filename="pages/ViewCode" data-linenumber="2385" data-visual-selector-id="pages/ViewCode2385" align="end" className="w-48">
                  <DropdownMenuItem data-filename="pages/ViewCode" data-linenumber="2386" data-visual-selector-id="pages/ViewCode2386" onSelect={() => navigate(createPageUrl('Settings'))}>
                    <Settings data-filename="pages/ViewCode" data-linenumber="2387" data-visual-selector-id="pages/ViewCode2387" className="w-4 h-4 mr-2" />
                    <span data-filename="pages/ViewCode" data-linenumber="2388" data-visual-selector-id="pages/ViewCode2388">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setShowFeedbackModal(true)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span>Give Feedback</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setShowCreditsModal(true)}>
                    <Award className="w-4 h-4 mr-2" />
                    <span>Credits</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setShowPrivacyModal(true)}>
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Privacy Policy</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator data-filename="pages/ViewCode" data-linenumber="2390" data-visual-selector-id="pages/ViewCode2390" />
                  <DropdownMenuItem data-filename="pages/ViewCode" data-linenumber="2391" data-visual-selector-id="pages/ViewCode2391" onSelect={handleLogout}>
                    <LogOut data-filename="pages/ViewCode" data-linenumber="2392" data-visual-selector-id="pages/ViewCode2392" className="w-4 h-4 mr-2" />
                    <span data-filename="pages/ViewCode" data-linenumber="2393" data-visual-selector-id="pages/ViewCode2393">Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main data-filename="pages/ViewCode" data-linenumber="2404" data-visual-selector-id="pages/ViewCode2404" className="flex-1">
        {children}
      </main>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal 
          currentUser={currentUser}
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
                  If you have any questions about this Privacy Policy, please contact us through the Feedback button.
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-600">
                <p className="text-xs text-slate-400">
                  Last updated: 2/2/2026
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
function FeedbackModal({ currentUser, onClose }) {
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
        currentUser
      );
      
      if (result.demo) {
        if (result.fallback) {
          setSubmitStatus('✅ Feedback received! (Currently in demo mode - check console for details)');
        } else {
          setSubmitStatus('✅ Feedback received! (Demo mode - your feedback has been logged to console)');
        }
      } else {
        setSubmitStatus('✅ Thank you! Your feedback has been sent successfully.');
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