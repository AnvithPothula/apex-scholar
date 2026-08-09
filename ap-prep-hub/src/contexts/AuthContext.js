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
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updatePassword as firebaseUpdatePassword,
    updateEmail as firebaseUpdateEmail,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "firebase/auth";
import { auth, authIsSameOrigin } from '../config/firebase';
// Firestore is loaded on demand — a static import here would drag the whole
// SDK into the eager bundle, and nothing on this path needs the DB until
// after auth resolves or the user acts.
import { loadFirestore } from '../config/firestoreLazy';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages';
import errorLogger from '../utils/errorLogger';
import { isAdmin } from '../constants/admins';
import aiUsageLimiter from '../services/aiUsageLimiter';
import { readPendingConsent, clearPendingConsent } from '../constants/consent';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #14b8a6, #2dd4bf)',  // Teal
  'linear-gradient(135deg, #f59e0b, #fbbf24)',  // Amber
  'linear-gradient(135deg, #22c55e, #4ade80)',  // Green
  'linear-gradient(135deg, #ef4444, #f87171)',  // Red
  'linear-gradient(135deg, #3b82f6, #60a5fa)',  // Blue
  'linear-gradient(135deg, #0d9488, #14b8a6)',  // Deep teal
  'linear-gradient(135deg, #eab308, #facc15)',  // Gold
  'linear-gradient(135deg, #0f766e, #0d9488)',  // Dark teal
  'linear-gradient(135deg, #22c55e, #14b8a6)',  // Green-teal
  'linear-gradient(135deg, #f59e0b, #ef4444)',  // Amber-red
  'linear-gradient(135deg, #3b82f6, #14b8a6)',  // Blue-teal
  'linear-gradient(135deg, #4ade80, #22c55e)',  // Light green
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
            catch (e) { errorLogger.debug('sessionStorage read failed', { error: e?.message }); return false; }
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
                try { sessionStorage.removeItem('apex.auth.pendingRedirect'); } catch (e) { errorLogger.debug('sessionStorage write failed', { error: e?.message }); }
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
                try { sessionStorage.removeItem('apex.auth.pendingRedirect'); } catch (e) { errorLogger.debug('sessionStorage write failed', { error: e?.message }); }

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
                // Identify user in Sentry for error attribution
                errorLogger.setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
                
                // Fetch additional data asynchronously
                const fetchUserData = async () => {
                    try {

                        const { db, doc, getDoc, setDoc, updateDoc } = await loadFirestore();
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
                            // Google sign-in lands here: the account is brand new and this
                            // is the only place its document gets written. The consent
                            // choices were made on the login screen before a redirect that
                            // reloaded the page, so they come back out of localStorage.
                            const consent = readPendingConsent();
                            // Create user document asynchronously
                            await setDoc(userDocRef, {
                                fullName: displayName,
                                email: firebaseUser.email,
                                chatbotContext: 'I am a visual learner and prefer examples.',
                                theme: 'light',
                                avatarGradient: gradient,
                                emailOptIn: consent?.emailOptIn === true,
                                ...(consent?.emailOptIn ? { emailOptInAt: consent.at || new Date().toISOString() } : {}),
                                ...(consent?.acceptedTerms ? { termsAcceptedAt: consent.at || new Date().toISOString() } : {}),
                            });
                            setUser(prev => ({ ...prev, avatarGradient: gradient }));

                        }
                        // Consumed either way — a stale stash must not leak into
                        // the next account created on this device.
                        clearPendingConsent();
                    } catch (error) {
                        console.error("❌ Error fetching/creating user data:", error);
                        setConnectionError(getFirebaseErrorMessage(error));
                    }
                };
                
                fetchUserData();
            } else {
                setUser(null);
                // Clear Sentry user context on logout
                errorLogger.setUser(null);
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

                const { db, doc, updateDoc } = await loadFirestore();
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, data);
                setUser(prev => ({...prev, ...data}));

            } catch (error) {
                console.error("❌ Error updating user profile:", error);
                throw new Error(getFirebaseErrorMessage(error));
            }
        }
    };

    /**
     * Google sign-in — redirect where it works, popup where it cannot.
     *
     * Production serves the auth handler from our own origin (Netlify proxies
     * /__/*), so redirect is used there: no popup, works with popups blocked,
     * and it is what Firebase recommends under Safari ITP.
     *
     * On plain-http localhost the authDomain has to fall back to
     * firebaseapp.com — Firebase builds the handler URL as https://{authDomain}
     * and a http dev server cannot serve that. Cross-origin means Safari blocks
     * the storage redirect needs, getRedirectResult() returns null, and the user
     * is bounced straight back to login. Popup is the only flow that works
     * there, so dev uses it. Run `HTTPS=true npm start` to exercise the real
     * production redirect path locally.
     *
     * The popup path was removed because it was raced against an 8s timeout,
     * which broke sign-in for anyone who read the account chooser slowly:
     *   1. popup opens; user spends >8s picking an account
     *   2. the race rejects with 'popup-timeout' even though the popup is fine
     *   3. the catch fired signInWithRedirect, navigating the MAIN window away
     *      and orphaning the still-open popup
     *   4. the popup finished auth and postMessage'd to a window that no longer
     *      existed -> it span forever
     *   5. closing it left the user back on the login page, having to start over
     * The second attempt "worked" only because Google had cached the session by
     * then and the popup could return inside 8s.
     *
     * Redirect is also the flow Firebase recommends under Safari ITP, and it
     * works with popups blocked entirely. The /__/* proxy in public/_redirects
     * keeps the auth handler same-origin so cookies survive.
     */
    const signInWithGoogle = async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            if (!authIsSameOrigin) {
                // Dev / cross-origin authDomain: popup is the only flow that
                // completes. NOTE: no timeout race around this — racing it
                // against an 8s timer is exactly what broke sign-in before.
                // Let the user take as long as they need to pick an account.
                return await signInWithPopup(auth, provider);
            }

            // Tells the next page load to wait for the auth result rather than
            // flashing the login screen (read in the effect above).
            try {
                sessionStorage.setItem('apex.auth.pendingRedirect', 'true');
            } catch (e) {
                errorLogger.debug('sessionStorage write failed', { error: e?.message });
            }

            await signInWithRedirect(auth, provider);
            return null; // The page navigates; getRedirectResult picks it up on return.
        } catch (error) {
            // Never leave the pending flag set on failure, or the next load sits
            // in a 15s "waiting for redirect" state for nothing.
            try {
                sessionStorage.removeItem('apex.auth.pendingRedirect');
            } catch (e) {
                errorLogger.debug('sessionStorage write failed', { error: e?.message });
            }
            console.error("❌ Google signin error:", error);
            throw new Error(getFirebaseErrorMessage(error));
        }
    };

    const signUpWithEmail = async (email, password, fullName, emailOptIn = false) => {
        try {

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const gradient = generateAvatarGradient();
            const { db, doc, setDoc } = await loadFirestore();
            await setDoc(doc(db, "users", userCredential.user.uid), {
                fullName,
                email,
                displayName: fullName,
                chatbotContext: 'I am a visual learner and prefer examples.',
                theme: 'light',
                avatarGradient: gradient,
                // Defaults to false and only ever set by an explicitly ticked
                // box. A pre-checked or implied opt-in is not consent, and this
                // audience is largely minors.
                emailOptIn: emailOptIn === true,
                ...(emailOptIn === true ? { emailOptInAt: new Date().toISOString() } : {}),
                // Recorded so we can show when this account accepted the terms.
                termsAcceptedAt: new Date().toISOString(),
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

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error("❌ Password reset error:", error);
            throw new Error(getFirebaseErrorMessage(error));
        }
    };

    const reauthenticate = async (currentPassword) => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser || !firebaseUser.email) {
            throw new Error("No authenticated user found. Please sign in again.");
        }
        const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        await reauthenticateWithCredential(firebaseUser, credential);
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            await reauthenticate(currentPassword);
            await firebaseUpdatePassword(auth.currentUser, newPassword);
        } catch (error) {
            console.error("❌ Change password error:", error);
            throw new Error(getFirebaseErrorMessage(error));
        }
    };

    const changeEmail = async (currentPassword, newEmail) => {
        try {
            await reauthenticate(currentPassword);
            await firebaseUpdateEmail(auth.currentUser, newEmail);
            // Update Firestore user doc too
            const { db, doc, updateDoc } = await loadFirestore();
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, { email: newEmail });
            setUser(prev => ({ ...prev, email: newEmail }));
        } catch (error) {
            console.error("❌ Change email error:", error);
            throw new Error(getFirebaseErrorMessage(error));
        }
    };

    // Point the AI usage limiter at the current user (Firestore-backed for
    // signed-in users, localStorage for guests) and let admins/devs bypass it.
    useEffect(() => {
        aiUsageLimiter.setUser(user?.uid || null);
        aiUsageLimiter.setBypass(isAdmin(user?.uid));
    }, [user]);

    // A "guest" is someone who finished auth init with no signed-in user and
    // no connection error. Guests get read-only/AI-Tutors-only access; the
    // rest of the app is shown behind a sign-in upsell (see GuestGate).
    const isGuest = !loading && !user && !connectionError;

    const value = {
        user,
        loading,
        connectionError,
        isGuest,
        logout,
        updateUserProfile,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        changePassword,
        changeEmail
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
