#!/usr/bin/env python3
"""
Create space pages using the same design as project pages.
"""

import os

# Space pages to create
SPACES = [
    {
        'filename': 'bathrooms.html',
        'title': 'Bathrooms',
        'heading': 'Bathroom Design',
        'description': 'Luxurious bathroom spaces that blend functionality with refined aesthetics',
        'vision_title': 'Spa-Inspired Living',
        'vision_text': 'Our bathroom designs transform everyday routines into moments of luxury. From statement vanities to rainfall showers, we create spaces that combine practicality with indulgence.',
        'folder': 'bathrooms'
    },
    {
        'filename': 'bedrooms.html',
        'title': 'Bedrooms',
        'heading': 'Bedroom Design',
        'description': 'Tranquil bedroom retreats designed for rest and rejuvenation',
        'vision_title': 'Restful Retreats',
        'vision_text': 'We design bedrooms that serve as personal sanctuaries. Thoughtful lighting, curated textures, and harmonious color palettes create spaces that invite relaxation and peaceful sleep.',
        'folder': 'bedrooms'
    },
    {
        'filename': 'kitchens.html',
        'title': 'Kitchens',
        'heading': 'Kitchen Design',
        'description': 'Modern kitchens that inspire culinary creativity and gathering',
        'vision_title': 'The Heart of the Home',
        'vision_text': 'Our kitchen designs balance beauty with functionality. From custom cabinetry to professional-grade appliances, we create spaces where cooking becomes a joy and entertaining feels effortless.',
        'folder': 'kitchens'
    },
    {
        'filename': 'dining-rooms.html',
        'title': 'Dining Rooms',
        'heading': 'Dining Room Design',
        'description': 'Elegant dining spaces designed for memorable gatherings',
        'vision_title': 'Gathering in Style',
        'vision_text': 'We create dining rooms that set the stage for connection and celebration. Statement lighting, refined furnishings, and thoughtful layouts transform meals into memorable experiences.',
        'folder': 'dining-rooms'
    },
    {
        'filename': 'living-spaces.html',
        'title': 'Living Spaces',
        'heading': 'Living Space Design',
        'description': 'Inviting living areas that balance comfort with sophisticated style',
        'vision_title': 'Living Beautifully',
        'vision_text': 'Our living spaces invite you to relax, entertain, and live fully. We layer textures, curate art, and select furnishings that reflect your lifestyle while creating visual harmony.',
        'folder': 'living-spaces'
    },
    {
        'filename': 'office-spaces.html',
        'title': 'Office Spaces',
        'heading': 'Home Office Design',
        'description': 'Productive home offices designed for focus and inspiration',
        'vision_title': 'Work in Style',
        'vision_text': 'We design home offices that enhance productivity without sacrificing aesthetics. From built-in shelving to ergonomic layouts, our spaces support your best work.',
        'folder': 'office-spaces'
    },
    {
        'filename': 'kids-bedrooms.html',
        'title': "Kid's Bedrooms",
        'heading': "Kid's Bedroom Design",
        'description': 'Playful yet sophisticated spaces that grow with your children',
        'vision_title': 'Imagination Meets Design',
        'vision_text': "We create children's rooms that spark joy and creativity while maintaining a cohesive aesthetic with your home. Durable materials and flexible designs ensure these spaces evolve with your child.",
        'folder': 'kids-bedrooms'
    },
    {
        'filename': 'entryways.html',
        'title': 'Entryways',
        'heading': 'Entryway Design',
        'description': 'Welcoming entryways that set the tone for your entire home',
        'vision_title': 'First Impressions',
        'vision_text': 'The entryway is your home\'s first impression. We design these transitional spaces to be both functional and beautiful, with smart storage solutions and eye-catching details.',
        'folder': 'entryways'
    },
    {
        'filename': 'bar-area.html',
        'title': 'Bar Areas',
        'heading': 'Bar Area Design',
        'description': 'Sophisticated bar spaces for entertaining and relaxation',
        'vision_title': 'Entertaining Excellence',
        'vision_text': 'From wine cellars to cocktail bars, we design spaces that elevate entertaining. Custom millwork, specialty lighting, and curated accessories create the perfect backdrop for gathering.',
        'folder': 'bar-area'
    },
    {
        'filename': 'laundry-rooms.html',
        'title': 'Laundry Rooms',
        'heading': 'Laundry Room Design',
        'description': 'Functional laundry spaces that make chores a pleasure',
        'vision_title': 'Utility Meets Beauty',
        'vision_text': 'We transform laundry rooms from afterthoughts into well-designed spaces. Smart organization, quality finishes, and thoughtful layouts make everyday tasks more enjoyable.',
        'folder': 'laundry-rooms'
    },
    {
        'filename': 'outdoor-spaces.html',
        'title': 'Outdoor Spaces',
        'heading': 'Outdoor Living Design',
        'description': 'Stunning outdoor areas that extend your living space into nature',
        'vision_title': 'Indoor-Outdoor Living',
        'vision_text': 'We design outdoor spaces that feel like natural extensions of your home. From covered patios to poolside lounges, these areas invite you to enjoy California living year-round.',
        'folder': 'outdoor-spaces'
    }
]

