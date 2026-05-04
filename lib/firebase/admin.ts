// lib/firebase/admin.ts — Server-side only
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function parsePrivateKey(raw: string): string {
  let key = raw;
  // Strip surrounding quotes (if pasted with quotes from .env)
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // Convert escaped \n sequences to real newlines
  key = key.replace(/\\n/g, "\n");
  return key;
}

function getAdminApp(): App {
  // Reuse existing app (hot-reload safe)
  if (getApps().length > 0) return getApps()[0];

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = rawKey ? parsePrivateKey(rawKey) : undefined;

  // Full service account — preferred
  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } catch (e) {
      console.error(
        "[Firebase Admin] Failed to parse private key. " +
        "Check FIREBASE_ADMIN_PRIVATE_KEY in Vercel env vars. Error:",
        (e as Error).message
      );
      // Fall through to limited mode
    }
  }

  // Limited fallback — reads may still work via project-level access
  if (projectId) {
    console.warn(
      "[Firebase Admin] Running without service account. " +
      "Add FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in Vercel."
    );
    return initializeApp({ projectId });
  }

  // Last resort — prevents a hard crash; Firestore calls will fail gracefully
  console.error("[Firebase Admin] FIREBASE_ADMIN_PROJECT_ID is not set.");
  return initializeApp({ projectId: "not-configured" });
}

const app = getAdminApp();
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
