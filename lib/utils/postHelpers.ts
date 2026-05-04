// lib/utils/postHelpers.ts
// Helpers that pick the right language variant of a post field.

import { Post } from "@/lib/firebase/posts";

type Language = "hi" | "en";

/** Returns the display title for the given language, falling back gracefully. */
export function getPostTitle(post: Post, lang: Language): string {
  if (lang === "en") return post.titleEn || post.title;
  return post.titleHi || post.title;
}

/** Returns the display content for the given language, falling back gracefully. */
export function getPostContent(post: Post, lang: Language): string {
  if (lang === "en") return post.contentEn || post.content;
  return post.contentHi || post.content;
}

/** Returns the display tags for the given language, falling back gracefully. */
export function getPostTags(post: Post, lang: Language): string[] {
  if (lang === "en") return post.tagsEn && post.tagsEn.length ? post.tagsEn : post.tags;
  return post.tagsHi && post.tagsHi.length ? post.tagsHi : post.tags;
}

/** Slugifies a tag for URL safety, matching the backend storage pattern */
export function slugifyTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, "-");
}
