# STV News Bihar Jharkhand — Setup & Deployment Guide

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → Name: `stv-news-bj`
3. Disable Google Analytics (or enable if you want)
4. Click **Create project**

### 1.2 Enable Firestore
1. Left panel → **Firestore Database** → **Create database**
2. Choose **Production mode**
3. Region: `asia-south1` (Mumbai) for best Bihar/Jharkhand performance
4. Click **Done**

### 1.3 Deploy Security Rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # Select your project
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 1.4 Enable Authentication
1. Left panel → **Authentication** → **Get started**
2. **Sign-in method** tab → **Google** → Enable → Add project support email → Save

### 1.5 Get Client SDK Keys
1. Project Settings (⚙️) → **General** → **Your apps** → **Add app** → Web (`</>`)
2. App nickname: `stv-news-web`
3. Copy the `firebaseConfig` object values

### 1.6 Get Admin SDK Key
1. Project Settings → **Service accounts** → **Generate new private key**
2. Download the JSON file — keep it **secret**, never commit

---

## Step 2: ImageKit Setup

1. Sign up at [imagekit.io](https://imagekit.io)
2. Dashboard → **Developer options** → Copy:
   - **URL endpoint** → `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
   - **Public Key** → `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - **Private Key** → `IMAGEKIT_PRIVATE_KEY`

---

## Step 3: Fill Environment Variables

Edit `.env.local` with your real values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stv-news-bj.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stv-news-bj
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stv-news-bj.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...

FIREBASE_ADMIN_PROJECT_ID=stv-news-bj
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@stv-news-bj.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/YOUR_ID
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx

NEXT_PUBLIC_SITE_URL=https://stvnews.in
NEXT_PUBLIC_SITE_NAME=STV News Bihar Jharkhand
ADMIN_EMAIL=your-admin@gmail.com
REVALIDATE_SECRET=some-random-string-here
```

---

## Step 4: Set Up Your Admin Account

1. Start the app: `npm run dev`
2. Go to `http://localhost:3000`
3. Click **Login** → sign in with your Google account
4. This creates your user document in Firestore with `isAdmin: false`
5. Go to **Firebase Console** → Firestore → `users` collection
6. Find your document (your UID) → Edit → set `isAdmin: true`
7. Refresh the app — you'll now see **Admin Panel** in the user menu

---

## Step 5: Test Locally

```bash
npm run dev
```

- Homepage: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Create post: `http://localhost:3000/admin/create`
- Search: `http://localhost:3000/search?q=bihar`
- Sitemap: `http://localhost:3000/sitemap.xml`

---

## Step 6: Deploy to Vercel

### 6.1 Push to GitHub
```bash
git add .
git commit -m "feat: STV News Bihar Jharkhand — initial release"
git remote add origin https://github.com/YOUR_ORG/stv-news.git
git push -u origin main
```

### 6.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. **Environment Variables**: Add all variables from `.env.local`
5. Click **Deploy**

### 6.3 Post-Deploy Checklist
- [ ] Firebase Auth → **Authorized domains** → Add your Vercel URL
- [ ] Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to your real domain
- [ ] Submit `https://yoursite.vercel.app/sitemap.xml` to Google Search Console
- [ ] Test: Create a post as admin → verify it appears on homepage
- [ ] Test: Like a post as a logged-in user
- [ ] Test: Comment on a post

---

## Project Structure Summary

```
stv-news/
├── app/                    ← All pages (App Router)
│   ├── page.tsx            ← Homepage
│   ├── post/[slug]/        ← Post detail (SSG + ISR)
│   ├── search/             ← Search results
│   ├── tag/[tag]/          ← Tag filter
│   ├── admin/              ← Admin panel (protected)
│   ├── api/
│   │   ├── imagekit-auth/  ← Server-side ImageKit tokens
│   │   └── revalidate/     ← On-demand ISR
│   ├── sitemap.ts          ← Auto sitemap.xml
│   └── robots.ts           ← robots.txt
├── components/
│   ├── layout/             ← Navbar, Sidebar, Footer
│   ├── post/               ← PostCard, LikeButton, Comments
│   ├── search/             ← SearchBar
│   ├── admin/              ← PostForm, ImageKitUploader
│   └── ui/                 ← Badge, Pagination, Spinner
├── lib/
│   ├── firebase/           ← Firestore CRUD + Auth
│   ├── context/            ← AuthContext
│   ├── hooks/              ← useSearch, useInfiniteScroll
│   └── utils/              ← slugify, formatDate, constants
├── firestore.rules         ← Security rules
├── firestore.indexes.json  ← Composite indexes
└── middleware.ts           ← Admin route protection
```

---

## Common Issues

| Issue | Fix |
|---|---|
| `PERMISSION_DENIED` on Firestore | Deploy security rules: `firebase deploy --only firestore:rules` |
| Admin panel redirects to home | Set `isAdmin: true` in your Firestore user document |
| ImageKit upload fails | Check `IMAGEKIT_PRIVATE_KEY` is set correctly |
| Build fails with Firebase errors | Normal during build with placeholder keys — add real keys |
| Search returns no results | Firestore text search requires exact prefix — consider Algolia for full-text |
