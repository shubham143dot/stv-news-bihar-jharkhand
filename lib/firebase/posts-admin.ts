import { adminDb } from "./admin";
import { Post, PostStatus } from "./posts";
import { Timestamp, AggregateField } from "firebase-admin/firestore";

const POSTS_COLLECTION = "posts";
const COMMENTS_COLLECTION = "comments";

/**
 * Get global engagement statistics for the dashboard.
 * SERVER-ONLY logic using Admin SDK for accuracy and performance.
 */
export async function getGlobalStatsAdmin(): Promise<{
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
}> {
  try {
    const postsRef = adminDb.collection(POSTS_COLLECTION);
    const commentsRef = adminDb.collection(COMMENTS_COLLECTION);

    let stats = {
      totalPosts: 0,
      totalLikes: 0,
      totalViews: 0,
      totalComments: 0,
    };

    try {
      // Primary Strategy: High-performance server-side aggregation
      const postsAggregate = await postsRef.aggregate({
        likes: AggregateField.sum('likesCount'),
        views: AggregateField.sum('viewsCount'),
      }).get();

      const postCount = await postsRef.count().get();
      const commentsCount = await commentsRef.count().get();

      stats = {
        totalPosts: postCount.data().count,
        totalLikes: postsAggregate.data().likes || 0,
        totalViews: postsAggregate.data().views || 0,
        totalComments: commentsCount.data().count,
      };
    } catch (_aggError) {
      // Aggregate query requires a composite index — falls back to manual summation.
      // Create the index at: https://console.firebase.google.com/project/stv-news-bihar/firestore/indexes
      console.debug("Aggregation using manual fallback (composite index not created yet).");
      
      // Secondary Strategy: Manual summation (Safe fallback for small/medium collections)
      const allPosts = await postsRef.get();
      const allComments = await commentsRef.count().get(); // Count usually works even if sum doesn't
      
      let l = 0, v = 0;
      allPosts.forEach(doc => {
        const data = doc.data();
        l += data.likesCount || 0;
        v += data.viewsCount || 0;
      });

      stats = {
        totalPosts: allPosts.size,
        totalLikes: l,
        totalViews: v,
        totalComments: allComments.data().count,
      };
    }

    return stats;
  } catch (error) {
    console.error("Critical error in getGlobalStatsAdmin:", error);
    return { totalPosts: 0, totalLikes: 0, totalViews: 0, totalComments: 0 };
  }
}

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
    titleHi: data.titleHi,
    titleEn: data.titleEn,
    slug: data.slug ?? "",
    tags: data.tags ?? [],
    tagsHi: data.tagsHi,
    tagsEn: data.tagsEn,
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
    contentHi: data.contentHi,
    contentEn: data.contentEn,
    searchTokens: data.searchTokens || [],
  };
}

/** Get total count of published posts. */
export async function getTotalPostsCountServer(): Promise<number> {
  try {
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .count()
      .get();
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting total posts count:", error);
    return 0;
  }
}

/** Fetch paginated published posts using page numbers or cursors. */
export async function getPostsServer(
  pageSize = 12,
  page = 1,
  lastCreatedAt?: string
): Promise<{ posts: Post[]; hasMore: boolean }> {
  try {
    let q = adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .orderBy("createdAt", "desc");

    if (lastCreatedAt) {
      const cursor = Timestamp.fromDate(new Date(lastCreatedAt));
      q = q.startAfter(cursor) as typeof q;
    } else if (page > 1) {
      q = q.offset((page - 1) * pageSize) as typeof q;
    }

    const snapshot = await q.limit(pageSize + 1).get();
    const allPosts = snapshot.docs.map(docToPost);
    const posts = allPosts.slice(0, pageSize);
    const hasMore = allPosts.length > pageSize;
    return { posts, hasMore };
  } catch (error) {
    console.warn("Firestore Pagination Index missing, using in-memory fallback:", error);
    try {
      // Indexless fallback: fetch latest 200 posts and filter in-memory
      const snapshot = await adminDb
        .collection(POSTS_COLLECTION)
        .orderBy("createdAt", "desc")
        .limit(200)
        .get();
      
      const allPublished = snapshot.docs
        .map(docToPost)
        .filter(p => p.published);
      
      let filtered = allPublished;
      if (lastCreatedAt) {
        const cursorTime = new Date(lastCreatedAt).getTime();
        filtered = allPublished.filter(p => new Date(p.createdAt).getTime() < cursorTime);
      } else if (page > 1) {
        filtered = allPublished.slice((page - 1) * pageSize);
      }

      const posts = filtered.slice(0, pageSize);
      const hasMore = filtered.length > pageSize;
      return { posts, hasMore };
    } catch (fallbackError) {
      console.error("Firestore Fallback Error:", fallbackError);
      return { posts: [], hasMore: false };
    }
  }
}

