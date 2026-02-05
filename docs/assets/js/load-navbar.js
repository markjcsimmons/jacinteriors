// Fixed Navbar Loader - Inline navbar HTML for instant loading (no XHR blocking)
(function() {
    'use strict';
    
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
    
    // Extract base path for GitHub Pages project sites (e.g., '/jacinteriors')
    const pathParts = currentPath.split('/').filter(p => p);
    const basePath = pathParts.length > 0 ? '/' + pathParts[0] : '';
    
    // Calculate depth for subdirectories (e.g., cities/, projects/)
    // For root-level pages: /jacinteriors/page.html -> depth = 0
    // For subfolder pages: /jacinteriors/cities/page.html -> depth = 1
    const depth = Math.max(0, pathParts.length - 2);
    const pathPrefix = depth > 0 ? '../'.repeat(depth) : '';
    
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
        } else if (filename === 'portfolio.html' || currentPath.includes('/projects/')) {
            const link = nav.querySelector('a[href*="portfolio.html"]');
            if (link) link.classList.add('active');
        } else if (filename.includes('bathrooms.html') || filename.includes('bedrooms.html') || 
                   filename.includes('kitchens.html') || filename.includes('dining-rooms.html') ||
                   filename.includes('living-spaces.html') || filename.includes('office-spaces.html') ||
                   filename.includes('entryways.html') || filename.includes('bar-area.html') ||
                   filename.includes('laundry-rooms.html') || filename.includes('outdoor-spaces.html')) {
            const link = nav.querySelector('.nav-dropdown:first-of-type .nav-link');
            if (link) link.classList.add('active');
        } else if (filename === 'services.html' || filename.includes('residential-design.html') ||
                   filename.includes('commercial-design.html') || filename.includes('interior-styling.html') ||
                   filename.includes('space-planning.html') || filename.includes('cities-we-serve.html')) {
            const link = nav.querySelector('a[href*="services.html"]');
            if (link) link.classList.add('active');
        } else if (filename === 'about.html') {
            const link = nav.querySelector('a[href*="about.html"]');
            if (link) link.classList.add('active');
        } else if (filename === 'contact.html') {
            const link = nav.querySelector('a[href*="contact.html"]');
            if (link) link.classList.add('active');
        }
    }
    
    // Initialize dropdown hover behavior
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav-link');
            const content = dropdown.querySelector('.nav-dropdown-content');
            
            if (link && content) {
                dropdown.addEventListener('mouseenter', () => {
                    content.style.display = 'flex';
                });
                dropdown.addEventListener('mouseleave', () => {
                    content.style.display = 'none';
                });
            }
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
    
    // Navbar HTML - inlined for instant loading (no XHR)
    const navbarHTML = `
<nav class="navbar" style="padding: 0.5rem 0; background: white; position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid #e4e4e4; font-family: 'Plus Jakarta Sans', sans-serif;">
    <div class="container" style="max-width: 1320px; margin: 0 auto; padding: 0 2rem;">
        <div class="nav-wrapper" style="display: flex; justify-content: space-between; align-items: center;">
            <a href="${getPath('index.html')}" class="logo" aria-label="Home" style="font-size: 1.5rem; font-weight: 500; letter-spacing: -1px; text-transform: uppercase; text-decoration: none; color: #222a26; font-family: 'Plus Jakarta Sans', sans-serif; display: inline-flex; align-items: center;">
                <img class="logo-img" src="${getPath(LOGO_SRC)}" alt="JAC Interiors" style="height: ${LOGO_HEIGHT_PX}px; width: auto; display: block;"/>
            </a>
            <div class="nav-menu" id="navMenu" style="display: flex; gap: 2.5rem; align-items: center;">
                <a href="${getPath('index.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">HOME</a>
                <div class="nav-dropdown" style="position: relative; display: inline-block;">
                    <a href="${getPath('portfolio.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">PORTFOLIO</a>
                    <div class="nav-dropdown-content" style="display: none; position: absolute; top: 100%; left: 0; background: white; min-width: 220px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 0.5rem 0; margin-top: 0; z-index: 1000; border-radius: 4px; flex-direction: column; max-height: 500px; overflow-y: auto;">
                        <a href="${getPath('projects/22nd-street.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">22nd Street</a>
                        <a href="${getPath('projects/jamm-visual.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">JAMM Visual</a>
                        <a href="${getPath('projects/alpine.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Alpine</a>
                        <a href="${getPath('projects/brown-deer-park.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Brown Deer Park</a>
                        <a href="${getPath('projects/colby.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Colby</a>
                        <a href="${getPath('projects/colette-way.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Colette Way</a>
                        <a href="${getPath('projects/columbus-way.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Columbus Way</a>
                        <a href="${getPath('projects/frances.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Frances</a>
                        <a href="${getPath('projects/galewood.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Galewood</a>
                        <a href="${getPath('projects/highland.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Highland</a>
                        <a href="${getPath('projects/medio.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Medio</a>
                        <a href="${getPath('projects/monaco.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Monaco</a>
                        <a href="${getPath('projects/mulholland-drive.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Mulholland Drive</a>
                        <a href="${getPath('projects/oakwood.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Oakwood</a>
                        <a href="${getPath('projects/peary-way.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Peary Way</a>
                        <a href="${getPath('projects/presson-place.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Presson Place</a>
                        <a href="${getPath('projects/river-homestead.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">River Homestead</a>
                        <a href="${getPath('projects/ronda.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Ronda</a>
                        <a href="${getPath('projects/sherbourne.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Sherbourne</a>
                        <a href="${getPath('projects/sunnyside.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Sunnyside</a>
                        <a href="${getPath('projects/vale-crest.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Vale Crest</a>
                        <a href="${getPath('projects/valley-vista.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Valley Vista</a>
                        <a href="${getPath('projects/via-pisa.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Via Pisa</a>
                        <a href="${getPath('projects/wilshire.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">Wilshire</a>
                    </div>
                </div>
                <div class="nav-dropdown" style="position: relative; display: inline-block;">
                    <a href="#" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">SPACES</a>
                    <div class="nav-dropdown-content" style="display: none; position: absolute; top: 100%; left: 0; background: white; min-width: 200px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 0.5rem 0; margin-top: 0; z-index: 1000; border-radius: 4px; flex-direction: column;">
                        <a href="${getPath('bathrooms.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Bathrooms</a>
                        <a href="${getPath('bedrooms.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Bedrooms</a>
                        <a href="${getPath('kitchens.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Kitchens</a>
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
                        <a href="${getPath('residential-design.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Residential Design</a>
                        <a href="${getPath('commercial-design.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Commercial Design</a>
                        <a href="${getPath('interior-styling.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Interior Styling</a>
                        <a href="${getPath('space-planning.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Space Planning</a>
                        <a href="${getPath('cities-we-serve.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">Cities We Serve</a>
                    </div>
                </div>
                <a href="${getPath('about.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">ABOUT</a>
                <a href="${getPath('contact.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">CONTACT</a>
                <a href="${getPath('contact.html')}?intent=call#contactForm" class="nav-cta" style="display:inline-flex; align-items:center; justify-content:center; padding:0.65rem 1rem; border-radius:999px; border:1px solid #222a26; background:#222a26; color:#fff; font-size:0.85rem; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; text-decoration:none;">Book a call</a>
            </div>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" style="display: none;">
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
                `jac-images/cities/${slug}/`,
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
        if (filename === 'cities-we-serve.html') {
            const cards = Array.from(document.querySelectorAll('.project-list-item'));
            cards.forEach((card) => {
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

    function ensureFooter() {
        if (!document.body) return;
        ensureFooterStyles();

        const year = new Date().getFullYear();
        const addressHtml = FOOTER_ADDRESS_LINES.map(l => l.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('<br>');
        const contactHref = `${getPath('contact.html')}?intent=call#contactForm`;

        const footerHTML = `
<footer class="footer footer--dark" aria-label="Footer">
  <div class="container">
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
          <li><a href="${getPath('residential-design.html')}">Residential Interior Design</a></li>
          <li><a href="${getPath('commercial-design.html')}">Commercial Interior Design</a></li>
          <li><a href="${getPath('interior-styling.html')}">Interior Styling &amp; Decor</a></li>
          <li><a href="${getPath('concept-design.html')}">Concept Design &amp; Visualization</a></li>
          <li><a href="${getPath('furniture-sourcing.html')}">Furniture &amp; Object Sourcing</a></li>
          <li><a href="${getPath('design-consulting.html')}">Design Consulting</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="${getPath('about.html')}">About</a></li>
          <li><a href="${getPath('portfolio.html')}">Portfolio</a></li>
          <li><a href="${getPath('services.html')}">Services</a></li>
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
        <a class="footer-ig" href="https://www.instagram.com/jacinteriors" target="_blank" rel="noopener" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3.5" y="3.5" width="17" height="17" rx="4"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <circle cx="17.5" cy="6.6" r="0.8" fill="currentColor" stroke="none"></circle>
          </svg>
          <span>Instagram</span>
        </a>
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
        const phoneE164 = '+12133970206';
        const contactHref = `${getPath('contact.html')}?intent=call#contactForm`;

        const bar = document.createElement('div');
        bar.id = 'mobileCtaBar';
        bar.className = 'mobile-cta-bar';
        bar.setAttribute('role', 'navigation');
        bar.setAttribute('aria-label', 'Quick contact');
        bar.innerHTML = `
          <a class="mobile-cta-btn mobile-cta-btn--ghost" href="sms:${phoneE164}" aria-label="Text us">Text</a>
          <a class="mobile-cta-btn mobile-cta-btn--primary" href="tel:${phoneDisplay}" aria-label="Call us">Call</a>
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
                enforceNavbarStyles(nav);
                setTimeout(() => enforceNavbarStyles(nav), 10);
            }
            ensureMobileCtaBar();
            transformLegacyCityPage();
            applyCityR2Images();
            applyCityFeaturedProject();
            ensureFooter();
            normalizeContactButtons();
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
})();
