// JAC Interiors - Main JavaScript

// ===================================
// SPA-LIKE NAVIGATION (No page reload for navbar)
// ===================================

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
        
        // Resolve relative paths
        const fullPath = new URL(path, window.location.href).pathname;
        
        // Don't navigate to same page
        if (fullPath === window.location.pathname) return;
        
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
            // Fade out current content
            if (animate) {
                contentArea.style.opacity = '0';
                await this.sleep(200);
            }
            
            // Fetch new page
            const response = await fetch(path);
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
            
            // Update active nav state
            this.updateActiveNav(path);
            
            // Re-run any inline scripts from the new content
            this.executeScripts(contentArea);
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Fade in new content
            if (animate) {
                await this.sleep(50);
                contentArea.style.opacity = '1';
            }
            
            // Re-initialize animations and observers
            this.reinitializeFeatures();
            
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
        
        // Determine which nav item should be active
        const filename = path.split('/').pop() || 'index-variant-2.html';
        
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
            if (path.includes('bathrooms') || path.includes('bedrooms') || 
                path.includes('kitchens') || path.includes('dining') ||
                path.includes('living') || path.includes('office') ||
                path.includes('kids') || path.includes('entryway') ||
                path.includes('bar-area') || path.includes('laundry') ||
                path.includes('outdoor')) {
                if (link.textContent.trim() === 'SPACES') {
                    link.classList.add('active');
                }
            }
            
            if (path.includes('cities') || path.includes('residential') ||
                path.includes('commercial') || path.includes('interior-styling') ||
                path.includes('space-planning') || path.includes('services')) {
                if (link.textContent.trim() === 'SERVICES') {
                    link.classList.add('active');
                }
            }
            
            if (path.includes('projects') || path.includes('portfolio')) {
                if (link.textContent.trim() === 'PORTFOLIO') {
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

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
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
                    // On mobile, toggle dropdown instead of navigating
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                });
            }
        });
        
        // Close mobile menu when clicking on a link (but not dropdown parent)
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            // Skip if this link is a dropdown trigger
            if (link.closest('.nav-dropdown') && !link.closest('.nav-dropdown-content')) {
                return; // Dropdown triggers are handled above
            }
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                // Close all dropdowns
                navDropdowns.forEach(dd => dd.classList.remove('active'));
            });
        });
        
        // Close dropdown menu items
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
    const navbar = document.querySelector('.navbar');
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
                       path.includes('kids-bedrooms.html') || path.includes('entryways.html') ||
                       path.includes('bar-area.html') || path.includes('laundry-rooms.html') ||
                       path.includes('outdoor-spaces.html');
    
    // Add body class for CSS targeting
    if (isHomePage) {
        document.body.classList.add('home-page');
    } else {
        document.body.classList.remove('home-page');
    }
    
    // Internal pages (not home): dark navbar with white text
    if (!isHomePage) {
        navbar.classList.add('navbar-dark');
    }
    
    // On portfolio, project, city, or space pages, always keep navbar visible (dark)
    if (!isHomePage && (isPortfolioPage || isProjectPage || isCityPage || isSpacePage)) {
        navbar.classList.add('navbar-dark');
    }
    
    // Home page: ensure navbar-dark is removed
    if (isHomePage) {
        navbar.classList.remove('navbar-dark');
    }
    
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
        '.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in'
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
    if (e.target === exitPopup) {
        hideExitPopup();
    }
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
                        
                        img.style.transform = `translateY(${yPos}px) scale(1.15)`;
                    }
                });
            });
        });
    }
});
console.log('Parallax initialized');

