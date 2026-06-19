# JAC Interiors — Session Handoff
**Date:** May 28, 2026

Read CLAUDE.md first for stack/architecture basics. This file covers what was done in the May 2026 sprint, current performance, and what to work on next.

---

## Current State of the Repo

- **31 blog posts** in `docs/blog/`
- **67 city pages** in `docs/cities/` — 9 were fully rebuilt this sprint (see below), remainder still have varying content quality
- **7 service pages** — all updated with FAQ schema, LA-focused titles, and meta descriptions
- **Last commit:** `e22980c1` (May 25) — GA4 phone/email click tracking
- **Deployed:** auto-deploys to Netlify on push; live at jacinteriors.com

---

## What Was Done in This Sprint (May 16–25)

### Content — 10 new blog posts published

| File | Target keyword | Notes |
|---|---|---|
| `blog/awkward-living-room-layout.html` | awkward living room layout | Was at pos 39, KD low |
| `blog/room-addition-los-angeles.html` | room addition los angeles | High buyer intent, 390 vol |
| `blog/office-interior-design-los-angeles.html` | office interior design los angeles | 140 vol |
| `blog/custom-retail-interior-design.html` | custom retail interior design | 390 vol, low KD |
| `blog/adu-interior-design-los-angeles.html` | ADU interior design LA | Growing category |
| `blog/home-renovation-interior-design-los-angeles.html` | home renovation interior design LA | High intent |
| `blog/interior-designer-south-florida.html` | interior designer south florida | Florida market expansion |
| `blog/luxury-living-room-design-los-angeles.html` | luxury living room design LA | No prior post, low KD |
| `blog/kitchen-renovation-los-angeles.html` | kitchen renovation los angeles | High intent, ties to kitchens page |
| `blog/home-office-design-los-angeles.html` | home office design los angeles | Post-pandemic volume |

All posts added to `docs/blog.html` (card prepended) and `docs/sitemap.xml`.

### City pages — 9 fully rebuilt

Replaced thin auto-generated placeholder content (~200 words) with 1,400–1,600 words of city-specific copy in the 6-block `invero-cities` template. These were flagged "Crawled — currently not indexed" in GSC.

**May 21, batch 1:** `hollywood-hills.html`, `westwood.html`, `downtown-la.html`, `manhattan-beach.html`, `calabasas.html`  
**May 21, batch 2:** `los-feliz.html`, `silverlake.html`, `pasadena.html`, `hancock-park.html`

Still thin (not yet rebuilt): check GSC Coverage for remaining "Crawled — not indexed" city pages.

### Technical SEO

- **GSC verified** — `<meta name="google-site-verification">` added to homepage (May 16)
- **Canonical tags** — added to all service pages and blog posts that were missing them (May 18)
- **FAQ schema (JSON-LD, FAQPage type)** — added to all 7 service pages (May 18)
- **404s fixed** — 9 missing `/cities/` prefix paths + typo blog slug redirects (May 20); remaining system URL 404s (May 21)
- **GSC coverage fixes** — noindex flags removed, redirect chains resolved, sitemap cleaned (May 21)
- **Redirect consolidation** — added 301s in `_redirects` for extensionless blog URLs → `.html` equivalents to stop GSC splitting impressions across two URL variants (May 25)

### On-page optimization

- **Meta descriptions** — rewrote all key service page metas (May 18)
- **Page titles** — all service pages now follow "Topic Los Angeles | JAC Interiors" pattern (May 18)
- **Internal linking** — blog cards section added to all service pages; service page links added from relevant blog posts (May 16)
- **Featured snippet optimization** — added `.definition-box` component to Hollywood Glam post and Accented Neutral post; targeting position 1–3 queries with 0 clicks (May 25)
- **Commercial page expansion** — `commercial-design.html` got: new H1 with LA keyword, 4-sector spaces section (office, retail, hospitality, build-out), FAQ expanded from 4 → 8 questions, updated FAQPage JSON-LD (May 25)
- **kitchens.html** — added blog cards section + full footer (May 20)
- **space-planning.html** — fully rebuilt to service page standard (May 20)

### Analytics

- **GA4 events** — `phone_click` and `email_click` now fire as distinct events (previously both hit as generic `click`). Wired via `load-navbar.js` since navbar contains the phone/email links (May 25)

---

## Current Performance (GSC + GA4, Last 28–30 Days)

