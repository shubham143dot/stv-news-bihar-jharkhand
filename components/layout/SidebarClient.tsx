// components/layout/SidebarClient.tsx
// Client wrapper that makes the Sidebar's text react to language changes
"use client";

import Link from "next/link";
import { Hash, TrendingUp, Flame } from "lucide-react";
import { Post } from "@/lib/firebase/posts";
import { useLanguage } from "@/lib/context/LanguageContext";
import { POPULAR_TAGS_HI, POPULAR_TAGS_EN } from "@/lib/utils/constants";
import { getPostTitle } from "@/lib/utils/postHelpers";
import { timeAgo } from "@/lib/utils/formatDate";

interface SidebarClientProps {
  trendingPosts: Post[];
}

export default function SidebarClient({ trendingPosts }: SidebarClientProps) {
  const { language, t, mounted } = useLanguage();

  // Use the language to pick the right popular tags list
  const popularTags = mounted && language === "en" ? POPULAR_TAGS_EN : POPULAR_TAGS_HI;

  return (
    <aside className="space-y-5 sticky top-[144px]">
      {/* Trending Posts */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white">
          <Flame className="w-4 h-4" />
          <h3 className="font-black text-sm tracking-wide">{t("trendingNews")}</h3>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post, i) => {
              const title = getPostTitle(post, mounted ? language : "hi");
              return (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                >
                  <span
                    className={`text-xl font-black min-w-[28px] leading-none mt-0.5 transition-colors ${
                      i === 0
                        ? "text-red-600"
                        : i === 1
                        ? "text-orange-500"
                        : i === 2
                        ? "text-yellow-500"
                        : "text-gray-300 group-hover:text-red-400"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black text-[var(--foreground)] line-clamp-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors leading-snug">
                      {title}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] font-bold mt-1 flex items-center gap-1">
                      ❤️ {post.likesCount} · 👁 {post.viewsCount}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <TrendingUp className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">{t("trendingComingSoon")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
          <Hash className="w-4 h-4" />
          <h3 className="font-black text-sm tracking-wide">{t("popularTags")}</h3>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--background)] text-[var(--foreground)] hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-xs font-bold transition-all duration-200 border border-gray-300 dark:border-gray-700 hover:border-red-400"
            >
              <Hash className="w-3 h-3 text-gray-400" />
              {tag.label}
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}
