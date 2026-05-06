// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllPostsSitemapDataServer } from "@/lib/firebase/posts-admin";
import { SITE_URL, NAV_LINKS, POPULAR_TAGS_EN } from "@/lib/utils/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 1. Static pages
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

  // 2. Tag/Category pages from constants
  const tagPages: MetadataRoute.Sitemap = NAV_LINKS.map((link) => ({
    url: `${baseUrl}${link.href}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  })).filter(link => link.url !== baseUrl);

  const extraTags: MetadataRoute.Sitemap = POPULAR_TAGS_EN
    .filter(tag => !NAV_LINKS.find(link => link.href === `/tag/${tag.slug}`))
    .map(tag => ({
      url: `${baseUrl}/tag/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    }));

  // 3. Dynamic post pages
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPostsSitemapDataServer();
    postPages = posts.map((post) => ({
      url: `${baseUrl}/post/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error generating dynamic post sitemap:", error);
  }

  return [...staticPages, ...tagPages, ...extraTags, ...postPages];
}
