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
- Keyword research (2026-08-01): mined a 10k-row broad-match "interior" keyword export, filtered out job/education/irrelevant noise, cross-checked against existing `docs/blog/` topics to avoid duplicates
- 3 new blog posts published: `maximalist-interior-design.html`, `eclectic-interior-design.html`, `paint-color-trends-2026.html` — cards prepended to `docs/blog.html`, URLs added to `sitemap.xml`
- Found and worked around a real bug in `docs/assets/js/r2-images.js`: `applyR2Images()` rewrites any `<img src="assets/images/projects/<project>/<filename>">` to the CDN, guessing nearby numeric/extension variants (±30, jpg/JPG/jpeg/JPEG/webp/png) if the exact file 404s on `jacinteriorscdn.com`. For projects never uploaded to the CDN — confirmed on `docs/projects/eclectic-sunnyside.html`, which only has local images in the repo — this guessing lands on a plausible but wrong CDN URL instead of falling back to the working local file, so the image never loads (`naturalWidth` stays 0). Worked around it in the new posts by using only verified `jacinteriorscdn.com` images. Real fix (rewrite legacy local-image project pages, or make the script fall back properly) is filed as a separate follow-up, not done yet.
- Verification method that actually works in the preview browser: screenshots render CDN images as blank/gray in this sandbox even when the image is fine — the reliable check is `document.querySelectorAll('img')` + force `img.loading='eager'` + wait, then check `naturalWidth > 0`. Don't trust the screenshot alone for CDN image issues on this site.
- Also spotted (not fixed): `vale-crest-3.jpg` referenced in the already-live `warm-minimalism-interior-design.html` resolves with `naturalWidth: 0` — likely the same underlying CDN/fallback issue.

## Do not re-explain
- Why Netlify over GitHub Pages (GitHub Pages ignores `_redirects` — this caused the keyword drop)
- Why `_redirects` is so long (maps every legacy Shopify `/pages/*` and `/blogs/*` URL)
- Low indexed page count (28) is post-migration lag, not a structural problem — resolving via GSC requests
- Images are on CDN, not in the repo — don't suggest adding them locally
- Never use named placeholders (`:slug`, `:page`, `:splat`) in a `_redirects` destination on this site — confirmed broken in production (matches but doesn't interpolate, causing redirect loops). Always write explicit literal per-page rules instead, even though it's more lines
- Real `.html` files are served directly by Netlify before `_redirects` is ever consulted — a rule targeting an existing file needs the `301!` force flag or it's silently ignored
