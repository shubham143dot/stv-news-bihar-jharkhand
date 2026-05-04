// lib/firebase/posts.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  Timestamp,
  increment,
  DocumentSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export type PostStatus = "published" | "draft" | "scheduled";

export interface Post {
  id: string;
  title: string;       // legacy / primary (Hindi default)
  titleHi?: string;    // explicit Hindi title
  titleEn?: string;    // explicit English title
  slug: string;
  tags: string[];      // Hindi/legacy tags
  tagsHi?: string[];   // explicit Hindi tags
  tagsEn?: string[];   // explicit English tags
  category: string;
  city?: string;
  state?: string;
  eventDate?: string;
  eventTime?: string;
  imageUrl: string;
  videoUrl?: string;
  content: string;     // legacy / primary (Hindi default)
  contentHi?: string;  // explicit Hindi content
  contentEn?: string;  // explicit English content
  createdAt: string;
  updatedAt: string;
  publishAt?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  published: boolean;
  status: PostStatus;
  searchTokens?: string[];
}

export interface PostInput {
  title: string;
  titleHi?: string;
  titleEn?: string;
  slug: string;
  tags: string[];    // Hindi/legacy
  tagsHi?: string[];
  tagsEn?: string[];
  category: string;
  city?: string;
  state?: string;
  eventDate?: string;
  eventTime?: string;
  imageUrl: string;
  videoUrl?: string;
  content: string;   // Hindi/legacy
  contentHi?: string;
  contentEn?: string;
  status?: PostStatus;
  publishAt?: string;
}

const POSTS_PER_PAGE = 12;
const postsRef = collection(db, "posts");

// Remove undefined values — Firestore rejects them
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

// Convert Firestore doc to Post
function docToPost(doc: DocumentSnapshot): Post {
  const data = doc.data()!;
  const status: PostStatus = data.status || (data.published ? "published" : "draft");
  return {
    id: doc.id,
    title: data.title,
    titleHi: data.titleHi,
    titleEn: data.titleEn,
    slug: data.slug,
    tags: data.tags || [],
    tagsHi: data.tagsHi,
    tagsEn: data.tagsEn,
    category: data.category || "",
    city: data.city || "",
    state: data.state || "",
    eventDate: data.eventDate || "",
    eventTime: data.eventTime || "",
    imageUrl: data.imageUrl,
    videoUrl: data.videoUrl,
    content: data.content || "",
    contentHi: data.contentHi,
    contentEn: data.contentEn,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt,
    publishAt: data.publishAt instanceof Timestamp
      ? data.publishAt.toDate().toISOString()
      : data.publishAt,
    likesCount: data.likesCount || 0,
    commentsCount: data.commentsCount || 0,
    viewsCount: data.viewsCount || 0,
    published: status === "published",
    status,
    searchTokens: data.searchTokens || [],
  };
}

// Fetch paginated posts
export async function getPosts(
  lastDoc?: DocumentSnapshot,
  pageSize = POSTS_PER_PAGE,
  isAdminView = false
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  // Simple query with no compound index needed
  const constraints: Parameters<typeof query>[1][] = [
    orderBy("createdAt", "desc"),
    limit(isAdminView ? pageSize : pageSize * 2), // fetch extra for client-side filtering if not admin
  ];

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(postsRef, ...constraints);
  const snapshot = await getDocs(q);

  // Filter published posts client-side for public view
  // Admins see everything
  const posts = isAdminView 
    ? snapshot.docs.map(docToPost).slice(0, pageSize)
    : snapshot.docs
        .map(docToPost)
        .filter(p => p.status === "published" || p.published)
        .slice(0, pageSize);

  const newLastDoc =
    snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

  return { posts, lastDoc: newLastDoc };
}

// Get post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(postsRef, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return docToPost(snapshot.docs[0]);
}

