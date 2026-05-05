// components/post/LikeButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { toggleLike, getUserLike } from "@/lib/firebase/posts";
import clsx from "clsx";

import { useLanguage } from "@/lib/context/LanguageContext";

interface LikeButtonProps {
  postId: string;
  initialLikesCount: number;
}

export default function LikeButton({ postId, initialLikesCount }: LikeButtonProps) {
  const { user, signInAnonymously } = useAuth();
  const { t } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (user) {
      getUserLike(postId, user.uid)
        .then(setLiked)
        .catch(err => console.error("Error fetching like status:", err));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiked(false);
    }
  }, [user, postId]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    let currentUserId = user?.uid;

    if (!user) {
      try {
        const anonUser = await signInAnonymously();
        currentUserId = anonUser.uid;
      } catch (err: any) {
        console.error("Anonymous like failed:", err);
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

    // Optimistic update
    const newLiked = !liked;
    const oldLiked = liked;
    const oldLikesCount = likesCount;

    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    try {
      const result = await toggleLike(postId, currentUserId);
      // Synchronize with server result just in case
      setLiked(result);
    } catch (err) {
      // Rollback on error
      setLiked(oldLiked);
      setLikesCount(oldLikesCount);
      console.error("Like failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={clsx(
        "flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform active:scale-95",
        liked
          ? "bg-red-500 text-white border-2 border-red-500 shadow-lg shadow-red-200 dark:shadow-red-900/20"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-red-400 hover:text-red-500 shadow-sm"
      )}
      aria-label={liked ? `${t("like")} - ${likesCount}` : t("like")}
    >
      <Heart
        className={clsx(
          "w-5 h-5 transition-all duration-300",
          liked ? "fill-white stroke-white" : "fill-none",
          animating && "animate-ping-once"
        )}
      />
      <span className="font-black">{likesCount}</span>
    </button>
  );
}
