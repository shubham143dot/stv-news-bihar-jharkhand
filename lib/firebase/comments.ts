// lib/firebase/comments.ts
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  increment,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  displayName: string;
  photoURL: string;
  comment: string;
  timestamp: string;
  parentId?: string;      // If it's a reply to another comment
  isAdmin?: boolean;      // If the comment is from a publisher/admin
  replyToName?: string;   // Name of the person being replied to
}

// Real-time comments listener
export function subscribeToComments(
  postId: string,
  callback: (comments: Comment[]) => void
): () => void {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("timestamp", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const comments: Comment[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        userId: data.userId,
        displayName: data.displayName,
        photoURL: data.photoURL,
        comment: data.comment,
        parentId: data.parentId,
        isAdmin: data.isAdmin,
        replyToName: data.replyToName,
        timestamp:
          data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toISOString()
            : data.timestamp,
      };
    });
    callback(comments);
  });

  return unsubscribe;
}

// Add a comment
export async function addComment(
  postId: string,
  userId: string,
  displayName: string,
  photoURL: string,
  comment: string,
  parentId?: string,
  isAdmin?: boolean,
  replyToName?: string
): Promise<void> {
  await addDoc(collection(db, "comments"), {
    postId,
    userId,
    displayName,
    photoURL,
    comment,
    parentId: parentId || null,
    isAdmin: isAdmin || false,
    replyToName: replyToName || null,
    timestamp: Timestamp.now(),
  });

  // Update commentsCount on post
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, { commentsCount: increment(1) });
}

// Delete a comment
export async function deleteComment(
  commentId: string,
  postId: string
): Promise<void> {
  await deleteDoc(doc(db, "comments", commentId));
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, { commentsCount: increment(-1) });
}

// Get comments for a post (one-time fetch)
export async function getComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("timestamp", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      postId: data.postId,
      userId: data.userId,
      displayName: data.displayName,
      photoURL: data.photoURL,
      comment: data.comment,
      timestamp:
        data.timestamp instanceof Timestamp
          ? data.timestamp.toDate().toISOString()
          : data.timestamp,
    };
  });
}
