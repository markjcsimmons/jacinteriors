// Fixed Navbar Loader - Inline navbar HTML for instant loading (no XHR blocking)
(function() {
    'use strict';
    
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
        // For relative paths in subdirectories, use relative paths
        if (depth > 0 && !href.startsWith('../')) {
            return pathPrefix + href;
        }
        // For root-level relative paths, use absolute paths with basePath
        // This ensures links work correctly on GitHub Pages project sites
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
        } else if (filename === 'portfolio.html' || filename.includes('projects/')) {
            const link = nav.querySelector('a[href*="portfolio.html"]');
            if (link) link.classList.add('active');
        } else if (filename.includes('bathrooms.html') || filename.includes('bedrooms.html') || 
                   filename.includes('kitchens.html') || filename.includes('dining-rooms.html') ||
                   filename.includes('living-spaces.html') || filename.includes('office-spaces.html') ||
                   filename.includes('kids-bedrooms.html') || filename.includes('entryways.html') ||
                   filename.includes('bar-area.html') || filename.includes('laundry-rooms.html') ||
                   filename.includes('outdoor-spaces.html')) {
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
        nav.style.setProperty('padding', '1.5rem 0', 'important');
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
<nav class="navbar" style="padding: 1.5rem 0; background: white; position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid #e4e4e4; font-family: 'Plus Jakarta Sans', sans-serif;">
    <div class="container" style="max-width: 1320px; margin: 0 auto; padding: 0 2rem;">
        <div class="nav-wrapper" style="display: flex; justify-content: space-between; align-items: center;">
            <a href="${getPath('index.html')}" class="logo" style="font-size: 1.5rem; font-weight: 500; letter-spacing: -1px; text-transform: uppercase; text-decoration: none; color: #222a26; font-family: 'Plus Jakarta Sans', sans-serif;">
                JAC INTERIORS
            </a>
            <div class="nav-menu" id="navMenu" style="display: flex; gap: 2.5rem; align-items: center;">
                <a href="${getPath('index.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">HOME</a>
                <div class="nav-dropdown" style="position: relative; display: inline-block;">
                    <a href="${getPath('portfolio.html')}" class="nav-link" style="font-size: 0.95rem; font-weight: 500; color: #222a26; letter-spacing: -0.2px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">PORTFOLIO</a>
                    <div class="nav-dropdown-content" style="display: none; position: absolute; top: 100%; left: 0; background: white; min-width: 220px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 0.5rem 0; margin-top: 0; z-index: 1000; border-radius: 4px; flex-direction: column; max-height: 500px; overflow-y: auto;">
                        <a href="${getPath('projects/22nd-street.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">22nd Street</a>
                        <a href="${getPath('projects/via-pisa.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Via Pisa</a>
                        <a href="${getPath('projects/galewood.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Galewood</a>
                        <a href="${getPath('projects/ronda.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Ronda</a>
                        <a href="${getPath('projects/alpine.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Alpine</a>
                        <a href="${getPath('projects/peary-place.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Peary Place</a>
                        <a href="${getPath('projects/monaco.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Monaco</a>
                        <a href="${getPath('projects/valley-vista.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Valley Vista</a>
                        <a href="${getPath('projects/colby.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Colby</a>
                        <a href="${getPath('projects/sherbourne.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Sherbourne</a>
                        <a href="${getPath('projects/highland.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Highland</a>
                        <a href="${getPath('projects/sunnyside.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Sunnyside</a>
                        <a href="${getPath('projects/vale-crest.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Vale Crest</a>
                        <a href="${getPath('projects/presson-place.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Presson Place</a>
                        <a href="${getPath('projects/medio.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Medio</a>
                        <a href="${getPath('projects/brown-deer-park.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Brown Deer Park</a>
                        <a href="${getPath('projects/frances.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Frances</a>
                        <a href="${getPath('projects/columbus-way.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Columbus Way</a>
                        <a href="${getPath('projects/colette-way.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Colette Way</a>
                        <a href="${getPath('projects/river-homestead.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">River Homestead</a>
                        <a href="${getPath('projects/oakwood.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Oakwood</a>
                        <a href="${getPath('projects/wilshire.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Wilshire</a>
                        <a href="${getPath('projects/mulholland-drive.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Mulholland Drive</a>
                        <a href="${getPath('projects/jaam-visual.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;">JAAM Visual (Commercial)</a>
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
                        <a href="${getPath('kids-bedrooms.html')}" style="display: block; padding: 0.5rem 1.5rem; color: #333; font-size: 0.85rem; text-transform: none; letter-spacing: 0; text-decoration: none; border-bottom: 1px solid #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif;">Kid's Bedrooms</a>
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
            </div>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" style="display: none;">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>
</nav>
<div class="navbar-spacer" style="height: 80px; width: 100%;"></div>`;
    
    // Load navbar instantly (no XHR - completely non-blocking)
    function loadNavbar() {
        // Remove any existing navbar
        const existingNav = document.querySelector('nav.navbar');
        if (existingNav) existingNav.remove();
        const existingSpacer = document.querySelector('.navbar-spacer');
        if (existingSpacer) existingSpacer.remove();
        
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