/** Fetch only posts from the last 24 hours. */
export async function getLatestNews24hServer(limit = 10): Promise<Post[]> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayTs = Timestamp.fromDate(yesterday);

  try {
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .where("createdAt", ">=", yesterdayTs)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    
    return snapshot.docs.map(docToPost);
  } catch (error) {
    console.warn("Firestore 24h Filter Index missing, using fallback:", error);
    try {
      // Indexless fallback: fetch latest 100 posts (which only needs createdAt index)
      // then filter in-memory for published and date
      const snapshot = await adminDb
        .collection(POSTS_COLLECTION)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();
      
      return snapshot.docs
        .map(docToPost)
        .filter(p => p.published && new Date(p.createdAt) >= yesterday)
        .slice(0, limit);
    } catch (fallbackError) {
      console.error("Firestore Fallback Error (24h Filter):", fallbackError);
      return [];
    }
  }
}

/** Fetch trending posts by likes — for use in Server Components. */
export async function getTrendingPostsServer(count = 5): Promise<Post[]> {
  try {
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .orderBy("likesCount", "desc")
      .limit(count)
      .get();

    return snapshot.docs.map(docToPost);
  } catch (error) {
    console.error("Firestore Index Error (Trending):", error);
    // Fallback: fetch more posts and sort in memory
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .limit(50)
      .get();
    
    return snapshot.docs
      .map(docToPost)
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, count);
  }
}

/** Fetch posts by category — for use in Server Components. */
export async function getPostsByCategoryServer(
  category: string,
  pageSize = 12
): Promise<Post[]> {
  try {
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .where("category", "==", category)
      .orderBy("createdAt", "desc")
      .limit(pageSize)
      .get();

    return snapshot.docs.map(docToPost);
  } catch (error) {
    console.error("Firestore Index Error (Category):", error);
    // Fallback: fetch by category without ordering
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .where("category", "==", category)
      .limit(pageSize * 2)
      .get();
    
    return snapshot.docs
      .map(docToPost)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, pageSize);
  }
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

