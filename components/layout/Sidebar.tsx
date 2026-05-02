// components/layout/Sidebar.tsx
import { getTrendingPostsServer } from "@/lib/firebase/posts-admin";
import { unstable_cache } from "next/cache";
import SidebarClient from "./SidebarClient";

const getCachedTrendingPosts = unstable_cache(
  async () => getTrendingPostsServer(5),
  ["trending-posts"],
  { revalidate: 600 }
);

export default async function Sidebar() {
  let trendingPosts: Awaited<ReturnType<typeof getTrendingPostsServer>> = [];
  try {
    trendingPosts = await getCachedTrendingPosts();
  } catch {
    /* Firebase not yet configured */
  }

  // Pass the posts to the client component which handles language switching
  return <SidebarClient trendingPosts={trendingPosts} />;
}
