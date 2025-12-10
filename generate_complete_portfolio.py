#!/usr/bin/env python3
"""
Generate complete portfolio.html with all 13 projects
"""

# Project data: slug, title, style tags
projects = [
    ('beverly-hills-alpine', 'Beverly Hills Alpine', ['Modern Spanish', 'Beverly Hills', 'Luxury Living', 'Residential']),
    ('venice-beach-house', 'Venice Beach House', ['Coastal', 'Venice', 'Contemporary', 'Residential']),
    ('toscana-country-club', 'Toscana Country Club', ['Mediterranean', 'Indian Wells', 'Luxury Living', 'Residential']),
    ('madison-club', 'Madison Club', ['Desert Luxury', 'La Quinta', 'Custom Design', 'Residential']),
    ('yellowstone-club', 'Yellowstone Club', ['Mountain Retreat', 'Montana', 'Luxury Living', 'Residential']),
    ('malibu-beach-house', 'Malibu Beach House', ['Coastal', 'Malibu', 'Beach House', 'Residential']),
    ('mulholland-estate', 'Mulholland Estate', ['Modern Luxury', 'Hollywood Hills', 'Estate', 'Residential']),
    ('calabasas-residence', 'Calabasas Residence', ['Contemporary', 'Calabasas', 'Family Home', 'Residential']),
    ('eclectic-sunnyside', 'Eclectic Sunnyside', ['Eclectic', 'Los Angeles', 'Modern', 'Residential']),
    ('palm-desert-oasis', 'Palm Desert Oasis', ['Desert Modern', 'Palm Desert', 'Golf Course', 'Residential']),
    ('panorama-views', 'Panorama Views', ['Mountain Modern', 'Colorado', 'Retreat', 'Residential']),
    ('santa-monica-modern-spanish', 'Santa Monica Modern Spanish', ['Spanish Revival', 'Santa Monica', 'Mediterranean', 'Residential']),
    ('venice-boho-house', 'Venice Boho House', ['Bohemian', 'Venice', 'Ocean Views', 'Residential']),
]

def generate_project_html(slug, title, tags):
    """Generate HTML for a single project card"""
    tags_html = '\n                        '.join([
        f'<span class="tag-gray" style="padding: 8px 12px; background: #f5f5f5; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #666; font-family: \'IBM Plex Mono\', monospace;">{tag}</span>'
        for tag in tags
    ])
    
    return f'''            <!-- Project: {title} -->
            <div class="project-item" style="display: flex; gap: 3rem; margin-bottom: 6rem; padding-bottom: 6rem; border-bottom: 1px solid #e5e5e5;">
                <div class="project-image" style="flex: 0 0 40%; position: relative; overflow: hidden; border-radius: 4px;">
                    <img src="assets/images/projects/{slug}/{slug}-primary.jpg" alt="{title}" class="primary-img" style="width: 100%; height: 550px; object-fit: cover; display: block; transition: opacity 0.3s ease;">
                    <img src="assets/images/projects/{slug}/{slug}-hover.jpg" alt="{title} Detail" class="hover-img" style="width: 100%; height: 550px; object-fit: cover; display: block; position: absolute; top: 0; left: 0; opacity: 0; transition: opacity 0.3s ease;">
                </div>
                <div class="project-content" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-family: 'IBM Plex Mono', monospace;">May 6, 2025</span>
                        <h3 style="font-size: 2.5rem; font-weight: 500; margin: 0.5rem 0 1rem 0; letter-spacing: -1px; font-family: 'Plus Jakarta Sans', sans-serif;">{title}</h3>
                        <a href="projects/{slug}.html" class="view-project-btn" style="display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border: 1px solid rgb(34, 42, 38); border-radius: 3px; background: transparent; color: rgb(34, 42, 38); text-decoration: none; font-size: 18px; font-weight: 500; letter-spacing: -0.8px; line-height: 21.6px; font-family: 'Geist', 'Plus Jakarta Sans', sans-serif; transition: all 0.3s ease;">VIEW PROJECT</a>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; max-width: 400px; margin-top: 2rem;">
                        {tags_html}
                    </div>
                </div>
            </div>
'''

