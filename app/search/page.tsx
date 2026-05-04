// app/search/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import PostGrid from "@/components/post/PostGrid";
import SearchBar from "@/components/search/SearchBar";
import { PageSpinner } from "@/components/ui/Spinner";
import { searchPostsServer } from "@/lib/firebase/posts-admin";
import { Post } from "@/lib/firebase/posts";
import { SITE_NAME } from "@/lib/utils/constants";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || "";
  return {
    title: q ? `"${q}" खोज परिणाम` : "खोजें",
    description: `${SITE_NAME} पर "${q}" के लिए खोज परिणाम`,
    robots: { index: false, follow: false },
  };
}

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">🔍</span>
        <p className="text-gray-500 dark:text-gray-400">
          ऊपर search box में खबर खोजें
        </p>
      </div>
    );
  }

  let posts: Post[] = [];
  let searchError = false;
  try {
    posts = await searchPostsServer(query);
  } catch (err) {
    console.error("[SearchPage] searchPostsServer error:", err);
    searchError = true;
  }

  if (searchError) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">⚠️</span>
        <p className="text-gray-600 dark:text-gray-300 font-semibold mb-1">
          खोज में समस्या आई
        </p>
        <p className="text-sm text-gray-400">
          कृपया पुनः प्रयास करें
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        &quot;{query}&quot; के लिए{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {posts.length}
        </span>{" "}
        परिणाम मिले
      </p>
      <PostGrid
        posts={posts}
        emptyMessage={`"${query}" से जुड़ी कोई खबर नहीं मिली`}
      />
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-red-600 rounded-full inline-block" />
        खबर खोजें
      </h1>

      <div className="max-w-2xl mb-8">
        <SearchBar />
      </div>

      <Suspense key={query} fallback={<PageSpinner />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}
