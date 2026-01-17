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
        
        // Use synchronous XMLHttpRequest for immediate load (no async delay)
        const xhr = new XMLHttpRequest();
        xhr.open('GET', navbarPath, false);
        xhr.send();
        
        if (xhr.status === 200) {
            const html = xhr.responseText;
            
            // Insert at very beginning of body
            if (document.body) {
                document.body.insertAdjacentHTML('afterbegin', html);
            }
            
            // Get the navbar after insertion
            const nav = document.querySelector('nav.navbar');
            if (!nav) return;
            
            // The navbar.html already has all inline styles, but ensure they're applied
            // Don't override - the inline styles in navbar.html are the source of truth
            
            // Fix relative paths for subdirectories
            fixRelativePaths();
            
            // Set active nav state
            setActiveNav();
            
            // Initialize dropdowns
            initDropdowns();
            
            // CRITICAL: Force all navbar styles with !important to override any CSS
            // Do this immediately and also after a short delay to catch any late-loading CSS
            function enforceNavbarStyles() {
                const nav = document.querySelector('nav.navbar');
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
                    link.style.setProperty('font-size', '0.95rem', 'important');
                    link.style.setProperty('font-weight', '500', 'important');
                    link.style.setProperty('letter-spacing', '-0.2px', 'important');
                    link.style.setProperty('text-decoration', 'none', 'important');
                    link.style.setProperty('text-transform', 'uppercase', 'important');
                });
                
                // Force logo color
                const logo = nav.querySelector('.logo');
                if (logo) {
                    logo.style.setProperty('color', '#222a26', 'important');
                    logo.style.setProperty('font-size', '1.5rem', 'important');
                    logo.style.setProperty('font-weight', '500', 'important');
                    logo.style.setProperty('letter-spacing', '-1px', 'important');
                    logo.style.setProperty('text-transform', 'uppercase', 'important');
                }
                
                // CRITICAL: Remove navbar-dark class if it exists
                nav.classList.remove('navbar-dark');
                
                // Also remove from body if it's there
                if (document.body) {
                    document.body.classList.remove('navbar-dark');
                }
            }
            
            // Apply styles immediately
            enforceNavbarStyles();
            
            // Also apply after a short delay to catch any late-loading CSS
            setTimeout(enforceNavbarStyles, 10);
            setTimeout(enforceNavbarStyles, 100);
            setTimeout(enforceNavbarStyles, 500);
            
            // Use MutationObserver to re-apply if navbar is modified
            const observer = new MutationObserver(function(mutations) {
                enforceNavbarStyles();
            });
            observer.observe(nav, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    }
    
    // Load navbar immediately
    if (document.readyState === 'loading') {
        if (document.body) {
            loadNavbar();
        } else {
            const observer = new MutationObserver(function(mutations, obs) {
                if (document.body) {
                    loadNavbar();
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    } else {
        loadNavbar();
    }
})();
