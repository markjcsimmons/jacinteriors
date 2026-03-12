// JAC Interiors - Main JavaScript

// ===================================
// SPA-LIKE NAVIGATION (No page reload for navbar)
// ===================================

// ===================================
// GLOBAL IMAGE PERFORMANCE HELPERS
// ===================================
(() => {
    const R2_DEFAULT = 'https://jacinteriorscdn.com';

    function getAssetsJsBaseUrl() {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const mainScript = scripts.find(s => /\/assets\/js\/main\.js(\?|#|$)/.test(s.src));
        if (mainScript) {
            // .../assets/js/main.js -> .../assets/js/
            return new URL('.', mainScript.src).toString();
        }
        // Best-effort fallback: site-root assets/js
        return new URL('/jacinteriors/assets/js/', window.location.origin).toString();
    }

    function loadScriptOnce(url) {
        const existing = Array.from(document.querySelectorAll('script[src]')).some(s => s.src === url);
        if (existing) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = url;
            s.defer = true;
            s.dataset.dynamic = '1';
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(`Failed to load ${url}`));
            document.head.appendChild(s);
        });
    }

    async function ensureR2Images() {
        if (!window.R2_IMAGE_BASE) window.R2_IMAGE_BASE = R2_DEFAULT;
        const base = getAssetsJsBaseUrl();
        const r2ImagesUrl = new URL('r2-images.js', base).toString();
        try {
            await loadScriptOnce(r2ImagesUrl);
        } catch (e) {
            // Ignore; fall back to local images.
        }
        if (typeof window.applyR2Images === 'function') {
            window.applyR2Images(document);
        }
    }

    function optimizeImages(root = document) {
        const imgs = Array.from(root.querySelectorAll('img'));
        if (!imgs.length) return;

        // Pick a "hero" image: first non-logo image near the top of the page.
        const hero = imgs.find(img => {
            const src = (img.getAttribute('src') || '').toLowerCase();
            if (!src) return false;
            if (src.includes('logo')) return false;
            const rect = img.getBoundingClientRect();
            return rect.top >= -50 && rect.top <= 700;
        });

        imgs.forEach(img => {
            if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
            // Leave authors free to override explicitly.
            if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
        });

        if (hero) {
            hero.setAttribute('loading', 'eager');
            hero.setAttribute('fetchpriority', 'high');
            hero.setAttribute('decoding', 'async');
        }
    }

    // Expose for SPA reinit hook.
    window.__optimizeImages = optimizeImages;
    window.__ensureR2Images = ensureR2Images;

    document.addEventListener('DOMContentLoaded', () => {
        ensureR2Images();
        optimizeImages(document);
    });
})();

