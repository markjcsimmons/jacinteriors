#!/usr/bin/env python3
from pathlib import Path
import re

CITY_DIR = Path('cities')

for city_file in sorted(CITY_DIR.glob('*.html')):
    city_slug = city_file.stem
    
    with open(city_file, 'r') as f:
        html = f.read()
    
    # Extract gallery section
    gallery_match = re.search(r'(<!-- Gallery Section -->.*?<section class="section">.*?<div class="container">.*?<div style="display: grid.*?</div>\s*</div>\s*</section>)', html, re.DOTALL)
    
    if not gallery_match:
        continue
        
    gallery_html = gallery_match.group(1)
    
    # Extract image filenames
    img_matches = re.findall(r'<img src="../assets/images/cities/([^"]+)"', gallery_html)
    
    if not img_matches:
        continue
    
    # Strategy: Keep verified/original images, remove redundant auto-generated duplicates
    
    unique_images = []
    seen_content = set() # To track logical duplicates if possible, but here we track filenames
    
    # Prioritize:
    # 1. Non-standard names (e.g. 20221025_JAC_CALABASAS...) - These are verified deep-scan images
    # 2. Standard names (city-1.jpg)
    # 3. Extra names (city-extra-1.jpg)
    # 4. Gallery names (city-gallery-1.jpg) - Least preferred
    
    non_standard = [img for img in img_matches if not re.match(rf"^{city_slug}-(?:gallery-|extra-)?\d+\.jpg$", img)]
    standard = [img for img in img_matches if re.match(rf"^{city_slug}-\d+\.jpg$", img)]
    extras = [img for img in img_matches if 'extra' in img]
    galleries = [img for img in img_matches if 'gallery' in img]
    
    final_list = []
    final_list.extend(non_standard)
    final_list.extend(standard)
    final_list.extend(extras)
    
    # Fill up to 6 with galleries if needed
    if len(final_list) < 6:
        needed = 6 - len(final_list)
        final_list.extend(galleries[:needed])
        
    # Cap at 12 (some cities like Culver City legitimately have 12 verified images)
    # But if it's mixed with 'gallery' spam, trim it back
    if len(non_standard) > 0:
        # If we have verified non-standard images, keep ALL of them, ignore the rest
        final_list = non_standard
    elif len(standard) >= 6:
        # If we have standard verified images, keep them
        final_list = standard
    else:
        # Otherwise, limit to 6
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


