# JAC Interiors — CLAUDE.md

## What this is
Static HTML website for JAC Interiors (luxury interior design, LA + South Florida). Migrated from Shopify → GitHub Pages → Netlify. Currently in SEO recovery: 28 indexed pages (down from 132 peak), improving via redirects, content, and manual GSC indexing requests.

## Stack & architecture
- **Hosting:** Netlify, auto-deploys from GitHub (`markjcsimmons/jacinteriors`), publish dir: `docs/`
- **No framework** — pure HTML/CSS/JS
- **Images:** CDN at `jacinteriorscdn.com/projects/[name]/[name]-N.jpg` and `/spaces/[type]/[type]-N.jpg` — never in repo
- **Navbar:** injected by `load-navbar.js` — no static nav HTML in page files
- **Analytics:** GA4 `G-N8351B2WBX` via `load-navbar.js`
- **Redirects:** `docs/_redirects` (Netlify) — maps all legacy Shopify URLs to new paths
- **Sitemap:** `docs/sitemap.xml` — update manually when adding pages

## Key directories
- `docs/blog/` — blog posts (body class `invero-blog`, relative asset paths `../assets/`)
- `docs/cities/` — 67 city pages (`invero-cities.css`)
- `docs/projects/` — individual project pages
- `docs/assets/css/` — `style.css` (global) + `invero-service-detail.css`, `invero-cities.css`, etc.

## Page templates
- **Service pages:** body class `invero-service-detail`. Sections: `service-hero` → `service-overview` → `service-process` → `service-faq` (+ FAQPage JSON-LD) → blog cards section → `services-cta` → full footer
- **Blog posts:** body class `invero-blog`. Sections: `journal-hero` → `post-shell` (`post-cover` + `post-content article`) → `post-more` (3 related cards). BlogPosting JSON-LD in `<head>`.

## Conventions
- Page titles: "Topic Los Angeles | JAC Interiors" — LA only, not "Los Angeles and South Florida"
- After every change: `git add [files] && git commit && git push` — Netlify deploys in ~30s
- New blog posts go in `docs/blog/`, get a card prepended to `docs/blog.html`, URL added to `sitemap.xml`

## Last worked on
- Rebuilt `space-planning.html` to full service page standard
- Added blog section + full footer to `kitchens.html`
- 3 new blog posts: luxury living room, kitchen renovation, home office (LA)
- Fixed 9 missing redirects: `/cities/` prefix internal link errors
- GSC: sitemap resubmitted, indexing requested on ~10 key pages

## Do not re-explain
- Why Netlify over GitHub Pages (GitHub Pages ignores `_redirects` — this caused the keyword drop)
- Why `_redirects` is so long (maps every legacy Shopify `/pages/*` and `/blogs/*` URL)
- Low indexed page count (28) is post-migration lag, not a structural problem — resolving via GSC requests
- Images are on CDN, not in the repo — don't suggest adding them locally
