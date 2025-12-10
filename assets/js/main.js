// JAC Interiors - Main JavaScript

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const isPortfolioPage = window.location.pathname.includes('portfolio.html');
    const isProjectPage = window.location.pathname.includes('/projects/');
    const isCityPage = window.location.pathname.includes('/cities/');
    
    // On portfolio, project, or city pages, always keep navbar visible
    if (isPortfolioPage || isProjectPage || isCityPage) {
        navbar.classList.add('scrolled');
    }
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            // Don't remove scrolled class on portfolio, project, or city pages
            if (!isPortfolioPage && !isProjectPage && !isCityPage) {
                navbar.classList.remove('scrolled');
            }
        }
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

