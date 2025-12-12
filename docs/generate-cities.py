#!/usr/bin/env python3
"""
Generate city pages for JAC Interiors website
"""

import os

# List of cities to create pages for
CITIES = {
    # Los Angeles Westside
    'bel-air': {'name': 'Bel Air', 'desc': 'luxurious hillside estates', 'region': 'Los Angeles'},
    'beverly-hills': {'name': 'Beverly Hills', 'desc': 'sophisticated luxury homes', 'region': 'Los Angeles'},
    'brentwood': {'name': 'Brentwood', 'desc': 'elegant family homes', 'region': 'Los Angeles'},
    'culver-city': {'name': 'Culver City', 'desc': 'modern urban living', 'region': 'Los Angeles'},
    'westwood': {'name': 'Westwood', 'desc': 'classic California style', 'region': 'Los Angeles'},
    'west-hollywood': {'name': 'West Hollywood', 'desc': 'contemporary urban design', 'region': 'Los Angeles'},
    'pacific-palisades': {'name': 'Pacific Palisades', 'desc': 'coastal elegance', 'region': 'Los Angeles'},
    
    # Beach Cities
    'santa-monica': {'name': 'Santa Monica', 'desc': 'coastal-inspired design', 'region': 'Los Angeles'},
    'venice': {'name': 'Venice', 'desc': 'bohemian beachside living', 'region': 'Los Angeles'},
    'marina-del-rey': {'name': 'Marina del Rey', 'desc': 'waterfront living', 'region': 'Los Angeles'},
    'manhattan-beach': {'name': 'Manhattan Beach', 'desc': 'sophisticated beach homes', 'region': 'Los Angeles'},
    'hermosa-beach': {'name': 'Hermosa Beach', 'desc': 'relaxed coastal style', 'region': 'Los Angeles'},
    'redondo-beach': {'name': 'Redondo Beach', 'desc': 'beachside comfort', 'region': 'Los Angeles'},
    
    # Valley
    'calabasas': {'name': 'Calabasas', 'desc': 'luxury mountain living', 'region': 'Los Angeles'},
    'woodland-hills': {'name': 'Woodland Hills', 'desc': 'comfortable suburban elegance', 'region': 'Los Angeles'},
    'encino': {'name': 'Encino', 'desc': 'upscale valley living', 'region': 'Los Angeles'},
    'sherman-oaks': {'name': 'Sherman Oaks', 'desc': 'modern family homes', 'region': 'Los Angeles'},
    'studio-city': {'name': 'Studio City', 'desc': 'creative living spaces', 'region': 'Los Angeles'},
    'burbank': {'name': 'Burbank', 'desc': 'contemporary design', 'region': 'Los Angeles'},
    
    # Central LA
    'los-feliz': {'name': 'Los Feliz', 'desc': 'historic charm with modern flair', 'region': 'Los Angeles'},
    'silverlake': {'name': 'Silver Lake', 'desc': 'artistic contemporary design', 'region': 'Los Angeles'},
    'hollywood-hills': {'name': 'Hollywood Hills', 'desc': 'hillside modern luxury', 'region': 'Los Angeles'},
    'downtown-la': {'name': 'Downtown Los Angeles', 'desc': 'urban loft living', 'region': 'Los Angeles'},
    
    # South Bay
    'palos-verdes': {'name': 'Palos Verdes', 'desc': 'coastal estate living', 'region': 'Los Angeles'},
    'torrance': {'name': 'Torrance', 'desc': 'comfortable modern homes', 'region': 'Los Angeles'},
    
    # Pasadena Area
    'pasadena': {'name': 'Pasadena', 'desc': 'classic craftsman and modern design', 'region': 'Los Angeles'},
    'san-marino': {'name': 'San Marino', 'desc': 'prestigious estate design', 'region': 'Los Angeles'},
    
    # Florida
    'miami': {'name': 'Miami', 'desc': 'tropical modern luxury', 'region': 'Florida'},
    'miami-beach': {'name': 'Miami Beach', 'desc': 'art deco and modern beachfront', 'region': 'Florida'},
    'coral-gables': {'name': 'Coral Gables', 'desc': 'Mediterranean elegance', 'region': 'Florida'},
    'coconut-grove': {'name': 'Coconut Grove', 'desc': 'lush tropical living', 'region': 'Florida'},
    'brickell': {'name': 'Brickell', 'desc': 'urban contemporary luxury', 'region': 'Florida'},
    'aventura': {'name': 'Aventura', 'desc': 'modern waterfront living', 'region': 'Florida'},
    'bal-harbour': {'name': 'Bal Harbour', 'desc': 'ultra-luxury beachfront', 'region': 'Florida'},
    'fort-lauderdale': {'name': 'Fort Lauderdale', 'desc': 'coastal sophistication', 'region': 'Florida'},
    'boca-raton': {'name': 'Boca Raton', 'desc': 'refined coastal living', 'region': 'Florida'},
}

HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Interior design services in {city_name}. JAC Interiors creates beautiful spaces for {city_name} homes with expert design and attention to detail.">
    <title>{city_name} Interior Designer | JAC Interiors</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="nav-wrapper">
                <a href="../index.html" class="logo">
                    <img src="../assets/images/jac-logo.png" alt="JAC Interiors" class="logo-img">
                </a>
                <div class="nav-menu" id="navMenu">
                    <a href="../index.html" class="nav-link">Home</a>
                    <a href="../portfolio.html" class="nav-link">Portfolio</a>
                    <a href="../about.html" class="nav-link">About</a>
                    <a href="../services.html" class="nav-link">Services</a>
                    <a href="../contact.html" class="nav-link">Contact</a>
                    <div class="nav-contact">
                        <a href="tel:213-397-0206" class="phone-link">213-397-0206</a>
                    </div>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>

    <section class="section" style="padding-top: 100px; padding-bottom: 2rem;">
        <div class="container">
            <div class="section-header">
                <span class="section-label">Interior Design Services</span>
                <h1>{city_name} Interior Designer</h1>
                <p>Transform your {city_name} home with JAC Interiors' expert interior design services. Creating beautiful spaces that reflect the unique character of {city_name}.</p>
            </div>
        </div>
    </section>

    <section class="section" style="padding-top: 2rem;">
        <div class="container">
            <div class="about-grid">
                <div class="about-image">
                    <img src="../assets/images/projects/{image}.jpg" alt="{city_name} Interior Design" loading="lazy">
                </div>
                <div class="about-content">
                    <h2>Expert Interior Design in {city_name}</h2>
                    <p>JAC Interiors brings expert interior design services to {city_name}. Whether you're renovating, remodeling, or building new, our team creates {desc} that reflect your lifestyle and the character of {city_name}.</p>
                    <p>From concept to completion, we handle every detail of your {city_name} interior design project. Our full-service approach includes space planning, furniture selection, custom cabinetry, lighting design, and complete project management.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section" style="background-color: var(--color-bg-alt);">
        <div class="container">
            <div class="section-header">
                <h2>Our {city_name} Interior Design Services</h2>
            </div>
            
            <div class="services-grid">
                <div class="service-card">
                    <h3>Residential Interior Design</h3>
                    <p>Complete interior design services for {city_name} homes. From full home renovations to single room makeovers.</p>
                </div>

                <div class="service-card">
                    <h3>Kitchen & Bathroom Remodels</h3>
                    <p>Transform your kitchens and bathrooms with modern luxury and functional design tailored to {city_name} living.</p>
                </div>

                <div class="service-card">
                    <h3>Space Planning & Layout</h3>
                    <p>Optimize your {city_name} home's layout for better flow, functionality, and style.</p>
                </div>

                <div class="service-card">
                    <h3>Furniture & Decor Selection</h3>
                    <p>Curated furniture and decor that reflects your personal style and the character of {city_name}.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section cta-section">
        <div class="container">
            <div class="cta-content">
                <h2>Ready to Transform Your {city_name} Home?</h2>
                <p>Contact JAC Interiors today for a consultation. Let's create a beautiful space you'll love.</p>
                <a href="../contact.html" class="btn btn-primary">Get in Touch</a>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <h4>JAC Interiors</h4>
                    <p>We are a full-service design studio with the vision and organizational skills to make beautiful transformations happen.</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/JacInteriors" target="_blank" rel="noopener">Facebook</a>
                        <a href="https://www.instagram.com/jacinteriorsdesign/" target="_blank" rel="noopener">Instagram</a>
                        <a href="https://www.houzz.com/pro/jacinteriors/jac-interiors" target="_blank" rel="noopener">Houzz</a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="../services.html">Residential Design</a></li>
                        <li><a href="../services.html">Commercial Design</a></li>
                        <li><a href="../services.html">Interior Styling</a></li>
                        <li><a href="../services.html">Space Planning</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="../about.html">About Us</a></li>
                        <li><a href="../portfolio.html">Portfolio</a></li>
                        <li><a href="../contact.html">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Contact</h4>
                    <div class="contact-info">
                        <p>10401 Venice Blvd Suite 257<br>
                        Los Angeles, CA 90034<br>
                        <a href="tel:213-397-0206">213-397-0206</a><br>
                        <a href="mailto:info@jacinteriors.com">info@jacinteriors.com</a></p>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 JAC Interiors, LLC. All Rights Reserved.</p>
            </div>
        </div>
    </footer>

    <script src="../assets/js/main.js"></script>
</body>
</html>
'''

def generate_city_pages():
    """Generate all city pages"""
    cities_dir = 'cities'
    
    # Create cities directory if it doesn't exist
    if not os.path.exists(cities_dir):
        os.makedirs(cities_dir)
    
    # Determine which image to use based on region
    image_map = {
        'Los Angeles': 'beverly-hills-alpine',
        'Florida': 'venice-beach-house'
    }
    
    for slug, data in CITIES.items():
        filename = f"{cities_dir}/{slug}.html"
        image = image_map.get(data['region'], 'beverly-hills-alpine')
        
        html = HTML_TEMPLATE.format(
            city_name=data['name'],
            desc=data['desc'],
            image=image
        )
        
        with open(filename, 'w') as f:
            f.write(html)
        
        print(f"Created: {filename}")
    
    print(f"\n✅ Generated {len(CITIES)} city pages!")

if __name__ == '__main__':
    generate_city_pages()




