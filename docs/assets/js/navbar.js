// JAC Interiors - Universal Navbar Component
// This ensures the navbar is identical across all pages

(function() {
    'use strict';
    
    // Get current page path to determine active state
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index.html';
    
    const LOGO_SRC = 'assets/images/jac-interiors-logo.png';
    // Site uses 40px logo in other sections; navbar logo should be 4x.
    const LOGO_HEIGHT_PX = 160;
    
    // Extract base path for GitHub Pages project sites (e.g., '/jacinteriors')
    const pathParts = currentPath.split('/').filter(p => p);
    const basePath = pathParts.length > 0 ? '/' + pathParts[0] : '';
    
    // Calculate depth for subdirectories (e.g., cities/, projects/)
    // For root-level pages: /jacinteriors/page.html -> depth = 0
    // For subfolder pages: /jacinteriors/cities/page.html -> depth = 1
    const depth = Math.max(0, pathParts.length - 2);
    const pathPrefix = depth > 0 ? '../'.repeat(depth) : '';
    
    // Helper to get correct path for links
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
        return basePath + '/' + href;
    }
    
    // Determine which nav item should be active
    let homeActive = '';
    let portfolioActive = '';
    let spacesActive = '';
    let servicesActive = '';
    let aboutActive = '';
    let contactActive = '';
    
    if (filename === 'index.html' || filename === '') {
        homeActive = ' active';
    } else if (filename === 'portfolio.html') {
        portfolioActive = ' active';
    } else if (filename.includes('bathrooms.html') || filename.includes('bedrooms.html') || 
               filename.includes('kitchens.html') || filename.includes('dining-rooms.html') ||
               filename.includes('living-spaces.html') || filename.includes('office-spaces.html') ||
               filename.includes('kids-bedrooms.html') || filename.includes('entryways.html') ||
               filename.includes('bar-area.html') || filename.includes('laundry-rooms.html') ||
               filename.includes('outdoor-spaces.html')) {
        spacesActive = ' active';
    } else if (filename === 'services.html' || filename.includes('residential-design.html') ||
               filename.includes('commercial-design.html') || filename.includes('interior-styling.html') ||
               filename.includes('space-planning.html') || filename.includes('cities-we-serve.html')) {
        servicesActive = ' active';
    } else if (filename === 'about.html') {
        aboutActive = ' active';
    } else if (filename === 'contact.html') {
        contactActive = ' active';
    }
    
    const homeHref = getPath('index.html');
    
    // Navbar HTML - EXACTLY like home page: white bg, black text, "JAC INTERIORS" text logo
    const navbarHTML = `
    <nav class="navbar" style="padding: 1.5rem 0 !important; background: white !important; position: sticky !important; top: 0 !important; z-index: 1000 !important; border-bottom: 1px solid var(--stroke) !important;">
        <div class="container">
            <div class="nav-wrapper">
                <a href="${homeHref}" class="logo" aria-label="Home" style="font-size: 1.5rem !important; font-weight: 500 !important; letter-spacing: -1px !important; text-transform: uppercase !important; color: #222a26 !important; text-decoration: none !important; display: inline-flex !important; align-items: center !important;">
                    <img class="logo-img" src="${getPath(LOGO_SRC)}" alt="JAC Interiors" style="height: ${LOGO_HEIGHT_PX}px; width: auto; display: block;"/>
                </a>
                <div class="nav-menu" id="navMenu" style="display: flex !important; gap: 2.5rem !important; align-items: center !important;">
                    <a href="${homeHref}" class="nav-link${homeActive}" style="font-size: 0.95rem !important; font-weight: 500 !important; color: var(--text-main) !important; color: #222a26 !important; letter-spacing: -0.2px !important; text-decoration: none !important; text-transform: uppercase !important;">HOME</a>
                    <a href="${getPath('portfolio.html')}" class="nav-link${portfolioActive}" style="font-size: 0.95rem !important; font-weight: 500 !important; color: var(--text-main) !important; color: #222a26 !important; letter-spacing: -0.2px !important; text-decoration: none !important; text-transform: uppercase !important;">PORTFOLIO</a>
                    <div class="nav-dropdown" style="position: relative !important; display: inline-block !important;">
                        <a href="#" class="nav-link${spacesActive}" style="font-size: 0.95rem !important; font-weight: 500 !important; color: var(--text-main) !important; color: #222a26 !important; letter-spacing: -0.2px !important; text-decoration: none !important; text-transform: uppercase !important;">SPACES</a>
                        <div class="nav-dropdown-content" style="display: none !important; position: absolute !important; top: 100% !important; left: 0 !important; background: white !important; min-width: 200px !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important; padding: 0.5rem 0 !important; margin-top: 0 !important; z-index: 1000 !important; border-radius: 4px !important; flex-direction: column !important;">
                            <a href="${getPath('bathrooms.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Bathrooms</a>
                            <a href="${getPath('bedrooms.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Bedrooms</a>
                            <a href="${getPath('kitchens.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Kitchens</a>
                            <a href="${getPath('dining-rooms.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Dining Rooms</a>
                            <a href="${getPath('living-spaces.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Living Spaces</a>
                            <a href="${getPath('office-spaces.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Office Spaces</a>
                            <a href="${getPath('kids-bedrooms.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Kid's Bedrooms</a>
                            <a href="${getPath('entryways.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Entryways</a>
                            <a href="${getPath('bar-area.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Bar Area</a>
                            <a href="${getPath('laundry-rooms.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Laundry Rooms</a>
                            <a href="${getPath('outdoor-spaces.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Outdoor Spaces</a>
                        </div>
                    </div>
                    <div class="nav-dropdown" style="position: relative !important; display: inline-block !important;">
                        <a href="${getPath('services.html')}" class="nav-link${servicesActive}" style="font-size: 0.95rem !important; font-weight: 500 !important; color: var(--text-main) !important; color: #222a26 !important; letter-spacing: -0.2px !important; text-decoration: none !important; text-transform: uppercase !important;">SERVICES</a>
                        <div class="nav-dropdown-content" style="display: none !important; position: absolute !important; top: 100% !important; left: 0 !important; background: white !important; min-width: 200px !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important; padding: 0.5rem 0 !important; margin-top: 0 !important; z-index: 1000 !important; border-radius: 4px !important; flex-direction: column !important;">
                            <a href="${getPath('residential-design.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Residential Design</a>
                            <a href="${getPath('commercial-design.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Commercial Design</a>
                            <a href="${getPath('interior-styling.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Interior Styling</a>
                            <a href="${getPath('space-planning.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Space Planning</a>
                            <a href="${getPath('cities-we-serve.html')}" style="color: #222a26 !important; padding: 0.5rem 1rem !important; text-decoration: none !important; display: block !important;">Cities We Serve</a>
                        </div>
                    </div>
                    <a href="${getPath('about.html')}" class="nav-link${aboutActive}" style="font-size: 0.95rem !important; font-weight: 500 !important; color: var(--text-main) !important; color: #222a26 !important; letter-spacing: -0.2px !important; text-decoration: none !important; text-transform: uppercase !important;">ABOUT</a>
                    <a href="${getPath('contact.html')}" class="nav-link${contactActive}" style="font-size: 0.95rem !important; font-weight: 500 !important; color: var(--text-main) !important; color: #222a26 !important; letter-spacing: -0.2px !important; text-decoration: none !important; text-transform: uppercase !important;">CONTACT</a>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>
    <div class="navbar-spacer" style="height: ${LOGO_HEIGHT_PX}px; width: 100%;"></div>`;
    
    // Function to inject navbar
    function injectNavbar() {
        // Find existing navbar
        const existingNav = document.querySelector('nav.navbar');
        
        if (existingNav) {
            // Replace existing navbar
            existingNav.outerHTML = navbarHTML;
        } else {
            // Insert at beginning of body
            const body = document.body;
            if (body) {
                body.insertAdjacentHTML('afterbegin', navbarHTML);
            }
        }
        
        // Add hover styles for dropdowns (matching home page)
        setTimeout(() => {
            const nav = document.querySelector('nav.navbar');
            if (nav) {
                // Remove any conflicting classes
                nav.classList.remove('navbar-dark');
                nav.classList.remove('scrolled');
                
                // Add hover behavior for dropdowns (matching home page)
                const dropdowns = nav.querySelectorAll('.nav-dropdown');
                dropdowns.forEach(dropdown => {
                    dropdown.addEventListener('mouseenter', function() {
                        const content = this.querySelector('.nav-dropdown-content');
                        if (content) {
                            content.style.display = 'flex';
                        }
                    });
                    dropdown.addEventListener('mouseleave', function() {
                        const content = this.querySelector('.nav-dropdown-content');
                        if (content) {
                            content.style.display = 'none';
                        }
                    });
                });
            }
        }, 50);
        
        // Re-initialize mobile menu functionality
        initializeMobileMenu();
    }
    
    // Initialize mobile menu (same logic as main.js)
    function initializeMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
            });
            
            // Mobile dropdown functionality
            const navDropdowns = navMenu.querySelectorAll('.nav-dropdown');
            navDropdowns.forEach(dropdown => {
                const dropdownLink = dropdown.querySelector('.nav-link');
                if (dropdownLink) {
                    dropdownLink.addEventListener('click', function(e) {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            dropdown.classList.toggle('active');
                        }
                    });
                }
            });
        }
    }
    
    // Inject navbar immediately - don't wait for DOMContentLoaded
    // This ensures it runs before page renders
    if (document.readyState === 'loading') {
        // If still loading, inject immediately (script runs synchronously)
        injectNavbar();
        // Also listen for DOMContentLoaded as backup
        document.addEventListener('DOMContentLoaded', injectNavbar);
    } else {
        // DOM already loaded, inject immediately
        injectNavbar();
    }
    
    // Also inject after a tiny delay to catch any late-loading content
    setTimeout(injectNavbar, 50);
    
    // Also inject on SPA navigation (if using SPA nav)
    if (window.SPANav) {
        const originalLoadPage = window.SPANav.loadPage;
        if (originalLoadPage) {
            window.SPANav.loadPage = function(...args) {
                const result = originalLoadPage.apply(this, args);
                setTimeout(injectNavbar, 100);
                return result;
            };
        }
    }
})();
