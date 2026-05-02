// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllSlugsServer } from "@/lib/firebase/posts-admin";
import { SITE_URL } from "@/lib/utils/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  // Dynamic post pages
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllSlugsServer();
    postPages = slugs.map((slug) => ({
      url: `${baseUrl}/post/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Firebase not configured yet
  }

  // Tag pages omitted from sitemap (generated on demand)

  return [...staticPages, ...postPages];
}
