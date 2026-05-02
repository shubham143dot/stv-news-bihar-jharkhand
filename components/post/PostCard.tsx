// components/post/PostCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, Clock, ArrowRight } from "lucide-react";
import { Post } from "@/lib/firebase/posts";
import { timeAgo } from "@/lib/utils/formatDate";
import { getPostTitle, getPostTags } from "@/lib/utils/postHelpers";
import { useLanguage } from "@/lib/context/LanguageContext";
import Badge from "@/components/ui/Badge";

interface PostCardProps {
  post: Post;
  priority?: boolean;
  featured?: boolean;
}

export default function PostCard({ post, priority = false, featured = false }: PostCardProps) {
  const { language } = useLanguage();
  const title = getPostTitle(post, language);
  const tags  = getPostTags(post, language);

  const isLive = new Date(post.createdAt).getTime() > Date.now() - 7200000;

  if (featured) {
    return (
      <Link
        href={`/post/${post.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white col-span-2 row-span-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={title}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
              <span className="text-6xl">📰</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {isLive && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] font-bold px-2 py-0.5 bg-red-600 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight group-hover:text-yellow-300 transition-colors line-clamp-2">
              {title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-white font-bold text-xs drop-shadow-md">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likesCount}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 flex-shrink-0">
        {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={title}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
            <span className="text-4xl">📰</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Live badge */}
        {isLive && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </span>
        )}

        {/* Read more arrow on hover */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} label={tag} />
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors leading-tight flex-1">
          {title}
        </h2>

        <div className="flex items-center justify-between mt-3 text-[12px] text-gray-900 font-bold">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-700" />
            {timeAgo(post.createdAt)}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              {post.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              {post.viewsCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
