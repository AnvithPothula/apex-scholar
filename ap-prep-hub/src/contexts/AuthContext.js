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

const AuthContext = createContext(null);

// Detect if user is on mobile
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        let redirectChecked = false;
        let lastAuthUser = undefined; // undefined = not yet fired

        // Safety timeout - never stay in loading state forever
        const safetyTimeout = setTimeout(() => {
            if (!redirectChecked) {
                console.warn("⚠️ Auth initialization timeout - forcing loading complete");
                redirectChecked = true;
                if (lastAuthUser === null || lastAuthUser === undefined) {
                    setUser(null);
                    setLoading(false);
                }
            }
        }, 10000);

        // Check for redirect result on app load (from signInWithRedirect flow)
        const handleRedirectResult = async () => {
            try {
                console.log("🔍 Checking for redirect result...");
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("✅ Redirect sign-in successful, user:", result.user?.email);
                } else {
                    console.log("ℹ️ No redirect result (normal if not returning from redirect)");
                }
            } catch (error) {
                console.error("❌ Redirect result error:", error.code, error.message);
            } finally {
                redirectChecked = true;
                // If onAuthStateChanged already fired with null, now finalize loading
                if (lastAuthUser === null) {
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

                            setUser(prev => ({ ...prev, ...userDocSnap.data() }));
                        } else {

                            // Create user document asynchronously
                            await setDoc(userDocRef, {
                                fullName: displayName,
                                email: firebaseUser.email,
                                chatbotContext: 'I am a visual learner and prefer examples.',
                                theme: 'light',
                            });

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
            await setDoc(doc(db, "users", userCredential.user.uid), {
                fullName,
                email,
                chatbotContext: 'I am a visual learner and prefer examples.',
                theme: 'light',
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