**Google Search Console — Apr 29 to May 26:**

| Metric | Value |
|---|---|
| Total clicks | 61 |
| Total impressions | 9,029 |
| Avg CTR | 0.68% |
| Avg position | 27.6 |

**Key trend:** Impressions grew ~4.5× during the month (from ~150/day early May → ~750/day by May 19–26). This is Google starting to crawl and index the new content — should continue climbing over the next 4–6 weeks.

**GA4 — Last 30 Days:**

| Channel | Sessions | New Users |
|---|---|---|
| Direct | 573 | 521 |
| Organic Search | 350 | 260 |
| Organic Social | 49 | 39 |
| Referral | 15 | 15 |
| Total | 1,012 | 848 |

Contact form submissions: **33**  
Book-a-call clicks: **241**

**Top GSC pages by clicks:**

| Page | Clicks | Impressions | CTR | Avg pos |
|---|---|---|---|---|
| Homepage | 41 | 3,650 | 1.12% | 35.6 |
| Raised Ranch blog | 7 | 424 | 1.65% | 10.4 |
| Accented Neutral blog | 2 | 809 | 0.25% | 5.7 |
| Burbank city page | 2 | 87 | 2.30% | 6.8 |
| Hollywood Glam blog (combined) | 1 | 2,272 | 0.04% | ~2.9 |

---

## Biggest Opportunities Right Now

### 1. Hollywood Glam CTR — highest priority
The `what-is-hollywood-glam.html` blog ranks at position **2.82** for "what is hollywood glam interior design" (1,866 impressions in 28 days) but gets **0 clicks**. Featured snippet definition box was added May 25 — monitor whether this lifts CTR over the next 2 weeks. Target: 2–4% CTR.

Two URL variants exist in GSC:
- `blog/what-is-hollywood-glam.html` — 1,369 impressions, pos 3.75
- `blog/what-is-hollywood-glam` (no extension) — 903 impressions, pos 2.01

The May 25 redirect (`/blog/what-is-hollywood-glam` → `/blog/what-is-hollywood-glam.html`) should consolidate these in GSC within a few weeks.

### 2. Commercial design page authority
`commercial-design.html` ranks **70+** for "commercial interior design" (211 impressions). Page was expanded May 25. Needs external backlinks and more case study content to climb into page 1.

### 3. "Interior designer Los Angeles" — position 55
Core service keyword, 153 impressions, zero clicks. The `blog/interior-designer-los-angeles.html` exists but the service page (`residential-design.html`) likely needs more content depth and external authority.

### 4. City pages — monitor indexing
Check GSC Coverage tab in ~4 weeks to see if the 9 rebuilt city pages have moved from "Crawled — not indexed" to indexed. If not, request manual indexing.

### 5. Blog topical expansion
- **Raised Ranch** (pos 10.4, 1.65% CTR) — already performing; add 2–3 supporting posts targeting related terms ("raised ranch living room ideas", "raised ranch open concept")
- **Accented Neutral** (pos 5.7) — a cluster of related queries rank well; expand with more posts

### 6. Backlink strategy
No backlinks were built this sprint. Commercial keyword rankings are blocked by domain authority, not content quality. Priority: local LA press, design publications, and supplier/vendor links.

---

## Things to Know That Aren't in CLAUDE.md

- **`.definition-box`** CSS class exists in `docs/assets/css/style.css` — use it on blog posts for featured snippet targeting (gray border, padding, definition-style layout)
- **GA4 events to watch:** `book_call_click` (241/month), `contact_form_submit` (33/month), `phone_click`, `email_click` (new as of May 25 — no baseline yet)
- **GSC has two property types** — make sure you're looking at the right one; there may be both `http` and `https` or `www`/non-www variants; the canonical domain is `https://jacinteriors.com`
- **Blog cards format** — each card in `blog.html` and the blog section on service pages uses the same `journal-card` class. New posts go at the **top** of the index, not the bottom
- **Sitemap** — `docs/sitemap.xml` must be manually updated; it's not auto-generated. Always add new pages here
- **`_redirects` file** — long but intentional. Every legacy Shopify URL that drops here prevents a 404 and preserves link equity. Do not trim it
- **Phone number** — in the navbar (injected by `load-navbar.js`), not hard-coded in pages
- **The `blogs/` directory** (plural) — this is a legacy Shopify path stub for redirect compatibility. Don't add new content there; use `blog/` (singular)
