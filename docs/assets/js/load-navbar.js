// Fixed Navbar Loader - Loads navbar from separate HTML file
(function() {
    'use strict';
    
    // Get current page to set active state
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index-variant-2.html';
    
    // Determine which nav item should be active
    function setActiveNav() {
        const nav = document.querySelector('nav.navbar');
        if (!nav) return;
        
        // Remove all active classes
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Set active based on current page
        if (filename === 'index-variant-2.html' || filename === '' || filename === 'index.html') {
            const homeLink = nav.querySelector('a[href*="index-variant-2.html"]');
            if (homeLink) homeLink.classList.add('active');
        } else if (filename === 'portfolio.html') {
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
    
    // Fix relative paths based on current page location
    function fixRelativePaths() {
        const nav = document.querySelector('nav.navbar');
        if (!nav) return;
        
        const depth = currentPath.split('/').length - 2; // Calculate directory depth
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        
        // Fix all links
        nav.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('/')) {
                if (depth > 0 && !href.startsWith('../')) {
                    link.setAttribute('href', prefix + href);
                }
            }
        });
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
    
    // Load navbar from HTML file - this is the ONLY source of navbar HTML
    function loadNavbar() {
        // Remove any existing navbar first (clean slate)
        const existingNav = document.querySelector('nav.navbar');
        if (existingNav) {
            existingNav.remove();
        }
        
        // Remove any existing spacer
        const existingSpacer = document.querySelector('.navbar-spacer');
        if (existingSpacer) {
            existingSpacer.remove();
        }
        
        // Calculate path to navbar.html
        const depth = currentPath.split('/').length - 2;
        const navbarPath = depth > 0 ? '../'.repeat(depth) + 'assets/navbar.html' : 'assets/navbar.html';
        
        // CRITICAL: Force all navbar styles with !important to override any CSS
        function enforceNavbarStyles(nav) {
            if (!nav) return;
            
            // Force navbar container styles
            nav.style.setProperty('border-bottom', '1px solid #e4e4e4', 'important');
            nav.style.setProperty('padding', '1.5rem 0', 'important');
            nav.style.setProperty('background', 'white', 'important');
            nav.style.setProperty('position', 'sticky', 'important');
            nav.style.setProperty('top', '0', 'important');
            nav.style.setProperty('z-index', '1000', 'important');
            nav.style.setProperty('width', '100%', 'important');
            nav.style.setProperty('box-sizing', 'border-box', 'important');
            
            // Force dark text colors on all links
            const navLinks = nav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.style.setProperty('color', '#222a26', 'important');
            });
            
            // Force logo color
            const logo = nav.querySelector('.logo');
            if (logo) {
                logo.style.setProperty('color', '#222a26', 'important');
            }
            
            // CRITICAL: Remove navbar-dark class if it exists
            nav.classList.remove('navbar-dark');
            if (document.body) {
                document.body.classList.remove('navbar-dark');
            }
        }
        
        // Use async XMLHttpRequest to prevent blocking (non-responsive pages)
        const xhr = new XMLHttpRequest();
        xhr.open('GET', navbarPath, true);
        xhr.timeout = 2000;
        
        xhr.onload = function() {
            if (xhr.status === 200 && document.body) {
                try {
                    const html = xhr.responseText;
                    document.body.insertAdjacentHTML('afterbegin', html);
                    
                    const nav = document.querySelector('nav.navbar');
                    if (nav) {
                        fixRelativePaths();
                        setActiveNav();
                        initDropdowns();
                        enforceNavbarStyles(nav);
                        
                        // Re-apply styles after short delays to catch late CSS
                        setTimeout(function() { enforceNavbarStyles(nav); }, 10);
                        setTimeout(function() { enforceNavbarStyles(nav); }, 100);
                    }
                } catch (e) {
                    console.warn('Navbar error:', e);
                }
            }
        };
        
        xhr.onerror = function() {
            console.warn('Navbar load error');
        };
        
        xhr.ontimeout = function() {
            console.warn('Navbar load timeout');
        };
        
        xhr.send();
    }
    
    // Load navbar when DOM is ready
    function init() {
        if (document.body) {
            loadNavbar();
        } else {
            // Wait for body to exist
            const observer = new MutationObserver(function(mutations, obs) {
                if (document.body) {
                    loadNavbar();
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already ready
        init();
    }
})();
