// components/post/PostGrid.tsx
"use client";

import PostCard from "./PostCard";
import { Post } from "@/lib/firebase/posts";
import { useLanguage } from "@/lib/context/LanguageContext";

interface PostGridProps {
  posts: Post[];
  emptyMessage?: string;
}

export default function PostGrid({ posts, emptyMessage }: PostGridProps) {
  const { t } = useLanguage();
  const fallbackMsg = emptyMessage ?? t("noPostsFound");

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">📭</span>
        <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          {fallbackMsg}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} priority={index < 3} />
      ))}
    </div>
  );
}
