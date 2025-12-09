#!/usr/bin/env python3
from pathlib import Path
import re
import shutil
import random

PROJECT_IMG_DIR = Path('assets/images/projects')
CITY_IMG_DIR = Path('assets/images/cities')
CITY_PAGE_DIR = Path('cities')

# Patterns to find images for styles
PATTERNS = {
    'calabasas': r'.*CALABASAS.*',
    'beverly': r'.*Beverly-Hills.*',
    'mulholland': r'.*Mulholland.*',
    'sunnyside': r'.*Sunnyside.*',
    'coastal': r'.*(?:Coastal|Beach|Venice).*',
    'modern': r'.*(?:Modern|Culver|Contemporary).*',
    'palm': r'.*(?:Palm|Desert).*'
}

# City -> Style Mapping
CITY_STYLE = {
    # Valley -> Calabasas/Mulholland
    'encino': 'calabasas',
    'sherman-oaks': 'mulholland',
    'tarzana': 'calabasas',
    'studio-city': 'mulholland',
    'north-hollywood': 'mulholland',
    'valley-village': 'mulholland',
    'van-nuys': 'calabasas',
    'burbank': 'mulholland',
    
    # Luxury -> Beverly Hills
    'bel-air': 'beverly',
    'hollywood': 'beverly',
    'west-hollywood': 'beverly',
    'topanga': 'beverly',
    'universal-city': 'beverly',
    
    # Coastal
    'venice': 'coastal',
    'santa-monica': 'coastal',
    'hermosa-beach': 'coastal',
    'redondo-beach': 'coastal',
    'marina-del-rey': 'coastal',
    'playa-del-rey': 'coastal',
    'pacific-palisades': 'coastal',
    'playa-vista': 'coastal',
    'el-segundo': 'coastal',
    
    # Florida -> Sunnyside/Palm (Bright/Eclectic)
    'aventura': 'sunnyside',
    'bal-harbour': 'sunnyside',
    'boca-raton': 'palm',
    'brickell': 'sunnyside',
    'coconut-grove': 'sunnyside',
    'coral-gables': 'palm',
    'deerfield-beach': 'palm',
    'doral': 'palm',
    'fort-lauderdale': 'sunnyside',
    'hialeah': 'palm',
    'key-biscayne': 'sunnyside',
    'plantation': 'palm',
    'pompano-beach': 'sunnyside',
    'wynwood': 'sunnyside'
}

# Cities with verified images (don't overwrite completely, just append if needed)
VERIFIED = ['brentwood', 'calabasas', 'culver-city', 'manhattan-beach', 'pasadena', 'palos-verdes', 'studio-city', 'west-hollywood']

# Get all images
all_images = [f.name for f in PROJECT_IMG_DIR.glob('*.jpg')]

def get_images_for_style(style, count=6):
    pattern = PATTERNS.get(style, r'.*')
    matches = [img for img in all_images if re.match(pattern, img, re.I)]
    
    # Prefer high res
    high_res = [m for m in matches if '2000x' in m]
    candidates = high_res if high_res else matches
    
    if not candidates:
        return []
        
    return random.sample(candidates, min(count, len(candidates)))

print("Populating cities with pattern-matched images...")
print("="*60)

for city_file in sorted(CITY_PAGE_DIR.glob('*.html')):
    city_slug = city_file.stem
    
    # Check if we need to fill gaps for verified cities
    if city_slug in VERIFIED:
        # Check current count
        with open(city_file, 'r') as f:
            html = f.read()
        current_count = html.count('<img src="../assets/images/cities/')
        
        if current_count < 6:
            needed = 6 - current_count
            print(f"➕ {city_slug}: Has {current_count}, adding {needed} more")
            
            # Determine style
            style = CITY_STYLE.get(city_slug, 'beverly') # Default luxury
            new_images = get_images_for_style(style, needed)
            
            # Copy and Append
            gallery_html = ""
            for i, img in enumerate(new_images, 1):
                dst_name = f"{city_slug}-extra-{i}.jpg"
                shutil.copy2(PROJECT_IMG_DIR / img, CITY_IMG_DIR / dst_name)
                
                gallery_html += f'\n                <img src="../assets/images/cities/{dst_name}" alt="{city_slug} interior design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
            
            # Inject into existing gallery div
            html = html.replace('</div>\n        </div>\n    </section>', f'{gallery_html}\n            </div>\n        </div>\n    </section>')
            
            with open(city_file, 'w') as f:
                f.write(html)
        else:
            print(f"⏩ {city_slug}: Has {current_count} images (good)")
        continue

    # Full population for others
    style = CITY_STYLE.get(city_slug, 'beverly')
    images = get_images_for_style(style, 6)
    
    if not images:
        print(f"⚠️ {city_slug}: No images found for style {style}")
        continue
        
    # Copy images
    city_images = []
    for i, img in enumerate(images, 1):
        dst_name = f"{city_slug}-gallery-{i}.jpg"
        shutil.copy2(PROJECT_IMG_DIR / img, CITY_IMG_DIR / dst_name)
        city_images.append(dst_name)
        
    # Update HTML
    with open(city_file, 'r') as f:
        html = f.read()
        
    # Remove old gallery
    html = re.sub(r'\n    <section class="section">\n        <div class="container">\n            <div style="display: grid.*?</section>', '', html, flags=re.DOTALL)
    
    # Create new gallery
    gallery = '\n    <section class="section">\n        <div class="container">\n            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">'
    for img in city_images:
        gallery += f'\n                <img src="../assets/images/cities/{img}" alt="{city_slug.replace("-", " ").title()} Interior Design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
    gallery += '\n            </div>\n        </div>\n    </section>'
    
    html = re.sub(r'(<section class="section cta-section">)', f'{gallery}\n\n\\1', html, count=1)
    
    with open(city_file, 'w') as f:
        f.write(html)
        
    print(f"✅ {city_slug}: Added 6 images ({style} style)")