# Template for space pages
TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>{title} | JAC Interiors</title>
    <link href="assets/css/style.css" rel="stylesheet"/>
    <style>
        @media (max-width: 768px) {{
            .first-row-image {{ order: 2 !important; }}
            .first-row-text {{ order: 1 !important; }}
            .first-row-grid {{ grid-template-columns: 1fr !important; }}
        }}
        @media (min-width: 769px) {{
            .first-row-image {{ order: 1 !important; }}
            .first-row-text {{ order: 2 !important; }}
        }}
        .image-container {{
            width: 100%;
            border-radius: 4px;
            overflow: hidden;
        }}
        .image-container img {{
            width: 100%;
            height: auto;
            display: block;
        }}
        .image-gallery-grid {{
            position: relative;
            width: 100%;
            box-sizing: border-box;
        }}
        .image-gallery-grid > div {{
            position: absolute;
            width: calc(50% - 1rem);
            box-sizing: border-box;
            transition: transform 0.3s ease;
        }}
        .image-gallery-grid .image-container {{
            margin: 0;
        }}
        .image-gallery-grid .image-container img {{
            margin: 0;
            display: block;
            width: 100%;
            height: auto;
        }}
        .first-row-grid {{
            width: 100%;
            box-sizing: border-box;
        }}
        @media (max-width: 768px) {{
            .image-gallery-grid > div {{
                width: 100%;
            }}
        }}
        @media (min-width: 1200px) {{
            .image-gallery-grid > div {{
                width: calc(33.333% - 1.33rem);
            }}
        }}
    </style>
