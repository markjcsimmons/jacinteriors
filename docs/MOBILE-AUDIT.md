# Mobile optimization audit – JAC Interiors

**Audit date:** 2026  
**Scope:** `docs/` (HTML, CSS, JS) – home, project pages, gallery, portfolio, spaces, cities, services, about, contact.

---

## 1. What’s already in place

### Viewport & base
- **Viewport:** `width=device-width, initial-scale=1.0` is present on checked pages (e.g. `index.html`, project pages). Good.
- **Base layout:** `style.css` uses `clamp()` for many headings (e.g. `h1` 3.5rem–7rem, `h2` 2.5rem–4rem) and has `img { max-width: 100%; height: auto; }`. Containers use `max-width` + `padding: 0 2rem`.

### Navigation
- **Mobile nav:** At `768px` and below, the main nav is replaced by a full-screen overlay:
  - `.nav-menu` becomes fixed full viewport, `transform: translateX(100%)` (off-screen).
  - `.mobile-menu-toggle` (hamburger) is shown; click toggles `.active` and slides menu in (`translateX(0)`).
  - Dropdowns in the overlay use tap-to-expand (`.nav-dropdown.active`).
- **Logic:** `main.js` wires `#mobileMenuToggle` to `#navMenu` and closes menu on link/dropdown click. Works with the navbar injected by `load-navbar.js`.

### Responsive breakpoints in `style.css`
- **900px:** First-row grid (image + text) stacks to one column; many two-column layouts stack; project list item becomes column layout.
- **768px:** Nav becomes mobile overlay; sticky grid/blog single column; project rows stack; footer single column; hero CTA stacks.
- **760px:** Blog journal grid single column; spacing tweaks.
- **640px:** Footer padding reduced; some layout tweaks.
- **1024px:** Blog grid stays 2 columns (then 1 at 760px).

### Other
- **Footer:** Responsive grid at 980px (2 cols) and 640px (1 col, reduced padding).
- **Portfolio/project list:** `.project-list-item` stacks at 768px (image full width, content below).
- **Mobile CTA bar:** `load-navbar.js` can inject a bottom “Text / Call / Book” bar on some pages (`#mobileCtaBar`).
- **R2 images:** Project/spaces images use placeholders and JS; no fixed pixel dimensions that would break layout on small screens.

---

## 2. Issues and gaps

### High impact

1. **Home page hero H1 (index.html)**  
   - Inline `<style>` sets `h1 { font-size: 80px; }` with no media query.  
   - On narrow viewports this is too large and can overflow or dominate the screen.  
   - **Fix:** Use `clamp()` or a media query, e.g. `font-size: clamp(2.5rem, 8vw, 80px);` (or match `style.css` hero pattern).

2. **Inconsistent breakpoints**  
   - Mix of 640, 760, 768, 900, 980, 1024.  
   - Nav switches at **768px**; many content layouts at **900px**. Between 768–900px the nav is already hamburger but some content is still two columns.  
   - **Recommendation:** Standardize to 2–3 breakpoints (e.g. 768px and 480px) where possible and align nav with content (e.g. both at 768px or both at 900px).

3. **Container padding on very small phones**  
   - `.container` uses `padding: 0 2rem` (32px). On 320px-wide devices that’s a large share of width.  
   - **Optional:** Add something like `@media (max-width: 480px) { .container { padding-left: 1rem; padding-right: 1rem; } }` for a bit more content width.

### Medium impact

4. **Touch targets**  
   - Nav dropdown links use `padding: 0.5rem 1.5rem` (~8px vertical). Recommended minimum ~44px height for primary tap targets.  
   - **Fix:** Increase vertical padding on `.nav-dropdown-content a` (and mobile overlay links) so each link is at least ~44px tall on touch devices.

5. **Responsive images (srcset/sizes)**  
   - Only a few pages use `srcset`/`sizes` (e.g. `kitchens.html`, some blog posts). Most images are single `src` (including R2 placeholders).  
   - **Impact:** Layout is fine (images scale with `max-width: 100%`), but mobile may pull larger files than needed.  
   - **Improvement:** Add `srcset`/`sizes` for key above-the-fold images (hero, project thumbs) where you have multiple resolutions.

