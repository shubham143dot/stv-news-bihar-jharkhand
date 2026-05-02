// app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  Home, 
  LogOut,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import PageSpinner from "@/components/ui/PageSpinner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, isAdmin, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) return <PageSpinner />;
  if (!user || !isAdmin) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Admin top bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-6">
          <span className="font-black text-red-400 text-lg">{t("adminPanelTitle")}</span>
          <nav className="hidden sm:flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t("dashboardTitle")}
            </Link>
            <Link
              href="/admin/create"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              {t("newPostTitle")}
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              <Home className="w-4 h-4" />
              {t("viewSite")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:inline">
            {userProfile?.name}
          </span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t("signOut")}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
