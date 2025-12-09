#!/usr/bin/env python3
from pathlib import Path
import shutil
import re
import random

# Source images from projects
PROJECT_IMG_DIR = Path('assets/images/projects')
CITY_IMG_DIR = Path('assets/images/cities')
CITY_PAGE_DIR = Path('cities')

# Get all available project images
all_project_images = list(PROJECT_IMG_DIR.glob('**/*.jpg'))

# Define style groups
STYLES = {
    'coastal': ['venice', 'santa-monica', 'manhattan-beach', 'hermosa-beach', 'redondo-beach', 'playa-del-rey', 'marina-del-rey', 'pacific-palisades', 'malibu'],
    'valley': ['encino', 'sherman-oaks', 'tarzana', 'studio-city', 'north-hollywood', 'valley-village', 'van-nuys', 'burbank', 'toluca-lake', 'woodland-hills'],
    'luxury': ['beverly-hills', 'bel-air', 'hollywood', 'west-hollywood', 'calabasas', 'hidden-hills', 'brentwood', 'westwood'],
    'modern': ['culver-city', 'playa-vista', 'el-segundo', 'downtown-la', 'silverlake', 'los-feliz'],
    'florida': ['miami', 'fort-lauderdale', 'boca-raton', 'aventura', 'brickell', 'coconut-grove', 'coral-gables', 'deerfield-beach', 'doral', 'hialeah', 'key-biscayne', 'plantation', 'pompano-beach', 'wynwood']
}

# Map cities to specific project folders (best fit)
CITY_PROJECT_MAP = {
    # Coastal
    'venice': 'venice-beach-house',
    'santa-monica': 'santa-monica-modern-spanish',
    'hermosa-beach': 'venice-boho-house',
    'redondo-beach': 'venice-boho-house',
    'marina-del-rey': 'venice-beach-house',
    'playa-del-rey': 'venice-beach-house',
    'pacific-palisades': 'santa-monica-modern-spanish',
    'manhattan-beach': 'venice-beach-house',
    
    # Valley
    'encino': 'calabasas-remodel',
    'sherman-oaks': 'mulholland',
    'tarzana': 'calabasas-remodel',
    'studio-city': 'mulholland',
    'north-hollywood': 'mulholland',
    'valley-village': 'mulholland',
    'van-nuys': 'calabasas-remodel',
    'burbank': 'mulholland',
    'calabasas': 'calabasas-remodel',
    
    # Luxury
    'bel-air': 'beverly-hills-alpine',
    'beverly-hills': 'beverly-hills-alpine',
    'hollywood': 'beverly-hills-alpine',
    'west-hollywood': 'beverly-hills-alpine',
    'brentwood': 'beverly-hills-alpine',
    
    # Modern
    'culver-city': 'culver-city-condo',
    'playa-vista': 'culver-city-condo',
    'el-segundo': 'culver-city-condo',
    
    # Florida (Use lighter/brighter projects)
    'aventura': 'eclectic-sunnyside',
    'bal-harbour': 'eclectic-sunnyside',
    'boca-raton': 'palm-desert-oasis',
    'brickell': 'eclectic-sunnyside',
    'coconut-grove': 'eclectic-sunnyside',
    'coral-gables': 'palm-desert-oasis',
    'deerfield-beach': 'palm-desert-oasis',
    'doral': 'palm-desert-oasis',
    'fort-lauderdale': 'eclectic-sunnyside',
    'hialeah': 'palm-desert-oasis',
    'key-biscayne': 'eclectic-sunnyside',
    'plantation': 'palm-desert-oasis',
    'pompano-beach': 'eclectic-sunnyside',
    'wynwood': 'eclectic-sunnyside'
}

# Cities that ALREADY have good images (don't overwrite)
KEEP_EXISTING = ['brentwood', 'calabasas', 'culver-city', 'manhattan-beach', 'pasadena', 'palos-verdes', 'studio-city', 'west-hollywood']

print("Populating missing city galleries...")
print("="*60)

for city_file in sorted(CITY_PAGE_DIR.glob('*.html')):
    city_slug = city_file.stem
    
    # Skip if already verified good
    if city_slug in KEEP_EXISTING:
        print(f"⏩ {city_slug}: Keeping existing images")
        continue
    
    # Determine source project
    project_folder = CITY_PROJECT_MAP.get(city_slug)
    if not project_folder:
        # Fallback based on style
        for style, cities in STYLES.items():
            if city_slug in cities:
                if style == 'coastal': project_folder = 'venice-beach-house'
                elif style == 'valley': project_folder = 'calabasas-remodel'
                elif style == 'luxury': project_folder = 'beverly-hills-alpine'
                elif style == 'modern': project_folder = 'culver-city-condo'
                elif style == 'florida': project_folder = 'palm-desert-oasis'
                break
    
    if not project_folder:
        project_folder = 'beverly-hills-alpine' # Ultimate fallback
        
    # Get images from that project
    src_images = list((PROJECT_IMG_DIR / project_folder).glob('*.jpg'))
    if not src_images:
        # Try finding any images if specific folder fails
        src_images = all_project_images[:6]
    
    # Select 6 random images
    selected_images = random.sample(src_images, min(6, len(src_images)))
    
    # Copy and rename for city
    city_images = []
    for i, src_img in enumerate(selected_images, 1):
        dst_filename = f"{city_slug}-{i}.jpg"
        dst_path = CITY_IMG_DIR / dst_filename
        shutil.copy2(src_img, dst_path)
        city_images.append(dst_filename)
    
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
    
    # Insert
    html = re.sub(r'(<section class="section cta-section">)', f'{gallery}\n\n\\1', html, count=1)
    
    with open(city_file, 'w') as f:
        f.write(html)
        
    print(f"✅ {city_slug}: Added {len(city_images)} images (from {project_folder})")


