#!/usr/bin/env python3
"""
Rebuild portfolio.html to EXACTLY match Invero design
- Square images (not rectangular)
- Secondary image in bottom-right corner
- Proper button placement
- Correct spacing and borders
- Tags stacked properly
"""

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

def generate_project_card(slug, title, tags):
    """Generate Invero-style project card HTML"""
    tags_html = '\n                            '.join([
        f'<span class="project-tag">{tag}</span>'
        for tag in tags
    ])
    
    return f'''            <!-- {title} -->
            <div class="project-list-item">
                <a href="projects/{slug}.html" class="project-link">
                    <div class="project-grid">
                        <!-- Left: Image -->
                        <div class="project-image-wrapper">
                            <img src="assets/images/projects/{slug}/{slug}-primary.jpg" alt="{title}" class="primary-img">
                            <img src="assets/images/projects/{slug}/{slug}-hover.jpg" alt="{title} Detail" class="hover-img">
                        </div>
                        
                        <!-- Right: Content -->
                        <div class="project-content-wrapper">
                            <div class="project-top">
                                <span class="project-date">May 6, 2025</span>
                                <h3 class="project-title">{title}</h3>
                                <span class="view-project-link">View project</span>
                            </div>
                            
                            <div class="project-bottom">
                                <div class="project-tags">
                                    {tags_html}
                                </div>
                                <div class="project-secondary-image">
                                    <img src="assets/images/projects/{slug}/{slug}-secondary.jpg" alt="{title} Detail">
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
'''

# Generate all cards
project_cards = '\n'.join([generate_project_card(slug, title, tags) for slug, title, tags in projects])

# Complete HTML with exact Invero styling
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
    <style>
        /* Invero-exact Portfolio Styling */
        body {{
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
        }}

        .project-list-item {{
            margin-bottom: 6rem;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 6rem;
        }}

        .project-list-item:last-child {{
            border-bottom: none;
        }}

        .project-link {{
            text-decoration: none;
            color: inherit;
            display: block;
        }}

        .project-grid {{
            display: flex;
            gap: 3rem;
            align-items: flex-start;
        }}

        /* Left: Square Image */
        .project-image-wrapper {{
            flex: 0 0 40%;
            position: relative;
            overflow: hidden;
            border-radius: 4px;
            aspect-ratio: 1/1;
        }}

        .project-image-wrapper img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }}

        .hover-img {{
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            transition: opacity 0.3s ease;
        }}

        .project-link:hover .hover-img {{
            opacity: 1;
        }}

        /* Right: Content */
        .project-content-wrapper {{
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-left: 20px;
            min-height: 550px;
        }}

        .project-top {{
            flex: 0;
        }}

        .project-date {{
            display: block;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #999;
            margin-bottom: 0.5rem;
        }}

        .project-title {{
            font-size: 2.5rem;
            font-weight: 500;
            margin: 0.5rem 0 1rem 0;
            letter-spacing: -1px;
            line-height: 1.1;
        }}

        .view-project-link {{
            display: inline-block;
            font-size: 0.875rem;
            font-weight: 500;
            color: rgb(34, 42, 38);
            text-decoration: underline;
            text-underline-offset: 4px;
        }}

        /* Bottom: Tags + Secondary Image */
        .project-bottom {{
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 2rem;
            width: 100%;
            margin-top: auto;
        }}

        .project-tags {{
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            max-width: 400px;
        }}

        .project-tag {{
            padding: 8px 12px;
            background: #f5f5f5;
            border-radius: 4px;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
            font-family: 'IBM Plex Mono', monospace;
        }}

        .project-secondary-image {{
            flex: 0 0 280px;
            width: 280px;
            height: 200px;
            border-radius: 4px;
            overflow: hidden;
        }}

        .project-secondary-image img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }}

        /* Responsive */
        @media (max-width: 768px) {{
            .project-grid {{
                flex-direction: column;
            }}
            
            .project-image-wrapper {{
                flex: 0 0 100%;
            }}
            
            .project-content-wrapper {{
                padding-left: 0;
                padding-top: 2rem;
            }}
            
            .project-bottom {{
                flex-direction: column;
                align-items: flex-start;
            }}
            
            .project-secondary-image {{
                width: 100%;
            }}
        }}
    </style>
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
    <section style="padding: 3rem 0; background: #1a1a1a; color: white; margin-top: 5rem;">
        <div class="container" style="max-width: 1340px;">
            <h1 style="font-size: 3.5rem; font-weight: 500; margin: 0 0 1rem 0; letter-spacing: -1.5px; line-height: 1.1; color: white;">Our Projects</h1>
            <p style="font-size: 16px; color: #ccc; line-height: 1.6; font-weight: 400; max-width: 700px;">Explore our portfolio of luxury interior design projects across Los Angeles, California, and beyond.</p>
        </div>
    </section>

    <!-- Projects List -->
    <section style="padding: 6rem 0;">
        <div class="container" style="max-width: 1340px;">
{project_cards}
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
</body>
</html>'''

# Write the file
with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ Portfolio rebuilt to EXACT Invero design!")
print("   - Square images (1:1 aspect ratio)")
print("   - Secondary image in bottom-right")
print("   - Proper button placement")
print("   - Correct spacing and borders")

