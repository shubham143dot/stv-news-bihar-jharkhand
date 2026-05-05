// app/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import PostGrid from "@/components/post/PostGrid";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import TranslatableText from "@/components/ui/TranslatableText";
import CategoryStrip from "@/components/ui/CategoryStrip";
import HeroLinks from "@/components/ui/HeroLinks";
import { PageSpinner } from "@/components/ui/Spinner";
import { getPostsServer } from "@/lib/firebase/posts-admin";
import { Post } from "@/lib/firebase/posts";
import { SITE_NAME, SITE_DESCRIPTION, POSTS_PER_PAGE } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export const revalidate = 60;

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));

  let posts: Post[] = [];
  let totalPosts = 0;
  let error: string | null = null;
  let is24hFilter = false;

  try {
    const { getLatestNews24hServer, getTotalPostsCountServer } = await import("@/lib/firebase/posts-admin");
    
    // Always get total count for pagination
    totalPosts = await getTotalPostsCountServer();

    // 1. Try fetching news from last 24 hours first (only on page 1)
    if (currentPage === 1) {
      const freshPosts = await getLatestNews24hServer(12);
      if (freshPosts.length > 0) {
        posts = freshPosts;
        is24hFilter = true;
      }
    }

    // 2. Fallback or subsequent pages: standard feed
    if (posts.length === 0) {
      const result = await getPostsServer(POSTS_PER_PAGE, currentPage);
      posts = result.posts;
    }
  } catch (e) {
    console.error("Error fetching posts:", e);
    error = "खबरें लोड नहीं हो सकीं।";
  }

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE) || 1;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Hero Banner ── */}
      <section className="hero-gradient text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-center">

            {/* Left: headline + links */}
            <div className="fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse" />
                  <TranslatableText tKey="liveBreaking" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black leading-[1.1] mb-3 drop-shadow-md">
                <TranslatableText tKey="heroTitle" />
                <span className="block text-yellow-300 mt-1 drop-shadow-sm">
                   <TranslatableText tKey="heroSubtitle" />
                </span>
              </h1>

              <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-6 max-w-xl drop-shadow-sm font-medium">
                <TranslatableText tKey="heroDesc" />
              </p>

              {/* Category chips — client component for language switching */}
              <HeroLinks />
            </div>

            {/* Right: REAL logo — Rounded and premium */}
            <div className="flex justify-center items-center mt-10 lg:mt-0">
              <div className="relative w-[180px] h-[180px] lg:w-[280px] lg:h-[280px] rounded-full overflow-hidden ring-[4px] lg:ring-[6px] ring-yellow-400/50 shadow-[0_15px_40px_rgba(0,0,0,0.3)] lg:shadow-[0_20px_50px_rgba(0,0,0,0.3)] logo-glow">
                <Image
                  src="/logo.jpg"
                  alt="STV News Bihar Jharkhand — Aap Ko Rakhe Aage"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center" }}
                  priority
                  sizes="(max-width: 1024px) 180px, 280px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Strip ── */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryStrip />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Posts */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                <span className="w-[4px] h-7 bg-red-600 rounded-full inline-block" />
                <TranslatableText tKey="latestNews" />
                {is24hFilter && (
                  <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold animate-pulse">
                    Last 24h
                  </span>
                )}
              </h2>
              <span className="text-xs text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                Page {currentPage}
              </span>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <span className="text-6xl mb-4">⚠️</span>
                <p className="font-semibold text-gray-600">{error}</p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs">
                  Firebase credentials को .env.local में जोड़ें, फिर server restart करें।
                </p>
              </div>
            ) : (
              <Suspense fallback={<PageSpinner />}>
                <PostGrid posts={posts} />
                {totalPages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                )}
              </Suspense>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="skeleton h-48 rounded-2xl" />
                  <div className="skeleton h-64 rounded-2xl" />
                </div>
              }
            >
              <Sidebar />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
