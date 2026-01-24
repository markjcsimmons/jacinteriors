# Project Pages & R2 Images – Process

Use this when adding a new **Portfolio project** page (e.g. Ronda, Alpine, Peary Place) so images load correctly and 404s don’t show as broken placeholders.

---

## 1. Upload images to R2 first

In Cloudflare R2 (bucket **jac-images**, domain **jacinteriorscdn.com**):

- **Path:** `projects/<slug>/`
- **Filenames:** `<slug>-1.jpg`, `<slug>-2.jpg`, … (e.g. `ronda-1.jpg`, `ronda-2.jpg`)

**Example:** For “Ronda” → `projects/ronda/ronda-1.jpg`, `ronda-2.jpg`, etc.

---

## 2. Tell us the image count

When you ask for a new project page, say **how many images** you have in R2 for that project, e.g.:

- “Add Ronda, I have 1–12”
- “Add Alpine, images 1–8”

The page will be built to **only** reference that range. No extra 404s, no broken placeholders.

---

## 3. Page and R2 path rules

| What        | Rule |
|------------|------|
| **HTML file** | `docs/projects/<slug>.html` (e.g. `ronda.html`) |
| **R2 path**   | `projects/<slug>/<slug>-N.jpg` |
| **URL**       | `https://jacinteriorscdn.com/projects/<slug>/<slug>-N.jpg` |
| **Slug**      | Lowercase, hyphens: `via-pisa`, `22nd-street`, `mulholland-drive` |

The navbar already links to `projects/<slug>.html` for each project in the PORTFOLIO menu.

---

## 4. If you add more images later

1. Upload new files to R2: `projects/<slug>/<slug>-11.jpg`, etc.
2. Ask to “add images 11–15 to Ronda” (or whatever range).  
   The page can be updated to include the new numbers.

---

## 5. If you see broken image placeholders

- **Masonry** is supposed to **hide** 404’d project tiles and reflow. If placeholders still appear:
  - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R).
  - Confirm the script versions on the project page include the latest `spaces-masonry.js` (cache-bust `?v=` in the script tag).
- **R2:** Check that files exist at `projects/<slug>/<slug>-N.jpg` and that **jacinteriorscdn.com** is the public custom domain for **jac-images**.
