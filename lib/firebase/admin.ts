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

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY 
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/^"(.*)"$/, "$1").replace(/\\n/g, "\n")
    : undefined;

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

  // Fallback for local development if only project ID is available
  // This allows some read operations but might fail for others requiring full auth
  return initializeApp({
    projectId: projectId,
  });
}

export const adminDb = getFirestore(getAdminApp());
export const adminAuth = getAuth(getAdminApp());