const SPANav = {
    contentSelector: null,
    isNavigating: false,
    
    init() {
        // Find the main content area (everything after nav, before footer)
        this.setupContentWrapper();
        this.interceptLinks();
        this.handlePopState();
        console.log('SPA Navigation initialized');
    },
    
    setupContentWrapper() {
        // Wrap main content if not already wrapped
        const navbar = document.querySelector('.navbar');
        const footer = document.querySelector('footer');
        
        if (!document.getElementById('spa-content')) {
            // Get all elements between navbar and footer
            const content = [];
            let current = navbar ? navbar.nextElementSibling : document.body.firstElementChild;
            
            while (current && current !== footer && current.tagName !== 'FOOTER') {
                content.push(current);
                current = current.nextElementSibling;
            }
            
            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.id = 'spa-content';
            wrapper.style.opacity = '1';
            wrapper.style.transition = 'opacity 0.2s ease';
            
            // Insert wrapper after navbar
            if (navbar && content.length > 0) {
                navbar.after(wrapper);
                content.forEach(el => wrapper.appendChild(el));
            }
        }
        
        this.contentSelector = '#spa-content';
    },
    
    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Skip external links, anchors, and special protocols
            if (href.startsWith('http') || 
                href.startsWith('#') || 
                href.startsWith('mailto:') || 
                href.startsWith('tel:') ||
                link.target === '_blank' ||
                e.ctrlKey || e.metaKey || e.shiftKey) {
                return;
            }
            
            // Skip if it's a dropdown trigger with href="#"
            if (href === '#') return;
            
            e.preventDefault();
            this.navigate(href);
        });
    },
    
    handlePopState() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.path) {
                this.loadPage(e.state.path, false);
            }
        });
    },
    
    async navigate(path) {
        if (this.isNavigating) return;
        
        // Resolve relative paths (preserve query + hash for anchor navigation)
        const nextUrl = new URL(path, window.location.href);
        const fullPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
        const currentFull = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        
        // Don't navigate to same page
        if (fullPath === currentFull) return;
        
        this.isNavigating = true;
        
        // Update URL
        history.pushState({ path: fullPath }, '', fullPath);
        
        await this.loadPage(fullPath, true);
        
        this.isNavigating = false;
    },
    
    async loadPage(path, animate = true) {
        const contentArea = document.querySelector(this.contentSelector);
        if (!contentArea) {
            // Fallback to regular navigation
            window.location.href = path;
            return;
        }
        
        try {
            const nextUrl = new URL(path, window.location.href);
            const fetchPath = `${nextUrl.pathname}${nextUrl.search}`;
            const hash = nextUrl.hash || '';

            // Fade out current content
            if (animate) {
                contentArea.style.opacity = '0';
                await this.sleep(200);
            }
            
            // Fetch new page
            const response = await fetch(fetchPath);
            if (!response.ok) throw new Error('Page not found');
            
            const html = await response.text();
            
            // Parse the new page
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract content (everything between navbar and footer)
            const newNavbar = doc.querySelector('.navbar');
            const newFooter = doc.querySelector('footer');
            let newContent = [];
            
            if (newNavbar) {
                let current = newNavbar.nextElementSibling;
                while (current && current !== newFooter && current.tagName !== 'FOOTER') {
                    newContent.push(current.outerHTML);
                    current = current.nextElementSibling;
                }
            } else {
                // No navbar in new page, get body content
                const body = doc.body;
                Array.from(body.children).forEach(child => {
                    if (child.tagName !== 'NAV' && child.tagName !== 'FOOTER' && 
                        !child.classList.contains('navbar') && child.tagName !== 'SCRIPT') {
                        newContent.push(child.outerHTML);
                    }
                });
            }
            
            // Update content
            contentArea.innerHTML = newContent.join('');
            
            // Update page title
            const newTitle = doc.querySelector('title');
            if (newTitle) {
                document.title = newTitle.textContent;
            }

            // Update meta description from the fetched page (if present).
            const newDesc = doc.querySelector('meta[name="description"]');
            if (newDesc && newDesc.getAttribute('content')) {
                let desc = document.querySelector('meta[name="description"]');
                if (!desc) {
                    desc = document.createElement('meta');
                    desc.setAttribute('name', 'description');
                    document.head.appendChild(desc);
                }
                desc.setAttribute('content', newDesc.getAttribute('content'));
            }

            // Replace BlogPosting JSON-LD (if the destination page defines it).
            // This prevents stale BlogPosting markup when navigating without full reload.
            const destBlogLd = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).filter((s) =>
                /\"@type\"\\s*:\\s*\"BlogPosting\"/i.test(s.textContent || '')
            );
            if (destBlogLd.length) {
                Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).forEach((s) => {
                    if (/\"@type\"\\s*:\\s*\"BlogPosting\"/i.test(s.textContent || '')) {
                        s.remove();
                    }
                });
                destBlogLd.forEach((s) => {
                    const clone = document.createElement('script');
                    clone.type = 'application/ld+json';
                    clone.textContent = s.textContent || '';
                    document.head.appendChild(clone);
                });
            }
            
            // Update active nav state
            this.updateActiveNav(nextUrl.pathname);
            
            // Re-run any inline scripts from the new content
            this.executeScripts(contentArea);
            
            // Fade in new content
            if (animate) {
                await this.sleep(50);
                contentArea.style.opacity = '1';
            }
            
            // Re-initialize animations and observers
            this.reinitializeFeatures();

            // Scroll after content + feature re-init (supports anchor navigation).
            if (hash && hash.length > 1) {
                const id = hash.slice(1);
                const target = document.getElementById(id) || document.querySelector(`[name="${CSS.escape(id)}"]`);
                if (target && typeof target.scrollIntoView === 'function') {
                    target.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'start' });
                } else {
                    window.scrollTo(0, 0);
                }
            } else {
                window.scrollTo(0, 0);
            }
            
        } catch (error) {
            console.error('SPA Navigation error:', error);
            // Fallback to regular navigation
            window.location.href = path;
        }
    },
    
    updateActiveNav(path) {
        // Remove all active classes
        document.querySelectorAll('.nav-link.active').forEach(link => {
            link.classList.remove('active');
        });
        
        // Determine which nav item should be active (path only; strip query/hash)
        const safePath = String(path || '').split('?')[0].split('#')[0];
        const filename = safePath.split('/').pop() || 'index-variant-2.html';
        
        document.querySelectorAll('.nav-menu .nav-link, .nav-links .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            
            const linkFilename = href.split('/').pop();
            
            // Check for exact match or index page
            if (linkFilename === filename || 
                (filename === '' && linkFilename === 'index-variant-2.html') ||
                (filename === 'index-variant-2.html' && linkFilename === 'index-variant-2.html')) {
                link.classList.add('active');
            }
            
            // Check for section matches (spaces, services, etc.)
            if (safePath.includes('bathrooms') || safePath.includes('bedrooms') || 
                safePath.includes('kitchens') || safePath.includes('dining') ||
                safePath.includes('living') || safePath.includes('office') ||
                safePath.includes('kids') || safePath.includes('entryway') ||
                safePath.includes('bar-area') || safePath.includes('laundry') ||
                safePath.includes('outdoor')) {
                if (link.textContent.trim() === 'SPACES') {
                    link.classList.add('active');
                }
            }
            
            if (safePath.includes('cities') || safePath.includes('residential') ||
                safePath.includes('commercial') || safePath.includes('interior-styling') ||
                safePath.includes('space-planning') || safePath.includes('services')) {
                if (link.textContent.trim() === 'SERVICES') {
                    link.classList.add('active');
                }
            }
            
            if (safePath.includes('projects') || safePath.includes('portfolio')) {
                if (link.textContent.trim() === 'PORTFOLIO') {
                    link.classList.add('active');
                }
            }

            if (safePath.includes('gallery')) {
                if (link.textContent.trim() === 'GALLERY') {
                    link.classList.add('active');
                }
            }

            if (safePath.includes('about') || safePath.includes('blog') || safePath.includes('/blog/')) {
                if (link.textContent.trim() === 'ABOUT') {
                    link.classList.add('active');
                }
            }
        });
    },
    
    executeScripts(container) {
        // Find and execute inline scripts
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    },
    
    reinitializeFeatures() {
        // Re-observe elements for animations
        const animatedElements = document.querySelectorAll(
            '.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, ' +
            '.slide-in-left, .slide-in-right, .scale-in-image, .parallax-image'
        );
        
        animatedElements.forEach(element => {
            element.classList.remove('visible');
            if (typeof scrollAnimationObserver !== 'undefined') {
                scrollAnimationObserver.observe(element);
            }
        });
        
        // Re-initialize masonry if present
        if (typeof initMasonry === 'function') {
            setTimeout(initMasonry, 100);
        }
        
        // Trigger resize to recalculate layouts
        window.dispatchEvent(new Event('resize'));

        // Re-apply image optimizations and CDN rewriting for newly injected content (if SPA is enabled).
        if (typeof window.__ensureR2Images === 'function') {
            window.__ensureR2Images();
        } else if (typeof window.applyR2Images === 'function') {
            window.applyR2Images(document);
        }
        if (typeof window.__optimizeImages === 'function') {
            window.__optimizeImages(document);
        }

        // Refresh canonical/OG/twitter meta (useful if SPA nav is enabled).
        if (typeof window.__ensureSeoMeta === 'function') {
            window.__ensureSeoMeta();
            setTimeout(() => {
                try { window.__ensureSeoMeta(); } catch (e) {}
            }, 250);
        }

        // Page-specific sections that render via JS (safe no-op if absent)
        if (typeof window.initializePressSection === 'function') {
            window.initializePressSection();
        }
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize SPA navigation after DOM is ready
// TEMPORARILY DISABLED FOR DEBUGGING
// document.addEventListener('DOMContentLoaded', () => {
//     // Small delay to ensure page is fully rendered
//     setTimeout(() => {
//         SPANav.init();
//     }, 100);
// });

// Mobile Menu Toggle (skip if load-navbar.js already inited the nav to avoid double-binding)
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navAlreadyInited = navbar && navbar.dataset && navbar.dataset.jacNavInited === '1';
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu && !navAlreadyInited) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });

        // Handle dropdown toggle on mobile
        const navDropdowns = navMenu.querySelectorAll('.nav-dropdown');
        navDropdowns.forEach(dropdown => {
            const dropdownLink = dropdown.querySelector('.nav-link');
            if (dropdownLink) {
                dropdownLink.addEventListener('click', function(e) {
                    if (window.innerWidth <= 980) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                });
            }
        });

        // Close mobile menu when clicking on a link (but not dropdown parent)
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.closest('.nav-dropdown') && !link.closest('.nav-dropdown-content')) return;
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                navDropdowns.forEach(dd => dd.classList.remove('active'));
            });
        });

        const dropdownLinks = navMenu.querySelectorAll('.nav-dropdown-content a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                navDropdowns.forEach(dd => dd.classList.remove('active'));
            });
        });
    }

    // Navbar scroll effect
    if (!navbar) return;
    if (!navbar) return;
    
    // Detect page type
    const path = window.location.pathname;
    const isHomePage = path.includes('index-variant-2.html') || path === '/' || path.endsWith('index.html');
    const isPortfolioPage = path.includes('portfolio.html');
    const isProjectPage = path.includes('/projects/');
    const isCityPage = path.includes('/cities/');
    const isSpacePage = path.includes('bathrooms.html') || path.includes('bedrooms.html') || 
                       path.includes('kitchens.html') || path.includes('dining-rooms.html') ||
                       path.includes('living-spaces.html') || path.includes('office-spaces.html') ||
                       path.includes('entryways.html') || path.includes('bar-area.html') ||
                       path.includes('laundry-rooms.html') || path.includes('outdoor-spaces.html');
    
    // Add body class for CSS targeting
    if (isHomePage) {
        document.body.classList.add('home-page');
    } else {
        document.body.classList.remove('home-page');
    }
    
    // Navbar is now consistent across all pages (white background + logo).
    // Ensure any legacy "navbar-dark" styling is removed everywhere.
    navbar.classList.remove('navbar-dark');
    document.body.classList.remove('navbar-dark');
    
    window.addEventListener('scroll', function() {
        if (isHomePage) {
            // Home page: white navbar when scrolled
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        // Internal pages: navbar stays dark, no change on scroll
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
    
    // Observe portfolio items
    document.querySelectorAll('.portfolio-item').forEach(item => {
        observer.observe(item);
    });
    
    // Observe service cards
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
    
    // Enhanced animation observer for new effects
    const enhancedObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const enhancedObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Keep observing in case element leaves and re-enters
            }
        });
    }, enhancedObserverOptions);
    
    // Observe scroll-fade-in elements
    document.querySelectorAll('.scroll-fade-in').forEach(el => {
        enhancedObserver.observe(el);
    });
    
    // Observe slide-in elements
    document.querySelectorAll('.slide-in-left, .slide-in-right').forEach(el => {
        enhancedObserver.observe(el);
    });
    
    // Observe scale-in images
    document.querySelectorAll('.scale-in-image').forEach(el => {
        enhancedObserver.observe(el);
    });
});

