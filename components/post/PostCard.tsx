// components/post/PostCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, Clock, Volume2, VolumeX } from "lucide-react";
import { Post } from "@/lib/firebase/posts";
import { timeAgo } from "@/lib/utils/formatDate";
import { getPostTitle, getPostTags, slugifyTag } from "@/lib/utils/postHelpers";
import { useLanguage } from "@/lib/context/LanguageContext";
import Badge from "@/components/ui/Badge";
import { useState, useRef } from "react";

interface PostCardProps {
  post: Post;
  priority?: boolean;
  featured?: boolean;
}

export default function PostCard({ post, priority = false, featured = false }: PostCardProps) {
  const { language, t } = useLanguage();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const title = getPostTitle(post, language);
  const tags  = getPostTags(post, language);

  const isLive = new Date(post.createdAt).getTime() > Date.now() - 7200000;

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (featured) {
    return (
      <div
        className="group relative flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-[var(--card)] col-span-2 row-span-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Link href={`/post/${post.slug}`} className="absolute inset-0 z-0">
            {post.videoUrl ? (
              <video
                ref={videoRef}
                src={post.videoUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : post.imageUrl ? (
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
          </Link>

          {post.videoUrl && (
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
              title={isMuted ? t("unmute") : t("mute")}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
          
          {isLive && (
            <span className="absolute top-3 left-3 z-20 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> {t("live")}
            </span>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-20">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.slice(0, 3).map((tag) => (
                <Link 
                  key={tag} 
                  href={`/tag/${slugifyTag(tag)}`}
                  className="text-[11px] font-bold px-2.5 py-1 bg-red-600 hover:bg-red-700 rounded-full transition-colors relative z-30"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <Link href={`/post/${post.slug}`} className="block group/link">
              <h2 className="text-xl sm:text-2xl font-black leading-tight group-hover/link:text-yellow-300 transition-colors line-clamp-2">
                {title}
              </h2>
            </Link>
            <div className="flex items-center gap-4 mt-2 text-white font-bold text-xs drop-shadow-md pointer-events-none">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likesCount}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image/Video Link Area */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 group">
        <Link href={`/post/${post.slug}`} className="absolute inset-0">
          {post.videoUrl ? (
            <video
              ref={videoRef}
              src={post.videoUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={title}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
              <span className="text-4xl">📰</span>
            </div>
          )}
        </Link>

        {post.videoUrl && (
          <button
            onClick={toggleMute}
            className="absolute bottom-2 right-2 z-30 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
            title={isMuted ? t("unmute") : t("mute")}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isLive && (
          <span className="absolute top-2 left-2 z-20 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {t("live")}
          </span>
        )}
      </div>

      {/* Body Area */}
      <div className="p-4 flex flex-col flex-1">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 relative z-10">
            {tags.slice(0, 3).map((tag) => (
              <Link 
                key={tag} 
                href={`/tag/${slugifyTag(tag)}`}
                className="hover:scale-105 transition-transform"
              >
                <Badge label={tag} />
              </Link>
            ))}
          </div>
        )}

        <Link href={`/post/${post.slug}`} className="block group/link flex-1">
          <h2 className="text-lg font-bold text-[var(--foreground)] line-clamp-2 group-hover/link:text-red-700 dark:group-hover/link:text-red-400 transition-colors leading-tight">
            {title}
          </h2>
        </Link>

        <div className="flex items-center justify-between mt-3 text-[12px] text-[var(--text-secondary)] font-bold pointer-events-none">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
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
    </div>
  );
}
