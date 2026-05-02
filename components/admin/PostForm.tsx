// components/admin/PostForm.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, Save, Loader2, CheckCircle2, AlertCircle,
  Clock, FileText, Send, ChevronDown, Calendar,
} from "lucide-react";
import ImageKitUploader from "./ImageKitUploader";
import { createPost, updatePost, Post, PostStatus } from "@/lib/firebase/posts";
import { getCustomCategories, saveCategory, removeCategory as deleteCategory, Category } from "@/lib/firebase/categories";
import { generateSlug } from "@/lib/utils/slugify";
import { useLanguage } from "@/lib/context/LanguageContext";

// ─── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "bihar",         label: "बिहार",        labelEn: "Bihar" },
  { value: "jharkhand",    label: "झारखंड",        labelEn: "Jharkhand" },
  { value: "politics",     label: "राजनीति",       labelEn: "Politics" },
  { value: "entertainment",label: "मनोरंजन",       labelEn: "Entertainment" },
  { value: "sports",       label: "खेल",           labelEn: "Sports" },
  { value: "crime",        label: "क्राइम",         labelEn: "Crime" },
  { value: "business",     label: "व्यापार",        labelEn: "Business" },
  { value: "education",    label: "शिक्षा",         labelEn: "Education" },
  { value: "health",       label: "स्वास्थ्य",       labelEn: "Health" },
  { value: "national",     label: "राष्ट्रीय",       labelEn: "National" },
  { value: "international",label: "अंतरराष्ट्रीय",   labelEn: "International" },
];

// ─── Toast ─────────────────────────────────────────────────────────────────────
interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
}

