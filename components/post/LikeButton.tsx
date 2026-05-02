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
  const { user, signIn } = useAuth();
  const { t } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (user) {
      getUserLike(postId, user.uid).then(setLiked);
    }
  }, [user, postId]);

  const handleLike = async () => {
    if (!user) {
      await signIn();
      return;
    }

    if (loading) return;
    setLoading(true);

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    try {
      await toggleLike(postId, user.uid);
    } catch (err) {
      // Rollback on error
      setLiked(!newLiked);
      setLikesCount((prev) => (newLiked ? prev - 1 : prev + 1));
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
        "flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200",
        liked
          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-2 border-red-300 dark:border-red-700"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-600"
      )}
      aria-label={liked ? t("like") : t("like")}
    >
      <Heart
        className={clsx(
          "w-5 h-5 transition-transform",
          liked ? "fill-current" : "",
          animating ? "scale-150" : "scale-100"
        )}
      />
      <span>{likesCount}</span>
      <span className="sr-only">{t("like")}</span>
    </button>
  );
}
