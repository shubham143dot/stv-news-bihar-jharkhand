// components/post/CommentLikeButton.tsx
"use client";

import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { toggleCommentLike, getUserCommentLike } from "@/lib/firebase/comments";
import clsx from "clsx";

interface CommentLikeButtonProps {
  commentId: string;
  initialLikesCount: number;
}

export default function CommentLikeButton({ commentId, initialLikesCount }: CommentLikeButtonProps) {
  const { user, signInAnonymously } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      getUserCommentLike(commentId, user.uid)
        .then(setLiked)
        .catch(err => console.error("Error fetching comment like status:", err));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiked(false);
    }
  }, [user, commentId]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    let currentUserId = user?.uid;

    if (!user) {
      try {
        const anonUser = await signInAnonymously();
        currentUserId = anonUser.uid;
      } catch (err: any) {
        console.error("Anonymous comment like failed:", err);
        if (err.code === "auth/admin-restricted-operation") {
          alert("Firebase Error: Anonymous Authentication is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.");
        }
        setLoading(false);
        return;
      }
    }

    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const oldLiked = liked;
    const oldLikesCount = likesCount;
    const newLiked = !liked;

    // Optimistic update
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      const result = await toggleCommentLike(commentId, currentUserId);
      setLiked(result);
    } catch (err) {
      // Rollback
      setLiked(oldLiked);
      setLikesCount(oldLikesCount);
      console.error("Comment like failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={clsx(
        "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 active:scale-95",
        liked
          ? "text-red-600 bg-red-50 dark:bg-red-900/20"
          : "text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <ThumbsUp className={clsx("w-3.5 h-3.5", liked && "fill-current")} />
      <span className="text-[11px] font-bold">{likesCount > 0 ? likesCount : ""}</span>
    </button>
  );
}
