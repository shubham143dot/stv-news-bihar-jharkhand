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
  likesCount?: number;    // Number of likes on this comment
}

// Real-time comments listener
export function subscribeToComments(
  postId: string,
  callback: (comments: Comment[]) => void
): () => void {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId)
    // Removed orderBy to avoid requiring composite indexes in production
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
        likesCount: data.likesCount || 0,
        timestamp:
          data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toISOString()
            : data.timestamp,
      };
    });

    // Sort in memory by timestamp ascending
    comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
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
    likesCount: 0,
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
    where("postId", "==", postId)
  );
  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map((doc) => {
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

  return comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Toggle comment like
export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<boolean> {
  const { runTransaction, increment, serverTimestamp } = await import("firebase/firestore");
  const commentRef = doc(db, "comments", commentId);
  const likeRef = doc(db, "comments", commentId, "likes", userId);

  let liked = false;
  await runTransaction(db, async (transaction) => {
    const commentDoc = await transaction.get(commentRef);
    if (!commentDoc.exists()) throw new Error("Comment not found");

    const likeDoc = await transaction.get(likeRef);
    if (likeDoc.exists()) {
      transaction.delete(likeRef);
      transaction.update(commentRef, { 
        likesCount: increment(-1),
        updatedAt: serverTimestamp()
      });
      liked = false;
    } else {
      transaction.set(likeRef, { userId, createdAt: serverTimestamp() });
      transaction.update(commentRef, { 
        likesCount: increment(1),
        updatedAt: serverTimestamp()
      });
      liked = true;
    }
  });

  return liked;
}

// Check if user liked a comment
export async function getUserCommentLike(
  commentId: string,
  userId: string
): Promise<boolean> {
  const { getDoc } = await import("firebase/firestore");
  const likeRef = doc(db, "comments", commentId, "likes", userId);
  const snapshot = await getDoc(likeRef);
  return snapshot.exists();
}