/** Fetch posts by tag or similar content — for use in Server Components. */
/** Fetch posts by tag or similar content — for use in Server Components. Supports pagination. */
export async function getPostsByTagServer(
  tag: string,
  pageSize = 12,
  page = 1
): Promise<Post[]> {
  const skip = (page - 1) * pageSize;
  const term = tag.toLowerCase().trim();
  const targetSlug = term.replace(/\s+/g, "-");
  const capitalized = term.charAt(0).toUpperCase() + term.slice(1);

  // Common mapping for popular tags to ensure they work in both languages
  const searchTerms = [tag, term, targetSlug, capitalized];
  if (term === "bihar")       searchTerms.push("Bihar", "बिहार");
  if (term === "jharkhand")   searchTerms.push("Jharkhand", "झारखंड");
  if (term === "politics")    searchTerms.push("Politics", "राजनीति");
  if (term === "entertainment") searchTerms.push("Entertainment", "मनोरंजन");
  if (term === "sports")      searchTerms.push("Sports", "खेल");
  if (term === "crime")       searchTerms.push("Crime", "क्राइम");
  if (term === "business")    searchTerms.push("Business", "व्यापार");
  if (term === "education")   searchTerms.push("Education", "शिक्षा");
  if (term === "health")      searchTerms.push("Health", "स्वास्थ्य");
  if (term === "national")    searchTerms.push("National", "राष्ट्रीय");
  if (term === "international") searchTerms.push("International", "अंतरराष्ट्रीय");
  if (term === "patna")       searchTerms.push("Patna", "पटना");
  if (term === "ranchi")      searchTerms.push("Ranchi", "रांची");

  // Variants to maximize matches
  const queryTags = Array.from(new Set(searchTerms)).slice(0, 10);

  try {
    // Attempt standard query using searchTokens (Requires index for array-contains-any + orderBy)
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .where("searchTokens", "array-contains-any", queryTags)
      .orderBy("createdAt", "desc")
      .offset(skip)
      .limit(pageSize)
      .get();

    if (!snapshot.empty) return snapshot.docs.map(docToPost);
    
    // Fallback search across fields
    const s1 = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .where("tags", "array-contains-any", queryTags)
      .orderBy("createdAt", "desc")
      .offset(skip)
      .limit(pageSize)
      .get();
    
    if (!s1.empty) return s1.docs.map(docToPost);

    const s2 = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .where("category", "==", term)
      .orderBy("createdAt", "desc")
      .offset(skip)
      .limit(pageSize)
      .get();
    
    return s2.docs.map(docToPost);

  } catch (err) {
    console.warn("[getPostsByTagServer] Index missing, falling back to scan:", err);
    try {
      // Indexless fallback: fetch latest 300 posts and filter in-memory
      const snapshot = await adminDb
        .collection(POSTS_COLLECTION)
        .where("published", "==", true)
        .orderBy("createdAt", "desc")
        .limit(300)
        .get();
        
      const filtered = snapshot.docs
        .map(docToPost)
        .filter(p => {
          const pTokens = [
            ...(p.tags || []), ...(p.tagsHi || []), ...(p.tagsEn || []), 
            p.category, ...(p.searchTokens || [])
          ].filter(Boolean).map(t => t.toLowerCase());
          
          return queryTags.some(qt => pTokens.includes(qt.toLowerCase()));
        });
        
      return filtered.slice(skip, skip + pageSize);
    } catch (fallbackErr) {
      console.error("[getPostsByTagServer] Fallback failed:", fallbackErr);
      return [];
    }
  }
}

/** Get total count of posts for a specific tag. */
export async function getTotalPostsByTagCountServer(tag: string): Promise<number> {
  const term = tag.toLowerCase().trim();
  const searchTerms = [tag, term, term.replace(/\s+/g, "-")];
  
  if (term === "bihar")       searchTerms.push("Bihar", "बिहार");
  if (term === "jharkhand")   searchTerms.push("Jharkhand", "झारखंड");
  if (term === "politics")    searchTerms.push("Politics", "राजनीति");
  if (term === "entertainment") searchTerms.push("Entertainment", "मनोरंजन");
  if (term === "sports")      searchTerms.push("Sports", "खेल");
  if (term === "crime")       searchTerms.push("Crime", "क्राइम");
  if (term === "business")    searchTerms.push("Business", "व्यापार");
  if (term === "education")   searchTerms.push("Education", "शिक्षा");
  if (term === "health")      searchTerms.push("Health", "स्वास्थ्य");
  if (term === "national")    searchTerms.push("National", "राष्ट्रीय");
  if (term === "international") searchTerms.push("International", "अंतरराष्ट्रीय");
  if (term === "patna")       searchTerms.push("Patna", "पटना");
  if (term === "ranchi")      searchTerms.push("Ranchi", "रांची");

  const queryTags = Array.from(new Set(searchTerms)).slice(0, 10);

  try {
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .where("searchTokens", "array-contains-any", queryTags)
      .count()
      .get();
    
    return snapshot.data().count;
  } catch (_error) {
    // Fallback if index missing
    const snapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .limit(300)
      .get();
    
    return snapshot.docs.filter(doc => {
      const p = doc.data();
      const pTokens = [
        ...(p.tags || []), ...(p.tagsHi || []), ...(p.tagsEn || []), 
        p.category, ...(p.searchTokens || [])
      ].filter(Boolean).map(t => t.toLowerCase());
      
      return queryTags.some(qt => pTokens.includes(qt.toLowerCase()));
    }).length;
  }
}

