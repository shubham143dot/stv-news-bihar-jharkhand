// lib/context/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "hi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  hi: {
    // ─── General UI ───────────────────────────────────────────────────────────
    stvNews: "STV न्यूज़",
    heroTitle: "बिहार-झारखंड की आवाज़",
    heroSubtitle: "निष्पक्ष, सटीक और सबसे तेज़ खबरें",
    heroDesc: "बिहार और झारखंड की ताज़ा खबरें, राजनीति, खेल, मनोरंजन और बहुत कुछ — STV News पर पाएं सबसे पहले।",
    liveBreaking: "लाइव ब्रेकिंग",
    followForLatest: "ताज़ा खबरों के लिए हमें फॉलो करें",
    breakingNewsSub: "देश और दुनिया की हर बड़ी खबर सबसे पहले यहाँ",
    chooseLanguage: "भाषा चुनें",
    login: "लॉगिन करें",
    signOut: "साइन आउट",
    loginToContinue: "जारी रखने के लिए लॉगिन करें",
    categories: "कैटेगरी",
    tags: "टैग्स",
    search: "खोजें",
    searchBtn: "खोजें",
    searchPlaceholder: "खबरें, टैग्स या स्थान खोजें...",
    noResults: "कोई परिणाम नहीं मिला",
    viewAll: "सभी देखें",
    latestNews: "ताज़ा खबरें",
    trending: "ट्रेंडिंग",
    trendingNews: "ट्रेंडिंग खबरें",
    trendingComingSoon: "ट्रेंडिंग जल्द आएगा",
    more: "और पढ़ें",
    back: "पीछे",
    home: "होम",
    share: "शेयर करें",
    copyLink: "लिंक कॉपी करें",
    linkCopied: "लिंक कॉपी हो गया!",
    readTime: "मिनट पढ़ने का समय",
    views: "व्यूज",
    likes: "लाइक्स",
    like: "लाइक",
    live: "लाइव",
    mute: "म्यूट करें",
    unmute: "अनम्यूट करें",
    delete: "डिलीट करें",
    edit: "एडिट करें",
    change: "बदलें",
    newsFound: "खबरें मिलीं",
    noPostsFound: "कोई खबर नहीं मिली",
    popularTags: "लोकप्रिय टैग्स",
    publishDate: "प्रकाशन तिथि",
    maxFileSize: "अधिकतम फ़ाइल आकार",

    // ─── Navbar & Navigation ──────────────────────────────────────────────────
    bihar: "बिहार",
    jharkhand: "झारखंड",
    politics: "राजनीति",
    entertainment: "मनोरंजन",
    sports: "खेल",
    crime: "क्राइम",
    business: "व्यापार",
    education: "शिक्षा",
    health: "स्वास्थ्य",
    national: "राष्ट्रीय",
    international: "अंतरराष्ट्रीय",
    tech: "टेक",
    lifestyle: "लाइफस्टाइल",
    webstories: "वेब स्टोरीज",
    videos: "वीडियो",

    // ─── Admin Layout ─────────────────────────────────────────────────────────
    adminPanelTitle: "STV एडमिन पैनल",
    dashboardTitle: "डैशबोर्ड",
    newPostTitle: "नई पोस्ट",
    viewSite: "साइट देखें",

    // ─── Admin Dashboard ──────────────────────────────────────────────────────
    adminSection: "एडमिन सेक्शन",
    dashboard: "डैशबोर्ड",
    postsDashboard: "पोस्ट डैशबोर्ड",
    postsCountDescription: "कुल पोस्ट्स अब तक",
    newPost: "नई पोस्ट",
    createPost: "पोस्ट बनाएँ",
    editPost: "पोस्ट एडिट करें",
    viewPost: "पोस्ट देखें",
    deletePost: "पोस्ट डिलीट करें",
    allPosts: "सभी पोस्ट्स",
    total: "कुल",
    noPosts: "कोई पोस्ट नहीं मिली",
    createFirst: "पहली पोस्ट बनाएँ",
    totalPosts: "कुल पोस्ट्स",
    totalLikes: "कुल लाइक्स",
    totalViews: "कुल व्यूज",
    totalComments: "कुल कमेंट्स",
    published: "प्रकाशित",
    draft: "ड्राफ्ट",
    scheduled: "शेड्यूल किया गया",
    deleting: "डिलीट हो रहा है...",
    deletePostConfirm: "क्या आप वाकई इस पोस्ट को डिलीट करना चाहते हैं?",
    permanentAction: "यह एक्शन स्थायी है और इसे बदला नहीं जा सकता।",
    yesDelete: "हाँ, डिलीट करें",
    cancel: "रद्द करें",
    postDeleted: "पोस्ट सफलतापूर्वक डिलीट हो गई",
    deleteFailed: "डिलीट करने में विफल",
    saveDraft: "ड्राफ्ट सेव करें",
    publishNow: "अभी प्रकाशित करें",
    schedule: "शेड्यूल करें",
    saving: "सेव हो रहा है...",
    done: "हो गया",
    errorOccurred: "कुछ गलत हुआ",
    draftSaved: "ड्राफ्ट सेव हो गया",
    postScheduled: "पोस्ट शेड्यूल हो गई",
    postPublished: "पोस्ट प्रकाशित हो गई",

    // ─── Post Form ────────────────────────────────────────────────────────────
    title: "शीर्षक",
    titlePlaceholder: "खबर का मुख्य शीर्षक यहाँ लिखें...",
    content: "सामग्री",
    contentPlaceholder: "खबर की पूरी जानकारी यहाँ विस्तार से लिखें...",
    category: "कैटेगरी",
    selectCategory: "कैटेगरी चुनें",
    createCategory: "नई कैटेगरी",
    newCategory: "नई कैटेगरी का नाम",
    add: "जोड़ें",
    imageVideo: "इमेज / वीडियो",
    uploadImage: "इमेज अपलोड करें",
    tagPlaceholder: "टैग लिखें और Enter दबाएं...",
    tagHelp: "टैग्स खबरों को खोजने में मदद करते हैं (जैसे: #Patna, #Breaking)",
    locationAndTime: "स्थान और समय",
    optional: "वैकल्पिक",
    city: "शहर",
    state: "राज्य",
    eventDate: "घटना की तारीख",
    eventTime: "घटना का समय",
    isRequired: "अनिवार्य है",
    selectStatePrompt: "राज्य चुनें",
    allSet: "सब ठीक है! आप प्रकाशित कर सकते हैं।",
    requiredFields: "कृपया सभी अनिवार्य फ़ील्ड भरें",
    chars: "शब्द",

    // ─── Comments ─────────────────────────────────────────────────────────────
    comments: "कमेंट्स",
    writeComment: "एक कमेंट लिखें...",
    writeReply: "जवाब लिखें...",
    reply: "जवाब दें",
    replyingTo: "जवाब दे रहे हैं",
    repliedTo: "ने जवाब दिया",
    loginToComment: "कमेंट करने के लिए लॉगिन करें",
    loginWithGoogle: "गूगल के साथ लॉगिन करें",
    beFirstComment: "सबसे पहले कमेंट करने वाले बनें!",
    commentPostFailed: "कमेंट पोस्ट करने में विफल",
    deleteCommentConfirm: "क्या आप इस कमेंट को डिलीट करना चाहते हैं?",
    publisher: "प्रकाशक",

    // ─── Locations & Tags ─────────────────────────────────────────────────────
    patna: "पटना",
    ranchi: "राँची",
    delhi: "दिल्ली",
    mumbai: "मुंबई",
    stateUP: "उत्तर प्रदेश",
    stateDelhi: "दिल्ली",
    stateWB: "पश्चिम बंगाल",
    stateMH: "महाराष्ट्र",
    stateMP: "मध्य प्रदेश",
    stateRJ: "राजस्थान",
    stateGJ: "गुजरात",
    statePB: "पंजाब",
    stateHR: "हरियाणा",
    stateOD: "ओडिशा",
    stateCH: "छत्तीसगढ़",
    stateUK: "उत्तराखंड",
    stateAS: "असम",
    other: "अन्य",
  },
  en: {
    // ─── General UI ───────────────────────────────────────────────────────────
    stvNews: "STV News",
    heroTitle: "Voice of Bihar-Jharkhand",
    heroSubtitle: "Unbiased, Accurate and Fastest News",
    heroDesc: "Get the latest news from Bihar and Jharkhand — politics, sports, entertainment and more — first on STV News.",
    liveBreaking: "Live Breaking",
    followForLatest: "Follow us for latest updates",
    breakingNewsSub: "Every big news of the country and world first here",
    chooseLanguage: "Choose Language",
    login: "Login",
    signOut: "Sign Out",
    loginToContinue: "Login to continue",
    categories: "Categories",
    tags: "Tags",
    search: "Search",
    searchBtn: "Search",
    searchPlaceholder: "Search news, tags or locations...",
    noResults: "No results found",
    viewAll: "View All",
    latestNews: "Latest News",
    trending: "Trending",
    trendingNews: "Trending News",
    trendingComingSoon: "Trending coming soon",
    more: "Read More",
    back: "Back",
    home: "Home",
    share: "Share",
    copyLink: "Copy Link",
    linkCopied: "Link copied!",
    readTime: "min read",
    views: "Views",
    likes: "Likes",
    like: "Like",
    live: "LIVE",
    mute: "Mute",
    unmute: "Unmute",
    delete: "Delete",
    edit: "Edit",
    change: "Change",
    newsFound: "News found",
    noPostsFound: "No posts found",
    popularTags: "Popular Tags",
    publishDate: "Publish Date",
    maxFileSize: "Max file size",

    // ─── Navbar & Navigation ──────────────────────────────────────────────────
    bihar: "Bihar",
    jharkhand: "Jharkhand",
    politics: "Politics",
    entertainment: "Entertainment",
    sports: "Sports",
    crime: "Crime",
    business: "Business",
    education: "Education",
    health: "Health",
    national: "National",
    international: "International",
    tech: "Tech",
    lifestyle: "Lifestyle",
    webstories: "Web Stories",
    videos: "Videos",

    // ─── Admin Layout ─────────────────────────────────────────────────────────
    adminPanelTitle: "STV Admin Panel",
    dashboardTitle: "Dashboard",
    newPostTitle: "New Post",
    viewSite: "View Site",

    // ─── Admin Dashboard ──────────────────────────────────────────────────────
    adminSection: "Admin Section",
    dashboard: "Dashboard",
    postsDashboard: "Posts Dashboard",
    postsCountDescription: "total posts so far",
    newPost: "New Post",
    createPost: "Create Post",
    editPost: "Edit Post",
    viewPost: "View Post",
    deletePost: "Delete Post",
    allPosts: "All Posts",
    total: "Total",
    noPosts: "No posts found",
    createFirst: "Create your first post",
    totalPosts: "Total Posts",
    totalLikes: "Total Likes",
    totalViews: "Total Views",
    totalComments: "Total Comments",
    published: "Published",
    draft: "Draft",
    scheduled: "Scheduled",
    deleting: "Deleting...",
    deletePostConfirm: "Are you sure you want to delete this post?",
    permanentAction: "This action is permanent and cannot be undone.",
    yesDelete: "Yes, Delete",
    cancel: "Cancel",
    postDeleted: "Post deleted successfully",
    deleteFailed: "Failed to delete",
    saveDraft: "Save Draft",
    publishNow: "Publish Now",
    schedule: "Schedule",
    saving: "Saving...",
    done: "Done",
    errorOccurred: "Something went wrong",
    draftSaved: "Draft saved",
    postScheduled: "Post scheduled",
    postPublished: "Post published",

    // ─── Post Form ────────────────────────────────────────────────────────────
    title: "Title",
    titlePlaceholder: "Write the main headline here...",
    content: "Content",
    contentPlaceholder: "Write the full news details here...",
    category: "Category",
    selectCategory: "Select Category",
    createCategory: "New Category",
    newCategory: "New category name",
    add: "Add",
    imageVideo: "Image / Video",
    uploadImage: "Upload Image",
    tagPlaceholder: "Type tag and press Enter...",
    tagHelp: "Tags help people find your news (e.g. #Patna, #Breaking)",
    locationAndTime: "Location & Time",
    optional: "Optional",
    city: "City",
    state: "State",
    eventDate: "Event Date",
    eventTime: "Event Time",
    isRequired: "is required",
    selectStatePrompt: "Select State",
    allSet: "All set! You can publish now.",
    requiredFields: "Please fill all required fields",
    chars: "chars",

    // ─── Comments ─────────────────────────────────────────────────────────────
    comments: "Comments",
    writeComment: "Write a comment...",
    writeReply: "Write a reply...",
    reply: "Reply",
    replyingTo: "Replying to",
    repliedTo: "replied to",
    loginToComment: "Login to post a comment",
    loginWithGoogle: "Login with Google",
    beFirstComment: "Be the first to comment!",
    commentPostFailed: "Failed to post comment",
    deleteCommentConfirm: "Are you sure you want to delete this comment?",
    publisher: "Publisher",

    // ─── Locations & Tags ─────────────────────────────────────────────────────
    patna: "Patna",
    ranchi: "Ranchi",
    delhi: "Delhi",
    mumbai: "Mumbai",
    stateUP: "Uttar Pradesh",
    stateDelhi: "Delhi",
    stateWB: "West Bengal",
    stateMH: "Maharashtra",
    stateMP: "Madhya Pradesh",
    stateRJ: "Rajasthan",
    stateGJ: "Gujarat",
    statePB: "Punjab",
    stateHR: "Haryana",
    stateOD: "Odisha",
    stateCH: "Chhattisgarh",
    stateUK: "Uttarakhand",
    stateAS: "Assam",
    other: "Other",
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("hi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("language") as Language;
      if (savedLang === "hi" || savedLang === "en") {
        setLanguageState(savedLang);
      }
    } catch {
      // localStorage may not be available in SSR
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("language", lang);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string): string => {
    if (!key) return "";
    return translations[language]?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
