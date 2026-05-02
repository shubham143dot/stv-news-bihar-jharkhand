// lib/firebase/admin.ts
// Server-side only — never import this in client components
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY 
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/^"(.*)"$/, "$1").replace(/\\n/g, "\n")
    : undefined;

  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });

  return adminApp;
}

export const adminDb = getFirestore(getAdminApp());
export const adminAuth = getAuth(getAdminApp());
