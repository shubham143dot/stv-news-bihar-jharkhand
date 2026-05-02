// lib/firebase/posts-admin.ts
// ⚠️ SERVER ONLY — uses Firebase Admin SDK. Never import in client components.
import { adminDb } from "./admin";
import { Post, PostStatus } from "./posts";
import { Timestamp } from "firebase-admin/firestore";

const POSTS_COLLECTION = "posts";

function docToPost(doc: FirebaseFirestore.DocumentSnapshot): Post {
  const data = doc.data()!;
  const status: PostStatus =
    data.status || (data.published ? "published" : "draft");

  function toISO(val: unknown): string {
    if (val instanceof Timestamp) return val.toDate().toISOString();
    if (typeof val === "string") return val;
    return "";
  }

  return {
    id: doc.id,
    title: data.title ?? "",
    slug: data.slug ?? "",
    tags: data.tags ?? [],
    category: data.category ?? "",
    city: data.city ?? "",
    state: data.state ?? "",
    eventDate: data.eventDate ?? "",
    eventTime: data.eventTime ?? "",
    imageUrl: data.imageUrl ?? "",
    videoUrl: data.videoUrl,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    publishAt: data.publishAt ? toISO(data.publishAt) : undefined,
    likesCount: data.likesCount ?? 0,
    commentsCount: data.commentsCount ?? 0,
    viewsCount: data.viewsCount ?? 0,
    published: status === "published",
    status,
    content: data.content ?? "",
  };
}

/** Fetch paginated published posts — for use in Server Components. */
export async function getPostsServer(
  pageSize = 12,
  lastCreatedAt?: string
): Promise<{ posts: Post[]; hasMore: boolean }> {
  // Fetch more than requested to allow for memory-side filtering of drafts
  let q = adminDb
    .collection(POSTS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(pageSize * 3);

  if (lastCreatedAt) {
    const cursor = Timestamp.fromDate(new Date(lastCreatedAt));
    q = q.startAfter(cursor) as typeof q;
  }

  const snapshot = await q.get();
  
  // Filter for published posts only in memory
  const allPosts = snapshot.docs
    .map(docToPost)
    .filter(post => post.published);

  const posts = allPosts.slice(0, pageSize);
  const hasMore = snapshot.docs.length >= pageSize * 3 || allPosts.length > pageSize;

  return { posts, hasMore };
}

/** Fetch trending posts by likes — for use in Server Components. */
export async function getTrendingPostsServer(count = 5): Promise<Post[]> {
  const snapshot = await adminDb
    .collection(POSTS_COLLECTION)
    .orderBy("likesCount", "desc")
    .limit(count * 5) // Fetch more to allow for filtering
    .get();

  return snapshot.docs
    .map(docToPost)
    .filter(post => post.published)
    .slice(0, count);
}

/** Fetch posts by category — for use in Server Components. */
export async function getPostsByCategoryServer(
  category: string,
  pageSize = 12
): Promise<Post[]> {
  const snapshot = await adminDb
    .collection(POSTS_COLLECTION)
    .where("category", "==", category)
    .orderBy("createdAt", "desc")
    .limit(pageSize * 2)
    .get();

  return snapshot.docs
    .map(docToPost)
    .filter(post => post.published)
    .slice(0, pageSize);
}

/** Fetch a single post by slug — for use in Server Components. */
export async function getPostBySlugServer(slug: string): Promise<Post | null> {
  const snapshot = await adminDb
    .collection(POSTS_COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return docToPost(snapshot.docs[0]);
}

/** Fetch a single post by ID — for use in Server Components. */
export async function getPostByIdServer(id: string): Promise<Post | null> {
  const docSnap = await adminDb.collection(POSTS_COLLECTION).doc(id).get();
  if (!docSnap.exists) return null;
  return docToPost(docSnap);
}

/** Fetch posts by tag — for use in Server Components. */
export async function getPostsByTagServer(
  tag: string,
  pageSize = 12
): Promise<Post[]> {
  const snapshot = await adminDb
    .collection(POSTS_COLLECTION)
    .where("tags", "array-contains", tag)
    .orderBy("createdAt", "desc")
    .limit(pageSize * 2)
    .get();

  return snapshot.docs
    .map(docToPost)
    .filter(post => post.published)
    .slice(0, pageSize);
}

/** Fetch all published slugs — for SSG/ISR. */
export async function getAllSlugsServer(): Promise<string[]> {
  const snapshot = await adminDb
    .collection(POSTS_COLLECTION)
    .select("slug", "published")
    .get();

  return snapshot.docs
    .filter((d) => d.data().published === true)
    .map((d) => d.data().slug as string)
    .filter(Boolean);
}

/** Search posts by title/tags — for use in Server Components. */
export async function searchPostsServer(searchTerm: string): Promise<Post[]> {
  const term = searchTerm.toLowerCase();
  // Fetch recent posts and filter client-side
  const snapshot = await adminDb
    .collection(POSTS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  return snapshot.docs
    .map(docToPost)
    .filter(
      (post) =>
        post.published &&
        (post.title.toLowerCase().includes(term) ||
          post.tags.some((tag) => tag.toLowerCase().includes(term)) ||
          post.category.toLowerCase().includes(term))
    )
    .slice(0, 20);
}
