import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../config/firebase';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {

        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {

            
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
                setLoading(false);
                setConnectionError(null);
            }
        }, (error) => {
            console.error("❌ Auth state change error:", error);
            setLoading(false);
            setConnectionError(getFirebaseErrorMessage(error));
        });
        
        return () => {

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

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            return result;
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
