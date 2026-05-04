// lib/firebase/admin.ts
// Server-side only — never import this in client components
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  // Handle private key — Vercel stores it with literal \n, not real newlines
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (privateKey) {
    // Strip surrounding quotes if present (from .env files)
    // Use [\s\S]* instead of dotAll 's' flag for ES2017 compatibility
    privateKey = privateKey.replace(/^["']([\s\S]*)["']$/, "$1");
    // Convert escaped newlines to real newlines
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  // If we have full service account credentials, use them
  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback: only project ID available (limited functionality)
  if (projectId) {
    console.warn(
      "[Firebase Admin] Missing FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_ADMIN_PRIVATE_KEY. " +
      "Running in limited mode. Set all three env vars in Vercel for full functionality."
    );
    return initializeApp({ projectId });
  }

  // Last resort: empty init (will fail on first Firestore call with a clear error)
  console.error(
    "[Firebase Admin] No FIREBASE_ADMIN_PROJECT_ID set. " +
    "Please add all FIREBASE_ADMIN_* environment variables in your Vercel project settings."
  );
  return initializeApp({ projectId: "missing-project-id" });
}

export const adminDb = getFirestore(getAdminApp());
export const adminAuth = getAuth(getAdminApp());
