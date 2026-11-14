# Nirmaan Sena — website and project dashboard

A fast, multi-page website for Nirmaan Sena with a private dashboard for adding projects, photos and videos, and for handling enquiries from the contact form.

- **Website:** Home, Projects (filterable), a premium page for every project, Services, About, Contact, Privacy, Terms.
- **Dashboard (`/admin`):** add and edit projects, upload photos and videos, reorder projects, curate independent project highlights, publish or hide, and manage enquiries (status, notes, WhatsApp, CSV export).
- **Stack:** Next.js (React), MongoDB, Cloudinary for media. Deploys to Vercel.

---

## 1. Run it on your computer

You need **Node.js 20.9 or newer** (the LTS installer from nodejs.org is fine).

```bash
npm install
cp .env.example .env.local     # on Windows: copy .env.example .env.local
```

Open `.env.local` and set at least:

```
ADMIN_EMAIL=you@nirmaansena.com
ADMIN_PASSWORD=a-long-password            # at least 12 characters on the live site
AUTH_SECRET=any-long-random-text-of-40-or-more-characters   # at least 32 characters
```

To create a strong `AUTH_SECRET`, run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Then:

```bash
npm run dev
```

- Website: http://localhost:3000
- Dashboard: http://localhost:3000/admin

Without MongoDB and Cloudinary settings, the site runs in **local mode**: data is saved in `.data/store.json` and uploads in `.data/uploads`. That's fine for trying things out. Use MongoDB and Cloudinary for the live site (step 3).

---

## 2. Adding a project from the dashboard

1. Sign in at `/admin` → **+ New project**.
2. Fill in the name, category, locality, area, timeline, and a one-line summary. The web address is created from the name automatically.
3. **Photos & videos:** drag in your photos (and short MP4 clips if you have them). You can also paste a YouTube link for a walkthrough.
   - Drag thumbnails to change the order. The small diagram underneath shows how the gallery will be laid out on the website.
   - The layout is arranged automatically: wide photos alternate between full-width frames and pairs, and tall (portrait) photos are paired or set beside a wide one. Tick **Full width** on any photo you want shown edge to edge.
   - Click **Set cover** on the best wide photo. It is used on cards and at the top of the project page.
4. Optional: a **hero video** (a 10–30 second MP4 that plays silently at the top of the project page) and **specifications** such as flooring, structure and finishes.
5. Switch on **Published** → **Save & publish**. Then open **Highlights** in the dashboard to choose where the project should be shown.

On the **Projects** list you can drag rows or use the ↑ ↓ buttons to set the order of the full project collection.

### Choosing project highlights

Open **Dashboard → Highlights** (`/admin/highlights`) to manage these areas independently:

- **Home · hero:** one project for the opening photograph and project link.
- **Home · selected work:** up to three projects; use the arrow buttons to change their order.
- **Projects · spotlight:** one project above the full collection.
- **About · project story:** one project to represent the studio.
- **Services · featured project:** one project illustrating your services.

Choose a published project in each selector and click **Save highlights**. The same project can appear in multiple areas. Choose **No project** to leave an area empty; it will not be replaced automatically by another project. Saving updates the public pages immediately. Reordering the full project collection does not change saved highlights.

For existing installations, the previous `featured` flags and project order supply the initial selections until Highlights is saved for the first time. After that first save, Highlights is the source of truth; legacy `featured` values no longer control these areas. No manual database migration is needed. Selections are stored in `.data/store.json` in local mode or the MongoDB `settings` collection in production.

Unpublishing or deleting a selected project immediately hides it from public highlights. The dashboard marks that selection as unavailable so you can replace it or clear it. If a project was only unpublished and is published again, its saved selection becomes visible again.

**Photo tips for a premium look:** landscape photos at least 2000px wide, shot in daylight, level and uncluttered. Mix wide room shots with a few details (joinery, stone, fittings). Very large phone photos are resized automatically before upload.

---

## 3. Going live

### a) MongoDB Atlas (database, free tier)

1. Create a free account at mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access:** add a user with a password.
3. **Network Access:** allow `0.0.0.0/0` (needed for Vercel).
4. **Connect → Drivers:** copy the connection string into `MONGODB_URI`, with your password filled in.

### b) Cloudinary (photos and videos, free tier)

1. Create a free account at cloudinary.com.
2. On the dashboard, copy **Cloud name**, **API key** and **API secret** into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.

Uploads go straight from the browser to Cloudinary, and images are automatically served in the right size and format (WebP/AVIF) for each screen. The free plan accepts photos up to 10 MB and videos up to 100 MB each.

### c) Vercel (hosting)

1. Put this folder in a GitHub repository.
2. At vercel.com → **Add New → Project** → import the repository.
3. Under **Environment Variables**, add everything from `.env.example` (`NEXT_PUBLIC_SITE_URL`, the admin settings, MongoDB and Cloudinary).
4. Deploy. Then sign in to `/admin` on the live site and click **Import starter projects** to bring in the five projects from the old website.
5. **Domains:** add `nirmaansena.com` in the Vercel project settings and update the DNS records at your domain registrar as Vercel shows.

### Hosting on your own server instead

```bash
npm install
npm run build
npm start          # runs on port 3000
```

Keep MongoDB and Cloudinary in production. Without them, data and uploads are stored in the `.data` folder on that server, so include it in your backups.

---

## 4. Connecting enquiries to the Nirmaan Sena automation system