// Get post by ID
export async function getPostById(id: string): Promise<Post | null> {
  const docRef = doc(db, "posts", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return docToPost(snapshot);
}

// Get trending posts (most liked)
export async function getTrendingPosts(count = 5): Promise<Post[]> {
  const q = query(
    postsRef,
    where("published", "==", true),
    orderBy("likesCount", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToPost);
}

// Get posts by tag
export async function getPostsByTag(tag: string, pageSize = POSTS_PER_PAGE): Promise<Post[]> {
  const q1 = query(
    postsRef,
    where("published", "==", true),
    where("tags", "array-contains", tag),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  const q2 = query(
    postsRef,
    where("published", "==", true),
    where("tagsEn", "array-contains", tag),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
  const postsMap = new Map<string, Post>();
  s1.docs.forEach(doc => {
    const post = docToPost(doc);
    postsMap.set(post.id, post);
  });
  s2.docs.forEach(doc => {
    const post = docToPost(doc);
    postsMap.set(post.id, post);
  });

  return Array.from(postsMap.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, pageSize);
}

// Search posts by title prefix + fallback to client-side filter
export async function searchPosts(searchTerm: string): Promise<Post[]> {
  const term = searchTerm.toLowerCase();
  
  // Start with a broad query
  const q = query(
    postsRef,
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(docToPost)
    .filter(
      (post) =>
        post.title.toLowerCase().includes(term) ||
        (post.titleEn?.toLowerCase().includes(term)) ||
        (post.titleHi?.toLowerCase().includes(term)) ||
        post.tags.some((t) => t.toLowerCase().includes(term)) ||
        post.tagsEn?.some((t) => t.toLowerCase().includes(term)) ||
        post.tagsHi?.some((t) => t.toLowerCase().includes(term))
    );
}


// Get all slugs (for SSG)
export async function getAllSlugs(): Promise<string[]> {
  const q = query(postsRef, where("published", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data().slug as string).filter(Boolean);
}

// Get all tags (for SSG)
export async function getAllTags(): Promise<string[]> {
  const q = query(postsRef, where("published", "==", true));
  const snapshot = await getDocs(q);
  const tags = new Set<string>();
  snapshot.docs.forEach((d) => {
    (d.data().tags || []).forEach((tag: string) => tags.add(tag));
  });
  return Array.from(tags);
}

function generateSearchTokens(input: PostInput | Partial<PostInput>): string[] {
  const tokens = new Set<string>();
  const addTokens = (str: string | undefined) => {
    if (!str) return;
    str.toLowerCase().split(/\s+/).forEach(word => {
      const clean = word.replace(/[^\w\u0900-\u097F]/g, "").trim();
      if (clean.length > 1) tokens.add(clean);
      if (clean) tokens.add(clean);
    });
  };

  addTokens(input.title);
  addTokens(input.titleHi);
  addTokens(input.titleEn);
  addTokens(input.category);
  (input.tags || []).forEach(t => addTokens(t));
  (input.tagsEn || []).forEach(t => addTokens(t));
  (input.tagsHi || []).forEach(t => addTokens(t));

  return Array.from(tokens);
}

// Create post (admin)
export async function createPost(input: PostInput): Promise<string> {
  const status = input.status || "published";
  const searchTokens = generateSearchTokens(input);
  
  const docRef = await addDoc(postsRef, stripUndefined({
    ...input,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    status,
    published: status === "published",
    searchTokens,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }));
  return docRef.id;
}

// Update post (admin)
export async function updatePost(
  id: string,
  input: Partial<PostInput>
): Promise<void> {
  const docRef = doc(db, "posts", id);
  // We need current post data to regenerate full search tokens if only part of input is provided
  // But for simplicity, we'll generate from what we have and the existing updateDoc will merge
  const searchTokens = generateSearchTokens(input);

  const updates = stripUndefined({
    ...input,
    updatedAt: Timestamp.now(),
    searchTokens,
    ...(input.status ? { published: input.status === "published" } : {}),
  });
  await updateDoc(docRef, updates as Record<string, unknown>);
}

// Delete post (admin)
export async function deletePost(id: string): Promise<void> {
  const docRef = doc(db, "posts", id);
  await deleteDoc(docRef);
}

// Toggle like (authenticated users)
export async function toggleLike(
  postId: string,
  userId: string
): Promise<boolean> {
  const likeRef = doc(db, "posts", postId, "likes", userId);
  const postRef = doc(db, "posts", postId);

  let liked = false;
  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    if (!postDoc.exists()) {
      throw new Error("Post does not exist!");
    }
    
    const likeDoc = await transaction.get(likeRef);
    if (likeDoc.exists()) {
      transaction.delete(likeRef);
      transaction.update(postRef, { 
        likesCount: increment(-1),
        updatedAt: serverTimestamp() 
      });
      liked = false;
    } else {
      transaction.set(likeRef, { 
        userId, 
        createdAt: serverTimestamp() 
      });
      transaction.update(postRef, { 
        likesCount: increment(1),
        updatedAt: serverTimestamp()
      });
      liked = true;
    }
  });

  return liked;
}

// Check if user liked a post
export async function getUserLike(
  postId: string,
  userId: string
): Promise<boolean> {
  const likeRef = doc(db, "posts", postId, "likes", userId);
  const snapshot = await getDoc(likeRef);
  return snapshot.exists();
}

// Increment view count
export async function incrementViews(postId: string): Promise<void> {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, { 
    viewsCount: increment(1),
    updatedAt: serverTimestamp()
  });
}
