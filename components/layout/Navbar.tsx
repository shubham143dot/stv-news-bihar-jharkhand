// components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { NAV_LINKS } from "@/lib/utils/constants";
import SearchBar from "@/components/search/SearchBar";

export default function Navbar() {
  const { user, userProfile, isAdmin, signIn, signOut } = useAuth();
  const { language, setLanguage, t, mounted } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      {/* ── Breaking news ticker ── */}
      <div className="bg-red-700 text-white text-xs py-1.5 overflow-hidden whitespace-nowrap notranslate">
        <div className="inline-flex animate-marquee">
          <span className="mx-12">🔴 {t("liveBreaking")} — {t("heroTitle")} {t("heroSubtitle")} | {t("stvNews")}</span>
          <span className="mx-12">📢 {t("followForLatest")}</span>
          <span className="mx-12">🗞️ {t("breakingNewsSub")}</span>
          <span className="mx-12">🔴 {t("liveBreaking")} — {t("heroTitle")} {t("heroSubtitle")} | {t("stvNews")}</span>
          <span className="mx-12">📢 {t("followForLatest")}</span>
          <span className="mx-12">🗞️ {t("breakingNewsSub")}</span>
        </div>
      </div>

      {/* ── Main header ── */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.10)] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[70px] gap-4">

            {/* Logo — show the full badge image without cropping */}
            <Link href="/" className="flex items-center flex-shrink-0 group notranslate">
              {/* Circular clip shows the badge — the JPG badge is centered at ~50% x, 45% y */}
              <div className="relative h-[62px] w-[62px] flex-shrink-0 rounded-full overflow-hidden ring-[3px] ring-yellow-400 shadow-lg">
                <Image
                  src="/logo.jpg"
                  alt="STV News Bihar Jharkhand"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "50% 45%" }}
                  priority
                  sizes="62px"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 text-[14px] font-bold text-gray-800 hover:text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200 group"
                >
                  {t(link.key || "") || (language === "en" ? link.labelEn : link.label) || link.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-red-700 rounded-full group-hover:w-3/4 transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-800" />
              </button>

              {/* User - Hidden in main navbar, moved to menu */}
              {user ? (
                <div className="hidden lg:block relative group">
                  {/* Keep only profile pic on desktop if they want, but user said put INSIDE hamburger. 
                      So I will hide it completely here. */}
                </div>
              ) : null}

              {/* Hamburger Button - Now always visible */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors bg-gray-50 border border-gray-100 shadow-sm"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>

          {/* Search expand */}
          {searchOpen && (
            <div className="pb-4 pt-2 border-t border-gray-100">
              <SearchBar autoFocus onClose={() => setSearchOpen(false)} />
            </div>
          )}
        </div>

        {/* Full-screen / Overlay Menu */}
        {menuOpen && (
          <div className="absolute right-4 top-[75px] w-[300px] lg:w-[350px] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* 1. Header/Profile Section */}
            <div className="p-5 bg-gray-50 border-b border-gray-100">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Profile"
                          width={56}
                          height={56}
                          className="rounded-full ring-2 ring-red-500 ring-offset-2 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-inner">
                          <User className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-extrabold text-gray-900 truncate leading-tight">{user.displayName || "User"}</p>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-red-200">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 font-bold truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("signOut")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg mb-1">STV News</h3>
                  <p className="text-xs text-gray-600 font-bold mb-5">{t("loginToContinue") || "Login to continue"}</p>
                  <button
                    onClick={() => { signIn(); setMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-700 to-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-100 hover:shadow-red-200 active:scale-95 transition-all"
                  >
                    <User className="w-5 h-5" />
                    {t("login")}
                  </button>
                </div>
              )}
            </div>

            {/* 2. Admin Section (If Admin) */}
            {user && isAdmin && (
              <div className="px-4 pt-4 pb-2 bg-red-50/50 border-b border-red-100/50">
                <p className="px-3 text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3">
                  {t("adminSection")}
                </p>
                <div className="space-y-1">
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-red-700 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100"
                  >
                    <Settings className="w-4 h-4" />
                    {t("dashboard")}
                  </Link>
                  <Link
                    href="/admin/create"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-red-700 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                    {t("createPost")}
                  </Link>
                </div>
              </div>
            )}

            {/* 3. Navigation Links */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] p-4">
              <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                {t("categories")}
              </p>
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center px-4 py-3.5 text-[16px] font-black text-gray-900 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    {t(link.key || "") || (language === "en" ? link.labelEn : link.label) || link.label}
                  </Link>
                ))}
              </div>

              {/* 3. Language Switcher */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  {t("chooseLanguage")}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {mounted ? (
                    <>
                      <button
                        onClick={() => { setLanguage("hi"); setMenuOpen(false); }}
                        className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                          language === "hi"
                            ? "bg-red-50 border-red-600 text-red-700 shadow-lg shadow-red-100"
                            : "bg-white border-gray-100 text-gray-800 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-3xl">🇮🇳</span>
                        <span className="text-[13px] font-black">हिन्दी</span>
                      </button>
                      <button
                        onClick={() => { setLanguage("en"); setMenuOpen(false); }}
                        className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                          language === "en"
                            ? "bg-red-50 border-red-600 text-red-700 shadow-lg shadow-red-100"
                            : "bg-white border-gray-100 text-gray-800 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-3xl">🇺🇸</span>
                        <span className="text-[13px] font-black">English</span>
                      </button>
                    </>
                  ) : (
                    <div className="col-span-2 py-4 flex justify-center">
                      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Footer Branding */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">STV News Bihar Jharkhand</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
