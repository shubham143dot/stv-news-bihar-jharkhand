// lib/firebase/users.ts
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { User } from "firebase/auth";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  isAdmin: boolean;
  createdAt: string;
}

// Create or update user profile on login
export async function upsertUserProfile(firebaseUser: User): Promise<UserProfile> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  const adminEmails = [
    (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").trim().toLowerCase(),
    "stvnews2026@gmail.com",
    "alonesourav310@gmail.com"
  ].filter(Boolean);

  const userEmailClean = (firebaseUser.email || "").trim().toLowerCase();
  const isAdmin = adminEmails.includes(userEmailClean);

  if (!snapshot.exists()) {
    // New user — create profile
    const profile: Omit<UserProfile, "id"> = {
      name: firebaseUser.displayName || "Anonymous",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      isAdmin,
      createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, { ...profile, createdAt: Timestamp.now() });
    return { id: firebaseUser.uid, ...profile };
  }

  const data = snapshot.data();

  if (data.isAdmin !== isAdmin) {
    await setDoc(userRef, { isAdmin }, { merge: true });
  }

  return {
    id: snapshot.id,
    name: data.name,
    email: data.email,
    photoURL: data.photoURL,
    isAdmin,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
  };
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    email: data.email,
    photoURL: data.photoURL,
    isAdmin: data.isAdmin || false,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
  };
}
