#!/usr/bin/env python3
from pathlib import Path
import re

CITY_DIR = Path('cities')

for city_file in sorted(CITY_DIR.glob('*.html')):
    city_slug = city_file.stem
    
    with open(city_file, 'r') as f:
        html = f.read()
    
    # Extract all image sources in the gallery
    # Find the gallery section
    gallery_match = re.search(r'(<!-- Gallery Section -->.*?<section class="section">.*?<div class="container">.*?<div style="display: grid.*?</div>\s*</div>\s*</section>)', html, re.DOTALL)
    
    if not gallery_match:
        continue
        
    gallery_html = gallery_match.group(1)
    
    # Extract image filenames
    img_matches = re.findall(r'<img src="../assets/images/cities/([^"]+)"', gallery_html)
    
    if not img_matches:
        continue
    
    # Deduplicate logic
    # Prefer: brentwood-1.jpg (verified) > brentwood-extra-1.jpg (filler) > brentwood-gallery-1.jpg (auto)
    
    unique_images = []
    seen = set()
    
    # Sort to prioritize verified images (shortest names often verified: city-1.jpg vs city-gallery-1.jpg)
    # Actually, we want to keep specific sets.
    
    # Categorize
    verified = [img for img in img_matches if re.match(rf"^{city_slug}-\d+\.jpg$", img)]
    extras = [img for img in img_matches if 'extra' in img]
    galleries = [img for img in img_matches if 'gallery' in img]
    
    # Construct final list (max 6)
    final_list = verified
    
    if len(final_list) < 6:
        final_list.extend(extras)
    
    if len(final_list) < 6:
        final_list.extend(galleries)
        
    # Trim to 6 (unless verified has more, like Culver City with 12)
    if len(verified) > 6:
        final_list = verified # Keep all verified
    else:
        final_list = final_list[:6]
    
    # Rebuild Gallery HTML
    new_gallery_content = ""
    for img in final_list:
        new_gallery_content += f'\n                <img src="../assets/images/cities/{img}" alt="{city_slug} interior design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
        
    new_gallery_section = f'''<!-- Gallery Section -->
    <section class="section">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">{new_gallery_content}
            </div>
        </div>
    </section>'''
    
    # Replace in HTML
    final_html = html.replace(gallery_html, new_gallery_section)
    
    with open(city_file, 'w') as f:
        f.write(final_html)
        
    print(f"✅ Fixed {city_slug}: {len(img_matches)} -> {len(final_list)} images")


