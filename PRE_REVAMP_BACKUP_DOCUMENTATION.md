# Mumbai Cha Raja - React 19 + Vite Codebase Backup Documentation

**Date:** 2026-06-15
**Purpose:** Pre-revamp inventory/snapshot of the existing application before integration changes begin.

---

## 1. ROUTING & NAVIGATION

**Entry Point:** `src/main.jsx`
- Uses `BrowserRouter` wrapper for client-side routing
- Imports Bootstrap CSS globally
- Initializes i18n language system

### Route Table (`src/App.jsx`)

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Home` | Landing page with hero, about preview, events, awards, gallery preview |
| `/about` | `AboutPage` | Full about/history page (History, Overview, Navratri, Sculptor, Impact) |
| `/contact` | `ContactPage` | Contact info, map embed, social media links |
| `/committee` | `CommitteePage` | Committee members grouped by role, collapsible sections |
| `/donate` | `DonationPage` | Bank account details for donations |
| `/events` | `EventsPage` | Events list fetched from Firestore, animated cards |
| `/gallery` | `GalleryPage` | Masonry gallery, 3 categories (Ganpati/Devi/Celebrity), ~100+ external images, lightbox |
| `/live` | `LivePage` | Live YouTube embed with countdown to 2025-08-27 08:00 IST |
| `/social` | `SocialInitiativesPage` | Year-filtered social initiatives, card grid + Swiper carousel |
| `/education` | `EducationalInitiativesPage` | Year-filtered educational initiatives |
| `/other-social` | `OtherSocialPage` | Misc social initiatives as text sections |
| `/theme` | `ThemePage` | Decoration theme showcase (2025, 2024), sidebar year selector |
| `/awards` | `AwardsPage` | Static awards list, framer-motion animations |
| `/podcast` | `PodcastPage` | 3 podcast seasons with YouTube embeds |
| `/gun-gaurav-gallery` | `GunGauravGallery` | Gun Gaurav Sohala 2025 gallery (4 images, react-photo-view) |
| `/admin-login` | `AdminLogin` | Firebase email/password login form |
| `/admin` | `AdminDashboard` (via `AdminRoute`) | Admin panel: Awards/Events tabs |
| `/admin/manage-award` | `ManageAward` (via `AdminRoute`) | CRUD for multilingual awards |
| `*` | `PageNotFound` | 404 page (Marathi) |

### Navbar Menu Structure
1. **Mandap Info**: Home, About, Committee
2. **Initiatives**: Social Work, Education, Other Initiatives
3. **Festive Zone**: Podcast, Theme, Gallery, Live
4. **More**: Events, Awards, Donation, Contact

---

## 2. PAGES (`src/Pages/`)

### Home.jsx
Aggregates sections in order: FlashBanner, FlashNewsMobile, SocialSidebar, MarqueeStrip, Hero, AuraTeaser, AboutSection, VisarjanSohala, WorldRecordVideo, Theme, Padyapujan, UpcomingEvents, GalleryPreview, Awards, Donate, Contact, (Footer commented out).

### AboutPage.jsx
History/Overview/Navratri/Sculptor/Cultural Impact sections from `about` i18n namespace. Uses AOS. No Firebase.

### AwardPage.jsx
Static awards list from i18n `awards`, framer-motion stagger animations. No Firebase.

### CommitteePage.jsx
Committee members grouped by role (`committees` i18n array). Mobile collapsible sections, desktop always expanded. No Firebase.

### ContactPage.jsx
Contact info + Google Maps embed + 5 social links. Uses HeroSection. No Firebase.

### DonationPage.jsx (exports `DonatePage`)
Bank details from `donate` i18n namespace, HeroSection + card. No Firebase.

### EventsPage.jsx
Firestore real-time (`onSnapshot`) on `translations/events` → `eventList` array (title/description per lang, date, time). Grid cards with framer-motion.

### GalleryPage.jsx
~Hardcoded external image URLs (mumbaicharaja.co/gallery-image/):
- **Ganpati**: years 1928, 2025, 2024...1977 (49 images)
- **Devi**: 17 images (Lalbaug Chi Mata)
- **Celebrity**: 93 images
Masonry grid + yet-another-react-lightbox. No Firebase.

### GunGauravGallery.jsx
4 local images from `/images/gungaurav/gungaurav-sohala-2025_page-000X.jpg`, react-photo-view, 2/3/4-col grid. No Firebase.

### LivePage.jsx
Countdown to 2025-08-27 08:00 IST; after event, embeds YouTube video `9ThLarUCcas`. Updates every 1s. No Firebase.

### ThemePage.jsx
Years [2025, 2024] from `theme` i18n namespace (title/description/images/videos per year). Sidebar year selector, lightbox for images. No Firebase.

### SocialInitiativesPage.jsx
Year-filtered (latest year default) + "other" category, `InitiativeCard` grid with Swiper carousels. All data in i18n `social`. No Firebase.

### EducationalInitiativesPage.jsx
Same pattern as Social but from `education` namespace, no "other" category. No Firebase.

### OtherSocialPage.jsx
Text-only initiatives list (`otherInitiatives` i18n), border-left cards, framer-motion stagger. No Firebase.

### PodcastPage.jsx
3 hardcoded seasons (6/5/3 YouTube videos), season selector buttons, 2-col responsive grid. No Firebase.

### PageNotFound.jsx
404 page, Marathi text, link to `/`, framer-motion. No Firebase.

---

## 3. COMPONENTS (`src/Components/`)

| Folder | Purpose |
|---|---|
| **About/** (AboutSection.jsx) | Condensed about preview on Home; image + text, GSAP ScrollTrigger, "Learn More" → `/about` |
| **Admin/** | AdminLogin.jsx (Firebase email/password sign-in → `/admin`), AdminDashboard.jsx (sidebar w/ Awards/Events tabs, logout), AdminRoute.jsx (route guard: `onAuthStateChanged` + Firestore `admins/{uid}` check) |
| **AuraTeaser/** | YouTube teaser section (`_lnEmM4ARpQ`), GSAP ScrollTrigger; `auraTeaser` i18n namespace |
| **Award/** (Awards.jsx) | Home awards carousel (Slick, autoplay), data via `useAwardsLoader` from Firestore `translations/awards` |
| **Contact/** (Contact.jsx) | Home contact section: phone/email/address icons + Google Map embed, framer-motion |
| **CountdownTimer/** | Reusable countdown (props: `targetDate`, `eventName`), Marathi unit labels (दिवस/तास/मिनिटे/सेकंदे), used in UpcomingEvents |
| **Donate/** (Donate.jsx) | Home donation CTA → `/donate`, gradient bg, framer-motion |
| **FlashBanner/** | Desktop toast notification system from `flash` i18n `messages[]`, rotates every 3.5s, click → modal w/ title/description/link/images (react-toastify) |
| **FlashNewsMobile/** | Mobile-only equivalent of FlashBanner (<768px) |
| **Footer/** | Footer.jsx (links, social icons, logo, framer-motion); Footer_all.jsx appears unused |
| **GalleryPreview/** | Home 8-image masonry preview, "View Full Gallery" → `/gallery` |
| **GunGauravSohala/** | GunGauravSohala.jsx: Home CTA section, PDF icon, "View PDF" → `/gun-gaurav-gallery`; PhotoGallery.jsx & other.jsx likely unused/experimental |
| **Hero/** (Hero.jsx) | Home hero banner, single image with GSAP scale animation, auto-rotate 3s |
| **HeroSection/** | Reusable hero (props: title, subtitle, backgroundImage, height) — used by Contact/Donate pages |
| **InitiativeCard/** | Reusable card (props: title, description, images[]) — Swiper carousel, 100-char truncation w/ Read More/Less |
| **MarqueeStrip/** | Home scrolling text strip (react-fast-marquee), `marquee` i18n |
| **Navbar/** | Fixed top nav, 4 dropdown menus, mobile hamburger drawer, language toggle (mr→hi→en cycle), framer-motion + lucide icons |
| **Padyapujan/** | YouTube section + GSAP ScrollTrigger; `padyapujan` i18n namespace |
| **PrivateRoute/** | DEPRECATED route guard (checks localStorage `isAdmin === "true"`) — superseded by AdminRoute |
| **ScrollToTop/** | Scrolls to top on route change (`useLocation` + `useEffect`) |
| **SocialSidebar/** | Fixed sidebar with social media links |
| **Theme/** | Home decoration theme preview, video embed `oKsisg-vj28`, GSAP ScrollTrigger; `theme` i18n |
| **UpcomingEvents/** | Home: next 4 events from Firestore `translations/events` (`onSnapshot`), renders CountdownTimer per event, converts 12h↔24h time, GSAP animations |
| **VisarjanSohala/** | YouTube section + GSAP animations; `visarjan` i18n namespace |
| **WorldRecordVideo/** | YouTube section + GSAP animations; `worldrecord` i18n namespace |

---

## 4. FIREBASE

### Config (`src/firebase/firebase.js`)
```
apiKey: AIzaSyCUiW1PbP1jrAG68qSLrzU_TDKklOHSHdY
authDomain: mumbaicharajawebsite.firebaseapp.com
projectId: mumbaicharajawebsite
storageBucket: mumbaicharajawebsite.firebasestorage.app
messagingSenderId: 1087798763150
appId: 1:1087798763150:web:e64e9ac10f6159528a73df
measurementId: G-E1E1C9V749
```

**Services initialized:**
- ✅ Authentication (email/password) — admin login
- ✅ Firestore — primary data store
- ✅ Analytics (GA4)
- ❌ Storage — initialized but not actively used

### Firestore Collections

| Collection | Document | Purpose | Read by | Written by |
|---|---|---|---|---|
| `translations` | `awards` | `{ heading, en[], hi[], mr[] }` award list | Awards.jsx (carousel), ManageAward.jsx | ManageAward.jsx (admin, `setDoc`) |
| `translations` | `events` | `{ eventList: [{title:{en,hi,mr}, description:{en,hi,mr}, date, time}] }` | EventsPage.jsx, UpcomingEvents.jsx, ManageEvents.jsx | ManageEvents.jsx (admin, `updateDoc`) |
| `admins` | `{uid}` | Marks a user UID as admin | AdminRoute.jsx (`getDoc`) | manual (Firebase console) |

### Operations
- Reads: `getDoc`, `onSnapshot` (real-time on awards/events), `onAuthStateChanged`
- Writes: `setDoc` (awards), `updateDoc` (events)
- Auth: `signInWithEmailAndPassword`, `signOut`

---

## 5. ADMIN SYSTEM

### Auth Flow
1. `/admin-login` → `AdminLogin.jsx` — Firebase `signInWithEmailAndPassword(auth, email, password)`
2. On success → redirect to `/admin`
3. `AdminRoute.jsx` guards `/admin` and `/admin/manage-award`:
   - Listens via `onAuthStateChanged`
   - Checks Firestore `admins/{uid}` doc exists
   - If not authenticated/not admin → redirect to `/admin-login`
   - Shows loading state while checking
4. Logout: `signOut(auth)` from `AdminDashboard.jsx`

No hardcoded admin credentials found in code. `.env` has unused `VITE_ADMIN_PASSWORD=suraj`.

### AdminDashboard.jsx
- Sidebar: desktop static (w-64), mobile drawer with overlay
- Tabs: **Manage Awards**, **Manage Events** (icons: Award, CalendarDays)
- Header: "Welcome, Admin"

### ManageAward.jsx (CRUD for awards)
- Add Award: 3 fields (en/hi/mr), required, prepended to list
- Update Heading: 3 fields (en/hi/mr)
- Awards List: each entry editable inline (3 lang fields) + delete
- Real-time via `onSnapshot`, writes via `setDoc`
- Toast feedback (react-toastify)

### ManageEvents.jsx (CRUD for events)
- Add/Edit form: title (en/hi/mr), description (en/hi/mr), date (HTML5 date input), time (HTML5 time input)
- Time stored as 12-hour "HH:mm AM/PM"; edit mode doesn't repopulate AM/PM into time input (known quirk)
- List shows title(en)/date/time with edit/delete
- Real-time via `onSnapshot`, writes via `updateDoc`
- Validation: date, time, and title (all langs) required

---

## 6. INTERNATIONALIZATION

**Config:** `src/i18n/i18n.jsx` — languages: `en`, `hi`, `mr` (mr = fallback). Browser language detector.

### Namespaces (json per en/hi/mr)

| Namespace | File | Covers | Used by |
|---|---|---|---|
| `navbar` | navbar.json | Nav menu labels, dropdowns, language names | Navbar |
| `flash` | flash.json | Flash news messages (title/description/images/link) | FlashBanner, FlashNewsMobile |
| `about` | about.json | About page content | AboutPage |
| `awards` | awards.json | Awards heading + items | AwardPage, Awards carousel |
| `contact` | contact.json | Contact info, social titles | ContactPage, Contact |
| `donation` | donation.json | Donation heading/bank details | DonationPage, Donate |
| `events` | events.json | Events page labels | EventsPage |
| `committee` | committee.json | Committees array (title/members/roles) | CommitteePage |
| `education` | education.json | Educational initiatives by year | EducationalInitiativesPage |
| `social` | social.json | Social initiatives by year | SocialInitiativesPage |
| `theme` | theme.json | Theme years (title/description/images/videos) | ThemePage, Theme |
| `gallery` | gallery.json | Gallery labels/categories | GalleryPage, GalleryPreview |
| `live` | live.json | Live page labels | LivePage |
| `marquee` | marquee.json | Marquee text | MarqueeStrip |
| `gunGaurav` | gunGaurav.json | Gun Gaurav section text | GunGauravSohala, GunGauravGallery |
| `other-initiatives` | other-initiatives.json | Other initiatives (title/description) | OtherSocialPage |
| `podcast` | podcast.json | Podcast titles/season labels | PodcastPage |
| `padyapujan` | padyapujan.json | Padyapujan section | Padyapujan |
| `worldrecord` | worldrecord.json | World record section | WorldRecordVideo |
| `visarjan` | visarjan.json | Visarjan Sohala section | VisarjanSohala |
| `aura-teaser` | aura-teaser.json | Aura teaser section | AuraTeaser |
| `footer` | footer.json | Footer links/text | Footer |

Usage: `const { t, i18n } = useTranslation("namespace")`; `t("key")`, `t("arrayKey", { returnObjects: true })`, `i18n.changeLanguage(lang)`.

---

## 7. ASSETS (`public/`)

```
public/
├── images/
│   ├── Chashma Shibir/        (~15 images - educational initiative)
│   ├── Malakhamb/             (~10 images - sports/activity)
│   ├── gungaurav/             (4 images - Gun Gaurav Sohala 2025 catalog pages)
│   ├── gungaurav01/           (8+ images - alternate/archive)
│   ├── logo - img.png          (Navbar logo)
│   ├── Vishwavikkrami Mumbaicha Raja.png  (Footer logo)
│   ├── Picsart_25-08-26_21-11-36-106.png  (About section image)
│   └── ... other PNG/JPG decorative images
├── pdf/
│   └── gungaurav-sohala-2025.pdf
├── fonts/
│   └── S2476892.otf.ttf       (Devanagari/Marathi custom font)
└── _redirects                  (Netlify: `/* /index.html 200`)
```

Gallery page images are loaded from external URLs on `mumbaicharaja.co/gallery-image/` (Ganpati, Devi, Celebrity categories), not from `public/`.

---

## 8. KEY DEPENDENCIES (package.json v0.0.0)

- **Core**: react 19.1, react-dom 19.1, react-router-dom 7.6, vite 6.3
- **Animation**: framer-motion 12.23, gsap 3.13 (+@gsap/react), aos 2.3
- **Carousel**: swiper 11.2, react-slick 0.30, slick-carousel 1.8, react-fast-marquee 1.6
- **Image viewing**: yet-another-react-lightbox 3.23 (+lite), react-photo-view 1.2, react-image-lightbox-rotate 1.2
- **i18n**: i18next 25.2, react-i18next 15.5, i18next-browser-languagedetector 8.1, i18next-http-backend 3.0, i18next-redux-languagedetector 1.1
- **Backend**: firebase 12.0
- **UI**: bootstrap 5.3, react-bootstrap 2.10, tailwindcss 4.1 (+aspect-ratio, scrollbar)
- **Icons**: react-icons 5.5, lucide-react 0.513, @heroicons/react 2.2
- **Other**: react-toastify 11.0, @react-pdf-viewer/core+default-layout 3.12, react-ga4 2.1, camtel-design 1.0, babel-runtime 6.26

---

## 9. BUILD & DEPLOYMENT CONFIG

### vite.config.js
- Plugins: `@vitejs/plugin-react`
- Dev server port: 3000
- No `base` path set (builds assume root `/`)

### .env
- `VITE_ADMIN_PASSWORD=suraj` (present but appears unused in code — security note)

### .gitignore
Standard Node ignores: node_modules/, dist/, logs, editor configs, .DS_Store, etc.

### Rewrite rules
- **.htaccess (Apache)**: `RewriteBase /react-test/`, falls back all non-file/dir requests to `/react-test/index.html`
- **public/_redirects (Netlify)**: `/* /index.html 200`

⚠️ These two configs imply different deployment targets/base paths (`/react-test/` vs `/`) — needs reconciling for the live `mumbaicharaja.co` integration.

---

## 10. ANALYTICS
- Google Analytics 4 via `react-ga4`, measurement ID `G-3LY38LCFFE` configured in `src/analytics.js`
- `trackPageView()` called on route changes

---

## 11. KNOWN ISSUES / NOTES FOR REVAMP

1. **Uncommitted git state**: 77 modified/deleted files + ~94 untracked files (new images, new components: Admin, AuraTeaser, Padyapujan, VisarjanSohala, WorldRecordVideo, FlashNewsMobile, loaders) — represents in-progress work not yet committed.
2. **Deleted files in working tree** (still in git history): `src/Pages/AdminDashboard.jsx`, `src/Pages/AdminLogin.jsx`, `src/Pages/AdminPage.jsx`, and 31 GunGaurav gallery page images (0004–0031) — superseded by new `src/Components/Admin/` and `src/Pages/Admin/` structure plus a single new GunGaurav image.
3. **Security**: Firebase API key is in source (normal for Firebase web apps, restrict via Firebase rules/console); `.env` has an unused `VITE_ADMIN_PASSWORD`.
4. **Deploy base path mismatch**: `.htaccess` expects `/react-test/`, `_redirects` expects `/` — must decide actual path under mumbaicharaja.co before deploying.
5. **Unused/experimental files**: `Footer_all.jsx`, `GunGauravSohala/PhotoGallery.jsx` & `other.jsx`, `PrivateRoute.jsx` (deprecated, replaced by `AdminRoute.jsx`).
6. **Hardcoded external gallery images** point to `mumbaicharaja.co/gallery-image/...` — confirm these paths exist/persist on the live server during integration.
7. **ManageEvents time-edit quirk**: editing an existing event doesn't repopulate AM/PM into the 24h time input.
8. **Single 1.7MB JS bundle** on build — no code-splitting configured yet.

---

*This document is a point-in-time snapshot (2026-06-15) for reference before revamp/integration work begins. No code was modified to produce this report.*
