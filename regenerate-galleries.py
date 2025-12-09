#!/usr/bin/env python3
from pathlib import Path
import re
import glob

CITY_DIR = Path('cities')
IMG_DIR = Path('assets/images/cities')

for city_file in sorted(CITY_DIR.glob('*.html')):
    city_slug = city_file.stem
    
    # Find all images for this city on disk
    all_images = sorted([f.name for f in IMG_DIR.glob(f"{city_slug}-*.jpg")])
    
    if not all_images:
        print(f"⚠️ {city_slug}: No images found on disk")
        continue
        
    # Filter/Prioritize
    # 1. Standard (city-1.jpg) - Verified
    # 2. Extra (city-extra-1.jpg) - Best Fit
    # 3. Gallery (city-gallery-1.jpg) - Auto-pop
    
    verified = [img for img in all_images if re.match(rf"^{city_slug}-\d+\.jpg$", img)]
    extras = [img for img in all_images if 'extra' in img]
    galleries = [img for img in all_images if 'gallery' in img]
    
    final_list = []
    final_list.extend(verified)
    
    if len(final_list) < 6:
        final_list.extend(extras)
    
    if len(final_list) < 6:
        final_list.extend(galleries)
        
    # Cap at 6 (unless verified has more)
    if len(verified) > 6:
        final_list = verified
    else:
        final_list = final_list[:6]
        
    # Generate HTML
    gallery_content = ""
    for img in final_list:
        gallery_content += f'\n                <img src="../assets/images/cities/{img}" alt="{city_slug} interior design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
        
    new_gallery_section = f'''<!-- Gallery Section -->
    <section class="section">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">{gallery_content}
            </div>
        </div>
    </section>'''
    
    # Read HTML
    with open(city_file, 'r') as f:
        html = f.read()
        
    # Replace existing gallery section
    # Regex to find the whole section including the comment
    pattern = r'<!-- Gallery Section -->\s*<section class="section">.*?</section>'
    
    if re.search(pattern, html, re.DOTALL):
        final_html = re.sub(pattern, new_gallery_section, html, flags=re.DOTALL)
    else:
        # If not found (shouldn't happen), append before CTA
        final_html = re.sub(r'(<section class="section cta-section">)', f'{new_gallery_section}\n\n\\1', html)
    
    with open(city_file, 'w') as f:
        f.write(final_html)
        
    print(f"✅ Regenerated {city_slug}: {len(final_list)} images")


