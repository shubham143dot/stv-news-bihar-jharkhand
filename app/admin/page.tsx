// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle, Edit3, Trash2, Eye, Heart, MessageCircle,
  BarChart3, Newspaper, AlertTriangle, X, CheckCircle2,
} from "lucide-react";
import { Post, getPosts, deletePost } from "@/lib/firebase/posts";
import { fetchDashboardStats } from "@/app/actions/stats";
import { formatDateEn } from "@/lib/utils/formatDate";
import Spinner from "@/components/ui/Spinner";
import { useLanguage } from "@/lib/context/LanguageContext";

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({
  post,
  onConfirm,
  onCancel,
  deleting,
}: {
  post: Post;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 fade-in duration-200">
        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>

        <h2 className="text-lg font-black text-gray-900 dark:text-white text-center mb-1">
          {t("deletePostConfirm")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          {t("permanentAction")}
        </p>

        {/* Post preview */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-5 border border-gray-100 dark:border-gray-700">
          {post.imageUrl && (
            <div className="relative w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="48px" />
            </div>
          )}
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 flex-1">
            {post.title}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <><Spinner size="sm" /> {t("deleting")}</>
            ) : (
              <><Trash2 className="w-4 h-4" /> {t("yesDelete")}</>
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-2xl shadow-2xl text-sm font-semibold animate-in slide-in-from-bottom-4 fade-in duration-200">
      <CheckCircle2 className="w-4 h-4" />
      {msg}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast]       = useState({ msg: "", visible: false });

  const [stats, setStats]       = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
    totalComments: 0,
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch all posts (including drafts) and global aggregation stats
      // We use a Server Action for stats to ensure reliability and bypass client limits
      const [{ posts: fetched }, globalStats] = await Promise.all([
        getPosts(undefined, 100, true),
        fetchDashboardStats()
      ]);
      setPosts(fetched);
      setStats(globalStats);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const showToast = (msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget.id);
      await fetchPosts(); // Re-fetch to update both the list and the global stats
      showToast(t("postDeleted"));
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(t("deleteFailed"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // We now use the stats state populated by getGlobalStats() for true collection totals
  // but keep these for quick checks if needed (though they are redundant now)
  const { totalPosts, totalLikes, totalViews, totalComments } = stats;

  return (
    <>
      <Toast msg={toast.msg} visible={toast.visible} />

      {deleteTarget && (
        <DeleteModal
          post={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      <div className="space-y-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-red-600" />
              {t("postsDashboard")}
            </h1>
              {totalPosts} {t("postsCountDescription")}
          </div>
          <Link
            href="/admin/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-red-200 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            {t("newPost")}
          </Link>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t("totalPosts"),   value: totalPosts,      icon: <Newspaper   className="w-5 h-5 text-blue-500" />,   bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: t("totalLikes"),   value: totalLikes,      icon: <Heart       className="w-5 h-5 text-red-500" />,    bg: "bg-red-50 dark:bg-red-900/20" },
            { label: t("totalViews"),   value: totalViews,      icon: <BarChart3   className="w-5 h-5 text-green-500" />,  bg: "bg-green-50 dark:bg-green-900/20" },
            { label: t("comments"),     value: totalComments,   icon: <MessageCircle className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50 dark:bg-purple-900/20" },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className={`inline-flex p-2 rounded-xl mb-2 ${stat.bg}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Posts List ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">
              {t("allPosts")}
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full font-medium">
              {posts.length} {t("total")}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-5xl mb-3">📭</p>
              <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">{t("noPosts")}</p>
              <Link href="/admin/create" className="text-sm text-red-600 hover:underline font-medium">
                {t("createFirst")}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {posts.map((post, idx) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group"
                >
                  {/* Serial number */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-xs font-black text-gray-500 dark:text-gray-400">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  {post.imageUrl ? (
                    <div className="relative w-14 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                      <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="56px" />
                    </div>
                  ) : (
                    <div className="w-14 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                      <Newspaper className="w-5 h-5 text-gray-300" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-0.5">
                      {post.title}
                    </p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                      {/* Status badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        post.status === "published"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : post.status === "draft"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      }`}>
                        {post.status === "published"
                          ? t("published")
                          : post.status === "draft"
                          ? t("draft")
                          : t("scheduled")}
                      </span>
                      {/* Category */}
                      {post.category && (
                        <span className="text-[11px] text-gray-400 font-medium">
                          {t(post.category)}
                        </span>
                      )}
                      {/* Stats */}
                      <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400">
                        <Heart className="w-3 h-3" />{post.likesCount}
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400">
                        <Eye className="w-3 h-3" />{post.viewsCount}
                      </span>
                      {/* Date */}
                      <span className="hidden lg:block text-[11px] text-gray-400">
                        {formatDateEn(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons — always visible on mobile, visible on hover for desktop */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* View */}
                    <Link
                      href={`/post/${post.slug}`}
                      target="_blank"
                      title={t("viewPost")}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Edit */}
                    <Link
                      href={`/admin/edit/${post.id}`}
                      title={t("editPost")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-all border border-green-200 dark:border-green-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t("edit")}</span>
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(post)}
                      title={t("deletePost")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all border border-red-200 dark:border-red-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t("delete")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
