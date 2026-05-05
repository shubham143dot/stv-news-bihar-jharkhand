// lib/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signInAnonymously as firebaseSignInAnonymously,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { upsertUserProfile, getUserProfile, UserProfile } from "@/lib/firebase/users";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signInAnonymously: () => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  signInAnonymously: async () => ({} as User),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        if (!firebaseUser.isAnonymous) {
          // Only sync profile for non-anonymous users
          document.cookie = `firebase-auth-token=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          try {
            const profile = await upsertUserProfile(firebaseUser);
            setUserProfile(profile);
          } catch (err) {
            console.error("Failed to load user profile:", err);
            const profile = await getUserProfile(firebaseUser.uid);
            setUserProfile(profile);
          }
        }
      } else {
        document.cookie = "firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    if (!auth) {
      alert("Firebase is not initialized. Check your API Key in environment variables.");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      
      // Try popup first
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Sign in failed:", err);
      
      if (err.code === "auth/unauthorized-domain") {
        alert("This domain is not authorized for Google Sign-in. Please add it to your Firebase Console under Authentication > Settings > Authorized Domains.");
      } else if (err.code === "auth/popup-blocked") {
        alert("Sign-in popup was blocked by your browser. Please allow popups for this site or try again.");
      } else if (err.code === "auth/popup-closed-by-user") {
        // User closed the popup, no action needed
      } else {
        alert(`Sign in failed: ${err.code || err.message}`);
      }
    }
  };

  const signInAnonymously = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    const result = await firebaseSignInAnonymously(auth);
    return result.user;
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin: userProfile?.isAdmin ?? false,
        signIn,
        signInAnonymously,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  const isAdmin = context.isAdmin || 
                 (context.user?.email === "alonesourav310@gmail.com") || 
                 (context.user?.email === "stvnews2026@gmail.com");
  
  return {
    ...context,
    isAdmin,
  };
}
