
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
                        const speed = container.dataset.speed || 0.15;
                        
                        const yPos = distFromCenter * speed;
                        
                        img.style.transform = `translateY(${yPos}px) scale(1.1)`;
                    }
                });
            });
        });
    }
});
console.log('Parallax initialized');

