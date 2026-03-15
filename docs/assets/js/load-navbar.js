// Fixed Navbar Loader - Inline navbar HTML for instant loading (no XHR blocking)
(function() {
    'use strict';

    // Ensure older cached `load-navbar.js?v=...` URLs upgrade automatically.
    // This avoids needing to bump the querystring on every HTML file.
    const NAV_LATEST_V = '20260311-7';
    try {
        // Prefer currentScript when available.
        let src = (document.currentScript && document.currentScript.src) || '';
        if (!src) {
            // Fallback: find the script tag by partial match.
            const s = Array.from(document.querySelectorAll('script[src]')).find(el =>
                String(el.getAttribute('src') || '').includes('assets/js/load-navbar.js')
            );
            src = (s && s.src) ? s.src : '';
        }
        if (src && src.includes('load-navbar.js')) {
            const url = new URL(src, window.location.href);
            const v = url.searchParams.get('v') || '';
            if (v !== NAV_LATEST_V) {
                // Upgrade cache for next visit; do NOT return - always run init so menu works on every page.
                if (window.__JAC_NAV_UPGRADED_TO !== NAV_LATEST_V) {
                    window.__JAC_NAV_UPGRADED_TO = NAV_LATEST_V;
                    const upgraded = document.createElement('script');
                    url.searchParams.set('v', NAV_LATEST_V);
                    upgraded.src = url.toString();
                    upgraded.defer = true;
                    document.head.appendChild(upgraded);
                }
            }
        }
    } catch (_) {}
    
    const LOGO_SRC = 'assets/images/jac-interiors-logo-cropped.jpg';
    // Cropped logo allows a shorter navbar while staying legible.
    const LOGO_HEIGHT_PX = 135;
    const FOOTER_LOGO_SRC = 'assets/images/jac-interiors-logo-reverse.png';
    const FOOTER_ADDRESS_LINES = [
        '8033 W Sunset Blvd #107',
        'Los Angeles, CA 90046'
    ];
    const FOOTER_PHONE_DISPLAY = '213-397-0206';
    const FOOTER_EMAIL = 'info@jacinteriors.com';
    const INVERO_CITIES_CSS_HREF = 'assets/css/invero-cities.css?v=20260203-1';
    
    // Get current page to set active state and calculate paths
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index.html';
    
    // Extract base path for GitHub Pages project sites (e.g., '/jacinteriors').
    // Only treat first segment as "site root" when it's a known repo name; otherwise we're in a subfolder (projects/, cities/).
    const pathParts = currentPath.split('/').filter(p => p);
    const knownSiteRoot = 'jacinteriors';
    const isUnderKnownRoot = pathParts[0] === knownSiteRoot;
    const basePath = (pathParts.length > 0 && isUnderKnownRoot) ? '/' + pathParts[0] : '';
    
    // Depth: how many levels up to reach docs root. /projects/fox-hills.html -> 1; /jacinteriors/projects/fox-hills.html -> 1.
    const depth = basePath ? Math.max(0, pathParts.length - 2) : Math.max(0, pathParts.length - 1);
    const pathPrefix = depth > 0 ? '../'.repeat(depth) : '';
    
    // Build absolute URL for assets (badges, etc.) from script location so it works on any deployment
    function getAssetUrl(assetPath) {
      try {
        const s = (document.currentScript && document.currentScript.src) || '';
        const scriptSrc = s || (Array.from(document.querySelectorAll('script[src]')).find(el =>
          String(el.getAttribute('src') || '').includes('load-navbar.js')
        )?.src || '');
        if (scriptSrc) {
          const u = new URL(scriptSrc, window.location.href);
          const base = u.origin + u.pathname.replace(/\/assets\/js\/load-navbar\.js.*$/i, '');
          return base.replace(/\/$/, '') + '/' + assetPath.replace(/^\//, '');
        }
      } catch (_) {}
      return (window.location.origin || '') + (basePath || '') + '/' + assetPath.replace(/^\//, '');
    }

    // Helper to get correct path for links
    // Use absolute paths with basePath for root-level pages to ensure correct resolution
    function getPath(href) {
        if (href.startsWith('http') || href.startsWith('#')) {
            return href;
        }
        // Don't modify absolute paths starting with /
        if (href.startsWith('/')) {
            return href;
        }
        // Project pages: always use site-root path so /jacinteriors/projects/22nd-street.html works from any page
        if (href.startsWith('projects/') && basePath) {
            return basePath + '/' + href;
        }
        // For relative paths in subdirectories, use relative paths
        if (depth > 0 && !href.startsWith('../')) {
            return pathPrefix + href;
        }
        // For root-level relative paths, use absolute paths with basePath
        return basePath + '/' + href;
    }

    function ensureSeoMeta() {
        if (!document || !document.head) return;

        const siteName = 'JAC Interiors';
        const defaultDescription = 'Full-service interior design studio creating refined, timeless spaces across Los Angeles and beyond.';
        const canonicalHost = 'https://jacinteriors.com';

        function getCanonicalPathname() {
            // Prefer stripping GitHub project basePath from canonical URLs.
            let p = window.location.pathname || '/';
            if (basePath && p.startsWith(basePath + '/')) {
                p = p.slice(basePath.length);
            }
            if (!p.startsWith('/')) p = '/' + p;
            // Canonicalize /index.html to /
            if (p === '/index.html') return '/';
            return p;
        }

        const canonicalHref = canonicalHost + getCanonicalPathname();

        let canonicalEl = document.querySelector('link[rel="canonical"]');
        if (!canonicalEl) {
            canonicalEl = document.createElement('link');
            canonicalEl.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalEl);
        }
        canonicalEl.setAttribute('href', canonicalHref);

        // Ensure meta description exists.
        let descEl = document.querySelector('meta[name="description"]');
        if (!descEl) {
            descEl = document.createElement('meta');
            descEl.setAttribute('name', 'description');
            document.head.appendChild(descEl);
        }
        const existingDesc = (descEl.getAttribute('content') || '').trim();

        function humanizeFromFilename(name) {
            const raw = String(name || '').replace(/\.html$/i, '').replace(/[-_]+/g, ' ').trim();
            if (!raw) return '';
            return raw.replace(/\b\w/g, (m) => m.toUpperCase());
        }

        function getPageSignals() {
            const pathname = getCanonicalPathname();
            const file = pathname.split('/').filter(Boolean).pop() || 'index.html';
            const h1 = document.querySelector('main h1') || document.querySelector('h1');
            const h1Text = (h1 && h1.textContent) ? h1.textContent.replace(/\s+/g, ' ').trim() : '';

            const isBlogPost = pathname.startsWith('/blog/') && file.endsWith('.html') && file !== 'blog.html';
            const isCityPage = pathname.startsWith('/cities/') && file.endsWith('.html');
            const isProjectPage = pathname.startsWith('/projects/') && file.endsWith('.html');
            const isSpacesPage = [
                // Kitchens gallery lives here (masonry-first)
                'kitchens-gallery.html',
                'bathrooms.html',
                'bedrooms.html',
                'dining-rooms.html',
                'living-spaces.html',
                'office-spaces.html',
                'entryways.html',
                'bar-area.html',
                'laundry-rooms.html',
                'outdoor-spaces.html',
            ].includes(file);

            return { pathname, file, h1Text, isBlogPost, isCityPage, isProjectPage, isSpacesPage };
        }

        function pickOgImageUrl() {
            const candidates = [
                '.post-cover img',
                '.journal-media img',
                'main img',
                'img',
            ];
            for (const sel of candidates) {
                const img = document.querySelector(sel);
                if (!img) continue;
                const src = (img.getAttribute('src') || '').trim();
                const dataLocal = (img.getAttribute('data-r2-local-src') || '').trim();
                const pick = (src && !src.startsWith('data:')) ? src : (dataLocal || '');
                if (!pick || pick.startsWith('data:')) continue;
                try {
                    return new URL(pick, window.location.href).toString();
                } catch (e) {
                    // ignore
                }
            }
            // Fallback: site logo
            try {
                return new URL(getPath(LOGO_SRC), window.location.href).toString();
            } catch (e) {
                return '';
            }
        }

        function computeSeoOverrides() {
            const s = getPageSignals();
            const title = (document.title || siteName).trim();
            const fromH1 = s.h1Text || humanizeFromFilename(s.file);

            // Only override description if missing in the HTML head.
            let description = existingDesc;
            if (!description) {
                if (s.file === 'index.html' || s.file === '' || s.pathname === '/') {
                    description = 'Luxury interior design studio serving Los Angeles and Florida. Full-service residential design, developer interiors, and commercial spaces.';
                } else if (s.file === 'services.html') {
                    description = 'Interior design services from JAC Interiors—residential design, developer interiors, sourcing & purchasing, construction supervision, space planning, and commercial design.';
                } else if (s.file === 'portfolio.html') {
                    description = 'Explore JAC Interiors’ portfolio of luxury interior design projects across Los Angeles, California, and beyond.';
                } else if (s.file === 'cities-we-serve.html') {
                    description = 'Explore the Los Angeles and Florida cities JAC Interiors serves for full-service interior design. Find your city and book a call.';
                } else if (s.file === 'about.html') {
                    description = 'Meet JAC Interiors—full-service interior design studio creating refined, timeless spaces across Los Angeles and beyond.';
                } else if (s.file === 'contact.html') {
                    description = 'Contact JAC Interiors to start your project. Book a call and tell us about your space, timeline, and goals.';
                } else if (s.file === 'blog.html') {
                    description = 'Interior design ideas, insights, and inspiration from JAC Interiors—tips, style notes, and guides for elevated living.';
                } else if (s.isBlogPost) {
                    description = defaultDescription;
                } else if (s.isCityPage) {
                    description = `Full-service interior design in ${fromH1 || 'your city'}—residential design, developer interiors, and commercial spaces. Book a call with JAC Interiors.`;
                } else if (s.isProjectPage) {
                    description = `Explore ${fromH1 || 'this project'}—a JAC Interiors interior design project. View images and details from our portfolio.`;
                } else if (s.isSpacesPage) {
                    description = `Explore ${fromH1 || 'spaces'} designed by JAC Interiors—timeless interiors with refined details and livable comfort.`;
                } else {
                    description = defaultDescription;
                }
            }

            // OG type and image selection
            const ogType = s.isBlogPost ? 'article' : 'website';
            const ogImage = pickOgImageUrl();

            return { title, description, ogType, ogImage };
        }

        const overrides = computeSeoOverrides();

        // Ensure meta description is populated (unique where possible).
        if (!existingDesc || overrides.description) {
            descEl.setAttribute('content', (overrides.description || defaultDescription).trim());
        }

        const title = (overrides.title || siteName).trim();
        const description = (descEl.getAttribute('content') || defaultDescription).trim();
        const ogImage = (overrides.ogImage || '').trim();

        function upsertMeta(attr, key, content) {
            if (!content) return;
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        }

        // Open Graph
        upsertMeta('property', 'og:site_name', siteName);
        upsertMeta('property', 'og:title', title);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:url', canonicalHref);
        upsertMeta('property', 'og:type', overrides.ogType || 'website');
        upsertMeta('property', 'og:image', ogImage);

        // Twitter
        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', title);
        upsertMeta('name', 'twitter:description', description);
        upsertMeta('name', 'twitter:image', ogImage);

        // Organization JSON-LD (sitewide)
        const jsonLdId = 'jacJsonLd';
        let ld = document.getElementById(jsonLdId);
        if (!ld) {
            ld = document.createElement('script');
            ld.id = jsonLdId;
            ld.type = 'application/ld+json';
            document.head.appendChild(ld);
        }

        const siteRoot = canonicalHost + '/';
        const org = {
            '@context': 'https://schema.org',
            '@type': ['LocalBusiness', 'ProfessionalService'],
            name: siteName,
            url: siteRoot,
            logo: ogImage,
            image: ogImage,
            telephone: '+1-213-397-0206',
            email: 'info@jacinteriors.com',
            address: {
                '@type': 'PostalAddress',
                streetAddress: '8033 W Sunset Blvd #107',
                addressLocality: 'Los Angeles',
                addressRegion: 'CA',
                postalCode: '90046',
                addressCountry: 'US'
            },
            sameAs: [
                'https://www.instagram.com/jacinteriors',
                'https://www.houzz.com/professionals/interior-designers-and-decorators/jac-interiors-pfvwus-pf~914469284?'
            ]
        };

        try {
            ld.textContent = JSON.stringify(org);
        } catch (e) {
            // If JSON serialization fails, fail silently (never break page rendering).
        }

        // WebSite JSON-LD (sitewide)
        const websiteJsonLdId = 'jacWebsiteJsonLd';
        let websiteLd = document.getElementById(websiteJsonLdId);
        if (!websiteLd) {
            websiteLd = document.createElement('script');
            websiteLd.id = websiteJsonLdId;
            websiteLd.type = 'application/ld+json';
            document.head.appendChild(websiteLd);
        }
        const website = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: siteRoot,
        };
        try {
            websiteLd.textContent = JSON.stringify(website);
        } catch (e) {
            // ignore
        }
    }

    // Expose SEO helper for SPA navigation re-inits.
    window.__ensureSeoMeta = ensureSeoMeta;

    function ensureAnalytics() {
        if (!document || !document.head) return;
        if (document.getElementById('jacAnalytics')) return;
        const s = document.createElement('script');
        s.id = 'jacAnalytics';
        s.defer = true;
        s.src = getPath('assets/js/analytics.js?v=20260209-1');
        document.head.appendChild(s);
    }
    
    // Determine which nav item should be active
    function setActiveNav() {
        const nav = document.querySelector('nav.navbar');
        if (!nav) return;
        
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        if (filename === 'index.html' || filename === '' || filename === 'index-variant-2.html') {
            const homeLink = nav.querySelector('a[href*="index.html"]');
            if (homeLink) homeLink.classList.add('active');
        } else if (filename === 'gallery.html') {
            const link = nav.querySelector('a[href*="gallery.html"]');
            if (link) link.classList.add('active');
        } else if (filename === 'portfolio.html' || currentPath.includes('/projects/')) {
            const link = nav.querySelector('a[href*="portfolio.html"]');
            if (link) link.classList.add('active');
        } else if (filename.includes('kitchens-gallery.html') ||
                   filename.includes('bathrooms.html') || filename.includes('bedrooms.html') || 
                   filename.includes('dining-rooms.html') ||
                   filename.includes('living-spaces.html') || filename.includes('office-spaces.html') ||
                   filename.includes('entryways.html') || filename.includes('bar-area.html') ||
                   filename.includes('laundry-rooms.html') || filename.includes('outdoor-spaces.html')) {
            const link = nav.querySelector('.nav-dropdown:first-of-type .nav-link');
            if (link) link.classList.add('active');
        } else if (filename === 'services.html' || filename.includes('residential-design.html') ||
                   filename.includes('commercial-design.html') || filename.includes('interior-styling.html') ||
                   filename.includes('space-planning.html') || filename.includes('cities-we-serve.html') ||
                   filename.includes('kitchens.html') || filename.includes('kitchen-design.html')) {
            const link = nav.querySelector('a[href*="services.html"]');
            if (link) link.classList.add('active');
        } else if (filename === 'about.html' || filename === 'blog.html' || currentPath.includes('/blog/')) {
            const link = nav.querySelector('a[href*="about.html"]');
            if (link) link.classList.add('active');
        } else if (filename === 'contact.html') {
            const link = nav.querySelector('a[href*="contact.html"]');
            if (link) link.classList.add('active');
        }
    }
    
    // Initialize dropdown hover behavior (desktop) - use setProperty with important so it wins over inline styles on all pages
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav-link');
            const content = dropdown.querySelector('.nav-dropdown-content');

            if (link && content) {
                // Prevent # from jumping when clicking dropdown trigger on desktop
                link.addEventListener('click', function(e) {
                    if (window.innerWidth > 980 && link.getAttribute('href') === '#') {
                        e.preventDefault();
                    }
                });
                let hideTimer = null;
                dropdown.addEventListener('mouseenter', () => {
                    if (hideTimer) clearTimeout(hideTimer);
                    hideTimer = null;
                    content.style.setProperty('display', 'block', 'important');
                });
                dropdown.addEventListener('mouseleave', () => {
                    hideTimer = setTimeout(() => {
                        content.style.setProperty('display', 'none', 'important');
                        hideTimer = null;
                    }, 120);
                });
                content.addEventListener('mouseenter', () => {
                    if (hideTimer) clearTimeout(hideTimer);
                    hideTimer = null;
                });
                content.addEventListener('mouseleave', () => {
                    content.style.setProperty('display', 'none', 'important');
                });
            }
        });
    }
    
    function initMobileMenu(nav) {
        if (!nav) return;
        const mobileMenuToggle = nav.querySelector('#mobileMenuToggle');
        const navMenu = nav.querySelector('#navMenu');
        if (!mobileMenuToggle || !navMenu) return;
        
        function closeMenu() {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            nav.querySelectorAll('.nav-dropdown').forEach(dd => dd.classList.remove('active'));
        }
        
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        nav.querySelectorAll('.nav-dropdown').forEach(dropdown => {
            const dropdownLink = dropdown.querySelector('.nav-link');
            if (dropdownLink) {
                dropdownLink.addEventListener('click', function(e) {
                    if (window.innerWidth <= 980) {
                        e.preventDefault();
                        nav.querySelectorAll('.nav-dropdown').forEach(dd => {
                            if (dd !== dropdown) dd.classList.remove('active');
                        });
                        dropdown.classList.toggle('active');
                    }
                });
            }
        });
        
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            if (link.closest('.nav-dropdown') && !link.closest('.nav-dropdown-content')) return;
            link.addEventListener('click', closeMenu);
        });
        navMenu.querySelectorAll('.nav-dropdown-content a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeMenu();
        });
    }
    
    // Force navbar styles
    function enforceNavbarStyles(nav) {
        if (!nav) return;
        
        nav.style.setProperty('border-bottom', '1px solid #e4e4e4', 'important');
        nav.style.setProperty('padding', '0.5rem 0', 'important');
        nav.style.setProperty('background', 'white', 'important');
        nav.style.setProperty('position', 'sticky', 'important');
        nav.style.setProperty('top', '0', 'important');
        nav.style.setProperty('z-index', '1000', 'important');
        nav.style.setProperty('width', '100%', 'important');
        nav.style.setProperty('box-sizing', 'border-box', 'important');
        
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.style.setProperty('color', '#222a26', 'important');
        });
        
        const logo = nav.querySelector('.logo');
        if (logo) {
            logo.style.setProperty('color', '#222a26', 'important');
        }
        
        nav.classList.remove('navbar-dark');
        if (document.body) {
            document.body.classList.remove('navbar-dark');
        }
    }
    
    // Portfolio dropdown: project links (keep in sync with portfolio-projects.js FALLBACK_PROJECT_LINKS)
    const PORTFOLIO_PROJECT_LINKS = [
        { title: 'Fox Hills', href: 'projects/fox-hills.html' },
        { title: '22nd Street', href: 'projects/22nd-street.html' },
        { title: 'Sunnyside', href: 'projects/sunnyside.html' },
        { title: 'Frances', href: 'projects/frances.html' },
        { title: 'Columbus Way', href: 'projects/columbus-way.html' },
        { title: 'Colette Way', href: 'projects/colette-way.html' },
        { title: 'River Homestead', href: 'projects/river-homestead.html' },
        { title: 'Oakwood', href: 'projects/oakwood.html' },
        { title: 'Wilshire', href: 'projects/wilshire.html' },
        { title: 'Mulholland Drive', href: 'projects/mulholland-drive.html' },
        { title: 'Via Pisa', href: 'projects/via-pisa.html' },
        { title: 'Galewood', href: 'projects/galewood.html' },
        { title: 'Highland', href: 'projects/highland.html' },
        { title: 'Medio', href: 'projects/medio.html' },
        { title: 'Monaco', href: 'projects/monaco.html' },
        { title: 'Presson Place', href: 'projects/presson-place.html' },
        { title: 'Ronda', href: 'projects/ronda.html' },
        { title: 'Sherbourne', href: 'projects/sherbourne.html' },
        { title: 'Alpine', href: 'projects/alpine.html' },
        { title: 'Peary Place', href: 'projects/peary-way.html' },
        { title: 'Valley Vista', href: 'projects/valley-vista.html' },
        { title: 'Colby', href: 'projects/colby.html' },
        { title: 'Vale Crest', href: 'projects/vale-crest.html' },
        { title: 'Brown Deer Park', href: 'projects/brown-deer-park.html' },
        { title: 'JAMM Agency Office', href: 'projects/jamm-visual.html' },
    ];
    const portfolioDropdownItems = PORTFOLIO_PROJECT_LINKS.map(function(p) {
        return '<a href="' + getPath(p.href) + '" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: \'Plus Jakarta Sans\', sans-serif;">' + p.title + '</a>';
    }).join('');

    // Navbar HTML - inlined for instant loading (no XHR)
    const navbarHTML = `
<nav class="navbar" style="padding: 0.5rem 0; background: white; position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid #e4e4e4; font-family: 'Plus Jakarta Sans', sans-serif;">
    <div class="container" style="max-width: 1320px; margin: 0 auto; padding: 0 2rem;">
        <div class="nav-wrapper" style="display: flex; justify-content: space-between; align-items: center;">
            <a href="${getPath('index.html')}" class="logo" aria-label="Home" style="font-size: 1.5rem; font-weight: 500; letter-spacing: -1px; text-transform: uppercase; text-decoration: none; color: #222a26; font-family: 'Plus Jakarta Sans', sans-serif; display: inline-flex; align-items: center;">
                <img class="logo-img" src="${getPath(LOGO_SRC)}" alt="JAC Interiors" style="height: ${LOGO_HEIGHT_PX}px; width: auto; display: block;"/>
            </a>
            <div class="nav-menu" id="navMenu">
                <a href="${getPath('index.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">HOME</a>
                <a href="${getPath('gallery.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">GALLERY</a>
                <div class="nav-dropdown" style="position: relative; display: inline-block;">
                    <a href="${getPath('portfolio.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">PORTFOLIO</a>
                    <div class="nav-dropdown-content" style="display: none; position: absolute; top: 100%; left: 0; background: white; min-width: 200px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 0.5rem 0; margin-top: 0; z-index: 1000; border-radius: 4px; flex-direction: column;">
                        <a href="${getPath('portfolio.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Portfolio</a>
                        ${portfolioDropdownItems}
                    </div>
                </div>
                <div class="nav-dropdown" style="position: relative; display: inline-block;">
                    <a href="#" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">SPACES</a>
                    <div class="nav-dropdown-content" style="display: none; position: absolute; top: 100%; left: 0; background: white; min-width: 200px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 0.5rem 0; margin-top: 0; z-index: 1000; border-radius: 4px; flex-direction: column;">
                        <a href="${getPath('kitchens-gallery.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Kitchens</a>
                        <a href="${getPath('bathrooms.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Bathrooms</a>
                        <a href="${getPath('bedrooms.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Bedrooms</a>
                        <a href="${getPath('dining-rooms.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Dining Rooms</a>
                        <a href="${getPath('living-spaces.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Living Spaces</a>
                        <a href="${getPath('office-spaces.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Office Spaces</a>
                        <a href="${getPath('entryways.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Entryways</a>
                        <a href="${getPath('bar-area.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Bar Area</a>
                        <a href="${getPath('laundry-rooms.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Laundry Rooms</a>
                        <a href="${getPath('outdoor-spaces.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">Outdoor Spaces</a>
                    </div>
                </div>
                <div class="nav-dropdown" style="position: relative; display: inline-block;">
                    <a href="${getPath('services.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">SERVICES</a>
                    <div class="nav-dropdown-content" style="display: none; position: absolute; top: 100%; left: 0; background: white; min-width: 200px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 0.5rem 0; margin-top: 0; z-index: 1000; border-radius: 4px; flex-direction: column;">
                        <a href="${getPath('services.html#residential-design')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Residential Design</a>
                        <a href="${getPath('kitchens.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Kitchen Design</a>
                        <a href="${getPath('services.html#interior-design-for-developers')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Interior Design for Developers</a>
                        <a href="${getPath('services.html#sourcing-and-purchasing-service')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Sourcing &amp; Purchasing</a>
                        <a href="${getPath('services.html#construction-supervision')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Construction Supervision</a>
                        <a href="${getPath('services.html#space-planning-concept-design')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Space Planning &amp; Concept Design</a>
                        <a href="${getPath('services.html#commercial-space-design')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Commercial Space Design</a>
                        <a href="${getPath('cities-we-serve.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">Cities We Serve</a>
                    </div>
                </div>
                <div class="nav-dropdown" style="position: relative; display: inline-block;">
                    <a href="${getPath('about.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">ABOUT</a>
                    <div class="nav-dropdown-content" style="display: none; position: absolute; top: 100%; left: 0; background: white; min-width: 200px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 0.5rem 0; margin-top: 0; z-index: 1000; border-radius: 4px; flex-direction: column;">
                        <a href="${getPath('about.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Who We Are</a>
                        <a href="${getPath('blog.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">Blog</a>
                    </div>
                </div>
                <a href="${getPath('contact.html')}?intent=call#contactForm" class="nav-cta" aria-label="Book a 15-minute intro call" title="15-minute intro call" style="display:inline-flex; align-items:center; justify-content:center; padding:0.65rem 1rem; border-radius:999px; border:1px solid #222a26; background:#222a26; color:#fff; font-size:0.85rem; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; text-decoration:none;">Book a call</a>
            </div>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Open menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>
</nav>
`;

    function ensureFooterStyles() {
        if (!document.head) return;
        if (document.getElementById('jacFooterStyles')) return;

        const style = document.createElement('style');
        style.id = 'jacFooterStyles';
        style.textContent = `
          /* Sitewide dark footer (2026) */
          .footer.footer--dark {
            background: #0b0f0e;
            color: rgba(255, 255, 255, 0.9);
            padding: 5rem 0 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.10);
          }
          .footer.footer--dark .footer-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            row-gap: 0.75rem;
            padding-bottom: 0.75rem;
            margin-bottom: 1.25rem;
            border-bottom: none;
          }
          .footer.footer--dark .footer-badges {
            display: inline-flex;
            align-items: center;
            gap: 0.65rem;
            flex-wrap: wrap;
          }
          .footer.footer--dark .footer-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none !important;
          }
          .footer.footer--dark .footer-badge img {
            height: 44px;
            width: auto;
            display: block;
          }
          .footer.footer--dark .footer-top-links {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
            justify-content: flex-end;
          }
          .footer.footer--dark .footer-social-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.55rem;
            padding: 0.55rem 0.9rem;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.86);
            font-size: 0.85rem;
            font-weight: 750;
            letter-spacing: -0.01em;
            text-decoration: none !important;
          }
          .footer.footer--dark .footer-social-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            text-decoration: none !important;
          }
          .footer.footer--dark .footer-social-btn svg {
            width: 18px;
            height: 18px;
            display: block;
          }
          .footer.footer--dark .footer-social-btn .houzz-mark {
            width: 18px;
            height: 18px;
            border-radius: 5px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #4dbc15;
            color: #0b0f0e;
            font-weight: 900;
            font-size: 0.75rem;
            line-height: 1;
          }
          .footer.footer--dark .footer-grid {
            display: grid;
            grid-template-columns: 1.35fr 1fr 1fr 1.15fr;
            gap: 3rem;
            align-items: start;
          }
          .footer.footer--dark h4 {
            margin: 0 0 1rem;
            font-size: 0.95rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.75);
            font-weight: 700;
          }
          .footer.footer--dark .footer-brand-title {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            color: #ffffff;
            text-decoration: none;
          }
          .footer.footer--dark .footer-brand-title img {
            height: 84px;
            width: auto;
            display: block;
          }
          .footer.footer--dark .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
          .footer.footer--dark p {
            color: rgba(255, 255, 255, 0.72);
            line-height: 1.6;
          }
          .footer.footer--dark ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .footer.footer--dark li + li { margin-top: 0.55rem; }
          .footer.footer--dark a {
            color: rgba(255, 255, 255, 0.82);
            text-decoration: none;
          }
          .footer.footer--dark a:hover {
            color: #ffffff;
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          .footer.footer--dark .footer-contact-lines {
            margin: 0 0 1rem;
            color: rgba(255, 255, 255, 0.72);
            line-height: 1.5;
          }
          .footer.footer--dark .footer-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.85rem 1.1rem;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: #ffffff;
            color: #0b0f0e !important;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-size: 0.8rem;
            text-decoration: none !important;
            box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35);
          }
          .footer.footer--dark .footer-cta:hover {
            text-decoration: none !important;
            filter: brightness(0.96);
          }
          .footer.footer--dark .footer-bottom {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.10);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
          }
          .footer.footer--dark .footer-bottom p {
            margin: 0;
            color: rgba(255, 255, 255, 0.55);
            font-size: 0.9rem;
          }
          .footer.footer--dark .footer-mini {
            display: inline-flex;
            gap: 0.9rem;
            align-items: center;
            color: rgba(255, 255, 255, 0.55);
            font-size: 0.9rem;
          }
          .footer.footer--dark .footer-mini a {
            color: rgba(255, 255, 255, 0.68);
          }
          .footer.footer--dark .footer-ig {
            display: inline-flex;
            align-items: center;
            gap: 0.55rem;
            color: rgba(255, 255, 255, 0.68);
            text-decoration: none;
          }
          .footer.footer--dark .footer-ig svg {
            width: 18px;
            height: 18px;
            display: block;
          }
          .footer.footer--dark .footer-ig:hover {
            color: #ffffff;
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          @media (max-width: 980px) {
            .footer.footer--dark .footer-grid {
              grid-template-columns: 1fr 1fr;
              gap: 2.25rem;
            }
          }
          @media (max-width: 640px) {
            .footer.footer--dark {
              padding: 4rem 0 1.6rem;
            }
            .footer.footer--dark .footer-top {
              justify-content: center;
              margin-bottom: 1rem;
            }
            .footer.footer--dark .footer-badges {
              justify-content: center;
            }
            .footer.footer--dark .footer-badge img {
              height: 40px;
            }
            .footer.footer--dark .footer-top-links {
              justify-content: center;
            }
            .footer.footer--dark .footer-brand-title img {
              height: 68px;
            }
            .footer.footer--dark .footer-grid {
              grid-template-columns: 1fr;
              gap: 1.9rem;
            }
            .footer.footer--dark .footer-bottom {
              margin-top: 2.25rem;
            }
          }
        `.trim();
        document.head.appendChild(style);
    }

    function ensureCitiesStyles() {
        if (!document.head) return;
        if (document.getElementById('inveroCitiesCss')) return;
        const link = document.createElement('link');
        link.id = 'inveroCitiesCss';
        link.rel = 'stylesheet';
        link.href = getPath(INVERO_CITIES_CSS_HREF);
        document.head.appendChild(link);
    }

    function isCitiesPage() {
        return currentPath.includes('/cities/');
    }

    // Cities that should feature a specific project (hero image + "See Project" button).
    // When multiple projects exist for a city, we pick the project with the most images in R2.
    // Source: "JAC project cities.pdf" (2026-01-29).
    const CITY_FEATURED_PROJECT = {
        'beverly-hills': 'alpine',
        'brentwood': 'medio',
        'calabasas': 'colette-way',
        'hancock-park': 'highland',
        'hollywood-hills': 'mulholland-drive', // (mulholland-drive has more images than presson-place)
        'indian-wells': 'via-pisa',
        'la-quinta': 'columbus-way', // (columbus-way has more images than ronda)
        'laguna-beach': 'monaco',
        'mar-vista': 'frances', // (frances has more images than colby)
        'marina-del-rey': 'sunnyside',
        'montana': 'river-homestead',
        'palm-desert': 'peary-way', // (peary-way has more images than vale-crest / brown-deer-park)
        'santa-monica': '22nd-street',
        'sherman-oaks': 'valley-vista',
        'studio-city': 'galewood',
        'venice': 'oakwood',
        'west-hollywood': 'sherbourne',
        'westwood': 'wilshire',
    };

    function applyCityFeaturedProject() {
        if (!isCitiesPage()) return;

        const DEFAULT_R2_BASE = 'https://jacinteriorscdn.com';
        const R2_BASE = String(window.R2_IMAGE_BASE || DEFAULT_R2_BASE).replace(/\/+$/, '');

        function getCitySlugFromPath() {
            const m = currentPath.match(/\/cities\/([^/?#]+)\.html/i);
            return m ? decodeURIComponent(m[1]) : '';
        }

        function normalizeCitySlug(slug) {
            const s = String(slug || '').trim().toLowerCase();
            // Handle duplicate files like "west-hollywood 2.html"
            return s.replace(/\s+2$/, '').replace(/-2$/, '');
        }

        function buildProjectImageCandidates(projectSlug, maxN) {
            const slug = String(projectSlug || '').trim();
            if (!slug) return [];
            const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];
            const out = [];
            const N = Math.max(1, Math.min(Number(maxN || 18), 40));
            for (let i = 1; i <= N; i += 1) {
                for (const ext of exts) {
                    out.push(`${R2_BASE}/projects/${slug}/${slug}-${i}.${ext}`);
                }
            }
            return out;
        }

        function findHeroImageEl() {
            return (
                document.querySelector('.city-hero-img-wrapper img') ||
                document.querySelector('.city-hero-media img') ||
                document.querySelector('.parallax-image img') ||
                document.querySelector('main img') ||
                document.querySelector('img')
            );
        }

        function ensureSeeProjectButton(projectSlug, heroImg) {
            const href = getPath(`projects/${projectSlug}.html`);

            // Only look for an existing link near the hero (avoid matching nav dropdown links).
            const heroMedia = heroImg ? heroImg.closest('.city-hero-media') : null;
            const existingNearHero = heroMedia
                ? (heroMedia.querySelector('a.city-see-project-btn') ||
                    heroMedia.querySelector(`a[href*="projects/${projectSlug}.html"]`) ||
                    Array.from(heroMedia.querySelectorAll('a')).find((a) => {
                        const txt = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
                        return txt === 'see project';
                    }))
                : null;

            // Some pages place "See Project" in the top-right city actions instead of below the hero.
            const existingInActions = Array.from(document.querySelectorAll('.city-actions a')).find((a) => {
                const hrefAttr = String(a.getAttribute('href') || '');
                const txt = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
                return txt === 'see project' || hrefAttr.includes('/projects/') || hrefAttr.includes('projects/');
            });

            if (existingNearHero || existingInActions) return;

            const btn = document.createElement('a');
            btn.className = 'btn btn-primary city-see-project-btn';
            btn.href = href;
            btn.textContent = 'See Project';

            const wrap = document.createElement('div');
            wrap.className = 'city-project-cta';
            wrap.style.marginTop = '1rem';
            wrap.appendChild(btn);

            // Try to place directly beneath the hero image.
            const container = heroMedia ? heroMedia.querySelector('.container') : null;
            const imgWrapper = heroMedia ? heroMedia.querySelector('.city-hero-img-wrapper') : null;

            if (container && imgWrapper && imgWrapper.parentNode) {
                imgWrapper.insertAdjacentElement('afterend', wrap);
                return;
            }

            if (heroImg && heroImg.parentNode) {
                heroImg.insertAdjacentElement('afterend', wrap);
            }
        }

        function trySetLandscapeFromCandidates(imgEl, candidates) {
            if (!imgEl || !candidates || !candidates.length) return;
            if (imgEl.dataset && imgEl.dataset.cityProjectAttempted === '1') return;
            if (imgEl.dataset) imgEl.dataset.cityProjectAttempted = '1';

            // Prevent city-hero auto replacement (we want project imagery here).
            if (imgEl.dataset) imgEl.dataset.cityR2Skip = '1';

            const original = imgEl.getAttribute('src') || '';
            let firstLoaded = '';
            let i = 0;

            const probe = () => {
                if (i >= candidates.length) {
                    if (firstLoaded) return;
                    if (original) imgEl.setAttribute('src', original);
                    return;
                }

                const url = candidates[i++];
                const tester = new Image();
                tester.onload = () => {
                    // Set the first valid image immediately for faster paint,
                    // then keep probing until we find a landscape candidate.
                    if (!firstLoaded) {
                        firstLoaded = url;
                        imgEl.setAttribute('src', url);
                    }
                    const w = tester.naturalWidth || 0;
                    const h = tester.naturalHeight || 0;
                    const isLandscape = w > 0 && h > 0 && w >= h * 1.08;
                    if (isLandscape) {
                        imgEl.setAttribute('src', url);
                        return;
                    }
                    probe();
                };
                tester.onerror = () => probe();
                tester.src = url;
            };

            probe();
        }

        const citySlugRaw = getCitySlugFromPath();
        const citySlug = normalizeCitySlug(citySlugRaw);
        const projectSlug = CITY_FEATURED_PROJECT[citySlug];
        if (!projectSlug) return;

        const heroImg = findHeroImageEl();
        if (!heroImg) return;

        heroImg.setAttribute('alt', `${projectSlug.replace(/-/g, ' ')} project in ${citySlug.replace(/-/g, ' ')}`);

        ensureSeeProjectButton(projectSlug, heroImg);
        trySetLandscapeFromCandidates(heroImg, buildProjectImageCandidates(projectSlug, 18));
    }

    // Try to apply a city-specific hero image from R2 (if it exists).
    // If no matching object exists, we keep the current image.
    function applyCityR2Images() {
        const DEFAULT_R2_BASE = 'https://jacinteriorscdn.com';
        const R2_BASE = String(window.R2_IMAGE_BASE || DEFAULT_R2_BASE).replace(/\/+$/, '');

        function slugifyCitySlugFromHref(href) {
            const m = String(href || '').match(/cities\/([^/?#]+)\.html/i);
            return m ? m[1] : '';
        }

        function getCitySlugFromPath() {
            const m = currentPath.match(/\/cities\/([^/?#]+)\.html/i);
            return m ? m[1] : '';
        }

        function trySetImageFromCandidates(imgEl, candidates) {
            if (!imgEl || !candidates || !candidates.length) return;
            // Allow specific pages to pin a custom hero image.
            if (imgEl.dataset && imgEl.dataset.cityR2Skip === '1') return;
            if (imgEl.dataset.cityR2Attempted === '1') return;
            imgEl.dataset.cityR2Attempted = '1';

            const original = imgEl.getAttribute('src') || '';
            let i = 0;

            const probe = () => {
                if (i >= candidates.length) {
                    // Restore original if we overwrote it with a failing candidate.
                    if (original) imgEl.setAttribute('src', original);
                    return;
                }
                const url = candidates[i++];
                const tester = new Image();
                tester.onload = () => {
                    imgEl.setAttribute('src', url);
                };
                tester.onerror = () => probe();
                tester.src = url;
            };

            probe();
        }

        function buildCityCandidates(citySlug, hintSrc) {
            if (!citySlug) return [];
            const slug = citySlug;
            const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];
            const stems = [
                `${slug}-hero`,
                `${slug}-1`,
                `${slug}`,
                'hero',
                '1',
                'cover',
            ];
            const prefixes = [
                `cities/${slug}/`,
            ];

            const out = [];
            // If we already have a filename (local hero image), try that exact name first.
            const hint = String(hintSrc || '').trim();
            const baseName = hint ? hint.split('?')[0].split('#')[0].split('/').pop() : '';
            if (baseName && /\.[a-z0-9]+$/i.test(baseName)) {
                prefixes.forEach((pre) => out.push(`${R2_BASE}/${pre}${baseName}`));
            }
            prefixes.forEach((pre) => {
                stems.forEach((stem) => {
                    exts.forEach((ext) => {
                        out.push(`${R2_BASE}/${pre}${stem}.${ext}`);
                    });
                });
            });
            return out;
        }

        // 1) Individual city pages: set the main hero image if a matching R2 object exists.
        if (isCitiesPage()) {
            const slug = getCitySlugFromPath();
            const hero =
                document.querySelector('.city-hero-img-wrapper img') ||
                document.querySelector('.city-hero-media img') ||
                null;
            if (hero && slug) {
                trySetImageFromCandidates(hero, buildCityCandidates(slug, hero.getAttribute('src') || ''));
            }
        }

        // 2) Cities We Serve cards: for each region card, try using the first city link's R2 hero.
        // Cards 0 and 1 use fixed R2 images set in HTML; skip overwriting.
        if (filename === 'cities-we-serve.html') {
            const cards = Array.from(document.querySelectorAll('.project-list-item'));
            cards.forEach((card, index) => {
                if (index === 0) return; // Beverly Hills & Westside: 22nd-street-1.jpg from R2
                if (index === 1) return; // Beach Cities: frances-4.jpg from R2
                if (index === 2) return; // San Fernando Valley: colette-way-5.jpg from R2
                if (index === 3) return; // Greater Los Angeles: mulholland-drive-5.jpg from R2
                const firstCityLink = card.querySelector('.city-tags-container a.city-tag[href*="cities/"]');
                const slug = firstCityLink ? slugifyCitySlugFromHref(firstCityLink.getAttribute('href') || '') : '';
                if (!slug) return;
                const img = card.querySelector('.project-list-image img.region-img.active') || card.querySelector('.project-list-image img');
                if (!img) return;
                trySetImageFromCandidates(img, buildCityCandidates(slug, img.getAttribute('src') || ''));
            });
        }
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function stripInlineStyles(root) {
        if (!root) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
        while (walker.nextNode()) {
            walker.currentNode.removeAttribute('style');
        }
        if (root.removeAttribute) root.removeAttribute('style');
    }

    // Convert legacy city pages (black header + inline styles) into shared Invero-style template
    function transformLegacyCityPage() {
        if (!isCitiesPage()) return;

        // New template pages (e.g. pacific-palisades) already carry this class.
        if (document.body && document.body.classList.contains('city-page')) {
            ensureCitiesStyles();
            return;
        }

        const firstSection = document.querySelector('section');
        const h1 = firstSection ? firstSection.querySelector('h1') : null;
        const cityName = (h1 && h1.textContent) ? h1.textContent.trim() : (document.title.split('|')[0] || '').trim();
        const subtitleEl = (h1 && h1.parentElement) ? h1.parentElement.querySelector('p') : null;
        const subtitle = subtitleEl ? subtitleEl.textContent.trim() : '';

        // Meta (Region / Service / Status) from legacy header right column
        const meta = [];
        if (firstSection) {
            const headerFlex = firstSection.querySelector('div[style*="display: flex"]');
            const metaHolder = headerFlex ? headerFlex.querySelector('div[style*="display: flex"]') : null;
            const metaItems = metaHolder ? Array.from(metaHolder.children) : [];
            metaItems.forEach((item) => {
                const spans = item.querySelectorAll('span');
                if (spans.length >= 2) {
                    const label = spans[0].textContent.trim();
                    const value = spans[1].textContent.trim();
                    if (label && value) meta.push([label, value]);
                }
            });
        }

        // Find first meaningful image for the hero (avoid navbar logo)
        const allImgs = Array.from(document.querySelectorAll('img'));
        const heroImg = allImgs.find((img) => {
            if (img.closest('nav')) return false;
            const src = img.getAttribute('src') || '';
            return !!src && !src.includes(LOGO_SRC);
        });
        const heroSrc = heroImg ? (heroImg.getAttribute('src') || '') : '';
        const heroAlt = heroImg ? (heroImg.getAttribute('alt') || `${cityName} interior design`) : `${cityName} interior design`;

        // Collect legacy content rows (each is a flex row with image + copy)
        const candidateSections = Array.from(document.querySelectorAll('section'));
        const contentSection = candidateSections.find((s) => s !== firstSection && s.querySelector('h2') && s.querySelector('img'));
        const contentContainer = contentSection ? (contentSection.querySelector('.container') || contentSection.querySelector('div')) : null;
        const rows = contentContainer ? Array.from(contentContainer.children).filter((el) => el.querySelector && el.querySelector('h2')) : [];

        const blocksHtml = rows.map((row, idx) => {
            const label = String(idx + 1).padStart(2, '0');
            const textCol =
                Array.from(row.children || []).find((child) => child && child.querySelector && child.querySelector('h2')) ||
                row.querySelector('h2')?.parentElement ||
                row;

            const titleEl = textCol.querySelector ? textCol.querySelector('h2') : null;
            const title = titleEl ? titleEl.textContent.trim() : `Section ${idx + 1}`;

            const clone = textCol.cloneNode(true);
            stripInlineStyles(clone);
            // Remove the title from content to avoid duplication
            const cloneTitle = clone.querySelector ? clone.querySelector('h2') : null;
            if (cloneTitle) cloneTitle.remove();
            // Remove images (we use a single hero image for a cleaner Invero feel)
            (clone.querySelectorAll ? clone.querySelectorAll('img') : []).forEach((img) => img.remove());

            const contentHtml = (clone.innerHTML || '').trim();
            return `
              <div class="story-block">
                <div class="story-label">${label}</div>
                <div class="story-content">
                  <h2 class="story-title">${escapeHtml(title)}</h2>
                  ${contentHtml}
                </div>
              </div>
            `.trim();
        }).join('\n');

        const contactHref = `${getPath('contact.html')}?intent=call#contactForm`;
        const phoneHref = `tel:${FOOTER_PHONE_DISPLAY}`;
        const emailHref = `mailto:${FOOTER_EMAIL}`;

        const metaGridHtml = meta.length
            ? `
              <div class="city-meta-grid" aria-label="Project details">
                ${meta.slice(0, 3).map(([k, v]) => `
                  <div class="city-meta-item"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>
                `.trim()).join('')}
              </div>
            `.trim()
            : '';

        const mainHtml = `
          <main class="city-main">
            <section class="city-top">
              <div class="container">
                <div class="city-top-grid">
                  <div>
                    <span class="city-kicker">Cities we serve</span>
                    <h1>${escapeHtml(cityName || 'City')}</h1>
                    ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
                    <a class="city-readabout" href="#about" aria-label="Read about ${escapeHtml(cityName)}">
                      Read about
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M5 12h12" stroke-linecap="round"></path>
                        <path d="M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"></path>
                      </svg>
                    </a>
                    ${metaGridHtml}
                  </div>
                  <div>
                    <p>Full-service interior design tailored to the way you live—designed with clarity, structure, and a refined, timeless point of view.</p>
                    <div class="city-actions">
                      <a class="btn btn-primary" href="${contactHref}">Book a call</a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            ${heroSrc ? `
              <section class="city-hero-media" aria-label="${escapeHtml(cityName)} hero image">
                <div class="container">
                  <div class="city-hero-img-wrapper">
                    <img src="${escapeHtml(heroSrc)}" alt="${escapeHtml(heroAlt)}" loading="lazy" decoding="async">
                  </div>
                </div>
              </section>
            `.trim() : ''}

            <section class="section" id="about">
              <div class="container">
                <div class="story-blocks" aria-label="City story">
                  ${blocksHtml || ''}
                </div>
              </div>
            </section>

            <section class="city-cta" id="ready">
              <div class="container">
                <div class="city-cta-inner">
                  <h2>Ready to begin?</h2>
                  <p><strong>Call:</strong> <a class="inline" href="${phoneHref}">${FOOTER_PHONE_DISPLAY}</a> &nbsp; | &nbsp; <strong>Email:</strong> <a class="inline" href="${emailHref}">${FOOTER_EMAIL}</a></p>
                  <div class="cta-links">
                    <a class="btn btn-solid-white" href="${contactHref}">Book a call</a>
                  </div>
                </div>
              </div>
            </section>

            <section class="section" id="contact-us">
              <div class="container">
                <div class="city-section-head">
                  <span class="rebuild-kicker">Contact</span>
                  <h2>Contact us.</h2>
                  <p>Tell us about your project and we’ll reply within 1–2 business days.</p>
                </div>
                <a class="btn btn-primary" href="${contactHref}">Book a call</a>
              </div>
            </section>
          </main>
        `.trim();

        ensureCitiesStyles();
        if (document.body) document.body.classList.add('city-page');

        const nav = document.querySelector('nav.navbar');
        const footer = document.querySelector('footer');
        const mobile = document.getElementById('mobileCtaBar');

        Array.from(document.body.children).forEach((el) => {
            if (el === nav) return;
            if (el === footer) return;
            if (el === mobile) return;
            if (el.tagName === 'SCRIPT') return;
            el.remove();
        });

        const existingMain = document.querySelector('main.city-main');
        if (existingMain) existingMain.remove();

        if (nav) {
            nav.insertAdjacentHTML('afterend', mainHtml);
        } else {
            document.body.insertAdjacentHTML('afterbegin', mainHtml);
        }
    }

    function normalizeContactButtons() {
        if (!document.body) return;
        const contactHref = `${getPath('contact.html')}?intent=call#contactForm`;

        const targets = new Set([
            'contact us',
            'get in touch',
            "let's get in touch",
            'lets get in touch',
            'let’s get in touch',
            'start your project',
            'request a call'
        ]);

        const links = Array.from(document.querySelectorAll('a'));
        links.forEach((a) => {
            if (!a || !a.textContent) return;
            if (a.closest('nav.navbar')) return;  // don't touch nav links like CONTACT
            if (a.closest('footer')) return;
            const txt = a.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
            if (!targets.has(txt)) return;

            // If this is a secondary CTA next to an existing "Book a call", remove it.
            const isSecondaryVariant = txt !== 'book a call';
            if (isSecondaryVariant) {
                const scope = a.parentElement || null;
                if (scope) {
                    const sibs = Array.from(scope.querySelectorAll('a')).filter((x) => x && x !== a);
                    const hasBookSibling = sibs.some((x) => {
                        const t = (x.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
                        return t === 'book a call';
                    });
                    if (hasBookSibling) {
                        a.remove();
                        return;
                    }
                }
            }

            a.setAttribute('href', contactHref);

            // Preserve SVG icons if present
            const svg = a.querySelector('svg');
            if (svg) {
                const svgClone = svg.cloneNode(true);
                a.innerHTML = '';
                a.appendChild(document.createTextNode('Book a call'));
                a.appendChild(svgClone);
            } else {
                a.textContent = 'Book a call';
            }
        });
    }

    function removeLegacyBottomCtas() {
        if (!document.body) return;

        // City pages: remove old "Ready to start your project?" blocks.
        document.querySelectorAll('section.city-cta').forEach((el) => el.remove());

        // Home page: remove the old giant dark CTA (Ready to transform your space?).
        const inlineSections = Array.from(document.querySelectorAll('section[style]'));
        inlineSections.forEach((section) => {
            const styleText = (section.getAttribute('style') || '').toLowerCase().replace(/\s+/g, '');
            const looksLikeOldDarkHomeCta =
                (styleText.includes('background:#111') || styleText.includes('background-color:#111')) &&
                styleText.includes('padding:8rem0');
            if (looksLikeOldDarkHomeCta) {
                const h2 = section.querySelector('h2');
                const a = section.querySelector('a');
                const h2Text = (h2?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
                const aText = (a?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
                if (h2Text.includes('ready to transform') && aText.includes('book a call')) {
                    section.remove();
                }
            }

            // Legacy light CTA blocks on many pages (Ready to Transform Your X? / Start Your Project).
            const looksLikeLegacyLightCta =
                styleText.includes('background:#fafafa') &&
                styleText.includes('text-align:center');
            if (looksLikeLegacyLightCta) {
                const hasPrimaryBtn = !!section.querySelector('a.btn.btn-primary');
                const hasH2 = !!section.querySelector('h2');
                if (hasPrimaryBtn && hasH2) {
                    section.remove();
                }
            }
        });
    }

    function ensureSiteCta() {
        if (!document.body) return;
        if (document.getElementById('siteCta')) return;
        // If the page already has its own CTA section, don't inject a duplicate.
        if (document.querySelector('.services-cta')) return;

        const contactHref = `${getPath('contact.html')}?intent=call#contactForm`;

        const html = `
<section class="site-cta" id="siteCta" aria-label="Let's work together">
  <div class="container">
    <div class="site-cta-card">
      <div class="site-cta-copy">
        <div class="site-cta-eyebrow">LET’S WORK TOGETHER</div>
        <h2 class="site-cta-title">Ready to begin?</h2>
        <p class="site-cta-subtitle">
          Start with a 15‑minute intro call—so we can understand your goals and recommend the right next step.
        </p>
      </div>
      <a class="site-cta-button" href="${contactHref}">
        <span>Book a call</span><span class="site-cta-arrow" aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</section>
        `.trim();

        const footer = document.querySelector('footer');
        if (footer && footer.parentElement) {
            footer.insertAdjacentHTML('beforebegin', html);
        } else {
            document.body.insertAdjacentHTML('beforeend', html);
        }
    }

    // Gradually replace repeated inline styles with CSS classes.
    // This lets us unify spacing/typography without editing dozens of HTML files at once.
    function normalizeLegacyInlineSections() {
        const sections = Array.from(document.querySelectorAll('section[style]'));
        sections.forEach((section) => {
            const styleText = (section.getAttribute('style') || '').toLowerCase();

            const isHeroDark =
                /padding\s*:\s*3rem\s+0/.test(styleText) &&
                (/background\s*:\s*#1a1a1a/.test(styleText) || /background-color\s*:\s*#1a1a1a/.test(styleText)) &&
                /color\s*:\s*(white|#fff)/.test(styleText) &&
                /margin-top\s*:\s*0/.test(styleText);

            if (isHeroDark) {
                section.classList.add('section-hero-dark');
                section.style.removeProperty('padding');
                section.style.removeProperty('background');
                section.style.removeProperty('background-color');
                section.style.removeProperty('color');
                section.style.removeProperty('margin-top');
            }

            if (/padding\s*:\s*6rem\s+0/.test(styleText)) {
                section.classList.add('section-pad-6');
                section.style.removeProperty('padding');
            } else if (/padding\s*:\s*4rem\s+0/.test(styleText)) {
                section.classList.add('section-pad-4');
                section.style.removeProperty('padding');
            }

            // If we removed everything, drop the attribute entirely.
            const after = (section.getAttribute('style') || '').trim();
            if (!after) section.removeAttribute('style');
        });
    }

    function normalizeLegacyContainers() {
        const containers = Array.from(document.querySelectorAll('.container[style]'));
        containers.forEach((el) => {
            const styleText = (el.getAttribute('style') || '').toLowerCase();

            // Keep layout identical, just move max-width into a class.
            if (/max-width\\s*:\\s*1200px/.test(styleText)) {
                el.classList.add('container--1200');
                el.style.removeProperty('max-width');
            } else if (/max-width\\s*:\\s*1320px/.test(styleText)) {
                el.classList.add('container--1320');
                el.style.removeProperty('max-width');
            } else if (/max-width\\s*:\\s*1340px/.test(styleText)) {
                el.classList.add('container--1340');
                el.style.removeProperty('max-width');
            }

            const after = (el.getAttribute('style') || '').trim();
            if (!after) el.removeAttribute('style');
        });
    }

    function normalizeLegacyHeroTypography() {
        const titleEls = Array.from(document.querySelectorAll('h1[style]'));
        titleEls.forEach((h1) => {
            const s = (h1.getAttribute('style') || '').toLowerCase();
            const looksLikeLegacyHeroTitle =
                /font-size\\s*:\\s*3\\.5rem/.test(s) &&
                /font-weight\\s*:\\s*500/.test(s) &&
                /letter-spacing\\s*:\\s*-1\\.5px/.test(s) &&
                /line-height\\s*:\\s*1\\.1/.test(s) &&
                /color\\s*:\\s*(white|#fff)/.test(s);

            if (!looksLikeLegacyHeroTitle) return;

            h1.classList.add('hero-title');
            h1.style.removeProperty('font-size');
            h1.style.removeProperty('font-weight');
            h1.style.removeProperty('margin');
            h1.style.removeProperty('letter-spacing');
            h1.style.removeProperty('line-height');
            h1.style.removeProperty('color');

            const afterTitle = (h1.getAttribute('style') || '').trim();
            if (!afterTitle) h1.removeAttribute('style');

            // Subtitle: usually the next <p> in the same container.
            const scope = h1.parentElement || null;
            if (!scope) return;
            const p = scope.querySelector('p[style]');
            if (!p) return;

            const ps = (p.getAttribute('style') || '').toLowerCase();
            const looksLikeLegacyHeroSubtitle =
                /font-size\\s*:\\s*16px/.test(ps) &&
                /color\\s*:\\s*#ccc/.test(ps) &&
                /line-height\\s*:\\s*1\\.6/.test(ps) &&
                /font-weight\\s*:\\s*400/.test(ps) &&
                /max-width\\s*:\\s*700px/.test(ps);

            if (!looksLikeLegacyHeroSubtitle) return;

            p.classList.add('hero-subtitle');
            p.style.removeProperty('font-size');
            p.style.removeProperty('color');
            p.style.removeProperty('line-height');
            p.style.removeProperty('font-weight');
            p.style.removeProperty('max-width');

            const afterP = (p.getAttribute('style') || '').trim();
            if (!afterP) p.removeAttribute('style');
        });
    }

    function ensureFooter() {
        if (!document.body) return;
        ensureFooterStyles();

        const year = new Date().getFullYear();
        const addressHtml = FOOTER_ADDRESS_LINES.map(l => l.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('<br>');
        const contactHref = `${getPath('contact.html')}?intent=call#contactForm`;

        const footerHTML = `
<footer class="footer footer--dark" aria-label="Footer">
  <div class="container">
    <div class="footer-top" aria-label="Social links">
      <div class="footer-badges" aria-label="Awards">
        <a class="footer-badge" href="https://www.houzz.com/professionals/interior-designers-and-decorators/jac-interiors-pfvwus-pf~914469284" target="_blank" rel="noopener" aria-label="Best of Houzz 2024 Design">
          <img src="${getAssetUrl('assets/images/badges/houzz-best-of-2024-design.png')}" alt="Best of Houzz 2024 Design" loading="lazy" decoding="async">
        </a>
        <a class="footer-badge" href="https://www.houzz.com/professionals/interior-designers-and-decorators/jac-interiors-pfvwus-pf~914469284" target="_blank" rel="noopener" aria-label="Best of Houzz 2024 Service">
          <img src="${getAssetUrl('assets/images/badges/houzz-best-of-2024-service.png')}" alt="Best of Houzz 2024 Service" loading="lazy" decoding="async">
        </a>
      </div>
      <div class="footer-top-links">
        <a class="footer-social-btn" href="https://www.instagram.com/jacinteriors" target="_blank" rel="noopener" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3.5" y="3.5" width="17" height="17" rx="4"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <circle cx="17.5" cy="6.6" r="0.8" fill="currentColor" stroke="none"></circle>
          </svg>
          <span>Instagram</span>
        </a>
        <a class="footer-social-btn" href="https://www.houzz.com/professionals/interior-designers-and-decorators/jac-interiors-pfvwus-pf~914469284?" target="_blank" rel="noopener" aria-label="Houzz">
          <span class="houzz-mark" aria-hidden="true">H</span>
          <span>Houzz</span>
        </a>
      </div>
    </div>
    <div class="footer-grid">
      <div class="footer-col">
        <a class="footer-brand-title" href="${getPath('index.html')}" aria-label="Home">
          <img src="${getPath(FOOTER_LOGO_SRC)}" alt="JAC Interiors">
          <span class="sr-only">JAC Interiors</span>
        </a>
        <p style="margin: 1rem 0 1.25rem;">
          Full-service interior design studio creating refined, timeless spaces across Los Angeles and beyond.
        </p>
      </div>

      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="${getPath('services.html')}#residential-design">Residential Design</a></li>
          <li><a href="${getPath('kitchens.html')}">Kitchen Design</a></li>
          <li><a href="${getPath('services.html')}#interior-design-for-developers">Interior Design for Developers</a></li>
          <li><a href="${getPath('services.html')}#sourcing-and-purchasing-service">Sourcing &amp; Purchasing</a></li>
          <li><a href="${getPath('services.html')}#construction-supervision">Construction Supervision</a></li>
          <li><a href="${getPath('services.html')}#space-planning-concept-design">Space Planning &amp; Concept Design</a></li>
          <li><a href="${getPath('services.html')}#commercial-space-design">Commercial Space Design</a></li>
          <li><a href="${getPath('cities-we-serve.html')}">Cities We Serve</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="${getPath('about.html')}">Who We Are</a></li>
          <li><a href="${getPath('portfolio.html')}">Portfolio</a></li>
          <li><a href="${getPath('blog.html')}">Blog</a></li>
          <li><a href="${getPath('contact.html')}">Contact</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contact</h4>
        <p class="footer-contact-lines">${addressHtml}</p>
        <p style="margin: 0 0 0.75rem;">
          <a href="tel:${FOOTER_PHONE_DISPLAY}">${FOOTER_PHONE_DISPLAY}</a><br>
          <a href="mailto:${FOOTER_EMAIL}">${FOOTER_EMAIL}</a>
        </p>
        <a class="footer-cta" href="${contactHref}">Book a call</a>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; ${year} JAC Interiors, LLC. All Rights Reserved.</p>
      <div class="footer-mini" aria-label="Footer links">
        <span>Los Angeles + Florida</span>
      </div>
    </div>
  </div>
</footer>
        `.trim();

        const existingFooter = document.querySelector('footer');
        if (existingFooter) {
            existingFooter.outerHTML = footerHTML;
        } else {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    }

    function ensureMobileCtaBar() {
        if (!document.body) return;
        if (document.getElementById('mobileCtaBar')) return;

        const phoneDisplay = '213-397-0206';
        const phoneTel = 'tel:+12133970206';
        const contactHref = `${getPath('contact.html')}?intent=call#contactForm`;

        const bar = document.createElement('div');
        bar.id = 'mobileCtaBar';
        bar.className = 'mobile-cta-bar';
        bar.setAttribute('role', 'navigation');
        bar.setAttribute('aria-label', 'Quick contact');
        bar.innerHTML = `
          <a class="mobile-cta-btn mobile-cta-btn--primary" href="${phoneTel}" aria-label="Call ${phoneDisplay}">Call</a>
          <a class="mobile-cta-btn mobile-cta-btn--ghost" href="${contactHref}" aria-label="Book a call">Book</a>
        `.trim();

        document.body.appendChild(bar);
        document.body.classList.add('has-mobile-cta');
    }
    
    // Load navbar instantly (no XHR - completely non-blocking)
    function loadNavbar() {
        // Remove any existing navbar
        const existingNav = document.querySelector('nav.navbar');
        if (existingNav) existingNav.remove();
        
        // Insert navbar immediately
        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', navbarHTML);
            const nav = document.querySelector('nav.navbar');
            if (nav) {
                setActiveNav();
                initDropdowns();
                initMobileMenu(nav);
                enforceNavbarStyles(nav);
                nav.dataset.jacNavInited = '1';
                setTimeout(() => enforceNavbarStyles(nav), 10);
            }
            ensureMobileCtaBar();
            transformLegacyCityPage();
            applyCityR2Images();
            applyCityFeaturedProject();
            ensureAnalytics();
            const normalizeAll = () => {
                normalizeLegacyInlineSections();
                normalizeLegacyContainers();
                normalizeLegacyHeroTypography();
            };
            // Defer CTA and footer so they run after DOM is parsed. When load-navbar runs at start
            // of body (e.g. Portfolio), body only has [nav, script] — if we inject footer/CTA now,
            // they appear before the page's real content and the black bar + project list disappear.
            function runWhenDomReady(fn) {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', fn);
                } else {
                    setTimeout(fn, 0);
                }
            }
            function deferredBody() {
                ensureFooter();
                removeLegacyBottomCtas();
                ensureSiteCta();
            }
            normalizeAll();
            setTimeout(normalizeAll, 0);
            setTimeout(normalizeAll, 250);
            runWhenDomReady(deferredBody);
            setTimeout(deferredBody, 250);
            setTimeout(deferredBody, 600);
            normalizeContactButtons();
            ensureSeoMeta();
        }
    }
    
    // Try to load navbar - multiple attempts to ensure it works
    function tryLoad() {
        if (document.body) {
            loadNavbar();
            return true;
        }
        return false;
    }
    
    // Try immediately
    if (!tryLoad()) {
        // Try on DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryLoad);
        }
        // Also try on window load
        window.addEventListener('load', tryLoad);
        // And try repeatedly until body exists
        const interval = setInterval(() => {
            if (tryLoad()) {
                clearInterval(interval);
            }
        }, 50);
        // Stop trying after 5 seconds
        setTimeout(() => clearInterval(interval), 5000);
    }
    
    // Always re-run when DOM is ready so menu works on every page (Portfolio, About, etc.)
    document.addEventListener('DOMContentLoaded', function() {
        if (!document.body) return;
        var nav = document.querySelector('nav.navbar');
        if (!nav) {
            loadNavbar();
            return;
        }
        if (nav.dataset.jacNavInited) return;
        nav.dataset.jacNavInited = '1';
        setActiveNav();
        initDropdowns();
        initMobileMenu(nav);
        enforceNavbarStyles(nav);
    });

    // Guarantee navbar is present and menu works on Portfolio and all pages (runs after everything has loaded)
    window.addEventListener('load', function() {
        if (!document.body) return;
        var nav = document.querySelector('nav.navbar');
        if (!nav) {
            loadNavbar();
            return;
        }
        if (nav.dataset.jacNavInited) return;
        nav.dataset.jacNavInited = '1';
        setActiveNav();
        initDropdowns();
        initMobileMenu(nav);
        enforceNavbarStyles(nav);
    });

    // Delayed retries so menu works even if nav was injected late (e.g. Portfolio, slow connections)
    function ensureNavInited() {
        if (!document.body) return;
        var nav = document.querySelector('nav.navbar');
        if (!nav) { loadNavbar(); return; }
        if (nav.dataset.jacNavInited) return;
        nav.dataset.jacNavInited = '1';
        setActiveNav();
        initDropdowns();
        initMobileMenu(nav);
        enforceNavbarStyles(nav);
    }
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(ensureNavInited, 100);
        setTimeout(ensureNavInited, 400);
    });
    window.addEventListener('load', function() {
        setTimeout(ensureNavInited, 50);
    });

    // Temporary image labels: disabled so grey boxes do not appear below images on Services and other pages.
    (function initShowImageLabels() {
        function getShowNames() { return false; }
        function filenameFromSrc(src) {
            if (!src || typeof src !== 'string') return '';
            try {
                var path = src.split('?')[0];
                return path.split('/').pop() || path || '';
            } catch (_) { return ''; }
        }
        function labelForImg(img) {
            var name = (img.getAttribute && img.getAttribute('data-r2-local-src')) || '';
            if (name) {
                name = name.split('/').pop() || name;
            }
            if (!name && (img.src || img.currentSrc)) {
                name = filenameFromSrc(img.currentSrc || img.src);
            }
            return name || '(no name)';
        }
        function addLabelToImg(img) {
            if (img.dataset && img.dataset.jacImageLabelAdded) return;
            var name = labelForImg(img);
            var wrap = document.createElement('div');
            wrap.className = 'jac-image-label-wrap';
            wrap.setAttribute('data-jac-label', '1');
            wrap.style.cssText = 'position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);color:#fff;font-size:10px;line-height:1.2;padding:4px 6px;font-family:monospace;word-break:break-all;pointer-events:none;';
            wrap.textContent = name;
            var parent = img.parentElement;
            if (!parent) return;
            var needPosition = getComputedStyle(parent).position === 'static';
            if (needPosition) parent.style.position = 'relative';
            if (parent.querySelector('[data-jac-label="1"]')) return;
            parent.appendChild(wrap);
            if (img.dataset) img.dataset.jacImageLabelAdded = '1';
        }
        function runLabels() {
            if (!getShowNames()) return;
            document.querySelectorAll('img').forEach(addLabelToImg);
        }
        function injectLabelStyles() {
            if (document.getElementById('jac-image-labels-style')) return;
            var style = document.createElement('style');
            style.id = 'jac-image-labels-style';
            style.textContent = '.jac-image-label-wrap{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);color:#fff;font-size:10px;padding:4px 6px;font-family:monospace;word-break:break-all;pointer-events:none;}';
            document.head.appendChild(style);
        }
        function onLoad() {
            if (!getShowNames()) return;
            injectLabelStyles();
            runLabels();
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(m) {
                    if (m.addedNodes && m.addedNodes.length) {
                        [].forEach.call(m.addedNodes, function(n) {
                            if (n.nodeType === 1) {
                                if (n.tagName === 'IMG') addLabelToImg(n);
                                if (n.querySelectorAll) n.querySelectorAll('img').forEach(addLabelToImg);
                            }
                        });
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
        if (document.readyState === 'complete') {
            onLoad();
        } else {
            window.addEventListener('load', onLoad);
        }
    })();
})();
