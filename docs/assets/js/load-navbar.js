// Fixed Navbar Loader - Persistent navbar that never reloads
(function() {
    'use strict';
    
    // Global navbar instance - only load once
    if (window.navbarLoaded) {
        // Navbar already loaded, just update active state
        updateNavbarState();
        return;
    }
    window.navbarLoaded = true;
    
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
            const link = nav.querySelector('.nav-dropdown:has(a[href*="SPACES"]) a.nav-link, .nav-dropdown a.nav-link');
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
    
    // Update only the active state - don't touch the navbar HTML
    function updateNavbarState() {
        setActiveNav();
        fixRelativePaths();
    }
    
    // Create persistent navbar container that never reloads
    function createPersistentNavbar() {
        // Check if persistent navbar container already exists
        let navContainer = document.getElementById('persistent-navbar-container');
        
        if (!navContainer) {
            // Create container that will hold the navbar
            navContainer = document.createElement('div');
            navContainer.id = 'persistent-navbar-container';
            navContainer.style.position = 'fixed';
            navContainer.style.top = '0';
            navContainer.style.left = '0';
            navContainer.style.right = '0';
            navContainer.style.zIndex = '10000';
            navContainer.style.width = '100%';
            document.body.appendChild(navContainer);
        }
        
        // Remove any existing navbar from page content (it will be in our container)
        const existingNav = document.querySelector('nav.navbar');
        if (existingNav && !existingNav.closest('#persistent-navbar-container')) {
            existingNav.remove();
        }
        
        // Load navbar HTML into container if not already there
        if (!navContainer.querySelector('nav.navbar')) {
            const depth = currentPath.split('/').length - 2;
            const navbarPath = depth > 0 ? '../'.repeat(depth) + 'assets/navbar.html' : 'assets/navbar.html';
            
            const xhr = new XMLHttpRequest();
            xhr.open('GET', navbarPath, false);
            xhr.send();
            
            if (xhr.status === 200) {
                navContainer.innerHTML = xhr.responseText;
            }
        }
        
        // Get navbar and style it
        const nav = navContainer.querySelector('nav.navbar');
        if (!nav) return;
        
        // Ensure fixed positioning
        nav.style.position = 'relative';
        nav.style.background = 'white';
        nav.style.width = '100%';
        
        // Replace logo image with text if needed
        const logo = nav.querySelector('.logo');
        if (logo) {
            const logoImg = logo.querySelector('img.logo-img');
            if (logoImg) {
                logoImg.remove();
                logo.textContent = 'JAC INTERIORS';
            }
            logo.style.setProperty('color', '#222a26', 'important');
            logo.style.setProperty('font-size', '1.5rem', 'important');
            logo.style.setProperty('font-weight', '500', 'important');
            logo.style.setProperty('letter-spacing', '-1px', 'important');
            logo.style.setProperty('text-transform', 'uppercase', 'important');
            logo.style.setProperty('text-decoration', 'none', 'important');
        }
        
        // Set nav link colors
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.style.setProperty('color', '#222a26', 'important');
        });
        
        const dropdownLinks = nav.querySelectorAll('.nav-dropdown-content a');
        dropdownLinks.forEach(link => {
            link.style.setProperty('color', '#222a26', 'important');
        });
        
        // Fix relative paths
        fixRelativePaths();
        
        // Set active nav state
        setActiveNav();
        
        // Initialize dropdowns
        initDropdowns();
    }
    
    // Initialize persistent navbar
    if (document.readyState === 'loading') {
        if (document.body) {
            createPersistentNavbar();
        } else {
            const observer = new MutationObserver(function(mutations, obs) {
                if (document.body) {
                    createPersistentNavbar();
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    } else {
        createPersistentNavbar();
    }
    
    // Expose update function for SPA navigation
    window.updateNavbarState = updateNavbarState;
})();
