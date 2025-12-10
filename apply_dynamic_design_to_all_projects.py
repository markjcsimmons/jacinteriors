#!/usr/bin/env python3
"""
Apply dynamic design from beverly-hills-alpine-SAMPLE.html to all project pages
"""

import os
import re
from pathlib import Path
from bs4 import BeautifulSoup

def extract_project_info(html_content):
    """Extract project metadata and images from existing project page"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract title
    h1 = soup.find('h1')
    title = h1.get_text(strip=True) if h1 else "Project Title"
    
    # Extract subtitle
    subtitle_elem = soup.find('p', class_='project-detail-subtitle')
    subtitle = subtitle_elem.get_text(strip=True) if subtitle_elem else "Luxury interior design that transforms living spaces"
    
    # Extract metadata from meta-grid
    metadata = {
        'client': 'Private Client',
        'location': 'Los Angeles, CA',
        'style': 'Modern',
        'year': '2023'
    }
    
    # Look for meta-grid structure
    meta_grid = soup.find('div', class_='project-meta-grid')
    if meta_grid:
        meta_items = meta_grid.find_all('div', class_='meta-item')
        for item in meta_items:
            label_elem = item.find('span', class_='meta-label')
            value_elem = item.find('span', class_='meta-value')
            if label_elem and value_elem:
                label = label_elem.get_text(strip=True).lower()
                value = value_elem.get_text(strip=True)
                if 'client' in label:
                    metadata['client'] = value
                elif 'location' in label:
                    metadata['location'] = value
                elif 'style' in label:
                    metadata['style'] = value
                elif 'year' in label:
                    metadata['year'] = value
    
    # Extract description from content-body sections
    description = ""
    content_bodies = soup.find_all('div', class_='content-body')
    for body in content_bodies:
        # Get all paragraphs in this section
        paragraphs = body.find_all('p')
        for p in paragraphs:
            text = p.get_text(strip=True)
            if text and len(text) > 20 and 'coming soon' not in text.lower():
                description += text + " "
    
    # If no description found, try getting from any paragraph
    if not description:
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text(strip=True)
            if text and len(text) > 50 and 'Private Client' not in text and 'Read about' not in text:
                description += text + " "
    
    # Extract images from gallery
    images = []
    gallery = soup.find('div', class_='project-gallery-grid')
    if gallery:
        img_tags = gallery.find_all('img')
        for img in img_tags:
            src = img.get('src', '')
            if src and 'projects/' in src and 'logo' not in src.lower():
                # Clean up the path if needed
                images.append(src)
    
    # If no gallery images, try to find any project images
    if not images:
        img_tags = soup.find_all('img')
        for img in img_tags:
            src = img.get('src', '')
            if 'projects/' in src and 'logo' not in src.lower():
                images.append(src)
    
    return {
        'title': title,
        'subtitle': subtitle,
        'metadata': metadata,
        'description': description.strip(),
        'images': images
    }

def split_description(description, num_sections=6):
    """Split description into multiple sections"""
    sentences = re.split(r'(?<=[.!?])\s+', description)
    
    if len(sentences) < num_sections:
        # If not enough sentences, duplicate some
        while len(sentences) < num_sections:
            sentences.append(sentences[-1])
    
    # Distribute sentences across sections
    sentences_per_section = len(sentences) // num_sections
    sections = []
    
    for i in range(num_sections):
        start = i * sentences_per_section
        end = start + sentences_per_section if i < num_sections - 1 else len(sentences)
        section_text = ' '.join(sentences[start:end])
        sections.append(section_text)
    
    return sections

def generate_project_html(project_info, project_slug):
    """Generate the full project HTML with dynamic animations"""
    
    title = project_info['title']
    subtitle = project_info.get('subtitle', 'Luxury interior design that transforms living spaces')
    metadata = project_info['metadata']
    description = project_info['description']
    images = project_info['images']
    
    # Use the properly labeled images (1-6) from project folders
    labeled_images = []
    for i in range(1, 7):
        img_path = f"../assets/images/projects/{project_slug}/{project_slug}-{i}.jpg"
        labeled_images.append(img_path)
    
    # Use labeled images
    images = labeled_images
    
    # Split description into 6 sections
    if description:
        sections = split_description(description, 6)
    else:
        sections = [
            f"This {title} project showcases exceptional interior design.",
            "Every detail was carefully considered to create a cohesive aesthetic.",
            "The space features custom furnishings and high-end finishes.",
            "Natural light and open layouts enhance the living experience.",
            "Thoughtful material selections create warmth and sophistication.",
            "The result is a timeless design that elevates everyday living."
        ]
    
    # Section headings
    headings = ["The Vision", "Design Approach", "Key Features", "Living Spaces", "Refined Details", "The Result"]
    
    # Generate HTML
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>{title} | JAC Interiors</title>
    <link href="../assets/css/style.css" rel="stylesheet"/>
</head>
<body>
    <nav class="navbar scrolled">
        <div class="container">
            <div class="nav-wrapper">
                <a class="logo" href="../index-variant-2.html">
                    <img alt="JAC Interiors" class="logo-img" src="../assets/images/jac-logo.png"/>
                </a>
                <div class="nav-menu" id="navMenu">
                    <a class="nav-link" href="../index-variant-2.html">HOME</a>
                    <a class="nav-link active" href="../portfolio.html">PORTFOLIO</a>
                    <a class="nav-link" href="../services.html">SERVICES</a>
                    <a class="nav-link" href="../about.html">ABOUT</a>
                    <a class="nav-link" href="../contact.html">CONTACT</a>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>

    <!-- Project Header with Metadata -->
    <section style="padding: 3rem 0; background: #1a1a1a; color: white; margin-top: 5rem;">
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4rem;">
                <div style="flex: 1; max-width: 600px;">
                    <h1 class="scroll-fade-in" style="font-size: 3.5rem; font-weight: 500; margin: 0 0 1rem 0; letter-spacing: -1.5px; line-height: 1.1; color: white;">{title}</h1>
                    <p class="scroll-fade-in delay-1" style="font-size: 16px; color: #ccc; line-height: 1.6; font-weight: 400; margin-top: 0.5rem;">{subtitle}</p>
                </div>
                <div style="display: flex; gap: 3rem; flex-shrink: 0;">
                    <div class="scroll-fade-in delay-1">
                        <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 0.5rem;">Client</div>
                        <div style="font-weight: 400; font-size: 0.95rem; color: white;">{metadata['client']}</div>
                    </div>
                    <div class="scroll-fade-in delay-2">
                        <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 0.5rem;">Location</div>
                        <div style="font-weight: 400; font-size: 0.95rem; color: white;">{metadata['location']}</div>
                    </div>
                    <div class="scroll-fade-in delay-3">
                        <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 0.5rem;">Style</div>
                        <div style="font-weight: 400; font-size: 0.95rem; color: white;">{metadata['style']}</div>
                    </div>
                    <div class="scroll-fade-in delay-3">
                        <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 0.5rem;">Year</div>
                        <div style="font-weight: 400; font-size: 0.95rem; color: white;">{metadata['year']}</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Project Story - Alternating Image/Text Rows -->
    <section style="padding: 4rem 0;">
        <div class="container" style="max-width: 1200px;">
            
            <!-- Row 1: Image Left, Text Right -->
            <div style="display: flex; gap: 3rem; margin-bottom: 3rem; align-items: center;">
                <div class="parallax-image scale-in-image hover-zoom-image" style="flex: 0 0 48%;">
                    <img src="{images[0]}" alt="{title}" style="width: 100%; border-radius: 4px;"/>
                </div>
                <div style="flex: 1; padding-left: 2rem;">
                    <h3 class="slide-in-right" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -0.5px;">{headings[0]}</h3>
                    <p class="slide-in-right delay-1" style="font-size: 16px; line-height: 24px; color: #444; margin-bottom: 10px;">{sections[0]}</p>
                </div>
            </div>

            <!-- Row 2: Text Left, Image Right -->
            <div style="display: flex; gap: 3rem; margin-bottom: 3rem; align-items: center;">
                <div style="flex: 1; padding-right: 2rem;">
                    <h3 class="slide-in-left" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -0.5px;">{headings[1]}</h3>
                    <p class="slide-in-left delay-1" style="font-size: 16px; line-height: 24px; color: #444; margin-bottom: 10px;">{sections[1]}</p>
                </div>
                <div class="parallax-image scale-in-image hover-zoom-image" style="flex: 0 0 48%;">
                    <img src="{images[1]}" alt="{title}" style="width: 100%; border-radius: 4px;"/>
                </div>
            </div>

            <!-- Row 3: Image Left, Text Right -->
            <div style="display: flex; gap: 3rem; margin-bottom: 3rem; align-items: center;">
                <div class="parallax-image scale-in-image hover-zoom-image" style="flex: 0 0 48%;">
                    <img src="{images[2]}" alt="{title}" style="width: 100%; border-radius: 4px;"/>
                </div>
                <div style="flex: 1; padding-left: 2rem;">
                    <h3 class="slide-in-right" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -0.5px;">{headings[2]}</h3>
                    <p class="slide-in-right delay-1" style="font-size: 16px; line-height: 24px; color: #444; margin-bottom: 10px;">{sections[2]}</p>
                </div>
            </div>

            <!-- Row 4: Text Left, Image Right -->
            <div style="display: flex; gap: 3rem; margin-bottom: 3rem; align-items: center;">
                <div style="flex: 1; padding-right: 2rem;">
                    <h3 class="slide-in-left" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -0.5px;">{headings[3]}</h3>
                    <p class="slide-in-left delay-1" style="font-size: 16px; line-height: 24px; color: #444; margin-bottom: 10px;">{sections[3]}</p>
                </div>
                <div class="parallax-image scale-in-image hover-zoom-image" style="flex: 0 0 48%;">
                    <img src="{images[3]}" alt="{title}" style="width: 100%; border-radius: 4px;"/>
                </div>
            </div>

            <!-- Row 5: Image Left, Text Right -->
            <div style="display: flex; gap: 3rem; margin-bottom: 3rem; align-items: center;">
                <div class="parallax-image scale-in-image hover-zoom-image" style="flex: 0 0 48%;">
                    <img src="{images[4]}" alt="{title}" style="width: 100%; border-radius: 4px;"/>
                </div>
                <div style="flex: 1; padding-left: 2rem;">
                    <h3 class="slide-in-right" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -0.5px;">{headings[4]}</h3>
                    <p class="slide-in-right delay-1" style="font-size: 16px; line-height: 24px; color: #444; margin-bottom: 10px;">{sections[4]}</p>
                </div>
            </div>

            <!-- Row 6: Text Left, Image Right -->
            <div style="display: flex; gap: 3rem; align-items: center;">
                <div style="flex: 1; padding-right: 2rem;">
                    <h3 class="slide-in-left" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -0.5px;">{headings[5]}</h3>
                    <p class="slide-in-left delay-1" style="font-size: 16px; line-height: 24px; color: #444; margin-bottom: 10px;">{sections[5]}</p>
                </div>
                <div class="parallax-image scale-in-image hover-zoom-image" style="flex: 0 0 48%;">
                    <img src="{images[5]}" alt="{title}" style="width: 100%; border-radius: 4px;"/>
                </div>
            </div>

        </div>
    </section>

    <!-- CTA Section -->
    <section style="padding: 6rem 0; background: #fafafa; text-align: center;">
        <div class="container" style="max-width: 700px;">
            <h2 class="scroll-fade-in" style="font-size: 2.5rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -1px;">Ready to Transform Your Space?</h2>
            <p class="scroll-fade-in delay-1" style="font-size: 1.1rem; color: #666; margin-bottom: 2rem; line-height: 1.6;">Let's create a design that reflects your unique style and elevates your everyday living.</p>
            <a class="btn btn-primary scroll-fade-in delay-2" href="../contact.html" style="display: inline-block; padding: 1rem 2.5rem; background: var(--color-primary); color: white; text-decoration: none; border-radius: 4px; font-weight: 500; transition: all 0.3s;">Start Your Project</a>
        </div>
    </section>

    <!-- Footer -->
    <footer style="background: #1a1a1a; color: white; padding: 3rem 0 1.5rem;">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 5rem; margin-bottom: 3rem;">
                <div>
                    <img alt="JAC Interiors" src="../assets/images/jac-logo.png" style="height: 40px; margin-bottom: 1rem; filter: brightness(0) invert(1);"/>
                    <p style="color: #999; line-height: 1.6;">Creating luxury spaces that elevate everyday living.</p>
                </div>
                <div>
                    <h4 style="margin-bottom: 1rem; font-weight: 500;">Quick Links</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.5rem;"><a href="../portfolio.html" style="color: #999; text-decoration: none;">Portfolio</a></li>
                        <li style="margin-bottom: 0.5rem;"><a href="../about.html" style="color: #999; text-decoration: none;">About</a></li>
                        <li style="margin-bottom: 0.5rem;"><a href="../contact.html" style="color: #999; text-decoration: none;">Contact</a></li>
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
                <p>&copy; 2024 JAC Interiors. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="../assets/js/main.js"></script>
</body>
</html>'''
    
    return html

def main():
    projects_dir = Path('projects')
    
    # Get all project HTML files (excluding SAMPLE and NEW)
    project_files = [f for f in projects_dir.glob('*.html') 
                     if 'SAMPLE' not in f.name and 'NEW' not in f.name and ' 2' not in f.name]
    
    print(f"Found {len(project_files)} project pages to update\n")
    
    for project_file in sorted(project_files):
        print(f"Processing: {project_file.name}...")
        
        try:
            # Read existing project page
            with open(project_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Extract project info
            project_info = extract_project_info(html_content)
            
            # Generate project slug from filename
            project_slug = project_file.stem
            
            # Generate new HTML with dynamic design
            new_html = generate_project_html(project_info, project_slug)
            
            # Write updated page
            with open(project_file, 'w', encoding='utf-8') as f:
                f.write(new_html)
            
            print(f"  ✓ Updated: {project_file.name}")
            print(f"    Title: {project_info['title']}")
            print(f"    Images: {len(project_info['images'])} found\n")
            
        except Exception as e:
            print(f"  ✗ Error processing {project_file.name}: {str(e)}\n")
    
    print("All project pages updated successfully!")

if __name__ == '__main__':
    main()