// Form handling (for contact form)
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // You can integrate with a form service like Formspree, Basin, or Netlify Forms
    // For now, show success message
    alert('Thank you for your message! We will get back to you soon.');
    form.reset();
    
    return false;
}

// Image lazy loading fallback (for older browsers)
if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src || img.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Testimonial Carousel - Auto-rotate every 3 seconds
document.addEventListener('DOMContentLoaded', function() {
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    
    if (testimonialSlides.length > 0) {
        let currentSlide = 0;
        
        function showNextSlide() {
            // Remove active class from current slide
            testimonialSlides[currentSlide].classList.remove('active');
            
            // Move to next slide
            currentSlide = (currentSlide + 1) % testimonialSlides.length;
            
            // Add active class to new slide
            testimonialSlides[currentSlide].classList.add('active');
        }
        
        // Auto-rotate every 3 seconds
        setInterval(showNextSlide, 3000);
    }
    
    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe portfolio items, service cards, and sections
    document.querySelectorAll('.portfolio-item, .service-card, .stat-item-inline').forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });
    
    // Footer Contact Form
    const footerForm = document.getElementById('footerContactForm');
    
    if (footerForm) {
        footerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(footerForm);
            const data = Object.fromEntries(formData);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            footerForm.reset();
            
            // In production, you would send this to your backend/email service
            console.log('Form submitted:', data);
        });
    }
});

