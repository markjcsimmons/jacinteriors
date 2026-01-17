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
    
    // Update navbar in place - DON'T replace it to prevent shifting
    function updateNavbar() {
        const existingNav = document.querySelector('nav.navbar');
        
        if (!existingNav) {
            // Only load if navbar doesn't exist
            const depth = currentPath.split('/').length - 2;
            const navbarPath = depth > 0 ? '../'.repeat(depth) + 'assets/navbar.html' : 'assets/navbar.html';
            
            const xhr = new XMLHttpRequest();
            xhr.open('GET', navbarPath, false);
            xhr.send();
            
            if (xhr.status === 200) {
                const html = xhr.responseText;
                if (document.body) {
                    document.body.insertAdjacentHTML('afterbegin', html);
                }
            }
        }
        
        // Just update the existing navbar - don't replace it
        // Fix relative paths for subdirectories
        fixRelativePaths();
        
        // Set active nav state
        setActiveNav();
        
        // Initialize dropdowns
        initDropdowns();
        
        // Ensure navbar has correct fixed positioning and black text
        if (existingNav) {
            existingNav.style.position = 'fixed';
            existingNav.style.top = '0';
            existingNav.style.left = '0';
            existingNav.style.right = '0';
            existingNav.style.width = '100%';
            existingNav.style.zIndex = '10000';
            existingNav.style.background = 'white';
            
            // Force black text on all nav links
            const navLinks = existingNav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.style.setProperty('color', '#222a26', 'important');
            });
            
            // Force black text on dropdown links
            const dropdownLinks = existingNav.querySelectorAll('.nav-dropdown-content a');
            dropdownLinks.forEach(link => {
                link.style.setProperty('color', '#222a26', 'important');
            });
            
            // Force black text on logo
            const logo = existingNav.querySelector('.logo');
            if (logo) {
                logo.style.setProperty('color', '#222a26', 'important');
            }
        }
    }
    
    // Update navbar IMMEDIATELY - don't wait, just update in place
    if (document.readyState === 'loading') {
        // Script is in head - wait for body
        if (document.body) {
            updateNavbar();
        } else {
            const observer = new MutationObserver(function(mutations, obs) {
                if (document.body) {
                    updateNavbar();
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    } else {
        // DOM already loaded
        updateNavbar();
    }
    
    // Also update after a tiny delay to catch any late changes
    setTimeout(updateNavbar, 10);
})();
