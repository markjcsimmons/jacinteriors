# Navbar Implementation - REQUIRED FOR ALL PAGES

## ⚠️ CRITICAL RULE

**EVERY SINGLE HTML PAGE (current and future) MUST include the navbar script in the `<head>` section.**

## Quick Start

Add this line to the `<head>` section of every HTML page:

```html
<script src="assets/js/load-navbar.js"></script>
```

### Path Adjustment for Subdirectories

- **Root level** (e.g., `index-variant-2.html`): `assets/js/load-navbar.js`
- **One level deep** (e.g., `cities/beverly-hills.html`): `../assets/js/load-navbar.js`
- **Two levels deep** (e.g., `projects/madison-club.html`): `../../assets/js/load-navbar.js`

## What This Does

The navbar script automatically:
1. ✅ Loads the navbar from `assets/navbar.html` (single source of truth)
2. ✅ Ensures 100% identical styling on all pages
3. ✅ Handles active state highlighting
4. ✅ Fixes relative paths for navigation links
5. ✅ Initializes dropdown menus with correct hover behavior

## Styling Guarantee

The navbar will be **100% identical** on all pages:
- White background
- Dark text (#222a26)
- "JAC INTERIORS" text logo (not image)
- Border-bottom: 1px solid #e4e4e4
- Sticky position at top
- Exact fonts, weights, spacing matching home page

## Template

See `PAGE_TEMPLATE.html` for the correct page structure.

## Verification

Run these scripts to verify navbar is on all pages:

```bash
# Check all pages have navbar script
python3 docs/audit_navbar.py

# Verify no styling conflicts
python3 docs/verify_navbar_styling.py

# Auto-add navbar to any missing pages
python3 docs/add_navbar_to_new_pages.py
```

## DO NOT

- ❌ Add `<nav>` tags manually - navbar is injected automatically
- ❌ Add hardcoded navbar HTML - use the script only
- ❌ Modify navbar styling in individual pages
- ❌ Add `navbar-dark` class - it makes links white (wrong!)

## Files

- `assets/navbar.html` - Single source of truth for navbar HTML/styling
- `assets/js/load-navbar.js` - Script that injects navbar on all pages
- `assets/css/style.css` - Global CSS with navbar fallback styles
- `PAGE_TEMPLATE.html` - Template for new pages
- `NAVBAR_REQUIREMENTS.md` - Detailed requirements

## For Developers

When creating a new page:
1. Copy `PAGE_TEMPLATE.html`
2. Adjust the navbar script path if in a subdirectory
3. That's it! The navbar will automatically appear with correct styling.