// Review Click Expansion
function expandReview(button) {
    const reviewText = button.closest('.review-text');
    reviewText.classList.add('expanded');
}


// ===================================
// SMOOTH SCROLL FOR "VIEW OUR WORK" BUTTON
// ===================================

document.querySelectorAll('.smooth-scroll').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// HERO IMAGE CAROUSEL - Auto Rotate
// ===================================

let currentSlide = 0;
const carouselImages = document.querySelectorAll('.hero-carousel-img');

function rotateHeroImages() {
    if (carouselImages.length === 0) return;
    
    // Remove active class from current image
    carouselImages[currentSlide].classList.remove('active');
    
    // Move to next image
    currentSlide = (currentSlide + 1) % carouselImages.length;
    
    // Add active class to new image
    carouselImages[currentSlide].classList.add('active');
}

// Rotate every 3 seconds
if (carouselImages.length > 1) {
    setInterval(rotateHeroImages, 3000);
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

const scrollAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all elements with scroll animation classes
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        // Legacy + current page animation classes
        '.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, .scale-in-image, .slide-in-left, .slide-in-right'
    );
    
    animatedElements.forEach(element => {
        scrollAnimationObserver.observe(element);
    });
});

console.log('Hero carousel and scroll animations initialized');

// ===================================
// STICKY CONSULTATION BUTTON
// ===================================

