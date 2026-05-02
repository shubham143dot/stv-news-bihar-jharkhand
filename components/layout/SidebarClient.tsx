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
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white">
          <Flame className="w-4 h-4" />
          <h3 className="font-black text-sm tracking-wide">{t("trendingNews")}</h3>
        </div>

        <div className="divide-y divide-gray-50">
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post, i) => {
              const title = getPostTitle(post, mounted ? language : "hi");
              return (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors group"
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
                    <p className="text-[13px] font-black text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors leading-snug">
                      {title}
                    </p>
                    <p className="text-[11px] text-gray-600 font-bold mt-1 flex items-center gap-1">
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
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
          <Hash className="w-4 h-4" />
          <h3 className="font-black text-sm tracking-wide">{t("popularTags")}</h3>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-800 hover:text-red-700 rounded-full text-xs font-bold transition-all duration-200 border border-gray-200 hover:border-red-200"
            >
              <Hash className="w-3 h-3 text-gray-400 group-hover:text-red-400" />
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
          Advertisement
        </p>
        <div className="h-48 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100">
          <span className="text-2xl mb-1">📣</span>
          <p className="text-xs text-gray-300 font-medium">300 × 250</p>
        </div>
      </div>
    </aside>
  );
}
