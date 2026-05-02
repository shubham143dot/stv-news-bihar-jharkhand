"use client";

import PostForm from "@/components/admin/PostForm";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function CreatePostPage() {
  const { t } = useLanguage();
  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <span className="w-1 h-7 bg-red-600 rounded-full inline-block" />
        {t("createPost")}
      </h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <PostForm />
      </div>
    </div>
  );
}
