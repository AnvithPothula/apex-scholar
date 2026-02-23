import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect,
    getRedirectResult,
    browserLocalPersistence,
    setPersistence,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../config/firebase';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f97316, #ef4444)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #8b5cf6, #6366f1)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #d946ef, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #06b6d4)',
  'linear-gradient(135deg, #f43f5e, #ec4899)',
  'linear-gradient(135deg, #6366f1, #2563eb)',
  'linear-gradient(135deg, #84cc16, #22c55e)',
];

export { AVATAR_GRADIENTS };

export function generateAvatarGradient() {
  return AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        let redirectChecked = false;
        let lastAuthUser = undefined; // undefined = not yet fired

        // Detect whether we're returning from a signInWithRedirect flow.
        // The flag is set in signInWithGoogle() right before calling
        // signInWithRedirect and cleared here once the result is processed.
        const isReturningFromRedirect = (() => {
            try { return sessionStorage.getItem('apex.auth.pendingRedirect') === 'true'; }
            catch { return false; }
        })();

        if (isReturningFromRedirect) {
            console.log('🔄 Detected pending redirect — will wait for auth result');
        }

        // Safety timeout - never stay in loading state forever.
        // Give redirect flows extra time because the result can arrive late.
        const safetyTimeout = setTimeout(() => {
            if (!redirectChecked) {
                console.warn("⚠️ Auth initialization timeout - forcing loading complete");
                redirectChecked = true;
                try { sessionStorage.removeItem('apex.auth.pendingRedirect'); } catch {}
                if (lastAuthUser === null || lastAuthUser === undefined) {
                    setUser(null);
                    setLoading(false);
                }
            }
        }, isReturningFromRedirect ? 15000 : 10000);

        // Check for redirect result on app load (from signInWithRedirect flow)
        const handleRedirectResult = async () => {
            let gotRedirectUser = false;
            try {
                console.log("🔍 Checking for redirect result...");
                const result = await getRedirectResult(auth);
                if (result && result.user) {
                    gotRedirectUser = true;
                    console.log("✅ Redirect sign-in successful, user:", result.user?.email);
                } else if (isReturningFromRedirect) {
                    // We expected a redirect result but got null.  This happens
                    // when third-party cookies are blocked (Safari ITP, Chrome
                    // Privacy Sandbox) and the authDomain is cross-origin.
                    // onAuthStateChanged may still fire with the user — give it
                    // a couple of seconds before we give up.
                    console.warn("⚠️ Expected redirect result but got null — waiting for auth state...");
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    console.log("ℹ️ No redirect result (normal if not returning from redirect)");
                }
            } catch (error) {
                console.error("❌ Redirect result error:", error.code, error.message);
            } finally {
                redirectChecked = true;
                try { sessionStorage.removeItem('apex.auth.pendingRedirect'); } catch {}

                // If getRedirectResult returned a user, onAuthStateChanged WILL
                // fire with that user imminently — do NOT set loading=false here
                // or we'll briefly flash the login page.  Let onAuthStateChanged
                // handle it.
                if (lastAuthUser === null && !gotRedirectUser) {
                    setLoading(false);
                }
            }
        };
        handleRedirectResult();

        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            lastAuthUser = firebaseUser;
            
            if (firebaseUser) {
                // Set user immediately with basic info
                const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "New User";
                setUser({ 
                    uid: firebaseUser.uid, 
                    fullName: displayName,
                    email: firebaseUser.email,
                    chatbotContext: 'I am a visual learner and prefer examples.',
                    theme: 'light'
                });
                setLoading(false);
                setConnectionError(null); // Clear any previous connection errors
                
                // Fetch additional data asynchronously
                const fetchUserData = async () => {
                    try {

                        const userDocRef = doc(db, "users", firebaseUser.uid);
                        const userDocSnap = await getDoc(userDocRef);
                        
                        if (userDocSnap.exists()) {
                            const userData = userDocSnap.data();
                            setUser(prev => ({ ...prev, ...userData }));
                            // Backfill avatarGradient for existing users who don't have one
                            if (!userData.avatarGradient) {
                                const gradient = generateAvatarGradient();
                                try {
                                    await updateDoc(userDocRef, { avatarGradient: gradient });
                                    setUser(prev => ({ ...prev, avatarGradient: gradient }));
                                } catch (e) {
                                    console.error('Failed to backfill avatar gradient:', e);
                                }
                            }
                        } else {
                            const gradient = generateAvatarGradient();
                            // Create user document asynchronously
                            await setDoc(userDocRef, {
                                fullName: displayName,
                                email: firebaseUser.email,
                                chatbotContext: 'I am a visual learner and prefer examples.',
                                theme: 'light',
                                avatarGradient: gradient,
                            });
                            setUser(prev => ({ ...prev, avatarGradient: gradient }));

                        }
                    } catch (error) {
                        console.error("❌ Error fetching/creating user data:", error);
                        setConnectionError(getFirebaseErrorMessage(error));
                    }
                };
                
                fetchUserData();
            } else {
                setUser(null);
                // Only finalize loading after redirect check completes
                // This prevents flashing the login page before a redirect result is processed
                if (redirectChecked) {
                    setLoading(false);
                }
                setConnectionError(null);
            }
        }, (error) => {
            console.error("❌ Auth state change error:", error);
            setLoading(false);
            setConnectionError(getFirebaseErrorMessage(error));
        });
        
        return () => {
            clearTimeout(safetyTimeout);
            unsubscribe();
        };
    }, []);

    const logout = () => {

        return auth.signOut();
    };
    
    const updateUserProfile = async (data) => {
        if (user) {
            try {

                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, data);
                setUser(prev => ({...prev, ...data}));

            } catch (error) {
                console.error("❌ Error updating user profile:", error);
                throw new Error(getFirebaseErrorMessage(error));
            }
        }
    };

    const signInWithGoogle = async () => {
        try {
            // Set local persistence for better compatibility
            await setPersistence(auth, browserLocalPersistence);
            
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            // Try popup first with a timeout to detect hanging/blocked popups
            try {
                const result = await Promise.race([
                    signInWithPopup(auth, provider),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('popup-timeout')), 8000)
                    )
                ]);
                return result;
            } catch (popupError) {
                // Popup failed for any reason — always fall back to redirect.
                // Common causes: popup blocked, third-party cookies disabled,
                // browser extensions interfering, cross-origin storage errors, etc.
                console.log("🔄 Popup failed, falling back to redirect...", popupError.code || popupError.message);
                try {
                    // Set a flag so the page that loads after the redirect
                    // knows to wait for the auth result before giving up.
                    try { sessionStorage.setItem('apex.auth.pendingRedirect', 'true'); } catch {}
                    await signInWithRedirect(auth, provider);
                    return null; // Page will redirect
                } catch (redirectError) {
                    // If redirect also fails, throw the original popup error
                    console.error("❌ Redirect fallback also failed:", redirectError);
                    throw popupError;
                }
            }
        } catch (error) {
            console.error("❌ Google signin error:", error);
            throw new Error(getFirebaseErrorMessage(error));
        }
    };

    const signUpWithEmail = async (email, password, fullName) => {
        try {

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const gradient = generateAvatarGradient();
            await setDoc(doc(db, "users", userCredential.user.uid), {
                fullName,
                email,
                displayName: fullName,
                chatbotContext: 'I am a visual learner and prefer examples.',
                theme: 'light',
                avatarGradient: gradient,
            });

            return userCredential;
        } catch (error) {
            console.error("❌ Signup error:", error);
            throw new Error(getFirebaseErrorMessage(error));
        }
    };

    const signInWithEmail = async (email, password) => {
        try {

            const result = await signInWithEmailAndPassword(auth, email, password);

            return result;
        } catch (error) {
            console.error("❌ Signin error:", error);
            throw new Error(getFirebaseErrorMessage(error));
        }
    };

    const value = { 
        user, 
        loading, 
        connectionError,
        logout, 
        updateUserProfile, 
        signInWithGoogle, 
        signUpWithEmail, 
        signInWithEmail 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
