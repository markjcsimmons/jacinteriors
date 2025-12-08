#!/usr/bin/env python3
"""
Generate SEO-optimized city pages with consistent structure
"""

from pathlib import Path
import re

CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')

# Template for city page main content (after hero, before CTA)
CITY_CONTENT_TEMPLATE = '''
    <section class="section" style="padding-top: 2rem;">
        <div class="container">
            <div class="about-grid">
                <div class="about-image">
                    <img src="{image_path}" alt="{city_name} Interior Design" loading="lazy">
                </div>
                <div class="about-content">
                    <h2>Expert Interior Design in {city_name}</h2>
                    <p>JAC Interiors brings award-winning interior design services to {city_name}. Whether you're renovating, remodeling, or building new, our team creates beautiful, functional spaces that reflect your lifestyle and the unique character of {city_name}.</p>
                    <p>From concept to completion, we handle every detail of your {city_name} interior design project. Our full-service approach includes space planning, furniture selection, custom cabinetry, lighting design, and complete project management.</p>
                    
                    <h3 style="margin-top: 2rem; font-size: 1.125rem; font-weight: 600;">Our Services Include:</h3>
                    <ul style="margin-left: 1.5rem; line-height: 1.8; margin-top: 1rem;">
                        <li>Full-Service Interior Design & Project Management</li>
                        <li>Kitchen & Bathroom Remodeling</li>
                        <li>Living, Dining & Bedroom Design</li>
                        <li>Custom Built-Ins, Cabinetry & Closets</li>
                        <li>Lighting Design & Art Curation</li>
                        <li>Space Planning & Custom Floorplans</li>
                        <li>Furniture Selection & Décor Curation</li>
                        <li>3D Renderings & CAD Drafting</li>
                        <li>Design-Build Collaborations</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section class="section" style="background-color: var(--color-bg-alt);">
        <div class="container">
            <div class="section-header">
                <h2>Why Choose JAC Interiors for Your {city_name} Home?</h2>
            </div>
            
            <div class="services-grid">
                <div class="service-card">
                    <h3>Local Expertise</h3>
                    <p>We understand {city_name}'s unique character and design aesthetic. Our team creates interiors that feel authentic to the neighborhood while reflecting your personal style.</p>
                </div>

                <div class="service-card">
                    <h3>Full-Service Design</h3>
                    <p>From initial concept through final installation, we manage every aspect of your project. One team, one vision, seamless execution.</p>
                </div>

                <div class="service-card">
                    <h3>Proven Process</h3>
                    <p>With over 12 years of experience and 150+ completed projects, we've refined our approach to deliver beautiful results on time and within budget.</p>
                </div>

                <div class="service-card">
                    <h3>Personalized Approach</h3>
                    <p>We don't push a signature style—we bring your vision to life. Every project is tailored to your lifestyle, taste, and how you actually live in your space.</p>
                </div>
            </div>
        </div>
    </section>'''

def get_city_image_path(city_slug):
    """Determine which image to use for this city"""
    
    # Cities with dedicated images
    city_images = {
        'beverly-hills': '../assets/images/cities/Beverly-Hills-07190926_2000x3d09.jpg',
        'culver-city': '../assets/images/cities/JAC-culver-city-04_2000x4a3c.jpg',
        'encino': '../assets/images/cities/JAC_Encino-14_3c86e541-dde6-4cd6-a271-7af30a5e7ad3_2000x7394.jpg',
        'hollywood': '../assets/images/cities/jac-cities-hollywood-1_1200x_db47aaec-7e62-4e7b-b047-e669869c01f7_2000xda8b.jpg',
        'manhattan-beach': '../assets/images/cities/jac-cities-manhattan-beach-1_2000x7394.jpg',
        'pasadena': '../assets/images/cities/jac-cities-pasadena-1_2000x37f0.jpg',
        'santa-monica': '../assets/images/cities/jac-cities-santa-monica-1-500x1000_2000xbbd7.jpg',
    }
    
    # Return dedicated image if available, otherwise use a default project image
    return city_images.get(city_slug, '../assets/images/projects/venice-beach-house.jpg')

def update_city_page_with_template(city_file):
    """Update a city page with consistent SEO-optimized structure"""
    
    with open(city_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract city name from H1
    h1_match = re.search(r'<h1>(.*?)</h1>', content)
    if not h1_match:
        return False
    
    city_title = h1_match.group(1)
    # Clean up title - extract just city name
    city_name = re.sub(r' Interior Design.*$', '', city_title)
    city_name = re.sub(r'^.*Interior Design Services in ', '', city_name)
    city_name = city_name.strip()
    
    city_slug = city_file.stem
    image_path = get_city_image_path(city_slug)
    
    # Generate content for this city
    city_content = CITY_CONTENT_TEMPLATE.format(
        city_name=city_name,
        image_path=image_path
    )
    
    # Replace content between first closing </section> and CTA section
    # Find the intro section end
    intro_section_pattern = r'(</section>\s*<section class="section"[^>]*>.*?</section>)'
    
    # Find where to insert (after first section, before CTA or next section with background-color)
    pattern = r'(</section>\s*)(<section class="section"[^>]*style="background-color: var\(--color-bg-alt\);">|<section class="section cta-section">)'
    
    # Try to find existing content sections to replace
    if re.search(pattern, content):
        # Replace existing sections
        content = re.sub(pattern, city_content + '\n\n\\2', content, count=1)
    else:
        # Insert after intro section
        pattern2 = r'(</section>\s*)(<section class="section cta-section">)'
        if re.search(pattern2, content):
            content = re.sub(pattern2, city_content + '\n\n\\2', content, count=1)
    
    with open(city_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    """Process all city pages"""
    print("Applying consistent SEO-optimized structure to all city pages...")
    print("="*70)
    
    city_files = sorted(CITY_DIR.glob('*.html'))
    updated_count = 0
    
    for city_file in city_files:
        try:
            if update_city_page_with_template(city_file):
                updated_count += 1
                print(f"✅ {city_file.stem}")
        except Exception as e:
            print(f"❌ {city_file.stem}: {e}")
    
    print("\n" + "="*70)
    print(f"✨ Updated {updated_count} city pages with consistent SEO structure")

if __name__ == '__main__':
    main()