</meta></head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-wrapper">
                <a href="index-variant-2.html" class="logo">
                    <img src="assets/images/jac-logo.png" alt="JAC Interiors" class="logo-img">
                </a>
                <div class="nav-menu" id="navMenu">
                    <a href="index-variant-2.html" class="nav-link">HOME</a>
                    <a href="portfolio.html" class="nav-link">PORTFOLIO</a>
                    <div class="nav-dropdown">
                        <a href="#" class="nav-link active">SPACES</a>
                        <div class="nav-dropdown-content">
                            <a href="bathrooms.html">Bathrooms</a>
                            <a href="bedrooms.html">Bedrooms</a>
                            <a href="kitchens.html">Kitchens</a>
                            <a href="dining-rooms.html">Dining Rooms</a>
                            <a href="living-spaces.html">Living Spaces</a>
                            <a href="office-spaces.html">Office Spaces</a>
                            <a href="kids-bedrooms.html">Kid's Bedrooms</a>
                            <a href="entryways.html">Entryways</a>
                            <a href="bar-area.html">Bar Area</a>
                            <a href="laundry-rooms.html">Laundry Rooms</a>
                            <a href="outdoor-spaces.html">Outdoor Spaces</a>
                        </div>
                    </div>
                    <div class="nav-dropdown">
                        <a href="services.html" class="nav-link">SERVICES</a>
                        <div class="nav-dropdown-content">
                            <a href="residential-design.html">Residential Design</a>
                            <a href="commercial-design.html">Commercial Design</a>
                            <a href="interior-styling.html">Interior Styling</a>
                            <a href="space-planning.html">Space Planning</a>
                            <a href="cities-we-serve.html">Cities We Serve</a>
                        </div>
                    </div>
                    <a href="about.html" class="nav-link">ABOUT</a>
                    <a href="contact.html" class="nav-link">CONTACT</a>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>

    <!-- Page Header with Metadata -->
    <section style="padding: 3rem 0; background: #1a1a1a; color: white; margin-top: 5rem;">
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4rem; flex-wrap: wrap;">
                <div style="flex: 1; max-width: 600px;">
                    <h1 class="scroll-fade-in" style="font-size: 3.5rem; font-weight: 500; margin: 0 0 1rem 0; letter-spacing: -1.5px; line-height: 1.1; color: white;">{heading}</h1>
                    <p class="scroll-fade-in delay-1" style="font-size: 16px; color: #ccc; line-height: 1.6; font-weight: 400; margin-top: 0.5rem;">{description}</p>
                </div>
                <div style="display: flex; gap: 3rem; flex-shrink: 0;">
                    <div class="scroll-fade-in delay-1">
                        <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 0.5rem;">Category</div>
                        <div style="font-weight: 400; font-size: 0.95rem; color: white;">Interior Design</div>
                    </div>
                    <div class="scroll-fade-in delay-2">
                        <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 0.5rem;">Region</div>
                        <div style="font-weight: 400; font-size: 0.95rem; color: white;">Los Angeles & Miami</div>
                    </div>
                    <div class="scroll-fade-in delay-3">
                        <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 0.5rem;">Style</div>
                        <div style="font-weight: 400; font-size: 0.95rem; color: white;">Luxury Residential</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Image Gallery -->
    <section style="padding: 4rem 0;">
        <div class="container" style="max-width: 1400px;">
            <!-- First Row: Image Left, Text Card Right -->
            <div class="first-row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; width: 100%;">
                <div class="parallax-image scale-in-image hover-zoom-image first-row-image" style="width: 100%;">
                    <div class="image-container">
                        <img alt="{title}" src="assets/images/spaces/{folder}/{folder}-1.jpg"/>
                    </div>
                </div>
                <div class="first-row-text" style="background: #fafafa; padding: 2.5rem; border-radius: 4px; display: flex; flex-direction: column; justify-content: center;">
                    <h3 class="slide-in-right" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -0.5px; color: #1a1a1a;">{vision_title}</h3>
                    <p class="slide-in-right delay-1" style="font-size: 16px; line-height: 24px; color: #444; margin-bottom: 0;">{vision_text}</p>
                </div>
            </div>

            <!-- Image Grid - Masonry layout -->
            <div class="image-gallery-grid" style="margin-bottom: 2rem;">
                <div class="parallax-image scale-in-image hover-zoom-image" style="width: 100%;">
                    <div class="image-container">
                        <img alt="{title}" src="assets/images/spaces/{folder}/{folder}-2.jpg"/>
                    </div>
                </div>
                <div class="parallax-image scale-in-image hover-zoom-image" style="width: 100%;">
                    <div class="image-container">
                        <img alt="{title}" src="assets/images/spaces/{folder}/{folder}-3.jpg"/>
                    </div>
                </div>
                <div class="parallax-image scale-in-image hover-zoom-image" style="width: 100%;">
                    <div class="image-container">
                        <img alt="{title}" src="assets/images/spaces/{folder}/{folder}-4.jpg"/>
                    </div>
                </div>
                <div class="parallax-image scale-in-image hover-zoom-image" style="width: 100%;">
                    <div class="image-container">
                        <img alt="{title}" src="assets/images/spaces/{folder}/{folder}-5.jpg"/>
                    </div>
                </div>
                <div class="parallax-image scale-in-image hover-zoom-image" style="width: 100%;">
                    <div class="image-container">
                        <img alt="{title}" src="assets/images/spaces/{folder}/{folder}-6.jpg"/>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section style="padding: 6rem 0; background: #fafafa; text-align: center;">
        <div class="container" style="max-width: 700px;">
            <h2 class="scroll-fade-in" style="font-size: 2.5rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -1px;">Ready to Transform Your {title}?</h2>
            <p class="scroll-fade-in delay-1" style="font-size: 1.1rem; color: #666; margin-bottom: 2rem; line-height: 1.6;">Let's create a design that reflects your unique style and elevates your everyday living.</p>
            <a class="btn btn-primary scroll-fade-in delay-2" href="contact.html" style="display: inline-block; padding: 1rem 2.5rem; background: var(--color-primary); color: white; text-decoration: none; border-radius: 4px; font-weight: 500; transition: all 0.3s;">Start Your Project</a>
        </div>
    </section>

    <!-- Footer -->
    <footer style="background: #1a1a1a; color: white; padding: 3rem 0 1.5rem;">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 5rem; margin-bottom: 3rem;">
                <div>
                    <img alt="JAC Interiors" src="assets/images/jac-logo.png" style="height: 40px; margin-bottom: 1rem; filter: brightness(0) invert(1);"/>
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
                        Los Angeles, CA<br/>
                        Phone: (310) 555-0123<br/>
                        Email: info@jacinteriors.com
                    </p>
                </div>
            </div>
            <div style="text-align: center; padding-top: 2rem; border-top: 1px solid #333; color: #666;">
                <p>© 2024 JAC Interiors. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="assets/js/main.js"></script>
    <script>
        // Masonry layout implementation
        function initMasonry() {{
            const grid = document.querySelector('.image-gallery-grid');
            if (!grid) return;
            
            const items = Array.from(grid.children);
            if (items.length === 0) return;
            
            const gap = 16;
            let columns = 2;
            
            if (window.innerWidth <= 768) {{
                columns = 1;
            }} else if (window.innerWidth >= 1200) {{
                columns = 3;
            }}
            
            const containerWidth = grid.offsetWidth;
            const columnWidth = (containerWidth - (gap * (columns - 1))) / columns;
            const columnHeights = new Array(columns).fill(0);
            
            items.forEach((item, index) => {{
                const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
                const left = shortestColumnIndex * (columnWidth + gap);
                const top = columnHeights[shortestColumnIndex];
                
                item.style.left = left + 'px';
                item.style.top = top + 'px';
                item.style.width = columnWidth + 'px';
                
                const itemHeight = item.offsetHeight;
                columnHeights[shortestColumnIndex] += itemHeight + gap;
            }});
            
            grid.style.height = Math.max(...columnHeights) + 'px';
        }}

        window.addEventListener('load', () => {{
            const images = document.querySelectorAll('.image-gallery-grid img');
            let loadedCount = 0;
            
            if (images.length === 0) {{
                initMasonry();
                return;
            }}
            
            images.forEach(img => {{
                if (img.complete) {{
                    loadedCount++;
                    if (loadedCount === images.length) {{
                        initMasonry();
                    }}
                }} else {{
                    img.addEventListener('load', () => {{
                        loadedCount++;
                        if (loadedCount === images.length) {{
                            initMasonry();
                        }}
                    }});
                }}
            }});
        }});

        window.addEventListener('resize', () => {{
            initMasonry();
        }});
    </script>
</body>
</html>'''

def main():
    docs_dir = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'
    
    for space in SPACES:
        filepath = os.path.join(docs_dir, space['filename'])
        content = TEMPLATE.format(**space)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Created {space['filename']}")
    
    print(f"\nCreated {len(SPACES)} space pages")

if __name__ == '__main__':
    main()
