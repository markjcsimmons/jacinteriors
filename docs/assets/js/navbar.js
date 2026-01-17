// JAC Interiors - Universal Navbar Component
// This ensures the navbar is identical across all pages

(function() {
    'use strict';
    
    // Get current page path to determine active state
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index-variant-2.html';
    
    // Determine which nav item should be active
    let homeActive = '';
    let portfolioActive = '';
    let spacesActive = '';
    let servicesActive = '';
    let aboutActive = '';
    let contactActive = '';
    
    if (filename === 'index-variant-2.html' || filename === '' || filename === 'index.html') {
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
    
    // Determine if this is home page (for logo styling)
    const isHomePage = filename === 'index-variant-2.html' || filename === '' || filename === 'index.html';
    
    // Determine correct logo path (handle subdirectories)
    const getLogoPath = () => {
        const depth = currentPath.split('/').length - 2; // -2 because path includes leading / and filename
        if (depth > 0) {
            return '../'.repeat(depth) + 'assets/images/jac-logo.png';
        }
        return 'assets/images/jac-logo.png';
    };
    
    // Navbar HTML - single source of truth
    const navbarHTML = `
    <nav class="navbar">
        <div class="container">
            <div class="nav-wrapper">
                <a href="${isHomePage ? 'index-variant-2.html' : (currentPath.includes('/') ? '../index-variant-2.html' : 'index-variant-2.html')}" class="logo">
                    ${isHomePage ? 'JAC INTERIORS' : `<img src="${getLogoPath()}" alt="JAC Interiors" class="logo-img">`}
                </a>
                <div class="nav-menu" id="navMenu">
                    <a href="index-variant-2.html" class="nav-link${homeActive}">HOME</a>
                    <a href="portfolio.html" class="nav-link${portfolioActive}">PORTFOLIO</a>
                    <div class="nav-dropdown">
                        <a href="#" class="nav-link${spacesActive}">SPACES</a>
                        <div class="nav-dropdown-content">
                            <a href="bathrooms.html">Bathrooms</a>
                            <a href="bedrooms.html">Bedrooms</a>
                            <a href="kitchens.html">Kitchens</a>
                            <a href="dining-rooms.html">Dining Rooms</a>
                            <a href="living-spaces.html">Living Spaces</a>
                            <a href="office-spaces.html">Office Spaces</a>
                            <a href="kids-bedrooms.html">Kid's Bedrooms</a>
                            <a href="entryways.html">Entryways</a>
                            <a href="bar-area.html">Bar Area</a>
                            <a href="laundry-rooms.html">Laundry Rooms</a>
                            <a href="outdoor-spaces.html">Outdoor Spaces</a>
                        </div>
                    </div>
                    <div class="nav-dropdown">
                        <a href="services.html" class="nav-link${servicesActive}">SERVICES</a>
                        <div class="nav-dropdown-content">
                            <a href="residential-design.html">Residential Design</a>
                            <a href="commercial-design.html">Commercial Design</a>
                            <a href="interior-styling.html">Interior Styling</a>
                            <a href="space-planning.html">Space Planning</a>
                            <a href="cities-we-serve.html">Cities We Serve</a>
                        </div>
                    </div>
                    <a href="about.html" class="nav-link${aboutActive}">ABOUT</a>
                    <a href="contact.html" class="nav-link${contactActive}">CONTACT</a>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>`;
    
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
        
        // Apply styling - ALL pages get white background with black text (like home page)
        setTimeout(() => {
            const nav = document.querySelector('nav.navbar');
            if (nav) {
                // All pages: white background with black text (like home page)
                nav.style.background = 'white';
                nav.style.position = 'sticky';
                nav.style.borderBottom = '1px solid var(--stroke)';
                
                // Remove navbar-dark class if it exists
                nav.classList.remove('navbar-dark');
                nav.classList.remove('scrolled'); // Remove scrolled class that might affect colors
                
                // Force black text for all nav links with !important
                const navLinks = nav.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.style.setProperty('color', '#222a26', 'important');
                    link.style.setProperty('opacity', '1', 'important');
                });
                
                // Force black text for dropdown links too
                const dropdownLinks = nav.querySelectorAll('.nav-dropdown-content a');
                dropdownLinks.forEach(link => {
                    link.style.setProperty('color', '#222a26', 'important');
                });
                
                // Ensure logo is dark (not inverted)
                const logoImg = nav.querySelector('.logo-img');
                if (logoImg) {
                    logoImg.style.setProperty('filter', 'none', 'important');
                }
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
