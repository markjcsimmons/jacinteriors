#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import re
import shutil

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
BACKUP_IMG_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/cdn/shop/files')
CITY_DIR = Path('cities')
CITY_IMG_DIR = Path('assets/images/cities')

CITIES_TO_UPDATE = {
    'bel-air': 'bel-air-interior-design-services',
    'burbank': 'burbank-interior-design-services',
    'brickell': 'brickell-downtown-miami-interior-design-services',
    'coral-gables': 'coral-gables-interior-design-services',
    'deerfield-beach': 'deerfield-beach',
    'doral': 'doral-interior-design-services-nbsp-nbsp',
    'el-segundo': 'el-segundo-interior-design-services-nbsp-nbsp',
    'hermosa-beach': 'hermosa-beach-interior-design-services',
    'hialeah': 'hialeah-interior-design-services',
    'key-biscayne': 'key-biscayne-interior-design-services',
    'marina-del-rey': 'marina-del-rey-interior-design-services',
    'north-hollywood': 'north-hollywood-interior-design-services',
    'pacific-palisades': 'pacific-palisades-interior-design-services',
    'plantation': 'plantation-interior-design-services',
    'playa-del-rey': 'playa-del-rey-interior-design-services',
    'playa-vista': 'playa-vista-interior-design-services',
    'pompano-beach': 'pompano-beach-interior',
    'redondo-beach': 'redondo-beach-interior-design-services',
    'sherman-oaks': 'sherman-oaks-interior-design-services',
    'tarzana': 'tarzana-interior-design-services',
    'topanga': 'topanga-interior-design-services',
    'universal-city': 'universal-city-interior-design-services',
    'valley-village': 'valley-village-interior-design-services',
    'van-nuys': 'van-nuys-interior-design-services',
    'venice': 'venice-interior-design-services',
    'wynwood': 'wynwood-edgewater-interior-design-services',
}

for city, backup_slug in sorted(CITIES_TO_UPDATE.items()):
    backup_file = BACKUP_DIR / f"{backup_slug}.html"
    city_file = CITY_DIR / f"{city}.html"
    
    if not backup_file.exists():
        continue
        
    with open(backup_file, 'r', errors='ignore') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    images = []
    
    # Find images in main content
    main = soup.find('div', class_='one-whole column')
    if main:
        for img in main.find_all('img'):
            src = img.get('src', '')
            alt = img.get('alt', '')
            if 'cdn.shopify.com' in src or '../cdn/' in src:
                filename = src.split('/')[-1].split('?')[0]
                images.append((filename, alt))
    
    if not images:
        continue
        
    # Copy images
    valid_images = []
    for filename, alt in images:
        # Try to find source file
        src_path = BACKUP_IMG_DIR / filename
        
        # If not in files, might be in assets or elsewhere in backup structure, 
        # but let's assume files dir for now or try to match by name
        if not src_path.exists():
             # Try matching loosely if exact file not found
             candidates = list(BACKUP_IMG_DIR.glob(f"*{filename}*"))
             if candidates:
                 src_path = candidates[0]
        
        if src_path.exists():
            dst_path = CITY_IMG_DIR / filename
            if not dst_path.exists():
                shutil.copy2(src_path, dst_path)
            valid_images.append((filename, alt))
    
    if not valid_images:
        print(f"⚠️ {city}: Found images in HTML but missing source files")
        continue

    # Update HTML
    with open(city_file, 'r') as f:
        city_html = f.read()
    
    # Remove existing gallery if present
    city_html = re.sub(
        r'\n    <section class="section">\n        <div class="container">\n            <div style="display: grid.*?</section>',
        '',
        city_html,
        flags=re.DOTALL
    )

    # Generate gallery
    gallery = '\n    <section class="section">\n        <div class="container">\n            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">'
    for filename, alt in valid_images:
        gallery += f'\n                <img src="../assets/images/cities/{filename}" alt="{alt}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
    gallery += '\n            </div>\n        </div>\n    </section>'
    
    # Insert before CTA
    city_html = re.sub(
        r'(<section class="section cta-section">)',
        f'{gallery}\n\n\\1',
        city_html,
        count=1
    )
    
    with open(city_file, 'w') as f:
        f.write(city_html)
    
    print(f"✅ {city:25} Added {len(valid_images)} images")

print("\nDone updating cities with hidden images")

