#!/usr/bin/env python3
from pathlib import Path
import re

CITY_DIR = Path('cities')

for city_file in sorted(CITY_DIR.glob('*.html')):
    with open(city_file, 'r') as f:
        html = f.read()
    
    # 1. Remove ALL img tags from the content sections to start fresh
    # But keep the ones in the final gallery section if it exists
    
    # Split content from footer/CTA
    parts = re.split(r'(<section class="section cta-section">)', html)
    if len(parts) < 2:
        continue
        
    content_area = parts[0]
    cta_footer = "".join(parts[1:])
    
    # Remove img tags from content area
    cleaned_content = re.sub(r'\s*<img src="../assets/images/cities/.*?>', '', content_area)
    
    # Now, find the Gallery Section (if I added it) or create it
    # My previous script added: <!-- Gallery Section --> ...
    
    gallery_match = re.search(r'<!-- Gallery Section -->.*?<section class="section">.*?<div class="container">.*?<div style="display: grid.*?</div>\s*</div>\s*</section>', cleaned_content, re.DOTALL)
    
    gallery_html = ""
    if gallery_match:
        gallery_html = gallery_match.group(0)
        # Remove the gallery from the content area (so we can place it correctly at the end)
        cleaned_content = cleaned_content.replace(gallery_html, '')
    
    # If no specific gallery section found, but we have images in the folder, let's regenerate it
    # matching the current state
    if not gallery_html:
        # Check if we have images for this city
        city_slug = city_file.stem
        # Get list of images
        import glob
        images = sorted(glob.glob(f"assets/images/cities/{city_slug}-*.jpg"))
        if images:
            img_tags = ""
            for img_path in images:
                filename = Path(img_path).name
                img_tags += f'\n                <img src="../assets/images/cities/{filename}" alt="{city_slug} interior design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
            
            gallery_html = f'''
<!-- Gallery Section -->
    <section class="section">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">{img_tags}
            </div>
        </div>
    </section>'''

    # Reassemble: Content + Gallery + CTA/Footer
    final_html = cleaned_content.strip() + "\n\n" + gallery_html + "\n\n" + cta_footer
    
    with open(city_file, 'w') as f:
        f.write(final_html)
        
    print(f"✅ Cleaned {city_file.name}")


