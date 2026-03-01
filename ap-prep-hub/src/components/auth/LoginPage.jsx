import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Brain, Calendar, Shield, ChevronRight, Zap, Trophy,
         FileQuestion, Calculator, Sparkles, BarChart3, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '../ui/GoogleIcon';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const from = location.state?.from?.pathname || "/";

    // Navigate when user is authenticated
    useEffect(() => {
        if (user && !isLoading) {
            navigate(from, { replace: true });
        }
    }, [user, isLoading, navigate, from]);

    // Reset loading state when user changes
    useEffect(() => {
        if (user) {
            setIsLoading(false);
        }
    }, [user]);

    // Show loading spinner during auth initialization (e.g., processing redirect result)
    // This prevents flashing the login form when returning from signInWithRedirect
    if (authLoading) {
        return (
            <div className="min-h-screen bg-base-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
                    <p className="text-content-muted">Signing you in...</p>
                </div>
            </div>
        );
    }

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isSignUp) {
                if (!fullName.trim()) {
                    setError("Please enter your full name.");
                    setIsLoading(false);
                    return;
                }
                await signUpWithEmail(email, password, fullName);
            } else {
                await signInWithEmail(email, password);
            }
            // Don't navigate here - let the auth state change handle it
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            // Don't navigate here - let the auth state change handle it
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-950 flex overflow-hidden">
            {/* Left Side - App Information */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-center px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Logo and Main Title */}
                    <div className="flex items-center mb-4 lg:mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-primary-500 mr-3 lg:mr-4">
                            <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-base-950" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-display font-bold text-content-primary">
                                Apex Scholar
                            </h1>
                            <p className="text-content-secondary text-sm lg:text-lg">Your Complete AI-Powered AP Study Platform</p>
                        </div>
                    </div>

                    {/* Hero Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="mb-4 lg:mb-8 p-4 lg:p-6 bg-base-850 border border-border border-l-4 border-l-primary-500 rounded-md"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <Trophy className="w-6 h-6 text-warning-400" strokeWidth={1.5} />
                            <span className="text-lg font-semibold text-content-primary">Transform Your AP Journey</span>
                        </div>
                        <p className="text-content-secondary">Everything you need to excel in Advanced Placement courses and exams, powered by cutting-edge AI technology.</p>
                    </motion.div>

                    {/* Feature Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-8"
                    >
                        <div className="bg-base-850 border border-border border-l-4 border-l-primary-500 rounded-md p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-base-950" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-content-primary">AI Tutors</h3>
                            </div>
                            <p className="text-sm text-content-secondary">Specialized AI tutors for all 39 AP subjects, available 24/7 for personalized help and explanations.</p>
                        </div>

                        <div className="bg-base-850 border border-border border-l-4 border-l-success-500 rounded-md p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-success-600 flex items-center justify-center">
                                    <FileQuestion className="w-5 h-5 text-base-950" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-content-primary">Practice Tests</h3>
                            </div>
                            <p className="text-sm text-content-secondary">Authentic AP exam simulations with MCQs, FRQs, DBQs, and timed conditions matching real exams.</p>
                        </div>

                        <div className="bg-base-850 border border-border border-l-4 border-l-accent-500 rounded-md p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-base-950" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-content-primary">Smart Scheduler</h3>
                            </div>
                            <p className="text-sm text-content-secondary">AI-powered study plans that adapt to your exam dates, progress, and learning preferences.</p>
                        </div>

                        <div className="bg-base-850 border border-border border-l-4 border-l-warning-500 rounded-md p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-warning-600 flex items-center justify-center">
                                    <Calculator className="w-5 h-5 text-base-950" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-content-primary">Problem Solver</h3>
                            </div>
                            <p className="text-sm text-content-secondary">Upload photos of homework problems and get step-by-step AI solutions with explanations.</p>
                        </div>

                        <div className="bg-base-850 border border-border border-l-4 border-l-primary-500 rounded-md p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-base-950" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-content-primary">Flashcards</h3>
                            </div>
                            <p className="text-sm text-content-secondary">AI-generated flashcards for any topic, with spaced repetition and progress tracking.</p>
                        </div>

                        <div className="bg-base-850 border border-border border-l-4 border-l-primary-500 rounded-md p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-base-950" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-content-primary">Progress Tracking</h3>
                            </div>
                            <p className="text-sm text-content-secondary">Detailed analytics on your study progress, strengths, and areas for improvement.</p>
                        </div>
                    </motion.div>

                    {/* Comprehensive Features List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="bg-base-850 border border-border rounded-md p-4 lg:p-6 mb-4 lg:mb-8"
                    >
                        <h3 className="text-lg font-semibold text-content-primary mb-4 flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-warning-400" strokeWidth={1.5} />
                            <span>Everything You Need for AP Success</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-content-secondary">All 39 AP subjects covered</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-content-secondary">Authentic exam-style questions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-content-secondary">Personalized study schedules</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-content-secondary">Step-by-step problem solving</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-content-secondary">Interactive flashcard system</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-content-secondary">Real-time progress analytics</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-content-secondary">Exam scheduling & tracking</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-content-secondary">Secure data protection</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats and Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-4 gap-4"
                    >
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary-400">39</div>
                            <div className="text-xs text-content-muted">AP Subjects</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-success-400">24/7</div>
                            <div className="text-xs text-content-muted">AI Support</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary-400">Smart</div>
                            <div className="text-xs text-content-muted">Learning</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-warning-400">Secure</div>
                            <div className="text-xs text-content-muted">Platform</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-4 md:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="md:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500 mb-4">
                            <GraduationCap className="w-8 h-8 text-base-950" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-content-primary mb-2">
                            Apex Scholar
                        </h1>
                        <p className="text-content-secondary">Your AI-powered study companion</p>
                    </div>

                    <Card className="border-2 border-border shadow-floating bg-base-850">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl text-content-primary">{isSignUp ? "Create an Account" : "Welcome Back"}</CardTitle>
                            <p className="text-content-secondary">{isSignUp ? "Join thousands of AP students" : "Continue your learning adventure"}</p>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Quick Benefits for Mobile */}
                            <div className="md:hidden mb-6 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center space-x-2 text-xs bg-primary-600/20 rounded-lg p-2">
                                        <Brain className="w-4 h-4 text-primary-400" strokeWidth={1.5} />
                                        <span className="text-content-secondary">AI Tutors</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs bg-success-600/20 rounded-lg p-2">
                                        <FileQuestion className="w-4 h-4 text-success-400" strokeWidth={1.5} />
                                        <span className="text-content-secondary">Practice Tests</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs bg-primary-600/20 rounded-lg p-2">
                                        <Calendar className="w-4 h-4 text-primary-400" strokeWidth={1.5} />
                                        <span className="text-content-secondary">Smart Scheduler</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs bg-warning-600/20 rounded-lg p-2">
                                        <Calculator className="w-4 h-4 text-warning-400" strokeWidth={1.5} />
                                        <span className="text-content-secondary">Problem Solver</span>
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-primary-500/10 rounded-lg">
                                    <span className="text-sm text-content-secondary">39 AP subjects • 24/7 support • Smart learning</span>
                                </div>
                            </div>

                            <form onSubmit={handleAuthAction} className="space-y-4">
                                {isSignUp && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-content-secondary">Full Name</label>
                                        <Input
                                            id="name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="border-2 border-border-strong bg-base-800 text-content-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 h-11"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </motion.div>
                                )}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-content-secondary">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="border-2 border-border-strong bg-base-800 text-content-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 h-11"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-2 text-content-secondary">Password</label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="border-2 border-border-strong bg-base-800 text-content-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 h-11"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-error-900 border border-error-600 rounded-lg"
                                    >
                                        <p className="text-sm text-error-300">{error}</p>
                                    </motion.div>
                                )}
                                <Button
                                    className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-base-950 shadow-raised hover:shadow-floating transition-all duration-200 flex items-center justify-center"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-base-950 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isSignUp ? "Create Account" : "Sign In"}
                                            <ChevronRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="my-6 flex items-center">
                                <hr className="flex-grow border-t border-border-strong" />
                                <span className="mx-4 text-sm text-content-muted">OR</span>
                                <hr className="flex-grow border-t border-border-strong" />
                            </div>

                            <Button
                                variant="outline"
                                className="w-full h-11 border-2 border-border-strong bg-base-800 text-content-primary hover:border-border hover:bg-base-750 transition-all duration-200"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                <GoogleIcon className="w-5 h-5 mr-2" />
                                Sign in with Google
                            </Button>

                            <p className="mt-6 text-center text-sm text-content-muted">
                                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                                <button
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="ml-1 font-semibold text-primary-400 hover:text-primary-300 hover:underline transition-colors duration-200"
                                >
                                    {isSignUp ? "Sign In" : "Sign Up"}
                                </button>
                            </p>

                            {/* Security Notice */}
                            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-content-muted">
                                <Shield className="w-4 h-4" strokeWidth={1.5} />
                                <span>Your data is secure and protected</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
