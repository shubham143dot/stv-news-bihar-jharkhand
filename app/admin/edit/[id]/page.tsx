"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import { getPostById, Post } from "@/lib/firebase/posts";
import { useLanguage } from "@/lib/context/LanguageContext";
import Spinner from "@/components/ui/Spinner";

export default function EditPostPage() {
  const { id } = useParams() as { id: string };
  const { t } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await getPostById(id);
        if (data) setPost(data);
        else notFound();
      } catch (err) {
        console.error(err);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!post) return notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <span className="w-1 h-7 bg-red-600 rounded-full inline-block" />
        {t("editPost")}
      </h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <PostForm post={post} />
      </div>
    </div>
  );
}
