#!/usr/bin/env python3
from pathlib import Path
import re

CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')
IMG_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/assets/images/cities')

# All city pages
cities = sorted([f.stem for f in CITY_DIR.glob('*.html')])

for city in cities:
    city_file = CITY_DIR / f"{city}.html"
    
    # Find images for this city
    city_clean = city.replace('-', '').lower()
    images = []
    
    for img in IMG_DIR.glob('*.jpg'):
        img_name_lower = img.name.lower()
        # Match if city name is in image filename
        if city_clean in img_name_lower.replace('-', '') or city in img_name_lower:
            images.append(img.name)
    
    if not images:
        continue
    
    images = sorted(images)
    
    # Read city page
    with open(city_file, 'r') as f:
        html = f.read()
    
    # Check if already has image gallery
    if '../assets/images/cities/' in html and images[0] in html:
        continue  # Already has images
    
    # Generate gallery HTML
    gallery = '\n    <section class="section">\n        <div class="container">\n            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">'
    for img in images:
        gallery += f'\n                <img src="../assets/images/cities/{img}" alt="Interior Design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
    gallery += '\n            </div>\n        </div>\n    </section>'
    
    # Insert before CTA section
    pattern = r'(<section class="section cta-section">)'
    html = re.sub(pattern, f'{gallery}\n\n\\1', html, count=1)
    
    # Write back
    with open(city_file, 'w') as f:
        f.write(html)
    
    print(f"✅ {city:25} {len(images)} images added")

print("\nDone adding images to all city pages")