/** Search posts by title/tags — for use in Server Components. */
export async function searchPostsServer(searchTerm: string): Promise<Post[]> {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return [];
  
  // Split search into words for "contains-any" token search
  const words = term.split(/\s+/).filter(w => w.length > 1).slice(0, 10);
  const targetSlug = term.replace(/\s+/g, "-");
  const queryTags = Array.from(new Set([searchTerm, term, targetSlug, ...words]));

  const exactQueryPromises = [
    // 1. Search tokens (Multi-word support via array-contains-any)
    ...(words.length > 0 ? [adminDb.collection(POSTS_COLLECTION).where("published", "==", true).where("searchTokens", "array-contains-any", words).limit(30).get()] : []),
    // 2. Exact category match
    adminDb.collection(POSTS_COLLECTION).where("published", "==", true).where("category", "==", term).limit(15).get(),
    // 3. Tag matches
    adminDb.collection(POSTS_COLLECTION).where("published", "==", true).where("tags", "array-contains-any", queryTags.slice(0, 10)).limit(15).get(),
  ];

  const settled = await Promise.allSettled(exactQueryPromises);
  const postsMap = new Map<string, Post>();

  settled.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.docs.forEach((d) => {
        const p = docToPost(d);
        (p as any)._searchScore = 80;
        postsMap.set(p.id, p);
      });
    }
  });

  // 4. Broad fuzzy fallback
  try {
    const fuzzySnapshot = await adminDb
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .limit(500)
      .get();

    fuzzySnapshot.docs.forEach((doc) => {
      const post = docToPost(doc);
      if (postsMap.has(post.id)) return;

      const title = (post.title || "").toLowerCase();
      const titleEn = (post.titleEn || "").toLowerCase();
      const titleHi = (post.titleHi || "").toLowerCase();
      const content = (post.content || "").toLowerCase();
      const slug = (post.slug || "").toLowerCase();
      
      let score = 0;
      if (title.includes(term) || titleEn.includes(term) || titleHi.includes(term)) score += 100;
      else if (words.some(w => title.includes(w) || titleEn.includes(w))) score += 40;
      
      if (slug.includes(term) || slug.includes(targetSlug)) score += 50;
      if (content.includes(term)) score += 20;

      if (score > 0) {
        (post as any)._searchScore = score;
        postsMap.set(post.id, post);
      }
    });
  } catch (err) {
    console.error("[searchPostsServer] Fuzzy failed:", err);
  }

  return Array.from(postsMap.values())
    .sort((a: any, b: any) => {
      const scoreA = a._searchScore || 0;
      const scoreB = b._searchScore || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 40);
}

/** Fetch all published slugs and their update times — for Sitemap. */
export async function getAllPostsSitemapDataServer(): Promise<{ slug: string; updatedAt: string }[]> {
  const snapshot = await adminDb
    .collection(POSTS_COLLECTION)
    .where("published", "==", true)
    .select("slug", "updatedAt")
    .get();

  return snapshot.docs.map((d) => {
    const data = d.data();
    let updatedAt = new Date().toISOString();
    if (data.updatedAt instanceof Timestamp) {
      updatedAt = data.updatedAt.toDate().toISOString();
    } else if (typeof data.updatedAt === "string") {
      updatedAt = data.updatedAt;
    }
    return {
      slug: data.slug as string,
      updatedAt,
    };
  }).filter((p) => p.slug);
}
