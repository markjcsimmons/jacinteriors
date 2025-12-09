#!/usr/bin/env python3
from pathlib import Path
import re
import glob

CITY_DIR = Path('cities')
IMG_DIR = Path('assets/images/cities')

# Special handling for cities with non-standard image names
SPECIAL_CITIES = {
    'culver-city': 'JAC-culver-city',
    'pasadena': 'Pasadena',
    'manhattan-beach': 'Manhattan-Beach',
    'palos-verdes': 'Palos-Verdes',
    'calabasas': 'Calabasas'
}

for city_file in sorted(CITY_DIR.glob('*.html')):
    city_slug = city_file.stem
    
    # Standard images
    all_images = sorted([f.name for f in IMG_DIR.glob(f"{city_slug}-*.jpg")])
    
    # Add special images
    if city_slug in SPECIAL_CITIES:
        prefix = SPECIAL_CITIES[city_slug]
        # Case insensitive globbing is hard, so iterate
        for f in IMG_DIR.glob('*.jpg'):
            if prefix.lower() in f.name.lower() and f.name not in all_images:
                all_images.append(f.name)
    
    # Also check for "2022...CALABASAS" type images for Calabasas
    if city_slug == 'calabasas':
        for f in IMG_DIR.glob('*CALABASAS*.jpg'):
            if f.name not in all_images:
                all_images.append(f.name)

    if not all_images:
        print(f"⚠️ {city_slug}: No images found")
        continue
        
    # Prioritize
    verified = [img for img in all_images if re.match(rf"^{city_slug}-\d+\.jpg$", img)]
    
    # Add deep-scan verified images (often long/weird names)
    deep_scan = [img for img in all_images if img not in verified and ('2000x' in img or 'JAC' in img or '202' in img)]
    
    extras = [img for img in all_images if 'extra' in img]
    galleries = [img for img in all_images if 'gallery' in img]
    
    final_list = []
    final_list.extend(verified)
    final_list.extend(deep_scan)
    
    # Fill if needed
    if len(final_list) < 6:
        final_list.extend(extras)
    
    if len(final_list) < 6:
        final_list.extend(galleries)
    
    # Ensure unique
    final_list = list(dict.fromkeys(final_list))
    
    # Cap at 12 for verified heavy cities, 6 for others
    limit = 12 if (len(verified) + len(deep_scan)) > 6 else 6
    final_list = final_list[:limit]
        
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
    
    with open(city_file, 'r') as f:
        html = f.read()
        
    pattern = r'<!-- Gallery Section -->\s*<section class="section">.*?</section>'
    if re.search(pattern, html, re.DOTALL):
        final_html = re.sub(pattern, new_gallery_section, html, flags=re.DOTALL)
    else:
        final_html = re.sub(r'(<section class="section cta-section">)', f'{new_gallery_section}\n\n\\1', html)
    
    with open(city_file, 'w') as f:
        f.write(final_html)
        
    print(f"✅ Regenerated {city_slug}: {len(final_list)} images")


