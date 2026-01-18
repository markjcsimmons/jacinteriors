# Navbar Requirements - ALL PAGES

## CRITICAL RULE: Every single HTML page MUST include the navbar

### Required Implementation

**ALL pages (current and future) MUST include this line in the `<head>` section:**

```html
<script src="assets/js/load-navbar.js"></script>
```

### Path Adjustment for Subdirectories

If your page is in a subdirectory (e.g., `cities/` or `projects/`), adjust the path:

- **Root level pages**: `assets/js/load-navbar.js`
- **One level deep** (e.g., `cities/beverly-hills.html`): `../assets/js/load-navbar.js`
- **Two levels deep** (e.g., `projects/madison-club.html`): `../../assets/js/load-navbar.js`

### What the Navbar Provides

The navbar script automatically:
1. Loads the navbar from `assets/navbar.html`
2. Ensures 100% consistent styling across all pages
3. Handles active state highlighting
4. Fixes relative paths for navigation links
5. Initializes dropdown menus

### Styling

The navbar styling is **100% identical** on all pages:
- White background
- Dark text (#222a26)
- "JAC INTERIORS" logo (text, not image)
- Border-bottom: 1px solid #e4e4e4
- Sticky position at top
- Exact font sizes, weights, and spacing matching home page

### DO NOT:

- ❌ Add `<nav>` tags manually - the navbar is injected automatically
- ❌ Add hardcoded navbar HTML - use the script only
- ❌ Modify navbar styling in individual pages - all styling comes from `navbar.html`
- ❌ Add `navbar-dark` class - it will make links white (wrong)

### Template

See `PAGE_TEMPLATE.html` for the correct page structure.

### Verification

Run the audit script to verify all pages have the navbar:
```bash
python3 docs/audit_navbar.py
```