# Generate all project cards
projects_html = '\n'.join([generate_project_html(slug, title, tags) for slug, title, tags in projects])

# Complete HTML
html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio | JAC Interiors</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar scrolled">
        <div class="container">
            <div class="nav-wrapper">
                <a href="index-variant-2.html" class="logo">
                    <img src="assets/images/jac-logo.png" alt="JAC Interiors" class="logo-img">
                </a>
                <div class="nav-menu" id="navMenu">
                    <a href="index-variant-2.html" class="nav-link">HOME</a>
                    <a href="portfolio.html" class="nav-link active">PORTFOLIO</a>
                    <a href="services.html" class="nav-link">SERVICES</a>
                    <a href="about.html" class="nav-link">ABOUT</a>
                    <a href="contact.html" class="nav-link">CONTACT</a>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>

    <!-- Portfolio Header -->
    <section style="padding: 8rem 0 4rem; background: white;">
        <div class="container" style="max-width: 1340px;">
            <h1 style="font-size: 3.5rem; font-weight: 500; margin-bottom: 2rem; letter-spacing: -2px; font-family: 'Plus Jakarta Sans', sans-serif;">Our Projects</h1>
            <p style="font-size: 1.25rem; color: #666; max-width: 700px; line-height: 1.6;">Explore our portfolio of luxury interior design projects across Los Angeles, California, and beyond.</p>
        </div>
    </section>

    <!-- Projects Grid -->
    <section style="padding: 4rem 0 6rem; background: white;">
        <div class="container" style="max-width: 1340px;">
            
{projects_html}

        </div>
    </section>

    <!-- Footer -->
    <footer style="background: #1a1a1a; color: white; padding: 3rem 0 1.5rem;">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 5rem; margin-bottom: 3rem;">
                <div>
                    <img src="assets/images/jac-logo.png" alt="JAC Interiors" style="height: 40px; margin-bottom: 1rem; filter: brightness(0) invert(1);">
                    <p style="color: #999; line-height: 1.6;">Creating luxury spaces that elevate everyday living.</p>
                </div>
                <div>
                    <h4 style="margin-bottom: 1rem; font-weight: 500;">Quick Links</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.5rem;"><a href="portfolio.html" style="color: #999; text-decoration: none;">Portfolio</a></li>
                        <li style="margin-bottom: 0.5rem;"><a href="about.html" style="color: #999; text-decoration: none;">About</a></li>
                        <li style="margin-bottom: 0.5rem;"><a href="contact.html" style="color: #999; text-decoration: none;">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 1rem; font-weight: 500;">Contact</h4>
                    <p style="color: #999; line-height: 1.6;">
                        Los Angeles, CA<br>
                        Phone: (213) 397-0206<br>
                        Email: info@jacinteriors.com
                    </p>
                </div>
            </div>
            <div style="text-align: center; padding-top: 2rem; border-top: 1px solid #333; color: #666;">
                <p>&copy; 2024 JAC Interiors. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="assets/js/main.js"></script>
    <script>
        // Hover effect for project images
        document.querySelectorAll('.project-item').forEach(item => {{
            const primaryImg = item.querySelector('.primary-img');
            const hoverImg = item.querySelector('.hover-img');
            
            item.addEventListener('mouseenter', () => {{
                if (hoverImg) hoverImg.style.opacity = '1';
            }});
            
            item.addEventListener('mouseleave', () => {{
                if (hoverImg) hoverImg.style.opacity = '0';
            }});
        }});

        // Button hover effect
        document.querySelectorAll('.view-project-btn').forEach(btn => {{
            btn.addEventListener('mouseenter', () => {{
                btn.style.background = 'rgb(34, 42, 38)';
                btn.style.color = 'white';
            }});
            btn.addEventListener('mouseleave', () => {{
                btn.style.background = 'transparent';
                btn.style.color = 'rgb(34, 42, 38)';
            }});
        }});
    </script>
</body>
</html>'''

# Write the file
with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ Complete portfolio.html generated with all 13 projects!")
print("Each VIEW PROJECT button correctly links to its project page.")