const stickyBtn = document.getElementById('stickyConsultBtn');

window.addEventListener('scroll', () => {
    if (!stickyBtn) return;
    if (window.scrollY > 800) {
        stickyBtn.classList.add('visible');
    } else {
        stickyBtn.classList.remove('visible');
    }
});

// ===================================
// EXIT-INTENT POPUP
// ===================================

const exitPopup = document.getElementById('exitPopup');
const exitPopupClose = document.getElementById('exitPopupClose');
const exitPopupForm = document.getElementById('exitPopupForm');
let exitPopupShown = sessionStorage.getItem('exitPopupShown');
let isExitPopupActive = false;

// If popup markup isn't on this page, skip exit-intent wiring
if (!exitPopup) {
    // Still allow the rest of main.js to run (scroll animations, etc.)
    console.log('Exit-intent popup not present on this page; skipping.');
} else {
// Detect mouse leaving viewport (exit intent)
document.addEventListener('mouseleave', (e) => {
    // Only trigger if mouse leaves from top of page (navigating away)
    if (e.clientY <= 0 && !exitPopupShown && !isExitPopupActive) {
        showExitPopup();
    }
});

function showExitPopup() {
    exitPopup.classList.add('active');
    isExitPopupActive = true;
    sessionStorage.setItem('exitPopupShown', 'true');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function hideExitPopup() {
    exitPopup.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Close popup on X button
if (exitPopupClose) {
    exitPopupClose.addEventListener('click', hideExitPopup);
}

// Close popup on overlay click
exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) hideExitPopup();
});

// Close popup on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isExitPopupActive) {
        hideExitPopup();
    }
});

// Handle form submission
if (exitPopupForm) {
    exitPopupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(exitPopupForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        
        // Here you would send to your backend/CRM
        console.log('Consultation request:', { name, email, phone });
        
        // Show success message
        exitPopup.querySelector('.exit-popup-content').innerHTML = `
            <div style="text-align: center; padding: 2rem 0;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="color: var(--color-primary); margin-bottom: 1rem;">Thank You!</h2>
                <p style="font-size: 1.125rem; line-height: 1.8; color: var(--color-text);">
                    We've received your request for a free 30-minute design consultation.<br><br>
                    <strong>We'll contact you within 24 hours</strong> to schedule your call.<br><br>
                    We look forward to discussing your project!
                </p>
                <button onclick="document.getElementById('exitPopup').classList.remove('active'); document.body.style.overflow = '';" 
                        class="btn btn-primary" style="margin-top: 2rem;">Close</button>
            </div>
        `;
        
        setTimeout(() => {
            hideExitPopup();
        }, 5000);
    });
}
} // end: exitPopup present guard

console.log('Conversion optimization features loaded');


// ===================================
// PARALLAX IMAGE EFFECT
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const parallaxContainers = document.querySelectorAll('.parallax-container');
    
    if (parallaxContainers.length > 0) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                parallaxContainers.forEach(container => {
                    const img = container.querySelector('img');
                    if (!img) return;
                    
                    const rect = container.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    
                    // Check if element is in viewport
                    if (rect.top < windowHeight && rect.bottom > 0) {
                        // Calculate progress: 0 when entering bottom, 1 when leaving top
                        // Actually let's do center-based.
                        // When rect.top + rect.height/2 is at windowHeight/2, move is 0.
                        
                        const elementCenter = rect.top + (rect.height / 2);
                        const viewportCenter = windowHeight / 2;
                        const distFromCenter = elementCenter - viewportCenter;
                        
                        // Parallax factor (adjust for intensity)
                        // Negative factor moves image opposite to scroll (standard parallax feel)
                        const speed = container.dataset.speed || 0.2;
                        
                        const yPos = distFromCenter * speed;
                        
                        img.style.transform = `translateY(${yPos}px)`;
                    }
                });
            });
        });
    }
});
console.log('Parallax initialized');