function Toast({ toast }: { toast: ToastState }) {
  if (!toast.visible) return null;
  const colors = {
    success: "bg-green-600 text-white",
    error:   "bg-red-600 text-white",
    info:    "bg-blue-600 text-white",
  };
  const icons = {
    success: <CheckCircle2 className="w-4 h-4" />,
    error:   <AlertCircle className="w-4 h-4" />,
    info:    <Clock className="w-4 h-4" />,
  };
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-in slide-in-from-bottom-4 fade-in duration-300 ${colors[toast.type]}`}>
      {icons[toast.type]}
      {toast.message}
    </div>
  );
}

// ─── Field error indicator ─────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {msg}
    </p>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface PostFormProps {
  post?: Post;
}

// ─── Validation ────────────────────────────────────────────────────────────────
interface FieldErrors {
  title?: string;
  content?: string;
  category?: string;
  image?: string;
  scheduleDate?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function PostForm({ post }: PostFormProps) {
  const { t, language } = useLanguage();
  const router = useRouter();

  // form state
  const [title,        setTitle]        = useState(post?.title    || "");
  const [titleHi,      setTitleHi]      = useState(post?.titleHi  || post?.title || "");
  const [titleEn,      setTitleEn]      = useState(post?.titleEn  || "");
  const [content,      setContent]      = useState(post?.content  || "");
  const [contentHi,    setContentHi]    = useState(post?.contentHi || post?.content || "");
  const [contentEn,    setContentEn]    = useState(post?.contentEn || "");
  const [tags,         setTags]         = useState<string[]>(post?.tags || []);
  const [tagsHi,       setTagsHi]       = useState<string[]>(post?.tagsHi || post?.tags || []);
  const [tagsEn,       setTagsEn]       = useState<string[]>(post?.tagsEn || []);
  const [category,     setCategory]     = useState(post?.category || "");
  const [city,         setCity]         = useState(post?.city     || "");
  const [state,        setState]        = useState(post?.state    || "");
  const [eventDate,    setEventDate]    = useState(post?.eventDate || "");
  // Parse stored eventTime (HH:MM) back to 12h parts
  const parseStoredTime = (t: string) => {
    if (!t) return { h: "", m: "00", p: "AM" };
    const [hh, mm] = t.split(":");
    const hour24 = parseInt(hh, 10);
    return {
      h: String(hour24 % 12 || 12),
      m: mm || "00",
      p: hour24 >= 12 ? "PM" : "AM",
    };
  };
  const initTime = parseStoredTime(post?.eventTime || "");
  const [timeHour,   setTimeHour]   = useState(initTime.h);
  const [timeMinute, setTimeMinute] = useState(initTime.m);
  const [timePeriod, setTimePeriod] = useState<"AM"|"PM">(initTime.p as "AM"|"PM");
  // Derived eventTime in HH:MM (24h) for storage
  const eventTime = timeHour
    ? (() => {
        let h = parseInt(timeHour, 10);
        if (timePeriod === "PM" && h !== 12) h += 12;
        if (timePeriod === "AM" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${timeMinute}`;
      })()
    : "";
  const [tagInput,     setTagInput]     = useState("");
  const [imageUrl,     setImageUrl]     = useState(post?.imageUrl || "");
  const [videoUrl,     setVideoUrl]     = useState(post?.videoUrl || "");
  const [publishMode,  setPublishMode]  = useState<PostStatus>(post?.status || "published");
  const [scheduleDate, setScheduleDate] = useState(
    post?.publishAt ? post.publishAt.slice(0, 16) : ""
  );

  // UI state
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [fieldErrors,    setFieldErrors]    = useState<FieldErrors>({});
  const [toast,          setToast]          = useState<ToastState>({ message: "", type: "success", visible: false });
  const [modeOpen,       setModeOpen]       = useState(false);
  const [newCatInput,    setNewCatInput]    = useState("");
  const [customCats,     setCustomCats]     = useState<Category[]>([]);
  const [showNewCatBox,  setShowNewCatBox]  = useState(false);
  const [catLoading,     setCatLoading]     = useState(false); // saving a new cat
  const newCatRef = useRef<HTMLInputElement>(null);

  // Load custom categories from Firestore on mount
  useEffect(() => {
    getCustomCategories()
      .then(cats => setCustomCats(cats))
      .catch(() => {}); // fail silently
  }, []);

  // refs for auto-scroll
  const titleRef    = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const imageRef    = useRef<HTMLDivElement>(null);

  // is form ready to publish? — check the active language's required fields
  const currentTitle   = language === "hi" ? titleHi   : (titleEn   || titleHi);
  const currentContent = language === "hi" ? contentHi : (contentEn || contentHi);
  const isReady = currentTitle.trim() && currentContent.trim() && category && imageUrl;

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: ToastState["type"] = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }, []);

  // ── Tag helpers ────────────────────────────────────────────────────────────
  const addTag = () => {
    const v = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (v && !tags.includes(v)) {
      setTags(prev => [...prev, v]);
      // mirror to the current language's tag list
      if (language === "hi") setTagsHi(prev => [...prev, v]);
      else setTagsEn(prev => [...prev, v]);
    }
    setTagInput("");
  };
  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    setTagsHi(prev => prev.filter(t => t !== tag));
    setTagsEn(prev => prev.filter(t => t !== tag));
  };
  const handleTagKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  };

  // ── Custom category helpers (Firestore-backed) ────────────────────────────
  const addCustomCategory = async () => {
    const raw = newCatInput.trim();
    if (!raw) return;
    const value = raw.toLowerCase().replace(/\s+/g, "-");
    // Don't duplicate built-in or custom
    const alreadyExists =
      CATEGORIES.some(c => c.value === value) ||
      customCats.some(c => c.value === value);

    if (!alreadyExists) {
      const newCat: Category = {
        value,
        label: raw,       // treat input as both Hindi and English
        labelEn: raw,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      // Optimistic update
      setCustomCats(prev => [...prev, newCat]);
      // Persist to Firestore
      setCatLoading(true);
      try {
        await saveCategory(newCat);
      } catch (e) {
        console.error("Category save failed:", e);
      } finally {
        setCatLoading(false);
      }
    }
    setCategory(value);
    setFieldErrors(er => ({ ...er, category: undefined }));
    setNewCatInput("");
    setShowNewCatBox(false);
  };
  const handleNewCatKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addCustomCategory(); }
    if (e.key === "Escape") { setShowNewCatBox(false); setNewCatInput(""); }
  };
  const removeCustomCat = async (value: string) => {
    // Optimistic update
    setCustomCats(prev => prev.filter(c => c.value !== value));
    if (category === value) setCategory("");
    // Delete from Firestore
    try { await deleteCategory(value); } catch (e) { console.error(e); }
  };

  // ── Uploader callback ──────────────────────────────────────────────────────
  const handleUpload = (url: string, type: "image" | "video") => {
    if (type === "video") setVideoUrl(url);
    else { setImageUrl(url); setFieldErrors(e => ({ ...e, image: undefined })); }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!currentTitle.trim())   { errs.title    = t("title") + " " + (language === "hi" ? "जरूरी है" : "is required"); }
    if (!currentContent.trim()) { errs.content  = t("content") + " " + (language === "hi" ? "जरूरी है" : "is required"); }
    if (!category)       { errs.category = t("selectCategory"); }
    if (!imageUrl)       { errs.image    = language === "hi" ? "फोटो अपलोड करें" : "Featured image is required"; }
    if (publishMode === "scheduled" && !scheduleDate) {
      errs.scheduleDate = t("publishDate");
    }
    setFieldErrors(errs);

    // auto-scroll to first error
    const firstRef = errs.title ? titleRef : errs.content ? contentRef : errs.category ? categoryRef : errs.image ? imageRef : null;
    if (firstRef?.current) {
      firstRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (mode: PostStatus = publishMode) => {
    if (saving || saved) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const slug = post?.slug || generateSlug(titleHi || titleEn || title);
      // Always persist bilingual data. Use the current language's value as primary.
      const newTitleHi = language === "hi" ? currentTitle.trim() : (titleHi.trim() || currentTitle.trim());
      const newTitleEn = language === "en" ? currentTitle.trim() : titleEn.trim();
      const newContentHi = language === "hi" ? currentContent.trim() : (contentHi.trim() || currentContent.trim());
      const newContentEn = language === "en" ? currentContent.trim() : contentEn.trim();

      const input = {
        // Keep `title` as the Hindi title for legacy/server-side rendering
        title: newTitleHi || newTitleEn,
        titleHi: newTitleHi || undefined,
        titleEn: newTitleEn || undefined,
        slug,
        content: newContentHi || newContentEn,
        contentHi: newContentHi || undefined,
        contentEn: newContentEn || undefined,
        category,
        city:      city.trim()      || undefined,
        state:     state.trim()     || undefined,
        eventDate: eventDate        || undefined,
        eventTime: eventTime        || undefined,
        tags: tagsHi.length ? tagsHi : tags,
        tagsHi: tagsHi.length ? tagsHi : undefined,
        tagsEn: tagsEn.length ? tagsEn : undefined,
        imageUrl,
        videoUrl,
        status: mode,
        publishAt: mode === "scheduled" ? scheduleDate : undefined,
      };

      if (post) {
        await updatePost(post.id, input);
      } else {
        await createPost(input);
      }

      // Revalidation
      const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET;
      if (secret && mode === "published") {
        const revalidateTargets = [
          `/api/revalidate?secret=${secret}&slug=${slug}`,
          `/api/revalidate?secret=${secret}`, 
          ...(category ? [`/api/revalidate?secret=${secret}&tag=${category}`] : []),
        ];
        revalidateTargets.forEach(url =>
          fetch(url, { method: "POST" }).catch(() => {})
        );
      }

      setSaved(true);
      const msg =
        mode === "draft"     ? t("draftSaved")
        : mode === "scheduled" ? t("postScheduled")
        : t("postPublished");

      showToast(msg, mode === "draft" ? "info" : "success");
      setTimeout(() => router.push("/admin"), 1800);
    } catch (err) {
      console.error(err);
      showToast(t("errorOccurred"), "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Publish button inner content ───────────────────────────────────────────
  const publishBtnContent = () => {
    if (saved)   return <><CheckCircle2 className="w-4 h-4" /> {t("done")}</>;
    if (saving)  return <><Loader2 className="w-4 h-4 animate-spin" /> {t("saving")}</>;
    const modeLabel: Record<PostStatus, string> = {
      published: t("publishNow"),
      draft:     t("saveDraft"),
      scheduled: t("schedule"),
    };
    const icon: Record<PostStatus, React.ReactNode> = {
      published: <Send className="w-4 h-4" />,
      draft:     <FileText className="w-4 h-4" />,
      scheduled: <Calendar className="w-4 h-4" />,
    };
    return <>{icon[publishMode]} {modeLabel[publishMode]}</>;
  };

  const btnColor = saved ? "bg-green-600 hover:bg-green-700" :
    publishMode === "draft" ? "bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500" :
    "bg-red-600 hover:bg-red-700";

  const categoryLabel = (val: string) => {
    const cat = CATEGORIES.find(c => c.value === val);
    return cat ? (language === "hi" ? cat.label : cat.labelEn) : t("selectCategory");
  };

  return (
    <>
      <Toast toast={toast} />

      {/* ── Sticky Publish Bar ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shadow-2xl">
        <button
          type="button"
          onClick={() => handleSubmit("draft")}
          disabled={saving || saved}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          {t("saveDraft")}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(publishMode)}
          disabled={saving || saved || !isReady}
          className={`flex-[2] flex items-center justify-center gap-2 py-3 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.97] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${btnColor}`}
        >
          {publishBtnContent()}
        </button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="space-y-6 pb-24 sm:pb-0"
      >
        {/* ── Desktop sticky toolbar ─────────────────────────────────────── */}
        <div className="hidden sm:flex items-center justify-between sticky top-[72px] z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md -mx-6 px-6 py-3 border-b border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">
            {post ? t("editPost") : t("createPost")}
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={saving || saved}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {t("saveDraft")}
            </button>

            <div className="relative">
              <div className="flex rounded-xl overflow-hidden shadow-md">
                <button
                  type="button"
                  onClick={() => handleSubmit(publishMode)}
                  disabled={saving || saved || !isReady}
                  className={`flex items-center gap-2 px-5 py-2 text-white font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${btnColor}`}
                >
                  {publishBtnContent()}
                </button>
                <button
                  type="button"
                  onClick={() => setModeOpen(o => !o)}
                  disabled={saving || saved}
                  className={`px-2 py-2 text-white border-l border-white/20 transition-colors ${btnColor}`}
                  aria-label="Change publish mode"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${modeOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {modeOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {([
                    { mode: "published" as PostStatus, label: t("publishNow"),  icon: <Send className="w-4 h-4 text-red-500" /> },
                    { mode: "draft"     as PostStatus, label: t("saveDraft"), icon: <FileText className="w-4 h-4 text-gray-500" /> },
                    { mode: "scheduled" as PostStatus, label: t("schedule"),       icon: <Calendar className="w-4 h-4 text-blue-500" /> },
                  ] as const).map(({ mode, label, icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setPublishMode(mode); setModeOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${publishMode === mode ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {icon}
                      {label}
                      {publishMode === mode && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-red-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close dropdown when clicking outside */}
        {modeOpen && <div className="fixed inset-0 z-30" onClick={() => setModeOpen(false)} />}

        {/* ── Schedule date/time picker ──────────────────────────────────── */}
        {publishMode === "scheduled" && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                {t("publishDate")}
              </label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={e => { setScheduleDate(e.target.value); setFieldErrors(er => ({ ...er, scheduleDate: undefined })); }}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FieldError msg={fieldErrors.scheduleDate} />
            </div>
          </div>
        )}

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <div ref={titleRef}>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            {t("title")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={currentTitle}
            onChange={e => {
              const val = e.target.value;
              if (language === "hi") setTitleHi(val);
              else setTitleEn(val);
              if (val.trim()) setFieldErrors(er => ({ ...er, title: undefined }));
            }}
            placeholder={t("titlePlaceholder")}
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg transition-colors ${fieldErrors.title ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700"}`}
          />
          <FieldError msg={fieldErrors.title} />
        </div>

        {/* ── Category ───────────────────────────────────────────────────── */}
        <div ref={categoryRef}>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t("category")} <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => { setShowNewCatBox(s => !s); setTimeout(() => newCatRef.current?.focus(), 50); }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
            >
              <Plus className="w-3 h-3" />
              {t("createCategory")}
            </button>
          </div>

          {/* Inline new-category creator */}
          {showNewCatBox && (
            <div className="mb-3 flex gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl animate-in fade-in slide-in-from-top-1 duration-150">
              <input
                ref={newCatRef}
                type="text"
                value={newCatInput}
                onChange={e => setNewCatInput(e.target.value)}
                onKeyDown={handleNewCatKey}
                placeholder={t("newCategory") + "..."}
                maxLength={30}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={addCustomCategory}
                disabled={!newCatInput.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {catLoading ? t("saving") : t("add") || "Add"}
              </button>
              <button
                type="button"
                onClick={() => { setShowNewCatBox(false); setNewCatInput(""); }}
                className="px-2 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Category grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => { setCategory(cat.value); setFieldErrors(er => ({ ...er, category: undefined })); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  category === cat.value
                    ? "bg-red-600 text-white border-red-600 shadow-md scale-105"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-600"
                }`}
              >
                {t(cat.value)}
              </button>
            ))}

            {/* Custom categories */}
            {customCats.map(cat => (
              <div
                key={cat.value}
                className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  category === cat.value
                    ? "bg-red-600 text-white border-red-600 shadow-md"
                    : "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:border-purple-400"
                }`}
              >
                <button
                  type="button"
                  onClick={() => { setCategory(cat.value); setFieldErrors(er => ({ ...er, category: undefined })); }}
                  className="flex-1 text-left truncate"
                  title={cat.label}
                >
                  {language === "hi" ? cat.label : (cat.labelEn || cat.label)}
                </button>
                <button
                  type="button"
                  onClick={() => removeCustomCat(cat.value)}
                  className={`ml-1 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ${
                    category === cat.value ? "text-white" : "text-purple-500 dark:text-purple-400"
                  }`}
                  title={t("deletePost")}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <FieldError msg={fieldErrors.category} />
        </div>

        {/* ── Location & Event Time ─────────────────────────────────────── */}
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {t("locationAndTime")}
              <span className="ml-2 text-[10px] font-medium text-gray-400">{t("optional")}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                🏙️&nbsp;{t("city")}
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder={language === "hi" ? "जैसे: पटना, राँची..." : "e.g. Patna, Ranchi..."}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                🗺️&nbsp;{t("state")}
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("selectState")}</option>
                {[
                  ["Bihar","bihar"],
                  ["Jharkhand","jharkhand"],
                  ["Uttar Pradesh","stateUP"],
                  ["Delhi","stateDelhi"],
                  ["West Bengal","stateWB"],
                  ["Maharashtra","stateMH"],
                  ["Madhya Pradesh","stateMP"],
                  ["Rajasthan","stateRJ"],
                  ["Gujarat","stateGJ"],
                  ["Punjab","statePB"],
                  ["Haryana","stateHR"],
                  ["Odisha","stateOD"],
                  ["Chhattisgarh","stateCH"],
                  ["Uttarakhand","stateUK"],
                  ["Assam","stateAS"],
                  ["Other","other"],
                ].map(([en, key]) => (
                  <option key={key} value={en}>{t(key)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                📅&nbsp;{t("eventDate")}
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                ⏰&nbsp;{t("eventTime")}
              </label>
              <div className="flex gap-2">
                <select
                  value={timeHour}
                  onChange={e => setTimeHour(e.target.value)}
                  className="flex-1 px-2 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">HH</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={String(h)}>{String(h).padStart(2, "0")}</option>
                  ))}
                </select>
                <select
                  value={timeMinute}
                  onChange={e => setTimeMinute(e.target.value)}
                  className="flex-1 px-2 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  {(["AM", "PM"] as const).map(period => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setTimePeriod(period)}
                      className={`px-3 py-2.5 text-xs font-bold transition-colors ${
                        timePeriod === period
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      {language === "hi"
                        ? (period === "AM" ? "पूर्वाह्न" : "अपराह्न")
                        : period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div ref={contentRef}>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            {t("content")} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={currentContent}
            onChange={e => {
              const val = e.target.value;
              if (language === "hi") setContentHi(val);
              else setContentEn(val);
              if (val.trim()) setFieldErrors(er => ({ ...er, content: undefined }));
            }}
            placeholder={t("contentPlaceholder")}
            rows={12}
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed transition-colors resize-y ${fieldErrors.content ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700"}`}
          />
          <div className="flex items-center justify-between mt-1">
            <FieldError msg={fieldErrors.content} />
            <p className="text-xs text-gray-400 ml-auto">{currentContent.length} {t("chars")}</p>
          </div>
        </div>

        {/* ── Tags ───────────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            {t("tags")}
            <span className="ml-1.5 text-xs font-normal text-gray-400">{t("optional")}</span>
          </label>
          <div className="flex gap-2 mb-2.5 flex-wrap min-h-[28px]">
            {tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium"
              >
                #{t(tag)}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-900 dark:hover:text-red-200 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder={t("tagPlaceholder")}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 transition-all text-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t("add")}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">{t("tagHelp")}</p>
        </div>

        {/* ── Image Upload ───────────────────────────────────────────────── */}
        <div ref={imageRef}>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            {t("imageVideo")} <span className="text-red-500">*</span>
          </label>
          <div className={`rounded-2xl overflow-hidden border-2 transition-colors ${fieldErrors.image ? "border-red-400 dark:border-red-500" : "border-transparent"}`}>
            <ImageKitUploader onUpload={handleUpload} currentUrl={imageUrl || videoUrl} />
          </div>
          <FieldError msg={fieldErrors.image} />
        </div>

        {/* ── Readiness indicator ────────────────────────────────────────── */}
        <div className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          {isReady
            ? <><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-sm text-green-700 dark:text-green-400 font-medium">{t("allSet")}</span></>
            : <><AlertCircle className="w-4 h-4 text-amber-500" /><span className="text-sm text-amber-700 dark:text-amber-400 font-medium">{t("requiredFields")}</span></>
          }
        </div>

        <div className="sm:hidden h-2" />
      </form>
    </>
  );
}
