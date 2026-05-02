import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import { getPostBySlugServer, getAllSlugsServer } from "@/lib/firebase/posts-admin";
import Badge from "@/components/ui/Badge";
import LikeButton from "@/components/post/LikeButton";
import ShareButton from "@/components/post/ShareButton";
import CommentSection from "@/components/post/CommentSection";
import ImageDownloadButton from "@/components/post/ImageDownloadButton";
import TranslatableText from "@/components/ui/TranslatableText";
import { SITE_NAME, SITE_URL } from "@/lib/utils/constants";
import { formatDate, formatDateEn } from "@/lib/utils/formatDate";
import { getPostTitle, getPostContent, getPostTags } from "@/lib/utils/postHelpers";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// SSG with ISR fallback
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugsServer();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get("language")?.value || "hi";
  
  try {
    const post = await getPostBySlugServer(slug);
    if (!post) return { title: "Post Not Found" };
    const displayTitle = getPostTitle(post, lang === "en" ? "en" : "hi");
    const displayTags  = getPostTags(post,  lang === "en" ? "en" : "hi");

    return {
      title: displayTitle,
      description: `${displayTitle} — ${displayTags.join(", ")} | ${SITE_NAME}`,
      keywords: [...displayTags, "Bihar news", "Jharkhand news"],
      openGraph: {
        title: displayTitle,
        description: `${displayTitle} | ${SITE_NAME}`,
        url: `${SITE_URL}/post/${post.slug}`,
        images: post.imageUrl ? [{ url: post.imageUrl, alt: displayTitle }] : [],
        type: "article",
        publishedTime: post.createdAt,
        tags: displayTags,
      },
      twitter: {
        card: "summary_large_image",
        title: displayTitle,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
      alternates: {
        canonical: `${SITE_URL}/post/${post.slug}`,
      },
    };
  } catch {
    return { title: SITE_NAME };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get("language")?.value || "hi";
  
  let post;

  try {
    post = await getPostBySlugServer(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  const langKey = lang === "en" ? "en" : "hi";
  const displayTitle   = getPostTitle(post, langKey);
  const displayContent = getPostContent(post, langKey);
  const displayTags    = getPostTags(post, langKey);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: displayTitle,
    image: post.imageUrl ? [post.imageUrl] : [],
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    keywords: displayTags.join(", "),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/post/${post.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 mb-6 transition-colors group font-bold"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <TranslatableText tKey="allNews" />
        </Link>

        <article>
          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {displayTags.map((tag) => (
                <Badge
                  key={tag}
                  label={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  variant="red"
                />
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            {displayTitle}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 dark:text-gray-300 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-red-600" />
              <span className="font-bold">
                {lang === 'en' ? formatDateEn(post.createdAt) : formatDate(post.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              <Eye className="w-4 h-4 text-red-600" />
              <span className="font-bold">
                {post.viewsCount} <TranslatableText tKey="views" />
              </span>
            </div>
          </div>

          {/* Hero Image */}
          {post.imageUrl && (
            <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md bg-gray-50 flex justify-center group/image">
              <ImageDownloadButton imageUrl={post.imageUrl} fileName={post.slug} />
              <Image
                src={post.imageUrl}
                alt={displayTitle}
                width={1200}
                height={800}
                className="w-full h-auto object-contain max-h-[70vh]"
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          )}

          {/* Video */}
          {post.videoUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-lg">
              <video
                src={post.videoUrl}
                controls
                className="w-full h-full"
                poster={post.imageUrl}
              />
            </div>
          )}

          {/* Body Content */}
          <div className="prose-custom max-w-none mb-10">
            {displayContent.split('\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;
              
              // Detect section headers: lines starting with an emoji OR short lines with specific keywords
              const isHeader = /^[\u{1F300}-\u{1F9FF}].*/u.test(trimmed) || 
                               trimmed.includes('News Headlines') || 
                               trimmed.includes('Detailed News Report') ||
                               (trimmed.length < 50 && trimmed.endsWith(':') && !trimmed.includes('Location') && !trimmed.includes('Date'));

              if (isHeader) {
                return (
                  <h2 key={index} className="text-xl sm:text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-4 my-8 flex items-center gap-3 bg-gray-50 py-2 pr-4 rounded-r-lg">
                    {trimmed}
                  </h2>
                );
              }

              // Handle metadata lines like Location: or Date:
              if (trimmed.includes('Location:') || trimmed.includes('Date:')) {
                return (
                  <div key={index} className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50/50 px-3 py-1.5 rounded border border-red-100 mb-4 inline-flex items-center gap-2 mr-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    {trimmed}
                  </div>
                );
              }

              // Handle list-like items (starting with - or *)
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <li key={index} className="ml-6 mb-2 list-none relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-2 before:h-2 before:bg-red-600 before:rounded-full">
                    {trimmed.substring(2)}
                  </li>
                );
              }

              return <p key={index} className="mb-6 text-gray-950 leading-relaxed text-xl font-medium">{trimmed}</p>;
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 py-6 border-t border-b border-gray-200 dark:border-gray-700 mb-8">
            <LikeButton postId={post.id} initialLikesCount={post.likesCount} />
            <ShareButton
              title={displayTitle}
              url={`${SITE_URL}/post/${post.slug}`}
            />
          </div>

          {/* Comments */}
          <CommentSection postId={post.id} />
        </article>
      </div>
    </>
  );
}