6. **Logo size on mobile**  
   - Logo is fixed at `135px` height in `load-navbar.js`. On small screens that can dominate the header.  
   - **Optional:** In the existing `@media (max-width: 768px)` block, add a rule like `.navbar .logo-img { height: 100px; }` (or use `clamp()` in JS/CSS) to reduce size on small viewports.

7. **Home page inline styles**  
   - `index.html` has a large inline `<style>` block with its own grid, typography, and only two media queries (1100px, 900px). No 768px or 480px rules.  
   - **Risk:** Sections that look fine at 900px may still be tight or oversized at 768px and below.  
   - **Recommendation:** Either move these styles into `style.css` and reuse the same breakpoints, or add 768px (and optionally 480px) overrides for headline, services grid, and any other dense sections.

### Lower impact

8. **Spaces masonry**  
   - `spaces-masonry.css` sets `min-height: 220px` on gallery tiles; no mobile-specific column or size changes.  
   - **Optional:** Add a media query to reduce `min-height` or adjust column count on small screens if masonry feels too tall or sparse.

9. **Mobile CTA bar**  
   - Logic exists but is conditional (e.g. not shown if `#mobileCtaBar` already exists).  
   - **Check:** Confirm which pages actually get the bar and that it doesn’t overlap key content (e.g. fixed footer or sticky nav).

10. **Dropdown hover vs touch**  
    - Desktop dropdowns use `mouseenter`/`mouseleave`. On touch devices, “hover” can be sticky or inconsistent.  
    - Mobile overlay already uses tap-to-expand (`.nav-dropdown.active`).  
    - **Recommendation:** Ensure overlay dropdowns are the only ones visible when the hamburger is shown (already the case at 768px); no change strictly required.

---

## 3. Breakpoint summary

| Breakpoint | Where used | Purpose |
|------------|------------|--------|
| 640px | style.css (footer, etc.) | Tighten spacing / single column |
| 760px | style.css (blog) | Blog single column, spacing |
| 768px | style.css | **Nav → hamburger + full-screen menu**; project list stack; footer/blog single column |
| 900px | style.css, index.html | First-row grid stack; many two-column → one-column; index grids |
| 980px | style.css, invero-*.css, footer | Footer 2-col; some invero layouts |
| 1024px | style.css | Blog grid 2-col |

---

## 4. Recommended order of work

1. **Fix home H1** – Replace fixed `80px` with `clamp()` or responsive rules in `index.html` (and any other inline hero H1s).
2. **Touch targets** – Increase tap height for nav links (especially in mobile overlay) to ≥44px.
3. **Optional: container padding** – Slightly reduce horizontal padding below 480px.
4. **Optional: logo size** – Slightly reduce logo height in the 768px media block.
5. **Optional: consolidate breakpoints** – Gradually move to 768px (and 480px) for nav + main content and document in one place (e.g. `style.css` or this doc).
6. **Optional: responsive images** – Add `srcset`/`sizes` for hero and key project/gallery images where assets exist.

---

## 5. Files to touch (for fixes above)

| File | Change |
|------|--------|
| `docs/index.html` | H1 `font-size` (clamp or @media); optional 768/480 grid and spacing overrides |
| `docs/assets/css/style.css` | Touch target padding at 768px; optional container padding ≤480px; optional logo height at 768px |
| `docs/assets/js/load-navbar.js` | Optional: smaller logo height via class or data-attr for 768px (if not done in CSS) |
| Project/spaces/gallery pages | No structural change required for basic fixes; optional `srcset` where you add responsive image assets |

---

## 6. Quick test checklist

- [ ] Home: narrow to 768px and 375px – H1 readable, no horizontal scroll, CTA usable.
- [ ] Nav: at 768px hamburger appears; open menu, tap Portfolio/Spaces/Services/About – dropdowns expand; tap a link – menu closes and navigates.
- [ ] Project page (e.g. River Homestead): hero + grid stack at 900px; images scale; no overflow.
- [ ] Portfolio page: project cards stack at 768px; images and “View project” are tappable.
- [ ] Gallery: tiles reflow; no horizontal scroll.
- [ ] Contact/About: forms and text readable; buttons ≥44px where possible.
- [ ] Footer: stacks to one column; links and Houzz badges tappable.

If you tell me which of the fixes you want first (e.g. “home H1 + touch targets”), I can suggest exact CSS/HTML snippets next.
