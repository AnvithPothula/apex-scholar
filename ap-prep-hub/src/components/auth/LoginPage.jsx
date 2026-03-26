import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input } from '../ui/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '../ui/GoogleIcon';
import ApexScholarLogo from '../ui/ApexScholarLogo';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
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
    if (authLoading) {
        return (
            <div className="min-h-screen bg-base-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-content-muted border-t-transparent mx-auto mb-4"></div>
                    <p className="text-content-muted text-sm">Signing you in...</p>
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
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address first.');
            return;
        }
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            await resetPassword(email);
            setSuccessMessage('Password reset email sent. Check your inbox.');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-950 flex">
            {/* Left Side - Clean value prop */}
            <div className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col justify-center px-12 lg:px-20 bg-base-900 border-r border-border">
                <div className="max-w-lg">
                    <div className="flex items-center gap-3 mb-10">
                        <ApexScholarLogo className="w-9 h-9" />
                        <span className="text-xl font-display font-semibold text-content-primary">Apex Scholar</span>
                    </div>

                    <h2 className="text-3xl lg:text-4xl font-display font-semibold text-content-primary leading-tight mb-4">
                        Study for your AP exams.
                    </h2>
                    <p className="text-lg text-content-secondary leading-relaxed mb-10">
                        AI tutors, practice tests, flashcards, and a smart study scheduler — all in one place for 39 AP subjects.
                    </p>

                    <div className="space-y-4 text-sm text-content-muted">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-content-muted flex-shrink-0" />
                            <span>AI-powered tutoring for every AP subject</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-content-muted flex-shrink-0" />
                            <span>Exam-style practice with instant feedback</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-content-muted flex-shrink-0" />
                            <span>Personalized study schedules that adapt to you</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 lg:w-[45%] flex items-center justify-center p-6 md:p-8 lg:p-12">
                <div className="w-full max-w-sm">
                    {/* Mobile Logo */}
                    <div className="md:hidden flex items-center gap-3 mb-10">
                        <ApexScholarLogo className="w-8 h-8" />
                        <span className="text-lg font-display font-semibold text-content-primary">Apex Scholar</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-xl font-display font-semibold text-content-primary mb-1">
                            {isSignUp ? "Create an account" : "Sign in"}
                        </h1>
                        <p className="text-sm text-content-muted">
                            {isSignUp ? "Get started with Apex Scholar." : "Welcome back to Apex Scholar."}
                        </p>
                    </div>

                    <form onSubmit={handleAuthAction} className="space-y-4">
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-content-secondary">Full name</label>
                                <Input
                                    id="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="h-10"
                                    placeholder="Your full name"
                                    required
                                />
                            </motion.div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-content-secondary">Email</label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-10"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-content-secondary">Password</label>
                                {!isSignUp && (
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-xs text-content-muted hover:text-content-primary transition-colors"
                                        disabled={isLoading}
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-10"
                                placeholder="Your password"
                                required
                            />
                        </div>

                        {successMessage && (
                            <div className="p-3 bg-success-900 border border-success-500/30 rounded-md">
                                <p className="text-sm text-success-400">{successMessage}</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-error-900 border border-error-500/30 rounded-md">
                                <p className="text-sm text-error-400">{error}</p>
                            </div>
                        )}

                        <Button
                            className="w-full h-10"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-base-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                isSignUp ? "Create account" : "Sign in"
                            )}
                        </Button>
                    </form>

                    <div className="my-6 flex items-center">
                        <hr className="flex-grow border-t border-border" />
                        <span className="mx-3 text-xs text-content-muted uppercase tracking-wider">or</span>
                        <hr className="flex-grow border-t border-border" />
                    </div>

                    <Button
                        variant="outline"
                        className="w-full h-10"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <GoogleIcon className="w-4 h-4 mr-2" />
                        Continue with Google
                    </Button>

                    <p className="mt-6 text-center text-sm text-content-muted">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-1 font-medium text-content-primary hover:underline transition-colors duration-150"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-content-disabled">
                        <Shield className="w-3 h-3" strokeWidth={1.5} />
                        <span>Secured with Firebase Authentication</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