Every enquiry is saved and shown in the dashboard. To also send it to your automation system (WhatsApp routing, architect assignment), set:

```
ENQUIRY_WEBHOOK_URL=https://ops.nirmaansena.com/api/public/website-enquiry
ENQUIRY_WEBHOOK_SECRET=the same secret the automation system expects
```

The site sends a JSON `POST` with the header `X-Website-Secret` and these fields:
`reference, name, phone, whatsapp, email, locality, services[], projectType, area, timeline, message, source, submittedAt`.
Check these names against what the automation system expects, and rename them in `src/app/api/enquiry/route.js` if needed.

---

## 5. The design

The site pairs warm-white pages with the original construction yellow for highlighted panels and a true black footer. Compact Lora headings and Manrope body text keep the premium character; Archivo restores the original bold, condensed number styling, with IBM Plex Mono for numeric labels. Fonts are self-hosted by Next.js. Aligned project cards, clear divider lines, tighter spacing and a tap-to-call navbar icon work across desktop and mobile. Phone layouts use larger tap targets, readable form fields and a two-column numbers band.

Choose the home page photograph in **Admin → Highlights → Home · hero**. The other highlight areas have independent selections and order. Choose a wide, bright cover photo at least 2000px wide. The headline sits above the photograph so the project remains unobscured. Selecting “No project” hides that placement; it does not pull in a different project automatically.

## 6. Changing text, colours and logo

| What | Where |
| --- | --- |
| Phone, WhatsApp, email, address, hours, stats, services, process steps, quality checks, project categories | `src/lib/site.js` |
| Company registration (CIN, GSTIN) shown in the footer | `credentials` in `src/lib/site.js` |
| Colours, fonts, spacing | top of `src/app/globals.css` (`:root`) |
| Logo mark | `src/components/site/Logo.js` (also `src/app/icon.svg` for the browser tab) |
| Share image for WhatsApp/Google | `public/og.png` (1200 × 630) |
| Page text | the matching file in `src/app/(site)/…/page.js` |

---

## 7. About the starter content

- The five starter projects use the text and images from the previous website. The images are hosted by Google and are at most 1280px wide, so they are not sharp on large screens. **Replace them with real site photography** from the dashboard as soon as you can. Real photos of your own work are the biggest trust signal on the site.
- On the old site, several "different" photos of the same project were actually one picture repeated (all four Brewtopia photos are identical, as are the two Platinum and two boardroom photos). Only distinct photos are used here.
- The Brewtopia photo shows another design studio's watermark in its bottom-right corner. If these images aren't from your own projects, using them could mislead customers and raise copyright problems. Replace them.
- The copy was rewritten in a calmer tone. Absolute claims like "100% on-time" and "₹0 cost overrun" were removed. Please check every figure (50+ sites, 500+ tradespeople, 10-year warranty) before going live.
- Removing a photo from a project doesn't delete the file from Cloudinary. Clean up unused files in the Cloudinary media library from time to time if you like.
- The Privacy and Terms pages are plain-language starting points. Have them reviewed.

---

## 8. Security

What's built in:

- **Admin login:** credentials live only in environment settings. Sessions are signed (HMAC-SHA256), HttpOnly, SameSite=Lax and Secure on the live site, and expire after 7 days. Changing `ADMIN_PASSWORD` signs everyone out at once. Login attempts are rate-limited and wrong passwords get a delayed, generic error.
- **Request protection:** every dashboard change must come from your own site (Origin and Sec-Fetch-Site checks), must be JSON, and must carry a valid session. Inputs are validated against a fixed list of fields, with length limits.
- **Uploads:** Cloudinary signatures only allow photo and video formats. Local uploads are checked by their actual bytes (an HTML or SVG file renamed `.jpg` is rejected), saved under random names and served with `nosniff` and a locked-down policy.
- **Pages:** a Content Security Policy only allows this site, Cloudinary, YouTube and Google Maps. HSTS, X-Frame-Options, Referrer-Policy and Permissions-Policy are set. Admin pages and API routes are marked noindex.
- **Data:** project media may only come from Cloudinary, this server, or YouTube. Enquiry exports to CSV are protected against spreadsheet formula injection. The contact form has a hidden spam trap, a minimum fill time and a rate limit.

Before going live:

1. Use a long, unique `ADMIN_PASSWORD` (12+ characters) and a random `AUTH_SECRET` (32+ characters). Never commit `.env.local`.
2. In MongoDB Atlas, give the database user access to this one database only, and enable Atlas backups.
3. In Cloudinary, keep the API secret only in Vercel's environment settings.
4. If you add analytics or chat widgets later, add their domains to the Content Security Policy in `next.config.mjs`, or they will be blocked.
5. Run `npm audit` after `npm install`, and update dependencies every few months.

The rate limits live in server memory, so on serverless hosting they slow attackers down rather than stopping them completely. The strong password is the main defence.

## Project structure

```
src/
  app/
    (site)/            public pages (home, projects, project/[slug], services, about, contact…)
    admin/             dashboard (login, projects, project editor, enquiries)
    api/               enquiry form, login, projects, uploads
    media/             serves local uploads (local mode only)
    globals.css        design system
  components/site/     header, footer, gallery, lightbox, project cards, form…
  components/admin/    dashboard components
  lib/                 site content, data store (MongoDB or local file), media helpers, validation
tests/                 unit tests (npm test)
```

Run the tests with `npm test`.
