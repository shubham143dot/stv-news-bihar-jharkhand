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
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { upsertUserProfile, getUserProfile, UserProfile } from "@/lib/firebase/users";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Set a simple cookie for the middleware to detect authentication
        // In production, you'd use a real JWT or session cookie
        document.cookie = `firebase-auth-token=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        
        try {
          const profile = await upsertUserProfile(firebaseUser);
          setUserProfile(profile);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        }
      } else {
        // Clear the cookie on logout
        document.cookie = "firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
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
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  const isAdmin = context.isAdmin || (context.user?.email === "alonesourav310@gmail.com");
  
  return {
    ...context,
    isAdmin,
  };
}
