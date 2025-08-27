import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Apex Scholar
                    </h1>
                    <p className="text-slate-300">Your AI-powered study companion</p>
                </div>
                
                <Card className="border-2 border-slate-700 shadow-xl bg-slate-800">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl text-slate-100">{isSignUp ? "Create an Account" : "Welcome Back"}</CardTitle>
                        <p className="text-slate-300">{isSignUp ? "Join thousands of AP students" : "Continue your learning adventure"}</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Stats Dashboard for Login Page */}
                        <div className="mb-8 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-4 border border-blue-600">
                                    <div className="text-2xl font-bold text-blue-300">39</div>
                                    <div className="text-sm text-blue-400">AP Subjects</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-4 border border-green-600">
                                    <div className="text-2xl font-bold text-green-300">24/7</div>
                                    <div className="text-sm text-green-400">AI Tutoring</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-4 border border-purple-600">
                                    <div className="text-2xl font-bold text-purple-300">Smart</div>
                                    <div className="text-sm text-purple-400">AI Learning</div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-xl p-4 border border-amber-600">
                                    <div className="text-2xl font-bold text-amber-300">Smart</div>
                                    <div className="text-sm text-amber-400">Scheduling</div>
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                                <p className="font-semibold">🚀 Join thousands of students achieving AP success!</p>
                            </div>
                        </div>

                        <form onSubmit={handleAuthAction} className="space-y-4">
                            {isSignUp && (
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-slate-300">Full Name</label>
                                    <Input 
                                        id="name" 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        className="border-2 border-slate-600 bg-slate-700 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-11"
                                        placeholder="Enter your full name"
                                        required 
                                    />
                                </div>
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
                                <div className="p-3 bg-red-900 border border-red-600 rounded-lg">
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                            )}
                            <Button 
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200" 
                                type="submit" 
                                disabled={isLoading}
                            >
                                {isLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
