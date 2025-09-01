import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Brain, Calendar, Shield, Target, ChevronRight, Users, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '../ui/GoogleIcon';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
    
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('Anvith');
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

    // Reset loading state when auth state changes
    useEffect(() => {
        if (user === null && !isLoading) {
            setIsLoading(false);
        }
    }, [user, isLoading]);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
            {/* Left Side - App Information */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-16">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-lg"
                >
                    {/* Logo and Main Title */}
                    <div className="flex items-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-4">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Apex Scholar
                            </h1>
                            <p className="text-slate-300 text-lg">Your AI-powered study companion</p>
                        </div>
                    </div>

                    {/* Main Selling Points */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6 mb-8"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">AI Tutors for Every Subject</h3>
                                <p className="text-slate-300">Get personalized help from specialized AI tutors across all 39 AP subjects, available 24/7.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Authentic Practice Tests</h3>
                                <p className="text-slate-300">Practice with exam-style questions including MCQs, FRQs, DBQs, and more that mirror real AP exams.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Smart Study Scheduling</h3>
                                <p className="text-slate-300">AI-powered study plans that adapt to your exam dates and learning progress.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-3 gap-4 mb-8"
                    >
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">39</div>
                            <div className="text-sm text-slate-400">AP Subjects</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">24/7</div>
                            <div className="text-sm text-slate-400">AI Support</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Smart</div>
                            <div className="text-sm text-slate-400">Learning</div>
                        </div>
                    </motion.div>

                    {/* Success Message */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            <span className="text-lg font-semibold text-white">Join Thousands of Success Stories</span>
                        </div>
                        <p className="text-slate-300">Students using Apex Scholar have consistently improved their AP exam scores and gained confidence in their studies.</p>
                        <div className="flex items-center mt-4 space-x-2 text-blue-400">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">Trusted by students nationwide</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
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
                            <div className="lg:hidden mb-6 space-y-3">
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                        <Brain className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-slate-300">39 AP subjects with AI tutors</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-slate-300">Authentic practice tests</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-slate-300">Smart study scheduling</span>
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
