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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-slate-400">Signing you in...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex overflow-hidden">
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
                        <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3 lg:mr-4">
                            <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Apex Scholar
                            </h1>
                            <p className="text-slate-300 text-sm lg:text-lg">Your Complete AI-Powered AP Study Platform</p>
                        </div>
                    </div>

                    {/* Hero Message */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="mb-4 lg:mb-8 p-4 lg:p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            <span className="text-lg font-semibold text-white">Transform Your AP Journey</span>
                        </div>
                        <p className="text-slate-300">Everything you need to excel in Advanced Placement courses and exams, powered by cutting-edge AI technology.</p>
                    </motion.div>

                    {/* Feature Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-8"
                    >
                        <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-white">AI Tutors</h3>
                            </div>
                            <p className="text-sm text-slate-300">Specialized AI tutors for all 39 AP subjects, available 24/7 for personalized help and explanations.</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                                    <FileQuestion className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-white">Practice Tests</h3>
                            </div>
                            <p className="text-sm text-slate-300">Authentic AP exam simulations with MCQs, FRQs, DBQs, and timed conditions matching real exams.</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-white">Smart Scheduler</h3>
                            </div>
                            <p className="text-sm text-slate-300">AI-powered study plans that adapt to your exam dates, progress, and learning preferences.</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-500/30 rounded-xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                                    <Calculator className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-white">Problem Solver</h3>
                            </div>
                            <p className="text-sm text-slate-300">Upload photos of homework problems and get step-by-step AI solutions with explanations.</p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-600/20 to-pink-700/20 border border-pink-500/30 rounded-xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-white">Flashcards</h3>
                            </div>
                            <p className="text-sm text-slate-300">AI-generated flashcards for any topic, with spaced repetition and progress tracking.</p>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-700/20 border border-indigo-500/30 rounded-xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-white">Progress Tracking</h3>
                            </div>
                            <p className="text-sm text-slate-300">Detailed analytics on your study progress, strengths, and areas for improvement.</p>
                        </div>
                    </motion.div>

                    {/* Comprehensive Features List */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="bg-slate-800/50 border border-slate-600 rounded-xl p-4 lg:p-6 mb-4 lg:mb-8"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <span>Everything You Need for AP Success</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">All 39 AP subjects covered</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">Authentic exam-style questions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">Personalized study schedules</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">Step-by-step problem solving</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">Interactive flashcard system</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">Real-time progress analytics</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">Exam scheduling & tracking</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">Secure data protection</span>
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
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">39</div>
                            <div className="text-xs text-slate-400">AP Subjects</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">24/7</div>
                            <div className="text-xs text-slate-400">AI Support</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Smart</div>
                            <div className="text-xs text-slate-400">Learning</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Secure</div>
                            <div className="text-xs text-slate-400">Platform</div>
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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            Apex Scholar
                        </h1>
                        <p className="text-slate-300">Your AI-powered study companion</p>
                    </div>
                    
                    <Card className="border-2 border-slate-700 shadow-2xl bg-slate-800/90 backdrop-blur-sm">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl text-slate-100">{isSignUp ? "Create an Account" : "Welcome Back"}</CardTitle>
                            <p className="text-slate-300">{isSignUp ? "Join thousands of AP students" : "Continue your learning adventure"}</p>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Quick Benefits for Mobile */}
                            <div className="md:hidden mb-6 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center space-x-2 text-xs bg-blue-600/20 rounded-lg p-2">
                                        <Brain className="w-4 h-4 text-blue-400" />
                                        <span className="text-slate-300">AI Tutors</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs bg-green-600/20 rounded-lg p-2">
                                        <FileQuestion className="w-4 h-4 text-green-400" />
                                        <span className="text-slate-300">Practice Tests</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs bg-purple-600/20 rounded-lg p-2">
                                        <Calendar className="w-4 h-4 text-purple-400" />
                                        <span className="text-slate-300">Smart Scheduler</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs bg-amber-600/20 rounded-lg p-2">
                                        <Calculator className="w-4 h-4 text-amber-400" />
                                        <span className="text-slate-300">Problem Solver</span>
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg">
                                    <span className="text-sm text-slate-300">39 AP subjects • 24/7 support • Smart learning</span>
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
                                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-slate-300">Full Name</label>
                                        <Input 
                                            id="name" 
                                            value={fullName} 
                                            onChange={(e) => setFullName(e.target.value)} 
                                            className="border-2 border-slate-600 bg-slate-700 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-11"
                                            placeholder="Enter your full name"
                                            required 
                                        />
                                    </motion.div>
                                )}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-300">Email</label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="border-2 border-slate-600 bg-slate-700 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-11"
                                        placeholder="Enter your email address"
                                        required 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-2 text-slate-300">Password</label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="border-2 border-slate-600 bg-slate-700 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-11"
                                        placeholder="Enter your password"
                                        required 
                                    />
                                </div>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-900 border border-red-600 rounded-lg"
                                    >
                                        <p className="text-sm text-red-300">{error}</p>
                                    </motion.div>
                                )}
                                <Button 
                                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center" 
                                    type="submit" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isSignUp ? "Create Account" : "Sign In"}
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                            
                            <div className="my-6 flex items-center">
                                <hr className="flex-grow border-t border-slate-600" />
                                <span className="mx-4 text-sm text-slate-400">OR</span>
                                <hr className="flex-grow border-t border-slate-600" />
                            </div>
                            
                            <Button 
                                variant="outline" 
                                className="w-full h-11 border-2 border-slate-600 bg-slate-700 text-slate-100 hover:border-slate-500 hover:bg-slate-600 transition-all duration-200" 
                                onClick={handleGoogleSignIn} 
                                disabled={isLoading}
                            >
                                <GoogleIcon className="w-5 h-5 mr-2" />
                                Sign in with Google
                            </Button>
                            
                            <p className="mt-6 text-center text-sm text-slate-400">
                                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                                <button 
                                    onClick={() => setIsSignUp(!isSignUp)} 
                                    className="ml-1 font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
                                >
                                    {isSignUp ? "Sign In" : "Sign Up"}
                                </button>
                            </p>

                            {/* Security Notice */}
                            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
                                <Shield className="w-4 h-4" />
                                <span>Your data is secure and protected</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
