// lib/firebase/categories.ts
// Persists admin-created custom categories to Firestore
// Collection: "categories"  Document id = category value (slug)

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./config";

export interface Category {
  value: string;   // slug, used as doc ID
  label: string;   // Hindi label
  labelEn: string; // English label
  isCustom: boolean;
  createdAt: string;
}

const categoriesRef = collection(db, "categories");

/** Fetch all custom categories from Firestore */
export async function getCustomCategories(): Promise<Category[]> {
  const q = query(categoriesRef, orderBy("createdAt", "asc"));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Category);
  } catch {
    // Index not ready / offline — return empty gracefully
    const snap = await getDocs(categoriesRef);
    return snap.docs.map(d => d.data() as Category);
  }
}

/** Create or overwrite a custom category */
export async function saveCategory(cat: Omit<Category, "createdAt">): Promise<void> {
  const docRef = doc(db, "categories", cat.value);
  await setDoc(docRef, {
    ...cat,
    createdAt: new Date().toISOString(),
  }, { merge: true });
}

/** Delete a custom category */
export async function removeCategory(value: string): Promise<void> {
  const docRef = doc(db, "categories", value);
  await deleteDoc(docRef);
}
