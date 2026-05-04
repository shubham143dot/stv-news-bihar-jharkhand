import { Metadata } from "next";
import { Suspense } from "react";
import PostGrid from "@/components/post/PostGrid";
import Sidebar from "@/components/layout/Sidebar";
import TagPageHeader from "@/components/ui/TagPageHeader";
import Pagination from "@/components/ui/Pagination";
import { PageSpinner } from "@/components/ui/Spinner";
import { getPostsByTagServer, getTotalPostsByTagCountServer } from "@/lib/firebase/posts-admin";
import { Post } from "@/lib/firebase/posts";
import { SITE_NAME, POSTS_PER_PAGE } from "@/lib/utils/constants";

export const revalidate = 300; // 5 minutes

interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `#${decodedTag} — News | ${SITE_NAME}`,
    description: `All news tagged "${decodedTag}" on ${SITE_NAME}`,
    keywords: [decodedTag, "Bihar", "Jharkhand"],
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  const { page } = await searchParams;
  const decodedTag = decodeURIComponent(tag);
  const currentPage = parseInt(page || "1", 10);

  let posts: Post[] = [];
  let totalCount = 0;

  try {
    const [fetchedPosts, count] = await Promise.all([
      getPostsByTagServer(decodedTag, POSTS_PER_PAGE, currentPage),
      getTotalPostsByTagCountServer(decodedTag)
    ]);
    posts = fetchedPosts;
    totalCount = count;
  } catch (err) {
    console.error(`[TagPage] Data fetch failed for "${decodedTag}":`, err);
  }

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header rendered client-side for language awareness */}
      <TagPageHeader tag={decodedTag} count={totalCount} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Suspense fallback={<PageSpinner />}>
            <PostGrid posts={posts} />
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                basePath={`/tag/${tag}`} 
              />
            )}
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl" />}>
            <Sidebar />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
